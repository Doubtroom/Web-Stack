import Questions from "../models/Questions.js";
import Answers from "../models/Answers.js";
import cloudinary from "../utils/cloudinary.js";
import FlashcardStatus from "../models/FlashcardStatus.js";

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

    // --- STREAK LOGIC STARTS HERE ---
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = await Streak.findOne({ userId });

    if (!streak) {
      streak = new Streak({
        userId,
        currentStreak: 1,
        currentStreakStartDate: today,
        lastActiveDate: today,
        longestStreak: 1,
        longestStreakStartDate: today,
        longestStreakEndDate: today,
      });
    } else {
      const lastActive = new Date(streak.lastActiveDate || 0);
      lastActive.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        streak.currentStreak += 1;
        streak.lastActiveDate = today;
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
          streak.longestStreakStartDate = streak.currentStreakStartDate;
          streak.longestStreakEndDate = today;
        }
      } else if (dayDiff > 1) {
        streak.currentStreak = 1;
        streak.currentStreakStartDate = today;
        streak.lastActiveDate = today;
      }
    }

    streak.updatedAt = new Date();
    await streak.save();
    // --- STREAK LOGIC ENDS HERE ---

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
