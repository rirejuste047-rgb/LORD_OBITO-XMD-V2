import config from '../config.js';
import fs from 'fs-extra';
import { getSender, isAllowed } from '../lib/utils.js';

const sudoFile = './lib/sudo.json';

export default {
  name: 'tag',
  category: 'Group',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const sender = getSender(msg, sock);
    if (!isAllowed(sender)) return;

    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { text: '🚫 *This command can only be used in groups.*' });
    }

    // Charger sudo list
    let sudoList = [];
    if (fs.existsSync(sudoFile)) {
      sudoList = JSON.parse(await fs.readFile(sudoFile));
    }

    // Vérifier si OWNER, SUDO ou ADMIN du groupe
    const metadata = await sock.groupMetadata(jid);
    const participants = metadata.participants || [];
    const isGroupAdmin = participants.find(p => p.id.startsWith(sender) && p.admin);
    const isOwner = sender === config.OWNER_NUMBER;
    const isSudo = sudoList.includes(sender);

    if (!isOwner && !isSudo && !isGroupAdmin) {
      return sock.sendMessage(jid, {
        text: '🚫 *Only OWNER, SUDO or group admins can use this command.*'
      });
    }

    if (args.length === 0) {
      return sock.sendMessage(jid, { text: '📝 *Usage:* .tag 225xxxxxxxxx [your message]' });
    }

    const targetNumber = args[0].replace(/[^0-9]/g, '');
    if (!targetNumber) {
      return sock.sendMessage(jid, { text: '❌ *Invalid number.*' });
    }

    const mentionJid = `${targetNumber}@s.whatsapp.net`;
    const customText = args.slice(1).join(' ') || `@${targetNumber}`;

    await sock.sendMessage(jid, {
      text: customText,
      mentions: [mentionJid]
    });
  }
};