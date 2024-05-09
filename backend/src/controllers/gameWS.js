const historyModel = require('../models/histories.js')

// Global
const curentGames = {}
async function applyUserBet(user, msg) {
  // handle user bet
  if (msg.Payload.betAmount < 0 || msg.Payload.betAmount > user.balance) {
    return false
  }

  // Update user balance
  user.balance -= msg.Payload.betAmount
  await user.save()
  return true
}

async function saveUserHistory(user, purProfit, gameID) {
  const history = await historyModel.create({profit: purProfit, gameDate: Date.now()})
  history.setUser(user)
  history.setGame(gameID)
}

// Mines game
const gridSize = 5;
const totalCells = gridSize * gridSize;

function getRandomInt (max) {
  return Math.floor(Math.random() * max)
}

function calculateMultiplier(bombCount, discoveredCells) {
  // Calculate the base for the exponential function
  const base = 15 ** (1 / (totalCells - bombCount));

  // Calculate the multiplier based on the number of discovered cells
  const multiplier = base ** discoveredCells;

  return Math.round(multiplier * 100) / 100;
}

module.exports = {
  async playSlotMachine(msg, ws, user) {
    // Check msg resquest
    if (!msg.Payload.nbIcons || !msg.Payload.indexesColumns || !msg.Payload.betAmount) {
      ws.send(JSON.stringify({error: 'nbIcons, indexesColumns nor betAmout not specified'}))
      return
    }
    
    // Apply user bet
    if (! await applyUserBet(user, msg)) {
      ws.send(JSON.stringify({error: 'bet is not defined, below 0 or over the user balance'}))
      return
    }

    // Roll columns
    const deltas = Array(3)
    const finalIndexes = Array(3)
    for (let i = 0; i < 3; i++) {
      const index = msg.Payload.indexesColumns[i]
      deltas[i] = Math.round(Math.random() * msg.Payload.nbIcons) + msg.Payload.nbIcons * 2
      finalIndexes[i] = (index + deltas[i]) % msg.Payload.nbIcons
    }

    // Check game state
    const hasWin = finalIndexes[0] === finalIndexes[1] || finalIndexes[1] === finalIndexes[2] || finalIndexes[0] === finalIndexes[2]
    let gains = 0
    let state = 'loose'
    if (hasWin) {
      let multipler = 2
      state = 'win'

      if (finalIndexes[0] === finalIndexes[1] && finalIndexes[1] === finalIndexes[2]) {
        multipler = 10
        state = 'bigWIN'
      }
      
      gains = msg.Payload.betAmount * multipler

      // Update user balance
      user.balance += gains
      await user.save()
      await saveUserHistory(user, gains - msg.Payload.betAmount, 1)
    } else {
      await saveUserHistory(user, -msg.Payload.betAmount, 1)
    }
    
    // Send back data
    ws.send(JSON.stringify({finalIndexes: finalIndexes, deltas: deltas, gains: gains, currentBalance: user.balance, state: state}))
  }, 
  async initMineGame(msg, ws, user) {
    // Check msg request
    if (!msg.Payload.bombCount || !msg.Payload.betAmount) {
      ws.send(JSON.stringify({error: 'bombCount nor betAmout not specified'}))
      return
    }

    // Delete player data if it was not done before
    delete curentGames[`${user.id}-MineGame`]

    // initialize grid w stars
    const grid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null))

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        grid[row][col] = { value: "star", isRevealed: false }
      }
    }

    // Initialize bombs
    let bombsPlaced = 0;
    while (bombsPlaced < msg.Payload.bombCount) {
      const row = getRandomInt(gridSize)
      const col = getRandomInt(gridSize)
      if (grid[row][col].value !== "bomb") {
        grid[row][col].value = "bomb";
        bombsPlaced++;
      }
    }

    // Initialize player data
    curentGames[`${user.id}-MineGame`] = {
      discoveredCells: 0,
      bombCount: msg.Payload.bombCount,
      betAmount: msg.Payload.betAmount,
      grid: grid
    }

    // User grid
    const userGrid = JSON.parse(JSON.stringify(grid))
    userGrid.forEach(row => row.forEach(cell => !cell.isRevealed ? cell.value = '' : null))

    if (! await applyUserBet(user, msg)) {
      ws.send(JSON.stringify({error: 'bet is not defined, below 0 or over the user balance'}))
      return
    }

    // send back data
    ws.send(JSON.stringify({grid: userGrid, multiplier: calculateMultiplier(msg.Payload.bombCount, 0), gainAmount: msg.Payload.betAmount, state: 'playing', discoveredCells: 0}))
  },
  async playMineGame(msg, ws, user) {
    // Check workflow status
    if (!curentGames[`${user.id}-MineGame`]?.betAmount) {
      ws.send(JSON.stringify({error: 'invalid game state'}))
      return
    }

    // Check if input is to cashout
    if (msg.Payload.cashOut) {
      // Update balance of the player
      const win = curentGames[`${user.id}-MineGame`].betAmount * calculateMultiplier(curentGames[`${user.id}-MineGame`].bombCount, curentGames[`${user.id}-MineGame`].discoveredCells)
      user.balance += win
      await user.save()
      await saveUserHistory(user, win - curentGames[`${user.id}-MineGame`].betAmount, 2)

      // Send informaitons
      ws.send(JSON.stringify({currentBalance: user.balance, gains: win}))
      
      // Remove user curentGames data
      delete curentGames[`${user.id}-MineGame`]
      return
    }

    // Check msg request
    if ((msg.Payload.row !== undefined ? (msg.Payload.row > gridSize) : true) || (msg.Payload.col !== undefined ? (msg.Payload.col > gridSize) : true)) {
      ws.send(JSON.stringify({error: `row nor col are not specified or greater than ${gridSize}`}))
      return
    }

    // Define data
    const row = msg.Payload.row
    const col = msg.Payload.col
    let state = 'playing'
    let gainAmount = 0
    let multipler = 0
    let discoveredCells = 0

    // Copy the grid and reveal user inputs
    curentGames[`${user.id}-MineGame`].grid[row][col]["isRevealed"] = true
    curentGames[`${user.id}-MineGame`].discoveredCells++;
    discoveredCells = curentGames[`${user.id}-MineGame`].discoveredCells

    let newGrid = JSON.parse(JSON.stringify(curentGames[`${user.id}-MineGame`].grid))

    // Update game variable according to the cell clicked
    if (curentGames[`${user.id}-MineGame`].grid[row][col].value === "bomb") {
      // Update states variable according to the loose
      state = 'loose'
      newGrid = curentGames[`${user.id}-MineGame`].grid

      await saveUserHistory(user, -curentGames[`${user.id}-MineGame`].betAmount, 2)

      // Remove user curentGames data
      delete curentGames[`${user.id}-MineGame`]
    } else {
      // hide unrevelead cell
      newGrid.forEach(row => row.forEach(cell => !cell.isRevealed ? cell.value = '' : null))

      // Update multiplier and game amount
      multipler = calculateMultiplier(curentGames[`${user.id}-MineGame`].bombCount, curentGames[`${user.id}-MineGame`].discoveredCells)
      gainAmount = curentGames[`${user.id}-MineGame`].betAmount * multipler

    }

    // Send back data
    ws.send(JSON.stringify({grid: newGrid, multiplier: multipler, gainAmount: gainAmount, state: state, discoveredCells: discoveredCells}))
  }
}