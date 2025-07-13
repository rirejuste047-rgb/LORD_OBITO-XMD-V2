export default {
  name: 'ping',
  category: 'Général',
  execute: async (sock, msg) => {
    try {
      const start = Date.now();

      // Envoi du message initial (on peut aussi supprimer ou ignorer ce message)
      await sock.sendMessage(msg.key.remoteJid, { text: '⌛️ Vérification...' });

      const latency = Date.now() - start;

      // Message final avec temps de réponse dans le même style boxé
      const text = `
╔════════════════════════════
║ 🏓 *PONG !*
╠═════════════════════════════════
║ ✅ 𝐋𝐎𝐑𝐃_𝐎𝐁𝐈𝐓𝐎-𝐗𝐌𝐃-𝐕2
║ ✅ est en ligne et répond !
║ 🚀 Rapide et fiable comme le vent du nord ㋛︎
║ ⏱️ Temps de réponse : ${latency} ms
╚═════════════════════════════════`;

      await sock.sendMessage(msg.key.remoteJid, { text });
    } catch (err) {
      console.error('❌ Erreur dans la commande ping :', err);
    }
  }
};