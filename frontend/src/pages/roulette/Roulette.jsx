import { useState, useEffect, useContext} from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '../../AppContext';
import Viardot from './../../assets/viardot-coin.png';


let gameSocket;

const isTest = import.meta.env.VITE_TEST == '1';
const valueTest = [
  {
    // 0 valide
    randomNumber: 0,
    winnings: 36
  },
  {
    // 0 invalide
    randomNumber: 1,
    winnings: 0
  },
  {
    // 1-12 valide
    randomNumber: 3,
    winnings: 3
  },
  {
    // 13-24 invalide
    randomNumber: 3,
    winnings: 0
  },
  {
    // 2 to 1 - 1
    randomNumber: 3,
    winnings: 3
  },
  {
    // 2 to 1 - 2
    randomNumber: 3,
    winnings: 0
  },
  {
    // Rouge
    randomNumber: 3,
    winnings: 2
  },
  {
    // Noir
    randomNumber: 3,
    winnings: 0
  }
];

const ViardotCoin = ({ number, deleteNumber }) => {
  return (
    <>
      {number ?
        <>
          <img src={Viardot} alt="Coin Viardot" className="w-1/3 md:h-1/2 md:w-auto absolute bottom-0 right-0 opacity-70 cursor-pointer" onClick={() => deleteNumber()} />
          <p className="absolute bottom-1 right-2 text-xs cursor-pointer" onClick={() => deleteNumber()}>{number}</p>
        </>
        : ''}
    </>
  );
}

ViardotCoin.propTypes = {
  number: PropTypes.number, // number est un nombre
  deleteNumber: PropTypes.func // deleteNumber est une fonction
};

let nbLaunchTest = 0;

