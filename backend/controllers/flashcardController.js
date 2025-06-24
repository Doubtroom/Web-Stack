import FlashcardStatus from '../models/FlashcardStatus.js';
import Questions from '../models/Questions.js';
import Answers from '../models/Answers.js';

const getNextReviewDate = (difficulty) => {
    const now = new Date();
    switch (difficulty) {
        case 'easy':
            return new Date(now.setDate(now.getDate() + 7));
        case 'medium':
            return new Date(now.setDate(now.getDate() + 4));
        case 'hard':
            return new Date(now.setDate(now.getDate() + 1));
        default:
            return new Date();
    }
};

export const upsertFlashcardStatus = async (req, res) => {
    try {
        const { questionId, difficulty } = req.body;
        const userId = req.user.id;

        if (!questionId || !difficulty) {
            return res.status(400).json({ message: 'questionId and difficulty are required.' });
        }

        const nextReviewAt = getNextReviewDate(difficulty);

        const flashcardStatus = await FlashcardStatus.findOneAndUpdate(
            { userId, questionId },
            { difficulty, nextReviewAt, updatedAt: new Date() },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            message: 'Flashcard status updated successfully.',
            flashcardStatus,
        });
    } catch (error) {
        console.error('Error updating flashcard status:', error);
        res.status(500).json({ message: 'Error updating flashcard status', error: error.message });
    }
};

export const getFlashcards = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all questions posted by the user that have an answer
        const userQuestions = await Questions.find({ postedBy: userId }).lean();
        const answeredQuestionIds = await Answers.distinct('questionId', {
            questionId: { $in: userQuestions.map(q => q._id) }
        });
        
        const answeredQuestions = userQuestions.filter(q => 
            answeredQuestionIds.some(aqId => aqId.equals(q._id))
        );

        const flashcards = await Promise.all(
            answeredQuestions.map(async (question) => {
                const answer = await Answers.findOne({ questionId: question._id }).lean();
                const flashcardStatus = await FlashcardStatus.findOne({
                    userId: userId,
                    questionId: question._id,
                }).lean();

                return {
                    _id: question._id,
                    text: question.text,
                    photoUrl: question.photoUrl,
                    answer: {
                        text: answer.text,
                        photoUrl: answer.photoUrl
                    },
                    difficulty: flashcardStatus ? flashcardStatus.difficulty : null,
                };
            })
        );

        res.status(200).json({ flashcards });

    } catch (error) {
        res.status(500).json({
            message: 'Error fetching flashcards',
            error: error.message
        });
    }
}; 