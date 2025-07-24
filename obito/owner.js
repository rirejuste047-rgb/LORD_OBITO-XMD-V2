import config from '../config.js';
import { getSender, isAllowed } from '../lib/utils.js';

export default {
  name: 'owner',
  category: 'General',
  execute: async (sock, msg) => {
    const sender = getSender(msg, sock);
    if (!isAllowed(sender)) return;

    const message = `
╔═══════════════════════
║ 👑 *𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎*
╠═══════════════════════
║ 👤 *Name:* ${config.OWNER_NAME}
║ 📞 *Number:* ${config.OWNER_NUMBER}
║ 🔗 *Channel:* ${config.CHANNEL_URL}
╚═══════════════════════
> BY ✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞
    `.trim();

    await sock.sendMessage(msg.key.remoteJid, { text: message });
  }
};