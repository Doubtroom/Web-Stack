import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserPlus } from "lucide-react";

const ProfileCompletionDialog = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCompleteProfile = () => {
    navigate("/complete-profile", {
      state: { returnTo: location.pathname },
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="transform transition-all duration-300 hover:-translate-y-1">
        <div className="bg-white dark:bg-gray-800 p-8 max-w-lg rounded-xl shadow-lg dark:shadow-gray-900/50 hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-300">
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/30">
              <UserPlus
                size={60}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>

            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
              Complete Your Profile
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-center text-lg">
              To access this feature, please complete your profile first. This
              helps us provide you with a better experience.
            </p>

            <button
              onClick={handleCompleteProfile}
              className="mt-4 px-8 py-3 bg-gradient-to-r from-[#1f5986] to-[#114073] text-white rounded-lg 
                                     shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Complete Profile Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionDialog;
