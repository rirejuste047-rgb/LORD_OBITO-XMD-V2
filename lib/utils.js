import config from '../config.js';

export function getSender(msg, sock) {
  const rawSender = msg.key.fromMe
    ? sock.user.id
    : (msg.key.participant || msg.key.remoteJid);

  return rawSender?.split('@')[0] || 'UNKNOWN';
}

export function isAllowed(sender) {
  return config.MODE !== 'private' || sender === config.OWNER_NUMBER;
}
