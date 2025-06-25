import React, { useState, useEffect } from 'react';
import FlashCard from './FlashCard';
import { flashcardServices } from '../services/data.services';
import LoadingSpinner from './LoadingSpinner';
import { Button, Modal } from 'antd';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const FlashCardContainer = () => {
  const [cards, setCards] = useState([]);
  const params = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNextDuePrompt, setShowNextDuePrompt] = useState(false);
  const [nextDueIndex, setNextDueIndex] = useState(null);

  // useEffect(()=>{
  //   console.log(cards)
  // },[cards])

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        const response = await flashcardServices.getAll();
        console.log(response)
        setCards(response.data.flashcards);
        setError(null);
      } catch (err) {
        setError("Failed to fetch flashcards.");
        console.error("Error fetching or processing flashcards:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  // Set currentIndex from route param
  useEffect(() => {
    if (!cards.length) return;
    const idx = params.cardIndex ? parseInt(params.cardIndex, 10) : 0;
    if (!isNaN(idx) && idx >= 0 && idx < cards.length) {
      setCurrentIndex(idx);
    } else {
      setCurrentIndex(0);
    }
  }, [params.cardIndex, cards.length]);

  const handleRateCard = (questionId, newDifficulty) => {
    setCards(currentCards =>
      currentCards.map(card =>
        card._id === questionId ? { ...card, difficulty: newDifficulty } : card
      )
    );

    // After rating, check for next due card
    setTimeout(() => {
      const now = new Date();
      const nextDue = cards.findIndex((card, idx) =>
        idx !== currentIndex && card.nextReviewAt && new Date(card.nextReviewAt) <= now && card.difficulty === null
      );
      if (nextDue !== -1) {
        setNextDueIndex(nextDue);
        setShowNextDuePrompt(true);
      }
    }, 300); // Wait a bit for state to update
  };

  // Update URL when currentIndex changes
  useEffect(() => {
    if (cards.length && currentIndex >= 0 && currentIndex < cards.length) {
      navigate(`/flashcards/${currentIndex}`, { replace: true });
    }
  }, [currentIndex, cards.length, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10 p-4">{error}</div>;
  }
  
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-4">
        <h2 className="text-black text-2xl font-semibold dark:text-white">No Flashcards Available</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
          It looks like you don't have any questions with answers yet. Go ahead and answer some of your questions to create flashcards!
        </p>
      </div>
    );
  }

  return (
    <div className="md:mt-16 flex flex-col items-center justify-center py-8 px-4 w-full">
      {/* Next Due Prompt Modal */}
      <Modal
        open={showNextDuePrompt}
        onCancel={() => setShowNextDuePrompt(false)}
        onOk={() => {
          setShowNextDuePrompt(false);
          if (nextDueIndex !== null) {
            setCurrentIndex(nextDueIndex);
          }
        }}
        okText="Go to Next Due Card"
        cancelText="Stay Here"
        centered
      >
        <div className="text-lg font-semibold mb-2">Another flashcard is due for review!</div>
        <div className="text-gray-600 dark:text-gray-300">Would you like to jump to the next card due for review?</div>
      </Modal>
      <div className="w-full max-w-2xl text-center mb-6">
        <h1 className="text-2xl sm:text-4xl font-bold text-blue-900 dark:text-blue-300 lg:mb-2">Review Your Flashcards</h1>
        <p className="text-gray-600 dark:text-gray-300">You have {cards.length} flashcard{cards.length === 1 ? '' : 's'} to review.</p>
      </div>
      
      <div className="relative w-full max-w-lg h-[30rem] sm:h-[26rem] overflow-hidden">
        {cards.map((card, index) => {
          const offset = index - currentIndex;
          let transform;
          let opacity = 0;
          
          if (offset === 0) {
            transform = 'translateX(0%) rotate(0deg)';
            opacity = 1;
          } else if (offset < 0) {
            // Discarded to the left
            transform = 'translateX(-110%) rotate(-10deg)';
          } else {
            // Waiting on the right
            transform = 'translateX(110%) rotate(10deg)';
          }

          return (
            <div
              key={card._id}
              className="absolute w-full h-full transition-all duration-500 ease-in-out"
              style={{
                transform: transform,
                opacity: opacity,
                zIndex: cards.length - Math.abs(offset),
              }}
            >
              <FlashCard
                questionId={card._id}
                questionText={card.text}
                questionImage={card.photoUrl}
                answer={card.answer.text}
                answerImage={card.answer.photoUrl}
                difficulty={card.difficulty}
                onRate={handleRateCard}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-6">
        <Button 
          icon={<ArrowLeft size={16} />}
          onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
          size="large"
          className="!bg-indigo-600 hover:!bg-indigo-700 !text-white !font-semibold !border-indigo-600 disabled:!bg-gray-400 dark:disabled:!bg-gray-600 disabled:!cursor-not-allowed disabled:!text-gray-100 dark:disabled:!text-gray-400"
        >
          Previous
        </Button>
        <span className="text-gray-600 dark:text-gray-300 font-semibold text-lg">
          {currentIndex + 1} / {cards.length}
        </span>
        <Button 
          icon={<ArrowRight size={16} />}
          onClick={() => setCurrentIndex(i => Math.min(i + 1, cards.length - 1))}
          disabled={currentIndex >= cards.length - 1}
          size="large"
          className="!bg-indigo-600 hover:!bg-indigo-700 !text-white !font-semibold !border-indigo-600 disabled:!bg-gray-400 dark:disabled:!bg-gray-600 disabled:!cursor-not-allowed disabled:!text-gray-100 dark:disabled:!text-gray-400"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default FlashCardContainer; 