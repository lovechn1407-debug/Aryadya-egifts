const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const NodeCache = require('node-cache');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const BOT_SECRET = process.env.BOT_SECRET;

if (!BOT_SECRET) {
  console.error("FATAL ERROR: BOT_SECRET is not defined in environment variables!");
  process.exit(1);
}

// 5 minutes TTL for OTP cache
const otpCache = new NodeCache({ stdTTL: 300 });

let qrCodeData = "";
let clientStatus = "disconnected"; // disconnected, qr_pending, connected

// Initialize WhatsApp Web Client
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './wa_session'
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null
  }
});

client.on('qr', (qr) => {
  clientStatus = "qr_pending";
  qrcode.toDataURL(qr, (err, url) => {
    if (!err) {
      qrCodeData = url;
    }
  });
});

client.on('ready', () => {
  clientStatus = "connected";
  qrCodeData = "";
  console.log('WhatsApp Web Client is ready!');
});

client.on('authenticated', () => {
  console.log('WhatsApp Web Client authenticated successfully');
});

client.on('auth_failure', (msg) => {
  clientStatus = "disconnected";
  console.error('WhatsApp Web authentication failure:', msg);
});

client.on('disconnected', (reason) => {
  clientStatus = "disconnected";
  qrCodeData = "";
  console.log('WhatsApp Web Client was disconnected:', reason);
  // Re-initialize client
  client.initialize();
});

client.initialize().catch(err => {
  console.error("Failed to initialize WhatsApp client:", err);
});

// Middleware for bot secret verification
const verifySecret = (req, res, next) => {
  const secret = req.headers['x-bot-secret'];
  if (!secret || secret !== BOT_SECRET) {
    return res.status(401).json({ error: "Unauthorized. Invalid BOT_SECRET." });
  }
  next();
};

// Endpoints
app.get('/health', (req, res) => {
  res.json({ ok: true, clientStatus });
});

app.get('/status', verifySecret, (req, res) => {
  res.json({ status: clientStatus });
});

app.get('/qr', verifySecret, (req, res) => {
  if (clientStatus === "connected") {
    return res.json({ status: "connected", message: "Already connected" });
  }
  if (!qrCodeData) {
    return res.json({ status: clientStatus, message: "QR Code not ready yet. Please wait..." });
  }
  res.json({ status: clientStatus, qrCode: qrCodeData });
});

app.post('/send-otp', verifySecret, async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  if (clientStatus !== "connected") {
    return res.status(503).json({ error: "WhatsApp Client is not connected" });
  }

  // Format phone to WhatsApp JID format (e.g., 919876543210@c.us)
  // Strip non-digits and add country code if missing
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone; // Default to India if 10 digits
  }
  
  const jid = `${cleanPhone}@c.us`;

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP in cache
  otpCache.set(cleanPhone, otp);

  try {
    const messageText = `Your Aradhya E-Gift verification code is: *${otp}*.\nIt is valid for 5 minutes. Do not share it with anyone.`;
    await client.sendMessage(jid, messageText);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    res.status(500).json({ error: "Failed to send WhatsApp OTP: " + error.message });
  }
});

app.post('/verify-otp', verifySecret, (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required" });
  }

  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  const cachedOtp = otpCache.get(cleanPhone);
  if (!cachedOtp) {
    return res.status(400).json({ error: "OTP expired or invalid" });
  }

  if (cachedOtp === otp.toString().trim()) {
    otpCache.del(cleanPhone); // Clear after successful verification
    return res.json({ success: true });
  }

  res.status(400).json({ error: "Invalid OTP code" });
});

app.listen(PORT, () => {
  console.log(`WhatsApp OTP Bot listening on port ${PORT}`);
});
