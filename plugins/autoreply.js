// plugins/autoreply.js
const { cmd } = require('../command');

cmd({
    pattern: "autoreply(?: (on|off))?",
    desc: "Toggle or set auto-reply to incoming messages",
    category: "utility",
    react: "💬",
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        let newState = global.AUTO_REPLY || false;  // Assume global.AUTO_REPLY

        if (args[0]) {
            const input = args[0].toLowerCase();
            if (['on', 'enable'].includes(input)) {
                newState = true;
            } else if (['off', 'disable'].includes(input)) {
                newState = false;
            } else {
                return reply("Invalid argument! Use: `.autoreply on` or `.autoreply off`");
            }
        } else {
            newState = !newState;
        }

        global.AUTO_REPLY = newState;

        const statusText = newState ? "ON ✅" : "OFF ❌";

        reply(`Auto Reply: *${statusText}*\nWhen on, bot replies 'Hello! I'm busy.' to all PMs.\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);

    } catch (e) {
        console.error('[autoreply]', e);
        reply(`Error: ${e.message}`);
    }
});

// Add this to your messages.upsert handler in index.js for auto-reply logic
// Example (add inside the handler if !isGroup && global.AUTO_REPLY && !isCmd):
if (!isGroup && global.AUTO_REPLY && !isCmd) {
    reply("Hello! I'm currently busy. Please try later.");
}
