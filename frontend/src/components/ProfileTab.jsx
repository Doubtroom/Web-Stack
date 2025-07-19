import React from "react";

const ProfileTab = ({
  icon,
  title,
  description,
  rightContent,
  onClick,
  className = "",
  rounded = "",
  borderBottom = true,
}) => {
  // Use button if onClick, else div
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={`w-full flex items-center justify-between group px-4 sm:px-6 py-7 sm:py-8 transition-all duration-200
        ${onClick ? "cursor-pointer" : ""}
        bg-white dark:bg-[#1a2233]
        ${rounded}
        ${borderBottom ? "border-b border-blue-100 dark:border-blue-900/30" : ""}
        hover:bg-blue-500/10 dark:hover:bg-blue-800/40
        
        ${className}`}
      style={{ minHeight: 0 }}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-200 dark:bg-blue-800/30 transition-all duration-200">
          {icon}
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-base sm:text-lg text-blue-900 dark:text-white mb-0.5">{title}</h3>
          {description && (
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-200 opacity-90 leading-tight">{description}</p>
          )}
        </div>
      </div>
      {rightContent && <div className="ml-4 flex-shrink-0">{rightContent}</div>}
    </Wrapper>
  );
};

export default ProfileTab; 