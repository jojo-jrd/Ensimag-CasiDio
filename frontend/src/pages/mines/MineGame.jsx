import { useState, useEffect, useContext } from "react";
import { AppContext } from '../../AppContext';
import "./MineGame.css";
import PropTypes from 'prop-types';

const gridSize = 5;
const totalCells = gridSize * gridSize;
let gameSocket;


const Cell = ({ value, isRevealed, gameOver, onClick }) => {
  return (
    <div
      className={`cell ${isRevealed ? "revealed" : ""} w-14 h-14 bg-white flex justify-center items-center text-xl`}
      onClick={onClick}
      style={{ cursor: gameOver || isRevealed ? "default" : "pointer" }} // Disable clicking when game is over
    >
      {value === "star" && (isRevealed) ? "⭐️" : value === "bomb" && (isRevealed) ? "💣" : ""}
    </div>
  );
};

Cell.propTypes = {
  value : PropTypes.string,
  isRevealed : PropTypes.bool,
  gameOver : PropTypes.bool,
  onClick : PropTypes.func,
}


const MineGameView = () => {
  const [grid, setGrid] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [betAmount, setBetAmount] = useState(1); // Default bet amount
  const [bombCount, setBombCount] = useState(5);
  const [gainAmount, setGainAmount] = useState(0); // State for the gain amount
  const [discoveredCells, setDiscoveredCells] = useState(0);
  const [erreurMessage, setErreurMessage] = useState("");
  const { token, updateUserConnected } = useContext(AppContext);

  useEffect(() => {
    // Define web socket
    gameSocket = new WebSocket(`${import.meta.env.VITE_API_WS}/gameSocket`);
  }, []);

  const initGame = () => {
    gameSocket.send(JSON.stringify({game: 'initMineGame', Payload: {bombCount: bombCount, betAmount: betAmount}, userToken: token}));
    // Update l'user pour savoir son nouveau solde
    updateUserConnected();

    gameSocket.onmessage = (msg) => {
      const data = JSON.parse(msg.data)

      if (data.error) {
        setErreurMessage(data.error);
        console.error(data.error)
        return
      }

      setErreurMessage("");

      setMultiplier(data.multiplier)
      setGainAmount(data.gainAmount)
      setGameOver(false)
      setGrid(data.grid)
      setDiscoveredCells(data.discoveredCells)
      gameSocket.onmessage = (msg) => mineGameHandler(msg);
    }
  }

  const handleCellClick = (row, col) => {
    if (!gameOver && !grid[row][col].isRevealed)
      gameSocket.send(JSON.stringify({game: 'playMineGame', Payload: {row: row, col: col}, userToken: token}));
  };

  const cashOut = () => {
    gameSocket.send(JSON.stringify({game: 'playMineGame', Payload: {cashOut: true}, userToken: token}));
    // Update l'user pour savoir son nouveau solde
    updateUserConnected();
    setDiscoveredCells(0); // to display the play button
  };

  // Function to handle changes in the bet amount
  const handleBetAmountChange = (event) => {
    const newBetAmount = parseInt(event.target.value);
    setBetAmount(newBetAmount);
  };

  // Function to handle changes in the number of bombs
  const handleBombCountChange = (event) => {
    const newBombCount = parseInt(event.target.value);
    setBombCount(newBombCount);
  };

  const mineGameHandler = (msg) => {
    const data = JSON.parse(msg.data)

    if (data.error) {
      console.error(data.error)
      return
    }

    if (!data.gains) { // data.gains => cashout
      setGrid(data.grid)
      setMultiplier(data.multiplier)
      setGainAmount(data.gainAmount)
      setDiscoveredCells(data.discoveredCells)
  
      if (data.state === 'loose') {
        setGameOver(true);
        setDiscoveredCells(0);
      }
    }
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex h-full justify-center items-center">
        <div className="border border-solid border-red-700 bg-gray-800 rounded-lg p-8">
          <h1 className="text-white text-center">Mines Game</h1>

          <div className="text-white py-5">
            <div>
              <label className="block text-white text-sm font-bold mb-2" htmlFor="bombQuantity">Quantité de bombes : </label>
              <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                id="bombQuantity"
                type="number"
                value={bombCount}
                onChange={handleBombCountChange}
                min={1}
                max={totalCells - 1} // Maximum number of bombs cannot exceed total cells - 1
                disabled={discoveredCells > 0} // Disable changing bomb count when game is running
              />
            </div>
            <div>
              <label className="block text-white text-sm font-bold mb-2" htmlFor="betAmount">Montant du pari : </label>
              <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                id="betAmount"
                type="number"
                value={betAmount}
                onChange={handleBetAmountChange}
                min={1}
                // TODO : Max betamout : solde
                disabled={discoveredCells > 0} // Disable changing bet amount when game is running
              />
            </div>
          </div>
          <div className="grid grid-cols-5 grid-rows-5 gap-2">
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
          <div className="text-white text-center mt-4">
            <h2>Multiplier: x{multiplier}</h2>
            <h2>Gain Amount: {gainAmount}</h2> {/* Display the gain amount */}
          </div>
          <span className="text-red-500 text-xs italic"> {erreurMessage}</span>
          {!gameOver && discoveredCells > 0 && (
            <div>
              <button onClick={cashOut} className="bg-green-700 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 w-full">Cash Out</button>
            </div>
          )}
          {!gameOver && discoveredCells == 0 && (
            <div>
              <button onClick={initGame} className="bg-green-700 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 w-full">Play</button>
            </div>
          )}
          {gameOver && (
            <div>
              <h2 className="text-white text-center" >Game Over!</h2>
              <button onClick={initGame} className="bg-red-700 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 w-full">Play Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MineGameView;
