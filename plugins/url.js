const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

cmd({
    pattern: "url",
    alias: ["shorten", "tinyurl"],
    desc: "Shorten long URL",
    category: "utility",
    use: ".url <long link>",
    react: "🔗",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a long URL!\nExample: .url https://very-long-link.com");

        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(q)}`);
        const shortUrl = response.data;

        if (shortUrl.includes("Error")) {
            return reply("❌ Failed to shorten URL. Try again.");
        }

        reply(`*Shortened URL:*\n${shortUrl}\n\nOriginal: ${q}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);

    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});
