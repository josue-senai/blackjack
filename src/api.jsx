// src/api.js
const BASE_URL = 'https://deckofcardsapi.com/api/deck';

export const createDeck = async () => {
  const response = await fetch(`${BASE_URL}/new/shuffle/?deck_count=1`);
  const data = await response.json();
  return data;
};

export const drawCards = async (deckId, count = 2) => {
  const response = await fetch(`${BASE_URL}/${deckId}/draw/?count=${count}`);
  const data = await response.json();
  return data;
};
