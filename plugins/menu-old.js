/* Note: GURU MD STEEL EDITION - FULL CATEGORY STYLING
   Optimized for: Horizontal Logo, System Stats, and Premium Layout.
*/

const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const os = require('os');

// === AUTO-BIO LOGIC ===
setInterval(async () => {
    const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeRAM = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const usedRAM = (totalRAM - freeRAM).toFixed(2);
    const status = `𝐆𝐔𝐑𝐔 𝐌𝐃 𝐕𝟓 ⚡ [ 🧠 RAM: ${usedRAM}GB | ⏳ Uptime: ${runtime(process.uptime())} ]`;
    if (global.conn) { await global.conn.updateProfileStatus(status); }
}, 3600000);

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
            if (mainCmd) mainCmd.function(conn, receivedMsg, m, { from });
        }
    };

    conn.ev.on("messages.upsert", handler);
    setTimeout(() => conn.ev.off("messages.upsert", handler), 300000); 
    return sentMsg;
};

// === MAIN DASHBOARD ===
cmd({
    pattern: "menu",
    desc: "Premium system dashboard",
    category: "menu",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        global.conn = conn;
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
▮ ▰ 🛡️ *𝐒𝐡𝐢𝐞𝐥𝐝:* 𝐀𝐜𝐭𝐢𝐯𝐞

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
        await conn.sendMessage(from, { audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' }, mimetype: 'audio/mp4', ptt: true }, { quoted: mek });
    } catch (e) { console.log(e); }
});

// === CATEGORY: GROUP ===
cmd({ pattern: "groupmenu", category: "menu", react: "🛡️" }, async (conn, mek, m, { from }) => {
    const dec = `╭━━〔 🛡️ *𝐆𝐑𝐎𝐔𝐏 𝐒𝐘𝐒𝐓𝐄𝐌* 〕━━┈⊷
┃◈ • .𝚔𝚒𝚌𝚔 
┃◈ • .𝚊𝚍𝚍 
┃◈ • .𝚙𝚛𝚘𝚖𝚘𝚝𝚎 / .𝚍𝚎𝚖𝚘𝚝𝚎
┃◈ • .𝚝𝚊𝚐𝚊𝚕𝚕 / .𝚑𝚒𝚍𝚎𝚝𝚊𝚐
┃◈ • .𝚖𝚞𝚝𝚎 / .𝚞𝚗𝚖𝚞𝚝𝚎
┃◈ • .𝚕𝚘𝚌𝚔𝚐𝚌 / .𝚞𝚗𝚕𝚘𝚌𝚔𝚐𝚌
╰──────────────┈⊷
📌 *𝚁𝚎𝚙𝚕𝚢 '𝟶' 𝚝𝚘 𝚐𝚘 𝙱𝚊𝚌𝚔*`;
    await sendHorizontalPage(conn, from, mek, dec, "𝔾ℝ𝕆𝕌ℙ 𝕊𝕐𝕊𝕋𝔼𝕄");
});

// === CATEGORY: MUSIC ===
cmd({ pattern: "musicmenu", category: "menu", react: "🎵" }, async (conn, mek, m, { from }) => {
    const dec = `╭━━〔 🎵 *𝐌𝐔𝐒𝐈𝐂 & 𝐀𝐔𝐃𝐈𝐎* 〕━━┈⊷
┃◈ • .𝚙𝚕𝚊𝚢 [𝚜𝚘𝚗𝚐 𝚗𝚊𝚖𝚎]
┃◈ • .𝚜𝚘𝚗𝚐 [𝚞𝚛𝚕]
┃◈ • .𝚢𝚝𝚖𝚙𝟹 [𝚢𝚝 𝚞𝚛𝚕]
┃◈ • .𝚜𝚙𝚘𝚝𝚒𝚏𝚢 [𝚚𝚞𝚎𝚛𝚢]
┃◈ • .𝚝𝚘𝚖𝚙𝟹 [𝚛𝚎𝚙𝚕𝚢 𝚟𝚒𝚍𝚎𝚘]
╰──────────────┈⊷
📌 *𝚁𝚎𝚙𝚕𝚢 '𝟶' 𝚝𝚘 𝚐𝚘 𝙱𝚊𝚌𝚔*`;
    await sendHorizontalPage(conn, from, mek, dec, "𝕄𝕌𝕊𝕀ℂ ℍ𝕌𝔹");
});

// === CATEGORY: LOGO ===
cmd({ pattern: "logomenu", category: "menu", react: "🎨" }, async (conn, mek, m, { from }) => {
    const dec = `╭━━〔 🎨 *𝐋𝐎𝐆𝐎 𝐃𝐄𝐒𝐈𝐆𝐍* 〕━━┈⊷
┃◈ • .𝚗𝚎𝚘𝚗𝚕𝚒𝚐𝚑𝚝 | .𝚐𝚊𝚕𝚊𝚡𝚢
┃◈ • .𝚋𝚕𝚊𝚌𝚔𝚙𝚒𝚗𝚔 | .𝚑𝚊𝚌𝚔𝚎𝚛
┃◈ • .𝚗𝚊𝚛𝚞𝚝𝚘 | .𝚕𝚞𝚡𝚞𝚛𝚢
┃◈ • .𝚏𝚞𝚝𝚞𝚛𝚒𝚜𝚝𝚒𝚌 | .𝚝𝚊𝚝𝚘𝚘
╰──────────────┈⊷
📌 *𝚁𝚎𝚙𝚕𝚢 '𝟶' 𝚝𝚘 𝚐𝚘 𝙱𝚊𝚌𝚔*`;
    await sendHorizontalPage(conn, from, mek, dec, "🎨 𝕃𝕆𝔾𝕆 𝕄𝔸𝕂𝔼ℝ");
});

// === CATEGORY: STICKERS ===
cmd({ pattern: "stickermenu", category: "menu", react: "🎭" }, async (conn, mek, m, { from }) => {
    const dec = `╭━━〔 🎭 *𝐒𝐓𝐈𝐂𝐊𝐄𝐑 𝐙𝐎𝐍𝐄* 〕━━┈⊷
┃◈ • .𝚜𝚝𝚒𝚌𝚔𝚎𝚛 [𝚛𝚎𝚙𝚕𝚢 𝚒𝚖𝚐]
┃◈ • .𝚜𝚝𝚒𝚌𝚔𝚎𝚛𝚐𝚒𝚏 [𝚟𝚒𝚍]
┃◈ • .𝚝𝚊𝚔𝚎 [𝚙𝚊𝚌𝚔 𝚗𝚊𝚖𝚎]
┃◈ • .𝚎𝚖𝚘𝚓𝚒𝚖𝚒𝚡 [🤩+🔥]
╰──────────────┈⊷
📌 *𝚁𝚎𝚙𝚕𝚢 '𝟶' 𝚝𝚘 𝚐𝚘 𝙱𝚊𝚌𝚔*`;
    await sendHorizontalPage(conn, from, mek, dec, "𝕊𝕋𝕀ℂ𝕂𝔼ℝ 𝕎𝕆ℝ𝕃𝔻");
});

// === CATEGORY: OWNER ===
cmd({ pattern: "ownermenu", category: "menu", react: "👑" }, async (conn, mek, m, { from }) => {
    const dec = `╭━━〔 👑 *𝐎𝐖𝐍𝐄𝐑 𝐂𝐎𝐍𝐓𝐑𝐎𝐋* 〕━━┈⊷
┃◈ • .𝚜𝚎𝚝𝚙𝚙 / .𝚏𝚞𝚕𝚕𝚙𝚙
┃◈ • .𝚋𝚕𝚘𝚌𝚔 / .𝚞𝚗𝚋𝚕𝚘𝚌𝚔
┃◈ • .𝚛𝚎𝚜𝚝𝚊𝚛𝚝 / .𝚞𝚙𝚍𝚊𝚝𝚎
┃◈ • .𝚜𝚎𝚝𝚋𝚒𝚘 / .𝚜𝚎𝚝𝚗𝚊𝚖𝚎
┃◈ • .𝚋𝚛𝚘𝚊𝚍𝚌𝚊𝚜𝚝 [𝚖𝚜𝚐]
╰──────────────┈⊷
📌 *𝚁𝚎𝚙𝚕𝚢 '𝟶' 𝚝𝚘 𝚐𝚘 𝙱𝚊𝚌𝚔*`;
    await sendHorizontalPage(conn, from, mek, dec, "𝕆𝕎ℕ𝔼ℝ ℂ𝕆ℕ𝕋ℝ𝕆𝕃");
});
