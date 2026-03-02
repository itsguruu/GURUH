const { cmd } = require('../command');
const axios = require('axios');
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs');
const stream = require('stream'); // Built-in, for stream handling

// Helper to convert stream to buffer
const streamToBuffer = (readableStream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => chunks.push(data));
    readableStream.on('end', () => resolve(Buffer.concat(chunks)));
    readableStream.on('error', reject);
  });
};

cmd({
    pattern: "play",
    alias: ["song", "ytplay", "music", "audio"],
    desc: "Download YouTube audio (100% working)",
    category: "download",
    use: ".play <song name>",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a song name!\n\n*Example:* .play Helplessly Tatiana Manaois");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        const statusMsg = await reply(`🔍 *Searching:* ${q}\n⏱️ Please wait...`);

        // Search for the video
        const searchResults = await ytSearch(q);
        
        if (!searchResults || !searchResults.videos || searchResults.videos.length === 0) {
            return reply("❌ No results found. Try different keywords.");
        }

        // Get the best match
        const video = searchResults.videos[0];
        
        const videoInfo = {
            title: video.title,
            url: video.url,
            duration: video.timestamp,
            views: formatNumber(video.views),
            thumbnail: video.thumbnail,
            author: video.author.name,
            videoId: video.videoId
        };

        await conn.sendMessage(from, {
            text: `📥 *Downloading:*\n🎵 ${videoInfo.title}\n👤 ${videoInfo.author}\n⏱️ ${videoInfo.duration}\n\n⏳ Getting audio...`,
            edit: statusMsg.key
        });

        // Download audio using ytdl-core
        let downloadUrl = null;
        let method = 'ytdl-core';

        try {
            console.log("Downloading audio with ytdl-core...");
            const audioStream = ytdl(video.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25 // Increase buffer size to prevent stream issues
            });

            const audioBuffer = await streamToBuffer(audioStream);

            // If we have the buffer, send the audio
            if (audioBuffer && audioBuffer.length > 0) {
                const caption = `╭══━ ★ *GURU-MD PLAYER* ★ ━══╮\n\n` +
                    `🎵 *Title:* ${videoInfo.title}\n` +
                    `👤 *Channel:* ${videoInfo.author}\n` +
                    `⏱️ *Duration:* ${videoInfo.duration}\n` +
                    `👀 *Views:* ${videoInfo.views}\n` +
                    `📦 *Source:* ${method}\n\n` +
                    `╰══━ ★ *Powered By GuruTech* ★ ━══╯`;

                // Send the audio
                await conn.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    fileName: `${videoInfo.title.replace(/[^\w\s]/gi, '')}.mp3`,
                    caption: caption,
                    contextInfo: {
                        externalAdReply: {
                            title: videoInfo.title.substring(0, 30),
                            body: `👤 ${videoInfo.author} • ⏱️ ${videoInfo.duration}`,
                            thumbnailUrl: videoInfo.thumbnail,
                            sourceUrl: video.url,
                            mediaType: 2
                        }
                    }
                }, { quoted: mek });

                await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
                
                // Send thumbnail
                await conn.sendMessage(from, {
                    image: { url: videoInfo.thumbnail },
                    caption: `🎵 *Downloaded Successfully!*\n> ${videoInfo.title}\n> ${videoInfo.author}`,
                    viewOnce: true
                }, { quoted: mek });
            } else {
                throw new Error('Empty audio buffer');
            }
        } catch (e) {
            console.log("ytdl-core failed:", e.message);
            // Fallback to your original emergency logic if needed
            const finalMsg = `❌ *Download failed*\n\n` +
                `🎵 *Title:* ${videoInfo.title}\n` +
                `👤 *Channel:* ${videoInfo.author}\n` +
                `⏱️ *Duration:* ${videoInfo.duration}\n\n` +
                `🔗 *Watch on YouTube:*\n${video.url}\n\n` +
                `💡 *Try manually on y2mate.com*`;

            await conn.sendMessage(from, {
                image: { url: videoInfo.thumbnail },
                caption: finalMsg
            }, { quoted: mek });
            
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        }

    } catch (error) {
        console.error("Play command error:", error);
        reply("❌ Error: " + error.message);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

// Your backup commands can remain the same, or update them similarly with ytdl-core

// Format numbers helper
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
