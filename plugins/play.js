const { cmd } = require('../command');
const axios = require('axios');
const ytSearch = require('yt-search');

cmd({
    pattern: "play",
    alias: ["song", "ytplay", "music", "audio"],
    desc: "Download YouTube audio (WhatsApp compatible)",
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
        };

        // Update status
        await conn.sendMessage(from, {
            text: `📥 *Downloading:*\n🎵 ${videoInfo.title}\n👤 ${videoInfo.author}\n⏱️ ${videoInfo.duration}\n\n⏳ Getting audio...`,
            edit: statusMsg.key
        });

        // List of reliable audio APIs (in order of reliability)
        const apis = [
            {
                name: 'API 1',
                url: `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(video.url)}`,
                getUrl: (data) => data.downloadUrl || data.url
            },
            {
                name: 'API 2',
                url: `https://api.ryzendesu.vip/api/downloader/yt?url=${encodeURIComponent(video.url)}&type=mp3`,
                getUrl: (data) => data.url || data.download
            },
            {
                name: 'API 3',
                url: `https://api.agatz.xyz/api/yt?url=${encodeURIComponent(video.url)}`,
                getUrl: (data) => data.audio
            },
            {
                name: 'API 4',
                url: `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(video.url)}`,
                getUrl: (data) => data.data?.download
            }
        ];

        let audioUrl = null;
        let methodUsed = '';
        let errors = [];

        // Try each API until one works
        for (const api of apis) {
            try {
                console.log(`Trying ${api.name}...`);
                const response = await axios.get(api.url, { 
                    timeout: 10000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                
                if (response.data) {
                    audioUrl = api.getUrl(response.data);
                    if (audioUrl) {
                        methodUsed = api.name;
                        console.log(`✅ Success with ${api.name}`);
                        break;
                    }
                }
            } catch (err) {
                errors.push(`${api.name}: ${err.message}`);
                console.log(`${api.name} failed`);
            }
        }

        // If no API worked, try direct download from known working sources
        if (!audioUrl) {
            // Try y2mate style API
            try {
                const y2mateApi = `https://y2mate.guru/api/convert?url=${encodeURIComponent(video.url)}&format=mp3`;
                const response = await axios.get(y2mateApi, { timeout: 10000 });
                if (response.data && response.data.download_url) {
                    audioUrl = response.data.download_url;
                    methodUsed = 'Y2Mate';
                }
            } catch (err) {
                errors.push(`Y2Mate: ${err.message}`);
            }
        }

        // If still no URL, try alternative
        if (!audioUrl) {
            try {
                const altApi = `https://vkrdownloader.com/api/yt?url=${encodeURIComponent(video.url)}&format=mp3`;
                const response = await axios.get(altApi, { timeout: 10000 });
                if (response.data && response.data.url) {
                    audioUrl = response.data.url;
                    methodUsed = 'VKR';
                }
            } catch (err) {
                errors.push(`VKR: ${err.message}`);
            }
        }

        // If we have a URL, send the audio
        if (audioUrl) {
            const caption = `╭══━ ★ *GURU-MD PLAYER* ★ ━══╮\n\n` +
                `🎵 *Title:* ${videoInfo.title}\n` +
                `👤 *Channel:* ${videoInfo.author}\n` +
                `⏱️ *Duration:* ${videoInfo.duration}\n` +
                `👀 *Views:* ${videoInfo.views}\n` +
                `🔧 *Source:* ${methodUsed}\n\n` +
                `╰══━ ★ *Powered By GuruTech* ★ ━══╯`;

            await conn.sendMessage(from, {
                audio: { url: audioUrl },
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
                caption: `🎵 *Now Playing:*\n> ${videoInfo.title}\n> ${videoInfo.author}`,
                viewOnce: true
            }, { quoted: mek });

        } else {
            // All APIs failed
            console.log("All APIs failed:", errors);
            
            const errorMsg = `❌ *Download Failed*\n\n` +
                `🎵 *Title:* ${videoInfo.title}\n` +
                `👤 *Channel:* ${videoInfo.author}\n` +
                `⏱️ *Duration:* ${videoInfo.duration}\n\n` +
                `⚠️ Could not download audio.\n\n` +
                `🔗 *Watch on YouTube:*\n${video.url}\n\n` +
                `💡 *Try:*\n` +
                `• Use different keywords\n` +
                `• Try again later\n` +
                `• Download manually from the link above`;

            await conn.sendMessage(from, {
                image: { url: videoInfo.thumbnail },
                caption: errorMsg
            }, { quoted: mek });
            
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        }

    } catch (error) {
        console.error("Play command error:", error);
        reply("❌ Error: " + error.message);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

// SIMPLE VERSION - Most reliable
cmd({
    pattern: "yt",
    alias: ["ytaudio", "ytmp3"],
    desc: "Simple YouTube audio download",
    category: "download",
    react: "🎧",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Provide a song name!");
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        // Search
        const search = await ytSearch(q);
        if (!search.videos.length) return reply("❌ No results!");
        
        const video = search.videos[0];
        
        // Use David Cyril API (most reliable)
        const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(video.url)}`;
        const response = await axios.get(apiUrl, { timeout: 15000 });
        
        if (response.data && response.data.downloadUrl) {
            await conn.sendMessage(from, {
                audio: { url: response.data.downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`,
                caption: `🎵 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}`
            }, { quoted: mek });
            
            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        } else {
            reply("❌ No download URL found");
        }
        
    } catch (error) {
        console.error("YT error:", error);
        reply("❌ Error: " + error.message);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

// Emergency backup command
cmd({
    pattern: "ytdl",
    alias: ["youtubedl"],
    desc: "Emergency YouTube download",
    category: "download",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Provide YouTube URL or song name!");
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        let url = q;
        // If not a URL, search first
        if (!q.includes('youtube.com') && !q.includes('youtu.be')) {
            const search = await ytSearch(q);
            if (!search.videos.length) return reply("❌ No results!");
            url = search.videos[0].url;
        }
        
        // Try multiple APIs
        const apis = [
            `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(url)}`,
            `https://api.ryzendesu.vip/api/downloader/yt?url=${encodeURIComponent(url)}&type=mp3`,
            `https://api.agatz.xyz/api/yt?url=${encodeURIComponent(url)}`
        ];
        
        for (const apiUrl of apis) {
            try {
                const response = await axios.get(apiUrl, { timeout: 10000 });
                let downloadUrl = response.data.downloadUrl || response.data.url || response.data.audio;
                
                if (downloadUrl) {
                    await conn.sendMessage(from, {
                        audio: { url: downloadUrl },
                        mimetype: 'audio/mpeg'
                    }, { quoted: mek });
                    
                    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
                    return;
                }
            } catch (e) {
                continue;
            }
        }
        
        reply("❌ All APIs failed");
        
    } catch (error) {
        reply("❌ Error: " + error.message);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
