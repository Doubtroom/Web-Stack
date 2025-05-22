import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `<p>Your OTP is: <strong>${otp}</strong></p><p>This code is valid for 5 minutes.</p>`
  };

  await transporter.sendMail(mailOptions);
};
