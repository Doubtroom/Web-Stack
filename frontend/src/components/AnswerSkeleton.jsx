import React from "react";

const AnswerSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700" />

      {/* Content Skeleton */}
      <div className="p-4">
        {/* Question Topic Skeleton */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />

        {/* College Name Skeleton */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />

        {/* Branch Skeleton */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />

        {/* Bottom Info Skeleton */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
    </div>
  );
};

export default AnswerSkeleton;
