import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, Maximize2, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnswers, fetchQuestionById } from '../store/dataSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import QuestionSkeleton from '../components/QuestionSkeleton';
import Button from '../components/Button';
import { toast } from 'sonner';
import ConfirmationDialog from '../components/ConfirmationDialog';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import AnswerSkeleton from '../components/AnswerSkeleton';
import AnswerCard from '../components/AnswerCard';
import { useSmartUpvote } from '../hooks/useSmartUpvote';

const Question = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleUpvote } = useSmartUpvote();
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { currentQuestion, answers, loading, error, answersPagination } = useSelector((state) => state.data);
  const user = useSelector((state) => state.auth.user);

  const fetchData = useCallback(async (cursor = null) => {
    if (!id) return;

    try {
      setIsFetching(true);
      
      if (!cursor) {
        dispatch({ type: 'data/clearCurrentQuestion' });
        dispatch({ type: 'data/clearAnswers' });
        const questionResult = await dispatch(fetchQuestionById(id)).unwrap();
        const useFirebaseId = Boolean(questionResult?.firebaseId);

        await dispatch(fetchAnswers({
          questionId: useFirebaseId ? questionResult.firebaseId : id,
          useFirebaseId,
          cursor: null
        })).unwrap();
        setIsInitialLoad(false);
      } else {
        const useFirebaseId = Boolean(currentQuestion?.firebaseId);
        await dispatch(fetchAnswers({
          questionId: useFirebaseId ? currentQuestion.firebaseId : id,
          useFirebaseId,
          cursor
        })).unwrap();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load question data');
    } finally {
      setIsFetching(false);
    }
  }, [dispatch, id, currentQuestion]);

  useEffect(() => {
    fetchData();
    return () => {
      dispatch({ type: 'data/clearCurrentQuestion' });
      dispatch({ type: 'data/clearAnswers' });
    };
  }, [dispatch, id]);

  const handleScroll = useCallback(() => {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollThreshold = 500; // increased to 500px from bottom to trigger load earlier

    if (
      documentHeight - scrollPosition <= scrollThreshold &&
      answersPagination.hasMore &&
      !isFetching
    ) {
      fetchData(answersPagination.nextCursor);
    }
  }, [answersPagination.hasMore, answersPagination.nextCursor, isFetching, fetchData]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const formatBranchName = (branch) => {
    if (!branch) return '';
    return branch
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleDelete = async () => {
    try {
      // TODO: Implement delete question action in dataSlice
      toast.success('Question deleted successfully!');
      navigate('/my-questions');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question. Please try again.');
    }
  };

  const handleEdit = () => {
    navigate(`/question/${id}/edit`);
  };

  const handleReply = (answerId) => {
    navigate(`/question/${id}/answer/${answerId}?scroll=comments`);
  };

  const handleAnswerCardClick = (answerId) => {
    navigate(`/question/${id}/answer/${answerId}`);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Show skeleton while loading initial data
  if (isInitialLoad || (loading && !currentQuestion)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-4xl mx-auto pt-2 lg:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
          <QuestionSkeleton />
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-8 mt-8">
            <div className="flex items-center justify-between mb-8">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse" />
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="space-y-8 flex flex-col gap-10">
              {[1,2,3].map((_, idx) => (
                <div key={idx}>
                  <AnswerSkeleton />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400 text-center">
          <p className="text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  // Only show not found message if we're not loading, there's no error, and we've actually tried to fetch the data
  if (!loading && !error && !currentQuestion && id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mt-10 lg:mt-28 justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Question Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The question you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const isQuestionOwner = currentQuestion?.postedBy === user.userId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Question Section */}
      <div className="w-full max-w-4xl mx-auto pt-2  lg:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-8 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className='w-full'>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-[#173f67] dark:text-blue-400 font-bold text-xl">{currentQuestion?.collegeName}</h2>
                  <span className="text-gray-400 dark:text-gray-500">•</span>
                  <span className="text-gray-600 dark:text-gray-300">{formatBranchName(currentQuestion?.branch)}</span>
                </div>
                <div className="mt-6 w-full">
                  <h1 className="text-3xl w-full font-light text-gray-800 dark:text-white tracking-wide leading-relaxed">{currentQuestion?.text}</h1>
                </div>
                <div className="w-full h-0.5 bg-[#173f67] dark:bg-blue-400 mt-4 opacity-50"/>
              </div>
              
              {isQuestionOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                  {showOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                      <button
                        onClick={() => {
                          setShowOptions(false);
                          handleEdit();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Question
                      </button>
                      <button
                        onClick={() => {
                          setShowOptions(false);
                          setShowDeleteDialog(true);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Question
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTimeAgo(currentQuestion?.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {answers?.length || 0} answers
              </span>
            </div>
            {currentQuestion?.photoUrl && (
              <div className="mt-6 rounded-lg overflow-hidden group relative cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
                <img
                  src={currentQuestion.photoUrl}
                  alt="Question"
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02] rounded-lg"
                  style={{ maxHeight: '60vh', width: '100%' }}
                />
              </div>
            )}
            {currentQuestion?.photoUrl && (
              <Lightbox
                open={isLightboxOpen}
                close={() => setIsLightboxOpen(false)}
                slides={[{ src: currentQuestion.photoUrl }]}
                plugins={[Zoom]}
                zoom={{
                  maxZoomPixelRatio: 3,
                  zoomInMultiplier: 2,
                  doubleTapDelay: 300,
                  doubleClickDelay: 300,
                  doubleClickMaxStops: 2,
                  keyboardMoveDistance: 50,
                  wheelZoomDistanceFactor: 100,
                  pinchZoomDistanceFactor: 100,
                  scrollToZoom: true,
                }}
                render={{ buttonPrev: () => null, buttonNext: () => null }}
              />
            )}
          </div>
        </div>

        {/* Answers Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Answers
            </h2>
            <Button 
              onClick={() => navigate(`/question/${id}/answer`)}
              variant="primary"
              children={
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span>Answer</span>
                </>
              }
            />
          </div>

          {!answers || answers.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No answers yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-3">Be the first to answer this question!</p>
            </div>
          ) : (
            <div className="space-y-8 flex flex-col gap-10">
              {answers.map((answer, index) => (
                <AnswerCard
                  key={answer._id || `answer-${index}`}
                  answer={answer}
                  index={index}
                  userData={user}
                  onUpvote={handleUpvote}
                  onReply={handleReply}
                  onCardClick={() => handleAnswerCardClick(answer._id)}
                />
              ))}

              {/* Loading indicator at the bottom */}
              {isFetching && (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
      />
    </div>
  );
};

export default Question;