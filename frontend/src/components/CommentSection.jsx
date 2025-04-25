import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, ThumbsUp } from 'lucide-react';
import DataService from '../firebase/DataService';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const CommentSection = ({ answerId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);

  useEffect(() => {
    fetchComments();
  }, [answerId]);

  const fetchComments = async () => {
    try {
      const dataService = new DataService('comments');
      const commentsData = await dataService.getCommentsByAnswerId(answerId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userData.uid) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataService = new DataService('comments');
      const commentData = {
        text: newComment.trim(),
        answerId: answerId,
        userId: userData.uid,
        createdAt: new Date().toISOString(),
        upvotes: 0,
        upvotedBy: [],
        userName: userData.displayName
      };

      await dataService.addDocument(commentData);
      setNewComment('');
      fetchComments();
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (commentId, currentUpvotes, upvotedBy) => {
    try {
      const dataService = new DataService('comments');
      const userId = userData.uid;
      
      if (!userId) {
        toast.error('Please login to upvote');
        return;
      }

      const currentUpvotedBy = Array.isArray(upvotedBy) ? upvotedBy : [];
      const hasUpvoted = currentUpvotedBy.includes(userId);
      const newUpvotes = hasUpvoted ? currentUpvotes - 1 : currentUpvotes + 1;
      
      const newUpvotedBy = hasUpvoted 
        ? currentUpvotedBy.filter(id => id !== userId)
        : [...currentUpvotedBy, userId];

      await dataService.updateDocument(commentId, {
        upvotes: newUpvotes,
        upvotedBy: newUpvotedBy
      });

      fetchComments();
      toast.success(hasUpvoted ? 'Upvote removed' : 'Comment upvoted!');
    } catch (error) {
      console.error('Error updating upvote:', error);
      toast.error('Failed to update upvote');
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="space-y-8">
      {/* Comment Form */}
      <div className={`rounded-lg border p-4 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#173f67] focus:border-transparent resize-none text-sm ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400'
            }`}
            rows="2"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-1.5 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-[#173f67] hover:bg-[#1a4a7c]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className={`text-center py-8 rounded-lg border ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 text-gray-400'
              : 'bg-white border-gray-100 text-gray-500'
          }`}>
            <MessageSquare className={`w-8 h-8 mx-auto mb-3 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={`rounded-lg border p-4 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {userData.role === 'faculty'||'faculty(Phd)' ? comment.userName : 'Anonymous'}
                    </h3>
                    {userData.role === 'faculty'||'faculty(Phd)' && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                        {userData.role === 'faculty' ? 'Faculty' : 'Faculty (Phd)'}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mb-2 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>{comment.text}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                    <button
                      onClick={() => handleUpvote(comment.id, comment.upvotes, comment.upvotedBy)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                        comment.upvotedBy?.includes(userData.uid) 
                          ? isDarkMode
                            ? 'text-blue-400 bg-blue-900/30'
                            : 'text-[#173f67] bg-blue-50'
                          : isDarkMode
                            ? 'text-gray-400 hover:bg-gray-700'
                            : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{comment.upvotes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection; 