const curentGames = {}

// Mines game
const gridSize = 5;
const totalCells = gridSize * gridSize;


function applyUserBet(user, msg) {
  // handle user bet
  if (msg.Payload.betAmount < 0 || msg.Payload.betAmount > user.balance) {
    return false
  }

  // Update user balance
  user.balance -= msg.Payload.betAmount
  user.save()
  return true
}

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

    if (!applyUserBet(user, msg)) {
      ws.send(JSON.stringify({error: 'bet is not defined, below 0 or over the user balance'}))
      return
    }

    // send back data
    ws.send(JSON.stringify({grid: userGrid, multiplier: calculateMultiplier(msg.Payload.bombCount, 0), gainAmount: msg.Payload.betAmount, state: 'playing'}))
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
      user.save()

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