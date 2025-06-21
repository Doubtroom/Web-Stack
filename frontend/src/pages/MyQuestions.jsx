import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, HelpCircle, Edit2, Trash2, ThumbsUp, Clock, BookOpen, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import Card from '../components/Card';
import QuestionSkeleton from '../components/QuestionSkeleton';
import AnswerSkeleton from '../components/AnswerSkeleton';
import { toast } from 'sonner';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserQuestions, fetchUserAnswers, deleteQuestion, deleteAnswer } from '../store/dataSlice';

const MyQuestions = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  
  const userData = useSelector((state) => state?.auth?.user);
  const userQuestions = useSelector((state) => state?.data.userQuestions);
  const userAnswers = useSelector((state) => state?.data.userAnswers);
  const loadingQuestions = useSelector((state) => state?.data.loadingQuestions);
  const loadingAnswers = useSelector((state) => state?.data.loadingAnswers);

  const handleDelete = async (type, id) => {
    if (type === 'question') {
      try {
        await dispatch(deleteQuestion(id)).unwrap();
        toast.success('Question and its answers deleted successfully!');
      } catch (error) {
        toast.error(error || 'Failed to delete question.');
      }
    } else { // type === 'answer'
      try {
        await dispatch(deleteAnswer(id)).unwrap();
        toast.success('Answer deleted successfully!');
      } catch (error) {
        toast.error(error || 'Failed to delete answer.');
      }
    }
  };

  useEffect(() => {
    const fetchUserContent = async () => {
      try {
        if (!hasFetched && !loadingQuestions && !loadingAnswers) {
          setHasFetched(true);
          await Promise.all([
            dispatch(fetchUserQuestions()).unwrap(),
            dispatch(fetchUserAnswers()).unwrap()
          ]);
        }
      } catch (err) {
        setError('Failed to fetch your content. Please try again later.');
        console.error('Error:', err);
        setHasFetched(false); // Reset fetch state on error
      }
    };

    if (userData) {
      fetchUserContent();
    }
  }, [userData, loadingQuestions, loadingAnswers, hasFetched, dispatch]);

  const formatText = (text) => {
    if (!text) return '';
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const handleEditAnswer = (answerId) => {
    navigate(`/answer/${answerId}/edit`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400 text-center">
          <p className="text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8 lg:mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-blue-900 dark:text-blue-300 lg:mb-2">My Content</h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-base">Manage your questions and answers</p>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">My Answers</h2>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {userAnswers?.length || 0} {userAnswers?.length === 1 ? 'answer' : 'answers'}
            </div>
          </div>

          {loadingAnswers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, index) => (
                <AnswerSkeleton key={index} />
              ))}
            </div>
          ) : !userAnswers?.length ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-800 dark:text-white mb-2">No answers yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-4">You haven't answered any questions yet</p>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/home')}
                className="px-6 py-2.5"
              >
                Browse Questions
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {userAnswers.map((answer) => (
                <Card
                  key={answer._id}
                  id={answer.questionId?._id}
                  answerId={answer._id}
                  type="answer"
                  collegeName={answer.questionId?.collegeName || 'Unknown College'}
                  img={answer.photoUrl}
                  imgId={answer.photoId}
                  branch={formatText(answer.questionId?.branch) || 'Unknown Branch'}
                  topic={answer.questionId?.text || 'Question not found'}
                  noOfAnswers={answer.upvotes || 0}
                  postedOn={formatTimeAgo(answer.createdAt)}
                  postedBy={answer.postedBy?._id}
                  showAnswerButton={false}
                  onDelete={handleDelete}
                  className="transform hover:scale-[1.02] transition-all duration-200"
                />
              ))}
            </div>
          )}
        </div>

        {/* My Questions Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">My Questions</h2>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {userQuestions?.length || 0} {userQuestions?.length === 1 ? 'question' : 'questions'}
            </div>
          </div>

          {loadingQuestions ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, index) => (
                <QuestionSkeleton key={index} />
              ))}
            </div>
          ) : !userQuestions?.length ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 text-center">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-800 dark:text-white mb-2">No questions yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-4">You haven't asked any questions yet</p>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/ask-question')}
                className="px-6 py-2.5"
              >
                Ask Question
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {userQuestions.map((question) => (
                <Card
                  key={question._id}
                  id={question._id}
                  collegeName={formatText(question.collegeName) || 'Your College'}
                  img={question.photoUrl}
                  imgId={question.photoId}
                  branch={formatText(question.branch) || 'Your Branch'}
                  collegeYear={question.collegeYear || 'Any Year'}
                  topic={formatText(question.topic) || 'General'}
                  noOfAnswers={question.noOfAnswers || 0}
                  postedOn={formatTimeAgo(question.createdAt)}
                  postedBy={question.postedBy?._id}
                  showAnswerButton={false}
                  onDelete={handleDelete}
                  className="transform hover:scale-[1.02] transition-all duration-200"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyQuestions; 