import React from 'react';
import { useSelector } from 'react-redux';

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 ${
      isDarkMode ? 'border-blue-400' : 'border-blue-800'
    } ${sizeClasses[size]}`}></div>
  );

  if (fullScreen) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner; 