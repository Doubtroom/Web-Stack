import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import SearchBar from "./SearchBar";
import NavItem from "./NavItem";
import { NavLink } from "react-router-dom";
import Logo from "../assets/logoWhite.png";
import { motion, AnimatePresence } from "framer-motion";
import SliderSwitch from '../components/SliderSwitch'
import authService from "../firebase/AuthService";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      localStorage.removeItem('authStatus');
      localStorage.removeItem('userData');
      localStorage.setItem('profileCompleted', false);
      toast.success('Logged out successfully!');
      navigate('/landing', { state: { fromLogout: true }, replace: true });
    } catch (error) {
      toast.error('Logout Failed!');
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleScroll = () => {
    if (window.scrollY < lastScrollY) {
      setShowNavbar(true);
    } else {
      setShowNavbar(false);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <>
      <nav
        className={`fixed w-full z-50  flex items-center justify-between px-6 py-6 transition-transform duration-300 ease-in-out ${
          isDarkMode 
            ? 'bg-slate-900 shadow-slate-800/50'
            : 'bg-gradient-to-r from-[#1e6eab] to-[#02254b]'
        } shadow-sm ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex gap-7">
          <div className="flex items-center space-x-3">
            <div className="flex gap-2">
              <div className="lg:hidden flex items-center">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-white focus:outline-none"
                >
                  <AnimatePresence mode="wait">
                    {isOpen ? (
                      <motion.div
                        key="close"
                        initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
                        transition={{ duration: 0.1 }}
                      >
                        <X className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                        transition={{ duration: 0.1 }}
                      >
                        <Menu className="w-6 h-6" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
              
              <NavLink to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md flex items-center justify-center">
                  <img src={Logo} alt="Logo" />
                </div>
                <span className="text-xl font-bold text-white">Doubtroom</span>
              </NavLink>
            </div>
          </div>

          {/* SearchBar for Desktop */}
          <div className="hidden lg:block">
            <SearchBar />
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-6">
          <SliderSwitch/>
          <NavItem to='/' icon={<Home className="w-4 h-4" />} label="Home" />
          <NavItem to="/my-questions" icon={<HelpCircle className="w-4 h-4" />} label="My Questions" />
          <NavItem to="/my-college" icon={<School className="w-4 h-4" />} label="My College" />
          <NavItem to="/all-colleges" icon={<Grid className="w-4 h-4" />} label="All Colleges" />
          
          <div className={`flex items-center text-sm text-white hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-gray-200 cursor-pointer p-1`} onClick={handleLogoutClick}>
            <span className="mr-1">{<LogOut className="w-4 h-4" />}</span>
            <span className="text-">{"Logout"}</span>
          </div>
          <NavLink to="/profile">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer">
              <User className="w-5 h-5 text-black" />
            </div>
          </NavLink>
        </div>

        {/* Mobile Menu Items */}
        <div className="lg:hidden flex items-center gap-4">
          <SliderSwitch />
          <NavLink to="/profile">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer">
              <User className="w-5 h-5 text-black" />
            </div>
          </NavLink>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 left-1 w-64 bg-white shadow-lg rounded-lg z-50 transition-transform duration-300 ease-in-out"
            >
              <div className="flex flex-col space-y-4 p-4 lg:hidden">
                <NavItem
                  to='/'
                  color="black"
                  icon={<Home className="w-4 h-4" />}
                  label="Home"
                />
                <NavItem
                  to='/my-questions'
                  color="black"
                  icon={<HelpCircle className="w-4 h-4" />}
                  label="My Questions"
                />
                <NavItem
                  to='/my-college'
                  color="black"
                  icon={<School className="w-4 h-4" />}
                  label="My College"
                />
                <NavItem
                  to='/all-colleges'
                  color="black"
                  icon={<Grid className="w-4 h-4" />}
                  label="All Colleges"
                />
                <div className={`flex items-center text-sm text-black hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-gray-200 cursor-pointer p-1`} onClick={handleLogoutClick}>
                  <span className="mr-1">{<LogOut className="w-4 h-4" />}</span>
                  <span className="text-">{"Logout"}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
