// plugins/nickflood.js
const { cmd } = require('../command');

global.NICK_FLOOD = false;
global.NICK_INTERVAL = 10000; // ms

cmd({
    pattern: "nickflood ?(on|off)? ?(\\d+)?",
    desc: "Flood group nickname changes (admin/owner only)",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { reply, args, isGroup, isAdmins, isOwner, from }) => {
    if (!isGroup) return reply("Group only!");
    if (!isOwner && !isAdmins) return reply("Admin or owner only!");

    if (!args[0]) {
        return reply(`Nick flood: ${global.NICK_FLOOD ? 'ON' : 'OFF'}\nInterval: ${global.NICK_INTERVAL/1000}s`);
    }

    if (args[0].toLowerCase() === 'off') {
        global.NICK_FLOOD = false;
        return reply("Nick flood stopped.");
    }

    if (args[0].toLowerCase() === 'on') {
        const sec = Number(args[1]) || 10;
        global.NICK_FLOOD = true;
        global.NICK_INTERVAL = sec * 1000;
        await reply(`Nick flood started — changing every ${sec}s`);
    }
});

// In setInterval (index.js)
setInterval(async () => {
    if (!global.NICK_FLOOD) return;
    try {
        const group = await conn.groupMetadata(from);
        const newNick = ["Guru MD 🔥", "Bot Mode ON", "Nobody Home 👻", "Catch me offline"][Math.floor(Math.random()*4)];
        await conn.groupUpdateSubject(from, newNick);
    } catch {}
}, global.NICK_INTERVAL);
