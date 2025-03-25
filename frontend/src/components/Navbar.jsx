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
import Logo from "../assets/logoWhite.png";
import { motion, AnimatePresence } from "framer-motion";
import SliderSwitch from '../components/SliderSwitch'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);

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
    <nav
      className={`fixed w-full z-50 flex items-center justify-between px-6 py-6 transition-transform duration-300 ease-in-out bg-gradient-to-r from-[#1e6eab] to-[#02254b] shadow-sm ${
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

            <div className="w-8 h-8 rounded-md flex items-center justify-center">
              <img src={Logo} alt="Logo" />
            </div>
            <span className="text-xl font-bold text-white">Doubtroom</span>
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
        <NavItem icon={<Home className="w-4 h-4" />} label="Home" />
        <NavItem icon={<HelpCircle className="w-4 h-4" />} label="My Questions" />
        <NavItem icon={<School className="w-4 h-4" />} label="My College" />
        <NavItem icon={<Grid className="w-4 h-4" />} label="All Colleges" />
        <NavItem icon={<LogOut className="w-4 h-4" />} label="Logout" />
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer">
          <User className="w-5 h-5 text-black" />
        </div>
      </div>

      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer lg:hidden">
        <User className="w-5 h-5 text-black" />
      </div>

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
                color="black"
                icon={<Home className="w-4 h-4" />}
                label="Home"
              />
              <NavItem
                color="black"
                icon={<HelpCircle className="w-4 h-4" />}
                label="My Questions"
              />
              <NavItem
                color="black"
                icon={<School className="w-4 h-4" />}
                label="My College"
              />
              <NavItem
                color="black"
                icon={<Grid className="w-4 h-4" />}
                label="All Colleges"
              />
              <NavItem
                color="black"
                icon={<LogOut className="w-4 h-4" />}
                label="Logout"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
