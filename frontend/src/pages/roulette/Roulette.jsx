import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../AppContext';
import './Roulette.css';

let gameSocket;

const RouletteView = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [betAmount, setBetAmount] = useState(1); // Default bet amount
  const [globalBetAmount, setGlobalBetAmount] = useState(0);
  const [bets, setBets] = useState([]); // Array to store placed bets
  const { token, updateUserConnected } = useContext(AppContext);

  useEffect(() => {
    // Define web socket
    gameSocket = new WebSocket(`${import.meta.env.VITE_API_WS}/gameSocket`);

    // Define handler
    gameSocket.onmessage = (msg) => socketHandler(msg);
  });

  // Handle spinning
  useEffect(() => {
    if (spinning) {
      const interval = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % 37);
      }, 20); // Change the number every 20ms
      return () => clearInterval(interval);
    }
  }, [spinning]);

  // Handle end of spinning
  useEffect(() => {
    if (!spinning && result !== null) {
      setCurrentIndex(result); // Set currentIndex to result when spinning stops
      clearBets(); // Clear bets after each spin
    }
  }, [result, spinning]);

  // Function to handle sockets message
  const socketHandler = (msg) => {
    const data = JSON.parse(msg.data)

    // Résultat
    setResult(data.randomNumber); // Set the result after animation ends
    setTimeout(() => {
      setSpinning(false);
      setGlobalBetAmount(0);
      updateUserConnected();
    }, 600); // Simulating spinning time
  }

  // Function to handle changes in the bet amount
  const handleBetAmountChange = (event) => {
    if (event.target.value) {
      const newBetAmount = parseInt(event.target.value);
      setBetAmount(newBetAmount);
    } else {
      setBetAmount('');
    }
  };

  const startSpinning = () => {
    setResult(null); // Clear previous result
    setCurrentIndex(0); // Reset currentIndex
    setSpinning(true);

    // Send data to backend
    gameSocket.send(JSON.stringify({ game: 'playRouletteGame', Payload: { bets }, userToken: token }));
  };

  const placeBet = (type, value) => {
    if (!spinning) {
      setBets([...bets, { type, value, amount: betAmount }]);
      setGlobalBetAmount(globalBetAmount + betAmount);
    }
  };

  const clearBets = () => {
    setBets([]);
  };

  const getColor = (number) => {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    if (number === 0) {
      return { color: 'white', backgroundColor: 'rgb(77 124 15)'}; // 0 is green
    } else if (redNumbers.includes(number)) {
      return { color: 'white', backgroundColor: 'red' }; // Red numbers
    } else {
      return { color: 'white', backgroundColor: 'black' }; // Black numbers
    }
};


  return (
    <div className="roulette-container">
      <h1>Roulette Game</h1>
      <button onClick={startSpinning} disabled={spinning} className="spin-button">
        {spinning ? 'Spinning...' : 'Spin the Roulette'}
      </button>
      <div>
        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
          id="betAmount"
          type="number"
          value={betAmount}
          onChange={handleBetAmountChange}
          min={1}
        />
      </div>
      <div className="bets-summary">
        <h2>Bets Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Value</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet, index) => (
              <tr key={index}>
                <td>{bet.type}</td>
                <td>{bet.value}</td>
                <td>{bet.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="roulette">
        <div className="roulette-table">
          <div className="roulette-row">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`roulette-cell ${index === 2 ? 'selected' : ''}`}
                style={getColor((currentIndex + index - 2 + 37) % 37)}
              >
                {(currentIndex + index - 2 + 37) % 37}
              </div>
            ))}
          </div>
        </div>
      </div>
      <table className="bg-lime-700 rounded-lg">
        <tbody>
          <tr>
            <td></td>
            <td className="border-2 border-white" colSpan="4"><button style={{color: 'white', backgroundColor: 'rgb(77 124 15)'}} className="rounded-none" onClick={() => placeBet('dozen', 'dozen1')} disabled={spinning}>1-12</button></td>
            <td className="border-2 border-white" colSpan="4"><button style={{color: 'white', backgroundColor: 'rgb(77 124 15)'}} className="rounded-none" onClick={() => placeBet('dozen', 'dozen2')} disabled={spinning}>13-24</button></td>
            <td className="border-2 border-white" colSpan="4"><button style={{color: 'white', backgroundColor: 'rgb(77 124 15)'}} className="rounded-none" onClick={() => placeBet('dozen', 'dozen3')} disabled={spinning}>25-36</button></td>
            <td></td>
          </tr>
          <tr>
            <td className="border-2 border-white" rowSpan="3"><button style={getColor(0)} className="rounded-none" onClick={() => placeBet('number', '0')} disabled={spinning}>0</button></td>
            <td className="border-2 border-white"><button style={getColor(3)} className="rounded-none" onClick={() => placeBet('number', '3')} disabled={spinning}>3</button></td>
            <td className="border-2 border-white"><button style={getColor(6)} className="rounded-none" onClick={() => placeBet('number', '6')} disabled={spinning}>6</button></td>
            <td className="border-2 border-white"><button style={getColor(9)} className="rounded-none" onClick={() => placeBet('number', '9')} disabled={spinning}>9</button></td>
            <td className="border-2 border-white"><button style={getColor(12)} className="rounded-none" onClick={() => placeBet('number', '12')} disabled={spinning}>12</button></td>
            <td className="border-2 border-white"><button style={getColor(15)} className="rounded-none" onClick={() => placeBet('number', '15')} disabled={spinning}>15</button></td>
            <td className="border-2 border-white"><button style={getColor(18)} className="rounded-none" onClick={() => placeBet('number', '18')} disabled={spinning}>18</button></td>
            <td className="border-2 border-white"><button style={getColor(21)} className="rounded-none" onClick={() => placeBet('number', '21')} disabled={spinning}>21</button></td>
            <td className="border-2 border-white"><button style={getColor(24)} className="rounded-none" onClick={() => placeBet('number', '24')} disabled={spinning}>24</button></td>
            <td className="border-2 border-white"><button style={getColor(27)} className="rounded-none" onClick={() => placeBet('number', '27')} disabled={spinning}>27</button></td>
            <td className="border-2 border-white"><button style={getColor(30)} className="rounded-none" onClick={() => placeBet('number', '30')} disabled={spinning}>30</button></td>
            <td className="border-2 border-white"><button style={getColor(33)} className="rounded-none" onClick={() => placeBet('number', '33')} disabled={spinning}>33</button></td>
            <td className="border-2 border-white"><button style={getColor(36)} className="rounded-none" onClick={() => placeBet('number', '36')} disabled={spinning}>36</button></td>
            <td className="border-2 border-white"><button style={{color: 'white', backgroundColor: 'rgb(77 124 15)'}} className="rounded-none" onClick={() => placeBet('column', 'column1')} disabled={spinning}>2 to 1</button></td>
          </tr>
          <tr>
            <td className="border-2 border-white"><button style={getColor(2)} className="rounded-none" onClick={() => placeBet('number', '2')} disabled={spinning}>2</button></td>
            <td className="border-2 border-white"><button style={getColor(5)} className="rounded-none" onClick={() => placeBet('number', '5')} disabled={spinning}>5</button></td>
            <td className="border-2 border-white"><button style={getColor(8)} className="rounded-none" onClick={() => placeBet('number', '8')} disabled={spinning}>8</button></td>
            <td className="border-2 border-white"><button style={getColor(11)} className="rounded-none" onClick={() => placeBet('number', '11')} disabled={spinning}>11</button></td>
            <td className="border-2 border-white"><button style={getColor(14)} className="rounded-none" onClick={() => placeBet('number', '14')} disabled={spinning}>14</button></td>
            <td className="border-2 border-white"><button style={getColor(17)} className="rounded-none" onClick={() => placeBet('number', '17')} disabled={spinning}>17</button></td>
            <td className="border-2 border-white"><button style={getColor(20)} className="rounded-none" onClick={() => placeBet('number', '20')} disabled={spinning}>20</button></td>
            <td className="border-2 border-white"><button style={getColor(23)} className="rounded-none" onClick={() => placeBet('number', '23')} disabled={spinning}>23</button></td>
            <td className="border-2 border-white"><button style={getColor(26)} className="rounded-none" onClick={() => placeBet('number', '26')} disabled={spinning}>26</button></td>
            <td className="border-2 border-white"><button style={getColor(29)} className="rounded-none" onClick={() => placeBet('number', '29')} disabled={spinning}>29</button></td>
            <td className="border-2 border-white"><button style={getColor(32)} className="rounded-none" onClick={() => placeBet('number', '32')} disabled={spinning}>32</button></td>
            <td className="border-2 border-white"><button style={getColor(35)} className="rounded-none" onClick={() => placeBet('number', '35')} disabled={spinning}>35</button></td>
            <td className="border-2 border-white"><button style={{color: 'white', backgroundColor: 'rgb(77 124 15)'}} className="rounded-none" onClick={() => placeBet('column', 'column2')} disabled={spinning}>2 to 1</button></td>
          </tr>
          <tr>
            <td className="border-2 border-white"><button  style={getColor(1)} className="rounded-none"onClick={() => placeBet('number', '1')} disabled={spinning}>1</button></td>
            <td className="border-2 border-white"><button  style={getColor(4)} className="rounded-none"onClick={() => placeBet('number', '4')} disabled={spinning}>4</button></td>
            <td className="border-2 border-white"><button  style={getColor(7)} className="rounded-none"onClick={() => placeBet('number', '7')} disabled={spinning}>7</button></td>
            <td className="border-2 border-white"><button  style={getColor(10)} className="rounded-none"onClick={() => placeBet('number', '10')} disabled={spinning}>10</button></td>
            <td className="border-2 border-white"><button  style={getColor(13)} className="rounded-none"onClick={() => placeBet('number', '13')} disabled={spinning}>13</button></td>
            <td className="border-2 border-white"><button  style={getColor(16)} className="rounded-none"onClick={() => placeBet('number', '16')} disabled={spinning}>16</button></td>
            <td className="border-2 border-white"><button  style={getColor(19)} className="rounded-none"onClick={() => placeBet('number', '19')} disabled={spinning}>19</button></td>
            <td className="border-2 border-white"><button  style={getColor(22)} className="rounded-none"onClick={() => placeBet('number', '22')} disabled={spinning}>22</button></td>
            <td className="border-2 border-white"><button  style={getColor(25)} className="rounded-none"onClick={() => placeBet('number', '25')} disabled={spinning}>25</button></td>
            <td className="border-2 border-white"><button  style={getColor(28)} className="rounded-none"onClick={() => placeBet('number', '28')} disabled={spinning}>28</button></td>
            <td className="border-2 border-white"><button  style={getColor(31)} className="rounded-none"onClick={() => placeBet('number', '31')} disabled={spinning}>31</button></td>
            <td className="border-2 border-white"><button  style={getColor(34)} className="rounded-none"onClick={() => placeBet('number', '34')} disabled={spinning}>34</button></td>
            <td className="border-2 border-white"><button style={{color: 'white', backgroundColor: 'rgb(77 124 15)'}} className="rounded-none"onClick={() => placeBet('column', 'column3')} disabled={spinning}>2 to 1</button></td>
          </tr>
          <tr>
            <td></td>
            <td className="border-2 border-white"  colSpan="5"><button style={{color: 'white', backgroundColor: 'rgb(77 124 15)'}} className="rounded-none" onClick={() => placeBet('group', '1-18')} disabled={spinning}>1-18</button></td>
            <td className="border-2 border-white" ><button style={{color: 'white', backgroundColor: 'rgb(77 124 15)'}} className="rounded-none" onClick={() => placeBet('color', 'red')} disabled={spinning}>🟥</button></td>
            <td className="border-2 border-white" ><button style={{color: 'white', backgroundColor: 'rgb(77 124 15)'}} className="rounded-none" onClick={() => placeBet('color', 'black')} disabled={spinning}>⬛</button></td>
            <td className="border-2 border-white"  colSpan="5"><button style={{color: 'white', backgroundColor: 'rgb(77 124 15)'}} className="rounded-none" onClick={() => placeBet('group', '19-36')} disabled={spinning}>19-36</button></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default RouletteView;
