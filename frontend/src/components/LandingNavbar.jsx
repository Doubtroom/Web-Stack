import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logoWhite.png';
import { motion } from 'framer-motion';
import Navitem from './LandingNavItem';

const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
  
    useEffect(() => {
      const handleScroll = () => {
        if (window.scrollY > 10) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      };
  
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    return (
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled || isMenuOpen
            ? 'bg-[#0a192f]/80 backdrop-blur-md shadow-lg shadow-teal-500/10' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-8 py-4">
        <Link to="/landing">
          <motion.div 
            className='flex gap-3 items-center'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`w-10 h-10 rounded-xl ${
              isScrolled || isMenuOpen ? 'bg-teal-500/20' : 'bg-white/10'
            } flex items-center justify-center`}>
              <img src={Logo} alt="Logo" className="w-7 h-7" />
            </div>
            <div className={`text-2xl font-bold text-white font-space`}>Doubtroom</div>
          </motion.div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Navitem link="/about" text="About" isScrolled={isScrolled} />
            <Navitem link="/login" text="Log in" isScrolled={isScrolled} />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/signup" className={`px-6 py-2.5 ${
                isScrolled 
                  ? 'bg-teal-500 hover:bg-teal-600' 
                  : 'bg-gradient-to-r from-teal-400 to-teal-500'
              } text-white rounded-lg font-medium font-space hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200`}>
                Get Started
              </Link>
            </motion.div>
          </div>
  
          <motion.button 
            className={`md:hidden ${
              isScrolled ? 'text-teal-400' : 'text-white'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Menu size={24} />
          </motion.button>
        </div>
  
        {/* Mobile menu */}
        <motion.div 
          initial={false}
          animate={{ 
            height: isMenuOpen ? 'auto' : 0,
            opacity: isMenuOpen ? 1 : 0
          }}
          className={`md:hidden overflow-hidden bg-[#0a192f]/90`}
        >
          <div className="py-4 space-y-4 px-2">
            <Navitem link="/about" text="About" isScrolled={true} />
            <Navitem link="/login" text="Log in" isScrolled={true} />
            <Navitem link="/signup" text="Sign up" isScrolled={true} />
          </div>
        </motion.div>
      </motion.nav>
    );
  };

  export default NavBar;