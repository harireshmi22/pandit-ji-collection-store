import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetPasswordEmail = async (email, token) => {
<<<<<<< HEAD
  const response = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email ,
    subject: 'Reset Your Password',
    html: `Click <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}">here</a> to reset your password`,
  });
=======
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Missing API key. Please set RESEND_API_KEY in environment variables.');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

  // In development, Resend only delivers to your verified email (onboarding@resend.dev restriction)
  const toEmail = process.env.NODE_ENV === 'development'
    ? process.env.DEV_EMAIL || email
    : email;

  const response = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: toEmail,
    subject: 'Reset Your Password',
    html: `Click <a href="${appUrl}/reset-password?token=${token}">here</a> to reset your password`,
  });

  if (response?.error) {
    throw new Error(`Resend email send failed: ${response.error.message}`);
  }

  return response?.data;
>>>>>>> 01ca697 (files added with fixed bugs)
};