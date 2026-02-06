const { cmd } = require('../command');

let autoReplyText = global.AUTO_REPLY_TEXT || "Hello! I'm currently busy. Will check later 😎";

cmd({
    pattern: "autoreply(?: (on|off|set))? ?(.*)?",
    desc: "Manage auto-reply: toggle on/off or set custom message",
    category: "utility",
    react: "💬",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, q, isGroup }) => {
    try {
        // Default state if not set
        if (global.AUTO_REPLY === undefined) global.AUTO_REPLY = false;

        const command = args[0] ? args[0].toLowerCase() : '';
        const newText = q || args.slice(1).join(' ');

        if (!command) {
            // Show current status
            const status = global.AUTO_REPLY ? "ON ✅" : "OFF ❌";
            const where = isGroup ? "groups & PMs" : "PMs only (enable in groups too)";
            return reply(
                `*Auto-Reply Status:* ${status}\n` +
                `*Current reply text:* ${autoReplyText}\n\n` +
                `Works in: ${where}\n\n` +
                `Commands:\n` +
                `• .autoreply on → enable\n` +
                `• .autoreply off → disable\n` +
                `• .autoreply set <your message> → change text\n\n` +
                `> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`
            );
        }

        if (command === 'on' || command === 'enable') {
            global.AUTO_REPLY = true;
            return reply(`*Auto-Reply turned ON ✅*\nCurrent message: "${autoReplyText}"\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
        }

        if (command === 'off' || command === 'disable') {
            global.AUTO_REPLY = false;
            return reply(`*Auto-Reply turned OFF ❌*\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
        }

        if (command === 'set') {
            if (!newText) return reply("Please provide the new reply text!\nExample: .autoreply set Assalamu alaikum! Busy rn 🔥");
            autoReplyText = newText;
            global.AUTO_REPLY_TEXT = newText; // persist
            return reply(`*Auto-reply text updated!*\nNew message: "${autoReplyText}"\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
        }

        reply("Invalid sub-command! Use: on, off, set <text>");

    } catch (e) {
        console.error('[autoreply]', e);
        reply(`Error: ${e.message || e}`);
    }
});

// ---------------------------------------------------------------------
// IMPORTANT: Add this block INSIDE your messages.upsert handler in index.js
// ---------------------------------------------------------------------
// Look for: conn.ev.on('messages.upsert', async (mekUpdate) => {
// Inside there, after you define 'body', 'isCmd', 'from', etc.
// Add this (preferably after status handling, before main command processing):

if (global.AUTO_REPLY && !isCmd && !mek.key.fromMe) {
    // Optional: skip if in group and you don't want group autoreply
    // if (isGroup) return;

    let replyMsg = autoReplyText || "Hello! I'm currently busy. Will check later 😎";

    // Replace {tag} with your bot tag from config
    if (config.ENABLE_TAGGING) {
        const tag = config.BOT_TAG_TEXT || '> _Powered by GURU MD 💢_';
        replyMsg = config.TAG_POSITION === 'start' 
            ? `\( {tag}\n\n \){replyMsg}`
            : `\( {replyMsg}\n\n \){tag}`;
    }

    await conn.sendMessage(from, { text: replyMsg });
    console.log(chalk.magenta(`[AUTO-REPLY SENT] → ${senderNumber}: ${replyMsg}`));
}
