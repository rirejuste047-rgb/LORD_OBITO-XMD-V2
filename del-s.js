import config from '../config.js';
import fs from 'fs-extra';

const sudoFile = './lib/sudo.json';

export default {
  name: 'delsudo',
  category: 'Sudo',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = (msg.key.participant || from).split('@')[0];

    // Autorisé uniquement pour le OWNER
    if (sender !== config.OWNER_NUMBER) return; // Silencieux

    // Charger la liste sudo
    let sudoList = [];
    if (fs.existsSync(sudoFile)) {
      sudoList = JSON.parse(await fs.readFile(sudoFile));
    }

    // Récupère le numéro à supprimer
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
      return sock.sendMessage(from, { text: '📝 *Usage:* Réponds à un message ou tape !delsudo 225xxxxxxxx' });
    }

    if (!sudoList.includes(numberToDel)) {
      return sock.sendMessage(from, { text: `❌ *${numberToDel} n'est pas sudo.*` });
    }

    // Supprimer du fichier
    sudoList = sudoList.filter(n => n !== numberToDel);
    await fs.writeFile(sudoFile, JSON.stringify(sudoList, null, 2));

    await sock.sendMessage(from, { text: `✅ *${numberToDel} a été supprimé des sudo.*` });
  }
};