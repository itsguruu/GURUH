/* ============================================
   GURU MD - ULTIMATE YOUTUBE DOWNLOADER
   COMMANDS: .play, .song, .video, .yt, .ytmp3, .ytmp4
   FEATURES: 15+ APIs, auto-fallback, WhatsApp ready
   ============================================ */

const { cmd } = require('../command');
const ytSearch = require('yt-search');
const axios = require('axios');

// Format views helper
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// API list for AUDIO (MP3)
const audioApis = [
    {
        name: 'David Cyril MP3',
        url: (url) => `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(url)}`,
        parse: (data) => data.downloadUrl || data.url,
        priority: 1
    },
    {
        name: 'Siputzx MP3',
        url: (url) => `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(url)}`,
        parse: (data) => data.data?.download,
        priority: 1
    },
    {
        name: 'Ryzendesu MP3',
        url: (url) => `https://api.ryzendesu.vip/api/downloader/yt?url=${encodeURIComponent(url)}&type=mp3`,
        parse: (data) => data.url || data.download,
        priority: 1
    },
    {
        name: 'Vihangayt MP3',
        url: (url) => `https://vihangayt.me/download/ytmp3?url=${encodeURIComponent(url)}`,
        parse: (data) => data.data?.download_link,
        priority: 1
    },
    {
        name: 'Agatz',
        url: (url) => `https://api.agatz.xyz/api/yt?url=${encodeURIComponent(url)}`,
        parse: (data) => data.audio,
        priority: 2
    },
    {
        name: 'Pipedream Audio',
        url: (url) => `https://pipedream.guruapi.tech/api/ytdl?url=${encodeURIComponent(url)}&type=audio`,
        parse: (data) => data.audio,
        priority: 2
    },
    {
        name: 'Y2Mate MP3',
        url: (url) => `https://y2mate.guru/api/convert?url=${encodeURIComponent(url)}&format=mp3`,
        parse: (data) => data.download_url,
        priority: 3
    },
    {
        name: 'SaveMP3',
        url: (url) => `https://www.savemp3.cc/api/v1?url=${encodeURIComponent(url)}&format=mp3`,
        parse: (data) => data.link,
        priority: 3
    }
];

// API list for VIDEO (MP4)
const videoApis = [
    {
        name: 'David Cyril MP4',
        url: (url) => `https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(url)}`,
        parse: (data) => data.downloadUrl || data.url,
        priority: 1
    },
    {
        name: 'Siputzx MP4',
        url: (url) => `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`,
        parse: (data) => data.data?.download,
        priority: 1
    },
    {
        name: 'Ryzendesu MP4',
        url: (url) => `https://api.ryzendesu.vip/api/downloader/yt?url=${encodeURIComponent(url)}&type=mp4`,
        parse: (data) => data.url || data.download,
        priority: 1
    },
    {
        name: 'Vihangayt MP4',
        url: (url) => `https://vihangayt.me/download/ytmp4?url=${encodeURIComponent(url)}`,
        parse: (data) => data.data?.download_link,
        priority: 1
    },
    {
        name: 'Agatz Video',
        url: (url) => `https://api.agatz.xyz/api/yt?url=${encodeURIComponent(url)}`,
        parse: (data) => data.video,
        priority: 2
    },
    {
        name: 'Pipedream Video',
        url: (url) => `https://pipedream.guruapi.tech/api/ytdl?url=${encodeURIComponent(url)}&type=video`,
        parse: (data) => data.video,
        priority: 2
    },
    {
        name: 'Y2Mate MP4',
        url: (url) => `https://y2mate.guru/api/convert?url=${encodeURIComponent(url)}&format=mp4`,
        parse: (data) => data.download_url,
        priority: 3
    }
];

// Function to try all APIs until one works
async function tryApis(url, isVideo = false) {
    const apis = isVideo ? videoApis : audioApis;
    // Sort by priority
    const sortedApis = apis.sort((a, b) => a.priority - b.priority);
    
    for (const api of sortedApis) {
        try {
            console.log(`🔄 Trying ${api.name}...`);
            const apiUrl = api.url(url);
            
            const response = await axios.get(apiUrl, { 
                timeout: 10000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            
            if (response.data) {
                const downloadUrl = api.parse(response.data);
                if (downloadUrl) {
                    console.log(`✅ ${api.name} success!`);
                    return downloadUrl;
                }
            }
        } catch (err) {
            console.log(`❌ ${api.name} failed: ${err.message}`);
            continue;
        }
    }
    return null;
}

// MAIN PLAY COMMAND (AUDIO)
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

        // Search for video
        const statusMsg = await reply(`🔍 Searching: *${q}*`);
        const search = await ytSearch(q);
        
        if (!search.videos.length) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("❌ No results found!");
        }
        
        const video = search.videos[0];
        
        await conn.sendMessage(from, {
            text: `📥 Found: *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n\n🔄 Getting download link...`,
            edit: statusMsg.key
        });

        // Try all audio APIs
        const downloadUrl = await tryApis(video.url, false);
        
        if (!downloadUrl) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ All APIs failed!\n\n🔗 Watch here: ${video.url}`);
        }

        // Send audio directly from URL
        await conn.sendMessage(from, {
            audio: { url: downloadUrl },
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

        const statusMsg = await reply(`🔍 Searching: *${q}*`);
        const search = await ytSearch(q);
        
        if (!search.videos.length) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("❌ No results found!");
        }
        
        const video = search.videos[0];
        
        await conn.sendMessage(from, {
            text: `📥 Found: *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n\n🔄 Getting video link...`,
            edit: statusMsg.key
        });

        // Try all video APIs
        const downloadUrl = await tryApis(video.url, true);
        
        if (!downloadUrl) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ All APIs failed!\n\n🔗 Watch here: ${video.url}`);
        }

        // Send video directly from URL
        await conn.sendMessage(from, {
            video: { url: downloadUrl },
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
        
        // Try primary APIs first
        const downloadUrl = await tryApis(video.url, false);
        
        if (!downloadUrl) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Failed!\n🔗 ${video.url}`);
        }

        await conn.sendMessage(from, {
            audio: { url: downloadUrl },
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

// API TEST COMMAND
cmd({
    pattern: "testapis",
    alias: ["checkapis"],
    desc: "Test all YouTube download APIs",
    category: "tools",
    react: "🔌",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const testUrl = "https://youtube.com/watch?v=dQw4w9WgXcQ"; // Rick Astley
        let result = "🔌 *API TEST RESULTS*\n\n";
        
        // Test audio APIs
        result += "🎵 *AUDIO APIS*\n";
        for (const api of audioApis.slice(0, 5)) {
            try {
                const apiUrl = api.url(testUrl);
                const response = await axios.get(apiUrl, { timeout: 5000 });
                if (response.data) {
                    result += `✅ ${api.name}: Working\n`;
                }
            } catch {
                result += `❌ ${api.name}: Failed\n`;
            }
        }
        
        result += "\n🎬 *VIDEO APIS*\n";
        for (const api of videoApis.slice(0, 5)) {
            try {
                const apiUrl = api.url(testUrl);
                const response = await axios.get(apiUrl, { timeout: 5000 });
                if (response.data) {
                    result += `✅ ${api.name}: Working\n`;
                }
            } catch {
                result += `❌ ${api.name}: Failed\n`;
            }
        }
        
        result += "\n> Try .play [song] now!";
        
        await reply(result);
        
    } catch (error) {
        reply("❌ Error testing APIs: " + error.message);
    }
});
