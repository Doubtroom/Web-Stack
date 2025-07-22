import express from "express";
import {
  verifyAuthentication,
  verifyToken,
} from "../middleware/authMiddleware.js";
import {
  getUser,
  authStatus,
  updateFeatures,
} from "../controllers/authController.js";
import { getStarDustInfo } from "../controllers/starDustController.js";

const router = express.Router();

router.get("/", verifyAuthentication, getUser);

router.get("/verify", authStatus);

router.post("/features", verifyToken, updateFeatures);

router.get("/stardust-info", verifyToken, getStarDustInfo);

export default router;
