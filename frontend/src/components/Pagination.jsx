import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${
            currentPage === i
              ? "bg-gradient-to-r from-[#1f5986] to-[#114073] dark:from-[#2d7cb8] dark:to-[#1a5c9e] text-white shadow-lg"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:scale-105 hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-blue-900/20"
          }`}
        >
          {i}
        </button>,
      );
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            currentPage > 1
              ? "bg-gradient-to-r from-[#1f5986] to-[#114073] dark:from-[#2d7cb8] dark:to-[#1a5c9e] text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900/30"
              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <div className="hidden sm:flex items-center gap-2">
          {renderPageNumbers()}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            currentPage < totalPages
              ? "bg-gradient-to-r from-[#1f5986] to-[#114073] dark:from-[#2d7cb8] dark:to-[#1a5c9e] text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900/30"
              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <span className="text-sm text-gray-600 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
};

export default Pagination;
