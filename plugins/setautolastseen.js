// plugins/autolastseen.js
const { cmd } = require('../command');

global.AUTO_LASTSEEN = 'all'; // all | contacts | none

cmd({
    pattern: "autolastseen ?(all|contacts|none)?",
    desc: "Auto-rotate last seen privacy",
    category: "privacy",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!args[0]) return reply(`Auto last seen: ${global.AUTO_LASTSEEN}`);

    const mode = args[0].toLowerCase();
    if (!['all','contacts','none'].includes(mode)) return reply("Options: all | contacts | none");

    global.AUTO_LASTSEEN = mode;
    await conn.sendMessage('me', { text: `Last seen set to ${mode}` });
});

// In setInterval (rotate every 4 hours)
setInterval(async () => {
    const modes = ['all', 'contacts', 'none'];
    const next = modes[(modes.indexOf(global.AUTO_LASTSEEN) + 1) % 3];
    global.AUTO_LASTSEEN = next;
    // Call privacy update API if available
    // await conn.updatePrivacy({ lastSeen: next });
}, 4 * 3600000);
