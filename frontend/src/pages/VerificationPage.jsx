import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, sendOtp, setOtpSent } from "../store/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import LogoutLoader from "../components/LogoutLoader";

const VerificationPrompt = ({ isOpen, onLogout, onVerify }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Account Not Verified
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your account is not verified. Please choose one of the following
              options:
            </p>

            <div className="space-y-3">
              <button
                onClick={onVerify}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Verify with OTP
              </button>
            </div>

            <button
              onClick={onLogout}
              className="mt-4 w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Logout
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const VerificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const [isPromptOpen, setIsPromptOpen] = useState(true);
  const email = useSelector((state) => state.auth.user?.email);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    try {
      if (!email) {
        navigate("/login");
        return;
      }
      setIsLoading(true);
      await dispatch(sendOtp(email)).unwrap();
      setIsPromptOpen(false);
      dispatch(setOtpSent(true));
      navigate("/verify-otp", {
        replace: true,
        state: { email },
      });
    } catch (error) {
      console.error("Failed to send OTP:", error);
    }
  };

  const handleLogout = async () => {
    setIsLoading(false);
    try {
      const result = await dispatch(logout()).unwrap();
      if (result) {
        toast.success("Logged out successfully!");
        navigate("/landing", { state: { fromLogout: true }, replace: true });
      }
    } catch (error) {
      toast.error(error || "Logout failed. Please try again.");
    } finally {
      setIsPromptOpen(false);
    }
  };
  if (isLoading) {
    return <LogoutLoader fullScreen />;
  }
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <VerificationPrompt
        isOpen={isPromptOpen}
        onLogout={handleLogout}
        onVerify={handleVerify}
      />
    </div>
  );
};

export default VerificationPage;
