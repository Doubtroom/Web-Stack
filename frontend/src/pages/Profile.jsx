import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  Settings,
  Award,
  BarChart3,
  Paintbrush,
  Bolt
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { userServices } from "../services/data.services";
import LogoutLoader from "../components/LogoutLoader";
import ProfileTab from "../components/ProfileTab";

const Profile = () => {
  const userProfile = useSelector((state) => state?.auth?.user);
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    branch: "",
    studyType: "",
    phone: "",
    gender: "",
    role: "",
    collegeName: "",
    dob: "",
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [features, setFeatures] = useState(
    userProfile?.features || { flashcards: true },
  );

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        if (!userProfile) {
          console.error("User profile not found");
          return;
        }

        setUserData(userProfile);
        setFormData({
          name: userProfile.displayName || "",
          branch: userProfile.branch || "",
          studyType: userProfile.studyType || "",
          phone: userProfile.phone || "",
          gender: userProfile.gender || "",
          role: userProfile.role || "",
          collegeName: userProfile.collegeName || "",
          email: userProfile.email || "",
          dob: userProfile.dob || "",
        });
        setFeatures(userProfile?.features || { flashcards: true });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data",{
          style: { 
            background: isDarkMode ? "#1f2937" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "#000000"
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userProfile]);

  const handleLogoutConfirm = async () => {
    setLoading2(true);
    try {
      const result = await dispatch(logout()).unwrap();
      if (result) {
        toast.success("Logged out successfully!",{
          style: { 
            background: isDarkMode ? "#1f2937" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "#000000"
          }
        });
        navigate("/landing", { state: { fromLogout: true }, replace: true });
      }
    } catch (error) {
      toast.error(error || "Logout failed. Please try again.",{
        style: { 
          background: isDarkMode ? "#1f2937" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#000000"
        }
      });
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleFeatureToggle = async (feature) => {
    const newFeatures = { ...features, [feature]: !features[feature] };
    setFeatures(newFeatures);
    try {
      await userServices.updateFeatures(newFeatures);
      // If turning off the feature, reload the window
      window.location.reload();
      // Optionally show a toast for success
    } catch (error) {
      setFeatures(features); // revert
      toast.error("Failed to update features",{
        style: { 
          background: isDarkMode ? "#1f2937" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#000000"
        }
      });
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (loading2) {
    return <LogoutLoader />;
  }

  return (
    <div
      className={`min-h-screen p-3 sm:p-6 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleLogoutCancel}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl`}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Confirm Logout
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleLogoutCancel}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-4xl mx-auto mt-12 sm:mt-20">
        {/* Profile Header */}
        <div
          className={`rounded-t-xl shadow-lg p-4 sm:p-8 ${isDarkMode ? "bg-gradient-to-r from-[#14345c] to-[#0a1a33]" : "bg-gradient-to-r from-[#1e6eab] to-[#02254b]"} text-white relative`}
        >
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-2">
            <button
              onClick={() => {
                setShowLogoutConfirm(true);
              }}
              className="hidden sm:flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-red-700/60 hover:bg-red-500/60 transition-all text-sm sm:text-base text-white hover:text-white"
            >
              <span>Logout</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 mt-8 sm:mt-0">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {userData?.displayName || "Your Name"}
              </h1>
              <p className="text-white/80 text-sm sm:text-base">
                {userData?.role || "Role"}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <h2 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-200 mt-10 mb-4 sm:mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Bolt className="w-5 h-5 text-white" />
          </div>
          <span>Settings</span>
        </h2>
        
        <div className={`rounded-2xl shadow-xl overflow-hidden border border-blue-100 dark:border-blue-900/30 ${isDarkMode ? "bg-gradient-to-br from-gray-800/80 to-gray-900/80" : "bg-gradient-to-br from-white to-blue-50/50"}`}>
          <div className="space-y-0">
            <ProfileTab
              icon={<Paintbrush className="w-6 h-6 text-blue-700 dark:text-blue-200" />}
              title="Appearance"
              description="Customize the look and feel of your experience."
              onClick={() => navigate("/profile/appearance")}
              rounded="rounded-t-xl"
              borderBottom={true}
            />
            <ProfileTab
              icon={<Award className="w-6 h-6 text-blue-700 dark:text-blue-200" />}
              title="Features"
              description="Enable or disable platform features."
              onClick={() => navigate("/profile/features")}
              borderBottom={true}
            />
            <ProfileTab
              icon={<User className="w-6 h-6 text-blue-700 dark:text-blue-200" />}
              title="Personal Details"
              description="Manage your profile information and preferences"
              onClick={() => navigate("/profile/personal-details")}
              rounded="rounded-b-xl"
              borderBottom={false}
            />

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
