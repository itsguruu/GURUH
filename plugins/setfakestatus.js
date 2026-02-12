// plugins/settings-fakestatus.js
const { cmd } = require('../command');

global.FAKE_PRESENCE = null; // null = real, or 'available'|'composing'|'recording'|'offline'

cmd({
    pattern: "fakestatus ?(.*)",
    desc: "Fake your presence status (owner only)",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    const input = args[0]?.toLowerCase().trim();

    const valid = [null, 'available', 'composing', 'recording', 'offline'];
    if (!input || !valid.includes(input)) {
        const current = global.FAKE_PRESENCE || 'real';
        return reply(`Current fake status: *${current}*\nOptions: available | composing | recording | offline | (empty to reset)`);
    }

    global.FAKE_PRESENCE = input || null;
    await reply(`Fake presence set to *${input || 'real'}*`);

    // Apply immediately to current chat
    await conn.sendPresenceUpdate(input || 'available', mek.key.remoteJid);
});

// In your connection or periodic loop (every 30s for example):
setInterval(async () => {
    if (global.FAKE_PRESENCE) {
        // Fake it across all chats or just current one
        // For simplicity, apply when needed in messages.upsert
    }
}, 30000);