const RouletteView = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [betAmount, setBetAmount] = useState(1); // Default bet amount
  const [globalBetAmount, setGlobalBetAmount] = useState(0);
  const [bets, setBets] = useState([]); // Array to store placed bets
  const [erreurMessage, setErreurMessage] = useState("");
  const { token, updateUserConnected } = useContext(AppContext);
  const [gainAmount, setGainAmount] = useState(0); // State for the gain amount
  const [betAmountSent, setBetAmountSent] = useState(0); // Default bet amount

  // Permet la surbrillance des éléments d'une colonne
  const [isColumn1Hovered, setIsColumn1Hovered] = useState(false);
  const [isColumn2Hovered, setIsColumn2Hovered] = useState(false);
  const [isColumn3Hovered, setIsColumn3Hovered] = useState(false);

  // Permet la surbrillance des éléments d'une douzaine
  const [isDozen1Hovered, setIsDozen1Hovered] = useState(false);
  const [isDozen2Hovered, setIsDozen2Hovered] = useState(false);
  const [isDozen3Hovered, setIsDozen3Hovered] = useState(false);

  // Permet la surbrillance des éléments d'un groupe
  const [isGroup1Hovered, setIsGroup1Hovered] = useState(false);
  const [isGroup2Hovered, setIsGroup2Hovered] = useState(false);

  // Permet la surbrillance des éléments pairs/impaires
  // Pairs
  const [isParity1Hovered, setIsParity1Hovered] = useState(false);
  //Impairs
  const [isParity2Hovered, setIsParity2Hovered] = useState(false);

  // Permet la surbrillance des éléments rouges/noirs
  // Rouge
  const [isColor1Hovered, setIsColor1Hovered] = useState(false);
  // Noir
  const [isColor2Hovered, setIsColor2Hovered] = useState(false);

  useEffect(() => {
    // Define web socket
    gameSocket = new WebSocket(`${import.meta.env.VITE_API_WS}/gameSocket`);

    // Define web socket handler
    gameSocket.onmessage = (msg) => {
      let data;
      if (isTest && nbLaunchTest < valueTest.length) {
        data = valueTest[nbLaunchTest];
        nbLaunchTest++;
      } else {
        data = JSON.parse(msg.data);
      }

      if (data.error) {
        setErreurMessage(data.error);
        setSpinning(false);
        return;
      }
      setErreurMessage("");

      // Résultat
      setResult(data.randomNumber); // Set the result after animation ends
      setTimeout(() => {
        setSpinning(false);
        setGlobalBetAmount(0);
        updateUserConnected();
        setGainAmount(data.winnings);
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
    // Send data to backend
    try {
      gameSocket.send(JSON.stringify({ game: 'playRouletteGame', Payload: { bets }, userToken: token }));
      setBetAmountSent(globalBetAmount);
      setResult(null); // Clear previous result
      setCurrentIndex(0); // Reset currentIndex
      setSpinning(true);
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
    const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

    const column1 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]
    const column2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]
    const column3 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]

    if ((isColumn1Hovered && column1.includes(number))
      || (isColumn2Hovered && column2.includes(number))
      || (isColumn3Hovered && column3.includes(number))
      || (isDozen1Hovered && number >= 1 && number <= 12)
      || (isDozen2Hovered && number >= 13 && number <= 24)
      || (isDozen3Hovered && number >= 25 && number <= 36)
      || (isGroup1Hovered && number >= 1 && number <= 18)
      || (isGroup2Hovered && number >= 19 && number <= 36)
      || (isParity1Hovered && number % 2 == 0 && number != 0)
      || (isParity2Hovered && number % 2 != 0)
      || (isColor1Hovered && redNumbers.includes(number))
      || (isColor2Hovered && blackNumbers.includes(number))) {
      return "text-white " + getHoverColor(number);
    } else {
      return getColorForRoulette(number) + ` hover:${getHoverColor(number)}`;
    }
  };

  const getHoverColor = (number) => {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    if (number === 0) {
      return "bg-lime-600" // Green numbers
    } else if (redNumbers.includes(number)) {
      return 'bg-red-500'; // Red numbers
    } else {
      return 'bg-gray-800'; // Black numbers
    }
  };

  const getColorForRoulette = (number) => {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    if (number === 0) {
      return 'text-white bg-lime-700 '; // 0 is green
    } else if (redNumbers.includes(number)) {
      return 'text-white bg-red-600'; // Red numbers
    } else {
      return 'text-white bg-black'; // Black numbers
    }
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="flex h-full justify-center items-center">
        <div className="border border-solid border-red-700 bg-gray-800 rounded-lg p-8 my-4">

          <div className="roulette-container">
            <h1 className="text-white text-center">Roulette Game</h1>

            <div className="mb-6">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="betAmount">Montant du pari : </label>
              <input className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                id="betAmount"
                type="number"
                value={betAmount}
                min={1}
                onChange={handleBetAmountChange} />
              <div className="text-white text-center-left">
                <h2 data-cy="totalBetAmount">Total Bet Amount for this spin: {globalBetAmount}</h2>
              </div>
            </div>

            <div className="roulette">
              <div className="flex justify-center">
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <div
                      data-cy={`${index === 2 ? "resultRoulette" : ""}`}
                      key={index}
                      className={`flex justify-center items-center border border-white ${index === 2 ? 'h-20 w-20' : 'h-12 w-12'} ${getColorForRoulette((currentIndex + index - 2 + 37) % 37)}`}
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
                  { type: 'dozen', value: 'dozen1', hoveredFunc: setIsDozen1Hovered, label: '1-12' },
                  { type: 'dozen', value: 'dozen2', hoveredFunc: setIsDozen2Hovered, label: '13-24' },
                  { type: 'dozen', value: 'dozen3', hoveredFunc: setIsDozen3Hovered, label: '25-36' }
                ].map((btn) => {
                  return <div key={btn.value} className={`border border-white md:w-1/4 rounded-none flex-grow relative ${getColor(0)}`}
                    onMouseEnter={() => btn.hoveredFunc(true)}
                    onMouseLeave={() => btn.hoveredFunc(false)}>
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
                          onClick={() => placeBet('number', '' + num)}
                          disabled={spinning}>{num}</button>
                        <ViardotCoin number={bets.filter((b) => b.type === 'number' && b.value === '' + num)?.[0]?.amount} deleteNumber={() => removeBet('number', '' + num)} />
                      </div>
                    ))}
                    <div key={'column1'} className={`border border-white rounded-none flex-grow relative ${getColor(0)}`}
                      onMouseEnter={() => setIsColumn1Hovered(true)}
                      onMouseLeave={() => setIsColumn1Hovered(false)}>
                      <button
                        data-cy="first-2to1"
                        className="bg-transparent w-full h-full"
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
                          onClick={() => placeBet('number', '' + num)}
                          disabled={spinning}>{num}</button>
                        <ViardotCoin number={bets.filter((b) => b.type === 'number' && b.value === '' + num)?.[0]?.amount} deleteNumber={() => removeBet('number', '' + num)} />
                      </div>
                    ))}

                    <div key={'column2'} className={`border border-white  rounded-none flex-grow relative ${getColor(0)}`}
                      onMouseEnter={() => setIsColumn2Hovered(true)}
                      onMouseLeave={() => setIsColumn2Hovered(false)}>
                      <button
                        data-cy="second-2to1"
                        className="bg-transparent w-full h-full"
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
                          onClick={() => placeBet('number', '' + num)}
                          disabled={spinning}>{num}</button>
                        <ViardotCoin number={bets.filter((b) => b.type === 'number' && b.value === '' + num)?.[0]?.amount} deleteNumber={() => removeBet('number', '' + num)} />
                      </div>
                    ))}
                    <div key={'column3'} className={`border border-white  rounded-none flex-grow relative ${getColor(0)}`}
                      onMouseEnter={() => setIsColumn3Hovered(true)}
                      onMouseLeave={() => setIsColumn3Hovered(false)}>
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
                  { type: 'group', value: '1-18', hoveredFunc: setIsGroup1Hovered, label: '1-18' },
                  { type: 'group', value: '19-36', hoveredFunc: setIsGroup2Hovered, label: '19-36' }
                ].map((btn) => {
                  return <div key={btn.value} className={`border border-white md:w-1/2 rounded-none flex-grow relative ${getColor(0)}`}
                    onMouseEnter={() => btn.hoveredFunc(true)}
                    onMouseLeave={() => btn.hoveredFunc(false)}>
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
                  { type: 'color', value: 'red', hoveredFunc: setIsColor1Hovered, label: '🟥' },
                  { type: 'color', value: 'black', hoveredFunc: setIsColor2Hovered, label: '⬛' },
                  { type: 'parity', value: 'even', hoveredFunc: setIsParity1Hovered, label: 'Pair' },
                  { type: 'parity', value: 'odd', hoveredFunc: setIsParity2Hovered, label: 'Impair' }
                ].map((btn) => {
                  return <div key={btn.value} className={`border border-white md:w-1/4 rounded-none flex-grow relative ${getColor(0)}`}
                    onMouseEnter={() => btn.hoveredFunc(true)}
                    onMouseLeave={() => btn.hoveredFunc(false)}>
                    <button className="bg-transparent w-full h-full"
                      onClick={() => placeBet(btn.type, btn.value)}
                      disabled={spinning}>{btn.label}</button>
                    <ViardotCoin number={bets.filter((b) => b.type == btn.type && b.value == btn.value)?.[0]?.['amount']} deleteNumber={() => removeBet(btn.type, btn.value)} />
                  </div>
                })
                }
              </div>
            </div>
            <span className="text-red-500 text-xs italic"> {erreurMessage}</span>
            <div className="text-white text-center mt-4">
              <h2 data-cy="betAmountSent">Bet Amount sent: {betAmountSent}</h2>
              <h2 data-cy="gainAmount">Gain Amount: {gainAmount}</h2>
            </div>
            <button disabled={spinning} onClick={startSpinning} className="bg-green-700 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 w-full">
              {spinning ? 'Spinning...' : 'Spin the Roulette'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouletteView;
