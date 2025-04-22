import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import FlashCard from './FlashCard';

const FlashCardContainer = ({ cards }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentCard, setCurrentCard] = useState(cards[0]);

  useEffect(() => {
    if (cards.length > 0) {
      setCurrentCard(cards[currentCardIndex]);
    }
  }, [currentCardIndex, cards]);

  const handleReview = (difficulty) => {
    const currentTime = new Date();
    let nextReviewTime;

    switch (difficulty) {
      case 'again':
        nextReviewTime = new Date(currentTime.getTime() + 1 * 60 * 1000);
        break;
      case 'hard':
        nextReviewTime = new Date(currentTime.getTime() + 10 * 60 * 1000);
        break;
      case 'good':
        nextReviewTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'easy':
        nextReviewTime = new Date(currentTime.getTime() + 3 * 24 * 60 * 60 * 1000);
        break;
      default:
        nextReviewTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
    }

    const reviewedCard = {
      ...currentCard,
      nextReview: nextReviewTime,
      difficulty,
    };

    setReviewQueue([...reviewQueue, reviewedCard]);

    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Handle end of cards
      setCurrentCardIndex(0);
    }
  };

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Flash Cards
      </Typography>
      <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
        Card {currentCardIndex + 1} of {cards.length}
      </Typography>
      
      {currentCard && (
        <FlashCard
          question={currentCard.question}
          answer={currentCard.answer}
          onReview={handleReview}
        />
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1))}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          onClick={() => setCurrentCardIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0))}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default FlashCardContainer; 