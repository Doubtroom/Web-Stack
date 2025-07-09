import express from "express"
import {verifyAuthentication, verifyToken} from "../middleware/authMiddleware.js"
import { getUser, authStatus, updateFeatures } from "../controllers/authController.js";

const router=express.Router()

router.get('/', verifyAuthentication, getUser)

router.get('/verify', authStatus);

router.post('/features', verifyToken, updateFeatures)

export default router