const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage, getAnti } = require('../data');
const config = require('../config');

/**
 * Send text message for deleted text content
 */
const DeletedText = async (conn, mek, jid, deleteInfo, isGroup, update) => {
  try {
    const messageContent = 
      mek.message?.conversation || 
      mek.message?.extendedTextMessage?.text || 
      'Unknown content';

    deleteInfo += `\n\n*Content:* ${messageContent}`;

    await conn.sendMessage(jid, {
      text: deleteInfo,
      contextInfo: {
        mentionedJid: isGroup 
          ? [update.key.participant || '', mek.key.participant || ''].filter(Boolean)
          : [update.key.remoteJid || ''].filter(Boolean),
      },
    }, { quoted: mek });
  } catch (err) {
    console.error('DeletedText failed:', err.message);
  }
};

/**
 * Resend deleted media with anti-delete info
 */
const DeletedMedia = async (conn, mek, jid, deleteInfo) => {
  try {
    // Safe deep copy with fallback
    const antideletedmek = mek.message ? structuredClone(mek.message) : {};

    const messageType = Object.keys(antideletedmek)[0] || '';

    if (messageType && antideletedmek[messageType]) {
      antideletedmek[messageType].contextInfo = {
        stanzaId: mek.key.id,
        participant: mek.sender || mek.key.participant,
        quotedMessage: mek.message || {},
      };
    }

    // Add caption to media types
    if (['imageMessage', 'videoMessage'].includes(messageType)) {
      antideletedmek[messageType].caption = 
        (antideletedmek[messageType].caption || '') + `\n\n${deleteInfo}`;
    } else if (['audioMessage', 'documentMessage'].includes(messageType)) {
      // Send text fallback for audio/document
      await conn.sendMessage(jid, {
        text: `*🚨 Delete Detected!*\n\n${deleteInfo}`,
      }, { quoted: mek });
      return;
    }

    // Relay the reconstructed message
    await conn.relayMessage(jid, antideletedmek, {});
  } catch (err) {
    console.error('DeletedMedia failed:', err.message);
    // Fallback: send text if media relay fails
    await conn.sendMessage(jid, {
      text: `*🚨 Delete Detected (media failed to resend)*\n\n${deleteInfo}`,
    }, { quoted: mek });
  }
};

/**
 * Main AntiDelete handler
 */
const AntiDelete = async (conn, updates) => {
  if (!Array.isArray(updates)) {
    console.warn('AntiDelete: updates is not an array');
    return;
  }

  for (const update of updates) {
    if (!update?.update?.message === null) continue;

    try {
      const store = await loadMessage(update.key.id);
      if (!store || !store.message) continue;

      const mek = store.message;
      const isGroup = isJidGroup(store.jid);
      const antiType = isGroup ? 'gc' : 'dm';
      const antiEnabled = await getAnti(antiType);

      if (!antiEnabled) continue;

      const deleteTime = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Africa/Nairobi', // optional: force EAT
      });

      let deleteInfo = '';
      let jid = config.ANTI_DEL_PATH === "log" ? conn.user.id : store.jid;

      if (isGroup) {
        let groupName = 'Unknown Group';
        let groupMetadata;

        try {
          groupMetadata = await conn.groupMetadata(store.jid);
          groupName = groupMetadata?.subject || groupName;
        } catch (err) {
          console.warn('Failed to fetch group metadata:', err.message);
        }

        const sender = mek.key.participant?.split('@')[0] || 'unknown';
        const deleter = update.key.participant?.split('@')[0] || 'unknown';

        deleteInfo = `*AntiDelete Detected*\n\n` +
                     `*Time:* ${deleteTime}\n` +
                     `*Group:* ${groupName}\n` +
                     `*Deleted by:* @${deleter}\n` +
                     `*Sender:* @${sender}`;
      } else {
        const senderNumber = mek.key.remoteJid?.split('@')[0] || 'unknown';
        const deleterNumber = update.key.remoteJid?.split('@')[0] || 'unknown';

        deleteInfo = `*-- AntiDelete Detected --*\n\n` +
                     `*Time:* ${deleteTime}\n` +
                     `*Deleted by:* @${deleterNumber}\n` +
                     `*Sender:* @${senderNumber}`;
      }

      // Route to correct handler
      if (mek.message?.conversation || mek.message?.extendedTextMessage) {
        await DeletedText(conn, mek, jid, deleteInfo, isGroup, update);
      } else {
        await DeletedMedia(conn, mek, jid, deleteInfo);
      }
    } catch (err) {
      console.error('AntiDelete loop error:', err.message);
    }
  }
};

module.exports = {
  DeletedText,
  DeletedMedia,
  AntiDelete,
};
