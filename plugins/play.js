/* ============================================
   GURU MD - FIXED YOUTUBE PLAY PLUGIN
   COMMANDS: .play, .song, .yt, .video
   FIXED: Audio now plays on WhatsApp correctly
   ============================================ */

const { cmd } = require('../command');
const axios = require('axios');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "play",
    alias: ["song", "ytplay", "music"],
    desc: "Download YouTube audio that works on WhatsApp",
    category: "download",
    use: ".play <song name>",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a song name!\n\n*Example:* .play Alan Walker Faded");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        // Send searching status
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
            uploaded: video.ago,
            videoId: video.videoId
        };

        // Update status
        await conn.sendMessage(from, {
            text: `📥 *Processing AUDIO:*\n🎵 ${videoInfo.title}\n👤 ${videoInfo.author}\n⏱️ Duration: ${videoInfo.duration}\n\n⏳ Getting audio...`,
            edit: statusMsg.key
        });

        // METHOD 1: Try the most reliable API first (pipedream)
        try {
            const apiUrl = `https://pipedream.guruapi.tech/api/ytdl?url=${encodeURIComponent(video.url)}&type=audio`;
            const response = await axios.get(apiUrl, { timeout: 15000 });
            
            if (response.data && response.data.audio) {
                // Download the audio
                const audioResponse = await axios.get(response.data.audio, {
                    responseType: 'arraybuffer',
                    timeout: 60000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                
                const audioBuffer = Buffer.from(audioResponse.data);
                
                // Send audio with proper WhatsApp format
                await conn.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg', // WhatsApp requires audio/mpeg for voice notes
                    fileName: `${videoInfo.title.replace(/[^\w\s]/gi, '')}.mp3`,
                    ptt: false, // Set to true for voice note (voice message) style
                    caption: `🎵 *${videoInfo.title}*\n👤 ${videoInfo.author}\n⏱️ ${videoInfo.duration}\n\n> Downloaded via GURU MD`
                }, { quoted: mek });
                
                await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
                return;
            }
        } catch (err) {
            console.log("API 1 failed:", err.message);
        }

        // METHOD 2: Try y2mate API
        try {
            const y2mateUrl = `https://y2mate.guru/api/convert?url=${encodeURIComponent(video.url)}&format=mp3`;
            const response = await axios.get(y2mateUrl, { timeout: 15000 });
            
            if (response.data && response.data.download_url) {
                const audioResponse = await axios.get(response.data.download_url, {
                    responseType: 'arraybuffer',
                    timeout: 60000
                });
                
                const audioBuffer = Buffer.from(audioResponse.data);
                
                await conn.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    fileName: `${videoInfo.title.replace(/[^\w\s]/gi, '')}.mp3`,
                    ptt: false,
                    caption: `🎵 *${videoInfo.title}*\n👤 ${videoInfo.author}\n⏱️ ${videoInfo.duration}`
                }, { quoted: mek });
                
                await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
                return;
            }
        } catch (err) {
            console.log("Y2Mate failed:", err.message);
        }

        // METHOD 3: Try savemp3 API
        try {
            const savemp3Url = `https://www.savemp3.cc/api/v1?url=${encodeURIComponent(video.url)}&format=mp3`;
            const response = await axios.get(savemp3Url, { timeout: 15000 });
            
            if (response.data && response.data.link) {
                const audioResponse = await axios.get(response.data.link, {
                    responseType: 'arraybuffer',
                    timeout: 60000
                });
                
                const audioBuffer = Buffer.from(audioResponse.data);
                
                await conn.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    fileName: `${videoInfo.title.replace(/[^\w\s]/gi, '')}.mp3`,
                    ptt: false,
                    caption: `🎵 *${videoInfo.title}*\n👤 ${videoInfo.author}\n⏱️ ${videoInfo.duration}`
                }, { quoted: mek });
                
                await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
                return;
            }
        } catch (err) {
            console.log("SaveMP3 failed:", err.message);
        }

        // METHOD 4: Try ytdl-core with proper format for WhatsApp
        try {
            // Get audio stream with specific format for WhatsApp
            const audioStream = ytdl(video.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                format: 'mp3'
            });
            
            // Collect chunks
            const chunks = [];
            audioStream.on('data', chunk => chunks.push(chunk));
            
            // Wait for stream to end
            await new Promise((resolve, reject) => {
                audioStream.on('end', resolve);
                audioStream.on('error', reject);
            });
            
            const audioBuffer = Buffer.concat(chunks);
            
            if (audioBuffer.length > 0) {
                await conn.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    fileName: `${videoInfo.title.replace(/[^\w\s]/gi, '')}.mp3`,
                    ptt: false,
                    caption: `🎵 *${videoInfo.title}*\n👤 ${videoInfo.author}\n⏱️ ${videoInfo.duration}`
                }, { quoted: mek });
                
                await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
                return;
            }
        } catch (err) {
            console.log("ytdl-core failed:", err.message);
        }

        // If all methods fail, provide download links
        const errorMessage = `❌ *Download Failed*\n\n` +
            `🎵 *Title:* ${videoInfo.title}\n` +
            `👤 *Channel:* ${videoInfo.author}\n` +
            `⏱️ *Duration:* ${videoInfo.duration}\n\n` +
            `🔗 *Watch on YouTube:*\n${videoInfo.url}\n\n` +
            `📱 *Try manual download:*\n` +
            `1. https://www.y2mate.com/youtube/${videoInfo.videoId}\n` +
            `2. https://en.savefrom.net/${videoInfo.videoId}/\n` +
            `3. https://loader.to/api/button/?url=${videoInfo.url}&f=mp3`;
        
        await conn.sendMessage(from, {
            image: { url: videoInfo.thumbnail },
            caption: errorMessage
        }, { quoted: mek });
        
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });

    } catch (error) {
        console.error("Play command error:", error);
        reply("❌ Error: " + error.message);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

// Quick audio download command (simplified)
cmd({
    pattern: "yt",
    alias: ["ytaudio", "ytmp3"],
    desc: "Quick YouTube audio download",
    category: "download",
    use: ".yt <song name>",
    react: "🎧",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Provide a song name!");
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        const search = await ytSearch(q);
        if (!search.videos.length) return reply("❌ No results found!");
        
        const video = search.videos[0];
        
        // Use savemp3 API for quick download
        try {
            const apiUrl = `https://www.savemp3.cc/api/v1?url=${encodeURIComponent(video.url)}&format=mp3`;
            const response = await axios.get(apiUrl, { timeout: 10000 });
            
            if (response.data && response.data.link) {
                await conn.sendMessage(from, {
                    audio: { url: response.data.link },
                    mimetype: 'audio/mpeg',
                    fileName: `${video.title}.mp3`,
                    ptt: false,
                    caption: `🎵 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}`
                }, { quoted: mek });
                
                await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
                return;
            }
        } catch (err) {
            console.log("Quick API failed, trying ytdl...");
        }
        
        // Fallback to ytdl
        const audioStream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
        const chunks = [];
        audioStream.on('data', chunk => chunks.push(chunk));
        
        await new Promise((resolve, reject) => {
            audioStream.on('end', resolve);
            audioStream.on('error', reject);
        });
        
        const audioBuffer = Buffer.concat(chunks);
        
        await conn.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            ptt: false,
            caption: `🎵 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}`
        }, { quoted: mek });
        
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        
    } catch (error) {
        console.error("YT command error:", error);
        reply("❌ Error: " + error.message);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

// Video download command
cmd({
    pattern: "video",
    alias: ["ytvideo", "ytmp4"],
    desc: "Download YouTube video",
    category: "download",
    use: ".video <song name>",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Provide a video name!");
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        const search = await ytSearch(q);
        if (!search.videos.length) return reply("❌ No results found!");
        
        const video = search.videos[0];
        
        // Try API first
        try {
            const apiUrl = `https://pipedream.guruapi.tech/api/ytdl?url=${encodeURIComponent(video.url)}&type=video`;
            const response = await axios.get(apiUrl, { timeout: 10000 });
            
            if (response.data && response.data.video) {
                await conn.sendMessage(from, {
                    video: { url: response.data.video },
                    mimetype: 'video/mp4',
                    caption: `🎬 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}`
                }, { quoted: mek });
                
                await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
                return;
            }
        } catch (err) {
            console.log("Video API failed, trying ytdl...");
        }
        
        // Fallback to ytdl
        const videoStream = ytdl(video.url, { quality: 'lowest' });
        const chunks = [];
        videoStream.on('data', chunk => chunks.push(chunk));
        
        await new Promise((resolve, reject) => {
            videoStream.on('end', resolve);
            videoStream.on('error', reject);
        });
        
        const videoBuffer = Buffer.concat(chunks);
        
        await conn.sendMessage(from, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: `🎬 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}`
        }, { quoted: mek });
        
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        
    } catch (error) {
        console.error("Video command error:", error);
        reply("❌ Error: " + error.message);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

// Helper function to format views
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
