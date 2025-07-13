import config from '../config.js';

/**
 * Retourne une salutation adaptée selon l'heure
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bonjour';
  if (hour >= 12 && hour < 18) return 'Bonne après-midi';
  return 'Bonsoir';
}

/**
 * Retourne un emoji saisonnier selon le mois actuel
 */
function getEmojiByMonth() {
  const month = new Date().getMonth() + 1; // 1-12
  if (month === 12 || month === 1) return '❄️';       // hiver
  if (month >= 2 && month <= 4) return '🌸';          // printemps
  if (month >= 5 && month <= 7) return '☀️';          // été
  if (month >= 8 && month <= 10) return '🍂';         // automne
  return '🌟';                                        // par défaut
}

/**
 * Détection simple de langue, retourne les textes adaptés
 */
function getLanguageGreeting(lang = 'fr') {
  if (lang.startsWith('en')) return {
    welcome: 'Welcome',
    group: 'Group',
    members: 'Members',
    admins: 'Admins',
    date: 'Date',
    bot: 'Bot',
    rulesTitle: 'Group rules',
    welcomeIntro: "We're happy to have you here! Please read the rules below to keep a good atmosphere.",
  };
  // Par défaut : français
  return {
    welcome: 'Bienvenue',
    group: 'Groupe',
    members: 'Membres',
    admins: 'Admins',
    date: 'Date',
    bot: 'Bot',
    rulesTitle: 'Règles du groupe',
    welcomeIntro: "Nous sommes ravis de vous accueillir ! Merci de lire les règles ci-dessous pour une bonne ambiance.",
  };
}

/**
 * File d'attente pour gérer les arrivées groupées par groupe
 * Clé : groupId
 * Valeur : tableau d'objets { userId, username, lang }
 */
const usersQueue = new Map();

/**
 * Envoi groupé du message de bienvenue
 */
async function sendWelcomeBatch(sock, groupId) {
  const batch = usersQueue.get(groupId);
  if (!batch || batch.length === 0) return;

  // Récupère les métadonnées du groupe
  const metadata = await sock.groupMetadata(groupId);
  const groupName = metadata.subject || 'ce groupe';
  const membersCount = metadata.participants.length;
  const adminsCount = metadata.participants.filter(p => p.admin !== null).length;

  // Limite la longueur des règles pour éviter un message trop long
  const maxDescLength = 350;
  const groupRulesRaw = metadata.desc || "Aucune règle définie pour ce groupe.";
  const groupRules = groupRulesRaw.length > maxDescLength 
    ? groupRulesRaw.substring(0, maxDescLength) + '...'
    : groupRulesRaw;

  // Prépare les mentions et noms
  const mentions = batch.map(u => u.userId);
  const usernames = batch.map(u => u.username).join(', ');

  // Texte de salutation, emoji saisonnier, textes localisés
  const greeting = getGreeting();
  const emoji = getEmojiByMonth();
  const langTexts = getLanguageGreeting(batch[0].lang);

  // Date et heure formatées dans la langue de l'utilisateur principal
  const dateString = new Date().toLocaleString(batch[0].lang || 'fr-FR', { dateStyle: 'full', timeStyle: 'short' });

  // Message d'intro plus chaleureux
  const welcomeIntro = langTexts.welcomeIntro;

  // Construction du message complet
  const text = `
╔═════════════❦︎═══════════
║ ${emoji} *${langTexts.welcome} @${usernames} !*
╠═════════════❦︎═══════════
║ 👥 *${langTexts.group} :* ${groupName}
║👤 *${langTexts.members} :* ${membersCount}
║👑 *${langTexts.admins} :* ${adminsCount}
║🗓️ *${langTexts.date} :* ${dateString}
║
║ ${welcomeIntro}
║
║ 📜 *${langTexts.rulesTitle} :* 
║ ${groupRules}
║
║🤖 *${langTexts.bot} :* ${config.BOT_NAME || 'LORD_OBITO-MD'}
╚══════════════════════════
> ✞︎ 𝑩𝒀 ✞︎ 𝑳𝑶𝑹𝑫 𝑶𝑩𝑰𝑻𝑶 𝑫𝑬𝑽 ✞︎ 𝐗 🎮 𝑫𝑬𝑽 𝑫𝑨𝑹𝑲 𝑮𝑨𝑴𝑬𝑹 ⚔️
  `.trim();

  // Essaie d'obtenir la photo de profil du premier utilisateur
  let profilePicUrl = null;
  try {
    profilePicUrl = await sock.profilePictureUrl(batch[0].userId, 'image');
  } catch {
    profilePicUrl = 'https://i.imgur.com/8Km9tLL.png'; // fallback image
  }

  // Envoie le message avec mentions et image
  await sock.sendMessage(groupId, {
    image: { url: profilePicUrl },
    caption: text,
    mentions,
  });

  // Vide la file d'attente pour ce groupe
  usersQueue.delete(groupId);
}

export default {
  name: 'bienvenue',
  description: 'Message de bienvenue complet avec règles et accueil groupé',
  category: 'groupe',
  async execute(sock, message, args) {
    try {
      const from = message.key.remoteJid;
      const userId = message.key.participant || message.key.remoteJid;
      const username = userId.split('@')[0];

      // Détection simple de langue (améliorable)
      const userLang = 'fr-FR';

      if (!config.WELCOME_ENABLED) {
        await sock.sendMessage(from, {
          text: '🚫 La commande bienvenue est désactivée par le propriétaire.',
        });
        return;
      }

      // Ajoute le nouveau membre à la file d'attente pour le groupe
      if (!usersQueue.has(from)) usersQueue.set(from, []);
      usersQueue.get(from).push({ userId, username, lang: userLang });

      // Si premier ajouté, lance un timeout pour grouper les arrivées (ex: 10s)
      if (usersQueue.get(from).length === 1) {
        setTimeout(() => sendWelcomeBatch(sock, from), 10000);
      }

    } catch (err) {
      console.error('❌ Erreur dans la commande bienvenue :', err);
    }
  }
};

