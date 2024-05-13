import React, { useState, useEffect } from 'react';
import './Roulette.css';

// TODO : Talbeau mise, tests unitaires

const RouletteView = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finalIndex, setFinalIndex] = useState(null);
  
  useEffect(() => {
    if (spinning) {
      const interval = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % 37);
      }, 20); // Change the number every 20ms
      return () => clearInterval(interval);
    }
  }, [spinning]);

  useEffect(() => {
    if (!spinning && finalIndex !== null) {
      setCurrentIndex(finalIndex); // Set currentIndex to finalIndex when spinning stops
    }
  }, [finalIndex, spinning]);

  const startSpinning = () => {
    setResult(null); // Clear previous result
    setCurrentIndex(0); // Reset currentIndex
    setSpinning(true);
    setTimeout(() => {
      const randomNumber = Math.floor(Math.random() * 37); // Random number between 0 and 36
      setFinalIndex(randomNumber);
      setTimeout(() => {
        setResult((randomNumber+2)%37); // Set the result after animation ends
        setSpinning(false);
      }, 600); // Simulating spinning time
    }, 600); // Simulating spinning time
  };

  return (
    <div className="roulette-container">
      <h1>Roulette Game</h1>
      <button onClick={startSpinning} disabled={spinning} className="spin-button">
        {spinning ? 'Spinning...' : 'Spin the Roulette'}
      </button>
      <div className="roulette">
        <div className="roulette-table">
          <div className="roulette-row">
            {[...Array(5)].map((_, index) => (
              <div key={index} className={`roulette-cell ${index === 2 ? 'selected' : ''}`}>
                {(currentIndex + index) % 37}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouletteView;
