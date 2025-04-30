"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const messageResponse_1 = require("../utils/messageResponse");
// Create a transporter using SMTP
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});
const sendVerificationEmail = async (email, verificationToken) => {
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
    }
    catch (error) {
        throw (0, messageResponse_1.createError)(500, 'Failed to send verification email');
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
