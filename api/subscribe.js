// /api/subscribe.js
const nodemailer = require('nodemailer');

const EMAIL_TO = 'artur@willonski.com';

// Basic email validation
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

module.exports = async (req, res) => {
  // Allow only POST + simple CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { email, website } = req.body || {};

    // Honeypot (if filled, likely a bot)
    if (website) return res.status(200).json({ message: 'Ok' });

    if (!email || !isEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email.' });
    }

    // Create SMTP transporter (Gmail example)
    // Set these in Vercel: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || 'true') === 'true',
      auth: {
        user: process.env.SMTP_USER, // your mailbox (e.g., Gmail address)
        pass: process.env.SMTP_PASS  // app password (NOT your normal password)
      }
    });

    const info = await transporter.sendMail({
      from: `"Website" <${process.env.SMTP_USER}>`,
      to: EMAIL_TO,
      subject: 'New website email signup',
      text: `New subscriber: ${email}`,
      html: `<p><strong>New subscriber:</strong> ${email}</p>`
    });

    // Optional: also send a confirmation to the subscriber (turn on if you want)
    // await transporter.sendMail({
    //   from: `"Artur" <${process.env.SMTP_USER}>`,
    //   to: email,
    //   subject: 'Thanks for subscribing!',
    //   text: 'You’re on the list. Talk soon!',
    // });

    return res.status(200).json({ message: 'Thanks! You are on the list.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};