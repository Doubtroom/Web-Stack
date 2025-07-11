import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Clock,
  ThumbsUp,
  Edit2,
  Trash2,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchComments,
  createComment,
  upvoteComment,
  deleteComment,
  updateComment,
} from "../store/dataSlice";
import { toast } from "sonner";
import Button from "./Button";
import ConfirmationDialog from "./ConfirmationDialog";
import LoadingSpinner from "./LoadingSpinner";

const CommentSection = ({ answerId }) => {
  const dispatch = useDispatch();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const { comments, updatingCommentId, deletingCommentId } = useSelector(
    (state) => state.data,
  );
  const userData = useSelector((state) => state.auth.user);
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);

  useEffect(() => {
    if (answerId) {
      dispatch(fetchComments(answerId));
    }
  }, [answerId, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData?.userId) {
      toast.error("Please login to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        createComment({
          answerId,
          data: { text: newComment.trim() },
        }),
      ).unwrap();

      setNewComment("");
      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error(error || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (commentId) => {
    try {
      const userId = userData?.userId;

      if (!userId) {
        toast.error("Please login to upvote");
        return;
      }

      await dispatch(upvoteComment({ commentId, userId })).unwrap();
    } catch (error) {
      toast.error(error || "Failed to update upvote");
    }
  };

  const handleEditClick = (comment) => {
    setEditingCommentId(comment._id);
    setEditedText(comment.text);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editedText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    try {
      await dispatch(
        updateComment({ commentId: editingCommentId, text: editedText.trim() }),
      ).unwrap();
      toast.success("Comment updated successfully");
      setEditingCommentId(null);
      setEditedText("");
    } catch (error) {
      toast.error(error || "Failed to update comment");
    }
  };

  const handleDeleteClick = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteComment(commentToDelete)).unwrap();
      toast.success("Comment deleted successfully");
    } catch (error) {
      toast.error(error || "Failed to delete comment");
    } finally {
      setShowDeleteDialog(false);
      setCommentToDelete(null);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="space-y-8">
      {/* Comment Form */}
      <div
        className={`rounded-lg border p-4 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        }`}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#173f67] focus:border-transparent resize-none text-sm ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400"
            }`}
            rows="2"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5"
              size="sm"
              children={
                <>
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Posting..." : "Post"}
                </>
              }
            />
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div
            className={`text-center py-8 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-400"
                : "bg-white border-gray-100 text-gray-500"
            }`}
          >
            <MessageSquare
              className={`w-8 h-8 mx-auto mb-3 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className={`rounded-lg border p-4 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {comment.postedBy?.role === "faculty" ||
                      comment.postedBy?.role === "faculty(Phd)"
                        ? comment.postedBy.displayName
                        : "Anonymous"}
                    </h3>
                    {comment.postedBy?.role === "faculty" ||
                      (comment.postedBy?.role === "faculty(Phd)" && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                          {comment.postedBy?.role === "faculty"
                            ? "Faculty"
                            : "Faculty (Phd)"}
                        </span>
                      ))}
                  </div>
                  {editingCommentId === comment._id ? (
                    <form onSubmit={handleUpdateSubmit} className="space-y-2">
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className={`w-full p-2 border rounded-lg text-sm ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                        rows="2"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCommentId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={updatingCommentId === comment._id}
                        >
                          {updatingCommentId === comment._id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            "Update"
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <p
                      className={`text-sm mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      {comment.text}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpvote(comment._id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                        comment.upvotedBy?.includes(userData.userId)
                          ? "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30"
                          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                      children={
                        <>
                          <ThumbsUp className="w-3 h-3" />
                          <span>{comment.upvotes || 0}</span>
                        </>
                      }
                    />
                    {userData?.userId === comment.postedBy?._id && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(comment)}
                          className="flex items-center gap-1"
                          disabled={deletingCommentId === comment._id}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(comment._id)}
                          className="flex items-center gap-1 text-red-500 hover:text-red-600"
                          disabled={deletingCommentId === comment._id}
                        >
                          {deletingCommentId === comment._id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
      />
    </div>
  );
};

export default CommentSection;
