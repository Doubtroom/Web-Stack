import React from 'react';

const Button = ({ text,loadingText, onClick, variant = "primary", fullWidth = false, className = "",isLoading,disabled,type }) => {
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-white hover:bg-gray-100 text-gray-800 border border-gray-300",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`py-3 px-4 rounded-md font-medium transition-colors duration-200 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''}
        ${className}
        ${isLoading?"bg-blue-700":""}
        `}
    >
      {isLoading?loadingText:text}
    </button>
  );
};

export default Button