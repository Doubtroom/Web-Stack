import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  User,
  LogOut,
  Home,
  HelpCircle,
  School,
  Grid,
  Menu,
  X,
  Layers,
  BarChart3,
  Trophy,
} from "lucide-react";
import SearchBar from "./SearchBar";
import NavItem from "./NavItem";
import { NavLink } from "react-router-dom";
import Logo from "../assets/logoWhite.png";
import { motion, AnimatePresence } from "framer-motion";
import SliderSwitch from "../components/SliderSwitch";
import StreakIcon from "./StreakIcon";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navbarVisibility, setNavbarVisibility] = useState(1);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const user = useSelector((state) => state.auth.user);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      const result = await dispatch(logout()).unwrap();
      if (result) {
        toast.success("Logged out successfully!");
        navigate("/landing", { state: { fromLogout: true }, replace: true });
      }
    } catch (error) {
      toast.error(error || "Logout failed. Please try again.");
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setIsOpen(false);

    // Show navbar when scrolling up or at the top
    if (currentScrollY < lastScrollY || currentScrollY < 50) {
      setNavbarVisibility(1);
    }
    // Hide navbar when scrolling down and not at the top
    else if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setNavbarVisibility(0);
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    let timeoutId;

    const throttledScroll = () => {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          handleScroll();
          timeoutId = null;
        }, 100); // Throttle to run max every 100ms
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lastScrollY]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search completion
  const handleSearchComplete = () => {
    setShowSearchDropdown(false);
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 flex items-center justify-between px-5 sm:px-5 md:px-6 py-5 sm:py-6 transition-all duration-300 ease-in-out ${
          isDarkMode
            ? "bg-slate-900 shadow-slate-800/50"
            : "bg-gradient-to-r from-[#1e6eab] to-[#02254b]"
        } shadow-sm`}
        style={{
          opacity: navbarVisibility,
          transform: `translateY(${navbarVisibility === 0 ? "-100%" : "0%"})`,
          transition: "all 0.3s ease",
          willChange: "transform, opacity",
        }}
      >
        <div className="flex gap-4 sm:gap-5 md:gap-7">
          <div className="flex items-center space-x-3 gap-5">
            <div className="flex gap-2">
              <NavLink to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-8 sm:h-8 rounded-md flex items-center justify-center">
                  <img src={Logo} alt="Logo" />
                </div>
                <span className="text-xl sm:text-xl font-bold text-white">
                  Doubtroom
                </span>
              </NavLink>
            </div>
            <div className="relative" ref={searchRef}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                  className="hidden lg:block xl:hidden"
                >
                  <div
                    className={`flex flex-row items-center gap-3 px-3 py-2 rounded-full cursor-pointer transition-all duration-200 ${
                      showSearchDropdown
                        ? "bg-white/30 hover:bg-white/40 shadow-lg scale-105"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    <Search
                      className={`w-5 h-5 text-white transition-transform duration-200 ${
                        showSearchDropdown ? "rotate-90" : ""
                      }`}
                    />
                    <span className="text-white text-sm font-medium tracking-wide">
                      Search
                    </span>
                  </div>
                </button>
              </div>

              {/* Mobile Search Dropdown */}
              <AnimatePresence>
                {showSearchDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-12 right-0 w-full shadow-lg rounded-lg z-50 p-4"
                  >
                    <SearchBar onSearchComplete={handleSearchComplete} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* SearchBar for Desktop */}
          <div className="hidden xl:block">
            <SearchBar />
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-6">
          <SliderSwitch />
          <NavItem
            to="/home"
            icon={<Home className="w-4 h-4" />}
            label="Home"
          />
          <NavItem
            to="/my-content"
            icon={<HelpCircle className="w-4 h-4" />}
            label="My Content"
          />
          <NavItem
            to="/leaderboard"
            icon={<Trophy className="w-4 h-4" />}
            label="Leaderboard"
          />
          <NavItem
            to="/flashcards"
            icon={<Layers className="w-4 h-4" />}
            label="Flashcards"
          />
          <NavItem
            to="/my-college"
            icon={<School className="w-4 h-4" />}
            label="My College"
          />

          <StreakIcon className="mr-2" />

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `group w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
                isActive
                  ? "ring-2 dark:ring-blue-400 ring-gray-600 bg-amber-100 dark:bg-gray-700"
                  : "bg-gray-200 dark:bg-gray-700 hover:ring-2 hover:ring-gray-600 dark:hover:ring-blue-300"
              }`
            }
          >
            {({ isActive }) => (
              <User
                className={`w-5 h-5 group-hover:dark:text-blue-400 ${isActive ? "dark:text-blue-400 text-gray-600" : "text-gray-600 dark:text-gray-300"}`}
              />
            )}
          </NavLink>
        </div>

        {/* Mobile Menu Items */}
        <div className="lg:hidden flex items-center gap-4 sm:gap-4">
          <SliderSwitch />
          <StreakIcon className="mr-2" />
          <div className="relative" ref={mobileMenuRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`group w-9 h-9 sm:w-9 sm:h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
                isOpen
                  ? "ring-2 dark:ring-blue-400 ring-gray-600 bg-amber-100 dark:bg-gray-700"
                  : "bg-gray-200 dark:bg-gray-700 hover:ring-2 hover:ring-gray-600 dark:hover:ring-blue-300"
              }`}
            >
              <User
                className={`w-5 h-5 sm:w-5 sm:h-5 group-hover:dark:text-blue-400 ${isOpen ? "dark:text-blue-400 text-gray-600" : "text-gray-600 dark:text-gray-300"}`}
              />
            </button>

            {/* Mobile User Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  key="mobile-menu"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-12 right-0 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50 transition-transform duration-300 ease-in-out"
                >
                  <div className="flex flex-col p-2">
                    <NavLink
                      to="/profile"
                      className="flex items-center text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer p-3 transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="w-5 h-5 mr-3" />
                      <span>Profile</span>
                    </NavLink>
                    <div
                      className="flex items-center text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer p-3 transition-colors duration-200"
                      onClick={() => {
                        setIsOpen(false);
                        handleLogoutClick();
                      }}
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      <span>Logout</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Dialog */}
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
    </>
  );
};

export default Navbar;
