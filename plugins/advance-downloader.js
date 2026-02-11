const axios = require('axios');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
    name: "Advanced Downloader",
    alias: ["dl", "download", "yt", "ig", "fb", "tt", "twitter", "ytmp3", "ytmp4"],
    desc: "Advanced universal media downloader",
    category: "Downloader",
    usage: ".dl <url> or .yt <song name>",
    react: "📥",
    start: async (conn, m, { text, prefix, reply }) => {
        if (!text) return reply(`❌ Please provide a URL or search query!\n\nExample: ${prefix}dl https://youtu.be/xxxx\n${prefix}yt Believer Imagine Dragons`);

        try {
            // Check if it's a URL or search query
            const isUrl = text.match(/^https?:\/\//);
            
            if (isUrl) {
                // Extract domain
                const url = text.trim();
                const domain = url.toLowerCase().includes('youtube.com') || url.toLowerCase().includes('youtu.be') ? 'youtube' :
                              url.toLowerCase().includes('instagram.com') ? 'instagram' :
                              url.toLowerCase().includes('facebook.com') || url.toLowerCase().includes('fb.watch') ? 'facebook' :
                              url.toLowerCase().includes('tiktok.com') ? 'tiktok' :
                              url.toLowerCase().includes('twitter.com') || url.toLowerCase().includes('x.com') ? 'twitter' :
                              url.toLowerCase().includes('pinterest.com') ? 'pinterest' :
                              url.toLowerCase().includes('soundcloud.com') ? 'soundcloud' :
                              url.toLowerCase().includes('spotify.com') ? 'spotify' : 'unknown';
                
                reply(`⏳ Downloading from ${domain}...`);
                
                // Handle different platforms
                switch(domain) {
                    case 'youtube':
                        await handleYouTube(url, conn, m, reply);
                        break;
                    case 'instagram':
                        await handleInstagram(url, conn, m, reply);
                        break;
                    case 'facebook':
                        await handleFacebook(url, conn, m, reply);
                        break;
                    case 'tiktok':
                        await handleTikTok(url, conn, m, reply);
                        break;
                    case 'twitter':
                        await handleTwitter(url, conn, m, reply);
                        break;
                    default:
                        reply(`❌ Unsupported platform: ${domain}\n\nSupported: YouTube, Instagram, Facebook, TikTok, Twitter`);
                }
            } else {
                // Search YouTube
                reply(`🔍 Searching for: ${text}`);
                await searchAndDownloadYouTube(text, conn, m, reply);
            }
        } catch (error) {
            console.error('[Downloader Error]:', error);
            reply(`❌ Download failed: ${error.message}`);
        }
    }
};

// YouTube Handler
async function handleYouTube(url, conn, m, reply) {
    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title;
        const duration = parseInt(info.videoDetails.lengthSeconds);
        const views = info.videoDetails.viewCount;
        const author = info.videoDetails.author.name;
        
        // Create selection buttons
        const buttons = [
            { buttonId: `ytmp3_${url}`, buttonText: { displayText: '🎵 Audio (MP3)' }, type: 1 },
            { buttonId: `ytmp4_${url}`, buttonText: { displayText: '🎬 Video (MP4)' }, type: 1 }
        ];
        
        const caption = `*📹 YouTube Downloader*\n\n` +
                       `*Title:* ${title}\n` +
                       `*Author:* ${author}\n` +
                       `*Duration:* ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}\n` +
                       `*Views:* ${views.toLocaleString()}\n\n` +
                       `_Select format below:_`;
        
        await conn.sendMessage(m.from, { 
            image: { url: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url },
            caption: caption,
            buttons: buttons,
            viewOnce: true,
            headerType: 4
        }, { quoted: m });
        
    } catch (error) {
        reply(`❌ YouTube download failed: ${error.message}`);
    }
}

