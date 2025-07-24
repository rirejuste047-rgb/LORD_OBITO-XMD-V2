import config from '../config.js';
import fs from 'fs-extra';
import { getSender, isAllowed } from '../lib/utils.js';

const sudoFile = './lib/sudo.json';

export default {
  name: 'sudo',
  category: 'Sudo',
  execute: async (sock, msg, args) => {
    const sender = getSender(msg, sock);

    // Vérification du MODE
    if (!isAllowed(sender)) return;

    // Charger la liste des sudo
    let sudoList = [];
    if (fs.existsSync(sudoFile)) {
      sudoList = JSON.parse(await fs.readFile(sudoFile));
    }

    // Seuls l'OWNER ou les SUDO actuels peuvent ajouter un sudo
    const isAuthorized = sender === config.OWNER_NUMBER || sudoList.includes(sender);
    if (!isAuthorized) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '🚫 *Access denied. Owner or Sudo only.*'
      });
    }

    // Identifier le numéro à ajouter
    let numberToAdd = null;

    // Si c’est une mention
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentions && mentions.length > 0) {
      numberToAdd = mentions[0].split('@')[0];
    }

    // Si c’est une réponse à un message
    if (!numberToAdd && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      numberToAdd = msg.message.extendedTextMessage.contextInfo.participant?.split('@')[0];
    }

    // Si donné en argument direct
    if (!numberToAdd && args.length > 0) {
      numberToAdd = args[0].replace(/[^0-9]/g, '');
    }

    if (!numberToAdd) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '📝 *Usage:* Reply to a message or type .sudo 123456789'
      });
    }

    if (sudoList.includes(numberToAdd)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `✅ *${numberToAdd} is already a sudo user.*`
      });
    }

    sudoList.push(numberToAdd);
    await fs.writeFile(sudoFile, JSON.stringify(sudoList, null, 2));

    await sock.sendMessage(msg.key.remoteJid, {
      text: `✅ *${numberToAdd} added as sudo.*`
    });
  }
};
