// plugins/blockwave.js
const { cmd } = require('../command');

global.BLOCK_WAVE = false;

cmd({
    pattern: "blockwave ?(on|off)?",
    desc: "Auto-block users sending long voice notes",
    category: "anti-spam",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!args[0]) return reply(`Block long waves: ${global.BLOCK_WAVE ? 'ON' : 'OFF'}`);

    global.BLOCK_WAVE = args[0].toLowerCase() === 'on';
    await reply(`Long voice note blocker ${global.BLOCK_WAVE ? 'ON' : 'OFF'}`);
});

// In messages.upsert
if (global.BLOCK_WAVE && mek.message?.audioMessage?.seconds > 30) {
    await conn.updateBlockStatus(mek.key.participant, 'block');
    await conn.sendMessage(from, { text: "Blocked for sending long voice notes" });
}
