const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "alive",
    alias: ["status", "online", "a"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const status = `
╭───💙〔 *GURU MD* 〕💙───◉
│🔵 *Bot is Active & Online!*
│
│💙 *Owner:* +254 778 074353
│💙 *Created by:* GuruTech
│💙 *Version:* 5.0.0 max
│💙 *Prefix:* [${config.PREFIX}]
│💙 *Mode:* [${config.MODE}]
│💙 *RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
│💙 *Host:* ${os.hostname()}
│💙 *Uptime:* ${runtime(process.uptime())}
│💙 *Repo:* https://github.com/itsguruu/GURU
╰────────────────────💙◉
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech*`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363421164015033@newsletter',
                    newsletterName: 'GURU MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
