import chalk from 'chalk';

export async function GroupUpdate(sock, group) {
  try {
    const { id, participants, action } = group;

    participants.forEach(async participant => {
      if (action === 'add') {
        console.log(chalk.green(`👤 ${participant} a rejoint ${id}`));
        // Ici tu peux appeler la commande welcome automatiquement
        // Par exemple, si tu veux appeler la commande welcome automatiquement :
        try {
          const welcomeCmd = (await import('../obito/welcome.js')).default;
          // Créer un faux message simulant l'entrée pour exécuter welcome
          const fakeMsg = {
            key: { remoteJid: id, participant },
            message: { conversation: '!welcome' }
          };
          await welcomeCmd.execute(sock, fakeMsg, []);
        } catch (err) {
          console.error("Erreur appel automatique welcome :", err);
        }
      } else if (action === 'remove') {
        console.log(chalk.yellow(`🚪 ${participant} a quitté ${id}`));
        await sock.sendMessage(id, {
          text: `😢 <@${participant.split('@')[0]}> a quitté le groupe.`,
          mentions: [participant]
        });
      }
    });
  } catch (err) {
    console.error("❌ Erreur GroupUpdate:", err);
  }
}
