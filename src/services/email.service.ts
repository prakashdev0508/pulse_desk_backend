import nodemailer from 'nodemailer';
import { createError } from '../utils/messageResponse';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, verificationToken: string) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <h1>Welcome to PulseDesk!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email Address</a>
        <p>If you did not create an account, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw createError(500, 'Failed to send verification email');
  }
}; 