/* ============================================
   GURU MD - ULTIMATE YOUTUBE PLAYER
   COMMANDS: .play, .video, .yt
   FEATURES: Handles redirects, multiple fallbacks
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

// Get working API URL with redirect handling
async function getDownloadUrl(url, type = 'audio') {
    const apis = [
        {
            name: 'Agatz Main',
            url: `https://api.agatz.xyz/api/yt?url=${encodeURIComponent(url)}`,
            extract: (data) => {
                // Handle array response
                if (Array.isArray(data)) {
                    for (const item of data) {
                        if (item.audio && type === 'audio') return item.audio;
                        if (item.video && type === 'video') return item.video;
                        if (item.mp3 && type === 'audio') return item.mp3;
                        if (item.mp4 && type === 'video') return item.mp4;
                    }
                }
                // Handle object response
                if (data.data) {
                    if (type === 'audio') return data.data.audio || data.data.mp3;
                    if (type === 'video') return data.data.video || data.data.mp4;
                }
                return null;
            }
        },
        {
            name: 'Agatz Alternative',
            url: `https://api.agatz.xyz/api/ytdl?url=${encodeURIComponent(url)}`,
            extract: (data) => {
                if (Array.isArray(data)) {
                    for (const item of data) {
                        if (item.audio && type === 'audio') return item.audio;
                        if (item.video && type === 'video') return item.video;
                    }
                }
                return null;
            }
        },
        {
            name: 'API Kingdom',
            url: `https://api.kingdom.tech/download/yt?url=${encodeURIComponent(url)}`,
            extract: (data) => {
                if (type === 'audio') return data.audio || data.mp3;
                if (type === 'video') return data.video || data.mp4;
                return null;
            }
        }
    ];

    for (const api of apis) {
        try {
            console.log(`Trying ${api.name} for ${type}...`);
            
            // Follow redirects automatically
            const response = await axios.get(api.url, {
                timeout: 15000,
                maxRedirects: 5,
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json'
                }
            });

            if (response.data) {
                const downloadUrl = api.extract(response.data);
                if (downloadUrl) {
                    console.log(`✅ ${api.name} success!`);
                    return downloadUrl;
                }
            }
        } catch (err) {
            console.log(`${api.name} failed: ${err.message}`);
            continue;
        }
    }
    return null;
}

// MAIN PLAY COMMAND
cmd({
    pattern: "play",
    alias: ["song", "music", "ytmp3"],
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

        const audioUrl = await getDownloadUrl(video.url, 'audio');
        
        if (!audioUrl) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Could not get audio!\n\n🔗 Watch here: ${video.url}`);
        }

        await conn.sendMessage(from, {
            audio: { url: audioUrl },
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
    alias: ["ytvideo", "ytmp4"],
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

        const videoUrl = await getDownloadUrl(video.url, 'video');
        
        if (!videoUrl) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Could not get video!\n\n🔗 Watch here: ${video.url}`);
        }

        await conn.sendMessage(from, {
            video: { url: videoUrl },
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

// QUICK COMMAND
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
        
        const audioUrl = await getDownloadUrl(video.url, 'audio');
        
        if (!audioUrl) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Failed!\n🔗 ${video.url}`);
        }

        await conn.sendMessage(from, {
            audio: { url: audioUrl },
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

// TEST COMMAND
cmd({
    pattern: "testdl",
    desc: "Test download URL extraction",
    category: "tools",
    react: "🔧",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Provide a YouTube URL!");
        
        await reply(`🔍 Testing URL: ${q}`);
        
        const audioUrl = await getDownloadUrl(q, 'audio');
        const videoUrl = await getDownloadUrl(q, 'video');
        
        let result = `📦 *DOWNLOAD TEST RESULTS*\n\n`;
        result += `🔗 URL: ${q}\n\n`;
        result += `🎵 Audio: ${audioUrl ? '✅ Available' : '❌ Not found'}\n`;
        result += `🎬 Video: ${videoUrl ? '✅ Available' : '❌ Not found'}\n\n`;
        
        if (audioUrl) result += `🔊 Audio URL: ${audioUrl}\n`;
        if (videoUrl) result += `📹 Video URL: ${videoUrl}\n`;
        
        await reply(result);
        
    } catch (error) {
        reply("❌ Error: " + error.message);
    }
});
