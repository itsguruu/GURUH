const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "alive",
    alias: ["status", "online", "a"],
    desc: "Check if bot is alive",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const userTag = `@${m.sender.split('@')[0]}`;

        const status = `
╔═══════════════╗
║ ✦ GURU MD ✦   ║
╠═══════════════╣
║ User ❯ ${userTag} ║
║ Status ❯ ON 🔥 ║
║ Prefix ❯ ${config.PREFIX} ║
║ Uptime ❯ ${runtime(process.uptime())} ║
╚═══════════════╝

• 𝐅𝐀𝐒𝐓 • 𝐔𝐍𝐅𝐎𝐑𝐆𝐈𝐕𝐈𝐍𝐆 •
  𝐍𝐈 𝐌𝐁𝐀𝐘𝐀 😅

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363406466294627@newsletter',
                    newsletterName: 'GURU MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`Error: ${e.message}`);
    }
});
