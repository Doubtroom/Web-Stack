import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Clock, ArrowLeft, ZoomIn } from 'lucide-react';
import DataService from '../firebase/DataService';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { toast } from 'sonner';
import CommentSection from '../components/CommentSection';
import ImageModal from '../components/ImageModal';

const Answer = () => {
  const { questionId, answerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState(null);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const commentSectionRef = useRef(null);

  const getUserCollege = async (userId) => {
    try {
      const userService = new DataService('users');
      const userDoc = await userService.getDocumentById(userId);
      return userDoc?.collegeName || null;
    } catch (error) {
      console.error('Error fetching user college:', error);
      return null;
    }
  };

  useEffect(() => {
    if (answerId) {
      fetchAnswerAndQuestion();
    } else {
      setError('Invalid answer ID');
      setLoading(false);
    }
  }, [answerId, questionId]);

  useEffect(() => {
    // Check if we should scroll to comments
    if (searchParams.get('scroll') === 'comments' && commentSectionRef.current && !loading) {
      // Add a small delay to ensure the component is fully rendered
      setTimeout(() => {
        const yOffset = -100; // Adjust this value to control how far from the top the scroll should stop
        const element = commentSectionRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 100);
    }
  }, [searchParams, loading]);

  const fetchAnswerAndQuestion = async () => {
    try {
      if (!answerId) {
        setError('Invalid answer ID');
        setLoading(false);
        return;
      }

      const dataService = new DataService('answers');
      const answerData = await dataService.getDocumentById(answerId);
      
      if (!answerData) {
        setError('Answer not found');
        setLoading(false);
        return;
      }
      
      // Fetch college information for the answer
      const collegeName = await getUserCollege(answerData.userId);
      setAnswer({ ...answerData, collegeName });

      // If questionId is not in URL params, try to get it from answer data
      const qId = questionId || answerData.questionId;
      if (qId) {
        const questionService = new DataService('questions');
        const questionData = await questionService.getDocumentById(qId);
        if (!questionData) {
          setError('Question not found');
          setLoading(false);
          return;
        }
        setQuestion(questionData);
      } else {
        setError('Question ID not found');
        setLoading(false);
        return;
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch answer details. Please try again later.');
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const handleBackToQuestion = () => {
    const qId = questionId || answer?.questionId;
    if (!qId) {
      toast.error('Could not find question ID');
      navigate('/home');
      return;
    }
    navigate(`/question/${qId}`);
  };

  const handleUpvote = async () => {
    try {
      const dataService = new DataService('answers');
      const userId = userData.uid;
      
      if (!userId) {
        toast.error('Please login to upvote');
        return;
      }

      const currentUpvotedBy = Array.isArray(answer.upvotedBy) ? answer.upvotedBy : [];
      const hasUpvoted = currentUpvotedBy.includes(userId);
      const newUpvotes = hasUpvoted ? answer.upvotes - 1 : answer.upvotes + 1;
      
      const newUpvotedBy = hasUpvoted 
        ? currentUpvotedBy.filter(id => id !== userId)
        : [...currentUpvotedBy, userId];

      await dataService.updateDocument(answerId, {
        upvotes: newUpvotes,
        upvotedBy: newUpvotedBy
      });

      setAnswer(prev => ({
        ...prev,
        upvotes: newUpvotes,
        upvotedBy: newUpvotedBy
      }));

      toast.success(hasUpvoted ? 'Upvote removed' : 'Answer upvoted!');
    } catch (error) {
      console.error('Error updating upvote:', error);
      toast.error('Failed to update upvote. Please try again.');
    }
  };

  const handleReply = () => {
    commentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/home')}
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto lg:pt-24 pb-12 px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={handleBackToQuestion}
        >
          <ArrowLeft className="w-4 h-4 mr-2 dark:text-[#3f7cc6]" />
          <span className='dark:text-[#3f7cc6]'>
          Back to Question
          </span>
        </Button>

        {/* Answer Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {userData.role === 'faculty' ? answer?.userName : 'Anonymous'}
                </h3>
                {userData.role === 'faculty' && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                    Faculty
                  </span>
                )}
                {answer?.collegeName && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    answer.collegeName === userData.collegeName
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                  }`}>
                    {answer.collegeName === userData.collegeName ? 'My College' : 'Other College'}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTimeAgo(answer?.createdAt)}
              </span>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 dark:text-gray-300 text-lg">{answer?.text}</p>
          </div>

          {answer?.photo && (
            <div 
              className="rounded-lg overflow-hidden mb-8 relative group cursor-pointer"
              onClick={() => setIsImageModalOpen(true)}
            >
              <img
                src={answer.photo}
                alt="Answer"
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`px-4 ${answer?.upvotedBy?.includes(userData.uid) ? 'text-[#173f67] dark:text-blue-400' : ''}`}
              onClick={handleUpvote}
            >
              <ThumbsUp className={`w-4 h-4 mr-2 ${answer?.upvotedBy?.includes(userData.uid) ? 'fill-current' : ''} dark:text-[#3f7cc6]`} />
              <span className='dark:text-[#3f7cc6]'>Upvote</span>
            </Button>
            <span className="text-base font-semibold text-[#173f67] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
              {answer?.upvotes || 0}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="px-4 dark:text-[#3f7cc6]"
              onClick={handleReply}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              <span>Reply</span>
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        <div ref={commentSectionRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Comments</h2>
          </div>
          <CommentSection answerId={answerId} />
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={answer?.photo}
      />
    </div>
  );
};

export default Answer; 