import chalk from 'chalk';

export async function GroupUpdate(sock, group) {
  try {
    const { id, participants, action } = group;

    participants.forEach(async participant => {
      if (action === 'add') {
        console.log(chalk.green(`👤 ${participant} a rejoint ${id}`));
        // Here you can call the welcome command automatically
        // For example, if you want to call the welcome command automatically :
        try {
          const welcomeCmd = (await import('../obito/welcome.js')).default;
          // Create a fake message simulating entry to execute welcome
          const fakeMsg = {
            key: { remoteJid: id, participant },
            message: { conversation: '.welcome' }
          };
          await welcomeCmd.execute(sock, fakeMsg, []);
        } catch (err) {
          console.error("Welcome automatic call error :", err);
        }
      } else if (action === 'remove') {
        console.log(chalk.yellow(`🚪 ${participant} a quitté ${id}`));
        await sock.sendMessage(id, {
          text: `╔═════════════❦︎═══════════════
║   *😢 <@${participant.split('@')[0]}> GOOD BYE FRIEND.*
║
╚═════════════════════════════
> BY ✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞`,
          mentions: [participant]
        });
      }
    });
  } catch (err) {
    console.error("❌ Erreur GroupUpdate:", err);
  }
}
