const { cmd } = require('../command');
const { YtDlp } = require('ytdlp-nodejs');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Optional: Set path to ffmpeg if needed (usually auto-detected)
// process.env.FFMPEG_PATH = require('@ffmpeg-installer/ffmpeg').path;

cmd({
    pattern: "play",
    alias: ["song", "ytplay", "audio"],
    desc: "Download YouTube audio (song) as MP3",
    category: "download",
    use: ".play <song name>",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide song name!\nExample: .play perfect ed sheeran");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Initialize yt-dlp wrapper
        const ytdlp = new YtDlp();

        // Search for the best match
        const searchResults = await ytdlp.search(q, { limit: 1 });

        if (!searchResults || searchResults.length === 0) {
            return reply("⚠️ No results found for: " + q);
        }

        const video = searchResults[0];
        const videoUrl = video.url;
        const title = video.title.replace(/[^\w\s]/gi, '') || "song"; // clean filename

        reply(`Downloading: *${title}*...`);

        // Download audio only as mp3
        const outputPath = path.join(__dirname, `../temp/${title}.mp3`);

        await ytdlp.download(videoUrl, {
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: 0, // best quality
            output: outputPath
        });

        if (!fs.existsSync(outputPath)) {
            throw new Error("File was not created");
        }

        // Send as audio
        await conn.sendMessage(from, {
            audio: { url: outputPath },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            caption: `🎵 *${video.title}*\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech\n> Downloaded via yt-dlp`
        }, { quoted: mek });

        // Clean up temp file (optional but good practice)
        setTimeout(() => {
            fs.unlink(outputPath, (err) => {
                if (err) console.log("Cleanup failed:", err);
            });
        }, 30000); // delete after 30 seconds

    } catch (e) {
        console.error("[PLAY ERROR]", e);
        reply(`Error: ${e.message || "Failed to download. Try again later."}`);
    }
});
