const { cmd } = require('../command');
const axios = require('axios');
const ytSearch = require('yt-search');

cmd({
    pattern: "play",
    alias: ["song", "ytplay", "music", "audio"],
    desc: "Download YouTube audio",
    category: "download",
    use: ".play <song name>",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a song name!\n\n*Example:* .play Helplessly Tatiana Manaois");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        await reply(`🔍 Searching for: ${q}`);

        // Search for the video
        const searchResults = await ytSearch(q);
        
        if (!searchResults || !searchResults.videos || searchResults.videos.length === 0) {
            return reply("❌ No results found. Try different keywords.");
        }

        // Get the best match
        const video = searchResults.videos[0];
        
        // Try the most reliable APIs in order
        let downloadUrl = null;
        let method = '';
        
        // API 1: Vihangayt (Most reliable for audio)
        try {
            const api1 = `https://vihangayt.me/download/ytmp3?url=${encodeURIComponent(video.url)}`;
            const res1 = await axios.get(api1, { timeout: 15000 });
            if (res1.data && res1.data.data && res1.data.data.url) {
                downloadUrl = res1.data.data.url;
                method = 'Vihangayt';
            }
        } catch (e) { console.log("API 1 failed"); }

        // API 2: Paja API
        if (!downloadUrl) {
            try {
                const api2 = `https://pajaapi.vercel.app/api/yt?url=${encodeURIComponent(video.url)}&type=mp3`;
                const res2 = await axios.get(api2, { timeout: 15000 });
                if (res2.data && res2.data.result && res2.data.result.url) {
                    downloadUrl = res2.data.result.url;
                    method = 'Paja API';
                }
            } catch (e) { console.log("API 2 failed"); }
        }

        // API 3: Vytix API
        if (!downloadUrl) {
            try {
                const api3 = `https://vytix.codershakil.org/api/ytmp3?url=${encodeURIComponent(video.url)}`;
                const res3 = await axios.get(api3, { timeout: 15000 });
                if (res3.data && res3.data.url) {
                    downloadUrl = res3.data.url;
                    method = 'Vytix';
                }
            } catch (e) { console.log("API 3 failed"); }
        }

        // API 4: Y2Mate
        if (!downloadUrl) {
            try {
                const api4 = `https://y2mate.guru/api/convert?url=${encodeURIComponent(video.url)}&format=mp3`;
                const res4 = await axios.get(api4, { timeout: 15000 });
                if (res4.data && res4.data.download_url) {
                    downloadUrl = res4.data.download_url;
                    method = 'Y2Mate';
                }
            } catch (e) { console.log("API 4 failed"); }
        }

        // API 5: Hardolaf API
        if (!downloadUrl) {
            try {
                const api5 = `https://api.hardolaf.com/yt/download?url=${encodeURIComponent(video.url)}&type=audio`;
                const res5 = await axios.get(api5, { timeout: 15000 });
                if (res5.data && res5.data.url) {
                    downloadUrl = res5.data.url;
                    method = 'Hardolaf';
                }
            } catch (e) { console.log("API 5 failed"); }
        }

        // API 6: Savefrom API
        if (!downloadUrl) {
            try {
                const api6 = `https://api.savefrom.net/api/convert?url=${encodeURIComponent(video.url)}&format=mp3`;
                const res6 = await axios.get(api6, { timeout: 15000 });
                if (res6.data && res6.data.url) {
                    downloadUrl = res6.data.url;
                    method = 'Savefrom';
                }
            } catch (e) { console.log("API 6 failed"); }
        }

        // If we got a download URL
        if (downloadUrl) {
            const caption = `╭══━ ★ *GURU-MD PLAYER* ★ ━══╮\n\n` +
                `🎵 *Title:* ${video.title}\n` +
                `👤 *Channel:* ${video.author.name}\n` +
                `⏱️ *Duration:* ${video.timestamp}\n` +
                `👀 *Views:* ${formatNumber(video.views)}\n` +
                `📦 *Source:* ${method}\n\n` +
                `╰══━ ★ *Powered By GuruTech* ★ ━══╯`;

            await conn.sendMessage(from, {
                audio: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp3`,
                caption: caption
            }, { quoted: mek });

            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
            
            // Send thumbnail
            await conn.sendMessage(from, {
                image: { url: video.thumbnail },
                caption: `🎵 *Downloaded:*\n> ${video.title}\n> ${video.author.name}`,
                viewOnce: true
            }, { quoted: mek });

        } else {
            // All APIs failed - provide alternative download links
            const altLinks = [
                `https://www.y2mate.com/youtube/${video.videoId}`,
                `https://en.savefrom.net/${video.videoId}/`,
                `https://loader.to/api/button/?url=${video.url}&f=mp3`,
                `https://yt1s.com/en/youtube-to-mp3?q=${video.videoId}`
            ];

            const errorMsg = `❌ *Download Failed*\n\n` +
                `🎵 *Title:* ${video.title}\n` +
                `👤 *Channel:* ${video.author.name}\n` +
                `⏱️ *Duration:* ${video.timestamp}\n\n` +
                `⚠️ Could not download automatically.\n\n` +
                `📱 *Manual Download Links:*\n` +
                altLinks.map((link, i) => `${i+1}. ${link}`).join('\n') + '\n\n' +
                `🔗 *Watch on YouTube:*\n${video.url}`;

            await conn.sendMessage(from, {
                image: { url: video.thumbnail },
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

// Simple direct download command
cmd({
    pattern: "yt",
    alias: ["ytaudio"],
    desc: "Simple YouTube download",
    category: "download",
    react: "🎧",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Provide a song name!");
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        const search = await ytSearch(q);
        if (!search.videos.length) return reply("❌ No results!");
        
        const video = search.videos[0];
        
        // Try Vihangayt API first
        const api = `https://vihangayt.me/download/ytmp3?url=${encodeURIComponent(video.url)}`;
        const response = await axios.get(api, { timeout: 15000 });
        
        if (response.data && response.data.data && response.data.data.url) {
            await conn.sendMessage(from, {
                audio: { url: response.data.data.url },
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`,
                caption: `🎵 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}`
            }, { quoted: mek });
            
            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        } else {
            reply("❌ Could not get download URL");
        }
        
    } catch (error) {
        console.error("YT error:", error);
        reply("❌ Error: " + error.message);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

// Alternative command using different API
cmd({
    pattern: "music",
    alias: ["mp3"],
    desc: "Alternative music download",
    category: "download",
    react: "🎼",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Provide a song name!");
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        const search = await ytSearch(q);
        if (!search.videos.length) return reply("❌ No results!");
        
        const video = search.videos[0];
        
        // Try different API
        const api = `https://pajaapi.vercel.app/api/yt?url=${encodeURIComponent(video.url)}&type=mp3`;
        const response = await axios.get(api, { timeout: 15000 });
        
        if (response.data && response.data.result && response.data.result.url) {
            await conn.sendMessage(from, {
                audio: { url: response.data.result.url },
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`,
                caption: `🎵 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}`
            }, { quoted: mek });
            
            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        } else {
            reply("❌ Could not get download URL");
        }
        
    } catch (error) {
        console.error("Music error:", error);
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
