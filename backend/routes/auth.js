import express from "express"
import {signup, login, getAllUsers} from "../controllers/authController.js"
import { sendOtp, verifyOtp } from '../controllers/otpController.js';
const router=express.Router()

router.post('/signup',signup)
router.post('/login',login)
router.get('/users', getAllUsers)

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router