import express from 'express'
import { verifyToken } from '../middleware/authMiddleware.js'
import {createQuestion,updateQuestion, getAllQuestions, getFilteredQuestions, deleteQuestion,getQuestion, getUserQuestions} from '../controllers/questionsController.js'
import {createAnswer, getAnswersByQuestion, updateAnswer, deleteAnswer,getAnswer, getUserAnswers} from '../controllers/answersController.js'
import {createComment, getCommentsByAnswer, deleteComment,updateComment} from '../controllers/commentsController.js'
import {reportQuestion, getReportedQuestions, removeReport} from '../controllers/reportedQuestionsController.js'
import {createCustomerCare, getCustomerCareRequests, getUserCustomerCareRequests} from '../controllers/customerCareController.js'
import { upload } from '../middleware/multer.js';


const router=express.Router();

router.post('/questions',verifyToken,upload.single('image'),createQuestion)
router.get('/questions/filter',verifyToken, getFilteredQuestions)
router.get('/questions/user', verifyToken, getUserQuestions)
router.get('/questions',verifyToken,getAllQuestions)
router.get('/questions/:id',verifyToken,getQuestion)
router.delete('/questions/:id', verifyToken, deleteQuestion)
router.patch('/questions/:id', verifyToken, upload.single('image'), updateQuestion)

router.post('/questions/:id/answers', verifyToken, upload.single('image'), createAnswer);
router.get('/questions/:id/answers', verifyToken, getAnswersByQuestion);
router.post('/answers/user', verifyToken, getUserAnswers);
router.get('/answers/:id', verifyToken, getAnswer);
router.put('/answers/:id', verifyToken, updateAnswer);
router.delete('/answers/:id', verifyToken, deleteAnswer);

router.post('/comments/:id',verifyToken,createComment)
router.get('/answers/:id/comments',verifyToken,getCommentsByAnswer)
router.delete('/comments/:id',verifyToken,deleteComment)
router.patch('/comments/:id',verifyToken,updateComment)

router.post('/questions/:id/report', verifyToken, reportQuestion);
router.get('/reported-questions', verifyToken, getReportedQuestions);
router.delete('/questions/:id/reports/:reportId', verifyToken, removeReport);

router.post('/customer-care', verifyToken, createCustomerCare);
router.get('/customer-care', verifyToken, getCustomerCareRequests);
router.get('/customer-care/user', verifyToken, getUserCustomerCareRequests);

export default router

