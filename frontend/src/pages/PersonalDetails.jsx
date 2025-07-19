import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  User,
  Calendar,
  Building2,
  GraduationCap,
  Phone,
  Briefcase,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const PersonalDetails = () => {
  const userProfile = useSelector((state) => state?.auth?.user);
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        if (!userProfile) {
          console.error("User profile not found");
          return;
        }

        setUserData(userProfile);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data", {
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
  }, [userProfile, isDarkMode]);

  const formatBranchName = (branch) => {
    if (!branch) return "";
    return branch
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  return (
    <div
      className={`min-h-screen p-3 sm:p-6 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="max-w-4xl mx-auto mt-12 sm:mt-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/profile")}
            className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-200 text-gray-600"}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-200">
            Personal Details
          </h1>
        </div>

        {/* Personal Details Section */}
        <div className={`rounded-2xl shadow-xl overflow-hidden ${isDarkMode ? "bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50" : "bg-gradient-to-br from-white to-blue-50/50 border border-blue-100"}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-0">
              {/* Email */}
              <div className={`p-6 border-b ${isDarkMode ? "border-gray-700/50" : "border-blue-100"} hover:bg-opacity-50 transition-all duration-200 ${isDarkMode ? "hover:bg-gray-700/30" : "hover:bg-blue-50/50"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-blue-600/20" : "bg-blue-100"}`}>
                    <Mail className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-sm uppercase tracking-wide mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Email Address
                    </h3>
                    <p className={`text-base font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {userData?.email || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* College */}
              <div className={`p-6 border-b ${isDarkMode ? "border-gray-700/50" : "border-blue-100"} hover:bg-opacity-50 transition-all duration-200 ${isDarkMode ? "hover:bg-gray-700/30" : "hover:bg-blue-50/50"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-indigo-600/20" : "bg-indigo-100"}`}>
                    <Building2 className={`w-5 h-5 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-sm uppercase tracking-wide mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Institution
                    </h3>
                    <p className={`text-base font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {userData?.collegeName || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Branch */}
              <div className={`p-6 border-b ${isDarkMode ? "border-gray-700/50" : "border-blue-100"} hover:bg-opacity-50 transition-all duration-200 ${isDarkMode ? "hover:bg-gray-700/30" : "hover:bg-blue-50/50"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-green-600/20" : "bg-green-100"}`}>
                    <GraduationCap className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-sm uppercase tracking-wide mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Academic Branch
                    </h3>
                    <p className={`text-base font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {formatBranchName(userData?.branch) || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className={`p-6 ${isDarkMode ? "lg:border-r lg:border-gray-700/50" : "lg:border-r lg:border-blue-100"} hover:bg-opacity-50 transition-all duration-200 ${isDarkMode ? "hover:bg-gray-700/30" : "hover:bg-blue-50/50"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-purple-600/20" : "bg-purple-100"}`}>
                    <Briefcase className={`w-5 h-5 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-sm uppercase tracking-wide mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Professional Role
                    </h3>
                    <p className={`text-base font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {userData?.role || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-0">
              {/* Study Type */}
              <div className={`p-6 border-b ${isDarkMode ? "border-gray-700/50" : "border-blue-100"} hover:bg-opacity-50 transition-all duration-200 ${isDarkMode ? "hover:bg-gray-700/30" : "hover:bg-blue-50/50"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-teal-600/20" : "bg-teal-100"}`}>
                    <GraduationCap className={`w-5 h-5 ${isDarkMode ? "text-teal-400" : "text-teal-600"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-sm uppercase tracking-wide mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Study Type
                    </h3>
                    <p className={`text-base font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {userData?.studyType || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className={`p-6 border-b ${isDarkMode ? "border-gray-700/50" : "border-blue-100"} hover:bg-opacity-50 transition-all duration-200 ${isDarkMode ? "hover:bg-gray-700/30" : "hover:bg-blue-50/50"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-orange-600/20" : "bg-orange-100"}`}>
                    <Phone className={`w-5 h-5 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-sm uppercase tracking-wide mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Contact Number
                    </h3>
                    <p className={`text-base font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {userData?.phone || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gender */}
              <div className={`p-6 border-b ${isDarkMode ? "border-gray-700/50" : "border-blue-100"} hover:bg-opacity-50 transition-all duration-200 ${isDarkMode ? "hover:bg-gray-700/30" : "hover:bg-blue-50/50"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-pink-600/20" : "bg-pink-100"}`}>
                    <User className={`w-5 h-5 ${isDarkMode ? "text-pink-400" : "text-pink-600"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-sm uppercase tracking-wide mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Gender
                    </h3>
                    <p className={`text-base font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {userData?.gender || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div className={`p-6 hover:bg-opacity-50 transition-all duration-200 ${isDarkMode ? "hover:bg-gray-700/30" : "hover:bg-blue-50/50"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-red-600/20" : "bg-red-100"}`}>
                    <Calendar className={`w-5 h-5 ${isDarkMode ? "text-red-400" : "text-red-600"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-sm uppercase tracking-wide mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Date of Birth
                    </h3>
                    <p className={`text-base font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {formatDate(userData?.dob) || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails; 