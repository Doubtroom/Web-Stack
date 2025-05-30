import express from "express"
import {signup, login,saveUserProfile, getAllUsers,logout, googleLogin,getUser} from "../controllers/authController.js"
import { sendOtp, verifyOtp } from '../controllers/otpController.js';
import {handleLogout, verifyToken} from "../middleware/authMiddleware.js"
import { requestReset, verifyResetToken, resetPassword } from '../controllers/passwordResetController.js';

const router=express.Router()

router.post('/signup',signup)
router.post('/login',login)
router.post('/google-login', googleLogin)
router.post('/logout',handleLogout,logout)
router.get('/users', getAllUsers)
router.post('/saveUserProfile',verifyToken, saveUserProfile)

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

router.post('/request-reset', requestReset);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password/:token', resetPassword);

router.get('/user', verifyToken, getUser)


export default router