// src/App.js
import React, { useState, useEffect } from 'react';
import { createDeck, drawCards } from './api';
import './App.css';

const App = () => {
  const [deckId, setDeckId] = useState(null);
  const [player1Hand, setPlayer1Hand] = useState([]);
  const [player2Hand, setPlayer2Hand] = useState([]);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [gameStatus, setGameStatus] = useState('');
  const [playerTurn, setPlayerTurn] = useState(1); // 1 for Player 1's turn, 2 for Player 2's turn
  const [gameOver, setGameOver] = useState(false); // To check if the game is over

  useEffect(() => {
    initializeDeck();
  }, []);

  const initializeDeck = async () => {
    const deck = await createDeck();
    setDeckId(deck.deck_id);
    const player1Cards = await drawCards(deck.deck_id, 2);
    const player2Cards = await drawCards(deck.deck_id, 2);
    setPlayer1Hand(player1Cards.cards);
    setPlayer2Hand(player2Cards.cards);
    setPlayer1Score(calculateScore(player1Cards.cards));
    setPlayer2Score(calculateScore(player2Cards.cards));
    setGameStatus('');
    setPlayerTurn(1); // Player 1 starts
    setGameOver(false);
  };

  const calculateScore = (cards) => {
    let score = 0;
    let hasAce = false;

    cards.forEach(card => {
      if (['JACK', 'QUEEN', 'KING'].includes(card.value)) {
        score += 10;
      } else if (card.value === 'ACE') {
        hasAce = true;
        score += 1;
      } else {
        score += parseInt(card.value, 10);
      }
    });

    return score;
  };

  const drawMoreCards = async (player) => {
    if (!deckId || gameOver) return;

    const newCards = await drawCards(deckId, 1);
    const card = newCards.cards[0];

    if (player === 1) {
      const newHand = [...player1Hand, card];
      setPlayer1Hand(newHand);
      const newScore = calculateScore(newHand);
      setPlayer1Score(newScore);
      if (newScore > 21) {
        setGameStatus('Player 1 busts!');
        setPlayerTurn(2) // Move to Player 2's turn
      }
    } else {
      const newHand = [...player2Hand, card];
      setPlayer2Hand(newHand);
      const newScore = calculateScore(newHand);
      setPlayer2Score(newScore);
      if (newScore > 21) {
        setGameStatus('Player 2 busts!');
        determineWinner(); // Determine winner after Player 2 busts
      }
    }
  };

  const handleStand = () => {
    if (gameOver) return;

    if (playerTurn === 1) {
      if (player1Score == 21) {
        determineWinner()
      }
      setPlayerTurn(2);
      if (player2Score <= 21) {
        // If Player 2 hasn't busted, it's their turn
        return;
      }
    } else if (playerTurn === 2) {
      determineWinner(); // Determine winner after Player 2 stands
    }
  };

  const determineWinner = () => {
    if (player1Score > 21 && player2Score > 21) {
      setGameStatus('Both players bust! It\'s a tie.');
    } else if (player1Score > 21) {
      setGameStatus('Player 1 busts! Player 2 wins.');
    } else if (player2Score > 21) {
      setGameStatus('Player 2 busts! Player 1 wins.');
    } else if (player1Score > player2Score) {
      setGameStatus('Player 1 wins!');
    } else if (player2Score > player1Score) {
      setGameStatus('Player 2 wins!');
    } else {
      setGameStatus('It\'s a tie!');
    }
    setGameOver(true);
  };

  const handleRestart = () => {
    initializeDeck();
  };

  return (
    <div className="app">
      <header>
        <h1>Blackjack Game</h1>
      </header>
      <div className="game-container">
        <div className="player-section">
          <h2>Player 1</h2>
          <div className="cards">
            {player1Hand.map(card => (
              <img key={card.code} src={card.image} alt={card.code} className="card" />
            ))}
          </div>
          <p className="score">Score: {player1Score}</p>
          <button className="btn" onClick={() => drawMoreCards(1)} disabled={playerTurn !== 1 || gameOver}>Hit</button>
          <button className="btn" onClick={handleStand} disabled={playerTurn !== 1 || gameOver}>Stand</button>
        </div>
        <div className="player-section">
          <h2>Player 2</h2>
          <div className="cards">
            {player2Hand.map(card => (
              <img key={card.code} src={card.image} alt={card.code} className="card" />
            ))}
          </div>
          <p className="score">Score: {player2Score}</p>
          <button className="btn" onClick={() => drawMoreCards(2)} disabled={playerTurn !== 2 || gameOver}>Hit</button>
          <button className="btn" onClick={handleStand} disabled={playerTurn !== 2 || gameOver}>Stand</button>
        </div>
      </div>
      {gameStatus && (
        <div className="status">
          <p>{gameStatus}</p>
          <button className="btn" onClick={handleRestart}>Restart Game</button>
        </div>
      )}
    </div>
  );
};

export default App;
