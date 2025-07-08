import config from '../config.js';

export default {
  name: 'welcome',
  description: 'Message de bienvenue stylé pour un groupe',
  category: 'group',
  async execute(sock, message, args) {
    try {
      const from = message.key.remoteJid;
      const userId = message.key.participant || message.key.remoteJid;
      const username = userId.split('@')[0];

      // Vérifie si welcome est activé
      if (!config.WELCOME_ENABLED) {
        await sock.sendMessage(from, {
          text: '🚫 La commande welcome est désactivée par l\'owner.',
        });
        return;
      }

      const metadata = await sock.groupMetadata(from);
      const groupName = metadata.subject || 'ce groupe';
      const membersCount = metadata.participants.length;
      const adminsCount = metadata.participants.filter(p => p.admin !== null).length;

      let profilePicUrl = null;
      try {
        profilePicUrl = await sock.profilePictureUrl(userId, 'image');
      } catch {
        profilePicUrl = null;
      }

      const dateString = new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' });
      const text = `
👋 *Bienvenue @${username} !*

🏷️ *Groupe:* ${groupName}
👥 *Membres:* ${membersCount}
⭐ *Admins:* ${adminsCount}
📅 *Date:* ${dateString}
🤖 *Bot:* ${config.BOT_NAME || 'LORD_OBITO-MD'}

> BY ✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞
      `.trim();

      await sock.sendMessage(from, {
        image: profilePicUrl ? { url: profilePicUrl } : undefined,
        caption: text,
        mentions: [userId]
      });
    } catch (err) {
      console.error('❌ Erreur dans la commande welcome:', err);
    }
  }
};
