const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendResetEmail = async (toEmail, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  await resend.emails.send({
    from: 'AuthKit <onboarding@resend.dev>', // free tier default sender
    to: toEmail,
    subject: 'Reset your AuthKit password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="
          display: inline-block;
          background: #1A1A1A;
          color: #fff;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          margin: 16px 0;
        ">Reset password</a>
        <p style="color: #888; font-size: 13px;">
          If you didn't request this, ignore this email.
          Your password won't change.
        </p>
      </div>
    `
  });
};

module.exports = { sendResetEmail };