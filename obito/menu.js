import config from '../config.js';
import os from 'os';
import process from 'process';
import * as commands from './index.js';

export default {
  name: 'menu',
  category: 'General',
  execute: async (sock, msg) => {
    const sender = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

    // Organize commands by category
    const categories = {};
    Object.values(commands).forEach(cmd => {
      const cat = cmd.category || 'Others';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.name);
    });

    let commandList = '';
    for (const [cat, cmds] of Object.entries(categories)) {
      commandList += `\n╔═ ✨ *${cat.toUpperCase()}*\n`;
      cmds.forEach(cmd => {
        commandList += `║ ✞︎  ${cmd}\n`;
      });
      commandList += '╚════════════\n';
    }

    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: 'https://files.catbox.moe/94neyf.jpg' },
      caption: `╔══════════════
║ 🎨 ༒︎𝐋𝐎𝐑𝐃_𝐎𝐁𝐈𝐓𝐎-𝐌𝐃༒︎ 𝐌𝐄𝐍𝐔
╠══════════════
║ 👑 OWNER: ${config.OWNER_NAME}
║ 🙋 USER: ${sender}
║ ⚙️ MODE: ${config.MODE.toUpperCase()}
║ ⏱️ UPTIME: ${uptimeStr}
║ 📦 VERSION: 1.0.0
╚══════════════${commandList}`
    });
  }
};
