import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { simpleUpvote } from '../store/dataSlice';
import { toast } from 'sonner';

export const useSmartUpvote = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state?.auth?.user);

  const handleUpvote = useCallback(async (answerId) => {
    try {
      const userId = userData?.userId;
      
      if (!userId) {
        toast.error('Please login to upvote');
        return;
      }
      
      await dispatch(simpleUpvote(answerId, userId));
    } catch (error) {
      console.error('Error updating upvote:', error);
      toast.error(error || 'Failed to update upvote. Please try again.');
    }
  }, [dispatch, userData?.userId]);

  return { handleUpvote, userData };
}; 