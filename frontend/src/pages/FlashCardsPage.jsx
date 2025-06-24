import React from 'react';
import FlashCardContainer from '../components/FlashCardContainer';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const FlashCardsPage = () => {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  if (user && user.features && user.features.flashcards === false) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2">FlashCards are disabled</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">You have turned off the FlashCards feature in your profile settings.</p>
      <button onClick={() => navigate('/profile')} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Go to Profile</button>
    </div>;
  }
  return (
    <div>
      <FlashCardContainer />
    </div>
  );
};

export default FlashCardsPage; 