import React from "react";
import { useSelector } from "react-redux";

const Button = ({
  text,
  loadingText,
  onClick,
  variant = "primary",
  fullWidth = false,
  className = "",
  isLoading,
  disabled,
  type,
}) => {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);

  const variants = {
    primary: isDarkMode
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: isDarkMode
      ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
      : "bg-white hover:bg-gray-100 text-gray-800 border border-gray-300",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`py-3 px-4 rounded-md font-medium transition-colors duration-200 
        ${variants[variant]} 
        ${fullWidth ? "w-full" : ""}
        ${className}
        ${isLoading ? (isDarkMode ? "bg-blue-800" : "bg-blue-700") : ""}
        `}
    >
      {isLoading ? loadingText : text}
    </button>
  );
};

export default Button;
