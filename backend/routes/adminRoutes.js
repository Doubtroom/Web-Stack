// routes/adminRoutes.js
import express from "express";
import admin from "firebase-admin";

const router = express.Router();

router.post("/delete-user", async (req, res) => {
  const { email } = req.body;

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().deleteUser(userRecord.uid);
    res.status(200).json({ message: `User with email ${email} deleted successfully.` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: error.message || "Error deleting user." });
  }
});

export default router;
