const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// ──────────────────────────────────────────────
// Auto-save view-once when OWNER reacts to it
// No command needed — just react with any emoji
// Saves anonymously to your own chat
// ──────────────────────────────────────────────

module.exports = async function setupViewOnceAutoSave(conn) {
    console.log('[PLUGIN] ViewOnce Auto-Save → Activated');

    conn.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return; // only new incoming messages

        for (const m of messages) {
            try {
                // Only process reactions
                if (!m.message?.reactionMessage) continue;

                // Only for owner
                const reactor = m.key.participant || m.key.remoteJid;
                const isOwner = 
                    global.ownerNumbers?.includes(reactor.split('@')[0]) ||
                    reactor === conn.user.id.split(':')[0] + '@s.whatsapp.net' ||
                    m.key.fromMe;

                if (!isOwner) continue;

                // Get the message that was reacted to
                const reactedKey = m.message.reactionMessage.key;
                if (!reactedKey?.id) continue;

                const originalMsg = await conn.loadMessage(reactedKey.remoteJid, reactedKey.id);
                if (!originalMsg) continue;

                const msgContent = originalMsg.message;
                if (!msgContent) continue;

                // Check if it's view-once
                const viewOnce = 
                    msgContent.viewOnceMessageV2 ||
                    msgContent.viewOnceMessageV2Extension ||
                    msgContent.viewOnceMessage;

                if (!viewOnce) continue;

                // Extract actual media
                let mediaMsg = 
                    viewOnce.message?.imageMessage ||
                    viewOnce.message?.videoMessage ||
                    viewOnce.message?.audioMessage ||
                    viewOnce.message?.documentMessage;

                if (!mediaMsg) continue;

                const mediaType = 
                    mediaMsg.mimetype?.startsWith('image') ? 'image' :
                    mediaMsg.mimetype?.startsWith('video') ? 'video' :
                    mediaMsg.mimetype?.startsWith('audio') ? 'audio' : 'document';

                console.log(`[ViewOnce Save] ${mediaType} detected • Owner reacted → Saving...`);

                // Download (bypasses view-once)
                const buffer = await downloadMediaMessage(originalMsg, 'buffer', {}, {
                    reuploadRequest: conn.updateMediaMessage
                });

                // Send to your own chat (saved messages)
                const ownerJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';

                let captionText = `Saved view-once ${mediaType}\n` +
                                 `From: ${originalMsg.key.remoteJid.split('@')[0]}\n` +
                                 `Sender: ${originalMsg.key.participant?.split('@')[0] || 'unknown'}\n` +
                                 `Saved: ${new Date().toLocaleString('en-KE')}`;

                await conn.sendMessage(ownerJid, {
                    [mediaType]: buffer,
                    caption: captionText,
                    mimetype: mediaMsg.mimetype
                });

                // Optional success reaction (only visible to you)
                await conn.sendMessage(originalMsg.key.remoteJid, {
                    react: {
                        text: '✅',
                        key: originalMsg.key
                    }
                });

            } catch (error) {
                console.error('[ViewOnce Auto-Save Error]:', error.message);
                // Silent → no disturbance
            }
        }
    });
};

// Auto-initialize when plugin loads
module.exports.init = async (conn) => {
    await module.exports(conn);
};
