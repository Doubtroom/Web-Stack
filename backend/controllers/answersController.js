import Answers from "../models/Answers.js";
import Questions from "../models/Questions.js";
import cloudinary from "../utils/cloudinary.js";

export const createAnswer=async(req,res)=>{
    try {
        const questionId = req.params.id;
        const {text} = req.body;

        let photoUrl='',photoId=''

        if (req.file) {
            try {
                const uploadPromise = new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { resource_type: 'image' },
                        (err, result) => {
                            if (err) {
                                console.error('Cloudinary upload error:', err);
                                reject(err);
                            } else {
                                console.log('Cloudinary upload result:', result);
                                resolve(result);
                            }
                        }
                    );
                    
                    uploadStream.end(req.file.buffer);
                });

                const result = await uploadPromise;
                photoUrl = result.secure_url;
                photoId = result.public_id;
                console.log('Photo uploaded successfully:', { photoUrl, photoId });
            } catch (uploadError) {
                console.error('Error uploading to Cloudinary:', uploadError);
                return res.status(500).json({ 
                    message: 'Error uploading image', 
                    error: uploadError.message 
                });
            }
        }

        const answer = await Answers.create({
            text,
            questionId,
            photoUrl,
            photoId,
            postedBy: req.user.id
        });

        await Questions.findByIdAndUpdate(questionId,{$inc:{noOfAnswers:1}});

        res.status(201).json({
            message: "Successfully created answer",
            answer: {
                ...answer.toObject(),
                photoUrl,
                photoId
            }
        });

    } catch (error) {
        console.error('Error creating answer:', error);
        res.status(500).json({ 
            message: 'Error creating answer', 
            error: error.message 
        });
    }
}

export const getAnswersByQuestion=async(req,res)=>{
    try {
        const questionId = req.params.id;

        const answers = await Answers.find({questionId}).populate('postedBy', 'displayName collegeName role _id');

        res.json({message:"Answers Fetch Successful", answers});
    } catch (error) {
        console.log("Error fetching the answers:", error);
        res.status(500).json({
            message: 'Error fetching answers',
            error: error.message
        });
    }
}

export const getAnswer=async(req,res)=>{
    try {
        const answerId=req.params.id

        const answer=await Answers.findById(answerId)

        if(!answer)return res.status(404).json({message:"Answer not Found"})
        
        res.json({
            message: "Answer fetched successfully",
            answer
        })
    } catch (error) {
        console.log("Error fetching the answer:", error);
        res.status(500).json({
            message: 'Error fetching answer',
            error: error.message
        });
    }
}

export const updateAnswer=async(req,res)=>{
    try {
        const answerId = req.params.id;
        const {text} = req.body;
        let photoUrl = '', photoId = '';

        if (req.file) {
            const uploadPromise = new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'image' },
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
                
                uploadStream.end(req.file.buffer);
            });

            const result = await uploadPromise;
            photoUrl = result.secure_url;
            photoId = result.public_id;
        }

        const updateData = {};
        
        if (text) updateData.text = text;

        if (photoUrl && photoId) {
            updateData.photoUrl = photoUrl;
            updateData.photoId = photoId;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ 
                message: "No fields provided for update" 
            });
        }

        const updatedAnswer = await Answers.findByIdAndUpdate(
            answerId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('postedBy', 'displayName collegeName role _id');

        if (!updatedAnswer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        if (photoUrl && updatedAnswer.photoId) {
            await cloudinary.uploader.destroy(updatedAnswer.photoId);
        }

        res.json({ 
            message: "Answer updated successfully", 
            answer: updatedAnswer 
        });

    } catch (error) {
        console.error('Error updating answer:', error);
        res.status(500).json({ 
            message: 'Error updating answer', 
            error: error.message 
        });
    }
}

export const deleteAnswer = async (req, res) => {
    try {
        const answerId = req.params.id;

        const answer = await Answers.findById(answerId);
        
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        if (answer.photoId) {
            await cloudinary.uploader.destroy(answer.photoId);
        }

        await answer.deleteOne();

        await Questions.findByIdAndUpdate(
            answer.questionId,
            { $inc: { noOfAnswers: -1 } }
        );

        res.json({ 
            message: 'Answer deleted successfully' 
        });

    } catch (error) {
        console.error('Error deleting answer:', error);
        res.status(500).json({ 
            message: 'Error deleting answer', 
            error: error.message 
        });
    }
}

export const getUserAnswers = async (req, res) => {
    try {
        const mongoUserId = req.user?.id;
        const firebaseId = req.query?.firebaseId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        if (!mongoUserId && !firebaseId) {
            return res.status(400).json({ 
                message: 'No user ID provided' 
            });
        }

        const query = {
            $or: []
        };

        if (mongoUserId) {
            query.$or.push({ postedBy: mongoUserId });
        }
        if (firebaseId) {
            query.$or.push({ firebasePostedBy: firebaseId });
        }
        
        const total = await Answers.countDocuments(query);
        
        const answers = await Answers.find(query)
            .populate('postedBy', 'displayName collegeName role _id')
            .populate('firebasePostedBy', 'displayName collegeName role _id')
            .populate('questionId', 'text topic branch collegeName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            message: "User answers fetched successfully",
            answers,
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
        console.error('Error fetching user answers:', error);
        res.status(500).json({ 
            message: 'Error fetching user answers', 
            error: error.message 
        });
    }
};
