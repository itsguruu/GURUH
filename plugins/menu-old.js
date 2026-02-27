/* Note: GURU MD STEEL EDITION - ANTI-CRASH STABLE VERSION
   Fixed: ECONNRESET / Socket Hang Up error handling.
*/

const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const os = require('os');

// Helper for horizontal layout with ANTI-CRASH logic
const sendMenuPage = async (conn, from, m, caption, title) => {
    try {
        // Try sending with the image first
        return await conn.sendMessage(from, {
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
    } catch (error) {
        console.log("Image Load Failed, sending text-only menu...");
        // Fallback: Send only text if the image host (Catbox) hangs up
        return await conn.sendMessage(from, { 
            text: `*⚠️ [Image Load Error] Sending Text Menu:*\n\n${caption}` 
        }, { quoted: m });
    }
};

// === MAIN MENU ===
cmd({
    pattern: "menu",
    desc: "Fixed stable menu",
    category: "menu",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const usedRAM = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);
        
        const dec = `
█║▌│█│║▌║││█║▌║▌║
   *𝔾𝕌ℝ𝕌 𝕄𝔻 𝕊𝕐𝕊𝕋𝔼𝕄*
█║▌│█│║▌║││█║▌║▌║

🛰️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐃𝐀𝐒𝐇𝐁𝐎𝐀𝐑𝐃*
▮ ▰ 🧠 *𝐑𝐀𝐌:* ${usedRAM}𝐆𝐁 / ${totalRAM}𝐆𝐁
▮ ▰ ⏳ *𝐔𝐩𝐭𝐢𝐦𝐞:* ${runtime(process.uptime())}

⚡ *𝕊𝔼𝕃𝔼ℂ𝕋 𝔸 ℂ𝔸𝕋𝔼𝔾𝕆ℝ𝕐*
╭━━〔 ✨ *𝐌𝐚𝐢𝐧 𝐋𝐢𝐬𝐭* ✨ 〕━━╮
┃ 🛡️ .𝚐𝚛𝚘𝚞𝚙𝚖𝚎𝚗𝚞
┃ 🎵 .𝚖𝚞𝚜𝚒𝚌𝚖𝚎𝚗𝚞
┃ 🎨 .𝚕𝚘𝚐𝚘𝚖𝚎𝚗𝚞
┃ 🎭 .𝚜𝚝𝚒𝚌𝚔𝚎𝚛𝚖𝚎𝚗𝚞
┃ 📥 .𝚍𝚕𝚖𝚎𝚗𝚞
┃ 👑 .𝚘𝚠𝚗𝚎𝚛𝚖𝚎𝚗𝚞
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await sendMenuPage(conn, from, mek, dec, "𝔻𝔸𝕊ℍ𝔹𝕆𝔸ℝ𝔻");

    } catch (e) {
        console.error("Menu Command Error:", e);
    }
});
