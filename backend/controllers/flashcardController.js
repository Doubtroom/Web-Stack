import FlashcardStatus from '../models/FlashcardStatus.js';

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