const express = require('express');
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode');
const NodeCache = require('node-cache');
const pino = require('pino');

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
let clientStatus = "disconnected";
let sock = null;

const SESSION_DIR = process.env.SESSION_DIR || './wa_session';

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

  sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true, // Also prints in Render logs for debugging
    browser: ['Aradhya OTP Bot', 'Chrome', '3.0'],
  });

  // Handle QR code and connection state changes
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      clientStatus = "qr_pending";
      console.log('[WA] QR code generated. Scan it from the admin panel.');
      try {
        qrCodeData = await qrcode.toDataURL(qr);
      } catch (err) {
        console.error('[WA] Error generating QR code image:', err);
      }
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode
        : null;

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      clientStatus = "disconnected";
      qrCodeData = "";

      console.log(`[WA] Connection closed. Status: ${statusCode}. Will reconnect: ${shouldReconnect}`);

      if (shouldReconnect) {
        console.log('[WA] Reconnecting in 3 seconds...');
        setTimeout(connectToWhatsApp, 3000);
      } else {
        console.log('[WA] Logged out. Will not reconnect automatically.');
      }
    }

    if (connection === 'open') {
      clientStatus = "connected";
      qrCodeData = "";
      console.log('[WA] ✅ Successfully connected to WhatsApp!');
    }
  });

  // Save auth credentials whenever they update
  sock.ev.on('creds.update', saveCreds);
}

// Start the WhatsApp connection
connectToWhatsApp().catch(err => {
  console.error('[WA] Fatal error starting WhatsApp client:', err);
});

// ─── Middleware ───────────────────────────────────────────────────
const verifySecret = (req, res, next) => {
  const secret = req.headers['x-bot-secret'];
  if (!secret || secret !== BOT_SECRET) {
    return res.status(401).json({ error: "Unauthorized. Invalid BOT_SECRET." });
  }
  next();
};

// ─── Routes ──────────────────────────────────────────────────────
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
    return res.json({ status: clientStatus, message: "QR Code not ready yet. Please wait a moment..." });
  }
  res.json({ status: clientStatus, qrCode: qrCodeData });
});

app.post('/send-otp', verifySecret, async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  if (clientStatus !== "connected" || !sock) {
    return res.status(503).json({ error: "WhatsApp is not connected. Please scan the QR code first." });
  }

  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  const jid = `${cleanPhone}@s.whatsapp.net`;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpCache.set(cleanPhone, otp);

  try {
    await sock.sendMessage(jid, {
      text: `🎁 *Aradhya E-Gift Verification*\n\nYour OTP is: *${otp}*\n\nValid for 5 minutes. Do not share this code with anyone.`
    });
    console.log(`[WA] OTP sent to ${cleanPhone}`);
    res.json({ success: true, message: "OTP sent via WhatsApp." });
  } catch (error) {
    console.error("[WA] Failed to send OTP:", error);
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
    return res.status(400).json({ error: "OTP expired or invalid. Please request a new one." });
  }

  if (cachedOtp === otp.toString().trim()) {
    otpCache.del(cleanPhone);
    return res.json({ success: true });
  }

  res.status(400).json({ error: "Invalid OTP code." });
});

app.listen(PORT, () => {
  console.log(`[BOT] WhatsApp OTP Bot running on port ${PORT}`);
});
