/* ============================================
   GURU MD - ULTIMATE YOUTUBE DOWNLOADER (FIXED)
   COMMANDS: .play, .video, .yt
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

// METHOD 2: Direct ytdl-core
async function methodYtdl(url, isVideo = false) {
    try {
        const info = await ytdl.getInfo(url);
        let format;
        
        if (isVideo) {
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

// METHOD 3: oembed API (alternative)
async function methodOembed(url) {
    try {
        const apiUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const response = await axios.get(apiUrl, { timeout: 5000 });
        return { url: url, method: 'oembed', title: response.data.title };
    } catch {
        return null;
    }
}

// METHOD 4: Direct download attempt
async function methodDirect(url, isVideo = false) {
    try {
        const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        const apiUrl = isVideo 
            ? `https://ytmp4.cc/api/v1?videoId=${videoId}`
            : `https://ytmp3.ch/api/v1?videoId=${videoId}`;
        
        const response = await axios.get(apiUrl, { timeout: 8000 });
        
        if (response.data && response.data.link) {
            return { url: response.data.link, method: isVideo ? 'YTMP4' : 'YTMP3' };
        }
        return null;
    } catch {
        return null;
    }
}

// Main download function
async function downloadVideo(url, isVideo = false) {
    // Try all methods
    const methods = [
        () => methodYtdl(url, isVideo),      // ytdl-core first (most reliable)
        () => methodAgatz(url),               // Agatz API second
        () => methodDirect(url, isVideo),     // Direct converters
        () => methodOembed(url)                // oembed fallback
    ];
    
    for (const method of methods) {
        try {
            const result = await method();
            if (result && result.url && typeof result.url === 'string') {
                console.log(`✅ Success with: ${result.method}`);
                return result;
            }
        } catch (err) {
            console.log(`Method failed: ${err.message}`);
            continue;
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

        const result = await downloadVideo(video.url, false);
        
        if (!result || !result.url) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(
                `❌ Could not download!\n\n` +
                `🎵 *${video.title}*\n` +
                `👤 ${video.author.name}\n` +
                `⏱️ ${video.timestamp}\n\n` +
                `🔗 *Watch on YouTube:*\n${video.url}`
            );
        }

        // Send the audio
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

        // Send thumbnail
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

        const result = await downloadVideo(video.url, true);
        
        if (!result || !result.url) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(
                `❌ Could not download!\n\n` +
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

// TEST COMMAND
cmd({
    pattern: "testdl",
    desc: "Test which download method works",
    category: "tools",
    react: "🔧",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Provide a YouTube URL!");
        
        const statusMsg = await reply(`🔍 Testing download methods...`);
        
        const results = [];
        
        // Test ytdl method
        try {
            const ytdlResult = await methodYtdl(q, false);
            results.push(`🎵 ytdl-core: ${ytdlResult ? '✅ Working' : '❌ Failed'}`);
        } catch { results.push(`🎵 ytdl-core: ❌ Error`); }
        
        // Test Agatz method
        try {
            const agatzResult = await methodAgatz(q);
            results.push(`🌐 Agatz API: ${agatzResult ? '✅ Working' : '❌ Failed'}`);
        } catch { results.push(`🌐 Agatz API: ❌ Error`); }
        
        // Test direct method
        try {
            const directResult = await methodDirect(q, false);
            results.push(`⚡ Direct: ${directResult ? '✅ Working' : '❌ Failed'}`);
        } catch { results.push(`⚡ Direct: ❌ Error`); }
        
        const resultText = `📊 *DOWNLOAD TEST RESULTS*\n\n` +
            `🔗 URL: ${q}\n\n` +
            results.join('\n') + `\n\n` +
            `> Try .play or .video now!`;
        
        await conn.sendMessage(from, { 
            text: resultText,
            edit: statusMsg.key 
        });
        
    } catch (error) {
        reply("❌ Error: " + error.message);
    }
});
