/* ============================================
   GURU MD - WORKING YOUTUBE PLAYER
   COMMANDS: .play, .video, .yt
   API: Agatz (The only working one!)
   ============================================ */

const { cmd } = require('../command');
const ytSearch = require('yt-search');
const axios = require('axios');

// Format numbers helper
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Get download links from Agatz API
async function getAgatzLinks(url) {
    try {
        const apiUrl = `https://api.agatz.xyz/api/yt?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl, { 
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        if (response.data && response.data.data) {
            const data = response.data.data;
            return {
                audio: data.audio || data.mp3,
                video: data.video || data.mp4,
                title: data.title,
                duration: data.duration,
                thumbnail: data.thumbnail
            };
        }
        return null;
    } catch (err) {
        console.log("Agatz API error:", err.message);
        return null;
    }
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

        // Get download links from Agatz
        const links = await getAgatzLinks(video.url);
        
        if (!links || !links.audio) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Could not get audio!\n\n🔗 Watch here: ${video.url}`);
        }

        // Send audio
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

        // Send thumbnail as view once
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

        // Get download links from Agatz
        const links = await getAgatzLinks(video.url);
        
        if (!links || !links.video) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Could not get video!\n\n🔗 Watch here: ${video.url}`);
        }

        // Send video
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
        
        // Get audio link
        const links = await getAgatzLinks(video.url);
        
        if (!links || !links.audio) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Failed!\n🔗 ${video.url}`);
        }

        // Send audio
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

// TEST AGATZ API COMMAND
cmd({
    pattern: "testagatz",
    desc: "Test Agatz API with any URL",
    category: "tools",
    react: "🔧",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Provide a YouTube URL!\nExample: .testagatz https://youtube.com/watch?v=xxx");
        
        const links = await getAgatzLinks(q);
        
        if (!links) {
            return reply("❌ Agatz API failed!");
        }
        
        let result = `✅ *AGATZ API WORKING!*\n\n`;
        result += `📌 *Title:* ${links.title}\n`;
        result += `⏱️ *Duration:* ${links.duration}\n`;
        result += `🎵 *Audio:* ${links.audio ? '✅ Available' : '❌ No'}\n`;
        result += `🎬 *Video:* ${links.video ? '✅ Available' : '❌ No'}\n`;
        result += `🖼️ *Thumbnail:* ${links.thumbnail ? '✅' : '❌'}\n\n`;
        
        if (links.audio) result += `🔊 Audio URL: ${links.audio}\n`;
        if (links.video) result += `📹 Video URL: ${links.video}\n`;
        
        await reply(result);
        
    } catch (error) {
        reply("❌ Error: " + error.message);
    }
});
