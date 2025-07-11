import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<p>Your OTP is: <strong>${otp}</strong></p><p>This code is valid for 5 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email, resetToken, expiresAt) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}?expires=${expiresAt}`;
  const expiryDate = new Date(expiresAt);
  const expiryString = expiryDate.toLocaleString("en-US", { hour12: true });

  const mailOptions = {
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset</p>
      <p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>
      <p>This link will expire on <strong>${expiryString}</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
