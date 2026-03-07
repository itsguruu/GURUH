/* ============================================
   GURU MD - AGATZ YOUTUBE DOWNLOADER
   COMMANDS: .play, .video, .yt
   API: Agatz (Confirmed Working)
   ============================================ */

const { cmd } = require('../command');
const ytSearch = require('yt-search');
const axios = require('axios');

// Format numbers
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Get download links from Agatz API
async function getAgatzLinks(url) {
    try {
        console.log(`Fetching Agatz API for: ${url}`);
        
        const apiUrl = `https://api.agatz.xyz/api/yt?url=${encodeURIComponent(url)}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        console.log('Agatz Response Status:', response.status);
        
        if (response.data) {
            // Log the structure to see what we get
            console.log('Response keys:', Object.keys(response.data));
            
            // The response might be an array or object
            const data = response.data.data || response.data;
            
            // Try to extract audio and video URLs
            let audioUrl = null;
            let videoUrl = null;
            let title = null;
            let thumbnail = null;
            
            if (Array.isArray(data)) {
                // If it's an array, look for audio/video in each item
                for (const item of data) {
                    if (item.audio) audioUrl = item.audio;
                    if (item.video) videoUrl = item.video;
                    if (item.mp3) audioUrl = item.mp3;
                    if (item.mp4) videoUrl = item.mp4;
                    if (item.title) title = item.title;
                    if (item.thumbnail) thumbnail = item.thumbnail;
                }
            } else {
                // If it's an object
                audioUrl = data.audio || data.mp3;
                videoUrl = data.video || data.mp4;
                title = data.title;
                thumbnail = data.thumbnail;
            }
            
            return {
                audio: audioUrl,
                video: videoUrl,
                title: title,
                thumbnail: thumbnail
            };
        }
        return null;
    } catch (err) {
        console.error('Agatz API error:', err.message);
        return null;
    }
}

// MAIN PLAY COMMAND
cmd({
    pattern: "play",
    alias: ["song", "music"],
    desc: "Download YouTube audio",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a song name!\n\n*Example:* .play Alan Walker Faded");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const statusMsg = await reply(`🔍 *Searching:* ${q}`);
        
        const search = await ytSearch(q);
        if (!search.videos.length) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("❌ No results found!");
        }
        
        const video = search.videos[0];
        
        await conn.sendMessage(from, {
            text: `📥 *Found:* ${video.title}\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n\n🔄 Getting audio link...`,
            edit: statusMsg.key
        });

        const links = await getAgatzLinks(video.url);
        
        if (!links || !links.audio) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            
            // Try alternative: direct YouTube URL
            return reply(`❌ Could not get audio!\n\n🔗 *Watch on YouTube:*\n${video.url}\n\n🎵 *Try:* .yt ${q}`);
        }

        await conn.sendMessage(from, {
            audio: { url: links.audio },
            mimetype: 'audio/mpeg',
            fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp3`,
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title: video.title.substring(0, 30),
                    body: `${video.author.name} • ${video.timestamp}`,
                    thumbnailUrl: video.thumbnail,
                    sourceUrl: video.url,
                    mediaType: 2
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: `🎵 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n👀 ${formatNumber(video.views)} views`,
            viewOnce: true
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Error: " + error.message);
    }
});

// VIDEO COMMAND
cmd({
    pattern: "video",
    alias: ["ytvideo"],
    desc: "Download YouTube video",
    category: "download",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a video name!\n\n*Example:* .video Alan Walker Faded");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const statusMsg = await reply(`🔍 *Searching:* ${q}`);
        
        const search = await ytSearch(q);
        if (!search.videos.length) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("❌ No results found!");
        }
        
        const video = search.videos[0];
        
        await conn.sendMessage(from, {
            text: `📥 *Found:* ${video.title}\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n\n🔄 Getting video link...`,
            edit: statusMsg.key
        });

        const links = await getAgatzLinks(video.url);
        
        if (!links || !links.video) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Could not get video!\n\n🔗 Watch here: ${video.url}`);
        }

        await conn.sendMessage(from, {
            video: { url: links.video },
            mimetype: 'video/mp4',
            caption: `🎬 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n👀 ${formatNumber(video.views)} views`,
            contextInfo: {
                externalAdReply: {
                    title: video.title.substring(0, 30),
                    body: video.author.name,
                    thumbnailUrl: video.thumbnail,
                    sourceUrl: video.url,
                    mediaType: 1
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Error: " + error.message);
    }
});

// QUICK AUDIO COMMAND
cmd({
    pattern: "yt",
    alias: ["ytaudio"],
    desc: "Quick YouTube audio",
    category: "download",
    react: "🎧",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Provide a song name!");
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        const search = await ytSearch(q);
        if (!search.videos.length) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("❌ No results!");
        }
        
        const video = search.videos[0];
        
        const links = await getAgatzLinks(video.url);
        
        if (!links || !links.audio) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Failed!\n🔗 ${video.url}`);
        }

        await conn.sendMessage(from, {
            audio: { url: links.audio },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            ptt: false,
            caption: `🎵 *${video.title}*\n👤 ${video.author.name}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Error: " + error.message);
    }
});

// DEBUG COMMAND
cmd({
    pattern: "agatz",
    desc: "Test Agatz API response",
    category: "tools",
    react: "🔧",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Provide a YouTube URL!");
        
        const links = await getAgatzLinks(q);
        
        let result = `📦 *AGATZ API RESPONSE*\n\n`;
        result += `🔗 URL: ${q}\n\n`;
        
        if (links) {
            result += `🎵 Audio: ${links.audio ? '✅ Available' : '❌ Not found'}\n`;
            result += `🎬 Video: ${links.video ? '✅ Available' : '❌ Not found'}\n`;
            result += `📌 Title: ${links.title || 'N/A'}\n`;
            result += `🖼️ Thumbnail: ${links.thumbnail ? '✅' : '❌'}\n\n`;
            
            if (links.audio) result += `🔊 Audio URL: ${links.audio}\n`;
            if (links.video) result += `📹 Video URL: ${links.video}\n`;
        } else {
            result += `❌ Failed to get any data from Agatz API\n`;
        }
        
        await reply(result);
        
    } catch (error) {
        reply("❌ Error: " + error.message);
    }
});
