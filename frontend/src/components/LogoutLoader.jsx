import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LogoutLoader = ({ fullScreen = true }) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen w-screen bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center min-h-[200px] w-full';

  return (
    <div className={containerClass}>
      <DotLottieReact
        src="https://lottie.host/a99995ce-f711-46c6-999c-e26aae727685/Wf5Hh8HBeJ.lottie"
        loop
        autoplay
        style={{ width: 150, height: 150 }}
      />
      <div className="mt-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          See You Again!
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Logging Out...
        </p>
      </div>
    </div>
  );
};

export default LogoutLoader; 