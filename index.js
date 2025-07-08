import dotenv from 'dotenv';
dotenv.config();

import {
  makeWASocket,
  fetchLatestBaileysVersion,
  DisconnectReason,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';

import pino from 'pino';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import config from './config.js';
import autoreact from './lib/autoreact.js';
import { fileURLToPath } from 'url';
import { File } from 'megajs';

import { Handler } from './data/handler.js';
import { Callupdate } from './data/callupdate.js';
import { GroupUpdate } from './data/groupupdate.js';

const { emojis, doReact } = autoreact;
let useQR = false;
let initialConnection = true;

const MAIN_LOGGER = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` });
const logger = MAIN_LOGGER.child({});
logger.level = 'trace';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

async function downloadSessionData() {
  console.log("Debug SESSION_ID:", config.SESSION_ID);
  if (!config.SESSION_ID) {
    console.error("❌ Please set your SESSION_ID env!");
    return false;
  }
  const sessionEncoded = config.SESSION_ID.split("LORD~OBITO~MD~")[1];
  if (!sessionEncoded || !sessionEncoded.includes('#')) {
    console.error("❌ Invalid SESSION_ID format! It must contain both file ID and decryption key.");
    return false;
  }
  const [fileId, decryptionKey] = sessionEncoded.split('#');
  try {
    console.log("🔄 Downloading session from MEGA...");
    const sessionFile = File.fromURL(`https://mega.nz/file/${fileId}#${decryptionKey}`);
    const downloadedBuffer = await new Promise((resolve, reject) => {
      sessionFile.download((error, data) => error ? reject(error) : resolve(data));
    });
    await fs.writeFile(credsPath, downloadedBuffer);
    console.log("🔒 Session successfully loaded!");
    return true;
  } catch (error) {
    console.error("❌ Failed to download session:", error);
    return false;
  }
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`🤖 LORD_OBITO-MD using WA v${version.join('.')} | latest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: useQR,
    browser: ['LORD_OBITO-MD', 'Safari', '3.3'],
    auth: state,
    getMessage: async key => ({ conversation: "LORD_OBITO-MD bot user" }),
  });

  sock.ev.on("connection.update", async update => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) start();
    } else if (connection === "open") {
      if (initialConnection) {
        console.log(chalk.green("✅ LORD_OBITO-MD is online!"));
        await sock.sendMessage(sock.user.id, {
          image: { url: 'https://files.catbox.moe/yqnuab.jpg' },
          caption: `╔═══════════════════
║ 🌨️ *LORD_OBITO-MD CONNECTED*
╠═══════════════════
║ 🔥 Welcome, mighty warrior of the lord_obito-md!
║ ⚡ Bot: LORD_OBITO-MD activated
║ 👑 Owner: ${config.OWNER_NAME} (+${config.OWNER_NUMBER})
║ 📢 Channel: ${config.CHANNEL_URL}
╚═══════════════════`,
          contextInfo: {
            externalAdReply: {
              title: "LORD_OBITO-MD Bot",
              body: "🧊 The strongest WhatsApp bot in the North",
              thumbnailUrl: "https://files.catbox.moe/1sh2uh.jpg",
              sourceUrl: config.CHANNEL_URL,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        });
        initialConnection = false;
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // Handlers
  sock.ev.on("messages.upsert", msg => Handler(msg, sock, logger));
  sock.ev.on("call", call => Callupdate(call, sock));
  sock.ev.on("group-participants.update", group => GroupUpdate(sock, group));

  // Auto-reaction
  sock.ev.on("messages.upsert", async update => {
    try {
      const msg = update.messages[0];
      if (!msg.key.fromMe && config.AUTO_REACT && msg.message) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        await doReact(emoji, msg, sock);
      }
    } catch (err) {
      console.error("Auto react error:", err);
    }
  });
}

async function init() {
  if (fs.existsSync(credsPath)) {
    console.log("🔒 Session file found, starting bot without QR.");
    await start();
  } else {
    const downloaded = await downloadSessionData();
    if (downloaded) {
      console.log("✅ Session downloaded, starting bot.");
      await start();
    } else {
      console.log("❌ No session found, displaying QR code.");
      useQR = true;
      await start();
    }
  }
}

init();
