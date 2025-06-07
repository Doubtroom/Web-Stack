import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Lightbulb, Clock } from 'lucide-react';
import Button from './Button';
import placeholder from '../assets/placeholder.png';

const CollegeCard = ({ id, collegeName, img, branch, topic, noOfAnswers, postedOn }) => {
  const navigate = useNavigate();

  const formatBranchName = (branch) => {
    if (!branch) return '';
    return branch
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getTimeAgo = (timestamp) => {
    // Handle both Firestore timestamps and string timestamps
    const date = typeof timestamp === 'object' && timestamp.toDate 
      ? timestamp.toDate() 
      : new Date(timestamp);
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    return date.toLocaleDateString();
  };

  const handleCardClick = () => {
    navigate(`/question/${id}`, { state: { fromPage: window.location.search } });
  };

  const handleAnswerClick = (e) => {
    e.stopPropagation();
    navigate(`/question/${id}/answer`, { state: { fromPage: window.location.search } });
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer group"
    >
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="min-w-[200px]">
            <h2 className="text-[#173f67] dark:text-blue-400 font-bold text-xl mb-1 line-clamp-2 min-h-[3rem]">{collegeName}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{formatBranchName(branch)}</p>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative">
        <img
          src={img && img.length > 0 ? img : placeholder}
          alt="Question Image"
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholder;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className='flex flex-col gap-2'>
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900 dark:text-white font-semibold text-lg whitespace-nowrap overflow-hidden">{topic}</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Clock size={16} />
              <span className="text-xs">{getTimeAgo(postedOn)}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {noOfAnswers} answers
            </div>
          </div>
        </div>
        <div className="flex items-center justify-start mt-4">
          <Button 
            onClick={handleAnswerClick}
            variant="ghost"
            size="sm"
            className="text-[#173f67] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            <span>Answer</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CollegeCard;
