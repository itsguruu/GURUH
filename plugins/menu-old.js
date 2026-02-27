/* Note: GURU MD STEEL EDITION - FULL STABLE RELEASE
   Features: 
   - Anti-Socket Hangup (ECONNRESET fix)
   - Real-time RAM & Uptime Stats
   - Horizontal Newsletter Context
   - Automated "Reply 0" Navigation
*/

const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const os = require('os');

// === CONFIGURATION & ASSETS ===
const LOGO_URL = "https://files.catbox.moe/66h86e.jpg"; // Your Horizontal Logo
const COOL_EMOJIS = ['✨', '🔥', '🌟', '💫', '⚡', '🚀', '💎', '🌈', '🪐', '🎇'];

/**
 * Helper: sendHorizontalPage
 * Prevents bot from crashing if the image host (Catbox) times out.
 */
const sendHorizontalPage = async (conn, from, m, caption, title) => {
    try {
        const sentMsg = await conn.sendMessage(from, {
            image: { url: LOGO_URL },
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
                    thumbnailUrl: LOGO_URL,
                    renderLargerThumbnail: true 
                }
            }
        }, { quoted: m });

        // === Navigation Listener: Reply '0' to go Back ===
        const handler = async (msgData) => {
            const msg = msgData.messages[0];
            if (!msg.message) return;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;

            if (isReply && text === '0') {
                await conn.sendMessage(from, { react: { text: '🏠', key: msg.key } });
                // Re-trigger main menu logic
                const mainCmd = commands.find(c => c.pattern === 'menu');
                if (mainCmd) mainCmd.function(conn, msg, m, { from, reply: (t) => conn.sendMessage(from, { text: t }) });
            }
        };

        conn.ev.on("messages.upsert", handler);
        setTimeout(() => conn.ev.off("messages.upsert", handler), 300000); // Expires in 5 mins
        return sentMsg;

    } catch (e) {
        console.error("PAGE SEND ERROR:", e);
        // Fallback to text if the image fails to load (ECONNRESET)
        return await conn.sendMessage(from, { text: `⚠️ *Image Load Error*\n\n${caption}` }, { quoted: m });
    }
};

