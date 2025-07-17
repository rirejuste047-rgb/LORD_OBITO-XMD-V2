import config from '../config.js';

export default {
  name: 'botinfo',
  category: 'General',
  execute: async (sock, msg) => {
    const from = msg.key.remoteJid;
    const sender = (msg.key.participant || from).split('@')[0];

    // En mode private, seul l'OWNER peut utiliser la commande
    if (config.MODE === 'private' && sender !== config.OWNER_NUMBER) {
      return; // Pas de réponse
    }

    await sock.sendMessage(from, {
      text: `
╔═════════════❦︎═══════════════
║ 🤖 ༒︎𝐋𝐎𝐑𝐃_𝐎𝐁𝐈𝐓𝐎-𝐗𝐌𝐃-𝐕2༒︎ 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎𝐒
╠═════════════❦︎═══════════════
║ 👤 Owner: ${config.OWNER_NAME}
║ 📞 Number: ${config.OWNER_NUMBER}
║ 🔗 Channel: ${config.CHANNEL_URL}
╚═════════════════════════════
      `.trim()
    });
  }
};