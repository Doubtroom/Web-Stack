import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, HelpCircle, Edit2, Trash2, ThumbsUp, Clock, BookOpen, ChevronRight } from 'lucide-react';
import DataService from '../firebase/DataService';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import Card from '../components/Card';
import { toast } from 'sonner';
import placeholder from '../assets/placeholder.png';

const MyQuestions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
    const fetchUserContent = async () => {
      try {
        const dataService = new DataService('questions');
        const answersService = new DataService('answers');
        
        // Fetch questions
        const allQuestions = await dataService.getAllDocuments();
        const userQuestions = allQuestions.filter(q => q.postedBy === userData.uid);
        setQuestions(userQuestions);

        // Fetch answers using the new query function
        const userAnswers = await answersService.getAnswersByUserId(userData.uid);
        
        // Fetch question details for each answer
        const answersWithQuestions = await Promise.all(
          userAnswers.map(async (answer) => {
            const questionData = await dataService.getDocumentById(answer.questionId);
            return {
              ...answer,
              question: questionData
            };
          })
        );
        
        setAnswers(answersWithQuestions);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch your content. Please try again later.');
        console.error('Error:', err);
        setLoading(false);
      }
    };

    fetchUserContent();
  }, [userData.uid]);

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

  const handleDeleteQuestion = async (questionId, photoUrl) => {
    try {
      if (window.confirm('Are you sure you want to delete this question?')) {
        const dataService = new DataService('questions');
        
        // Delete the photo from storage if it exists
        if (photoUrl) {
          const fileId = photoUrl.split('/').pop();
          await dataService.deleteImage(fileId);
        }

        // Delete the question document
        await dataService.deleteDocument(questionId);
        
        // Update local state
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        toast.success('Question deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question. Please try again.');
    }
  };

  const handleDeleteAnswer = async (answerId, photoUrl) => {
    try {
      if (window.confirm('Are you sure you want to delete this answer?')) {
        const dataService = new DataService('answers');
        
        // Delete the photo from storage if it exists
        if (photoUrl) {
          const fileId = photoUrl.split('/').pop();
          await dataService.deleteImage(fileId);
        }

        // Delete the answer document
        await dataService.deleteDocument(answerId);
        
        // Update local state
        setAnswers(prev => prev.filter(a => a.id !== answerId));
        toast.success('Answer deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting answer:', error);
      toast.error('Failed to delete answer. Please try again.');
    }
  };

  const handleEditAnswer = (answerId) => {
    navigate(`/answer/${answerId}/edit`);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 dark:text-blue-300 mb-2">My Content</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Manage your questions and answers</p>
        </div>

        {/* My Answers Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">My Answers</h2>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {answers.length} {answers.length === 1 ? 'answer' : 'answers'}
            </div>
          </div>

          {answers.length === 0 ? (
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
              {answers.map((answer) => (
                <Card
                  key={answer.id}
                  id={answer.questionId}
                  answerId={answer.id}
                  type="answer"
                  collegeName={answer.question?.collegeName || 'Unknown College'}
                  img={answer.photo || answer.question?.photo || placeholder}
                  branch={answer.question?.branch || 'Unknown Branch'}
                  topic={answer.question?.text || 'Question not found'}
                  noOfAnswers={answer.upvotes || 0}
                  postedOn={formatTimeAgo(answer.createdAt)}
                  postedBy={answer.userId}
                  showAnswerButton={false}
                  onDelete={() => handleDeleteAnswer(answer.id, answer.photo)}
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
              {questions.length} {questions.length === 1 ? 'question' : 'questions'}
            </div>
          </div>

          {questions.length === 0 ? (
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
              {questions.map((question) => (
                <Card
                  key={question.id}
                  id={question.id}
                  collegeName={formatText(question.collegeName) || 'Your College'}
                  img={question.photo || placeholder}
                  branch={formatText(question.branch) || 'Your Branch'}
                  collegeYear={question.collegeYear || 'Any Year'}
                  topic={formatText(question.topic) || 'General'}
                  noOfAnswers={question.answers || 0}
                  postedOn={formatTimeAgo(question.createdAt)}
                  postedBy={question.postedBy}
                  showAnswerButton={false}
                  onDelete={handleDeleteQuestion}
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