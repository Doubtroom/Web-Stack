import nodemailer from "nodemailer"
import express from "express"
import dotenv from 'dotenv'

dotenv.config()

const app=express()
app.use(express.json())

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  app.post('/send-email', async (req, res) => {
    const { to, subject, text } = req.body;
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
      res.status(200).send({ message: 'Email sent successfully!' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send({ message: 'Failed to send email.' });
    }
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });