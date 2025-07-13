import config from '../config.js'; // pour récupérer OWNER_NUMBER

export default {
  name: 'tagall',
  category: 'groupe',
  description: 'Mentionne tous les membres du groupe avec style',
  async execute(sock, msg) {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, {
        text: '🚫 *Cette commande ne peut être utilisée que dans un groupe.*',
      });
    }

    const metadata = await sock.groupMetadata(jid);
    const groupName = metadata.subject;
    const groupMembers = metadata.participants;
    const memberCount = groupMembers.length;

    const senderId = msg.key.participant || msg.key.remoteJid;
    const sender = metadata.participants.find(p => p.id === senderId);

    const isAdmin = sender && (sender.admin === 'admin' || sender.admin === 'superadmin');
    const isOwner = config.OWNER_NUMBER && senderId.includes(config.OWNER_NUMBER.replace(/[^0-9]/g, ''));

    if (!isAdmin && !isOwner) {
      return sock.sendMessage(jid, {
        text: '⛔ *Seuls les administrateurs ou le propriétaire du bot peuvent utiliser cette commande.*',
        mentions: [senderId],
      });
    }

    const creatorJid = metadata.owner;
    const creatorName = creatorJid ? creatorJid.split('@')[0] : 'Inconnu';
    const adminName = sender?.notify || sender?.id.split('@')[0];

    const mentions = groupMembers.map(p => p.id);
    const mentionText = mentions.map((m, i) => `💠 @${m.split('@')[0]}`).join('\n');

    const fancyText = `
╔═══════『 ✨ TAGALL ✨ 』═══════
║ 🏷️ *Nom du groupe :* ${groupName}
║ 👥 *Membres :* ${memberCount}
║ 🛡️ *Commandé par :* ${adminName}
║ 👑 *Créateur :* ${creatorName}
╠══════════════════════════════
${mentionText}
╚══════════════════════════════
> ✞︎ 𝑩𝒀 ✞︎ 𝑳𝑶𝑹𝑫 𝑶𝑩𝑰𝑻𝑶 𝑫𝑬𝑽 ✞︎ 𝐗 🎮 𝑫𝑬𝑽 𝑫𝑨𝑹𝑲 𝑮𝑨𝑴𝑬𝑹 ⚔️
`.trim();

    await sock.sendMessage(jid, {
      text: fancyText,
      mentions
    });
  }
};