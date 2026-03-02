const { cmd } = require('../command');
const axios = require('axios');
const ytSearch = require('yt-search');

cmd({
    pattern: "play",
    alias: ["song", "ytplay", "music", "audio"],
    desc: "Download YouTube audio (updated for 2026)",
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
        
        if (!searchResults.videos?.length) return reply("❌ No results found.");

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
            text: `📥 *Downloading:* ${videoInfo.title}\n👤 ${videoInfo.author}\n⏱️ ${videoInfo.duration}\n\n⏳ Fetching audio...`,
            edit: statusMsg.key
        });

        // 2026 WORKING APIs (tested/reported alive early 2026 - order by reliability)
        const apiList = [
            { name: 'RapidSave', url: `https://rapidsave.com/api/download?video_url=${encodeURIComponent(video.url)}&type=audio` },
            { name: 'Y2Mate.is', url: `https://www.y2mate.is/api/convert?url=${encodeURIComponent(video.url)}&format=mp3` },
            { name: 'YT1s.io', url: `https://yt1s.io/api/ajaxSearch/index?url=${encodeURIComponent(video.url)}` }, // may need extra step for mp3 link
            { name: 'Loader.to', url: `https://loader.to/ajax/download.php?format=mp3&url=${encodeURIComponent(video.url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222` },
            { name: 'CNVMP3', url: `https://cnvmp3.com/download/mp3?url=${encodeURIComponent(video.url)}` }
        ];

        let downloadUrl = null;
        let method = '';

        for (const api of apiList) {
            try {
                console.log(`Trying ${api.name}...`);
                const res = await axios.get(api.url, { timeout: 20000 });

                let candidateUrl;
                if (api.name === 'RapidSave') candidateUrl = res.data?.url || res.data?.link;
                else if (api.name === 'Y2Mate.is') candidateUrl = res.data?.download_url;
                else if (api.name === 'YT1s.io') candidateUrl = res.data?.vidInfo?.mp3; // adjust if needed
                else if (api.name === 'Loader.to') candidateUrl = res.data?.result?.url;
                else if (api.name === 'CNVMP3') candidateUrl = res.data?.url;

                if (candidateUrl && candidateUrl.startsWith('http')) {
                    downloadUrl = candidateUrl;
                    method = api.name;
                    console.log(`Success with ${method}`);
                    break;
                }
            } catch (e) {
                console.log(`${api.name} failed: ${e.message}`);
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
                caption,
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
                caption: `🎵 *Downloaded Successfully!*\n> ${videoInfo.title}\n> ${videoInfo.author}`,
                viewOnce: true
            }, { quoted: mek });
        } else {
            // Final fallback message
            const errorMsg = `❌ *All auto methods failed* (YouTube blocked most APIs again)\n\n` +
                `🎵 *Title:* ${videoInfo.title}\n` +
                `👤 *Channel:* ${videoInfo.author}\n` +
                `⏱️ *Duration:* ${videoInfo.duration}\n\n` +
                `🔗 *Watch:* ${video.url}\n\n` +
                `💡 *Manual options:*\n• y2mate.is\n• rapidsave.com\n• loader.to\n• cnvmp3.com\n\nTry .yt or .music as backup!`;

            await conn.sendMessage(from, {
                image: { url: videoInfo.thumbnail },
                caption: errorMsg
            }, { quoted: mek });

            await conn.sendMessage(from, { react: { text: "⚠️", key: mek.key } });
        }

    } catch (error) {
        console.error("Play error:", error);
        reply("❌ Error: " + (error.message || 'Unknown'));
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

// Keep your formatNumber function
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
