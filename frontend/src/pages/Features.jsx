import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Layers, ArrowLeft } from "lucide-react";
import { Switch } from "antd";
import { toast } from "sonner";
import { userServices } from "../services/data.services";
import ProfileTab from "../components/ProfileTab";

const Features = () => {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const features = useSelector((state) => state.auth.user?.features || { flashcards: true });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFeatureToggle = async (feature) => {
    const newFeatures = { ...features, [feature]: !features[feature] };
    try {
      await userServices.updateFeatures(newFeatures);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update features", {
        style: {
          background: isDarkMode ? "#1f2937" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#000000"
        }
      });
    }
  };

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
            Features
          </h1>
        </div>
        <ProfileTab
          icon={<Layers className="w-6 h-6 text-blue-700 dark:text-blue-200" />}
          title="FlashCards"
          description="Active recall and spaced repetition for better learning"
          rightContent={
            <div className="flex items-center gap-4 mt-2">
              <Switch
                checked={features.flashcards}
                onChange={() => handleFeatureToggle("flashcards")}
                className={isDarkMode ? "bg-blue-900" : "bg-blue-200"}
              />
            </div>
          }
          rounded="rounded-xl"
        />
      </div>
    </div>
  );
};

export default Features; 