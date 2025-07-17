import config from '../config.js';
import fs from 'fs-extra';

const autoreactFile = './lib/autoreact.js';

export default {
  name: 'autoreact',
  category: 'General',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = (msg.key.participant || from).split('@')[0];

    // En mode private, seul l'OWNER peut utiliser la commande
    if (config.MODE === 'private' && sender !== config.OWNER_NUMBER) {
      return; // Ne rien répondre
    }

    // Charger la liste des sudo
    let sudoList = [];
    const sudoFile = './lib/sudo.json';
    if (fs.existsSync(sudoFile)) {
      sudoList = JSON.parse(await fs.readFile(sudoFile));
    }

    // Vérification permission OWNER ou SUDO
    if (sender !== config.OWNER_NUMBER && !sudoList.includes(sender)) {
      return; // Ne rien répondre
    }

    // Lire l'état actuel
    let currentState = false;
    if (fs.existsSync(autoreactFile)) {
      const data = JSON.parse(await fs.readFile(autoreactFile));
      currentState = data.enabled || false;
    }

    // Si aucun argument
    if (args.length === 0) {
      return sock.sendMessage(from, {
        text: `🔁 *État actuel de l'Auto React:* ${currentState ? 'Activé ✅' : 'Désactivé ❌'}\n\n📝 *Usage:* !autoreact on / off`
      });
    }

    const action = args[0].toLowerCase();
    if (!['on', 'off'].includes(action)) {
      return sock.sendMessage(from, {
        text: '❌ *Commande invalide.*\n\n📝 *Usage:* !autoreact on / off'
      });
    }

    // Sauvegarde de l'état
    await fs.writeFile(autoreactFile, JSON.stringify({ enabled: action === 'on' }, null, 2));

    return sock.sendMessage(from, {
      text: `✅ *L'Auto React a été ${action === 'on' ? 'activé' : 'désactivé'}.*`
    });
  }
};