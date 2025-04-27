import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from '../store/darkModeSlice.js';
import { Moon, Sun } from 'lucide-react';

const SliderSwitch = ({classNames}) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);

  const handleToggle = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none ${classNames}`}
    >
      <span
        className={`${
          isDarkMode ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
      />
      <span className="absolute left-1 top-1/2 -translate-y-1/2">
        <Sun className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-yellow-500'}`} />
      </span>
      <span className="absolute right-1 top-1/2 -translate-y-1/2">
        <Moon className={`h-4 w-4 ${isDarkMode ? 'text-blue-500' : 'text-gray-400'}`} />
      </span>
    </button>
  );
};

export default SliderSwitch;
