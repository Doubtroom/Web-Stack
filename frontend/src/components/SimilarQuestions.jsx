import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, MessageCircle } from "lucide-react";

// Shown on the Ask Question page while the user types: semantically similar
// questions that already exist, so they can read an answer instead of
// re-asking. Purely additive — renders nothing when there are no matches.
const SimilarQuestions = ({ suggestions, isDarkMode }) => {
  return (
    <AnimatePresence>
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className={`rounded-lg border overflow-hidden ${
            isDarkMode
              ? "border-indigo-800 bg-indigo-950/40"
              : "border-blue-200 bg-blue-50"
          }`}
        >
          <div
            className={`flex items-center gap-2 px-4 pt-3 pb-2 text-sm font-semibold ${
              isDarkMode ? "text-blue-300" : "text-[#1a365d]"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Your doubt may already be answered
          </div>
          <ul>
            {suggestions.map((s) => (
              <li key={s._id}>
                <Link
                  to={`/question/${s._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block px-4 py-2.5 transition-colors ${
                    isDarkMode
                      ? "hover:bg-indigo-900/40 text-gray-200"
                      : "hover:bg-blue-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm line-clamp-2">{s.text}</p>
                  <p
                    className={`flex items-center gap-3 text-xs mt-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <span>{s.topic}</span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {s.noOfAnswers}{" "}
                      {s.noOfAnswers === 1 ? "answer" : "answers"}
                    </span>
                    {typeof s.score === "number" && (
                      <span>{Math.round(s.score * 100)}% match</span>
                    )}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimilarQuestions;
