/* ============================================
   GURU MD - AGATZ API DEBUGGER
   COMMAND: .debugagatz [youtube-url]
   ============================================ */

const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "debugagatz",
    desc: "Debug Agatz API response",
    category: "tools",
    react: "🐛",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a YouTube URL!\nExample: .debugagatz https://youtube.com/watch?v=xxx");
        
        const apiUrl = `https://api.agatz.xyz/api/yt?url=${encodeURIComponent(q)}`;
        
        await reply(`🔍 Fetching: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, { 
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        let result = `📦 *AGATZ API RAW RESPONSE*\n\n`;
        result += `🔗 URL: ${apiUrl}\n`;
        result += `📊 Status: ${response.status}\n\n`;
        result += `📝 Response Structure:\n`;
        
        // Show the structure without huge data
        if (response.data) {
            const keys = Object.keys(response.data);
            result += `Top level keys: ${keys.join(', ')}\n\n`;
            
            if (response.data.data) {
                result += `📁 'data' object keys: ${Object.keys(response.data.data).join(', ')}\n`;
                
                // Show sample values
                if (response.data.data.title) 
                    result += `\n📌 Title: ${response.data.data.title}\n`;
                if (response.data.data.duration) 
                    result += `⏱️ Duration: ${response.data.data.duration}\n`;
                if (response.data.data.audio) 
                    result += `🎵 Audio: ${response.data.data.audio.substring(0, 50)}...\n`;
                if (response.data.data.video) 
                    result += `🎬 Video: ${response.data.data.video.substring(0, 50)}...\n`;
                if (response.data.data.mp3) 
                    result += `🎵 MP3: ${response.data.data.mp3.substring(0, 50)}...\n`;
                if (response.data.data.mp4) 
                    result += `🎬 MP4: ${response.data.data.mp4.substring(0, 50)}...\n`;
            }
        } else {
            result += `❌ No data received`;
        }
        
        // Also try alternative Agatz endpoint
        result += `\n\n🔄 *Trying alternative endpoint...*\n`;
        
        try {
            const altUrl = `https://api.agatz.xyz/api/ytdl?url=${encodeURIComponent(q)}`;
            const altResponse = await axios.get(altUrl, { timeout: 8000 });
            
            result += `\nAlternative endpoint response:\n`;
            if (altResponse.data) {
                result += `Keys: ${Object.keys(altResponse.data).join(', ')}\n`;
            }
        } catch (err) {
            result += `❌ Alternative failed: ${err.message}\n`;
        }
        
        // Try another backup API
        result += `\n🔄 *Trying backup API...*\n`;
        
        try {
            const backupUrl = `https://api.kenliejugarap.com/ytdl/?url=${encodeURIComponent(q)}`;
            const backupResponse = await axios.get(backupUrl, { timeout: 8000 });
            
            result += `\nBackup API response:\n`;
            if (backupResponse.data) {
                result += `Keys: ${Object.keys(backupResponse.data).join(', ')}\n`;
                if (backupResponse.data.result) {
                    result += `Download URL: ${backupResponse.data.result.download_url || 'Not found'}\n`;
                }
            }
        } catch (err) {
            result += `❌ Backup failed: ${err.message}\n`;
        }
        
        await reply(result);
        
    } catch (error) {
        reply(`❌ Error: ${error.message}\n\n${error.response?.data ? JSON.stringify(error.response.data).substring(0, 200) : ''}`);
    }
});
