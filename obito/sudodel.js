import config from '../config.js';
import fs from 'fs-extra';

const sudoFile = './lib/sudo.json';

export default {
  name: 'sudodel',
  category: 'Sudo',
  execute: async (sock, msg, args) => {
    const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];

    // Charger sudo list
    let sudoList = [];
    if (fs.existsSync(sudoFile)) {
      sudoList = JSON.parse(await fs.readFile(sudoFile));
    }

    // Vérifier permission OWNER ou SUDO
    if (sender !== config.OWNER_NUMBER && !sudoList.includes(sender)) {
      return sock.sendMessage(msg.key.remoteJid, { text: '🚫 *Access denied. Owner or Sudo only.*' });
    }

    // Obtenir numéro via reply ou args
    let numberToDel = null;

    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      numberToDel = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
    } else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      numberToDel = msg.message.extendedTextMessage.contextInfo.participant?.split('@')[0];
    }

    if (!numberToDel && args.length > 0) {
      numberToDel = args[0].replace(/[^0-9]/g, '');
    }

    if (!numberToDel) {
      return sock.sendMessage(msg.key.remoteJid, { text: '📝 *Usage:* Reply to a message or type !sudodel 123456789' });
    }

    if (!sudoList.includes(numberToDel)) {
      return sock.sendMessage(msg.key.remoteJid, { text: `❌ *${numberToDel} is not a sudo user.*` });
    }

    sudoList = sudoList.filter(n => n !== numberToDel);
    await fs.writeFile(sudoFile, JSON.stringify(sudoList, null, 2));
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ *${numberToDel} has been removed from sudo.*` });
  }
};
