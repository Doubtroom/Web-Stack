import Answers from "../models/Answers.js";
import Questions from "../models/Questions.js";
import cloudinary from "../utils/cloudinary.js";
import { updateStarDust } from "./starDustController.js";
import { STREAK_ACTIVITY_TYPES,updateUserStreak } from "./streakController.js"; // Use this for new streak activities


export const createAnswer = async (req, res) => {
  try {
    const questionId = req.params.id;
    const { text } = req.body;

    let photoUrl = "",
      photoId = "";

    if (req.file) {
      try {
        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (err, result) => {
              if (err) {
                console.error("Cloudinary upload error:", err);
                reject(err);
              } else {
                console.log("Cloudinary upload result:", result);
                resolve(result);
              }
            },
          );
          uploadStream.end(req.file.buffer);
        });
        const result = await uploadPromise;
        photoUrl = result.secure_url;
        photoId = result.public_id;
        console.log("Photo uploaded successfully:", { photoUrl, photoId });
      } catch (uploadError) {
        console.error("Error uploading to Cloudinary:", uploadError);
        return res.status(500).json({
          message: "Error uploading image",
          error: uploadError.message,
        });
      }
    }

    const answer = await Answers.create({
      text,
      questionId,
      photoUrl,
      photoId,
      postedBy: req.user.id,
    });

    await Questions.findByIdAndUpdate(questionId, { $inc: { noOfAnswers: 1 } });

    // --- STREAK LOGIC FIRST ---
    try {
      const timezoneOffset = Number(req.body.timezoneOffset) || 0;
      const streakResult = await updateUserStreak(req.user.id, "answer", timezoneOffset);
      console.log("StreakResult:",streakResult)
      if (!streakResult.success) {
        await Answers.findByIdAndDelete(answer._id);
        await Questions.findByIdAndUpdate(questionId, { $inc: { noOfAnswers: -1 } });
        return res.status(500).json({ message: "Streak update failed", error: streakResult.message });
      }
    } catch (streakErr) {
      // Rollback answer creation if streak update throws
      await Answers.findByIdAndDelete(answer._id);
      await Questions.findByIdAndUpdate(questionId, { $inc: { noOfAnswers: -1 } });
      return res.status(500).json({ message: "Streak update failed", error: streakErr.message });
    }
    // --- END STREAK LOGIC ---

    // --- STAR DUST LOGIC (FIRE-AND-FORGET) ---
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    updateStarDust({
      userId: req.user.id,
      points: 3,
      action: "postAnswers",
      relatedId: answer._id,
      refModel: "Answers",
      date: today,
    }).catch((err) => {
      console.error("StarDust update failed:", err);
    });
    // --- END STAR DUST LOGIC ---

    res.status(201).json({
      message: "Successfully created answer",
      answer: {
        ...answer.toObject(),
        photoUrl,
        photoId,
      },
    });
  } catch (error) {
    console.error("Error creating answer:", error);
    res.status(500).json({
      message: "Error creating answer",
      error: error.message,
    });
  }
};

export const getAnswersByQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;

    const answers = await Answers.find({ questionId }).populate(
      "postedBy",
      "displayName collegeName role _id",
    );

    res.json({ message: "Answers Fetch Successful", answers });
  } catch (error) {
    console.log("Error fetching the answers:", error);
    res.status(500).json({
      message: "Error fetching answers",
      error: error.message,
    });
  }
};

export const getAnswer = async (req, res) => {
  try {
    const answerId = req.params.id;

    let answer;

    answer = await Answers.findById(answerId);

    res.json({
      message: "Answer fetched successfully",
      answer,
    });
  } catch (error) {
    console.log("Error fetching the answer:", error);
    res.status(500).json({
      message: "Error fetching answer",
      error: error.message,
    });
  }
};

