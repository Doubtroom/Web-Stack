import React, { useState, useEffect, useCallback } from "react";
import { Menu, User, LogIn, Info, X } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../assets/logoWhite.png";
import { motion } from "framer-motion";
import Navitem from "./LandingNavItem";

const NavBar = React.memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Memoize the scroll handler
  const handleScroll = useCallback(() => {
    if (window.scrollY > 10) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
    // Close mobile menu on scroll
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Memoize menu toggle handler
  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen
          ? "bg-[#0a192f]/80 backdrop-blur-md shadow-lg shadow-teal-500/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-8 py-4">
        <Link to="/landing">
          <motion.div
            className="flex gap-3 items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={`w-10 h-10 rounded-xl ${
                isScrolled || isMenuOpen ? "bg-teal-500/20" : "bg-white/10"
              } flex items-center justify-center`}
            >
              <img src={Logo} alt="Logo" className="w-7 h-7" />
            </div>
            <div className={`text-2xl font-bold text-white font-space`}>
              Doubtroom
            </div>
          </motion.div>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Navitem link="/about" text="About" isScrolled={isScrolled} />
          <Navitem link="/login" text="Log in" isScrolled={isScrolled} />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/signup"
              className={`px-6 py-2.5 ${
                isScrolled
                  ? "bg-teal-500 hover:bg-teal-600"
                  : "bg-gradient-to-r from-teal-400 to-teal-500"
              } text-white rounded-lg font-medium font-space hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200`}
            >
              Get Started
            </Link>
          </motion.div>
        </div>

        <motion.button
          className={`md:hidden ${
            isScrolled ? "text-teal-400" : "text-white"
          } flex items-center justify-center rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-400`}
          onClick={handleMenuToggle}
          whileHover={{ scale: 1.13 }}
          whileTap={{ scale: 0.93 }}
          aria-label="Open menu"
          style={{ minWidth: 48, minHeight: 48 }}
        >
          <Menu size={32} strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Redesigned Mobile menu */}
      <motion.div
        initial={false}
        animate={{
          height: isMenuOpen ? "auto" : 0,
          opacity: isMenuOpen ? 1 : 0,
        }}
        className={`md:hidden overflow-hidden bg-transparent`}
      >
        {isMenuOpen && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm"
            onClick={handleMenuToggle}
          >
            <div
              className="w-11/12 max-w-xs mt-4 mr-4 rounded-2xl bg-[#0a192f] shadow-2xl border border-white/10 p-6 flex flex-col gap-2 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                onClick={handleMenuToggle}
                aria-label="Close menu"
                style={{ minWidth: 40, minHeight: 40 }}
              >
                <X size={26} />
              </button>
              {/* Nav Items */}
              <Link
                to="/about"
                onClick={handleMenuToggle}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-white/90 text-base font-medium"
              >
                <Info size={22} className="text-teal-400" />
                About
              </Link>
              <Link
                to="/login"
                onClick={handleMenuToggle}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-white/90 text-base font-medium"
              >
                <LogIn size={22} className="text-teal-400" />
                Log in
              </Link>
              <div className="my-2 border-t border-white/10" />
              <Link
                to="/signup"
                onClick={handleMenuToggle}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-teal-400 to-teal-500 text-white font-semibold justify-center shadow-lg hover:from-teal-500 hover:to-teal-600 transition-all text-base"
              >
                <User size={22} className="text-white" />
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.nav>
  );
});

export default NavBar;
