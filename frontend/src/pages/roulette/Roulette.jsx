import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../AppContext';
import './Roulette.css';
import Viardot from './../../assets/viardot-coin.png';

let gameSocket;

const ViardotCoin = ({ number, deleteNumber }) => {
  return <>
    {number ?
      <>
        <img src={Viardot} alt="Coin Viardot" className="w-10 absolute bottom-0 right-0 opacity-70 cursor-pointer" onClick={() => deleteNumber()} />
        <p className="absolute bottom-2.5 right-3 cursor-pointer" onClick={() => deleteNumber()}>{number}</p>
      </>
      : ''}
  </>

}

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
    try {
      gameSocket.send(JSON.stringify({ game: 'playRouletteGame', Payload: { bets }, userToken: token }));
    } catch (error) {
      setSpinning(false);
      console.error(error)
    }
  };

  const placeBet = (type, value) => {
    if (!spinning) {
      let betExists = false;

      const updatedBets = bets.map(bet => {
        if (bet.type === type && bet.value === value) {
          betExists = true;
          return {
            ...bet,
            amount: bet.amount + betAmount
          };
        }
        return bet;
      });

      if (!betExists) {
        updatedBets.push({ type, value, amount: betAmount });
      }

      setBets(updatedBets);
      setGlobalBetAmount(globalBetAmount + betAmount);
    }
  };

  const removeBet = (type, value) => {
    if (!spinning) {
      const betToRemove = bets.find(bet => bet.type === type && bet.value === value);
      if (betToRemove) {
        const updatedBets = bets.filter(bet => !(bet.type === type && bet.value === value));
        setBets(updatedBets);
        setGlobalBetAmount(globalBetAmount - betToRemove.amount);
      }
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
      return 'text-white bg-black'; // Black numbers
    }
  };


  return (
    <div className="roulette-container">
      <h1>Roulette Game</h1>
      <button onClick={startSpinning} disabled={spinning} className="spin-button">
        {spinning ? 'Spinning...' : 'Spin the Roulette'}
      </button>
      <div>
        <input className="shadow appearance-none border rounded py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
          id="betAmount"
          type="number"
          value={betAmount}
          onChange={handleBetAmountChange}
          min={1}
        />
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
      <div className="flex flex-row md:flex-col bg-lime-700 rounded-lg p-4 mt-4">
        {/* Première rangée */}
        <div className="flex flex-col md:flex-row justify-between">
          {[
            { type: 'dozen', value: 'dozen1', label: '1-12' },
            { type: 'dozen', value: 'dozen2', label: '13-24' },
            { type: 'dozen', value: 'dozen3', label: '25-36' }
          ].map((btn) => {
            return <div key={btn.value} className={`border border-white md:w-1/4 rounded-none flex-grow relative ${getColor(0)}`}>
              <button className="bg-transparent w-full h-full"
                onClick={() => placeBet(btn.type, btn.value)}
                disabled={spinning}>{btn.label}</button>
              <ViardotCoin number={bets.filter((b) => b.type == btn.type && b.value == btn.value)?.[0]?.['amount']} deleteNumber={() => removeBet(btn.type, btn.value)} />
            </div>
          })
          }
        </div>
        {/* Trois rangées principales */}
        <div className="flex flex-col md:flex-row">
          <div key={'0'} className={`border border-white rounded-none flex-grow relative ${getColor(0)}`}>
            <button className="bg-transparent w-full h-full"
              onClick={() => placeBet('number', '0')}
              disabled={spinning}>0</button>
            <ViardotCoin number={bets.filter((b) => b.type == 'number' && b.value == '0')?.[0]?.['amount']} deleteNumber={() => removeBet('number', '0')} />
          </div>
          <div className="flex flex-row-reverse md:flex-col w-full">
            {/* Première rangée des nombres */}
            <div className="flex flex-col md:flex-row">
              {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map((num) => (
                <div key={num} className={`border border-white flex-grow relative ${getColor(num)}`}>
                  <button className="bg-transparent w-full h-full"
                    onClick={() => placeBet('number', ''+num)}
                    disabled={spinning}>{num}</button>
                  <ViardotCoin number={bets.filter((b) => b.type === 'number' && b.value === ''+num)?.[0]?.amount} deleteNumber={() => removeBet('number', ''+num)} />
                </div>
              ))}
              <div key={'column1'} className={`border border-white rounded-none flex-grow relative ${getColor(0)}`}>
                <button className="bg-transparent w-full h-full"
                  onClick={() => placeBet('column', 'column1')}
                  disabled={spinning}>2 to 1</button>
                <ViardotCoin number={bets.filter((b) => b.type == 'column' && b.value == 'column1')?.[0]?.['amount']} deleteNumber={() => removeBet('column', 'column1')} />
              </div>
            </div>

            {/* Deuxième rangée des nombres */}
            <div className="flex flex-col md:flex-row">
              {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map((num) => (
                <div key={num} className={`border border-white flex-grow relative ${getColor(num)}`}>
                  <button className="bg-transparent w-full h-full"
                    onClick={() => placeBet('number', ''+num)}
                    disabled={spinning}>{num}</button>
                  <ViardotCoin number={bets.filter((b) => b.type === 'number' && b.value === ''+num)?.[0]?.amount} deleteNumber={() => removeBet('number', ''+num)} />
                </div>
              ))}

              <div key={'column2'} className={`border border-white  rounded-none flex-grow relative ${getColor(0)}`}>
                <button className="bg-transparent w-full h-full"
                  onClick={() => placeBet('column', 'column2')}
                  disabled={spinning}>2 to 1</button>
                <ViardotCoin number={bets.filter((b) => b.type == 'column' && b.value == 'column2')?.[0]?.['amount']} deleteNumber={() => removeBet('column', 'column2')} />
              </div>
            </div>

            {/* Troisième rangée des nombres */}
            <div className="flex flex-col md:flex-row">
              {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map((num) => (
                <div key={num} className={`border border-white flex-grow relative ${getColor(num)}`}>
                  <button className="bg-transparent w-full h-full"
                    onClick={() => placeBet('number', ''+num)}
                    disabled={spinning}>{num}</button>
                  <ViardotCoin number={bets.filter((b) => b.type === 'number' && b.value === ''+num)?.[0]?.amount} deleteNumber={() => removeBet('number', ''+num)} />
                </div>
              ))}
              <div key={'column3'} className={`border border-white  rounded-none flex-grow relative ${getColor(0)}`}>
                <button className="bg-transparent w-full h-full"
                  onClick={() => placeBet('column', 'column3')}
                  disabled={spinning}>2 to 1</button>
                <ViardotCoin number={bets.filter((b) => b.type == 'column' && b.value == 'column3')?.[0]?.['amount']} deleteNumber={() => removeBet('column', 'column3')} />
              </div>
            </div>
          </div>
        </div>

        {/* Quatrième rangée */}
        <div className="flex flex-col md:flex-row justify-between">
          {[
            { type: 'group', value: '1-18', label: '1-18' },
            { type: 'group', value: '19-36', label: '19-36' }
          ].map((btn) => {
            return <div key={btn.value} className={`border border-white md:w-1/2 rounded-none flex-grow relative ${getColor(0)}`}>
              <button className="bg-transparent w-full h-full"
                onClick={() => placeBet(btn.type, btn.value)}
                disabled={spinning}>{btn.label}</button>
              <ViardotCoin number={bets.filter((b) => b.type == btn.type && b.value == btn.value)?.[0]?.['amount']} deleteNumber={() => removeBet(btn.type, btn.value)} />
            </div>
          })
          }
        </div>

        {/* Cinquième rangée */}
        <div className="flex flex-col md:flex-row justify-between">
          {[
            { type: 'color', value: 'red', label: '🟥' },
            { type: 'color', value: 'black', label: '⬛' },
            { type: 'parity', value: 'even', label: 'Pair' },
            { type: 'parity', value: 'odd', label: 'Impair' }
          ].map((btn) => {
            return <div key={btn.value} className={`border border-white md:w-1/4 rounded-none flex-grow relative ${getColor(0)}`}>
              <button className="bg-transparent w-full h-full"
                onClick={() => placeBet(btn.type, btn.value)}
                disabled={spinning}>{btn.label}</button>
              <ViardotCoin number={bets.filter((b) => b.type == btn.type && b.value == btn.value)?.[0]?.['amount']} deleteNumber={() => removeBet(btn.type, btn.value)} />
            </div>
          })
          }
        </div>
      </div>


    </div>
  );
};

export default RouletteView;
