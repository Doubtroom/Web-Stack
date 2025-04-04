// routes/authRoutes.js
import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const router = express.Router();

// Serve static files from the public directory
router.use('/public', express.static(path.join(__dirname, '../public')));

const otpStore = {};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Change from 465 to 587
  secure: false, // Use `true` for 465, `false` for 587
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
  tls: {
    rejectUnauthorized: false, // Ignore self-signed certs
  },
});

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your Verification Code for DoubtRoom",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${process.env.BASE_URL || 'http://localhost:3000'}/public/logo.png" alt="DoubtRoom Logo" style="max-width: 150px; height: auto;">
        </div>
        <h2 style="color: #333; text-align: center;">Welcome to DoubtRoom!</h2>
        <p style="color: #666; line-height: 1.6;">Thank you for choosing DoubtRoom as your learning platform. We're excited to have you on board!</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h3 style="color: #333; margin: 0;">Your Verification Code</h3>
          <p style="font-size: 24px; font-weight: bold; color: #2c3e50; letter-spacing: 2px; margin: 10px 0;">${otp}</p>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
        <p style="color: #666; line-height: 1.6;">Please use this code to verify your email address and complete your registration process. If you didn't request this code, please ignore this email.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message, please do not reply to this email.</p>
          <p style="color: #999; font-size: 12px; text-align: center;">© 2024 DoubtRoom. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
});

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    delete otpStore[email];
    res.status(200).json({ message: "OTP verified successfully!" });
  } else {
    res.status(400).json({ message: "Invalid OTP!" });
  }
});

export default router;
