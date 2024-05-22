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

    // Define web socket handler
    gameSocket.onmessage = (msg) => {
      const data = JSON.parse(msg.data)
  
      // Résultat
      setResult(data.randomNumber); // Set the result after animation ends
      setTimeout(() => {
        setSpinning(false);
        setGlobalBetAmount(0);
        updateUserConnected();
      }, 600); // Simulating spinning time
    };
  }, [updateUserConnected]);

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
      return 'text-white bg-lime-700'; // 0 is green
    } else if (redNumbers.includes(number)) {
      return 'text-white bg-red-600'; // Red numbers
    } else {
      return 'text-white bg-black' ; // Black numbers
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
                className={`roulette-cell ${index === 2 ? 'selected' : ''} ${getColor((currentIndex + index - 2 + 37) % 37)}`}
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
            <td className="border-2 border-white" colSpan="4"><button className={`rounded-none  ${getColor(0)}`} onClick={() => placeBet('dozen', 'dozen1')} disabled={spinning}>1-12</button></td>
            <td className="border-2 border-white" colSpan="4"><button className={`rounded-none  ${getColor(0)}`} onClick={() => placeBet('dozen', 'dozen2')} disabled={spinning}>13-24</button></td>
            <td className="border-2 border-white" colSpan="4"><button className={`rounded-none  ${getColor(0)}`} onClick={() => placeBet('dozen', 'dozen3')} disabled={spinning}>25-36</button></td>
            <td></td>
          </tr>
          <tr>
            <td className="border-2 border-white" rowSpan="3"><button className={`"rounded-none ${getColor(0)}`} onClick={() => placeBet('number', '0')} disabled={spinning}>0</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(3)}`} onClick={() => placeBet('number', '3')} disabled={spinning}>3</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(6)}`} onClick={() => placeBet('number', '6')} disabled={spinning}>6</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(9)}`} onClick={() => placeBet('number', '9')} disabled={spinning}>9</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(12)}`} onClick={() => placeBet('number', '12')} disabled={spinning}>12</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(15)}`} onClick={() => placeBet('number', '15')} disabled={spinning}>15</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(18)}`} onClick={() => placeBet('number', '18')} disabled={spinning}>18</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(21)}`} onClick={() => placeBet('number', '21')} disabled={spinning}>21</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(24)}`} onClick={() => placeBet('number', '24')} disabled={spinning}>24</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(27)}`} onClick={() => placeBet('number', '27')} disabled={spinning}>27</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(30)}`} onClick={() => placeBet('number', '30')} disabled={spinning}>30</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(33)}`} onClick={() => placeBet('number', '33')} disabled={spinning}>33</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(36)}`} onClick={() => placeBet('number', '36')} disabled={spinning}>36</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(0)}`} onClick={() => placeBet('column', 'column1')} disabled={spinning}>2 to 1</button></td>
          </tr>
          <tr>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(2)}`} onClick={() => placeBet('number', '2')} disabled={spinning}>2</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(5)}`} onClick={() => placeBet('number', '5')} disabled={spinning}>5</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(8)}`} onClick={() => placeBet('number', '8')} disabled={spinning}>8</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(11)}`} onClick={() => placeBet('number', '11')} disabled={spinning}>11</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(14)}`} onClick={() => placeBet('number', '14')} disabled={spinning}>14</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(17)}`} onClick={() => placeBet('number', '17')} disabled={spinning}>17</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(20)}`} onClick={() => placeBet('number', '20')} disabled={spinning}>20</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(23)}`} onClick={() => placeBet('number', '23')} disabled={spinning}>23</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(26)}`} onClick={() => placeBet('number', '26')} disabled={spinning}>26</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(29)}`} onClick={() => placeBet('number', '29')} disabled={spinning}>29</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(32)}`} onClick={() => placeBet('number', '32')} disabled={spinning}>32</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(35)}`} onClick={() => placeBet('number', '35')} disabled={spinning}>35</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(0)}`} onClick={() => placeBet('column', 'column2')} disabled={spinning}>2 to 1</button></td>
          </tr>
          <tr>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(1)}`} onClick={() => placeBet('number', '1')} disabled={spinning}>1</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(4)}`} onClick={() => placeBet('number', '4')} disabled={spinning}>4</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(7)}`} onClick={() => placeBet('number', '7')} disabled={spinning}>7</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(10)}`} onClick={() => placeBet('number', '10')} disabled={spinning}>10</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(13)}`} onClick={() => placeBet('number', '13')} disabled={spinning}>13</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(16)}`} onClick={() => placeBet('number', '16')} disabled={spinning}>16</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(19)}`} onClick={() => placeBet('number', '19')} disabled={spinning}>19</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(22)}`} onClick={() => placeBet('number', '22')} disabled={spinning}>22</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(25)}`} onClick={() => placeBet('number', '25')} disabled={spinning}>25</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(28)}`} onClick={() => placeBet('number', '28')} disabled={spinning}>28</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(31)}`} onClick={() => placeBet('number', '31')} disabled={spinning}>31</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(34)}`} onClick={() => placeBet('number', '34')} disabled={spinning}>34</button></td>
            <td className="border-2 border-white"><button className={`rounded-none ${getColor(0)}`} onClick={() => placeBet('column', 'column3')} disabled={spinning}>2 to 1</button></td>
          </tr>
          <tr>
            <td></td>
            <td className="border-2 border-white"  colSpan="5"><button className={`rounded-none ${getColor(0)}`} onClick={() => placeBet('group', '1-18')} disabled={spinning}>1-18</button></td>
            <td className="border-2 border-white" ><button className={`rounded-none ${getColor(0)}`} onClick={() => placeBet('color', 'red')} disabled={spinning}>🟥</button></td>
            <td className="border-2 border-white" ><button className={`rounded-none ${getColor(0)}`} onClick={() => placeBet('color', 'black')} disabled={spinning}>⬛</button></td>
            <td className="border-2 border-white"  colSpan="5"><button className={`rounded-none ${getColor(0)}`} onClick={() => placeBet('group', '19-36')} disabled={spinning}>19-36</button></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default RouletteView;
