/* ============================================
   GURU MD - API TESTER
   COMMAND: .testapi [youtube-url]
   ============================================ */

const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "testapi",
    desc: "Test individual YouTube download APIs",
    category: "tools",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a YouTube URL!\nExample: .testapi https://youtube.com/watch?v=xxx");
        
        // Extract video ID or use full URL
        let videoUrl = q;
        if (!q.includes('youtube.com') && !q.includes('youtu.be')) {
            videoUrl = `https://youtube.com/watch?v=${q}`;
        }
        
        const apis = [
            {
                name: 'David Cyril MP3',
                url: `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
                type: 'audio'
            },
            {
                name: 'David Cyril MP4',
                url: `https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
                type: 'video'
            },
            {
                name: 'Siputzx MP3',
                url: `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`,
                type: 'audio'
            },
            {
                name: 'Siputzx MP4',
                url: `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(videoUrl)}`,
                type: 'video'
            },
            {
                name: 'Ryzendesu MP3',
                url: `https://api.ryzendesu.vip/api/downloader/yt?url=${encodeURIComponent(videoUrl)}&type=mp3`,
                type: 'audio'
            },
            {
                name: 'Ryzendesu MP4',
                url: `https://api.ryzendesu.vip/api/downloader/yt?url=${encodeURIComponent(videoUrl)}&type=mp4`,
                type: 'video'
            },
            {
                name: 'Agatz',
                url: `https://api.agatz.xyz/api/yt?url=${encodeURIComponent(videoUrl)}`,
                type: 'both'
            },
            {
                name: 'Pipedream Audio',
                url: `https://pipedream.guruapi.tech/api/ytdl?url=${encodeURIComponent(videoUrl)}&type=audio`,
                type: 'audio'
            },
            {
                name: 'Pipedream Video',
                url: `https://pipedream.guruapi.tech/api/ytdl?url=${encodeURIComponent(videoUrl)}&type=video`,
                type: 'video'
            },
            {
                name: 'Vihangayt MP3',
                url: `https://vihangayt.me/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
                type: 'audio'
            },
            {
                name: 'Vihangayt MP4',
                url: `https://vihangayt.me/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
                type: 'video'
            }
        ];

        let result = `🔍 *API TEST RESULTS*\n\n`;
        result += `URL: ${videoUrl}\n\n`;

        for (const api of apis) {
            try {
                console.log(`Testing ${api.name}...`);
                const start = Date.now();
                const response = await axios.get(api.url, { 
                    timeout: 8000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                const time = Date.now() - start;
                
                if (response.data) {
                    let downloadUrl = null;
                    
                    // Try to find download URL based on response structure
                    if (response.data.downloadUrl) downloadUrl = response.data.downloadUrl;
                    else if (response.data.download_url) downloadUrl = response.data.download_url;
                    else if (response.data.url) downloadUrl = response.data.url;
                    else if (response.data.link) downloadUrl = response.data.link;
                    else if (response.data.data?.download) downloadUrl = response.data.data.download;
                    else if (response.data.data?.download_link) downloadUrl = response.data.data.download_link;
                    else if (response.data.audio) downloadUrl = response.data.audio;
                    else if (response.data.video) downloadUrl = response.data.video;
                    
                    result += `✅ ${api.name}: ${time}ms\n`;
                    if (downloadUrl) {
                        result += `   📥 ${downloadUrl.substring(0, 50)}...\n`;
                    }
                } else {
                    result += `❌ ${api.name}: No data\n`;
                }
            } catch (err) {
                result += `❌ ${api.name}: ${err.message}\n`;
            }
        }

        result += `\n> Test completed. Working APIs will show ✅`;
        
        // Split long message if needed
        if (result.length > 4000) {
            const parts = result.match(/[\s\S]{1,4000}/g) || [];
            for (const part of parts) {
                await reply(part);
            }
        } else {
            await reply(result);
        }

    } catch (error) {
        reply("❌ Error: " + error.message);
    }
});
