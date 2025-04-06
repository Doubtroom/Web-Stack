import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, MessageSquare, Plus, Filter } from 'lucide-react';
import DataService from '../firebase/DataService';
import Button from '../components/Button';
import CollegeCard from '../components/CollegeCard';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingSpinner';
import placeholder from '../../public/placeholder.png'

const MyCollege = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMyBranch, setShowMyBranch] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const dataService = new DataService('questions');
        let fetchedQuestions;
        
        if (showMyBranch && userData.branch) {
          fetchedQuestions = await dataService.getQuestionsByBranch(userData.branch);
        } else {
          fetchedQuestions = await dataService.getAllDocuments();
        }
        
        // Filter questions for the user's college
        const collegeQuestions = fetchedQuestions.filter(
          question => question.collegeName === userData.collegeName
        );
        
        // Sort questions by createdAt timestamp in descending order (newest first)
        const sortedQuestions = collegeQuestions.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt); // For descending order (newest first)
        });
        
        setQuestions(sortedQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast.error('Failed to fetch questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [showMyBranch, userData.branch, userData.collegeName]);

  const formatText = (text) => {
    if (!text) return 'Question';
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const QuestionSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 ">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
        </div>
      </div>

      <div className="relative">
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
      </div>

      <div className="p-5">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:mt-16">
      {/* Questions Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#173f67] dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-[#173f67] dark:text-white break-words max-w-[300px] sm:max-w-[400px] md:max-w-[500px]">
              {userData.collegeName || 'Your College'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/ask-question')}
              className="flex items-center gap-2 text-white transition-all duration-300 ease-in-out"
            >
              <Plus className="w-4 h-4" />
              Ask a Question
            </Button>
            {userData.branch && (
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm transition-all duration-300 ease-in-out hover:shadow-md">
                <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <Button
                  variant="outline"
                  onClick={() => setShowMyBranch(!showMyBranch)}
                  className={`flex items-center gap-2 transition-all duration-300 ease-in-out min-w-[160px] justify-center ${
                    showMyBranch 
                      ? 'text-black border-blue-600 dark:text-white dark:bg-gray-800 transform scale-105' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {showMyBranch ? 'Show All' : `Show My Branch Only`}
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questions.map((question) => (
            <CollegeCard
              key={question.id}
              id={question.id}
              collegeName={question.collegeName}
              img={question.photo || placeholder}
              branch={question.branch}
              topic={question.topic}
              noOfAnswers={question.noOfAnswers || 0}
              postedOn={question.createdAt}
            />
          ))}
        </div>
        {questions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {showMyBranch 
                ? `No questions found for ${userData.branch} branch in ${userData.collegeName}`
                : `No questions found for ${userData.collegeName}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCollege;