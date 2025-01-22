import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './App.css';

interface GameState {
  target_number: number;
  attempts: number;
}

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [attempts, setAttempts] = useState(0);

  const startGame = async () => {
    try {
      const newGameState = await invoke<GameState>('start_game');
      setGameState(newGameState);
      setMessage('Game started! Guess a number between 1 and 100');
      setGuess('');
      setAttempts(0);
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const makeGuess = async () => {
    if (!gameState) {
      setMessage('Please start a new game first');
      return;
    }

    const parsedGuess = parseInt(guess, 10);
    if (isNaN(parsedGuess) || parsedGuess < 1 || parsedGuess > 100) {
      setMessage('Please enter a valid number between 1 and 100');
      return;
    }

    try {
      const [result, newAttempts] = await invoke<[string, number]>('make_guess', { state: gameState, guess: parsedGuess });
      setMessage(result);
      setAttempts(newAttempts);
      
      if (result.includes('Congratulations')) {
        setGameState(null);
      }
    } catch (error) {
      console.error('Failed to make guess:', error);
    }
  };

  return (
    <div className="App">
      <h1>Number Guessing Game</h1>
      {!gameState ? (
        <button onClick={startGame}>Start New Game</button>
      ) : (
        <div>
          <input 
            type="number" 
            value={guess} 
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess"
            min="1"
            max="100"
          />
          <button onClick={makeGuess}>Guess</button>
          <p>Attempts: {attempts}</p>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
