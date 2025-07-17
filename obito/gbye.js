import config from '../config.js';
import fs from 'fs-extra';

const goodbyeDB = './lib/goodbye.json';

export default {
  name: 'goodbye',
  description: 'Active/désactive ou envoie un message stylé de départ',
  category: 'group',
  async execute(sock, message, args) {
    try {
      const from = message.key.remoteJid;
      const sender = (message.key.participant || message.key.remoteJid).split('@')[0];

      // Charger ou créer le fichier JSON
      let data = {};
      if (fs.existsSync(goodbyeDB)) {
        data = JSON.parse(await fs.readFile(goodbyeDB));
      }

      // Si c’est une commande du type `.goodbye on/off`
      if (args.length > 0) {
        if (sender !== config.OWNER_NUMBER) return;

        if (args[0] === 'on') {
          data[from] = true;
          await fs.writeFile(goodbyeDB, JSON.stringify(data, null, 2));
          return sock.sendMessage(from, { text: '✅ *Goodbye activé pour ce groupe.*' });
        } else if (args[0] === 'off') {
          data[from] = false;
          await fs.writeFile(goodbyeDB, JSON.stringify(data, null, 2));
          return sock.sendMessage(from, { text: '❌ *Goodbye désactivé pour ce groupe.*' });
        } else {
          return sock.sendMessage(from, { text: '⚙️ *Utilisation :* .goodbye on / .goodbye off' });
        }
      }

      // Si le message est un départ d’utilisateur
      if (!data[from]) return;

      const userId = message.participant;
      const username = userId.split('@')[0];

      const metadata = await sock.groupMetadata(from);
      const groupName = metadata.subject || 'ce groupe';
      const membersCount = metadata.participants.length;

      let profilePicUrl = null;
      try {
        profilePicUrl = await sock.profilePictureUrl(userId, 'image');
      } catch {
        profilePicUrl = null;
      }

      const dateString = new Date().toLocaleString('fr-FR', {
        dateStyle: 'full',
        timeStyle: 'short'
      });

      const text = `
╔═════════════☹︎═══════════════
║ 😢 *@${username}* a quitté le groupe.
╠═════════════☹︎═══════════════
║ 👥 *Groupe :* ${groupName}
║ 👤 *Membres restants :* ${membersCount}
║ 🗓️ *Date :* ${dateString}
║ 🤖 *Bot :* ${config.BOT_NAME || 'LORD_OBITO-XMD-V2'}
║
╚═════════════════════════════
> BY ✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞
      `.trim();

      await sock.sendMessage(from, {
        image: profilePicUrl ? { url: profilePicUrl } : undefined,
        caption: text,
        mentions: [userId]
      });
    } catch (err) {
      console.error('❌ Erreur dans goodbye.js :', err);
    }
  }
};