// plugins/fakeread.js
const { cmd } = require('../command');

global.FAKE_READ = false;

cmd({
    pattern: "fakeread(?:\\s+(on|off))?",
    desc: "Fake read receipts (appear online but never show blue ticks)",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!args[0]) {
        return reply(`Fake read receipts: ${global.FAKE_READ ? 'ON (blue ticks hidden)' : 'OFF'}`);
    }

    global.FAKE_READ = args[0].toLowerCase() === 'on';
    await reply(`Fake read receipts turned ${global.FAKE_READ ? 'ON' : 'OFF'}`);
});

// In messages.upsert → replace normal readMessages with:
if (config.READ_MESSAGE === 'true' && !global.FAKE_READ) {
    await conn.readMessages([mek.key]);
} else if (global.FAKE_READ) {
    // Do nothing → no blue ticks
}