// Instagram Handler
async function handleInstagram(url, conn, m, reply) {
    try {
        const api = await axios.get(`https://api.akuari.my.id/downloader/instagram?link=${encodeURIComponent(url)}`);
        const data = api.data;
        
        if (data.status && data.result.length > 0) {
            for (let i = 0; i < Math.min(data.result.length, 3); i++) {
                const media = data.result[i];
                const isVideo = media.includes('.mp4');
                
                if (isVideo) {
                    await conn.sendMessage(m.from, { 
                        video: { url: media },
                        caption: `📥 Instagram Video\n\nDownloaded via ᴳᵁᴿᵁᴹᴰ`,
                        mimetype: 'video/mp4'
                    }, { quoted: m });
                } else {
                    await conn.sendMessage(m.from, { 
                        image: { url: media },
                        caption: `📸 Instagram Image\n\nDownloaded via ᴳᵁᴿᵁᴹᴰ`
                    }, { quoted: m });
                }
                await sleep(1000);
            }
        } else {
            reply('❌ Failed to fetch Instagram media');
        }
    } catch (error) {
        reply(`❌ Instagram download failed: ${error.message}`);
    }
}

// Facebook Handler
async function handleFacebook(url, conn, m, reply) {
    try {
        const api = await axios.get(`https://api.akuari.my.id/downloader/facebook?link=${encodeURIComponent(url)}`);
        const data = api.data;
        
        if (data.status && data.result) {
            const hd = data.result.hd;
            const sd = data.result.sd;
            
            const buttons = [
                { buttonId: `fbhd_${hd}`, buttonText: { displayText: '🎬 HD Quality' }, type: 1 },
                { buttonId: `fbsd_${sd}`, buttonText: { displayText: '📱 SD Quality' }, type: 1 }
            ];
            
            await conn.sendMessage(m.from, {
                video: { url: sd || hd },
                caption: `*📘 Facebook Video*\n\nDownloaded via ᴳᵁᴿᵁᴹᴰ`,
                buttons: buttons
            }, { quoted: m });
        }
    } catch (error) {
        reply(`❌ Facebook download failed: ${error.message}`);
    }
}

// TikTok Handler
async function handleTikTok(url, conn, m, reply) {
    try {
        const api = await axios.get(`https://api.akuari.my.id/downloader/tiktok?link=${encodeURIComponent(url)}`);
        const data = api.data;
        
        if (data.status) {
            const videoUrl = data.result.nowm;
            const musicUrl = data.result.music;
            
            await conn.sendMessage(m.from, {
                video: { url: videoUrl },
                caption: `*🎵 TikTok Video*\n\n👤 *Author:* ${data.result.author || 'Unknown'}\n💬 *Caption:* ${data.result.caption || ''}\n\nDownloaded via ᴳᵁᴿᵁᴹᴰ`
            }, { quoted: m });
        }
    } catch (error) {
        reply(`❌ TikTok download failed: ${error.message}`);
    }
}

// Twitter Handler
async function handleTwitter(url, conn, m, reply) {
    try {
        const api = await axios.get(`https://api.akuari.my.id/downloader/twitter?link=${encodeURIComponent(url)}`);
        const data = api.data;
        
        if (data.status && data.result.length > 0) {
            const media = data.result[0];
            await conn.sendMessage(m.from, {
                video: { url: media.url },
                caption: `*🐦 Twitter Video*\n\nDownloaded via ᴳᵁᴿᵁᴹᴰ`
            }, { quoted: m });
        }
    } catch (error) {
        reply(`❌ Twitter download failed: ${error.message}`);
    }
}

// YouTube Search & Download
async function searchAndDownloadYouTube(query, conn, m, reply) {
    try {
        const results = await ytSearch(query);
        const videos = results.videos.slice(0, 5);
        
        let text = `*🔍 YouTube Search Results for:* ${query}\n\n`;
        videos.forEach((video, index) => {
            text += `*${index + 1}.* ${video.title}\n`;
            text += `   ⏱️ ${video.timestamp} | 👤 ${video.author.name}\n`;
            text += `   🔗 ${video.url}\n\n`;
        });
        text += `_Reply with number to download_`;
        
        await conn.sendMessage(m.from, { text: text }, { quoted: m });
        
        // Store search results in global variable
        global.ytSearchResults = videos;
        global.searchUser = m.sender;
        
    } catch (error) {
        reply(`❌ Search failed: ${error.message}`);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
