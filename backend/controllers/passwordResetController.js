import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../utils/email.js";

// Request password reset
export const requestReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // Token expires in 1 hour

    // Save token to user
    user.resetToken = resetToken;
    user.resetExpires = resetExpires;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(email, resetToken, resetExpires.getTime());

    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error in requestReset:", error);
    res
      .status(500)
      .json({ message: "Failed to process password reset request" });
  }
};

// Verify reset token
export const verifyResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    res.json({ message: "Token is valid" });
  } catch (error) {
    console.error("Error in verifyResetToken:", error);
    res.status(500).json({ message: "Failed to verify reset token" });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user's password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
