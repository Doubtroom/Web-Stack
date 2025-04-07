import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const NavItem = ({ icon, label, classNames = "", color = "white", onClick, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `
        flex items-center text-sm text-${color} 
        hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-gray-200 
        ${classNames} cursor-pointer p-1 relative group overflow-hidden
        ${isActive ? 'text-amber-100 dark:text-blue-400' : ''}
      `} 
      onClick={onClick}
    >
      <span className="mr-1">{icon}</span>
      <span className="text-">{label}</span>
      <span className={`
        absolute bottom-0 left-[50%] h-0.5 bg-amber-100 dark:bg-blue-400
        transition-all duration-300 ease-out
        ${isActive ? 'w-[100%] -translate-x-1/2' : 'w-0 group-hover:w-[100%] -translate-x-1/2'}
      `}></span>
    </NavLink>
  );
};

export default NavItem