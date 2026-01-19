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
        const status = `
╔══════════════════════════════════════╗
║          ✦ G U R U   M D ✦           ║
║     v5.0.0  •  ALWAYS AWAKE 🔥       ║
╠══════════════════════════════════════╣
║  STATUS     ❯  ONLINE & VICIOUS      ║
║  BOT        ❯  GURU-MD               ║
║  CREATOR    ❯  GuruTech              ║
║  PREFIX     ❯  ${config.PREFIX.padEnd(14)}            ║
║  MODE       ❯  ${config.MODE.padEnd(14)}             ║
║  RAM        ❯  ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB ║
║  HOST       ❯  ${os.hostname().slice(0,22).padEnd(14)}║
║  UPTIME     ❯  ${runtime(process.uptime()).padEnd(14)}║
╠══════════════════════════════════════╣
║                                      ║
║         𝐍𝐈 𝐌𝐁𝐀𝐘𝐀 😅                 ║
║       𝙽𝙸 𝙼𝙱𝙰𝚈𝙰 😅                   ║
║                ║
║   • 𝐅𝐀𝐒𝐓 • 𝐒𝐇𝐀𝐑𝐏 • 𝐔𝐍𝐅𝐎𝐑𝐆𝐈𝐕𝐈𝐍𝐆 •   ║
╚══════════════════════════════════════╝

   > © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
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
        reply(`Error: ${e.message}`);
    }
});
