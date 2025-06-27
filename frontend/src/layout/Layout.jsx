import React from "react";
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer"
import { Outlet, useLocation, Link} from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import SearchBar from "../components/SearchBar";
import {MessageSquarePlus } from "lucide-react";
import MobileBottomNavbar from "../components/MobileBottomNavbar";
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Modal, ConfigProvider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { flashcardServices } from '../services/data.services';
import { theme } from 'antd';

const Layout = () => {
  const location = useLocation();
  const flashcards = useSelector((state) => state.flashcardStatus.flashcards);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [dueCardIndex, setDueCardIndex] = useState(null);
  const navigate = useNavigate();
  const [reviewLoading, setReviewLoading] = useState(false);
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  
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
    '/contact',
    '/flashcards'
  ];

  const shouldShowSearch = !noSearchPages.some(path => location.pathname.startsWith(path));
  const shouldShowFAB = !noFABPages.some(path => {
    // Special handling for question routes
    if (path === '/question/') {
      return location.pathname.startsWith('/question/') && location.pathname.includes('/answer');
    }
    return location.pathname.startsWith(path);
  });

  // Check for due flashcards after statuses are loaded
  useEffect(() => {
    if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) return;
    const now = new Date();
    const firstDueIndex = flashcards.findIndex(card => card.nextReviewAt && new Date(card.nextReviewAt) <= now);
    if (firstDueIndex !== -1) {
      setDueCardIndex(firstDueIndex);
      setShowReviewModal(true);
    }
  }, [flashcards]);

  const handleReviewNow = async () => {
    if (dueCardIndex !== null && flashcards[dueCardIndex]) {
      const card = flashcards[dueCardIndex];
      if (card.difficulty) {
        try {
          setReviewLoading(true);
          await flashcardServices.upsertStatus({ questionId: card._id, difficulty: card.difficulty });
          setReviewLoading(false);
        } catch (e) {
          setReviewLoading(false);
          // Optionally handle error
        }
      }
      setShowReviewModal(false);
      navigate(`/flashcards/${dueCardIndex}`);
    }
  };

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

      {/* Review Due Flashcard Modal */}
      {showReviewModal && dueCardIndex !== null && (
        <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
          <Modal
            open={true}
            onCancel={() => setShowReviewModal(false)}
            onOk={handleReviewNow}
            confirmLoading={reviewLoading}
            okText="Review Now"
            cancelText="Later"
            centered
          >
            <div className="text-lg font-semibold mb-2">You have a flashcard to review!</div>
            <div className="text-gray-400 dark:text-gray-300">Would you like to review it now?</div>
          </Modal>
        </ConfigProvider>
      )}
    </div>
  );
};

export default Layout;
