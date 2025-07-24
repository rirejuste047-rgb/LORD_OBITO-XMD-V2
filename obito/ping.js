import { getSender, isAllowed } from '../lib/utils.js';

export default {
  name: 'ping',
  category: 'General',
  execute: async (sock, msg) => {
    const sender = getSender(msg, sock);
    if (!isAllowed(sender)) return;

    const text = `
╔═══════════════════════════
║ 🏓 *PONG!*
╠═══════════════════════════
║ ✅ *LORD_OBITO-XMD-V2* is alive!
║ 🚀 Fast & stable like Kamui ⚡
╚═══════════════════════════
> BY ✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞
    `.trim();

    await sock.sendMessage(msg.key.remoteJid, { text });
  }
};