import config from '../config.js';

const activeKickTimers = new Map(); // groupId -> timer + control object

export default {
  name: 'pointical',
  category: 'Groupe',
  description: 'Supprime progressivement les membres non admin avec confirmation et possibilité d\'annulation',
  execute: async (sock, msg) => {
    try {
      const groupId = msg.key.remoteJid;
      if (!groupId.endsWith('@g.us')) {
        return sock.sendMessage(groupId, { text: '🚫 *Cette commande ne peut être utilisée que dans les groupes.*' });
      }

      // Vérifie si un kick est déjà en cours dans ce groupe
      if (activeKickTimers.has(groupId)) {
        return sock.sendMessage(groupId, { text: '⚠️ Une suppression est déjà en cours. Veuillez patienter ou annuler avec "stop".' });
      }

      const metadata = await sock.groupMetadata(groupId);
      const participants = metadata.participants;

      // Vérifie si le bot est admin
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const botAdmin = participants.find(p => p.id === botId && p.admin);
      if (!botAdmin) {
        return sock.sendMessage(groupId, { text: '❌ *Je dois être administrateur pour utiliser cette commande.*' });
      }

      // Vérifie si l'utilisateur est admin, owner ou sudo
      const senderId = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderId.split('@')[0];
      let sudoList = [];
      if (await fs.existsSync('./obito/sudo.json')) {
        sudoList = JSON.parse(await fs.readFile('./obito/sudo.json'));
      }
      const isOwner = senderNumber === config.OWNER_NUMBER;
      const isSudo = sudoList.includes(senderNumber);
      const senderParticipant = participants.find(p => p.id === senderId);
      const isGroupAdmin = senderParticipant && senderParticipant.admin;

      if (!isOwner && !isSudo && !isGroupAdmin) {
        return sock.sendMessage(groupId, { text: '🚫 *Seuls le PROPRIÉTAIRE, SUDO ou les admins du groupe peuvent utiliser cette commande.*' });
      }

      // Annonce initiale avec instruction d'annulation
      const cancelText = '⚠️ La suppression des membres commencera dans 10 secondes.\nPour annuler, répondez STOP sur ce message.';
      const confirmationMsg = await sock.sendMessage(groupId, { text: cancelText });

      // Crée un objet de contrôle pour cette session
      const control = {
        canceled: false,
        timer: null,
        confirmationMsgId: confirmationMsg.key.id,
        groupId,
      };

      // Stocke le contrôle
      activeKickTimers.set(groupId, control);

      // Écoute les messages "stop" dans le groupe pendant le délai
      const onMessage = async (incomingMsg) => {
        if (
          incomingMsg.key.remoteJid === groupId &&
          incomingMsg.message?.conversation?.toLowerCase() === 'stop'
        ) {
          // Vérifie si la personne a répondu au message de confirmation (tag)
          if (incomingMsg.message.extendedTextMessage?.contextInfo?.stanzaId === control.confirmationMsgId) {
            control.canceled = true;
            clearTimeout(control.timer);
            activeKickTimers.delete(groupId);

            await sock.sendMessage(groupId, { text: '❌ Suppression annulée avec succès.' });
            sock.off('message', onMessage);
          }
        }
      };

      sock.on('message', onMessage);

      // Lance le timer 10s avant suppression
      control.timer = setTimeout(async () => {
        sock.off('message', onMessage);

        if (control.canceled) return; // Au cas où on arrive ici malgré annulation

        // Filtre les membres à exclure : exclure admins + bot + expéditeur
        const toKick = participants
          .filter(p => !p.admin && p.id !== botId && p.id !== senderId)
          .map(p => p.id);

        if (toKick.length === 0) {
          await sock.sendMessage(groupId, { text: '✅ Aucun membre à supprimer.' });
          activeKickTimers.delete(groupId);
          return;
        }

        // Supprime par lots de 3 par seconde
        const batchSize = 3;
        for (let i = 0; i < toKick.length; i += batchSize) {
          const batch = toKick.slice(i, i + batchSize);
          try {
            await sock.groupParticipantsUpdate(groupId, batch, 'remove');
          } catch (e) {
            console.error('Erreur lors de la suppression des membres:', e);
          }
          await new Promise(res => setTimeout(res, 1000)); // pause 1 seconde entre chaque lot
        }

        await sock.sendMessage(groupId, { text: '✅ Tous les membres ont été supprimés avec succès.\n> BY ✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞ X 🎮 𝑫𝑬𝑽 𝐃𝐀𝐑𝐊 𝐆𝐀𝐌𝐄𝐑 ⚔️' });

        activeKickTimers.delete(groupId);
      }, 10000);

    } catch (err) {
      console.error('Erreur commande pointical:', err);
    }
  }
};