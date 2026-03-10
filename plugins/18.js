const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "randomvid",
    alias: ["rvid", "surprise"],
    desc: "Download a random trending video directly",
    category: "downloader",
    react: "🎲",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        await reply("*⚡ GURU-MD IS FETCHING A RANDOM VIDEO...*");

        // Fetching from a random/trending endpoint
        // Note: Using a general search or trending query to get a direct result
        const apiUrl = `https://apis.davidcyril.name.ng/downloader/xnxx?url=random`; 
        const response = await axios.get(apiUrl);

        if (!response.data || !response.data.status) {
            return reply("*❌ ERROR:* Could not fetch a random video. API might be busy.");
        }

        const data = response.data.result;

        const status = `
╭━━━━〔 *𝔾𝕌ℝ𝕌 𝕄𝔻 𝔸𝕌𝕋𝕆* 〕━━━━╮
┃
┃ 🎬 *𝐓𝐈𝐓𝐋𝐄:* ${data.title}
┃ 🕒 *𝐃𝐔𝐑𝐀𝐓𝐈𝐎𝐍:* ${data.duration}
┃ 🎲 *𝐌𝐎𝐃𝐄:* Random Discovery
┃ 🏗️ *𝐄𝐝𝐢𝐭𝐢𝐨𝐧:* 𝐒𝐭𝐞𝐞𝐥 𝐌𝐚𝐱
┃
╰━━━━━━━━━━━━━━━━━━━━╯

*⏳ 𝐒𝐭𝐚𝐭𝐮𝐬:* 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐍𝐨𝐰...

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await conn.sendMessage(from, { 
            video: { url: data.download.high_quality }, 
            caption: status.trim(),
            mimetype: 'video/mp4',
            fileName: `${data.title}.mp4`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363406466294627@newsletter',
                    newsletterName: '𝐆𝐔𝐑𝐔 𝐌𝐃: 𝐀𝐔𝐓𝐎-𝐃𝐋',
                    serverMessageId: 143
                },
                externalAdReply: {
                    title: "𝔾𝕌ℝ𝕌 𝕄𝔻 ℝ𝔸ℕ𝔻𝕆𝕄 𝕍𝕀𝔻𝔼𝕆",
                    body: "Click to see trending content",
                    mediaType: 1,
                    sourceUrl: 'https://github.com/itsguruu/GURU',
                    thumbnailUrl: data.thumbnail,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Random DL Error:", e);
        reply(`❌ *FAILED:* Could not find a video at this moment.`);
    }
});
