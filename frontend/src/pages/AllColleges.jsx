import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';
import DataService from '../firebase/DataService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'sonner';
import { Building2, Plus } from 'lucide-react';
import Button from '../components/Button';
import FilterButton from '../components/FilterButton';
import placeholder from '../assets/placeholder.png'

const AllCollege = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [showMyBranch, setShowMyBranch] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const formatBranchName = (branch) => {
    if (!branch) return '';
    return branch
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setFilterLoading(true);
        const dataService = new DataService('questions');
        let fetchedQuestions;
        
        if (showMyBranch && userData.branch) {
          fetchedQuestions = await dataService.getQuestionsByBranch(userData.branch);
        } else {
          fetchedQuestions = await dataService.getAllDocuments();
        }
        
        // Sort questions by createdAt timestamp in descending order (newest first)
        const sortedQuestions = fetchedQuestions.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt); // For descending order (newest first)
        });
        
        setQuestions(sortedQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast.error('Failed to fetch questions');
      } finally {
        setLoading(false);
        setFilterLoading(false);
      }
    };

    fetchQuestions();
  }, [showMyBranch, userData.branch]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mt-2 lg:mt-16">
      {/* Questions Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-[#173f67] dark:text-blue-400" />
              <h1 className="text-2xl sm:text-3xl font-bold text-[#173f67] dark:text-white">All College Questions</h1>
            </div>
            {/* Mobile Filter Button */}
            {userData.branch && (
              <div className="sm:hidden">
                <FilterButton
                  isActive={showMyBranch}
                  onClick={() => setShowMyBranch(!showMyBranch)}
                >
                  {showMyBranch ? 'All' : 'My Branch'}
                </FilterButton>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Desktop Filter Button */}
            {userData.branch && (
              <div className="hidden sm:block">
                <FilterButton
                  isActive={showMyBranch}
                  onClick={() => setShowMyBranch(!showMyBranch)}
                >
                  {showMyBranch ? 'Show All Questions' : `Show My Branch Only`}
                </FilterButton>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            questions.map((question) => (
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
            ))
          )}
        </div>
        {questions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {showMyBranch 
                ? `No questions found for ${formatBranchName(userData.branch)} branch`
                : 'No questions found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCollege; 