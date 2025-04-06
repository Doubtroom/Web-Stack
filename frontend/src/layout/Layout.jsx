import React from "react";
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer"
import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import SearchBar from "../components/SearchBar";

const Layout = () => {
  const location = useLocation();
  
  // Pages where we don't want to show the mobile search bar
  const noSearchPages = [
    '/profile',
    '/login',
    '/signup',
    '/user-info'
  ];

  const shouldShowSearch = !noSearchPages.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col w-full">
      <ScrollToTop />
      <Navbar />
      {/* Mobile Search Bar */}
      <div className="lg:hidden">
        {shouldShowSearch && (
          <div className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 mt-16">
            <SearchBar isMobile={true} />
          </div>
        )}
      </div>
      <main className={`flex-1 w-full ${shouldShowSearch ? 'pt-4' : 'pt-10'} pb-20 min-h-screen`}>
        <Outlet />
      </main>
      <Footer classNames={'lg:block hidden'}/>
    </div>
  );
};

export default Layout;
