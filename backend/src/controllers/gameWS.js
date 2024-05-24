const historyModel = require('../models/histories.js')
const fetch = require('node-fetch')

// Global
const curentGames = {}
async function applyUserBet (user, msg) {
  // handle user bet
  if (typeof (msg.Payload.betAmount) !== 'number' || msg.Payload.betAmount < 0 || msg.Payload.betAmount > user.balance) {
    return false
  }

  // Update user balance
  user.balance -= msg.Payload.betAmount
  await user.save()
  return true
}

async function saveUserHistory (user, purProfit, gameID) {
  const history = await historyModel.create({ profit: purProfit, gameDate: Date.now() })
  history.setUser(user)
  history.setGame(gameID)
}

// Mines game
const gridSize = 5
const totalCells = gridSize * gridSize

function getRandomInt (max) {
  return Math.floor(Math.random() * max)
}

function calculateMultiplier (bombCount, discoveredCells) {
  // Calculate the base for the exponential function
  const base = 15 ** (1 / (totalCells - bombCount))

  // Calculate the multiplier based on the number of discovered cells
  const multiplier = base ** discoveredCells

  return Math.round(multiplier * 100) / 100
}

module.exports = {
  async initQuestion (msg, ws, user) {
    // Fetch data to the extern api
    let resultAPI
    try {
      resultAPI = await (await fetch('https://opentdb.com/api.php?amount=1&type=multiple', { method: 'GET' })).json()
    } catch (error) {
      console.error(error)
      ws.send(JSON.stringify({ error: error }))
      return
    }

    // Delete old games if it was not done before
    delete curentGames[`${user.id}-question`]

    // Problem : the api sometimes don't send the data
    if (resultAPI.results) {
      // Only one question
      const result = resultAPI.results[0]

      // Mix correct answers and incorrect answers
      const answers = result.incorrect_answers
      const correctAnswer = result.correct_answer
      answers.splice(Math.floor(Math.random() * (answers.length + 1)), 0, correctAnswer)

      // Add the correct answer to the global data to get it later
      curentGames[`${user.id}-question`] = {
        correctAnswer: correctAnswer
      }

      // Send back data
      ws.send(JSON.stringify({ question: result.question, difficulty: result.difficulty, category: result.category, possibleAnswers: answers, state: 'playing' }))
    } else {
      // Wait for :
      //    - the timeout to proc
      //    - then the function to end
      await new Promise(resolve => setTimeout(async () => {
        await this.initQuestion(msg, ws, user)
        resolve()
      }, 500))
    }
  },
  async playQuestion (msg, ws, user) {
    // Check msg request
    if (msg.Payload.answer === undefined) {
      ws.send(JSON.stringify({ error: 'you must specify the user answer' }))
      return
    }

    // Check answer type
    if (typeof (msg.Payload.answer) !== 'string') {
      ws.send(JSON.stringify({ error: 'answer field must be a string' }))
      return
    }

    // Check game state
    if (!curentGames[`${user.id}-question`]) {
      ws.send(JSON.stringify({ error: 'invalid game state' }))
      return
    }

    const correctAnswer = curentGames[`${user.id}-question`].correctAnswer

    // Check answer with correct answer
    if (msg.Payload.answer === correctAnswer) {
      // Update user balance
      user.balance += 10
      await user.save()

      // Send back data
      ws.send(JSON.stringify({ state: 'win', gains: 10 }))
    } else {
      ws.send(JSON.stringify({ state: 'loose', gains: 0 }))
    }

    // Delete global data for this game for this user
    delete curentGames[`${user.id}-question`]
  },
  async playSlotMachine (msg, ws, user) {
    // Check msg resquest
    if (msg.Payload.nbIcons === undefined || msg.Payload.indexesColumns === undefined || msg.Payload.betAmount === undefined) {
      ws.send(JSON.stringify({ error: 'nbIcons, indexesColumns nor betAmout not specified' }))
      return
    }

    // Check nbIcon type
    if (typeof (msg.Payload.nbIcons) !== 'number') {
      ws.send(JSON.stringify({ error: 'nbIcons should be a number' }))
      return
    }

    // Check indexesColumns type
    if (!Array.isArray(msg.Payload.indexesColumns) || msg.Payload.indexesColumns.length !== 3) {
      ws.send(JSON.stringify({ error: 'indexesColumns should be an array of size 3' }))
      return
    }

    // Apply user bet
    if (!await applyUserBet(user, msg)) {
      ws.send(JSON.stringify({ error: 'bet is not a number, below 0 or over the user balance' }))
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
    ws.send(JSON.stringify({ finalIndexes: finalIndexes, deltas: deltas, gains: gains, currentBalance: user.balance, state: state }))
  },
  async initMineGame (msg, ws, user) {
    // Check msg request
    if (msg.Payload.bombCount === undefined || msg.Payload.betAmount === undefined) {
      ws.send(JSON.stringify({ error: 'bombCount nor betAmout not specified' }))
      return
    }

    // Check bombCount field
    if (!Number.isInteger(msg.Payload.bombCount) || msg.Payload.bombCount < 1 || msg.Payload.bombCount >= totalCells) {
      ws.send(JSON.stringify({ error: `bombCount should be an integer and in the range [1, ${totalCells - 1}]` }))
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
        grid[row][col] = { value: 'star', isRevealed: false }
      }
    }

    // Initialize bombs
    let bombsPlaced = 0
    while (bombsPlaced < msg.Payload.bombCount) {
      const row = getRandomInt(gridSize)
      const col = getRandomInt(gridSize)
      if (grid[row][col].value !== 'bomb') {
        grid[row][col].value = 'bomb'
        bombsPlaced++
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

    if (!await applyUserBet(user, msg)) {
      ws.send(JSON.stringify({ error: 'bet is not defined, below 0 or over the user balance' }))
      return
    }

    // send back data
    ws.send(JSON.stringify({ grid: userGrid, multiplier: calculateMultiplier(msg.Payload.bombCount, 0), gainAmount: msg.Payload.betAmount, state: 'playing', discoveredCells: 0 }))
  },
  async playMineGame (msg, ws, user) {
    // Check workflow status
    if (!curentGames[`${user.id}-MineGame`]?.betAmount) {
      ws.send(JSON.stringify({ error: 'invalid game state' }))
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
      ws.send(JSON.stringify({ currentBalance: user.balance, gains: win }))

      // Remove user curentGames data
      delete curentGames[`${user.id}-MineGame`]
      return
    }

    // Check msg request
    if ((msg.Payload.row !== undefined ? (!Number.isInteger(msg.Payload.row) || msg.Payload.row < 0 || msg.Payload.row >= gridSize) : true) ||
        (msg.Payload.col !== undefined ? (!Number.isInteger(msg.Payload.col) || msg.Payload.col < 0 || msg.Payload.col >= gridSize) : true)) {
      ws.send(JSON.stringify({ error: `row nor col are not specified, haves invalids types or not in the range [0, ${gridSize - 1}]` }))
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
    curentGames[`${user.id}-MineGame`].grid[row][col].isRevealed = true
    curentGames[`${user.id}-MineGame`].discoveredCells++
    discoveredCells = curentGames[`${user.id}-MineGame`].discoveredCells

    let newGrid = JSON.parse(JSON.stringify(curentGames[`${user.id}-MineGame`].grid))

    // Update game variable according to the cell clicked
    if (curentGames[`${user.id}-MineGame`].grid[row][col].value === 'bomb') {
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
    ws.send(JSON.stringify({ grid: newGrid, multiplier: multipler, gainAmount: gainAmount, state: state, discoveredCells: discoveredCells }))
  },
  async playRouletteGame (msg, ws, user) {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

    // Check bets type
    if (!Array.isArray(msg.Payload.bets)) {
      ws.send(JSON.stringify({ error: 'Invalid bets type' }))
      return
    }

    // Generate result
    const randomNumber = Math.floor(Math.random() * 37)

    // Calcul total bet and check wins
    let totalBet = 0
    let winnings = 0
    let invalid = false
    msg.Payload.bets.forEach((bet) => {
      // Check bet amount
      if (typeof (bet.amount) !== 'number' || bet.amount <= 0) {
        ws.send(JSON.stringify({ error: 'Invalid bet amount' }))
        invalid = true
        return
      }

      // Check bet value
      if (typeof (bet.value) !== 'string') {
        ws.send(JSON.stringify({ error: 'Invalid bet value' }))
        invalid = true
        return
      }

      // Check bet type
      if (typeof (bet.type) !== 'string') {
        ws.send(JSON.stringify({ error: 'Invalid bet type' }))
        invalid = true
        return
      }

      // add amount to totalBet
      totalBet += bet.amount

      // Check win for the current bet
      switch (bet.type) {
        case 'number':
          if (parseInt(bet.value) === randomNumber) {
            winnings += 36 * bet.amount // Payout for betting on a specific number
          }
          break
        case 'color':
          if (
            (bet.value === 'red' && (randomNumber !== 0 && redNumbers.includes(randomNumber))) ||
            (bet.value === 'black' && (randomNumber !== 0 && !redNumbers.includes(randomNumber)))
          ) {
            winnings += 2 * bet.amount // Payout for betting on red or black
          }
          break
        case 'parity':
          if (
            (bet.value === 'odd' && (randomNumber !== 0 && randomNumber % 2 !== 0)) ||
            (bet.value === 'even' && (randomNumber !== 0 && randomNumber % 2 === 0))
          ) {
            winnings += 2 * bet.amount // Payout for betting on red or black
          }
          break
        case 'group': {
          const [start, end] = bet.value.split('-')

          // Check ranges
          if (!((parseInt(start) === 1 && parseInt(end) === 18) || (parseInt(start) === 19 && parseInt(end) === 36))) {
            ws.send(JSON.stringify({ error: 'invalid group range' }))
            invalid = true
            return
          }

          if (parseInt(start) <= randomNumber && randomNumber <= parseInt(end)) {
            winnings += 2 * bet.amount // Payout for betting on a group of numbers
          }
          break
        }
        case 'column': {
          const column = parseInt(bet.value.replace('column', ''))

          // Check column
          if (![1, 2, 3].includes(column)) {
            ws.send(JSON.stringify({ error: 'invalid column range' }))
            invalid = true
            return
          }

          if (randomNumber !== 0 && randomNumber % 3 === column) {
            winnings += 3 * bet.amount // Payout for betting on a column
          }
          break
        }
        case 'dozen': {
          const dozen = parseInt(bet.value.replace('dozen', ''))

          if (![1, 2, 3].includes(dozen)) {
            ws.send(JSON.stringify({ error: 'invalid dozen range' }))
            invalid = true
            return
          }

          if (randomNumber !== 0 && Math.ceil(randomNumber / 12) === dozen) {
            winnings += 3 * bet.amount // Payout for betting on a dozen
          }
          break
        }
        default:
          ws.send(JSON.stringify({ error: 'type not found' }))
          invalid = true
      }
    })

    if (invalid)
      return

    // Apply user bet
    if (!await applyUserBet(user, { Payload: { betAmount: totalBet } })) {
      ws.send(JSON.stringify({ error: 'bet is not a number, below 0 or over the user balance' }))
      return
    }

    // Add winings
    user.balance += winnings
    await user.save()
    await saveUserHistory(user, winnings - totalBet, 3)

    ws.send(JSON.stringify({ randomNumber, winnings }))
  }
}