// === MAIN DASHBOARD ===
cmd({
    pattern: "menu",
    desc: "Main Steel Edition Menu",
    category: "menu",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const usedRAM = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);
        const randomEmoji = COOL_EMOJIS[Math.floor(Math.random() * COOL_EMOJIS.length)];
        
        const dec = `
█║▌│█│║▌║││█║▌║▌║
   *𝔾𝕌ℝ𝕌 𝕄𝔻 𝕊𝕐𝕊𝕋𝔼𝕄*
█║▌│█│║▌║││█║▌║▌║

🛰️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐃𝐀𝐒𝐇𝐁𝐎𝐀𝐑𝐃*
▮ ▰ 🧠 *𝐑𝐀𝐌:* ${usedRAM}𝐆𝐁 / ${totalRAM}𝐆𝐁
▮ ▰ ⏳ *𝐔𝐩𝐭𝐢𝐦𝐞:* ${runtime(process.uptime())}
▮ ▰ 🛡️ *𝐒𝐭𝐚𝐭𝐮𝐬:* 𝐀𝐜𝐭𝐢𝐯𝐞

⚡ *𝕊𝔼𝕃𝔼ℂ𝕋 𝔸 ℂ𝔸𝕋𝔼𝔾𝕆ℝ𝕐*
╭━━〔 ${randomEmoji} *𝐌𝐚𝐢𝐧 𝐋𝐢𝐬𝐭* ${randomEmoji} 〕━━╮
┃ 🛡️ .𝚐𝚛𝚘𝚞𝚙𝚖𝚎𝚗𝚞
┃ 🎵 .𝚖𝚞𝚜𝚒𝚌𝚖𝚎𝚗𝚞
┃ 🎨 .𝚕𝚘𝚐𝚘𝚖𝚎𝚗𝚞
┃ 🎭 .𝚜𝚝𝚒𝚌𝚔𝚎𝚛𝚖𝚎𝚗𝚞
┃ 👑 .𝚘𝚠𝚗𝚎𝚛𝚖𝚎𝚗𝚞
┃ 🤖 .𝚊𝚒𝚖𝚎𝚗𝚞
┃ 📥 .𝚍𝚕𝚖𝚎𝚗𝚞
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await sendHorizontalPage(conn, from, mek, dec, "𝔻𝔸𝕊ℍ𝔹𝕆𝔸ℝ𝔻");
        
        // Audio auto-play
        await conn.sendMessage(from, { 
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' }, 
            mimetype: 'audio/mp4', 
            ptt: true 
        }, { quoted: mek });

    } catch (e) { console.error(e); }
});

// === CATEGORY: GROUP ===
cmd({ pattern: "groupmenu", category: "menu", react: "🛡️" }, async (conn, mek, m, { from }) => {
    const dec = `╭━━〔 🛡️ *𝐆𝐑𝐎𝐔𝐏 𝐒𝐘𝐒𝐓𝐄𝐌* 〕━━┈⊷
┃◈ • .𝚔𝚒𝚌𝚔 
┃◈ • .𝚊𝚍𝚍 
┃◈ • .𝚙𝚛𝚘𝚖𝚘𝚝𝚎 
┃◈ • .𝚝𝚊𝚐𝚊𝚕𝚕 
┃◈ • .𝚖𝚞𝚝𝚎 
╰──────────────┈⊷
📌 *𝚁𝚎𝚙𝚕𝚢 '𝟶' 𝚝𝚘 𝚐𝚘 𝙱𝚊𝚌𝚔*`;
    await sendHorizontalPage(conn, from, mek, dec, "𝔾ℝ𝕆𝕌ℙ 𝕊𝕐𝕊𝕋𝔼𝕄");
});

// === CATEGORY: DOWNLOADER ===
cmd({ pattern: "dlmenu", category: "menu", react: "📥" }, async (conn, mek, m, { from }) => {
    const dec = `╭━━〔 📥 *𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑* 〕━━┈⊷
┃◈ • .𝚢𝚝𝚖𝚙𝟹 / .𝚢𝚝𝚖𝚙𝟺
┃◈ • .𝚏𝚋 / .𝚝𝚝 / .𝚒𝚗𝚜𝚝𝚊
┃◈ • .𝚜𝚘𝚗𝚐 / .𝚟𝚒𝚍𝚎𝚘
╰──────────────┈⊷
📌 *𝚁𝚎𝚙𝚕𝚢 '𝟶' 𝚝𝚘 𝚐𝚘 𝙱𝚊𝚌𝚔*`;
    await sendHorizontalPage(conn, from, mek, dec, "𝔻𝕃 𝕄𝔼ℕ𝕌");
});

// === CATEGORY: LOGO ===
cmd({ pattern: "logomenu", category: "menu", react: "🎨" }, async (conn, mek, m, { from }) => {
    const dec = `╭━━〔 🎨 *𝐋𝐎𝐆𝐎 𝐌𝐀𝐊𝐄𝐑* 〕━━┈⊷
┃◈ • .𝚗𝚎𝚘𝚗𝚕𝚒𝚐𝚑𝚝
┃◈ • .𝚑𝚊𝚌𝚔𝚎𝚛
┃◈ • .𝚗𝚊𝚛𝚞𝚝𝚘
┃◈ • .𝚐𝚊𝚕𝚊𝚡𝚢
╰──────────────┈⊷
📌 *𝚁𝚎𝚙𝚕𝚢 '𝟶' 𝚝𝚘 𝚐𝚘 𝙱𝚊𝚌𝚔*`;
    await sendHorizontalPage(conn, from, mek, dec, "🎨 𝕃𝕆𝔾𝕆 𝕄𝔸𝕂𝔼ℝ");
});

// === CATEGORY: OWNER ===
cmd({ pattern: "ownermenu", category: "menu", react: "👑" }, async (conn, mek, m, { from }) => {
    const dec = `╭━━〔 👑 *𝐎𝐖𝐍𝐄𝐑 𝐂𝐎𝐍𝐓𝐑𝐎𝐋* 〕━━┈⊷
┃◈ • .𝚛𝚎𝚜𝚝𝚊𝚛𝚝
┃◈ • .𝚞𝚙𝚍𝚊𝚝𝚎
┃◈ • .𝚜𝚎𝚝𝚙𝚙
┃◈ • .𝚋𝚌 [𝚖𝚜𝚐]
╰──────────────┈⊷
📌 *𝚁𝚎𝚙𝚕𝚢 '𝟶' 𝚝𝚘 𝚐𝚘 𝙱𝚊𝚌𝚔*`;
    await sendHorizontalPage(conn, from, mek, dec, "𝕆𝕎ℕ𝔼ℝ ℂ𝕆ℕ𝕋ℝ𝕆𝕃");
});
