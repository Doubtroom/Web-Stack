import express from "express"
import nodemailer from "nodemailer"
import bodyParser from "body-parser"
import admin from "firebase-admin"
import dotenv from "dotenv"
import { createRequire } from "module";
import cors from 'cors'

const app = express();
app.use(cors());
dotenv.config();
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
const require = createRequire(import.meta.url);
const serviceAccount = require("./doubt-room-6679c-firebase-adminsdk-fbsvc-04328facac.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const otpStore = {}; // Store OTP temporarily for verification

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD, // App Password, not your actual password!
  },
});

// Send OTP API
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  otpStore[email] = otp;

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your OTP for Signup",
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
});

// Verify OTP API
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    delete otpStore[email]; // Clear OTP after successful verification
    res.status(200).json({ message: "OTP verified successfully!" });
  } else {
    res.status(400).json({ message: "Invalid OTP!" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
