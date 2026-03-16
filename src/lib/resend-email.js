import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetPasswordEmail = async (email, token) => {
  const response = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email ,
    subject: 'Reset Your Password',
    html: `Click <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}">here</a> to reset your password`,
  });
};