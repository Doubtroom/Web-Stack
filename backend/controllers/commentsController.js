import Comments from '../models/Comments.js'

export const createComment = async (req, res) => {
    try {
        const answerId = req.params.id;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Text is required for comment" });
        }

        const comment = await Comments.create({
            text,
            answerId,
            postedBy: req.user.id
        });

        const populatedComment = await Comments.findById(comment._id)
            .populate('postedBy', 'displayName collegeName role _id');

        res.status(201).json({
            message: "Successfully created comment",
            comment: populatedComment
        });

    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ 
            message: 'Error creating comment', 
            error: error.message 
        });
    }
}

export const getCommentsByAnswer = async (req, res) => {
    try {
        const answerId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Comments.countDocuments({ answerId });

        const comments = await Comments.find({ answerId })
            .populate('postedBy', 'displayName collegeName role _id')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            message: "Comments fetched successfully",
            comments,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage,
                hasPrevPage
            }
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ 
            message: 'Error fetching comments', 
            error: error.message 
        });
    }
}

export const updateComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Updated text is required' });
        }

        const updatedComment = await Comments.findByIdAndUpdate(
            commentId,
            {
                text
            },
            { new: true, runValidators: true }
        ).populate("postedBy", "displayName collegeName role _id");

        if (!updatedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.json({
            message: "Comment updated successfully", 
            comment: updatedComment 
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ 
            message: 'Error updating comment', 
            error: error.message 
        });
    }
}

export const deleteComment=async(req,res)=>{
    try {
        const commentId=req.params.id

        const comment=await Comments.findById(commentId)

        if(!comment)return res.status(404).json({ error: 'Comment not found' });

        await comment.deleteOne()

        res.json({message:"Comment deleted successfully"})
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ 
            message: 'Error deleting comment', 
            error: error.message 
        });
    }
}