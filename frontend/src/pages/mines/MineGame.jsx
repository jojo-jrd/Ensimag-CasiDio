import React, { useState, useEffect } from "react";
import "./MineGame.css"; // Import CSS file for styling
import NavBar from './../../components/navbar/Navbar';

const gridSize = 5;
const totalCells = gridSize * gridSize;
let bombCount = 5;
let discoveredCells = 0;
let winProbability = 0.54;
let multiplier = 1;

const calculateMultiplier = () => {
  // Calculate the base for the exponential function
  const base = 15 ** (1 / (totalCells - bombCount));
  
  // Calculate the multiplier based on the number of discovered cells
  const multiplier = base ** discoveredCells;
  
  return Math.round(multiplier * 100) / 100;
};

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const initializeGrid = () => {
  const grid = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null));

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      grid[row][col] = { value: "star", isRevealed: false };
    }
  }

  let bombsPlaced = 0;
  while (bombsPlaced < bombCount) {
    const row = getRandomInt(gridSize);
    const col = getRandomInt(gridSize);
    if (grid[row][col].value !== "bomb") {
      grid[row][col].value = "bomb";
      bombsPlaced++;
    }
  }

  return grid;
};

const Cell = ({ value, isRevealed, gameOver, onClick }) => {
  return (
    <div
      className={`cell ${isRevealed ? "revealed" : ""}`}
      onClick={onClick}
      style={{ cursor: gameOver ? "default" : "pointer" }} // Disable clicking when game is over
    >
      {value === "star" && (isRevealed || gameOver) ? "⭐️" : value === "bomb" && (isRevealed || gameOver) ? "💣" : ""}
    </div>
  );
};

const MineGameView = () => {
  const [grid, setGrid] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [multiplier, setMultiplier] = useState(false);
  const [betAmount, setBetAmount] = useState(1); // Default bet amount
  const [gainAmount, setGainAmount] = useState(0); // State for the gain amount

  useEffect(() => {
    setGrid(initializeGrid());
  }, []);

  const handleCellClick = (row, col) => {
    if (!gameOver && !grid[row][col].isRevealed) {
      const newGrid = [...grid];
      newGrid[row][col]["isRevealed"] = true;
      setGrid(newGrid);
      discoveredCells++;

      if (grid[row][col].value === "bomb") {
        setGameOver(true);
        setMultiplier(0);
        setGainAmount(0); // Reset gain amount if bomb is clicked
      } else {
        const newMultiplier = calculateMultiplier();
        setMultiplier(newMultiplier);
        setGainAmount(betAmount * newMultiplier); // Calculate and set the gain amount using the new multiplier
      }
    }
  };

  const handleRestart = () => {
    discoveredCells = 0;
    setGrid(initializeGrid());
    setGameOver(false);
    setMultiplier(1);
    setGainAmount(0); // Reset gain amount when restarting the game
  };

  const cashOut = () => {
    // Adjust balance based on the gain amount
    // Restart the game
    handleRestart();
  };

  // Function to handle changes in the bet amount
  const handleBetAmountChange = (event) => {
    const newBetAmount = parseInt(event.target.value);
    setBetAmount(newBetAmount);
  };

  // Function to handle changes in the number of bombs
  const handleBombCountChange = (event) => {
    const newBombCount = parseInt(event.target.value);
    bombCount = newBombCount;
    setGrid(initializeGrid()); // Update grid with new bomb count
    handleRestart(); // Restart game with the new bomb count
  };

  return (
    <div className="game-container">
      <NavBar/>
      <h1>Mines Game</h1>
      <div className="controls">
        <label>
          Number of Bombs:
          <input
            type="number"
            value={bombCount}
            onChange={handleBombCountChange}
            min={1}
            max={totalCells - 1} // Maximum number of bombs cannot exceed total cells - 1
            disabled={gameOver || discoveredCells > 0} // Disable changing bomb count when game is running
          />
        </label>
        <label>
          Bet Amount:
          <input
            type="number"
            value={betAmount}
            onChange={handleBetAmountChange}
            min={1}
            disabled={gameOver || discoveredCells > 0} // Disable changing bet amount when game is running
          />
        </label>
      </div>
      <div className="grid">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              value={cell.value}
              isRevealed={cell.isRevealed}
              gameOver={gameOver}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
      
      {discoveredCells > 0 && (
        <div>
          <h2>Multiplier: x{multiplier}</h2>
          <h2>Gain Amount: {gainAmount}</h2> {/* Display the gain amount */}
        </div>
      )}
      {!gameOver && discoveredCells > 0 && (
        <div>
          <button onClick={cashOut}>Cash Out</button>
        </div>
      )}
      {gameOver && (
        <div>
          <h2>Game Over!</h2>
          <button onClick={handleRestart}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default MineGameView;
