import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const LottieLoader = ({ text = "Loading...", fullScreen = false }) => {
  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen w-screen bg-white/80 dark:bg-gray-900/80"
    : "flex flex-col items-center justify-center min-h-[200px] w-full";

  return (
    <div className={containerClass}>
      <DotLottieReact
        src="https://lottie.host/2a23df32-c867-4c28-a52a-b718d312a58e/1UARaMxa4M.lottie"
        loop
        autoplay
        style={{ width: 120, height: 120 }}
      />
      <span className="mt-4 text-lg text-gray-700 dark:text-gray-200 text-center">
        {text}
      </span>
    </div>
  );
};

export default LottieLoader;
