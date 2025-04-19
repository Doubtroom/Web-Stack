import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Clock, Maximize2, Edit2, Trash2, MoreVertical } from 'lucide-react';
import DataService from '../firebase/DataService';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { toast } from 'sonner';
import ConfirmationDialog from '../components/ConfirmationDialog';
import ImageModal from '../components/ImageModal';

const Question = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
    const fetchQuestionAndAnswers = async () => {
      try {
        const dataService = new DataService('questions');
        const questionData = await dataService.getDocumentById(id);
        setQuestion(questionData);
        const answersData = await dataService.getAnswersByQuestionId(id);
        setAnswers(answersData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch question details. Please try again later.');
        console.error('Error:', err);
        setLoading(false);
      }
    };

    fetchQuestionAndAnswers();
  }, [id]);

  const formatBranchName = (branch) => {
    if (!branch) return '';
    return branch
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleDelete = async () => {
    try {
      const dataService = new DataService('questions');
      

      if (question.photo || question.photoId) {
        await dataService.deleteImage(question.photoId);
      }

      const answersService = new DataService('answers');
      const answers = await answersService.getAnswersByQuestionId(id);
      
      for (const answer of answers) {
        if (answer.photo && !answer.photo.startsWith('data:') && !answer.photo.includes('placeholder')) {
          await answersService.deleteImage(answer.photo);
        }
        await answersService.deleteDocument(answer.id);
      }

      await dataService.deleteDocument(id);
      
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

  const handleUpvote = async (answerId, currentUpvotes, upvotedBy) => {
    try {
      const dataService = new DataService('answers');
      const userId = userData.uid;
      
      if (!userId) {
        toast.error('Please login to upvote');
        return;
      }

      // Ensure upvotedBy is an array
      const currentUpvotedBy = Array.isArray(upvotedBy) ? upvotedBy : [];
      const hasUpvoted = currentUpvotedBy.includes(userId);
      const newUpvotes = hasUpvoted ? currentUpvotes - 1 : currentUpvotes + 1;
      
      // Update the upvotedBy array
      const newUpvotedBy = hasUpvoted 
        ? currentUpvotedBy.filter(id => id !== userId)
        : [...currentUpvotedBy, userId];

      // Update the document in Firestore
      await dataService.updateDocument(answerId, {
        upvotes: newUpvotes,
        upvotedBy: newUpvotedBy
      });

      // Update local state
      setAnswers(prevAnswers => 
        prevAnswers.map(answer => 
          answer.id === answerId 
            ? { ...answer, upvotes: newUpvotes, upvotedBy: newUpvotedBy }
            : answer
        )
      );

      toast.success(hasUpvoted ? 'Upvote removed' : 'Answer upvoted!');
    } catch (error) {
      console.error('Error updating upvote:', error);
      toast.error('Failed to update upvote. Please try again.');
    }
  };

  const handleReply = (answerId) => {
    navigate(`/question/${id}/answer/${answerId}?scroll=comments`);
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

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mt-10 lg:mt-28 justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Question Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The question you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400 text-center">
          <p className="text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const isQuestionOwner = question?.postedBy === userData.uid;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Question Section */}
      <div className="w-full max-w-4xl mx-auto pt-2  lg:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-8 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-[#173f67] dark:text-blue-400 font-bold text-xl">{question?.collegeName}</h2>
                  <span className="text-gray-400 dark:text-gray-500">•</span>
                  <span className="text-gray-600 dark:text-gray-300">{formatBranchName(question?.branch)}</span>
                </div>
                <div className="mt-6">
                  <h1 className="text-3xl font-light text-gray-800 dark:text-white tracking-wide leading-relaxed">{question?.text}</h1>
                  <div className="w-24 h-0.5 bg-[#173f67] dark:bg-blue-400 mt-4 opacity-50"></div>
                </div>
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
                {formatTimeAgo(question?.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {question?.noOfAnswers || 0} answers
              </span>
            </div>
            {question?.photo && (
              <div className="mt-6 rounded-lg overflow-hidden cursor-pointer group relative" onClick={() => setSelectedImage(question.photo)}>
                <img
                  src={question.photo}
                  alt="Question"
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Maximize2 className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Answers Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Answers ({answers.length})</h2>
            <Button 
              onClick={() => {
                if (!id) {
                  toast.error('Invalid question ID');
                  return;
                }
                navigate(`/question/${id}/answer`);
              }}
              variant="primary"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              <span>Answer</span>
            </Button>
          </div>
          {answers.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No answers yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-3">Be the first to answer this question!</p>
            </div>
          ) : (
            <div className="space-y-8 flex flex-col gap-10">
              {answers.map((answer, index) => (
                <div 
                  key={answer.id} 
                  className="group bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-600 flex flex-col relative"
                  onClick={() => navigate(`/question/${id}/answer/${answer.id}`)}
                >
                  {/* Answer Number */}
                  <div className="absolute -left-3 -top-3 w-6 h-6 bg-blue-800 dark:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {userData.role === 'faculty' ?answer.userName:'Anonymous'}
                          </h3>
                          {userData.role === 'faculty' && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                              Faculty
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatTimeAgo(answer.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{answer.text}</p>
                    {answer.photo && (
                      <div 
                        className="mt-4 rounded-lg overflow-hidden w-full h-32 relative group cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(answer.photo);
                        }}
                      >
                        <img
                          src={answer.photo}
                          alt="Answer"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <Maximize2 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`px-3 ${answer.upvotedBy?.includes(userData.uid) ? 'text-[#173f67] dark:text-blue-400' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpvote(answer.id, answer.upvotes || 0, answer.upvotedBy || []);
                        }}
                      >
                        <ThumbsUp className={`w-4 h-4 mr-1 ${answer.upvotedBy?.includes(userData.uid) ? 'fill-current' : ''} dark:text-[#3f7cc6]`} />
                        <span className='dark:text-[#3f7cc6]'>Upvote</span>
                      </Button>
                      <span className="text-base font-semibold text-[#173f67] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                        {answer.upvotes || 0}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-3 dark:text-[#3f7cc6]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReply(answer.id);
                      }}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              ))}
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

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage}
      />
    </div>
  );
};

export default Question;