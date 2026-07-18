import Questions from "../models/Questions.js";
import Answers from "../models/Answers.js";
import cloudinary from "../utils/cloudinary.js";
import FlashcardStatus from "../models/FlashcardStatus.js";
import { updateStarDust } from "./starDustController.js";
import { STREAK_ACTIVITY_TYPES, updateUserStreak } from "./streakController.js"; // Use this for new streak activities
import {
  embed,
  isEmbeddingsEnabled,
  cosineSimilarity,
} from "../utils/embeddings.js";
// When adding a new activity that should count toward streaks, add it to STREAK_ACTIVITY_TYPES in streakController.js

export const createQuestion = async (req, res) => {
  try {
    const { text, topic, branch, collegeName } = req.body;
    let photoUrl = "",
      photoId = "";

    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          },
        );
        uploadStream.end(req.file.buffer);
      });
      const result = await uploadPromise;
      photoUrl = result.secure_url;
      photoId = result.public_id;
    }

    const question = await Questions.create({
      text,
      topic,
      branch,
      collegeName,
      photoUrl,
      photoId,
      postedBy: req.user.id,
    });

    // --- STREAK LOGIC FIRST ---
    try {
      const timezoneOffset = Number(req.body.timezoneOffset) || 0;
      const streakResult = await updateUserStreak(
        req.user.id,
        "question",
        timezoneOffset,
      );
      if (!streakResult.success) {
        // Rollback question creation if streak update fails
        await Questions.findByIdAndDelete(question._id);
        return res
          .status(500)
          .json({
            message: "Streak update failed",
            error: streakResult.message,
          });
      }
    } catch (streakErr) {
      // Rollback question creation if streak update throws
      await Questions.findByIdAndDelete(question._id);
      return res
        .status(500)
        .json({ message: "Streak update failed", error: streakErr.message });
    }
    // --- END STREAK LOGIC ---

    // --- STAR DUST LOGIC (FIRE-AND-FORGET) ---
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    updateStarDust({
      userId: req.user.id,
      points: 2,
      action: "postQuestions",
      relatedId: question._id,
      refModel: "Questions",
      date: today,
    }).catch((err) => {
      console.error("StarDust update failed:", err);
    });
    // --- END STAR DUST LOGIC ---

    // --- EMBEDDING (FIRE-AND-FORGET) ---
    // Vectorize topic + text for semantic duplicate detection. Failures are
    // logged and ignored: a question must never fail to post because an
    // external embeddings API hiccuped.
    if (isEmbeddingsEnabled()) {
      embed(`${topic || ""} ${text || ""}`.trim())
        .then((vector) => {
          if (vector) {
            return Questions.updateOne(
              { _id: question._id },
              { $set: { embedding: vector } },
            );
          }
        })
        .catch((err) => {
          console.error("Embedding failed:", err.message);
        });
    }
    // --- END EMBEDDING ---

    res
      .status(201)
      .json({ message: "Successfully created Question", question });
  } catch (error) {
    console.error("Error creating question:", error);
    res
      .status(500)
      .json({ message: "Error creating question", error: error.message });
  }
};

export const getQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;

    const question = await Questions.findById(questionId).populate(
      "postedBy",
      "displayName collegeName role _id",
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({
      message: "Question fetched successfully",
      question,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({
      message: "Error fetching question",
      error: error.message,
    });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Questions.countDocuments();

    const questions = await Questions.find()
      .populate("postedBy", "displayName collegeName role _id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      questions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      message: "Error fetching questions",
      error: error.message,
    });
  }
};

export const getFilteredQuestions = async (req, res) => {
  try {
    const { branch, topic, search, collegeName } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (search) {
      filter.$or = [
        { text: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
        { branch: { $regex: search, $options: "i" } },
        { collegeName: { $regex: search, $options: "i" } },
      ];
    } else {
      if (branch) {
        filter.branch = branch;
      }
      if (topic) {
        filter.topic = topic;
      }
      if (collegeName) {
        filter.collegeName = collegeName;
      }
    }

    const total = await Questions.countDocuments(filter);

    const questions = await Questions.find(filter)
      .populate("postedBy", "displayName collegeName role _id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      questions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        branch: branch || "all",
        topic: topic || "all",
        search: search || "",
        collegeName: collegeName || "all",
      },
    });
  } catch (error) {
    console.error("Error fetching filtered questions:", error);
    res.status(500).json({
      message: "Error fetching filtered questions",
      error: error.message,
    });
  }
};

// Atlas Vector Search reports cosine scores mapped to [0, 1] via (1+cos)/2;
// the fallback below converts raw cosine to the same scale so one threshold
// works for both paths.
const SIMILAR_LIMIT = 5;
const similarityThreshold = () =>
  Number(process.env.SIMILARITY_THRESHOLD) || 0.75;

