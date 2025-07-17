import config from '../config.js';

export default {
  name: 'kick',
  category: 'Group',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;

    // Vérifie si c'est dans un groupe
    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { text: '🚫 *This command can only be used in groups.*' });
    }

    // Vérifie si l'utilisateur est le propriétaire
    const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];
    if (sender !== config.OWNER_NUMBER) {
      return sock.sendMessage(jid, { text: '❌ *Only the OWNER can use this command.*' });
    }

    // Vérifie les arguments
    if (args.length === 0) {
      return sock.sendMessage(jid, { text: '📝 *Usage:* .kick 123456789' });
    }

    const number = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    try {
      await sock.groupParticipantsUpdate(jid, [number], 'remove');
      await sock.sendMessage(jid, { text: `🚫 *${args[0]} has been removed.*` });
    } catch (e) {
      await sock.sendMessage(jid, { text: `⚠️ *Failed to remove ${args[0]}.*` });
    }
  }
};