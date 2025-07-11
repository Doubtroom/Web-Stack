import React, { useState, useRef, useEffect } from "react";
import { Filter } from "lucide-react";
import { useSelector } from "react-redux";

const MobileFilterButton = ({
  isActive,
  onClick,
  activeText,
  inactiveText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef(null);

  // Get dark mode state from Redux
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleButtonClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    setIsOpen(!isOpen);
  };

  const handleOptionClick = () => {
    onClick();
    setIsOpen(false);
  };

  const buttonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    border: "1px solid",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    transform: isPressed
      ? "scale(0.9)"
      : isHovered
        ? "scale(1.05)"
        : "scale(1)",
    ...(isActive
      ? {
          backgroundColor: "#3b82f6",
          color: "#ffffff",
          borderColor: "#3b82f6",
          boxShadow: isHovered
            ? "0 10px 25px -3px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.2)"
            : "0 4px 6px -1px rgba(59, 130, 246, 0.2), 0 2px 4px -1px rgba(59, 130, 246, 0.1)",
        }
      : {
          backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
          color: isDarkMode ? "#e5e7eb" : "#374151",
          borderColor: isDarkMode ? "#374151" : "#d1d5db",
          boxShadow: isHovered
            ? isDarkMode
              ? "0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)"
              : "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
            : isDarkMode
              ? "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)"
              : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }),
  };

  const dropdownStyle = {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "8px",
    backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    borderRadius: "16px",
    boxShadow: isDarkMode
      ? "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
      : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "8px",
    minWidth: "140px",
    zIndex: 50,
    opacity: isOpen ? 1 : 0,
    transform: isOpen
      ? "translateY(0) scale(1)"
      : "translateY(-10px) scale(0.95)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: "blur(10px)",
    border: isDarkMode
      ? "1px solid rgba(55, 65, 81, 0.8)"
      : "1px solid rgba(255, 255, 255, 0.2)",
  };

  const optionStyle = {
    width: "100%",
    textAlign: "left",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    ...(isActive
      ? {
          backgroundColor: isDarkMode ? "#1e3a8a" : "#eff6ff",
          color: isDarkMode ? "#93c5fd" : "#1d4ed8",
          boxShadow: isDarkMode
            ? "0 1px 3px 0 rgba(59, 130, 246, 0.3)"
            : "0 1px 3px 0 rgba(59, 130, 246, 0.1)",
        }
      : {
          color: isDarkMode ? "#e5e7eb" : "#374151",
        }),
  };

  const createRipple = (event) => {
    const button = event.currentTarget;
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.style.position = "absolute";
    ripple.style.borderRadius = "50%";
    ripple.style.backgroundColor = isDarkMode
      ? "rgba(59, 130, 246, 0.3)"
      : "rgba(255, 255, 255, 0.3)";
    ripple.style.transform = "scale(0)";
    ripple.style.animation = "ripple 0.6s linear";
    ripple.style.pointerEvents = "none";

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <style>
        {`
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translate3d(0,0,0);
            }
            40%, 43% {
              transform: translate3d(0, -8px, 0);
            }
            70% {
              transform: translate3d(0, -4px, 0);
            }
            90% {
              transform: translate3d(0, -2px, 0);
            }
          }
        `}
      </style>

      <button
        onClick={(e) => {
          createRipple(e);
          handleButtonClick();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={buttonStyle}
      >
        <Filter
          size={20}
          style={{
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            filter: isHovered
              ? "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              : "none",
          }}
        />
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          <button
            onClick={handleOptionClick}
            style={optionStyle}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.target.style.backgroundColor = isDarkMode
                  ? "#374151"
                  : "#f8fafc";
                e.target.style.transform = "translateX(4px) scale(1.02)";
                e.target.style.boxShadow = isDarkMode
                  ? "0 2px 8px rgba(0,0,0,0.3)"
                  : "0 2px 8px rgba(0,0,0,0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.target.style.backgroundColor = "transparent";
                e.target.style.transform = "translateX(0) scale(1)";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            {isActive ? inactiveText : activeText}
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileFilterButton;
