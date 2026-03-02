const { cmd } = require('../command');
const axios = require('axios');
const ytSearch = require('yt-search');

cmd({
    pattern: "play",
    alias: ["song", "ytplay", "music", "audio"],
    desc: "Download YouTube audio using Savetube & fallbacks (2026 working)",
    category: "download",
    use: ".play <song name>",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a song name!\n\n*Example:* .play Helplessly Tatiana Manaois");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        const statusMsg = await reply(`🔍 *Searching:* ${q}\n⏱️ Please wait...`);

        const searchResults = await ytSearch(q);
        
        if (!searchResults.videos?.length) return reply("❌ No results found. Try different keywords.");

        const video = searchResults.videos[0];
        
        const videoInfo = {
            title: video.title,
            url: video.url,
            duration: video.timestamp,
            views: formatNumber(video.views),
            thumbnail: video.thumbnail,
            author: video.author.name,
            videoId: video.videoId
        };

        await conn.sendMessage(from, {
            text: `📥 *Downloading:* ${videoInfo.title}\n👤 ${videoInfo.author}\n⏱️ ${videoInfo.duration}\n\nTrying Savetube API...`,
            edit: statusMsg.key
        });

        let downloadUrl = null;
        let method = '';

        // Priority: Savetube API (the one matching your example)
        const savetubeEndpoints = [
            `https://savetube.vip/api/convert?url=${encodeURIComponent(video.url)}`,
            `https://api.savetube.me/api/v1/convert?url=${encodeURIComponent(video.url)}`,
            `https://savetube.su/api/convert?url=${encodeURIComponent(video.url)}&format=mp3`,
            `https://savetube.me/api/convert?url=${encodeURIComponent(video.url)}`
        ];

        for (const endpoint of savetubeEndpoints) {
            try {
                console.log(`Trying Savetube endpoint: ${endpoint}`);
                const res = await axios.get(endpoint, { timeout: 20000 });
                if (res.data?.status === true && res.data?.result?.startsWith('http')) {
                    downloadUrl = res.data.result;
                    method = 'Savetube';
                    console.log("✅ Savetube success");
                    break;
                } else if (res.data?.result?.url) {  // some variants
                    downloadUrl = res.data.result.url;
                    method = 'Savetube';
                    break;
                }
            } catch (e) {
                console.log(`Savetube endpoint failed: ${e.message}`);
            }
        }

        // Fallbacks if Savetube fails
        if (!downloadUrl) {
            const fallbackApis = [
                { name: 'RapidSave', url: `https://rapidsave.com/api/download?video_url=${encodeURIComponent(video.url)}&type=audio` },
                { name: 'Loader.to', url: `https://loader.to/ajax/download.php?format=mp3&url=${encodeURIComponent(video.url)}` },
                { name: 'CNVMP3', url: `https://cnvmp3.com/download/mp3?url=${encodeURIComponent(video.url)}` }
            ];

            for (const api of fallbackApis) {
                try {
                    console.log(`Trying fallback: ${api.name}`);
                    const res = await axios.get(api.url, { timeout: 20000 });
                    let candidate = res.data?.url || res.data?.result?.url || res.data?.download_url || res.data?.link;
                    if (candidate && candidate.startsWith('http')) {
                        downloadUrl = candidate;
                        method = api.name;
                        console.log(`✅ ${api.name} success`);
                        break;
                    }
                } catch (e) {
                    console.log(`${api.name} failed: ${e.message}`);
                }
            }
        }

        if (downloadUrl) {
            const caption = `╭══━ ★ *GURU-MD PLAYER* ★ ━══╮\n\n` +
                `🎵 *Title:* ${videoInfo.title}\n` +
                `👤 *Channel:* ${videoInfo.author}\n` +
                `⏱️ *Duration:* ${videoInfo.duration}\n` +
                `👀 *Views:* ${videoInfo.views}\n` +
                `📦 *Via:* ${method}\n\n` +
                `╰══━ ★ *Powered By GuruTech* ★ ━══╯`;

            await conn.sendMessage(from, {
                audio: { url: downloadUrl },
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
            
            await conn.sendMessage(from, {
                image: { url: videoInfo.thumbnail },
                caption: `🎵 *Downloaded Successfully via ${method}!*\n> ${videoInfo.title}\n> ${videoInfo.author}`,
                viewOnce: true
            }, { quoted: mek });
        } else {
            const errorMsg = `❌ *Download failed* (APIs blocked/temporary issue)\n\n` +
                `🎵 *Title:* ${videoInfo.title}\n` +
                `👤 *Channel:* ${videoInfo.author}\n` +
                `⏱️ *Duration:* ${videoInfo.duration}\n\n` +
                `🔗 *Watch on YouTube:*\n${video.url}\n\n` +
                `💡 *Manual:* Try savetube.vip, rapidsave.com or loader.to in browser`;

            await conn.sendMessage(from, {
                image: { url: videoInfo.thumbnail },
                caption: errorMsg
            }, { quoted: mek });

            await conn.sendMessage(from, { react: { text: "⚠️", key: mek.key } });
        }

    } catch (error) {
        console.error("Play command error:", error);
        reply("❌ Error: " + (error.message || 'Unknown issue'));
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
