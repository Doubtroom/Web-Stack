import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions } from '../store/dataSlice';
import CollegeCard from '../components/CollegeCard';
import { toast } from 'sonner';
import FilterButton from '../components/FilterButton';
import MobileFilterButton from '../components/MobileFilterButton';
import Pagination from '../components/Pagination';
import placeholder from '../assets/placeholder.png';
import MyCollegeSkeleton from '../components/MyCollegeSkeleton';

const MyCollege = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMyBranch, setShowMyBranch] = useState(false);
  const isMounted = useRef(true);
  const isFetching = useRef(false);
  
  // Get data from Redux store
  const { questions = [], loading, error, pagination } = useSelector((state) => state.data);
  const { user } = useSelector((state) => state.auth);

  const formatBranchName = (branch) => {
    if (!branch) return '';
    return branch
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const fetchCollegeQuestions = useCallback(async (page) => {
    // Prevent multiple simultaneous fetches
    if (isFetching.current) return;
    
    try {
      isFetching.current = true;
      const filters = {
        collegeName: user?.collegeName,
        ...(showMyBranch && user?.branch ? { branch: user.branch } : {}),
        page,
        limit: 9
      };
      
      await dispatch(fetchQuestions(filters)).unwrap();
      // Only update URL if component is still mounted
      if (isMounted.current) {
        setSearchParams({ page: page.toString() });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      if (isMounted.current) {
        toast.error(error || 'Failed to fetch questions');
      }
    } finally {
      isFetching.current = false;
    }
  }, [dispatch, user?.collegeName, user?.branch, showMyBranch, setSearchParams]);

  const handlePageChange = async (page) => {
    window.scrollTo(0, 0);
    await fetchCollegeQuestions(page);
  };

  useEffect(() => {
    if (user?.collegeName) {
      const page = parseInt(searchParams.get('page')) || 1;
      fetchCollegeQuestions(page);
    }

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [user?.collegeName, user?.branch, showMyBranch, fetchCollegeQuestions]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error && isMounted.current) {
      toast.error(error);
    }
  }, [error]);

  const formatText = (text) => {
    if (!text) return 'Question';
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Show skeleton when loading
  if (loading) {
    return <MyCollegeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:mt-16">
      {/* Questions Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 lg:w-8 lg:h-8 text-blue-900 dark:text-blue-300" />
              <h1 className="text-xl sm:text-4xl font-bold text-blue-900 dark:text-blue-300 break-words max-w-[250px] sm:max-w-[400px] md:max-w-[500px]">
                {user?.collegeName || 'Your College'}
              </h1>
            </div>
            {/* Mobile Filter Button */}
            {user?.branch && (
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
          <div className="flex items-center gap-4">
            {/* Desktop Filter Button */}
            {user?.branch && (
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(questions) && questions.length > 0 ? (
            questions.map((question) => (
              <CollegeCard
                key={question._id || question.id}
                id={question._id || question.id}
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
                  ? `No questions found for ${formatBranchName(user?.branch)} branch in ${user?.collegeName}`
                  : `No questions found for ${user?.collegeName}`}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {Array.isArray(questions) && questions.length > 0 && pagination && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default MyCollege;