import crypto from 'crypto';
import nodemailer from 'nodemailer';

import {
  passwordResetEmailTemplate,
  verificationEmailTemplate,
} from '@/lib/email-templates';
import User from '@/models/user';

export async function sendEmail(
  email: string,
  emailType: 'verify' | 'reset',
  userId: string,
) {
  try {
    const user = await User.findById(userId);
    const now = Date.now();

    // hash id to create a token (for email verification or password reset)
    const hashedToken = crypto.randomBytes(128).toString('hex');
    if (emailType === 'verify') {
      // check if last verify request was made within 3 minutes and throw an error if condition is met
      if (
        user.lastVerifyTokenRequest &&
        now - user.lastVerifyTokenRequest < 180000
      ) {
        // 180000 ms = 3 minutes
        throw new Error(
          'Please wait before requesting a new email verification.',
        );
      }
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: now + 86400000, // 24 hours
        lastVerifyTokenRequest: now, // Update the last request timestamp
      });
    } else if (emailType === 'reset') {
      // check if last password reset request was made within 3 minutes and throw an error if condition is met
      if (
        user.lastForgotPasswordTokenRequest &&
        now - user.lastForgotPasswordTokenRequest < 180000
      ) {
        // 180000 ms = 3 minutes
        throw new Error(
          'Please wait before requesting a new password reset token.',
        );
      }
      await User.findByIdAndUpdate(userId, {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: now + 14400000, // 4 hours
        lastForgotPasswordTokenRequest: now,
      });
    }

    // verification link
    const verificationLink = `${process.env.DOMAIN}/auth/verify-email?token=${hashedToken}`;
    const resetLink = `${process.env.DOMAIN}/auth/password-reset?token=${hashedToken}`;

    // nodemailer transporter with options
    const transporter = nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    const mailOptions = {
      from: 'inkwell.insights@outlook.com',
      to: email,
      subject:
        emailType === 'verify'
          ? 'Inkwell Insights Blog - Verify your email'
          : 'Inkwell Insights Blog - Reset your password',
      html:
        emailType === 'verify'
          ? verificationEmailTemplate(verificationLink)
          : passwordResetEmailTemplate(resetLink),
    };
    const mailResponse = await transporter.sendMail(mailOptions);
    return mailResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
}
