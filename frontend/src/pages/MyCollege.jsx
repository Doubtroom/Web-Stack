import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MessageSquare } from 'lucide-react';
import DataService from '../firebase/DataService';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import CollegeCard from '../components/CollegeCard';
import { toast } from 'sonner';

const MyCollege = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
    const fetchCollegeQuestions = async () => {
      try {
        const dataService = new DataService('questions');
        const allQuestions = await dataService.getAllDocuments();
        const collegeQuestions = allQuestions.filter(q => q.collegeName === userData.collegeName);
        setQuestions(collegeQuestions);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch college questions. Please try again later.');
        console.error('Error:', err);
        setLoading(false);
      }
    };

    fetchCollegeQuestions();
  }, [userData.collegeName]);


  const formatText = (text) => {
    if (!text) return 'Question';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#173f67] dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-[#173f67] dark:text-white">
              {userData.collegeName || 'Your College'} Questions
            </h1>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/ask-question')}
          >
            Ask New Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No questions from your college yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-3">Be the first to ask a question!</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => navigate('/ask-question')}
            >
              Ask Question
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {questions.map((question) => (
              <CollegeCard
                key={question.id}
                id={question.id}
                collegeName={formatText(question.collegeName) || 'Your College'}
                img={question.photo || 'https://via.placeholder.com/400x200?text=No+Image'}
                branch={formatText(question.branch) || 'Your Branch'}
                collegeYear={question.collegeYear || 'Any Year'}
                topic={formatText(question.topic) || 'General'}
                noOfAnswers={question.answers || 0}
                postedOn={formatTimeAgo(question.createdAt)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCollege;