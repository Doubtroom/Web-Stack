import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, HelpCircle, School, Grid, Layers } from 'lucide-react'

function MobileBottomNavbar() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30">
    <div className="flex justify-around items-center h-16">
      <NavLink 
        to="/home" 
        className={({ isActive }) => `flex flex-col items-center justify-center flex-1 py-2 ${
          isActive 
            ? 'text-[#16588E] dark:text-blue-400' 
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-xs mt-1">Home</span>
      </NavLink>
      
      <NavLink 
        to="/my-questions" 
        className={({ isActive }) => `flex flex-col items-center justify-center flex-1 py-2 ${
          isActive 
            ? 'text-[#16588E] dark:text-blue-400' 
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        <HelpCircle className="w-5 h-5" />
        <span className="text-xs mt-1">My Content</span>
      </NavLink>
      
      <NavLink 
        to="/flashcards" 
        className={({ isActive }) => `flex flex-col items-center justify-center flex-1 py-2 ${
          isActive 
            ? 'text-[#16588E] dark:text-blue-400' 
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        <Layers className="w-5 h-5" />
        <span className="text-xs mt-1">Flashcards</span>
      </NavLink>
      
      <NavLink 
        to="/my-college" 
        className={({ isActive }) => `flex flex-col items-center justify-center flex-1 py-2 ${
          isActive 
            ? 'text-[#16588E] dark:text-blue-400' 
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        <School className="w-5 h-5" />
        <span className="text-xs mt-1">My College</span>
      </NavLink>
    </div>
  </div>
  )
}

export default MobileBottomNavbar