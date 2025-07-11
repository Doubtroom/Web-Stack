import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Layers } from "lucide-react";

const icons = {
  help: HelpCircle,
  flashcard: Layers,
  // add more as needed
};

const PromotionCard = ({
  title,
  subtitle,
  icon = "help",
  buttonText,
  buttonLink,
  knowMoreLink = "/promotion",
}) => {
  const Icon = icons[icon] || HelpCircle;
  return (
    <div
      className={
        `relative rounded-2xl overflow-hidden border border-blue-200 dark:border-blue-900 shadow-xl ` +
        `backdrop-blur-md transition-all duration-300 group hover:shadow-2xl hover:scale-[1.015] ` +
        `hover:border-blue-400 dark:hover:border-blue-500 ` +
        `hover:ring-2 hover:ring-blue-200/40 dark:hover:ring-blue-900/40`
      }
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.65) 60%, rgba(226,232,240,0.18) 100%)",
      }}
    >
      <div className="dark:hidden flex items-center justify-between p-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100/70 shadow-md">
            <Icon className="w-7 h-7 text-blue-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 drop-shadow-sm">
              {title}
            </h3>
            <p className="text-sm mt-1 text-gray-600 opacity-90">{subtitle}</p>
            <Link to={knowMoreLink}>
              <button className="mt-2 px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:hover:bg-blue-900/60 transition">
                Know More
              </button>
            </Link>
          </div>
        </div>
        <Link to={buttonLink}>
          <button
            className="px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-purple-500 shadow-lg hover:from-blue-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400/60 transition-all duration-200 relative overflow-hidden"
            style={{
              boxShadow:
                "0 2px 16px 0 rgba(59,130,246,0.18), 0 1.5px 8px 0 rgba(139,92,246,0.12)",
            }}
          >
            <span className="drop-shadow-sm">{buttonText}</span>
            <span className="ml-2 align-middle">→</span>
            <span className="absolute inset-0 rounded-lg pointer-events-none bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </Link>
      </div>
      {/* Dark mode version */}
      <div
        className="hidden dark:flex items-center justify-between p-6"
        style={{
          background:
            "linear-gradient(135deg, rgba(30,41,59,0.92) 60%, rgba(37,99,235,0.22) 100%)",
        }}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-900/80 shadow-md">
            <Icon className="w-7 h-7 text-blue-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white drop-shadow-sm">
              {title}
            </h3>
            <p className="text-sm mt-1 text-blue-200 opacity-90">{subtitle}</p>
            <Link to={knowMoreLink}>
              <button className="mt-2 px-3 py-1 rounded-md text-xs font-medium bg-blue-900/40 text-blue-200 hover:bg-blue-900/60 transition">
                Know More
              </button>
            </Link>
          </div>
        </div>
        <Link to={buttonLink}>
          <button
            className="px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-700 via-blue-500 to-purple-600 shadow-lg hover:from-blue-800 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400/60 transition-all duration-200 relative overflow-hidden"
            style={{
              boxShadow:
                "0 2px 16px 0 rgba(37,99,235,0.18), 0 1.5px 8px 0 rgba(139,92,246,0.12)",
            }}
          >
            <span className="drop-shadow-sm">{buttonText}</span>
            <span className="ml-2 align-middle">→</span>
            <span className="absolute inset-0 rounded-lg pointer-events-none bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default PromotionCard;
