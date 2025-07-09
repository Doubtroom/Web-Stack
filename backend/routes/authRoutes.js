import express from "express"
import {signup, login, saveUserProfile, getAllUsers, logout, googleLogin, getUser, authStatus, updateFeatures} from "../controllers/authController.js"
import { sendOtp, verifyOtp } from '../controllers/otpController.js';
import {handleLogout, verifyAuthentication,verifyToken} from "../middleware/authMiddleware.js"
import { requestReset, verifyResetToken, resetPassword } from '../controllers/passwordResetController.js';
import {
  signupLimiter,
  loginLimiter,
  sendOtpLimiter,
  verifyOtpLimiter,
  googleLoginLimiter,
  requestResetLimiter,
  verifyResetLimiter,
  resetPasswordLimiter
} from '../middleware/rateLimiterMiddleware.js';

const router=express.Router()

router.post('/signup', signupLimiter, signup)
router.post('/login', loginLimiter, login)
router.post('/saveUserProfile',verifyToken, saveUserProfile)
router.get('/users',verifyToken, getAllUsers)
router.post('/logout',handleLogout, logout)
router.post('/google-login', googleLoginLimiter, googleLogin)
router.post('/send-otp', sendOtpLimiter, sendOtp)
router.post('/verify-otp', verifyOtpLimiter, verifyOtp)
router.post('/request-reset', requestResetLimiter, requestReset)
router.get('/verify-reset/:token', verifyResetLimiter, verifyResetToken)
router.post('/reset-password/:token', resetPasswordLimiter, resetPassword)

router.get('/user', verifyAuthentication, getUser)

router.get('/verify', authStatus);

router.post('/user/features', verifyToken, updateFeatures)

export default router