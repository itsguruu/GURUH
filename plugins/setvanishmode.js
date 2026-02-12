// plugins/vanishmode.js
const { cmd } = require('../command');

global.VANISH_MODE = false;

cmd({
    pattern: "vanishmode ?(on|off)?",
    desc: "Make bot messages vanish after being read",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!args[0]) return reply(`Vanish mode: ${global.VANISH_MODE ? 'ON' : 'OFF'}`);

    global.VANISH_MODE = args[0].toLowerCase() === 'on';
    await reply(`Vanish mode ${global.VANISH_MODE ? 'activated' : 'deactivated'}`);
});

// Wrapper for sendMessage
async function sendVanish(jid, content, options = {}) {
    const msg = await conn.sendMessage(jid, {
        ...content,
        disappearingMessagesInChat: global.VANISH_MODE ? 86400 : undefined // 24h vanish
    }, options);
    return msg;
}
