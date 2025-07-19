import React from "react";
import { Sparkles } from "lucide-react";

const reasonMap = {
  postQuestions: "Posted a question",
  postAnswers: "Answered a question",
  deleteQuestions: "Deleted a question",
  deleteAnswers: "Deleted an answer",
  login: "Daily login",
  upvote: "Received an upvote",
  lostUpvote: "Lost an upvote",
  // ...add more as needed
};

const SpaceToast = ({ amount, action }) => {
  const isPositive = amount > 0;
  const reason = reasonMap[action] || "Points Update";

  return (
    <div
      className={
        `relative flex items-center justify-between mx-auto w-[340px] max-w-full px-6 py-2 rounded-full border-2 shadow-lg ` +
        `bg-white dark:bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] dark:from-black dark:via-[#181c2a] dark:to-[#232946] ` +
        `border-[#4988CF] dark:border-[#4485CE]`
      }
      style={{
        boxShadow: "0 0 16px 2px #4988CF55, 0 0 0 2px #4988CF",
        overflow: "hidden",
        backgroundClip: "padding-box",
      }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-1/2 h-full left-0 top-0 shimmer" />
      </div>
      <Sparkles
        size={22}
        className="text-[#4988CF] dark:text-[#4485CE] drop-shadow-lg mr-2 flex-shrink-0"
      />
      <span
        className="font-bold text-xs md:text-sm tracking-wide flex-1 text-[#232946] dark:text-white"
        style={{
          fontFamily: "Orbitron, Kanit, Josefin Sans, sans-serif",
          letterSpacing: "0.04em",
        }}
      >
        {reason}
      </span>
      <span
        className={`ml-3 text-base font-extrabold flex items-baseline ${
          isPositive ? "text-green-400" : "text-red-400"
        }`}
        style={{
          textShadow: isPositive
            ? "0 0 8px #00ffae"
            : "0 0 8px #ff0055",
          fontFamily: "Orbitron, Kanit, Josefin Sans, sans-serif",
        }}
      >
        {isPositive ? "+" : "-"}
        {Math.abs(amount)}
        <span className="ml-1 text-xs font-semibold text-[#4988CF] dark:text-[#7ecfff]">SDP</span>
      </span>
      <style>
        {`
          .shimmer {
            background: linear-gradient(120deg, transparent 0%, #4988CF44 50%, transparent 100%);
            animation: shimmer-move 2s infinite linear;
            opacity: 0.7;
          }
          @media (prefers-color-scheme: dark) {
            .shimmer {
              background: linear-gradient(120deg, transparent 0%, #4485CE44 50%, transparent 100%);
            }
          }
          @keyframes shimmer-move {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}
      </style>
    </div>
  );
};

export default SpaceToast; 