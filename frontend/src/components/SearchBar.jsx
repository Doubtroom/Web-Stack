import React, { useState, useEffect, useRef } from 'react';
import { Search, HelpCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataService from '../firebase/DataService';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const SearchBar = ({ isMobile = false, onClose, isOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowDropdown(false);
    setSearchTerm('');
    setResults([]);
    if (onClose) {
      onClose();
    }
  };

  // Reset state when isOpen changes
  useEffect(() => {
    if (!isOpen) {
      setShowDropdown(false);
      setSearchTerm('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (showDropdown || isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown, isOpen]);

  useEffect(() => {
    const searchData = async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const questionsService = new DataService('questions');
        const questions = await questionsService.getAllDocuments();

        // Filter questions based on search term
        const searchResults = questions.filter(question => {
          const searchLower = searchTerm.toLowerCase();
          return (
            (question.text?.toLowerCase().includes(searchLower) || // Search in question text
            question.topic?.toLowerCase().includes(searchLower) || // Search in topic
            question.branch?.toLowerCase().includes(searchLower))   // Search in branch
          );
        });

        // Format results with all fields
        const formattedResults = searchResults.map(q => ({
          id: q.id,
          text: q.text || '',
          topic: q.topic || '',
          branch: q.branch || '',
          college: q.collegeName || '',
          createdAt: q.createdAt
        }));

        setResults(formattedResults);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Failed to perform search');
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchTerm(e.target.value);
    if (!showDropdown && isOpen !== false) {
      setShowDropdown(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (searchTerm.trim()) {
      navigate(`/search/${encodeURIComponent(searchTerm.trim())}`);
      handleClose();
    }
  };

  const handleResultClick = (e, result) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/question/${result.id}`);
    handleClose();
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? (
        <span key={i} className={`${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'} px-1 rounded`}>
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div 
      className={`relative ${isMobile ? 'w-full mt-10' : 'w-80'}`} 
      ref={searchRef}
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="relative flex">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={(e) => {
            e.stopPropagation();
            if (isOpen !== false) {
              setShowDropdown(true);
            }
          }}
          className={`w-full py-2 pl-10 pr-12 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#173f67] ${
            isDarkMode
              ? 'bg-gray-700 text-white placeholder-gray-400'
              : 'bg-gray-100 text-gray-900 placeholder-gray-500'
          } ${isMobile ? 'py-3 text-base' : ''}`}
          placeholder="Search by question, topic, or branch..."
          autoFocus={isMobile}
        />
        <button
          type="submit"
          className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
            isDarkMode
              ? 'text-blue-400 hover:text-blue-300'
              : 'text-[#173f67] hover:text-[#122f4d]'
          }`}
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Search Results Dropdown */}
      {showDropdown && (searchTerm.trim() || isLoading) && (
        <div 
          className={`absolute ${isMobile ? 'top-full left-0 right-0' : 'top-full left-0'} w-full mt-2 rounded-lg shadow-lg border max-h-96 overflow-y-auto ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className={`p-4 text-center ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={(e) => handleResultClick(e, result)}
                  className={`px-4 py-3 cursor-pointer border-b last:border-b-0 ${
                    isDarkMode
                      ? 'hover:bg-gray-700 border-gray-700'
                      : 'hover:bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <HelpCircle className={`w-4 h-4 ${
                        isDarkMode ? 'text-blue-400' : 'text-[#173f67]'
                      }`} />
                    </div>
                    <div className="flex-1">
                      {/* Question Text */}
                      <div className="mb-2">
                        <p className={`text-sm line-clamp-2 ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {highlightMatch(result.text, searchTerm)}
                        </p>
                      </div>
                      
                      {/* Topic and Branch */}
                      <div className="flex items-center gap-2 text-xs mb-1 flex-wrap">
                        {result.topic && (
                          <span className={`px-2 py-0.5 rounded-full ${
                            isDarkMode 
                              ? 'bg-blue-900/30 text-blue-300' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            Topic: {highlightMatch(result.topic, searchTerm)}
                          </span>
                        )}
                        {result.branch && (
                          <span className={`px-2 py-0.5 rounded-full ${
                            isDarkMode 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            Branch: {highlightMatch(result.branch, searchTerm)}
                          </span>
                        )}
                      </div>

                      {/* College and Time */}
                      <div className={`flex items-center justify-between text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <span>{result.college}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(result.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-4 text-center ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No questions found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;