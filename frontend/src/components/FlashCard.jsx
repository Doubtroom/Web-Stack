import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { flashcardServices } from '../services/data.services';
import { toast } from 'sonner';
import { Button, Card, Modal, ConfigProvider, theme } from 'antd';

const FlashCard = ({ questionId, questionText, questionImage, answer, answerImage, difficulty, onRate }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ text: '', image: null });
  const [showSeeAnswerConfirm, setShowSeeAnswerConfirm] = useState(false);

  const questionTextRef = useRef(null);
  const answerTextRef = useRef(null);
  const [isQuestionOverflowing, setIsQuestionOverflowing] = useState(false);
  const [isAnswerOverflowing, setIsAnswerOverflowing] = useState(false);
  const { isDarkMode } = useSelector((state) => state.darkMode);

  useEffect(() => {
    setIsFlipped(false);
    setIsEditing(false);
  }, [questionId]);

  useLayoutEffect(() => {
    const checkOverflow = (ref, setter) => {
      if (ref.current) {
        const isOverflowing = ref.current.scrollHeight > ref.current.clientHeight;
        setter(isOverflowing);
      }
    };

    if (isFlipped) {
      checkOverflow(answerTextRef, setIsAnswerOverflowing);
    } else {
      checkOverflow(questionTextRef, setIsQuestionOverflowing);
    }
  }, [isFlipped, questionText, answer]);

  const showModal = (text, image) => {
    setModalContent({ text, image });
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleRating = async (newDifficulty) => {
    if (isSubmitting) return;
    
    const originalDifficulty = difficulty;
    setIsSubmitting(true);
    setIsEditing(false);
    onRate(questionId, newDifficulty);

    try {
      await flashcardServices.upsertStatus({ questionId, difficulty: newDifficulty });
      toast.success(`Rated as ${newDifficulty}.`);
    } catch (error) {
      toast.error('Failed to save rating. Reverting.');
      onRate(questionId, originalDifficulty); // Revert on error
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCardContent = (content) => (
    <div className="w-full h-full rounded-2xl overflow-visible border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_8px_32px_rgba(0,0,0,0.22)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.28)]  transition-all duration-300">
      <Card
        className="w-full h-full rounded-2xl !bg-transparent shadow-none border-none"
        styles={{ body: { padding: 24, height: '100%' } }}
      >
        <div className="flex flex-col h-full justify-between items-center rounded-2xl">
          {content}
        </div>
      </Card>
    </div>
  );

  const showRatingButtons = difficulty === null || isEditing;

  return (
    <div className="w-full h-full" style={{ perspective: '1000px' }}>
      <div 
        className={`relative w-full h-full transition-transform duration-500 ease-in-out`}
        style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front of the Card */}
        <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
          {renderCardContent(
            <>
              <div className="text-center flex-grow flex flex-col justify-center items-center w-full overflow-hidden">
                {questionImage && <img src={questionImage} alt="Question" className="max-w-full max-h-32 rounded-lg object-contain mb-4 cursor-pointer" onClick={() => showModal(questionText, questionImage)} />}
                {questionText && (
                  <div className="relative w-full">
                    <p ref={questionTextRef} className="text-xl font-semibold dark:text-gray-100 break-words" style={{ maxHeight: questionImage ? '3rem' : '5.25rem', overflowY: 'hidden' }}>
                      {questionText}
                    </p>
                    {isQuestionOverflowing && (
                      <Button type="link" onClick={() => showModal(questionText, questionImage)} className="text-red-500">
                        Read More
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full flex flex-col items-center gap-3 my-4">
                {showRatingButtons ? (
                  <div className="text-center min-h-16">
                     <p className="text-md text-gray-600 dark:text-gray-300 mb-3">How confident are you?</p>
                     <div className="flex justify-center flex-wrap gap-2 sm:gap-4">
                        <Button 
                            disabled={isSubmitting} 
                            onClick={() => handleRating('hard')} 
                            className="!bg-red-100/70 !text-red-700 !font-bold !rounded-full !shadow-[0_0_12px_2px_rgba(239,68,68,0.10)] hover:!bg-red-200/80 hover:!shadow-[0_0_24px_4px_rgba(239,68,68,0.18)] hover:scale-105 transition-all border-none px-6 py-2"
                        >
                            Hard
                        </Button>
                        <Button
                            disabled={isSubmitting}
                            onClick={() => handleRating('medium')}
                            className="!bg-amber-100/70 !text-amber-700 !font-bold !rounded-full !shadow-[0_0_12px_2px_rgba(251,191,36,0.10)] hover:!bg-amber-200/80 hover:!shadow-[0_0_24px_4px_rgba(251,191,36,0.18)] hover:scale-105 transition-all border-none px-6 py-2"
                        >
                            Medium
                        </Button>
                        <Button
                            disabled={isSubmitting}
                            onClick={() => handleRating('easy')}
                            className="!bg-emerald-100/70 !text-emerald-700 !font-bold !rounded-full !shadow-[0_0_12px_2px_rgba(16,185,129,0.10)] hover:!bg-emerald-200/80 hover:!shadow-[0_0_24px_4px_rgba(16,185,129,0.18)] hover:scale-105 transition-all border-none px-6 py-2"
                        >
                            Easy
                        </Button>
                     </div>
                  </div>
                ) : (
                  <div className="text-center h-16 flex flex-col justify-center items-center">
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="!bg-indigo-50 dark:!bg-gray-700 !text-indigo-700 dark:!text-blue-300 !border !border-indigo-200 dark:!border-gray-600 hover:!bg-indigo-100 dark:hover:!bg-gray-600 hover:!text-indigo-800 dark:hover:!text-blue-200 !font-semibold transition-colors"
                    >
                      Edit Difficulty Rating
                    </Button>
                  </div>
                )}
              </div>

              <Button type="primary" size="large" onClick={() => setShowSeeAnswerConfirm(true)} className="!bg-indigo-600 hover:!bg-indigo-700 !text-white !font-semibold !border-indigo-600 disabled:!bg-gray-400 dark:disabled:!bg-gray-600 disabled:!cursor-not-allowed disabled:!text-gray-100 dark:disabled:!text-gray-400" >
                See Answer
              </Button>
            </>
          )}
        </div>

        {/* Back of the Card */}
        <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          {renderCardContent(
            <>
              <div className="text-center flex-grow flex flex-col justify-center items-center w-full overflow-hidden">
                {answerImage && <img src={answerImage} alt="Answer" className="max-w-full max-h-32 rounded-lg object-contain mb-4 cursor-pointer" onClick={() => showModal(answer, answerImage)} />}
                <div className="relative w-full">
                  <p ref={answerTextRef} className="text-xl font-medium dark:text-gray-100 break-words" style={{ maxHeight: '8.75rem', overflowY: 'hidden' }}>
                    {answer}
                  </p>
                  {isAnswerOverflowing && (
                    <Button type="link" onClick={() => showModal(answer, answerImage)} className="text-red-500">
                      Read More
                    </Button>
                  )}
                </div>
              </div>
              <Button type="text" onClick={() => setIsFlipped(false)} className="mt-2 self-center text-gray-500 dark:text-gray-400">
                Flip Back
              </Button>
            </>
          )}
        </div>
      </div>
      <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
        <Modal
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          centered
          width="80vw"
          styles={{ body: { padding: '24px 0 24px 24px' } }}
        >
          <div style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: '24px' }}>
            {modalContent.image && <img src={modalContent.image} alt="Content" className="max-w-full rounded-lg object-contain mb-4 mx-auto" style={{ maxHeight: '60vh' }} />}
            <p className="text-lg whitespace-pre-wrap">{modalContent.text}</p>
          </div>
        </Modal>
      </ConfigProvider>
      <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
        <Modal
          open={showSeeAnswerConfirm}
          onCancel={() => setShowSeeAnswerConfirm(false)}
          onOk={() => {
            setShowSeeAnswerConfirm(false);
            setIsFlipped(true);
          }}
          okText="Yes, show answer"
          cancelText="Cancel"
          centered
        >
          <div className="text-lg font-semibold mb-2">Are you sure you want to see the answer?</div>
          <div className="text-gray-400 dark:text-gray-300">Try to recall the answer yourself before revealing it!</div>
        </Modal>
      </ConfigProvider>
    </div>
  );
};

export default FlashCard; 