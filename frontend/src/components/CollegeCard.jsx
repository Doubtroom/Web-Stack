import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Lightbulb, Clock } from 'lucide-react';
import Button from './Button';

const CollegeCard = ({ id, collegeName, img, branch, collegeYear, topic, noOfAnswers, postedOn }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/question/${id}`);
  };

  const handleAnswerClick = (e) => {
    e.stopPropagation();
    navigate(`/question/${id}/answer`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer group"
    >
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#173f67] dark:text-blue-400 font-bold text-xl mb-1 line-clamp-1">{collegeName}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{branch}</p>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Clock size={16} />
            <span className="text-xs">{postedOn}</span>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative">
        <img
          src={img}
          alt="Question Image"
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-3 line-clamp-2 whitespace-nowrap overflow-hidden text-ellipsis">{topic}</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleAnswerClick}
              variant="ghost"
              size="sm"
              className="text-[#173f67] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              <span>Answer</span>
            </Button>
            {/* <Button 
              onClick={(e) => e.stopPropagation()}
              variant="ghost"
              size="sm"
              className="text-[#173f67] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              <span>Hints</span>
            </Button> */}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {noOfAnswers} answers
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeCard;
