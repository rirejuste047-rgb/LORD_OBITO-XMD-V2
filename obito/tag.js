export default {
  name: 'tag',
  category: 'groupe',
  description: 'Mentionne silencieusement tout le groupe avec un message personnalisé (admins uniquement)',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { text: '🚫 *Commande utilisable uniquement dans un groupe.*' });
    }

    const metadata = await sock.groupMetadata(jid);
    const senderId = msg.key.participant || msg.key.remoteJid;

    const isAdmin = metadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));
    const isOwner = senderId === metadata.owner;

    if (!isAdmin && !isOwner) {
      return sock.sendMessage(jid, {
        text: '🚫 *Seuls les administrateurs ou le créateur du groupe peuvent utiliser cette commande.*',
        mentions: [senderId]
      });
    }

    const groupMembers = metadata.participants;
    const mentions = groupMembers.map(member => member.id);

    const baseMessage = args.length > 0 ? args.join(' ') : '📢 Message au groupe !';

    const signature = '\n\n> ✞︎ 𝑩𝒀 𝑳𝑶𝑹𝑫 𝑶𝑩𝑰𝑻𝑶 𝐗 𝑫𝑨𝑹𝑲 𝑮𝑨𝑴𝑬𝑹 ⚔️';

    const fullMessage = baseMessage + signature;

    await sock.sendMessage(jid, {
      text: fullMessage,
      mentions
    });
  }
};