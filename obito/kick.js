import config from '../config.js';
import { getSender, isAllowed } from '../lib/utils.js';

export default {
  name: 'kick',
  category: 'Group',
  execute: async (sock, msg, args) => {
    const sender = getSender(msg, sock);
    if (!isAllowed(sender)) return;

    const from = msg.key.remoteJid;

    // Vérifie que la commande est utilisée dans un groupe
    if (!from.endsWith('@g.us')) {
      return sock.sendMessage(from, {
        text: '🚫 *Cette commande ne peut être utilisée que dans un groupe.*'
      });
    }

    // Vérifie que l'utilisateur est admin
    const metadata = await sock.groupMetadata(from);
    const isAdmin = metadata.participants.some(
      (p) => p.id === `${sender}@s.whatsapp.net` && (p.admin === 'admin' || p.admin === 'superadmin')
    );

    if (!isAdmin && sender !== config.OWNER_NUMBER) {
      return sock.sendMessage(from, {
        text: '🛑 *Seuls les administrateurs peuvent utiliser cette commande.*'
      });
    }

    // Vérifie l'argument
    if (args.length === 0) {
      return sock.sendMessage(from, {
        text: '📝 *Usage:* .kick 225xxxxxxxx'
      });
    }

    const number = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    // Vérifie si la cible est dans le groupe
    const isTargetInGroup = metadata.participants.some(p => p.id === number);
    if (!isTargetInGroup) {
      return sock.sendMessage(from, {
        text: '❌ *Utilisateur non présent dans le groupe.*'
      });
    }

    try {
      await sock.groupParticipantsUpdate(from, [number], 'remove');
      await sock.sendMessage(from, {
        text: `✅ *@${args[0]} a été expulsé du groupe.*`,
        mentions: [number]
      });
    } catch (err) {
      await sock.sendMessage(from, {
        text: '⚠️ *Échec de l\'expulsion. Le bot est-il administrateur ?*'
      });
      console.error('Erreur dans kick.js :', err);
    }
  }
};