import React from "react";
import { Link } from "react-router-dom";
import { Lock, LogIn } from "lucide-react";
import { motion } from "framer-motion";

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Lock className="w-24 h-24 text-red-500 dark:text-red-400 opacity-20" />
            </motion.div>
          </div>

          <h1 className="text-9xl font-bold text-red-500 dark:text-red-400 mb-4">
            401
          </h1>
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
            Unauthorized Access
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            You do not have permission to view this page or your session has expired.<br />
            Please log in to continue.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Go to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 