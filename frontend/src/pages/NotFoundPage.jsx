import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Home, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const NotFoundPage = () => {
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
              <BookOpen className="w-24 h-24 text-blue-500 dark:text-blue-400 opacity-20" />
            </motion.div>
          </div>

          <h1 className="text-9xl font-bold text-blue-500 dark:text-blue-400 mb-4">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Looks like this page went on a study break and never came back!
            Don't worry, we've got plenty of other questions to explore.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
