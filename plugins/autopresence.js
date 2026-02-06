// plugins/autopresence.js
const { cmd } = require('../command');

cmd({
    pattern: "autopresence(?: (online|typing|recording|off))?",
    desc: "Set auto-presence status (online, typing, recording)",
    category: "utility",
    react: "📱",
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        let newPresence = global.AUTO_PRESENCE || 'off';

        if (args[0]) {
            const input = args[0].toLowerCase();
            if (['online', 'typing', 'recording', 'off'].includes(input)) {
                newPresence = input;
            } else {
                return reply("Invalid! Use: `.autopresence online/typing/recording/off`");
            }
        } else {
            return reply(`Current Auto Presence: *${newPresence.toUpperCase()}*`);
        }

        global.AUTO_PRESENCE = newPresence;

        reply(`Auto Presence set to: *${newPresence.toUpperCase()} ✅*\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);

    } catch (e) {
        console.error('[autopresence]', e);
        reply(`Error: ${e.message}`);
    }
});

// Add this to index.js (e.g. in messages.upsert or connection.update)
conn.ev.on('messages.upsert', async (mekUpdate) => {
    // ... your existing code

    if (global.AUTO_PRESENCE !== 'off') {
        await conn.sendPresenceUpdate(global.AUTO_PRESENCE, from);
    }
});
