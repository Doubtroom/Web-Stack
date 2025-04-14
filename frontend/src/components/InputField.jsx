import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';

const InputField = ({ type, placeholder, icon, value, onChange, disabled, id, label, error, style, onBlur }) => {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const [showPassword, setShowPassword] = useState(false);

  const handlePaste = (e) => {
    if (type === 'password') {
      e.preventDefault();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-2 mb-4">
      <label 
        htmlFor={id} 
        className={`block text-sm font-medium ${
          isDarkMode ? 'text-gray-200' : 'text-gray-900'
        }`}
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {icon}
          </div>
        )}
        <input
          style={style}
          id={id}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          className={`w-full p-3 pl-10 ${type === 'password' ? 'pr-10' : ''} border rounded-md focus:outline-none focus:ring-2 focus:ring-[#173f67] ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onBlur={onBlur}
          onPaste={handlePaste}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
            }`}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs animate-slide-down">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
