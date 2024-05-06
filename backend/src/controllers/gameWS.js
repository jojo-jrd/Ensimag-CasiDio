const curentGames = {}

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
  async initMineGame(msg, ws) {
    // initialize grid w stars and bombs
    const grid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null))

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        grid[row][col] = { value: "star", isRevealed: false }
      }
    }

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
    curentGames['user-MineGame'] = {
      discoveredCells: 0,
      bombCount: msg.Payload.bombCount,
      betAmount: msg.Payload.betAmount,
      grid: grid
    }

    // User grid
    const userGrid = JSON.parse(JSON.stringify(grid))
    userGrid.forEach(row => row.forEach(cell => !cell.isRevealed ? cell.value = '' : null))

    // TODO RETIRER LA THUNE

    // send back data
    ws.send(JSON.stringify({grid: userGrid, multiplier: calculateMultiplier(msg.Payload.bombCount, 0), gainAmount: msg.Payload.betAmount, state: 'playing'}))
  },
  async playMineGame(msg, ws) {
    const row = msg.Payload.row
    const col = msg.Payload.col
    let state = 'playing'
    let gainAmount = 0
    let multipler = 0

    let newGrid = [...curentGames['user-MineGame'].grid]
    newGrid[row][col]["isRevealed"] = true
    curentGames['user-MineGame'].discoveredCells++;

    if (curentGames['user-MineGame'].grid[row][col].value === "bomb") {
      state = 'loose'
      newGrid = curentGames['user-MineGame'].grid
    } else {
      newGrid.forEach(row => row.forEach(cell => !cell.isRevealed ? cell.value = '' : null))

      multipler = calculateMultiplier(curentGames['user-MineGame'].bombCount, curentGames['user-MineGame'].discoveredCells)
      gainAmount = curentGames['user-MineGame'].betAmount * multipler
    }

    ws.send(JSON.stringify({grid: newGrid, multiplier: multipler, gainAmount: gainAmount, state: state}))
  }
}