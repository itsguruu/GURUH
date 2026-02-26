const { cmd } = require('../command');

cmd({
    pattern: "autopresence(?:\\s+(online|typing|recording|off))?",
    desc: "Set or view auto-presence status (online | typing | recording | off)",
    category: "utility",
    react: "📱",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, q }) => {
    try {
        // Default to 'off' if not set
        if (!global.AUTO_PRESENCE) {
            global.AUTO_PRESENCE = 'off';
        }

        // Show current status
        if (!args[0]) {
            return reply(`Current Auto-Presence: *${global.AUTO_PRESENCE.toUpperCase()}*`);
        }

        // Set new status
        const input = args[0].toLowerCase().trim();
        const valid = ['online', 'typing', 'recording', 'off'];

        if (!valid.includes(input)) {
            return reply(`Invalid choice!\nUse one of: \( {valid.map(v => `* \){v}*`).join(' | ')}`);
        }

        global.AUTO_PRESENCE = input;

        // Immediately apply to current chat (optional nice touch)
        if (input !== 'off') {
            await conn.sendPresenceUpdate(input, from).catch(() => {});
        }

        return reply(`Auto-Presence updated to: *${input.toUpperCase()}* ✅\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);

    } catch (e) {
        console.error('[autopresence]', e);
        return reply(`Error: ${e.message || 'Something went wrong'}`);
    }
});
