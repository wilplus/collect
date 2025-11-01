// /api/subscribe.js
import nodemailer from 'nodemailer';
const EMAIL_TO = 'a.willonski@gmail.com';
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS'); res.setHeader('Access-Control-Allow-Headers','Content-Type'); return res.status(204).end(); }
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    const { email, website } = req.body || {};
    if (website) return res.status(200).json({ message: 'Ok' });
    if (!email || !isEmail(email)) return res.status(400).json({ message: 'Please provide a valid email.' });

    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS)
      return res.status(500).json({ message: 'Mail env vars missing (HOST/PORT/USER/PASS).' });

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE ?? 'true') === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.verify(); // surfaces auth/connection errors clearly

    await transporter.sendMail({
      from: `"Website" <${SMTP_USER}>`,
      to: EMAIL_TO,
      subject: 'New website email signup',
      html: `<p><strong>New subscriber:</strong> ${email}</p>`,
      text: `New subscriber: ${email}`,
    });

    return res.status(200).json({ message: 'Thanks! You are on the list.' });
  } catch (err) {
    console.error('Subscribe error:', err?.message || err);
    return res.status(500).json({ message: 'SMTP/auth problem or server error. Check function logs.' });
  }
}