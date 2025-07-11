import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// import { useSelector } from 'react-redux';
// const sizeClasses = {
//   sm: 'h-8 w-8',
//   md: 'h-12 w-12',
//   lg: 'h-16 w-16'
// };
// const spinner = (
//   <div className={`animate-spin rounded-full border-t-2 border-b-2 ${
//     isDarkMode ? 'border-blue-400' : 'border-blue-800'
//   } ${sizeClasses[size]}`}></div>
// );

const LoadingSpinner = ({ fullScreen = false }) => {
  const lottie = (
    <DotLottieReact
      src="https://lottie.host/a2e8d958-3f6f-4e2f-9a3b-774713b99f8b/YfnrKYEHwJ.lottie"
      loop
      autoplay
      style={{ width: 250, height: 250 }}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        {lottie}
      </div>
    );
  }

  return lottie;
};

export default LoadingSpinner;
