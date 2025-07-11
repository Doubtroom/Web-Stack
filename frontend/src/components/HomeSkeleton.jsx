import React from "react";
import QuestionCardSkeleton from "./QuestionCardSkeleton";

const ITEMS_PER_PAGE = 9;

const HomeSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Ask Question Tab Skeleton - Desktop */}
      <div className="hidden md:block max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 lg:mt-24">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                </div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Section Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
        </div>

        {/* Questions Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(ITEMS_PER_PAGE)
            .fill(null)
            .map((_, index) => (
              <QuestionCardSkeleton key={index} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default HomeSkeleton;
