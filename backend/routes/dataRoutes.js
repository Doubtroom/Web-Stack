import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createQuestion,
  updateQuestion,
  getAllQuestions,
  getFilteredQuestions,
  deleteQuestion,
  getQuestion,
  getUserQuestions,
} from "../controllers/questionsController.js";
import {
  createAnswer,
  getAnswersByQuestionId,
  updateAnswer,
  deleteAnswer,
  getAnswer,
  getUserAnswers,
} from "../controllers/answersController.js";
import {
  createComment,
  getCommentsByAnswer,
  deleteComment,
  updateComment,
} from "../controllers/commentsController.js";
import {
  reportQuestion,
  getReportedQuestions,
  removeReport,
} from "../controllers/reportedQuestionsController.js";
import {
  createCustomerCare,
  getCustomerCareRequests,
  getUserCustomerCareRequests,
} from "../controllers/customerCareController.js";
import upload from "../middleware/multer.js";
import { upvoteAnswer } from "../controllers/answersController.js";
import { upvoteComment } from "../controllers/commentsController.js";
import {
  upsertFlashcardStatus,
  getFlashcards,
} from "../controllers/flashcardController.js";
import { updateStreak, getStreak } from "../controllers/streakController.js";

const router = express.Router();

router.post("/questions", verifyToken, upload, createQuestion);
router.get("/questions/filter", verifyToken, getFilteredQuestions);
router.get("/questions/user", verifyToken, getUserQuestions);
router.get("/questions", verifyToken, getAllQuestions);
router.get("/questions/:id", verifyToken, getQuestion);
router.patch("/questions/:id", verifyToken, upload, updateQuestion);
router.delete("/questions/:id", verifyToken, deleteQuestion);
router.get(
  "/questions/:questionId/answers",
  verifyToken,
  getAnswersByQuestionId,
);

router.post("/questions/:id/answers", verifyToken, upload, createAnswer);
router.get("/answers/user", verifyToken, getUserAnswers);
router.get("/answers/:id", verifyToken, getAnswer);
router.put("/answers/:id", verifyToken, upload, updateAnswer);
router.delete("/answers/:id", verifyToken, deleteAnswer);
router.patch("/answers/:id/upvote", verifyToken, upvoteAnswer);

router.post("/answers/:id/comments", verifyToken, createComment);
router.get("/answers/:id/comments", verifyToken, getCommentsByAnswer);
router.patch("/comments/:id", verifyToken, updateComment);
router.delete("/comments/:id", verifyToken, deleteComment);
router.patch("/comments/:id/upvote", verifyToken, upvoteComment);

router.post("/questions/:id/report", verifyToken, reportQuestion);
router.get("/reported-questions", verifyToken, getReportedQuestions);
router.delete("/questions/:id/reports/:reportId", verifyToken, removeReport);

router.post("/customer-care", verifyToken, createCustomerCare);
router.get("/customer-care", verifyToken, getCustomerCareRequests);
router.get("/customer-care/user", verifyToken, getUserCustomerCareRequests);

router.post("/flashcards/status", verifyToken, upsertFlashcardStatus);
router.get("/flashcards", verifyToken, getFlashcards);


router.get("/streak", verifyToken, getStreak);
router.post("/streak/update", verifyToken, updateStreak);

export default router;
