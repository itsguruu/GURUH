const { cmd } = require('../command');

global.GHOST_MODE = false; // global toggle (affects whole bot)

cmd({
    pattern: "ghost(?:\\s+(on|off|enable|disable))?",
    desc: "Hide typing/online status (ghost mode)",
    category: "owner",
    react: "👻",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only command!");

    if (!args[0]) {
        return reply(`Ghost mode is *${global.GHOST_MODE ? 'ON 👻' : 'OFF'}*`);
    }

    const enable = ['on', 'enable'].includes(args[0].toLowerCase());
    global.GHOST_MODE = enable;

    await reply(`Ghost mode ${enable ? 'activated 👻 (invisible)' : 'deactivated'}`);
});

// Add this in your messages.upsert before any sendPresenceUpdate or readMessages
if (global.GHOST_MODE) {
    // Skip presence updates and read receipts
    // Optionally still read messages silently if you want
    // await conn.readMessages([mek.key]); // uncomment if you want silent read
} else {
    // Normal behavior
    await conn.sendPresenceUpdate('available', from);
}
