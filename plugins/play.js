/* ============================================
   GURU MD - ULTIMATE YOUTUBE DOWNLOADER
   COMMANDS: .play, .video, .yt, .dl
   METHODS: 5 different download strategies
   ============================================ */

const { cmd } = require('../command');
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const axios = require('axios');

// Format numbers
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// METHOD 1: Agatz API
async function methodAgatz(url) {
    try {
        const apiUrl = `https://api.agatz.xyz/api/yt?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl, { timeout: 8000 });
        
        if (response.data) {
            // Try different response structures
            const data = response.data.data || response.data;
            if (Array.isArray(data)) {
                for (const item of data) {
                    if (item.audio) return { url: item.audio, method: 'Agatz Audio' };
                    if (item.video) return { url: item.video, method: 'Agatz Video' };
                }
            } else {
                if (data.audio) return { url: data.audio, method: 'Agatz Audio' };
                if (data.video) return { url: data.video, method: 'Agatz Video' };
                if (data.mp3) return { url: data.mp3, method: 'Agatz MP3' };
                if (data.mp4) return { url: data.mp4, method: 'Agatz MP4' };
            }
        }
        return null;
    } catch {
        return null;
    }
}

// METHOD 2: Direct ytdl-core (works for most videos)
async function methodYtdl(url, isVideo = false) {
    try {
        const info = await ytdl.getInfo(url);
        let format;
        
        if (isVideo) {
            // Try to get 360p video with audio
            format = ytdl.chooseFormat(info.formats, { 
                quality: '18',
                filter: 'audioandvideo' 
            });
        } else {
            format = ytdl.chooseFormat(info.formats, { 
                filter: 'audioonly',
                quality: 'highestaudio'
            });
        }
        
        if (format && format.url) {
            return { 
                url: format.url, 
                method: isVideo ? 'ytdl Video' : 'ytdl Audio',
                title: info.videoDetails.title
            };
        }
        return null;
    } catch (err) {
        return null;
    }
}

// METHOD 3: SaveFrom.net helper
async function methodSaveFrom(url) {
    try {
        const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        const apiUrl = `https://en.savefrom.net/api/convert.php?url=https://youtube.com/watch?v=${videoId}`;
        
        const response = await axios.get(apiUrl, { timeout: 8000 });
        
        if (response.data && response.data.url) {
            return { url: response.data.url, method: 'SaveFrom' };
        }
        return null;
    } catch {
        return null;
    }
}

// METHOD 4: YouTube to MP3 direct
async function methodYtmp3(url) {
    try {
        const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        const apiUrl = `https://ytmp3.ch/api/v1?videoId=${videoId}`;
        
        const response = await axios.get(apiUrl, { timeout: 8000 });
        
        if (response.data && response.data.link) {
            return { url: response.data.link, method: 'YTMP3' };
        }
        return null;
    } catch {
        return null;
    }
}

// METHOD 5: YouTube to MP4 direct
async function methodYtmp4(url) {
    try {
        const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        const apiUrl = `https://ytmp4.cc/api/v1?videoId=${videoId}`;
        
        const response = await axios.get(apiUrl, { timeout: 8000 });
        
        if (response.data && response.data.link) {
            return { url: response.data.link, method: 'YTMP4' };
        }
        return null;
    } catch {
        return null;
    }
}

// Main download function - tries all methods
async function downloadVideo(url, isVideo = false) {
    const methods = [
        () => methodAgatz(url),
        () => methodYtdl(url, isVideo),
        () => methodSaveFrom(url),
        () => isVideo ? methodYtmp4(url) : methodYtmp3(url)
    ];
    
    for (const method of methods) {
        const result = await method();
        if (result && result.url) {
            console.log(`✅ Success with: ${result.method}`);
            return result;
        }
    }
    
    return null;
}

// PLAY COMMAND
cmd({
    pattern: "play",
    alias: ["song", "music", "ytmp3"],
    desc: "Download YouTube audio",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a song name!");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const statusMsg = await reply(`🔍 *Searching:* ${q}`);
        
        const search = await ytSearch(q);
        if (!search.videos.length) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("❌ No results found!");
        }
        
        const video = search.videos[0];
        
        await conn.sendMessage(from, {
            text: `📥 *Found:* ${video.title}\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n\n🔄 Trying multiple download methods...`,
            edit: statusMsg.key
        });

        const result = await downloadVideo(video.url, false);
        
        if (!result || !result.url) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(
                `❌ All download methods failed!\n\n` +
                `🎵 *${video.title}*\n` +
                `👤 ${video.author.name}\n` +
                `⏱️ ${video.timestamp}\n\n` +
                `🔗 *Watch on YouTube:*\n${video.url}\n\n` +
                `💡 *Tips:*\n` +
                `• Try with different keywords\n` +
                `• Use .yt for quick attempt\n` +
                `• Download manually from YouTube`
            );
        }

        await conn.sendMessage(from, {
            audio: { url: result.url },
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
            caption: `🎵 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n👀 ${formatNumber(video.views)} views\n⚡ Method: ${result.method}`,
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
        if (!q) return reply("❌ Please provide a video name!");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const statusMsg = await reply(`🔍 *Searching:* ${q}`);
        
        const search = await ytSearch(q);
        if (!search.videos.length) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("❌ No results found!");
        }
        
        const video = search.videos[0];
        
        await conn.sendMessage(from, {
            text: `📥 *Found:* ${video.title}\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n\n🔄 Trying multiple download methods...`,
            edit: statusMsg.key
        });

        const result = await downloadVideo(video.url, true);
        
        if (!result || !result.url) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(
                `❌ All download methods failed!\n\n` +
                `🎬 *${video.title}*\n` +
                `👤 ${video.author.name}\n` +
                `⏱️ ${video.timestamp}\n\n` +
                `🔗 *Watch on YouTube:*\n${video.url}`
            );
        }

        await conn.sendMessage(from, {
            video: { url: result.url },
            mimetype: 'video/mp4',
            caption: `🎬 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n👀 ${formatNumber(video.views)} views\n⚡ Method: ${result.method}`,
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
        
        const result = await downloadVideo(video.url, false);
        
        if (!result || !result.url) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Failed!\n🔗 ${video.url}`);
        }

        await conn.sendMessage(from, {
            audio: { url: result.url },
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
