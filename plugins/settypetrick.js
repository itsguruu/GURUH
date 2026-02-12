// plugins/typetrick.js
const { cmd } = require('../command');

global.TYPE_TRICK = false;

cmd({
    pattern: "typetrick(?:\\s+(on|off))?",
    desc: "Fake typing → recording → thinking loop (looks busy)",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!args[0]) {
        return reply(`Type trick: ${global.TYPE_TRICK ? 'ON' : 'OFF'}`);
    }

    global.TYPE_TRICK = args[0].toLowerCase() === 'on';
    await reply(`Type trick ${global.TYPE_TRICK ? 'activated' : 'deactivated'}`);
});

// Add periodic presence changer (in setInterval in index.js)
setInterval(async () => {
    if (!global.TYPE_TRICK) return;
    const states = ['composing', 'recording', 'paused'];
    const randomState = states[Math.floor(Math.random() * states.length)];
    try {
        await conn.sendPresenceUpdate(randomState);
    } catch {}
}, 8000); // every 8 seconds
