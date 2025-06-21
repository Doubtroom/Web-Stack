import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';
import { Building2 } from 'lucide-react';
import FilterButton from '../components/FilterButton';
import MobileFilterButton from '../components/MobileFilterButton';
import placeholder from '../assets/placeholder.png';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHomeQuestions } from '../store/dataSlice';
import QuestionCardSkeleton from '../components/QuestionCardSkeleton';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 9;

const AllCollege = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const userData = useSelector((state) => state?.auth?.user);
  const { homeQuestions, homePagination, loading } = useSelector((state) => state.data);
  const isMounted = useRef(true);

  const [showMyBranch, setShowMyBranch] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loadingSkeletons = Array(ITEMS_PER_PAGE).fill(null);

  const fetchQuestions = useCallback(async (pageNumber) => {
    if (!isMounted.current) return;
    try {
      await dispatch(fetchHomeQuestions({
        page: pageNumber,
        limit: ITEMS_PER_PAGE,
        branch: showMyBranch ? userData?.branch : null
      })).unwrap();
      if (isMounted.current) {
        setPage(pageNumber);
        setSearchParams({ page: pageNumber.toString() });
        setIsInitialLoad(false);
      }
    } catch (error) {
      // Optionally handle error
    }
  }, [dispatch, showMyBranch, userData?.branch, setSearchParams]);

  useEffect(() => {
    isMounted.current = true;
    const currentPage = parseInt(searchParams.get('page')) || 1;
    fetchQuestions(currentPage);
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      fetchQuestions(1); // Reset to first page when filter changes
    }
    // eslint-disable-next-line
  }, [showMyBranch, userData?.branch]);

  const formatBranchName = (branch) => {
    if (!branch) return '';
    return branch
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= homePagination.totalPages) {
      window.scrollTo(0, 0);
      fetchQuestions(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mt-2 lg:mt-16">
      {/* Questions Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 lg:w-8 lg:h-8 text-blue-900 dark:text-blue-300" />
              <h1 className="text-xl sm:text-4xl font-bold text-blue-900 dark:text-blue-300">All Colleges</h1>
            </div>
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
          <div className="flex items-center gap-4">
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            loadingSkeletons.map((_, index) => (
              <QuestionCardSkeleton key={index} />
            ))
          ) : homeQuestions && homeQuestions.length > 0 ? (
            homeQuestions.map((question) => (
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
        {homeQuestions && homeQuestions.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={homePagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default AllCollege; 