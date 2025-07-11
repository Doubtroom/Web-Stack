import React from "react";
import FlashCardContainer from "../components/FlashCardContainer";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

const FlashCardsPage = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  if (user && user.features && user.features.flashcards === false) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-[#173f67] dark:text-blue-300 mb-2">
          FlashCards are disabled
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You have turned off the FlashCards feature in your profile settings.
        </p>
        <Button onClick={() => navigate("/profile")}>Go to Profile</Button>
      </div>
    );
  }
  return (
    <div>
      <FlashCardContainer />
    </div>
  );
};

export default FlashCardsPage;
