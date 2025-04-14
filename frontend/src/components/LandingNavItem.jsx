import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';


const Navitem = ({ text, link = "", isScrolled }) => {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <NavLink
          to={link}
          className={`text-base font-space transition-colors duration-200 cursor-pointer ${
            isScrolled 
              ? 'text-teal-400/80 hover:text-teal-400' 
              : 'text-white/80 hover:text-white'
          }`}
        >
          {text}
        </NavLink>
      </motion.div>
    );
  };

  export default Navitem;