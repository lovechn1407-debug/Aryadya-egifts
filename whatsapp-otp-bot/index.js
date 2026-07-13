const express = require('express');
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const NodeCache = require('node-cache');
const pino = require('pino');
const fs = require('fs');

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

// ─── Middleware ───────────────────────────────────────────────────
const verifySecret = (req, res, next) => {
  const secret = req.headers['x-bot-secret'];
  if (!secret || secret !== BOT_SECRET) {
    return res.status(401).json({ error: "Unauthorized. Invalid BOT_SECRET." });
  }
  next();
};

// ─── Routes ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('WhatsApp OTP Bot is running! 🤖');
});

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

// Start Express server FIRST so health checks work immediately
app.listen(PORT, () => {
  console.log(`[BOT] WhatsApp OTP Bot listening on port ${PORT}`);
  // Start WhatsApp connection AFTER server is ready
  startBot().catch(err => console.error('[WA] Startup error:', err));
});

// ─── WhatsApp Bot ─────────────────────────────────────────────────
async function startBot() {
  // Ensure session directory exists
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
  }

  console.log('[WA] Fetching latest WhatsApp Web version...');
  const { version } = await fetchLatestBaileysVersion();
  console.log(`[WA] Using WA v${version.join('.')}`);

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    browser: ['Aradhya OTP Bot', 'Chrome', '120.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      clientStatus = "qr_pending";
      console.log('[WA] QR code generated. Scan it from the admin panel.');
      try {
        qrCodeData = await qrcode.toDataURL(qr);
        console.log('[WA] QR data URL generated successfully.');
      } catch (err) {
        console.error('[WA] Error generating QR data URL:', err);
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      clientStatus = "disconnected";
      qrCodeData = "";

      console.log(`[WA] Connection closed. Status code: ${statusCode}. Will reconnect: ${shouldReconnect}`);

      if (shouldReconnect) {
        console.log('[WA] Reconnecting in 5 seconds...');
        setTimeout(startBot, 5000);
      } else {
        console.log('[WA] Logged out. Restart the service to generate a new QR.');
      }
    }

    if (connection === 'open') {
      clientStatus = "connected";
      qrCodeData = "";
      console.log('[WA] ✅ Successfully connected to WhatsApp!');
    }
  });
}