const vectorSearch = async (vector, branch) => {
  const results = await Questions.aggregate([
    {
      $vectorSearch: {
        index: "question_embeddings",
        path: "embedding",
        queryVector: vector,
        numCandidates: 100,
        limit: SIMILAR_LIMIT,
        ...(branch ? { filter: { branch } } : {}),
      },
    },
    {
      $project: {
        text: 1,
        topic: 1,
        branch: 1,
        collegeName: 1,
        noOfAnswers: 1,
        createdAt: 1,
        postedBy: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);
  return results.filter((r) => r.score >= similarityThreshold());
};

// Plan B when $vectorSearch is unavailable (local mongod, missing Atlas
// index): score recent questions in-process. Fine at this corpus size; the
// Atlas index is the scalable path.
const cosineFallback = async (vector, branch) => {
  const filter = {
    embedding: { $exists: true, $type: "array" },
    ...(branch ? { branch } : {}),
  };

  const candidates = await Questions.find(filter)
    .select(
      "+embedding text topic branch collegeName noOfAnswers createdAt postedBy",
    )
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  return candidates
    .map((candidate) => {
      const score = (1 + cosineSimilarity(vector, candidate.embedding)) / 2;
      const { embedding, ...rest } = candidate;
      return { ...rest, score };
    })
    .filter((c) => c.score >= similarityThreshold())
    .sort((a, b) => b.score - a.score)
    .slice(0, SIMILAR_LIMIT);
};

export const findSimilarQuestions = async (req, res) => {
  try {
    const { text, branch } = req.body;

    if (!isEmbeddingsEnabled()) {
      return res.json({ suggestions: [], enabled: false });
    }

    // Too little text to embed meaningfully.
    if (!text || text.trim().length < 15) {
      return res.json({ suggestions: [], enabled: true });
    }

    const vector = await embed(text.trim());
    if (!vector) {
      return res.json({ suggestions: [], enabled: false });
    }

    let suggestions;
    try {
      suggestions = await vectorSearch(vector, branch);
    } catch {
      suggestions = await cosineFallback(vector, branch);
    }

    await Questions.populate(suggestions, {
      path: "postedBy",
      select: "displayName",
    });

    res.json({ suggestions, enabled: true });
  } catch (error) {
    console.error("Error finding similar questions:", error);
    res.status(500).json({
      message: "Error finding similar questions",
      error: error.message,
    });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const { text, topic, branch, removePhoto } = req.body;

    const question = await Questions.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    let { photoUrl, photoId } = question;
    const oldPhotoId = photoId;

    // If a new file is uploaded, replace the old one
    if (req.file) {
      if (oldPhotoId) {
        await cloudinary.uploader.destroy(oldPhotoId);
      }
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          },
        );
        uploadStream.end(req.file.buffer);
      });
      photoUrl = result.secure_url;
      photoId = result.public_id;
    }
    // If removePhoto is flagged, remove the existing photo
    else if (removePhoto === "true" && oldPhotoId) {
      await cloudinary.uploader.destroy(oldPhotoId);
      photoUrl = "";
      photoId = "";
    }

    // Update question fields
    question.text = text || question.text;
    question.topic = topic || question.topic;
    question.branch = branch || question.branch;
    question.photoUrl = photoUrl;
    question.photoId = photoId;

    const updatedQuestion = await question.save();

    // Populate postedBy for the response
    await updatedQuestion.populate({
      path: "postedBy",
      select: "displayName collegeName role _id",
    });

    res.json({
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({
      message: "Error updating question",
      error: error.message,
    });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const question = await Questions.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Delete question's photo from Cloudinary
    if (question.photoId) {
      await cloudinary.uploader.destroy(question.photoId);
    }

    // Find all answers associated with the question
    const answers = await Answers.find({ questionId: questionId });

    // Delete photos for each answer from Cloudinary
    for (const answer of answers) {
      if (answer.photoId) {
        await cloudinary.uploader.destroy(answer.photoId);
      }
    }

    // Delete all answers associated with the question
    await Answers.deleteMany({ questionId: questionId });

    // Delete the question itself
    await question.deleteOne();

    // Subtract points for deleting a question
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await updateStarDust({
      userId: question.postedBy,
      points: -2,
      action: "deleteQuestions",
      relatedId: questionId,
      refModel: "Questions",
      date: today,
    });

    res.json({
      message: "Question and associated answers deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res
      .status(500)
      .json({ message: "Error deleting question", error: error.message });
  }
};

export const getUserQuestions = async (req, res) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({
        message: "No user ID provided",
      });
    }

    const query = { postedBy: userId };

    const total = await Questions.countDocuments(query);

    const questions = await Questions.find(query)
      .populate("postedBy", "displayName collegeName role _id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const questionsWithAnswersAndStatus = await Promise.all(
      questions.map(async (question) => {
        const answer = await Answers.findOne({
          questionId: question._id,
        }).lean();
        const flashcardStatus = await FlashcardStatus.findOne({
          user: userId,
          question: question._id,
        }).lean();

        return {
          ...question,
          answer: answer
            ? { text: answer.text, photoUrl: answer.photoUrl }
            : { text: "No answer yet. Add one!", photoUrl: null },
          difficulty: flashcardStatus ? flashcardStatus.difficulty : null,
        };
      }),
    );

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      message: "User questions fetched successfully",
      questions: questionsWithAnswersAndStatus,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching user questions:", error);
    res.status(500).json({
      message: "Error fetching user questions",
      error: error.message,
    });
  }
};
