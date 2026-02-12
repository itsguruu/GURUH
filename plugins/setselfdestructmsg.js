// plugins/selfdestructmsg.js
const { cmd } = require('../command');

global.SELF_DESTRUCT_DELAY = 0; // 0 = disabled, seconds otherwise

cmd({
    pattern: "selfdestruct ?(\\d+)?",
    desc: "Auto-delete bot's own sent messages after X seconds",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!args[0]) {
        const status = global.SELF_DESTRUCT_DELAY > 0 ? `ON (${global.SELF_DESTRUCT_DELAY}s)` : 'OFF';
        return reply(`Self-destruct messages: ${status}\nUsage: .selfdestruct 30`);
    }

    const sec = Number(args[0]);
    if (isNaN(sec) || sec < 0) return reply("Seconds only (0 = disable)");

    global.SELF_DESTRUCT_DELAY = sec;
    await reply(`Bot messages will self-destruct in ${sec}s ${sec === 0 ? '(disabled)' : ''}`);
});

// In every place you sendMessage (or create a wrapper):
// Example wrapper function in index.js or lib
async function sendDestructMsg(jid, content, options = {}) {
    const msg = await conn.sendMessage(jid, content, options);
    if (global.SELF_DESTRUCT_DELAY > 0) {
        setTimeout(async () => {
            try {
                await conn.sendMessage(jid, { delete: msg.key });
            } catch {}
        }, global.SELF_DESTRUCT_DELAY * 1000);
    }
    return msg;
}
