import config from '../config.js';
import fs from 'fs-extra';
import { getSender, isAllowed } from '../lib/utils.js';

const sudoFile = './obito/sudo.json';

export default {
  name: 'kickall',
  category: 'Group',
  execute: async (sock, msg) => {
    const from = msg.key.remoteJid;
    const sender = getSender(msg, sock);
    if (!isAllowed(sender)) return;

    // Vérifie si la commande est utilisée dans un groupe
    if (!from.endsWith('@g.us')) {
      return sock.sendMessage(from, { text: '🚫 *Commande utilisable uniquement dans les groupes.*' });
    }

    const metadata = await sock.groupMetadata(from);
    const participants = metadata.participants;

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botIsAdmin = participants.find(p => p.id === botId && p.admin);
    if (!botIsAdmin) {
      return sock.sendMessage(from, { text: '❌ *Je dois être admin pour exécuter cette commande.*' });
    }

    // Vérifie si l'utilisateur est OWNER, SUDO ou admin
    let sudoList = [];
    if (fs.existsSync(sudoFile)) {
      sudoList = JSON.parse(await fs.readFile(sudoFile));
    }

    const isOwner = sender === config.OWNER_NUMBER;
    const isSudo = sudoList.includes(sender);
    const isGroupAdmin = participants.some(p => p.id === `${sender}@s.whatsapp.net` && p.admin);

    if (!isOwner && !isSudo && !isGroupAdmin) {
      return sock.sendMessage(from, {
        text: '🚫 *Seul le OWNER, un SUDO ou un admin du groupe peut utiliser cette commande.*'
      });
    }

    // Cible tous les membres sauf le bot et le lanceur
    const targets = participants
      .map(p => p.id)
      .filter(id => id !== botId && id !== `${sender}@s.whatsapp.net`);

    if (targets.length === 0) {
      return sock.sendMessage(from, { text: '✅ *Aucun membre à expulser.*' });
    }

    try {
      await sock.groupParticipantsUpdate(from, targets, 'remove');
      await sock.sendMessage(from, {
        text: `🚫 *Tous les membres ont été expulsés par ${isOwner ? 'OWNER' : isSudo ? 'SUDO' : 'ADMIN'}.*`
      });
    } catch (err) {
      await sock.sendMessage(from, {
        text: '⚠️ *Erreur lors de l\'expulsion. Vérifie les droits admin du bot.*'
      });
      console.error('Erreur kickall.js:', err);
    }
  }
};