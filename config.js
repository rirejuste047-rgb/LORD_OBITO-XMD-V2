import fs from 'fs-extra';

// Charger dynamiquement le MODE depuis mode.json
let MODE = 'private'; // Valeur par d¨¦faut si le fichier ne se charge pas

try {
  const modeData = await fs.readJSON('./lib/mode.json');
  MODE = modeData.mode || 'private';
} catch (err) {
  console.warn('?? Erreur lors du chargement du mode.json, utilisation du mode par d¨¦faut (private)');
}

export default {
  MODE, // ¡û maintenant dynamique
  SESSION_ID: process.env.SESSION_ID || 'LORD~OBITO~aVNjiY6Q#IOHcCpQBUsdekcVQKFFZb_tJ-OMBvF17TmClJYho8io',
  OWNER_NUMBER: '2250712668494',
  OWNER_NAME: '✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞',
  CHANNEL_URL: 'https://whatsapp.com/channel/0029Vb65HSyHwXbEQbQjQV26',
  AUTO_REACT: false,
  PREFIX: '.',
  BOT_NAME: 'LORD_OBITO-XMD-V2',
  WELCOME_ENABLED: false,
  GOODBYE_ENABLED: false
};
