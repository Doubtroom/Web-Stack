import User from '../models/User.js'
import { sendOtpEmail } from '../utils/email.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const sendOtp = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60000);

    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

    user.otp = {
      code: hashedOtp,
      expiresAt
    };
    
    await user.save();

    await sendOtpEmail(user.email, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      !user.otp ||
      !user.otp.code ||
      new Date() > new Date(user.otp.expiresAt)
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const isValidOtp = await bcrypt.compare(otp.toString(), user.otp.code);
    if (!isValidOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const newRefreshToken = jwt.sign(
      {id: user._id},
      process.env.REFRESH_TOKEN_SECRET,
      {expiresIn: "30d"}
    )

    const encryptedRefreshToken = await bcrypt.hash(newRefreshToken, 12)

    user.refreshToken = encryptedRefreshToken
    user.otp = undefined;
    user.isVerified = true;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    })

    res.json({ 
      message: "OTP verified successfully",
      user: {
        userId: user._id,
        email: user.email,
        displayName: user.displayName,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};
