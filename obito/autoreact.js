import config from '../config.js';
import fs from 'fs-extra';
import { getSender, isAllowed } from '../lib/utils.js';

const autoreactFile = './lib/autoreact.js';
const sudoFile = './lib/sudo.json';

export default {
  name: 'autoreact',
  category: 'General',
  execute: async (sock, msg, args) => {
    const sender = getSender(msg, sock);
    if (!isAllowed(sender)) return;

    // Charger sudo.json
    let sudoList = [];
    if (fs.existsSync(sudoFile)) {
      sudoList = JSON.parse(await fs.readFile(sudoFile));
    }

    // Vérifier si OWNER ou SUDO
    const isAuthorized = sender === config.OWNER_NUMBER || sudoList.includes(sender);
    if (!isAuthorized) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '🚫 *Access denied. Owner or Sudo only.*'
      });
    }

    // Lire l'état actuel
    let currentState = false;
    if (fs.existsSync(autoreactFile)) {
      const data = JSON.parse(await fs.readFile(autoreactFile));
      currentState = data.enabled || false;
    }

    // Aucun argument fourni
    if (args.length === 0) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `🤖 *Auto React Status:* ${currentState ? 'Enabled ✅' : 'Disabled ❌'}\n\n📝 *Usage:* .autoreact on / off`
      });
    }

    // Traitement des arguments
    const action = args[0].toLowerCase();
    if (action !== 'on' && action !== 'off') {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '📝 *Usage:* .autoreact on / off'
      });
    }

    // Mise à jour du fichier
    await fs.writeFile(autoreactFile, JSON.stringify({ enabled: action === 'on' }, null, 2));

    await sock.sendMessage(msg.key.remoteJid, {
      text: `✅ *Auto React has been ${action === 'on' ? 'enabled ✅' : 'disabled ❌'}.*`
    });
  }
};