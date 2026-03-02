const { cmd } = require('../command');
const axios = require('axios');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');

cmd({
    pattern: "play",
    alias: ["song", "ytplay", "music", "video", "ytvideo"],
    desc: "Download YouTube videos or audio (WhatsApp compatible)",
    category: "download",
    use: ".play <song name> or .play video <song name>",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a song name!\n\n*Examples:*\n.play Alan Walker Faded (audio)\n.play video Alan Walker Faded (video)");

        // Check if user wants video or audio
        let isVideo = false;
        let searchQuery = q;
        
        if (q.toLowerCase().startsWith('video ')) {
            isVideo = true;
            searchQuery = q.substring(6).trim();
        } else if (q.toLowerCase().startsWith('audio ')) {
            searchQuery = q.substring(6).trim();
        }

        const startTime = Date.now();
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        // Send initial status
        const statusMsg = await reply(`🔍 *Searching:* ${searchQuery}\n⏱️ Please wait...`);

        // Step 1: Search for the video
        const searchResults = await ytSearch(searchQuery);
        
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
            text: `📥 *Processing ${isVideo ? 'VIDEO' : 'AUDIO'}:*\n🎵 ${videoInfo.title}\n👤 ${videoInfo.author}\n⏱️ Duration: ${videoInfo.duration}\n\n⏳ Getting ${isVideo ? 'video' : 'audio'}...`,
            edit: statusMsg.key
        });

        // Create temp directory if not exists
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        let mediaBuffer = null;
        let downloadMethod = '';
        let errorLog = [];

        if (isVideo) {
            // VIDEO DOWNLOAD - WhatsApp compatible (MP4, H.264, AAC)
            const videoApis = [
                {
                    name: 'Video API 1',
                    url: `https://api.davidcyriltech.my.id/download/ytvideo?url=${encodeURIComponent(video.url)}`,
                    parse: (data) => data.downloadUrl || data.url
                },
                {
                    name: 'Video API 2',
                    url: `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(video.url)}`,
                    parse: (data) => data.data?.download
                },
                {
                    name: 'Video API 3',
                    url: `https://api.ryzendesu.vip/api/downloader/yt?url=${encodeURIComponent(video.url)}&type=mp4`,
                    parse: (data) => data.url || data.download
                }
            ];

            for (const api of videoApis) {
                try {
                    console.log(`Attempting ${api.name}...`);
                    const response = await axios.get(api.url, { timeout: 15000 });
                    
                    const downloadUrl = api.parse(response.data);
                    if (downloadUrl) {
                        const videoResponse = await axios.get(downloadUrl, {
                            responseType: 'arraybuffer',
                            timeout: 60000
                        });
                        mediaBuffer = Buffer.from(videoResponse.data);
                        downloadMethod = api.name;
                        console.log(`✅ ${api.name} success`);
                        break;
                    }
                } catch (err) {
                    errorLog.push(`${api.name}: ${err.message}`);
                }
            }

            // Fallback to ytdl for video
            if (!mediaBuffer) {
                try {
                    console.log("Attempting ytdl-core video download...");
                    const info = await ytdl.getInfo(video.url);
                    // Choose 360p format for WhatsApp compatibility
                    const format = ytdl.chooseFormat(info.formats, { quality: '18' });
                    
                    if (format && format.url) {
                        const response = await axios.get(format.url, {
                            responseType: 'arraybuffer',
                            timeout: 60000
                        });
                        mediaBuffer = Buffer.from(response.data);
                        downloadMethod = 'ytdl-core';
                    }
                } catch (err) {
                    errorLog.push(`ytdl-core video: ${err.message}`);
                }
            }
        } else {
            // AUDIO DOWNLOAD - WhatsApp compatible (MP3/Opus in audio/mpeg)
            const audioApis = [
                // API 1: Direct MP3
                {
                    name: 'MP3 API 1',
                    url: `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(video.url)}`,
                    parse: (data) => data.downloadUrl || data.url
                },
                // API 2: Alternative MP3
                {
                    name: 'MP3 API 2',
                    url: `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(video.url)}`,
                    parse: (data) => data.data?.download
                },
                // API 3: Another source
                {
                    name: 'MP3 API 3',
                    url: `https://api.ryzendesu.vip/api/downloader/yt?url=${encodeURIComponent(video.url)}&type=mp3`,
                    parse: (data) => data.url || data.download
                },
                // API 4: Agatz
                {
                    name: 'MP3 API 4',
                    url: `https://api.agatz.xyz/api/yt?url=${encodeURIComponent(video.url)}`,
                    parse: (data) => data.audio
                },
                // API 5: Y2Mate
                {
                    name: 'Y2Mate',
                    url: `https://y2mate.guru/api/convert?url=${encodeURIComponent(video.url)}&format=mp3`,
                    parse: (data) => data.download_url
                }
            ];

            for (const api of audioApis) {
                try {
                    console.log(`Attempting ${api.name}...`);
                    const response = await axios.get(api.url, { 
                        timeout: 15000,
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });
                    
                    const downloadUrl = api.parse(response.data);
                    if (downloadUrl) {
                        const audioResponse = await axios.get(downloadUrl, {
                            responseType: 'arraybuffer',
                            timeout: 60000,
                            headers: { 
                                'User-Agent': 'Mozilla/5.0',
                                'Accept': 'audio/mpeg,audio/mp3,*/*'
                            }
                        });
                        
                        // Check if we got valid audio data
                        const buffer = Buffer.from(audioResponse.data);
                        
                        // Sometimes APIs return HTML instead of audio
                        if (buffer.length > 1024 && !buffer.toString().startsWith('<!')) {
                            mediaBuffer = buffer;
                            downloadMethod = api.name;
                            console.log(`✅ ${api.name} success: ${buffer.length} bytes`);
                            break;
                        }
                    }
                } catch (err) {
                    errorLog.push(`${api.name}: ${err.message}`);
                }
            }

            // Fallback to ytdl-core with audio conversion
            if (!mediaBuffer) {
                try {
                    console.log("Attempting ytdl-core audio download with conversion...");
                    
                    // Create temp file paths
                    const tempInput = path.join(tempDir, `audio_${Date.now()}_input.mp4`);
                    const tempOutput = path.join(tempDir, `audio_${Date.now()}_output.mp3`);
                    
                    // Download audio stream
                    const audioStream = ytdl(video.url, {
                        filter: 'audioonly',
                        quality: 'highestaudio',
                    });
                    
                    // Save to temp file
                    const writeStream = fs.createWriteStream(tempInput);
                    audioStream.pipe(writeStream);
                    
                    await new Promise((resolve, reject) => {
                        writeStream.on('finish', resolve);
                        writeStream.on('error', reject);
                    });
                    
                    // Convert to WhatsApp-compatible MP3 using ffmpeg
                    await new Promise((resolve, reject) => {
                        ffmpeg(tempInput)
                            .audioBitrate(128)
                            .audioCodec('libmp3lame')
                            .format('mp3')
                            .on('end', resolve)
                            .on('error', reject)
                            .save(tempOutput);
                    });
                    
                    // Read the converted file
                    mediaBuffer = fs.readFileSync(tempOutput);
                    downloadMethod = 'ytdl-core+ffmpeg';
                    
                    // Cleanup temp files
                    try {
                        fs.unlinkSync(tempInput);
                        fs.unlinkSync(tempOutput);
                    } catch (e) {}
                    
                    console.log(`✅ ytdl-core+ffmpeg success: ${mediaBuffer.length} bytes`);
                    
                } catch (err) {
                    errorLog.push(`ytdl-core+ffmpeg: ${err.message}`);
                }
            }
        }

        // If all methods fail
        if (!mediaBuffer) {
            console.log("All download methods failed:", errorLog);
            
            const errorMessage = `❌ *Download Failed*\n\n` +
                `🎵 *Title:* ${videoInfo.title}\n` +
                `👤 *Channel:* ${videoInfo.author}\n` +
                `⏱️ *Duration:* ${videoInfo.duration}\n` +
                `👀 *Views:* ${videoInfo.views}\n\n` +
                `⚠️ Could not download ${isVideo ? 'video' : 'audio'} at this time.\n\n` +
                `🔗 *Watch on YouTube:*\n${videoInfo.url}\n\n` +
                `📱 *Try these commands instead:*\n` +
                `• .yt ${searchQuery} (quick audio)\n` +
                `• .video ${searchQuery} (quick video)\n` +
                `• Download manually from the link above`;
            
            return await conn.sendMessage(from, {
                image: { url: videoInfo.thumbnail },
                caption: errorMessage,
                contextInfo: {
                    externalAdReply: {
                        title: videoInfo.title.substring(0, 30),
                        body: `👤 ${videoInfo.author} • ⏱️ ${videoInfo.duration}`,
                        thumbnailUrl: videoInfo.thumbnail,
                        sourceUrl: videoInfo.url,
                        mediaType: 1
                    }
                }
            }, { quoted: mek });
        }

        // Verify buffer is valid for WhatsApp
        if (mediaBuffer.length < 1024) {
            throw new Error("Downloaded file is too small");
        }

        // Calculate stats
        const downloadTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const fileSize = (mediaBuffer.length / (1024 * 1024)).toFixed(2);

        // Prepare caption
        const caption = `╭══━ ★ *GURU-MD ${isVideo ? 'VIDEO' : 'PLAYER'}* ★ ━══╮\n\n` +
            `🎵 *Title:* ${videoInfo.title}\n` +
            `👤 *Channel:* ${videoInfo.author}\n` +
            `⏱️ *Duration:* ${videoInfo.duration}\n` +
            `👀 *Views:* ${videoInfo.views}\n` +
            `📅 *Uploaded:* ${videoInfo.uploaded}\n` +
            `📦 *Size:* ${fileSize} MB\n` +
            `⚡ *Speed:* ${downloadTime}s\n` +
            `🔧 *Method:* ${downloadMethod}\n\n` +
            `╰══━ ★ *Powered By GuruTech* ★ ━══╯`;

        // Send based on type
        if (isVideo) {
            await conn.sendMessage(from, {
                video: mediaBuffer,
                mimetype: 'video/mp4',
                fileName: `${videoInfo.title.replace(/[^\w\s]/gi, '')}.mp4`,
                caption: caption
            }, { quoted: mek });
        } else {
            // Send audio with proper WhatsApp audio format
            await conn.sendMessage(from, {
                audio: mediaBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${videoInfo.title.replace(/[^\w\s]/gi, '')}.mp3`,
                caption: caption
            }, { quoted: mek });
        }

        // Send success reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Send thumbnail
        await conn.sendMessage(from, {
            image: { url: videoInfo.thumbnail },
            caption: `🎵 *${isVideo ? 'Video' : 'Audio'} Ready:*\n> ${videoInfo.title}\n> ${videoInfo.author}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`,
            viewOnce: true
        }, { quoted: mek });

    } catch (error) {
        console.error("Play command error:", error);
        
        let errorMsg = "❌ An error occurred.\n\n";
        
        if (error.message.includes('yt-search')) {
            errorMsg += "Search service unavailable. Please try again later.";
        } else if (error.message.includes('network')) {
            errorMsg += "Network error. Check your internet connection.";
        } else if (error.message.includes('timeout')) {
            errorMsg += "Request timeout. The service is slow, try again.";
        } else if (error.message.includes('too small')) {
            errorMsg += "Download failed - file too small. Try another song.";
        } else {
            errorMsg += error.message || "Unknown error";
        }
        
        errorMsg += "\n\n🔄 Try .play audio or .play video commands.";
        
        await reply(errorMsg);
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
        
        // Use direct API
        const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(video.url)}`;
        const response = await axios.get(apiUrl, { timeout: 10000 });
        
        if (response.data && response.data.downloadUrl) {
            await conn.sendMessage(from, {
                audio: { url: response.data.downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`,
                caption: `🎵 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}`
            }, { quoted: mek });
            
            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        } else {
            throw new Error("No download URL");
        }
        
    } catch (error) {
        console.error("YT command error:", error);
        reply("❌ Error: " + error.message);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

// Quick video download command
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
        
        // Use direct API
        const apiUrl = `https://api.davidcyriltech.my.id/download/ytvideo?url=${encodeURIComponent(video.url)}`;
        const response = await axios.get(apiUrl, { timeout: 10000 });
        
        if (response.data && response.data.downloadUrl) {
            await conn.sendMessage(from, {
                video: { url: response.data.downloadUrl },
                mimetype: 'video/mp4',
                caption: `🎬 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}`
            }, { quoted: mek });
            
            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        } else {
            throw new Error("No download URL");
        }
        
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
