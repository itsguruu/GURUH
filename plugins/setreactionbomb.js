// plugins/reactionbomb.js
const { cmd } = require('../command');

global.REACT_BOMB = false;

const bombEmojis = ['🔥','💀','🤡','💯','😂','😭','👀','🗿','🤓','😈','✨','🚀','🌚','🤡'];

cmd({
    pattern: "reactbomb(?:\\s+(on|off))?",
    desc: "React to every message with random emoji",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!args[0]) {
        return reply(`Reaction bomb: ${global.REACT_BOMB ? 'ON' : 'OFF'}`);
    }

    global.REACT_BOMB = args[0].toLowerCase() === 'on';
    await reply(`Reaction bomb ${global.REACT_BOMB ? 'activated' : 'deactivated'}`);
});

// In messages.upsert
if (global.REACT_BOMB && !mek.key.fromMe) {
    const randomEmoji = bombEmojis[Math.floor(Math.random() * bombEmojis.length)];
    await conn.sendMessage(from, { react: { text: randomEmoji, key: mek.key } });
}
