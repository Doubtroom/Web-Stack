import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Flip, ArrowForward } from '@mui/icons-material';

const FlashCard = ({ question, answer, onNext, onReview }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleFeedback = (difficulty) => {
    setShowFeedback(false);
    onReview(difficulty);
  };

  const reviewIntervals = {
    again: '1 minute',
    hard: '10 minutes',
    good: '1 day',
    easy: '3 days',
  };

  return (
    <Box sx={{ perspective: '1000px', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Card
          sx={{
            height: '400px',
            cursor: 'pointer',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
            backfaceVisibility: 'hidden',
            position: 'absolute',
            width: '100%',
          }}
          onClick={handleFlip}
        >
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h5" component="div" gutterBottom>
              {isFlipped ? 'Answer' : 'Question'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {isFlipped ? answer : question}
            </Typography>
            {!isFlipped && (
              <Button
                variant="contained"
                endIcon={<Flip />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
              >
                See Answer
              </Button>
            )}
            {isFlipped && (
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFeedback(true);
                }}
              >
                Rate Difficulty
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showFeedback} onClose={() => setShowFeedback(false)}>
        <DialogTitle>How well did you know this?</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {Object.entries(reviewIntervals).map(([difficulty, interval]) => (
              <Button
                key={difficulty}
                variant="contained"
                onClick={() => handleFeedback(difficulty)}
                sx={{ textTransform: 'capitalize' }}
              >
                {difficulty} ({interval})
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFeedback(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FlashCard; 