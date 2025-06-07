import React from 'react';
import QuestionCardSkeleton from './QuestionCardSkeleton';

const ITEMS_PER_PAGE = 9;

const MyCollegeSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:mt-16">
      {/* Questions Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
            </div>
            {/* Mobile Filter Button Skeleton */}
            <div className="sm:hidden">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
            </div>
          </div>
          {/* Desktop Filter Button Skeleton */}
          <div className="hidden sm:block">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse" />
          </div>
        </div>

        {/* Questions Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(ITEMS_PER_PAGE).fill(null).map((_, index) => (
            <QuestionCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyCollegeSkeleton; 