import React, { useEffect, useState, useCallback, useRef } from "react";
import CollegeCard from "../components/CollegeCard";
import { HelpCircle } from "lucide-react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHomeQuestions } from "../store/dataSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import FilterButton from "../components/FilterButton";
import MobileFilterButton from "../components/MobileFilterButton";
import placeholder from "../assets/placeholder.png";
import Pagination from "../components/Pagination";
import QuestionCardSkeleton from "../components/QuestionCardSkeleton";
import HomeSkeleton from "../components/HomeSkeleton";
import PromotionCard from "../components/PromotionCard";
import promotions from "../config/promotion.config.js";
import { useStreakActivity } from "../hooks/useStreakActivity";

const ITEMS_PER_PAGE = 9;

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const userData = useSelector((state) => state?.auth?.user);
  const { homeQuestions, homePagination, loading } = useSelector(
    (state) => state.data,
  );
  const isMounted = useRef(true);

  // Streak activity hook
  const { triggerStreakUpdate } = useStreakActivity();

  // State management
  const [showMyBranch, setShowMyBranch] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Loading skeleton array
  const loadingSkeletons = Array(ITEMS_PER_PAGE).fill(null);

  // Fetch questions with pagination
  const fetchQuestions = useCallback(
    async (pageNumber) => {
      if (!isMounted.current) return;

      try {
        await dispatch(
          fetchHomeQuestions({
            page: pageNumber,
            limit: ITEMS_PER_PAGE,
            branch: showMyBranch ? userData?.branch : null,
          }),
        ).unwrap();

        if (isMounted.current) {
          setPage(pageNumber);
          setSearchParams({ page: pageNumber.toString() });
          setIsInitialLoad(false);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        if (isMounted.current) {
          toast.error(error?.message || "Failed to fetch questions");
        }
      }
    },
    [dispatch, showMyBranch, userData?.branch, setSearchParams],
  );

  // Set mounted state and handle initial load
  useEffect(() => {
    isMounted.current = true;

    // Handle back navigation
    if (location.state?.fromPage) {
      const params = new URLSearchParams(location.state.fromPage);
      const pageNumber = parseInt(params.get("page")) || 1;
      setPage(pageNumber);
      fetchQuestions(pageNumber);
    } else {
      // Initial load
      const currentPage = parseInt(searchParams.get("page")) || 1;
      fetchQuestions(currentPage);
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle filter changes
  useEffect(() => {
    if (!isInitialLoad) {
      fetchQuestions(1); // Reset to first page when filter changes
    }
  }, [showMyBranch, userData?.branch]);

  // Format branch name for display
  const formatBranchName = (branch) => {
    if (!branch) return "";
    return branch
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Page change handler
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= homePagination.totalPages) {
      window.scrollTo(0, 0);
      fetchQuestions(newPage);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (loading && isInitialLoad) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Ask Question Tab - Desktop */}
      <div className="hidden md:block max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 lg:mt-24">
        <PromotionCard {...promotions[0]} />
      </div>

      {/* Questions Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h1 className="text-2xl sm:text-4xl font-bold text-blue-900 dark:text-blue-300">
              Recent Questions
            </h1>
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
                text={question.text}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {showMyBranch
                  ? `No questions found for ${formatBranchName(userData?.branch)} branch`
                  : "No questions found"}
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

export default Home;
