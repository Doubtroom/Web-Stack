import User from '../models/User.js';
import { sendOtpEmail } from '../utils/email.js';
import mongoose from 'mongoose';

// Create a temporary OTP schema
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

// Create a temporary collection for OTPs
const TempOTP = mongoose.model('TempOTP', otpSchema);

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiresAt = new Date(Date.now() + 5 * 60000); // OTP expires in 5 minutes

  try {
    // Remove any existing OTP for this email
    await TempOTP.deleteMany({ email });

    // Create new OTP entry
    await TempOTP.create({
      email,
      otp: otp.toString(),
      expiresAt
    });

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await TempOTP.findOne({ email });

    
    if (
      !otpRecord ||
      otpRecord.otp !== otp ||
      new Date() > new Date(otpRecord.expiresAt)
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    
    // Delete the OTP after successful verification
    await TempOTP.deleteOne({ email });
    
    const user=await User.findOne({email})
    
    user.isVerified = true;
    await user.save();
    
    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};
