import config from '../config.js';
import fs from 'fs-extra';

const sudoFile = './lib/sudo.json';
const modeFile = './lib/mode.json';

export default {
  name: 'mode',
  category: 'General',
  execute: async (sock, msg, args) => {
    const sender = msg.key.fromMe
      ? sock.user.id
      : (msg.key.participant || msg.key.remoteJid).split('@')[0];

    let sudoList = [];
    if (fs.existsSync(sudoFile)) sudoList = JSON.parse(await fs.readFile(sudoFile));

    const isAuthorized = sender === config.OWNER_NUMBER || sudoList.includes(sender);
    if (!isAuthorized) {
      return sock.sendMessage(msg.key.remoteJid, { text: '🚫 *You are not allowed to use this command.*' });
    }

    if (args.length === 0) {
      return sock.sendMessage(msg.key.remoteJid, { text: '📝 *Usage:* !mode public / private' });
    }

    const modeArg = args[0].toLowerCase();
    if (!['public', 'private'].includes(modeArg)) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❌ *Invalid option. Use:* public or private' });
    }

    // Save mode permanently
    await fs.writeJSON(modeFile, { mode: modeArg });

    await sock.sendMessage(msg.key.remoteJid, {
      text: `╔═════════════════
║ ⚙️ *MODE UPDATED*
╠═════════════════
║ ✅ Current mode: *${modeArg.toUpperCase()}*
║ 👑 Updated by: ${sender === config.OWNER_NUMBER ? 'OWNER' : 'SUDO'}
╚═════════════════
> BY ✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞`
    });
  }
};