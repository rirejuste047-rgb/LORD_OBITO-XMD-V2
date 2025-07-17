import config from '../config.js';
import fs from 'fs-extra';

const sudoFile = './obito/sudo.json';

export default {
  name: 'kickall',
  category: 'Group',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;

    // Vérifie si c’est un groupe
    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { text: '🚫 *Cette commande fonctionne uniquement dans les groupes.*' });
    }

    const metadata = await sock.groupMetadata(jid);
    const participants = metadata.participants;

    // ID du bot
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botAdmin = participants.find(p => p.id === botId && p.admin);
    if (!botAdmin) {
      return sock.sendMessage(jid, { text: '❌ *Je dois être admin pour utiliser cette commande.*' });
    }

    // Détection de l’expéditeur
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const sender = senderJid.split('@')[0];

    // Vérifie si owner ou sudo
    let sudoList = [];
    if (fs.existsSync(sudoFile)) {
      const raw = await fs.readFile(sudoFile, 'utf-8');
      sudoList = JSON.parse(raw);
    }

    const isOwner = sender === config.OWNER_NUMBER;
    const isSudo = sudoList.includes(sender);
    const senderParticipant = participants.find(p => p.id.startsWith(sender));
    const isGroupAdmin = senderParticipant && senderParticipant.admin;

    if (!isOwner && !isSudo && !isGroupAdmin) {
      return sock.sendMessage(jid, { text: '🚫 *Seul le OWNER, un SUDO ou un admin peut utiliser cette commande.*' });
    }

    // Construction de la liste des membres à kick
    const targets = participants
      .filter(p => p.id !== botId && p.id !== sender + '@s.whatsapp.net')
      .map(p => p.id);

    if (targets.length === 0) {
      return sock.sendMessage(jid, { text: '✅ *Aucun membre à expulser.*' });
    }

    try {
      await sock.groupParticipantsUpdate(jid, targets, 'remove');
      await sock.sendMessage(jid, {
        text: `🚫 *Tous les membres ont été expulsés par :* @${sender}`,
        mentions: [sender + '@s.whatsapp.net']
      });
    } catch (e) {
      console.error('Erreur lors du kickall :', e);
      await sock.sendMessage(jid, {
        text: '❌ *Échec lors de l’expulsion. Il se peut que certains membres soient protégés.*'
      });
    }
  }
};