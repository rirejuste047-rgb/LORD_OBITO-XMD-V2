import fs from 'fs-extra';
import config from '../config.js';
import { getSender, isAllowed } from '../lib/utils.js';

const sudoFile = './lib/sudo.json';

export default {
  name: 'sudolist',
  category: 'Sudo',
  execute: async (sock, msg) => {
    const sender = getSender(msg, sock);
    if (!isAllowed(sender)) return;

    // Charger les sudo
    if (!fs.existsSync(sudoFile)) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❌ *No sudo users found.*' });
    }

    const sudoList = JSON.parse(await fs.readFile(sudoFile));
    if (!sudoList.includes(sender) && sender !== config.OWNER_NUMBER) {
      return sock.sendMessage(msg.key.remoteJid, { text: '🚫 *Access denied. Owner or Sudo only.*' });
    }

    if (sudoList.length === 0) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❌ *Sudo list is empty.*' });
    }

    const list = sudoList
      .map((num, i) => `  ${i + 1}. ✞︎ +${num}`)
      .join('\n');

    const text = `
╔═══════════════════════
║    👑 *SUDO USERS LIST*
╠═══════════════════════
${list}
╚═══════════════════════
> BY ✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞
    `.trim();

    await sock.sendMessage(msg.key.remoteJid, { text });
  }
};