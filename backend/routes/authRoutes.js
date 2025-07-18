import express from "express";
import {
  signup,
  login,
  saveUserProfile,
  logout,
  googleLogin,
  getUser,
  authStatus,
  updateFeatures,
} from "../controllers/authController.js";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import {
  handleLogout,
  verifyAuthentication,
  verifyToken,
} from "../middleware/authMiddleware.js";
import {
  requestReset,
  verifyResetToken,
  resetPassword,
} from "../controllers/passwordResetController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/saveUserProfile", verifyToken, saveUserProfile);
router.post("/logout", handleLogout, logout);
router.post("/google-login", googleLogin);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/request-reset", requestReset);
router.get("/verify-reset/:token", verifyResetToken);
router.post("/reset-password/:token", resetPassword);

export default router;
