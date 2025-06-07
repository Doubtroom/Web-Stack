import React from "react";
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer"
import { Outlet, useLocation, Link} from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import SearchBar from "../components/SearchBar";
import {MessageSquarePlus } from "lucide-react";
import MobileBottomNavbar from "../components/MobileBottomNavbar";

const Layout = () => {
  const location = useLocation();
  
  const noSearchPages = [
    '/profile',
    '/login',
    '/signup',
    '/user-info',
    '/customer-support',
    '/contact'
  ];

  const noFABPages = [
    '/ask-question',
    '/login',
    '/signup',
    '/user-info',
    '/question/',
    '/customer-support',
    '/contact'
  ];

  const shouldShowSearch = !noSearchPages.some(path => location.pathname.startsWith(path));
  const shouldShowFAB = !noFABPages.some(path => {
    // Special handling for question routes
    if (path === '/question/') {
      return location.pathname.startsWith('/question/') && location.pathname.includes('/answer');
    }
    return location.pathname.startsWith(path);
  });

  return (
    <div className="min-h-screen flex flex-col w-full">
      <ScrollToTop />
      <Navbar />
      {/* Mobile Search Bar */}
      <div className="lg:hidden">
        {shouldShowSearch && (
          <div className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 mt-10">
            <SearchBar isMobile={true} />
          </div>
        )}
      </div>
      <main className={`flex-1 w-full ${shouldShowSearch ? 'pt-4' : 'pt-10'} pb-24 lg:pb-4 min-h-screen`}>
        <Outlet />
      </main>
      <Footer classNames={'lg:block hidden'}/>

      {/* Floating Action Button */}
      {shouldShowFAB && (
        <Link to='/ask-question' className="fixed bottom-20 right-4 z-40">
          <div className="group relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
            
            {/* Main button */}
            <div className="relative bg-gradient-to-r from-[#1f5986] to-[#114073] dark:from-blue-500 dark:to-blue-600 rounded-full px-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-white" />
              <span className="text-white font-medium text-sm">Ask Question</span>
            </div>
          </div>
        </Link>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavbar />
    </div>
  );
};

export default Layout;
