import React from 'react';
import { useSelector } from 'react-redux';

const FlashCardBlank = ({ children }) => {
  const { isDarkMode } = useSelector((state) => state.darkMode);
  return (
    <div
      className={`w-full h-full rounded-2xl overflow-visible border border-gray-200 dark:border-gray-700 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} transition-all duration-300 `}
    >
      <div className="w-full rounded-2xl p-6 flex flex-col h-full justify-between items-center">
        {children}
      </div>
    </div>
  );
};

export default FlashCardBlank; 