/* Note: GURU MD STEEL EDITION - PAGE STYLE 
   Optimized for horizontal document layout.
*/

const config = require('../config');
const { cmd, commands } = require('../command');

const coolEmojis = ['✨', '🔥', '🌟', '💫', '⚡', '🚀', '💎', '🌈', '🪐', '🎇', '💥', '🦋', '🧊', '🪩', '🌙'];

// Helper for the "Page Style" (Document) Message
const sendPageStyle = async (conn, from, m, caption, title) => {
    return await conn.sendMessage(from, {
        document: { url: 'https://github.com/itsguruu/GURU' }, // Dummy link for doc
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileName: `𝔾𝕌ℝ𝕌 𝕄𝔻 𝕍𝟝 - ${title}`, // Page Title
        fileLength: 999999999999,
        pageCount: 2026,
        contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            externalAdReply: {
                title: `𝐆𝐔𝐑𝐔 𝐌𝐃 - ${title}`,
                body: "ᴛʜᴇ ꜰᴜᴛᴜʀᴇ ᴏꜰ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛꜱ",
                thumbnailUrl: "https://files.catbox.moe/ntfw9h.jpg", // Your matched image
                sourceUrl: 'https://github.com/itsguruu/GURU',
                mediaType: 1,
                renderLargerThumbnail: false // Keeps it horizontal
            }
        },
        caption: caption
    }, { quoted: m });
};

// === MAIN MENU ===
cmd({
    pattern: "menu",
    desc: "Page style main menu",
    category: "menu",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const randomEmoji = coolEmojis[Math.floor(Math.random() * coolEmojis.length)];
        const dec = `█║▌│█│║▌║││█║▌║▌║
   *𝔾𝕌ℝ𝕌 𝕄𝔻 𝕊𝕐𝕊𝕋𝔼𝕄*
█║▌│█│║▌║││█║▌║▌║

▮ ▰ 👤 *𝐎𝐖𝐍𝐄𝐑:* +254 778 074353
▮ ▰ 🛠️ *𝐌𝐎𝐃𝐄:* ${config.MODE}
▮ ▰ ⚡ *𝐕𝐄𝐑:* 5.0.0 Pro

╭━━〔 ${randomEmoji} *𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬* ${randomEmoji} 〕━━╮
┃ ${randomEmoji} 𝚀𝚞𝚛𝚊𝚗𝚖𝚎𝚗𝚞
┃ ${randomEmoji} 𝙿𝚛𝚊𝚢𝚎𝚛𝚝𝚒𝚖𝚎
┃ ${randomEmoji} 𝙰𝚒𝚖𝚎𝚗𝚞
┃ ${randomEmoji} 𝙰𝚗𝚖𝚒𝚎𝚖𝚎𝚗𝚞
┃ ${randomEmoji} 𝚁𝚎𝚊𝚌𝚝𝚒𝚘𝚗𝚜
┃ ${randomEmoji} 𝙳𝚕𝚖𝚎𝚗𝚞
┃ ${randomEmoji} 𝙶𝚛𝚘𝚞𝚙𝚖𝚎𝚗𝚞
┃ ${randomEmoji} 𝙾𝚠𝚗𝚎𝚛𝚖𝚎𝚗𝚞
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await sendPageStyle(conn, from, mek, dec, "𝕄𝔸𝕀ℕ 𝕊𝕐𝕊𝕋𝔼𝕄");
        
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });
    } catch (e) { reply(`${e}`); }
});

// === DOWNLOAD MENU ===
cmd({
    pattern: "dlmenu",
    category: "menu",
    react: "⤵️",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let dec = `╭━━〔 *𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍 𝙼𝚎𝚗𝚞* 〕━━┈⊷
┃◈ • facebook, • tiktok
┃◈ • insta, • apk, • play
┃◈ • ytmp3, • ytmp4, • song
╰──────────────┈⊷
> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await sendPageStyle(conn, from, mek, dec, "𝔻𝕆𝕎ℕ𝕃𝕆𝔸𝔻 ℙ𝔸𝔾𝔼");
    } catch (e) { reply(`${e}`); }
});

// === GROUP MENU ===
cmd({
    pattern: "groupmenu",
    category: "menu",
    react: "🛡️",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let dec = `╭━━〔 *𝙶𝚛𝚘𝚞𝚙 𝙼𝚎𝚗𝚞* 〕━━┈⊷
┃◈ • kick, • add, • promote
┃◈ • demote, • mute, • tagall
┃◈ • hidetag, • invite
╰──────────────┈⊷
> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await sendPageStyle(conn, from, mek, dec, "𝔾ℝ𝕆𝕌ℙ ℙ𝔸𝔾𝔼");
    } catch (e) { reply(`${e}`); }
});
