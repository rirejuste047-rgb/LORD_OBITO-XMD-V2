import config from '../config.js';
import fs from 'fs-extra';

const sudoFile = './lib/sudo.json';

export default {
  name: 'sudo',
  category: 'Sudo',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = (msg.key.participant || from).split('@')[0];

    // 🔇 Mode private : seuls OWNER ou sudo existants peuvent utiliser (aucun message sinon)
    let sudoList = [];
    if (fs.existsSync(sudoFile)) {
      sudoList = JSON.parse(await fs.readFile(sudoFile));
    }

    const isAllowed =
      sender === config.OWNER_NUMBER || sudoList.includes(sender);

    if (config.MODE === 'private' && !isAllowed) {
      return; // 🔇 Aucun message
    }

    // Seul l'OWNER peut ajouter un sudo
    if (sender !== config.OWNER_NUMBER) {
      return; // 🔇 Aucun message
    }

    // 🔍 Trouver le numéro cible
    let numberToAdd = null;

    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      numberToAdd = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
    } else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      numberToAdd = msg.message.extendedTextMessage.contextInfo.participant?.split('@')[0];
    }

    if (!numberToAdd && args.length > 0) {
      numberToAdd = args[0].replace(/[^0-9]/g, '');
    }

    if (!numberToAdd) {
      return sock.sendMessage(from, {
        text: '📝 *Utilisation :* Réponds à un message ou tape\n!sudo 225070000000'
      });
    }

    if (sudoList.includes(numberToAdd)) {
      return sock.sendMessage(from, {
        text: `✅ *${numberToAdd} est déjà sudo.*`
      });
    }

    sudoList.push(numberToAdd);
    await fs.writeFile(sudoFile, JSON.stringify(sudoList, null, 2));

    return sock.sendMessage(from, {
      text: `✅ *${numberToAdd} a été ajouté en tant que sudo.*`
    });
  }
};