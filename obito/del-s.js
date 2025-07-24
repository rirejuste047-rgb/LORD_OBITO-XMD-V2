import config from '../config.js';
import fs from 'fs-extra';
import { getSender, isAllowed } from '../lib/utils.js';

const sudoFile = './lib/sudo.json';

export default {
  name: 'delsudo',
  category: 'Sudo',
  execute: async (sock, msg, args) => {
    const sender = getSender(msg, sock);
    if (!isAllowed(sender)) return;

    // Charger la liste sudo
    let sudoList = [];
    if (fs.existsSync(sudoFile)) {
      sudoList = JSON.parse(await fs.readFile(sudoFile));
    }

    // Vérifier l'autorisation
    const isAuthorized = sender === config.OWNER_NUMBER || sudoList.includes(sender);
    if (!isAuthorized) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '🚫 *Access denied. Owner or Sudo only.*'
      });
    }

    // Identifier le numéro à retirer
    let numberToDel = null;

    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentions && mentions.length > 0) {
      numberToDel = mentions[0].split('@')[0];
    }

    if (!numberToDel && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      numberToDel = msg.message.extendedTextMessage.contextInfo.participant?.split('@')[0];
    }

    if (!numberToDel && args.length > 0) {
      numberToDel = args[0].replace(/[^0-9]/g, '');
    }

    if (!numberToDel) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '📝 *Usage:* Reply to a message or type .delsudo 225xxxxxxxxx'
      });
    }

    if (!sudoList.includes(numberToDel)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *${numberToDel} is not in the sudo list.*`
      });
    }

    sudoList = sudoList.filter(num => num !== numberToDel);
    await fs.writeFile(sudoFile, JSON.stringify(sudoList, null, 2));

    await sock.sendMessage(msg.key.remoteJid, {
      text: `✅ *${numberToDel} has been removed from sudo list.*`
    });
  }
};