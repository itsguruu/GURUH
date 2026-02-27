/* Note: GURU MD STEEL EDITION - AUTO-BIO & DASHBOARD
   Features: Real-time Bio Updates, System Stats, Horizontal Page Layout.
*/

const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const os = require('os');

// === AUTO-BIO LOGIC (Runs every hour) ===
setInterval(async () => {
    const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeRAM = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const usedRAM = (totalRAM - freeRAM).toFixed(2);
    const status = `𝐆𝐔𝐑𝐔 𝐌𝐃 𝐕𝟓 ⚡ [ 🧠 RAM: ${usedRAM}GB | ⏳ Uptime: ${runtime(process.uptime())} ]`;
    
    // Attempting to update status (Bio)
    // Note: 'conn' must be accessible in your global scope or passed correctly in your main index.js
    if (global.conn) {
        await global.conn.updateProfileStatus(status);
    }
}, 3600000); // 3600000ms = 1 Hour

const coolEmojis = ['✨', '🔥', '🌟', '💫', '⚡', '🚀', '💎', '🌈', '🪐', '🎇', '💥', '🦋', '🧊', '🪩', '🌙'];

// Reusable Horizontal Page Message
const sendHorizontalPage = async (conn, from, m, caption, title) => {
    const sentMsg = await conn.sendMessage(from, {
        image: { url: "https://files.catbox.moe/66h86e.jpg" },
        caption: caption,
        contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363421164015033@newsletter',
                newsletterName: `𝐆𝐔𝐑𝐔 𝐌𝐃 𝐕𝟓: ${title}`,
                serverMessageId: 143
            },
            externalAdReply: {
                title: `𝔾𝕌ℝ𝕌 𝕄𝔻 - ${title}`,
                body: "⚡ ℝ𝔼ℙ𝕃𝕐 '𝟘' 𝕋𝕆 𝔾𝕆 𝔹𝔸ℂ𝕂",
                mediaType: 1,
                sourceUrl: 'https://github.com/itsguruu/GURU',
                thumbnailUrl: "https://files.catbox.moe/66h86e.jpg",
                renderLargerThumbnail: true 
            }
        }
    }, { quoted: m });

    // Back to Main Menu Logic
    const handler = async (msgData) => {
        const receivedMsg = msgData.messages[0];
        if (!receivedMsg.message) return;
        const text = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
        const isReply = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;

        if (isReply && text === '0') {
            await conn.sendMessage(from, { react: { text: '🏠', key: receivedMsg.key } });
            const mainCmd = commands.find(c => c.pattern === 'menu');
            if (mainCmd) mainCmd.function(conn, receivedMsg, m, { from, reply: (t) => conn.sendMessage(from, { text: t }) });
        }
    };

    conn.ev.on("messages.upsert", handler);
    setTimeout(() => conn.ev.off("messages.upsert", handler), 300000); 
    return sentMsg;
};

// === MAIN MENU WITH STATS ===
cmd({
    pattern: "menu",
    desc: "System stats & interactive menu",
    category: "menu",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeRAM = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const usedRAM = (totalRAM - freeRAM).toFixed(2);
        const randomEmoji = coolEmojis[Math.floor(Math.random() * coolEmojis.length)];
        
        const dec = `
█║▌│█│║▌║││█║▌║▌║
   *𝔾𝕌ℝ𝕌 𝕄𝔻 𝕊𝕐𝕊𝕋𝔼𝕄*
█║▌│█│║▌║││█║▌║▌║

🛰️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐃𝐀𝐒𝐇𝐁𝐎𝐀𝐑𝐃*
▮ ▰ 🧠 *𝐑𝐀𝐌:* ${usedRAM}𝐆𝐁 / ${totalRAM}𝐆𝐁
▮ ▰ ⏳ *𝐔𝐩𝐭𝐢𝐦𝐞:* ${runtime(process.uptime())}
▮ ▰ 📡 *𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦:* ${os.platform()}
▮ ▰ 🛠️ *𝐌𝐨𝐝𝐞:* ${config.MODE}

╭━━〔 ${randomEmoji} *𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬* ${randomEmoji} 〕━━╮
┃ ${randomEmoji} .𝚕𝚘𝚐𝚘
┃ ${randomEmoji} .𝚍𝚕𝚖𝚎𝚗𝚞
┃ ${randomEmoji} .𝚐𝚛𝚘𝚞𝚙𝚖𝚎𝚗𝚞
┃ ${randomEmoji} .𝚘𝚠𝚗𝚎𝚛𝚖𝚎𝚗𝚞
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await sendHorizontalPage(conn, from, mek, dec, "𝔻𝔸𝕊ℍ𝔹𝕆𝔸ℝ𝔻");
        
        // Ensure global.conn is set for Auto-Bio
        global.conn = conn;

        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
            mimetype: 'audio/mp4', ptt: true
        }, { quoted: mek });
    } catch (e) { console.error(e); }
});
