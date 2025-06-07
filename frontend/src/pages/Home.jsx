import React, { useEffect, useState } from 'react'
import CollegeCard from '../components/CollegeCard'
import { HelpCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { questionServices } from '../services/data.services'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'sonner'
import FilterButton from '../components/FilterButton'
import MobileFilterButton from '../components/MobileFilterButton'
import placeholder from '../assets/placeholder.png'
import { useSelector } from 'react-redux'
import Pagination from '../components/Pagination'
import QuestionCardSkeleton from '../components/QuestionCardSkeleton'
import HomeSkeleton from '../components/HomeSkeleton'

const ITEMS_PER_PAGE = 9;

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const userData = useSelector((state) => state?.auth?.user);
  
  // State management
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [showMyBranch, setShowMyBranch] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);

  // Loading skeleton array
  const loadingSkeletons = Array(ITEMS_PER_PAGE).fill(null);

  // Handle back navigation
  useEffect(() => {
    if (location.state?.fromPage) {
      const params = new URLSearchParams(location.state.fromPage);
      const pageNumber = parseInt(params.get('page')) || 1;
      setPage(pageNumber);
      fetchQuestions(pageNumber);
    }
  }, [location.state]);

  // Format branch name for display
  const formatBranchName = (branch) => {
    if (!branch) return '';
    return branch
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Fetch questions with pagination
  const fetchQuestions = async (pageNumber) => {
    try {
      setFilterLoading(true);
      const queryParams = {
        page: pageNumber,
        limit: ITEMS_PER_PAGE
      };

      let response;
      if (showMyBranch && userData?.branch) {
        response = await questionServices.getFilteredQuestions({
          page: pageNumber,
          limit: ITEMS_PER_PAGE,
          branch: userData.branch
        });
      } else {
        response = await questionServices.getAllQuestions({
          page: pageNumber,
          limit: ITEMS_PER_PAGE
        });
      }

      if (response?.data) {
        const { questions: fetchedQuestions, pagination } = response.data;
        setQuestions(fetchedQuestions || []);
        setTotalPages(pagination.totalPages);
        setPage(pageNumber);
        // Update URL with current page
        setSearchParams({ page: pageNumber.toString() });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  // Initial load and filter change handler
  useEffect(() => {
    const currentPage = parseInt(searchParams.get('page')) || 1;
    fetchQuestions(currentPage);
  }, [showMyBranch, userData?.branch]);

  // Page change handler
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      window.scrollTo(0, 0);
      fetchQuestions(newPage);
    }
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

  const formatText = (text) => {
    if (!text) return 'Question';
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Ask Question Tab - Desktop */}
      <div className="hidden md:block max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 lg:mt-24">
        <Link to='/ask-question'>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
                  <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Have a doubt?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get help from the community</p>
                </div>
              </div>
              <div className='bg-gradient-to-r from-[#1f5986] to-[#114073] dark:bg-blue-400 rounded-lg p-3'>
                <div className="text-white font-medium flex items-center gap-2">
                  Ask Question
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Questions Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h1 className="text-2xl sm:text-4xl font-bold text-blue-900 dark:text-blue-300">Recent Questions</h1>
            {/* Mobile Filter Button */}
            {userData?.branch && (
              <div className="sm:hidden">
                <MobileFilterButton
                  isActive={showMyBranch}
                  onClick={() => setShowMyBranch(!showMyBranch)}
                  activeText="Show My Branch Only"
                  inactiveText="Show All Questions"
                />
              </div>
            )}
          </div>
          {/* Desktop Filter Button */}
          {userData?.branch && (
            <div className="hidden sm:block">
              <FilterButton
                isActive={showMyBranch}
                onClick={() => setShowMyBranch(!showMyBranch)}
                activeText="Show My Branch Only"
                inactiveText="Show All Questions"
              />
            </div>
          )}
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterLoading ? (
            loadingSkeletons.map((_, index) => (
              <QuestionCardSkeleton key={index} />
            ))
          ) : questions.length > 0 ? (
            questions.map((question) => (
              <CollegeCard
                key={question._id}
                id={question._id}
                collegeName={question.collegeName}
                img={question.photoUrl || placeholder}
                branch={question.branch}
                topic={question.topic}
                noOfAnswers={question.noOfAnswers || 0}
                postedOn={question.createdAt}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {showMyBranch 
                  ? `No questions found for ${formatBranchName(userData?.branch)} branch`
                  : 'No questions found'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {questions.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Home;