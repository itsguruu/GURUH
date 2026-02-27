/* Note: GURU MD STEEL EDITION - FULL AUTO-VERTICAL
   - Image Fix: Permanent Catbox Link
   - Layout: 100% Vertical (Automatic Command Fetching)
   - Design: Steel Barcode Style
   - Use my note in every script.
*/

const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const os = require('os');

const STABLE_LOGO = "https://files.catbox.moe/66h86e.jpg"; 

cmd({
    pattern: "menu",
    alias: ["allmenu", "fullmenu", "menu3"],
    desc: "Show every command in a single vertical list",
    category: "menu",
    react: "📜",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const uptime = runtime(process.uptime());
        
        // --- STEEL BARCODE HEADER ---
        let finalMenu = `█║▌│█│║▌║││█║▌║▌║
   *𝔾𝕌ℝ𝕌 𝕄𝔻 𝕍𝟝 𝕊𝕐𝕊𝕋𝔼𝕄*
█║▌│█│║▌║││█║▌║▌║

🛰️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐃𝐀𝐒𝐇𝐁𝐎𝐀𝐑𝐃*
▮ 🧠 *𝐑𝐀𝐌:* ${totalRAM}𝐆𝐁
▮ ⏳ *𝐔𝐩𝐭𝐢𝐦𝐞:* ${uptime}
▮ ⚙️ *𝐌𝐨𝐝𝐞:* ${config.MODE}

⚡ *𝐀𝐋𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 (𝐕𝐄𝐑𝐓𝐈𝐂𝐀𝐋)*
`;

        // --- AUTOMATIC COMMAND FETCHING ---
        // This is the part that was missing! It finds every command in your bot.
        const allCommands = commands
            .filter(c => c.pattern) // Only get valid commands
            .map(c => `┃◈ .${c.pattern}`) // Put each on a NEW line with prefix
            .sort() // Optional: Sorts them alphabetically A-Z
            .join('\n'); // Joins them into one long vertical string

        finalMenu += allCommands;
        finalMenu += `\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢᴜʀᴜᴛᴇᴄʜ 𝟸𝟶𝟸𝟼`;

        // --- SEND WITH HORIZONTAL BANNER ---
        await conn.sendMessage(from, {
            image: { url: STABLE_LOGO },
            caption: finalMenu,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "𝔾𝕌ℝ𝕌 𝕄𝔻 - 𝕊𝕋𝔼𝔼𝕃 𝔽𝕌𝕃𝕃 𝕍𝔼ℝ𝕋𝕀ℂ𝔸𝕃",
                    body: "⚡ 𝟹𝟻𝟶+ 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂 𝙻𝙾𝙰𝙳𝙴𝙳",
                    mediaType: 1,
                    sourceUrl: 'https://github.com/itsguruu/GURU',
                    thumbnailUrl: STABLE_LOGO,
                    renderLargerThumbnail: true 
                }
            }
        }, { quoted: mek });

        // --- PLAY AUDIO ---
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
            mimetype: 'audio/mp4',
            ptt: true,
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        // Fallback: If image fails, send just the text list
        const textList = commands.filter(c => c.pattern).map(c => `┃◈ .${c.pattern}`).sort().join('\n');
        reply("*𝔾𝕌ℝ𝕌 𝕄𝔻 𝕊𝕐𝕊𝕋𝔼𝕄*\n\n" + textList);
    }
});
