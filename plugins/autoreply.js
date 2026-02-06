const { cmd } = require('../command');

let autoReplyText = "Hello! I'm currently busy. Will check later 😎";

cmd({
    pattern: "autoreply(?: (on|off|set))? ?(.*)?",
    desc: "Toggle or set auto-reply message",
    category: "utility",
    react: "💬",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, q }) => {
    try {
        if (global.AUTO_REPLY === undefined) global.AUTO_REPLY = false;

        const command = args[0] ? args[0].toLowerCase() : '';
        const newText = q || args.slice(1).join(' ');

        if (!command) {
            const status = global.AUTO_REPLY ? "ON ✅" : "OFF ❌";
            return reply(
                `*Auto-Reply Status:* ${status}\n` +
                `*Current reply:* ${autoReplyText}\n\n` +
                `Commands:\n` +
                `• .autoreply on → enable\n` +
                `• .autoreply off → disable\n` +
                `• .autoreply set <text> → change reply\n\n` +
                `> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`
            );
        }

        if (command === 'on') {
            global.AUTO_REPLY = true;
            return reply(`*Auto-Reply ON ✅*\nReply: "${autoReplyText}"\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
        }

        if (command === 'off') {
            global.AUTO_REPLY = false;
            return reply(`*Auto-Reply OFF ❌*\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
        }

        if (command === 'set') {
            if (!newText) return reply("Please provide text!\nExample: .autoreply set Assalamu alaikum! Busy rn 🔥");
            autoReplyText = newText;
            return reply(`*Auto-reply updated!*\nNew: "${autoReplyText}"\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
        }

        reply("Use: on, off, set <text>");

    } catch (e) {
        console.error('[autoreply]', e);
        reply(`Error: ${e.message}`);
    }
});
