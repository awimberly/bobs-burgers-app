import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Container, Button, CircularProgress, Grid, Typography } from '@mui/material';
import CharacterCard from './components/CharacterCard';
import { Card } from './interfaces/Card';
import './App.css'; 

const BOBS_BURGER_ENDPOINT = 'https://bobsburgers-api.herokuapp.com/characters';
const BOBS_BURGER_THEME_URL = 'https://www.televisiontunes.com/uploads/audio/Bobs%20Burgers.mp3';

const App: React.FC = () => {
  const [gridSize, setGridSize] = useState(4); // Default to 4x4
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null); // Reference to the audio element

  useEffect(() => {
    if (gridSize) {
      fetchCharacters();
    }
  }, [gridSize]);

  useEffect(() => {
    checkIfGameWon();
  }, [cards]);

  const fetchCharacters = async () => {
    setLoading(true); // Start loading when fetching begins
    try {
      const numPairs = (gridSize * gridSize) / 2;
      const characterRequests = Array.from({ length: numPairs }, () => {
        const randomIndex = Math.floor(Math.random() * 496) + 1;
        return axios.get(`${BOBS_BURGER_ENDPOINT}/${randomIndex}`);
      });
    
      const responses = await Promise.all(characterRequests);
      const uniqueCharacters = responses.map((res) => res.data);

      // Duplicate characters and shuffle
      const gameCards = uniqueCharacters.flatMap((character) => [
        { id: Math.random(), character, flipped: false, matched: false },
        { id: Math.random(), character, flipped: false, matched: false },
      ]);

      // Shuffle cards
      setCards(gameCards.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error('Error fetching character data:', error);
    } finally {
      setLoading(false); // Stop loading once fetching is done
    }
  };

  const handleCardClick = (clickedCard: Card) => {
    if (flippedCards.length === 2 || clickedCard.flipped || clickedCard.matched) return;

    const newFlippedCards = [...flippedCards, clickedCard];
    const updatedCards = cards.map((card) =>
      card.id === clickedCard.id ? { ...card, flipped: true } : card
    );

    setCards(updatedCards);
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      if (newFlippedCards[0].character.id === newFlippedCards[1].character.id) {
        // Match found
        const matchedCards = updatedCards.map((card) =>
          newFlippedCards.some((flipped) => flipped.id === card.id)
            ? { ...card, matched: true }
            : card
        );
        setCards(matchedCards);
        setFlippedCards([]);
      } else {
        // No match: flip cards back down after delay
        setTimeout(() => {
          const resetCards = updatedCards.map((card) =>
            newFlippedCards.some((flipped) => flipped.id === card.id)
              ? { ...card, flipped: false }
              : card
          );
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleGridSizeChange = (size: number) => {
    setGridSize(size);
    setCards([]);
    setFlippedCards([]);
    setGameWon(false); // Reset game won status
  };

  const checkIfGameWon = () => {
    if (cards.length > 0 && cards.every(card => card.matched)) {
      setGameWon(true);
    } else {
      setGameWon(false);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', minHeight: '100vh' }}>
      <audio ref={audioRef} src={BOBS_BURGER_THEME_URL} loop />
      <div className="grid-buttons">
        <Button variant="contained" onClick={() => handleGridSizeChange(4)}>4x4</Button>
        <Button variant="contained" onClick={() => handleGridSizeChange(6)}>6x6</Button>
        <Button variant="contained" onClick={() => handleGridSizeChange(8)}>8x8</Button>
      </div>
      <Button className="music-button" variant="contained" sx={{ marginTop: 2 }} onClick={toggleAudio}>
        {isPlaying ? 'Stop Music' : 'Play Music'}
      </Button>
      {loading ? (
        <CircularProgress />
      ) : (
        <div>
          {gameWon && <Typography variant="h4" sx={{ marginBottom: 2 }}>Congratulations! You won!</Typography>}
          <Grid container spacing={2} sx={{ width: '100%', justifyContent: 'center' }}>
            {cards.map((card) => (
              <Grid item xs={12 / gridSize} key={card.id}>
                <CharacterCard
                  character={card.character}
                  flipped={card.flipped}
                  onClick={() => handleCardClick(card)}
                />
              </Grid>
            ))}
          </Grid>
        </div>
      )}
    </Container>
  );
};

export default App;