export const updateAnswer = async (req, res) => {
  try {
    const answerId = req.params.id;
    const { text, removePhoto } = req.body;

    const answer = await Answers.findById(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    let { photoUrl, photoId } = answer;
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

    // Update answer fields
    answer.text = text || answer.text;
    answer.photoUrl = photoUrl;
    answer.photoId = photoId;

    const updatedAnswer = await answer.save();

    // Populate postedBy for the response
    await updatedAnswer.populate({
      path: "postedBy",
      select: "displayName collegeName role _id",
    });

    res.json({
      message: "Answer updated successfully",
      answer: updatedAnswer,
    });
  } catch (error) {
    console.error("Error updating answer:", error);
    res.status(500).json({
      message: "Error updating answer",
      error: error.message,
    });
  }
};

export const deleteAnswer = async (req, res) => {
  try {
    const answerId = req.params.id;

    const answer = await Answers.findById(answerId);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    if (answer.photoId) {
      await cloudinary.uploader.destroy(answer.photoId);
    }

    await answer.deleteOne();

    await Questions.findByIdAndUpdate(answer.questionId, {
      $inc: { noOfAnswers: -1 },
    });

    // Subtract points for deleting an answer
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await updateStarDust({
      userId: answer.postedBy,
      points: -3,
      action: "deleteAnswers",
      relatedId: answerId,
      refModel: "Answers",
      date: today,
    });

    res.json({
      message: "Answer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting answer:", error);
    res.status(500).json({
      message: "Error deleting answer",
      error: error.message,
    });
  }
};

export const getUserAnswers = async (req, res) => {
  try {
    const mongoUserId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!mongoUserId) {
      return res.status(400).json({
        message: "No user ID provided",
      });
    }

    const query = { postedBy: mongoUserId };

    const total = await Answers.countDocuments(query);

    const answers = await Answers.find(query)
      .populate("postedBy", "displayName collegeName role _id")
      .populate("questionId", "text topic branch collegeName")
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
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching user answers:", error);
    res.status(500).json({
      message: "Error fetching user answers",
      error: error.message,
    });
  }
};

export const getAnswersByQuestionId = async (req, res) => {
  try {
    const { questionId } = req.params;
    const cursor = req.query.cursor;
    const limit = 5;

    const query = { questionId };

    // Add cursor condition if cursor exists
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    // Get one extra item to check if there are more results
    const answers = await Answers.find(query)
      .populate("postedBy", "displayName collegeName role _id")
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    // Check if there are more results
    const hasMore = answers.length > limit;

    // Remove the extra item if it exists
    const results = hasMore ? answers.slice(0, -1) : answers;

    // Get the cursor for the next page
    const nextCursor =
      results.length > 0 ? results[results.length - 1].createdAt : null;

    res.json({
      message: "Answers fetched successfully",
      answers: results,
      hasMore,
      nextCursor: nextCursor ? nextCursor.toISOString() : null,
    });
  } catch (error) {
    console.log("Error fetching answers:", error);
    res.status(500).json({
      message: "Error fetching answers",
      error: error.message,
    });
  }
};

export const upvoteAnswer = async (req, res) => {
  try {
    const { id: answerId } = req.params;
    const userId = req.user.id;

    // Use findOneAndUpdate with atomic operations to prevent race conditions
    const answer = await Answers.findOneAndUpdate(
      { _id: answerId },
      {},
      { new: true },
    );

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const upvotedIndex = answer.upvotedBy.findIndex((upvoterId) =>
      upvoterId.equals(userId),
    );

    let updatedAnswer;
    let starDustChange = 0;
    let direction = null;
    if (upvotedIndex === -1) {
      // User has not upvoted yet, so upvote
      updatedAnswer = await Answers.findOneAndUpdate(
        { _id: answerId },
        {
          $inc: { upvotes: 1 },
          $addToSet: { upvotedBy: userId },
        },
        {
          new: true,
          runValidators: true,
        },
      ).populate("postedBy", "displayName collegeName role _id");
      // Award +1 StarDust to answer author
      starDustChange = 1;
      direction = "in";
    } else {
      // User has already upvoted, so remove upvote
      updatedAnswer = await Answers.findOneAndUpdate(
        { _id: answerId },
        {
          $inc: { upvotes: -1 },
          $pull: { upvotedBy: userId },
        },
        {
          new: true,
          runValidators: true,
        },
      ).populate("postedBy", "displayName collegeName role _id");
      // Remove 1 StarDust from answer author
      starDustChange = -1;
      direction = "out";
    }

    // Ensure upvotes count is never negative
    if (updatedAnswer.upvotes < 0) {
      updatedAnswer.upvotes = 0;
      await updatedAnswer.save();
    }
    // Only update StarDust if the upvoter is not the answer author
    if (userId !== String(answer.postedBy)) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      await updateStarDust({
        userId: answer.postedBy,
        points: starDustChange,
        action: starDustChange > 0 ? "upvote" : "lostUpvote",
        relatedId: answerId,
        refModel: "Answers",
        date: today,
      });
    }

    res.json({
      message: "Upvote status updated successfully",
      answer: updatedAnswer,
    });
  } catch (error) {
    console.error("Error upvoting answer:", error);
    res.status(500).json({
      message: "Error upvoting answer",
      error: error.message,
    });
  }
};
