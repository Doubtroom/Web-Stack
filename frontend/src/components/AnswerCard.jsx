import React, { useState } from 'react';
import { ThumbsUp, Maximize2 } from 'lucide-react';
import Button from './Button';

const AnswerCard = ({ 
  answer, 
  index, 
  userData, 
  onUpvote, 
  onReply, 
  onImageClick, 
  onCardClick
}) => {
  const [isUpvoting, setIsUpvoting] = useState(false);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (isUpvoting || !onUpvote) return;
    
    setIsUpvoting(true);
    try {
      await onUpvote(answer._id);
    } finally {
      setIsUpvoting(false);
    }
  };

  const isUpvoted = answer.upvotedBy?.includes(userData?.userId);

  return (
    <div 
      className="group bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-600 flex flex-col relative"
      onClick={onCardClick}
    >
      {/* Answer Number */}
      <div className="absolute -left-3 -top-3 w-6 h-6 bg-blue-800 dark:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
        {index + 1}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800 dark:text-white">
                {answer.role === 'faculty' || answer.role === 'faculty(Phd)' ? answer.userName : 'Anonymous'}
              </h3>
              {(answer.role === 'faculty' || answer.role === 'faculty(Phd)') && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                  {answer.role === 'faculty' ? 'Faculty' : 'Faculty (Phd)'}
                </span>
              )}
              {answer.collegeName && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  answer.collegeName === userData.collegeName
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                }`}>
                  {answer.collegeName === userData.collegeName ? 'My College' : 'Other College'}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{formatTimeAgo(answer.createdAt)}</span>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{answer.text}</p>
        
        {answer.photoUrl && (
          <div 
            className="mt-4 rounded-lg overflow-hidden w-full h-32 relative group cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onImageClick(answer.photoUrl);
            }}
          >
            <img
              src={answer.photoUrl}
              alt="Answer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <Maximize2 className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={isUpvoting}
            className={`px-3 inline-flex items-center transition-all duration-200 ${
              isUpvoted ? 'text-[#173f67] dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
            } ${isUpvoting ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#173f67] dark:hover:text-blue-400 hover:scale-105 active:scale-95'}`}
            onClick={handleUpvote}
            children={
              <>
                <ThumbsUp className={`w-4 h-4 mr-1 transition-all duration-200 ${
                  isUpvoted ? 'fill-current' : ''
                } text-[#173f67] dark:text-[#3f7cc6] ${isUpvoting ? 'animate-pulse' : ''}`} />
                <span className='text-[#173f67] dark:text-[#3f7cc6]'>
                  {isUpvoting ? 'Updating...' : 'Upvote'}
                </span>
              </>
            }
          />
          <span className="text-base font-semibold text-[#173f67] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full transition-all duration-200">
            {answer.upvotes || 0}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="px-3 text-[#173f67] dark:text-[#3f7cc6]"
          onClick={(e) => {
            e.stopPropagation();
            onReply(answer._id);
          }}
          children="Reply"
        />
      </div>
    </div>
  );
};

export default AnswerCard; 