import config from '../config.js';

function formatUptime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}h ${minutes}m ${seconds}s`;
}

export default {
  name: 'botinfo',
  category: 'Général',
  execute: async (sock, msg) => {
    try {
      const uptimeMs = process.uptime() * 1000;
      const uptimeStr = formatUptime(uptimeMs);

      await sock.sendMessage(msg.key.remoteJid, {
        text: `
╔═════════════❦︎═══════════════
║ 🤖 ༒︎𝐋𝐎𝐑𝐃_𝐎𝐁𝐈𝐓𝐎-𝐗𝐌𝐃-𝐕2༒︎ 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍𝐒 𝐁𝐎𝐓
╠═════════════❦︎═══════════════
║ 👤 Propriétaire : ${config.OWNER_NAME || 'Non défini'}
║ 📞 Numéro : ${config.OWNER_NUMBER || 'Non défini'}
║ 🔗 Chaîne : ${config.CHANNEL_URL || 'Non défini'}
║ ⏱️ Uptime : ${uptimeStr}
╠═════════════❦︎═══════════════
║ ✞︎ 𝑳𝑶𝑹𝑫 𝑶𝑩𝑰𝑻𝑶 𝑫𝑬𝑽
║ 🎮 𝑫𝑬𝑽 𝑫𝑨𝑹𝑲 𝑮𝑨𝑴𝑬𝑹 ⚔️
╚═══════════════════════════════
        `.trim()
      });
    } catch (err) {
      console.error('❌ Erreur dans la commande botinfo :', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Une erreur est survenue lors de la récupération des informations du bot.'
      });
    }
  }
};