// Simple Express server for sending emails via Gmail SMTP
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

// Set your Gmail credentials in environment variables GMAIL_USER and GMAIL_PASS
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/send-invite', async (req, res) => {
  const { to, link } = req.body;
  if (!to || !link) {
    return res.status(400).json({ error: 'Missing to or link' });
  }
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Join my Show Production',
    text: `Join me at ${link}`,
    html: `<p>Join me at <a href="${link}">${link}</a></p>`
  };
  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Gmail email API listening on port ${PORT}`);
});
