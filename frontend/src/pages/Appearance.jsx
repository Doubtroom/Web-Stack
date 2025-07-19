import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SunMoon , ArrowLeft } from "lucide-react";
import SliderSwitch from "../components/SliderSwitch";
import ProfileTab from "../components/ProfileTab";

const Appearance = () => {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen p-3 sm:p-6 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-2xl mx-auto mt-12 sm:mt-20">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/profile")}
            className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-200 text-gray-600"}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-200">
            Appearance
          </h1>
        </div>
        <ProfileTab
          icon={<SunMoon  className="w-6 h-6 text-blue-700 dark:text-blue-200" />}
          title="Theme"
          description="Toggle between light and dark themes for a comfortable viewing experience."
          rightContent={
            <div className="flex flex-col items-center gap-1">
              <SliderSwitch />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-200">{isDarkMode ? 'Dark' : 'Light'}</span>
            </div>
          }
          rounded="rounded-xl"
        />
      </div>
    </div>
  );
};

export default Appearance; 