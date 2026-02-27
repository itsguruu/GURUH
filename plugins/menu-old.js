/* Note: GURU MD STEEL EDITION - HORIZONTAL BANNER STYLE 
   This uses the Newsletter Context to display the image as a 
   clean horizontal page header.
*/

const config = require('../config');
const { cmd, commands } = require('../command');

const coolEmojis = ['✨', '🔥', '🌟', '💫', '⚡', '🚀', '💎', '🌈', '🪐', '🎇', '💥', '🦋', '🧊', '🪩', '🌙'];

// Helper for the "Horizontal Page" (Newsletter) Style
const sendHorizontalPage = async (conn, from, m, caption, title) => {
    return await conn.sendMessage(from, {
        image: { url: "https://files.catbox.moe/ntfw9h.jpg" }, // Your matched image
        caption: caption,
        contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363421164015033@newsletter',
                newsletterName: `𝐆𝐔𝐑𝐔 𝐌𝐃: ${title}`,
                serverMessageId: 143
            },
            externalAdReply: {
                title: `𝔾𝕌ℝ𝕌 𝕄𝔻 𝕍𝟝 - ${title}`,
                body: "⚡ ᴘʀᴇᴍɪᴜᴍ ᴇᴅɪᴛɪᴏɴ ⚡",
                mediaType: 1,
                sourceUrl: 'https://github.com/itsguruu/GURU',
                thumbnailUrl: "https://files.catbox.moe/ntfw9h.jpg",
                renderLargerThumbnail: false // Forces the horizontal "small" look
            }
        }
    }, { quoted: m });
};

// === MAIN MENU ===
cmd({
    pattern: "menu",
    desc: "Horizontal banner style menu",
    category: "menu",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const randomEmoji = coolEmojis[Math.floor(Math.random() * coolEmojis.length)];
        const dec = `
█║▌│█│║▌║││█║▌║▌║
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

        await sendHorizontalPage(conn, from, mek, dec, "𝕊𝕐𝕊𝕋𝔼𝕄 ℙ𝔸𝔾𝔼");
        
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });
    } catch (e) { reply(`${e}`); }
});

// === DL MENU ===
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

        await sendHorizontalPage(conn, from, mek, dec, "𝔻𝕆𝕎ℕ𝕃𝕆𝔸𝔻𝕊");
    } catch (e) { reply(`${e}`); }
});

// === REACTIONS MENU ===
cmd({
    pattern: "reactions",
    category: "menu",
    react: "💫",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let dec = `╭━━〔 *𝚁𝚎𝚊𝚌𝚝𝚒𝚘𝚗𝚜 𝙼𝚎𝚗𝚞* 〕━━┈⊷
┃◈ • bully, • cuddle, • cry
┃◈ • hug, • kiss, • slap
┃◈ • kill, • happy, • wink
╰──────────────┈⊷
> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await sendHorizontalPage(conn, from, mek, dec, "ℝ𝔼𝔸ℂ𝕋𝕀𝕆ℕ𝕊");
    } catch (e) { reply(`${e}`); }
});
