import { useState, useEffect } from 'react';
import './Roulette.css';

const RouletteView = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [betType, setBetType] = useState(null);
  const [betValue, setBetValue] = useState(null);
  const [betAmount, setBetAmount] = useState(1); // Default bet amount
  const [globalBetAmount, setGlobalBetAmount] = useState(0);
  const [balance, setBalance] = useState(1000); // Initial balance
  const [bets, setBets] = useState([]); // Array to store placed bets

  useEffect(() => {
    if (spinning) {
      const interval = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % 37);
      }, 20); // Change the number every 20ms
      return () => clearInterval(interval);
    }
  }, [spinning]);

  useEffect(() => {
    if (!spinning && result !== null) {
      setCurrentIndex(result); // Set currentIndex to result when spinning stops
      calculateWinnings(result);
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
    setBalance(prevBalance => prevBalance - globalBetAmount); // Deduct bet amount from balance
    setTimeout(() => {
      // Résultat
      const randomNumber = Math.floor(Math.random() * 37); // Random number between 0 and 36
      setResult(randomNumber); // Set the result after animation ends
      setTimeout(() => {
        setSpinning(false);
        setGlobalBetAmount(0);
      }, 600); // Simulating spinning time
    });
  };

  const placeBet = (type, value) => {
    if (!spinning) {
      setBetType(type);
      setBetValue(value);
      setBets([...bets, { type, value, amount: betAmount }]);
      setGlobalBetAmount(globalBetAmount + betAmount);
    }
  };

  const calculateWinnings = (result) => {
    bets.forEach((bet) => {
      if (bet.type && bet.value) {
        let winnings = 0;
        switch (bet.type) {
          case 'number':
            if (parseInt(bet.value) === result) {
              winnings = 36 * bet.amount; // Payout for betting on a specific number
            }
            break;
          case 'color':
            if (
              (bet.value === 'red' && (result !== 0 && result % 2 === 0)) ||
              (bet.value === 'black' && (result !== 0 && result % 2 !== 0))
            ) {
              winnings = 2 * bet.amount; // Payout for betting on red or black
            }
            break;
          case 'group':
            const [start, end] = bet.value.split('-');
            if (parseInt(start) <= result && result <= parseInt(end)) {
              winnings = 2 * bet.amount; // Payout for betting on a group of numbers
            }
            break;
          case 'column':
            const column = parseInt(bet.value.replace('column', ''));
            if (result !== 0 && result % 3 === column) {
              winnings = 3 * bet.amount; // Payout for betting on a column
            }
            break;
          case 'dozen':
            const dozen = parseInt(bet.value.replace('dozen', ''));
            if (result !== 0 && Math.ceil(result / 12) === dozen) {
              winnings = 3 * bet.amount; // Payout for betting on a dozen
            }
            break;
          default:
            break;
        }
        setBalance(prevBalance => prevBalance + winnings); // Add winnings to balance
      }
    })
  };

  const clearBets = () => {
    setBets([]);
  };

  const getColor = (number) => {
    if (number === 0) {
      return { color: 'white', backgroundColor: 'green' }; // 0 is green
    } else if (number % 2 === 0) {
      return { color: 'white', backgroundColor: 'red' }; // Even numbers are red
    } else {
      return { color: 'white', backgroundColor: 'black' }; // Odd numbers are black
    }
  };

  return (
    <div className="roulette-container">
      <h1>Roulette Game</h1>
      <p>Balance: {balance}</p>
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
      <div className="bet-buttons">
        <div className="bet-buttons-row">
          {[...Array(10)].map((_, index) => (
            <button key={index + 1} onClick={() => placeBet('number', index + 1)} disabled={spinning}>
              {index + 1}
            </button>
          ))}
        </div>
        <div className="bet-buttons-row">
          {[...Array(10)].map((_, index) => (
            <button key={index + 11} onClick={() => placeBet('number', index + 11)} disabled={spinning}>
              {index + 11}
            </button>
          ))}
        </div>
        <div className="bet-buttons-row">
          <button onClick={() => placeBet('number', 0)} disabled={spinning}>
            0
          </button>
          <button onClick={() => placeBet('color', 'red')} disabled={spinning}>
            Bet on Red
          </button>
          <button onClick={() => placeBet('color', 'black')} disabled={spinning}>
            Bet on Black
          </button>
        </div>
        <div className="bet-buttons-row">
          <button onClick={() => placeBet('group', '1-18')} disabled={spinning}>
            Bet on 1-18
          </button>
          <button onClick={() => placeBet('group', '19-36')} disabled={spinning}>
            Bet on 19-36
          </button>
        </div>
        <div className="bet-buttons-row">
          <button onClick={() => placeBet('column', 'column1')} disabled={spinning}>
            Bet on Column 1
          </button>
          <button onClick={() => placeBet('column', 'column2')} disabled={spinning}>
            Bet on Column 2
          </button>
          <button onClick={() => placeBet('column', 'column3')} disabled={spinning}>
            Bet on Column 3
          </button>
        </div>
        <div className="bet-buttons-row">
          <button onClick={() => placeBet('dozen', 'dozen1')} disabled={spinning}>
            Bet on 1st Dozen
          </button>
          <button onClick={() => placeBet('dozen', 'dozen2')} disabled={spinning}>
            Bet on 2nd Dozen
          </button>
          <button onClick={() => placeBet('dozen', 'dozen3')} disabled={spinning}>
            Bet on 3rd Dozen
          </button>
        </div>
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
    </div>
  );
};

export default RouletteView;
