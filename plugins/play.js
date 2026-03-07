/* ============================================
   GURU MD - WORKING YOUTUBE PLAYER V2
   COMMANDS: .play, .video, .yt
   API: Vihangayt API (Confirmed Working)
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

// Get download links from Vihangayt API
async function getVihangaytLinks(url, type = 'mp3') {
    try {
        const apiUrl = `https://vihangayt.me/download/yt${type}?url=${encodeURIComponent(url)}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.data) {
            return {
                downloadUrl: response.data.data.download_link,
                title: response.data.data.title,
                duration: response.data.data.duration,
                thumbnail: response.data.data.thumbnail
            };
        }
        return null;
    } catch (err) {
        console.log("Vihangayt API error:", err.message);
        return null;
    }
}

// Alternative: SaveMP3 API
async function getSaveMP3Links(url) {
    try {
        const apiUrl = `https://www.savemp3.cc/api/v1?url=${encodeURIComponent(url)}&format=mp3`;
        
        const response = await axios.get(apiUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.link) {
            return {
                downloadUrl: response.data.link,
                title: response.data.title || 'Audio',
                duration: response.data.duration || 'Unknown',
                thumbnail: response.data.thumbnail || ''
            };
        }
        return null;
    } catch (err) {
        console.log("SaveMP3 API error:", err.message);
        return null;
    }
}

// Alternative: Y2Mate API
async function getY2MateLinks(url, type = 'mp3') {
    try {
        const apiUrl = `https://y2mate.guru/api/convert?url=${encodeURIComponent(url)}&format=${type}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.download_url) {
            return {
                downloadUrl: response.data.download_url,
                title: response.data.title || 'Video',
                duration: response.data.duration || 'Unknown',
                thumbnail: response.data.thumbnail || ''
            };
        }
        return null;
    } catch (err) {
        console.log("Y2Mate API error:", err.message);
        return null;
    }
}

// Try multiple APIs until one works
async function getWorkingDownload(url, isVideo = false) {
    const type = isVideo ? 'mp4' : 'mp3';
    
    // Try Vihangayt first
    let result = await getVihangaytLinks(url, type);
    if (result && result.downloadUrl) return result;
    
    // Try SaveMP3 for audio only
    if (!isVideo) {
        result = await getSaveMP3Links(url);
        if (result && result.downloadUrl) return result;
    }
    
    // Try Y2Mate as last resort
    result = await getY2MateLinks(url, type);
    if (result && result.downloadUrl) return result;
    
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

        const result = await getWorkingDownload(video.url, false);
        
        if (!result || !result.downloadUrl) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Could not get audio!\n\n🔗 Watch here: ${video.url}\n🎵 Try: .yt ${q}`);
        }

        await conn.sendMessage(from, {
            audio: { url: result.downloadUrl },
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

        const result = await getWorkingDownload(video.url, true);
        
        if (!result || !result.downloadUrl) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Could not get video!\n\n🔗 Watch here: ${video.url}`);
        }

        await conn.sendMessage(from, {
            video: { url: result.downloadUrl },
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
        
        const result = await getWorkingDownload(video.url, false);
        
        if (!result || !result.downloadUrl) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Failed!\n🔗 ${video.url}`);
        }

        await conn.sendMessage(from, {
            audio: { url: result.downloadUrl },
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

// TEST NEW APIs
cmd({
    pattern: "testnewapi",
    desc: "Test new download APIs",
    category: "tools",
    react: "🔧",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Provide a YouTube URL!");
        
        await reply(`🔍 Testing APIs with URL: ${q}\n\n⏳ Please wait...`);
        
        let result = `📦 *API TEST RESULTS*\n\n`;
        result += `🔗 URL: ${q}\n\n`;
        
        // Test Vihangayt MP3
        result += `🎵 *Vihangayt MP3:* `;
        try {
            const vh = await getVihangaytLinks(q, 'mp3');
            result += vh?.downloadUrl ? '✅ Working\n' : '❌ Failed\n';
            if (vh?.downloadUrl) result += `   📥 ${vh.downloadUrl.substring(0, 50)}...\n`;
        } catch { result += '❌ Error\n'; }
        
        // Test Vihangayt MP4
        result += `🎬 *Vihangayt MP4:* `;
        try {
            const vh = await getVihangaytLinks(q, 'mp4');
            result += vh?.downloadUrl ? '✅ Working\n' : '❌ Failed\n';
        } catch { result += '❌ Error\n'; }
        
        // Test SaveMP3
        result += `🎵 *SaveMP3:* `;
        try {
            const sm = await getSaveMP3Links(q);
            result += sm?.downloadUrl ? '✅ Working\n' : '❌ Failed\n';
        } catch { result += '❌ Error\n'; }
        
        // Test Y2Mate MP3
        result += `🎵 *Y2Mate MP3:* `;
        try {
            const ym = await getY2MateLinks(q, 'mp3');
            result += ym?.downloadUrl ? '✅ Working\n' : '❌ Failed\n';
        } catch { result += '❌ Error\n'; }
        
        result += `\n> Try .play or .video now!`;
        
        await reply(result);
        
    } catch (error) {
        reply("❌ Error: " + error.message);
    }
});
