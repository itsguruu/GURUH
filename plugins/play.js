const { cmd } = require('../command');
const axios = require('axios');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

cmd({
    pattern: "play",
    alias: ["song", "ytplay", "music", "audio"],
    desc: "Search & download YouTube song as MP3",
    category: "download",
    use: ".play <song name>",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a song name!\n\n*Example:* .play Alan Walker Faded");

        const startTime = Date.now();
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        // Send initial status
        const statusMsg = await reply(`🔍 *Searching:* ${q}\n⏱️ Please wait...`);

        // Step 1: Search for the video using yt-search (more reliable)
        const searchResults = await ytSearch(q);
        
        if (!searchResults || !searchResults.videos || searchResults.videos.length === 0) {
            return reply("❌ No results found for your query. Try different keywords.");
        }

        // Get the best match (usually first result)
        const video = searchResults.videos[0];
        
        const videoInfo = {
            title: video.title,
            url: video.url,
            duration: video.timestamp,
            views: formatNumber(video.views),
            thumbnail: video.thumbnail,
            author: video.author.name,
            uploaded: video.ago
        };

        // Update status
        await conn.sendMessage(from, {
            text: `📥 *Downloading:*\n🎵 ${videoInfo.title}\n👤 ${videoInfo.author}\n⏱️ Duration: ${videoInfo.duration}\n\n⏳ Getting audio...`,
            edit: statusMsg.key
        });

        // Step 2: Try multiple download methods in order of reliability
        let audioBuffer = null;
        let downloadMethod = '';
        let errorLog = [];

        // Method 1: Try ytdl-core directly (most reliable)
        try {
            console.log("Attempting ytdl-core download...");
            const stream = ytdl(video.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            });
            
            const chunks = [];
            stream.on('data', chunk => chunks.push(chunk));
            
            await new Promise((resolve, reject) => {
                stream.on('end', resolve);
                stream.on('error', reject);
            });
            
            audioBuffer = Buffer.concat(chunks);
            downloadMethod = 'ytdl-core';
            console.log(`✅ ytdl-core success: ${audioBuffer.length} bytes`);
        } catch (err) {
            errorLog.push(`ytdl-core: ${err.message}`);
            console.log("ytdl-core failed, trying next method...");
        }

        // Method 2: Try API-based download (fast and stable)
        if (!audioBuffer) {
            try {
                console.log("Attempting API download...");
                const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(video.url)}`;
                
                const apiResponse = await axios.get(apiUrl, { 
                    timeout: 15000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                
                if (apiResponse.data && apiResponse.data.success && apiResponse.data.downloadUrl) {
                    const audioResponse = await axios.get(apiResponse.data.downloadUrl, {
                        responseType: 'arraybuffer',
                        timeout: 30000
                    });
                    audioBuffer = Buffer.from(audioResponse.data);
                    downloadMethod = 'API';
                }
            } catch (err) {
                errorLog.push(`API: ${err.message}`);
                console.log("API download failed, trying next method...");
            }
        }

        // Method 3: Try alternative API
        if (!audioBuffer) {
            try {
                console.log("Attempting alternative API download...");
                const altApiUrl = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(video.url)}`;
                
                const altResponse = await axios.get(altApiUrl, { timeout: 10000 });
                
                if (altResponse.data && altResponse.data.data && altResponse.data.data.download) {
                    const audioResponse = await axios.get(altResponse.data.data.download, {
                        responseType: 'arraybuffer',
                        timeout: 30000
                    });
                    audioBuffer = Buffer.from(audioResponse.data);
                    downloadMethod = 'Alt-API';
                }
            } catch (err) {
                errorLog.push(`Alt-API: ${err.message}`);
            }
        }

        // If all methods fail, provide manual link
        if (!audioBuffer) {
            console.log("All download methods failed:", errorLog);
            
            const errorMessage = `❌ *Download Failed*\n\n` +
                `🎵 *Title:* ${videoInfo.title}\n` +
                `👤 *Channel:* ${videoInfo.author}\n` +
                `⏱️ *Duration:* ${videoInfo.duration}\n\n` +
                `⚠️ Could not download audio at this time.\n\n` +
                `🔗 *Watch on YouTube:*\n${videoInfo.url}\n\n` +
                `🔄 *Try these alternatives:*\n` +
                `• Use different keywords\n` +
                `• Try .yt <song name>\n` +
                `• Download manually from the link above`;
            
            return await conn.sendMessage(from, {
                image: { url: videoInfo.thumbnail },
                caption: errorMessage,
                contextInfo: {
                    externalAdReply: {
                        title: videoInfo.title,
                        body: `👤 ${videoInfo.author} • ⏱️ ${videoInfo.duration}`,
                        thumbnailUrl: videoInfo.thumbnail,
                        sourceUrl: videoInfo.url,
                        mediaType: 1
                    }
                }
            }, { quoted: mek });
        }

        // Calculate download speed
        const downloadTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const fileSize = (audioBuffer.length / (1024 * 1024)).toFixed(2);

        // Prepare caption
        const caption = `╭══━ ★ *GURU-MD PLAYER* ★ ━══╮\n\n` +
            `🎵 *Title:* ${videoInfo.title}\n` +
            `👤 *Channel:* ${videoInfo.author}\n` +
            `⏱️ *Duration:* ${videoInfo.duration}\n` +
            `👀 *Views:* ${videoInfo.views}\n` +
            `📅 *Uploaded:* ${videoInfo.uploaded}\n` +
            `📦 *Size:* ${fileSize} MB\n` +
            `⚡ *Speed:* ${downloadTime}s\n` +
            `🔧 *Method:* ${downloadMethod}\n\n` +
            `╰══━ ★ *Powered By GuruTech* ★ ━══╯`;

        // Send the audio file
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
                    sourceUrl: videoInfo.url,
                    mediaType: 2,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: mek });

        // Send success reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Optional: Send thumbnail as view once
        await conn.sendMessage(from, {
            image: { url: videoInfo.thumbnail },
            caption: `🎵 *Now Playing:*\n> ${videoInfo.title}\n> ${videoInfo.author}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`,
            viewOnce: true
        }, { quoted: mek });

    } catch (error) {
        console.error("Play command error:", error);
        
        let errorMsg = "❌ An error occurred while processing your request.\n\n";
        
        if (error.message.includes('yt-search')) {
            errorMsg += "Search service unavailable. Please try again later.";
        } else if (error.message.includes('network')) {
            errorMsg += "Network error. Check your internet connection.";
        } else if (error.message.includes('timeout')) {
            errorMsg += "Request timeout. The service is slow, try again.";
        } else {
            errorMsg += error.message || "Unknown error";
        }
        
        errorMsg += "\n\n🔄 Try .yt <song name> instead or use different keywords.";
        
        await reply(errorMsg);
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

// Add a simpler version for quick downloads
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
        
        const search = await ytSearch(q);
        if (!search.videos.length) return reply("❌ No results found!");
        
        const video = search.videos[0];
        const info = await ytdl.getInfo(video.url);
        const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });
        
        await conn.sendMessage(from, {
            audio: { url: format.url },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            caption: `🎵 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}`
        }, { quoted: mek });
        
    } catch (error) {
        reply("❌ Error: " + error.message);
    }
});

// Add a command to check API status
cmd({
    pattern: "apistatus",
    alias: ["checkapi"],
    desc: "Check YouTube download APIs status",
    category: "tools",
    react: "🔌",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    const apis = [
        { name: 'ytdl-core', url: null, type: 'local' },
        { name: 'David Cyril API', url: 'https://api.davidcyriltech.my.id', type: 'remote' },
        { name: 'Siputzx API', url: 'https://api.siputzx.my.id', type: 'remote' }
    ];
    
    let statusMsg = "🔌 *API Status Check*\n\n";
    
    for (const api of apis) {
        if (api.type === 'local') {
            statusMsg += `✅ ${api.name}: Available (Local)\n`;
        } else {
            try {
                await axios.get(api.url, { timeout: 5000 });
                statusMsg += `✅ ${api.name}: Online\n`;
            } catch {
                statusMsg += `❌ ${api.name}: Offline\n`;
            }
        }
    }
    
    statusMsg += "\n> Use .play for automatic failover";
    await reply(statusMsg);
});
