import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Lightbulb, Clock, Edit2, Trash2 } from "lucide-react";
import Button from "./Button";
import { toast } from "sonner";
import DataService from "../firebase/DataService";
import ConfirmationDialog from './ConfirmationDialog';

const Card = ({id, collegeName, img, branch, topic, noOfAnswers, postedOn, postedBy, showAnswerButton = true, onDelete}) => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isQuestionOwner = userData.uid === postedBy;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCardClick = (e) => {
    // Don't navigate if clicking on edit/delete buttons
    if (e.target.closest('.action-buttons')) {
      return;
    }
    navigate(`/question/${id}`);
  };

  const handleAnswerClick = (e) => {
    e.stopPropagation();
    navigate(`/question/${id}/answer`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate(`/question/${id}/edit`);
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const dataService = new DataService('questions');
      
      // Delete associated image if exists
      if (img && !img.includes('placeholder')) {
        const fileId = img.split('/').pop();
        await dataService.deleteImage(fileId);
      }

      // Delete the question document
      await dataService.deleteDocument(id);
      
      toast.success('Question deleted successfully!');
      window.location.reload(); // Refresh to update the list
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question. Please try again.');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer"
      >
        <div className="relative h-48">
          <img
            src={img}
            alt={collegeName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-semibold text-lg line-clamp-1">{topic}</h3>
            <p className="text-white/90 text-sm mt-1 line-clamp-1">{collegeName}</p>
          </div>
          {isQuestionOwner && (
            <div className="absolute top-2 right-2 flex gap-2 action-buttons">
              <Link
                to={`/question/${id}/edit`}
                className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </Link>
              <button
                onClick={handleDeleteClick}
                className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">{branch}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <MessageSquare className="w-4 h-4" />
              <span>{noOfAnswers} answers</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{postedOn}</span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Question"
        message="Are you sure you want to delete this question?"
      />
    </>
  );
};

export default Card;
