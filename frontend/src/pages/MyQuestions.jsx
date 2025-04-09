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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pt-24">
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">My Content</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your questions and answers</p>
        </div>

        {/* My Answers Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-md">
                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">My Answers</h2>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {answers.length} {answers.length === 1 ? 'answer' : 'answers'}
            </div>
          </div>

          {answers.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
              <div className="bg-gray-100 dark:bg-gray-700/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-base font-medium text-gray-800 dark:text-white mb-1">No answers yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">You haven't answered any questions yet</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/home')}
              >
                Browse Questions
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                />
              ))}
            </div>
          )}
        </div>

        {/* My Questions Section */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-md">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">My Questions</h2>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {questions.length} {questions.length === 1 ? 'question' : 'questions'}
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
              <div className="bg-gray-100 dark:bg-gray-700/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-base font-medium text-gray-800 dark:text-white mb-1">No questions yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">You haven't asked any questions yet</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/ask-question')}
              >
                Ask Question
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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