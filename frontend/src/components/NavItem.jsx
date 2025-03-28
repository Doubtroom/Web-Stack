import React from "react";
import { NavLink } from "react-router-dom";

const NavItem = ({ icon, label,classNames="",color="white",onClick,to}) => {
    return (
      <NavLink to={to} className={`flex items-center text-sm text-${color} hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-gray-200 ${classNames} cursor-pointer p-1`} onClick={onClick}>
        <span className="mr-1">{icon}</span>
        <span className="text-">{label}</span>
      </NavLink>
    );
  };

  export default NavItem