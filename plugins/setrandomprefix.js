// plugins/randomprefix.js
const { cmd } = require('../command');

const prefixes = ['.', '!', '#', '$', '%', '^', '&', '*', '+', '-'];

global.RANDOM_PREFIX = false;

cmd({
    pattern: "randomprefix ?(on|off)?",
    desc: "Randomly change prefix every hour",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!args[0]) return reply(`Random prefix: ${global.RANDOM_PREFIX ? 'ON' : 'OFF'}`);

    global.RANDOM_PREFIX = args[0].toLowerCase() === 'on';
    await reply(`Random prefix ${global.RANDOM_PREFIX ? 'activated' : 'deactivated'}`);
});

// In index.js setInterval
setInterval(() => {
    if (!global.RANDOM_PREFIX) return;
    global.prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    console.log(`[RandomPrefix] New prefix: ${global.prefix}`);
}, 3600000); // every hour
