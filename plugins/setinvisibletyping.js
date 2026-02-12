// plugins/invisibletyping.js
const { cmd } = require('../command');

global.INVISIBLE_TYPING = false;

cmd({
    pattern: "invistype ?(on|off)?",
    desc: "Show typing only when using commands (stealth mode)",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!args[0]) {
        return reply(`Invisible typing: ${global.INVISIBLE_TYPING ? 'ON' : 'OFF'}`);
    }

    global.INVISIBLE_TYPING = args[0].toLowerCase() === 'on';
    await reply(`Invisible typing ${global.INVISIBLE_TYPING ? 'ON' : 'OFF'}`);
});

// In messages.upsert - before processing commands
if (global.INVISIBLE_TYPING && body.startsWith(prefix)) {
    await conn.sendPresenceUpdate('composing', from);
    // Wait a bit to look human
    await new Promise(r => setTimeout(r, 1200 + Math.random()*2000));
}
