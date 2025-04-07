import React from 'react';
import { useSelector } from 'react-redux';

const Button = ({ 
  children, 
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'md', // sm, md, lg
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: isDarkMode 
      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-lg shadow-blue-500/20' 
      : 'bg-[#173f67] text-white hover:bg-[#1e3c72] focus:ring-[#173f67] shadow-lg shadow-[#173f67]/20',
    secondary: isDarkMode
      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
    outline: isDarkMode
      ? 'bg-transparent text-blue-400 border border-blue-400 hover:bg-blue-400/10 focus:ring-blue-400'
      : 'bg-transparent text-[#173f67] border border-[#173f67] hover:bg-[#173f67]/10 focus:ring-[#173f67]',
    ghost: isDarkMode
      ? 'text-blue-400 hover:bg-blue-400/10 focus:ring-blue-400'
      : 'text-[#173f67] hover:bg-[#173f67]/10 focus:ring-[#173f67]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;