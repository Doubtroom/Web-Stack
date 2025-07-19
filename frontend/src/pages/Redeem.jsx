import React from "react";

const Redeem = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#1a2233] rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-200 mb-2">Redeem Points</h1>
        <p className="text-blue-700 dark:text-blue-300 mb-6 text-center">
          Use your Star Dust Points to unlock rewards, discounts, or special features!
        </p>
        <div className="w-full flex flex-col items-center justify-center gap-4">
          {/* Placeholder for redeem options */}
          <div className="w-full h-32 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-400 dark:text-blue-200 text-lg font-semibold">
            Redeem options coming soon...
          </div>
        </div>
      </div>
    </div>
  );
};

export default Redeem; 