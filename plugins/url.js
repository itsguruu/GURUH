const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

cmd({
    pattern: "url",
    alias: ["shorten", "tinyurl", "link"],
    desc: "Convert text to URL and shorten links",
    category: "utility",
    use: ".url <text or link>",
    react: "🔗",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide text or a URL!\nExample: .url https://example.com or .url example.com or .url search something");

        // Function to check if input is a URL
        function isUrl(string) {
            try {
                // Check if it has http/https or common domain patterns
                const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
                const hasDomain = /[a-zA-Z0-9]+\.[a-zA-Z]{2,}/.test(string);
                return urlPattern.test(string) || hasDomain;
            } catch {
                return false;
            }
        }

        // Function to extract URL from text if present
        function extractUrl(text) {
            const urlRegex = /(https?:\/\/[^\s]+)|([a-zA-Z0-9][a-zA-Z0-9-]{1,61}\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?[^\s]*)/g;
            const matches = text.match(urlRegex);
            return matches ? matches[0] : null;
        }

        let inputUrl = q.trim();
        let extractedUrl = extractUrl(q);
        let isUrlInput = isUrl(inputUrl);
        
        // Case 1: Input is already a URL
        if (isUrlInput || extractedUrl) {
            let urlToShorten = isUrlInput ? inputUrl : extractedUrl;
            
            // Ensure URL has protocol
            if (!urlToShorten.startsWith('http')) {
                urlToShorten = 'https://' + urlToShorten;
            }

            // Ask user preference
            const options = `📌 *URL Detected:* ${urlToShorten}\n\nChoose an option:\n1️⃣ Send Short URL\n2️⃣ Send Long URL\n3️⃣ Send Both\n\nReply with 1, 2, or 3 within 30 seconds.`;
            
            await reply(options);
            
            // Wait for user response
            const response = await new Promise((resolve) => {
                const timeout = setTimeout(() => resolve('timeout'), 30000);
                
                conn.ev.on('messages.upsert', async (msg) => {
                    const message = msg.messages[0];
                    if (message.key && message.key.remoteJid === from && !message.key.fromMe) {
                        const choice = message.message?.conversation || 
                                      message.message?.extendedTextMessage?.text || '';
                        if (['1', '2', '3'].includes(choice)) {
                            clearTimeout(timeout);
                            resolve(choice);
                        }
                    }
                });
            });

            if (response === 'timeout') {
                return reply("⏰ Timeout! No response received. Please try again.");
            }

            // Process based on choice
            if (response === '1' || response === '3') {
                try {
                    const shortenResponse = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlToShorten)}`);
                    const shortUrl = shortenResponse.data;
                    
                    if (shortUrl.includes("Error")) {
                        reply("❌ Failed to shorten URL. Try again.");
                    } else {
                        if (response === '1') {
                            reply(`✅ *Shortened URL:*\n${shortUrl}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
                        }
                    }
                } catch (e) {
                    reply(`❌ Error shortening URL: ${e.message}`);
                }
            }
            
            if (response === '2' || response === '3') {
                if (response === '2') {
                    reply(`✅ *Long URL:*\n${urlToShorten}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
                } else {
                    // For option 3, send long URL after short URL
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    reply(`✅ *Long URL:*\n${urlToShorten}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
                }
            }
        }
        // Case 2: Input is text without URL
        else {
            // Create a search URL from text
            const searchQuery = encodeURIComponent(inputUrl);
            const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
            
            const textOptions = `📝 *Text Detected:* "${inputUrl}"\n\nConverted to search URL:\n${searchUrl}\n\nChoose an option:\n1️⃣ Send Short URL\n2️⃣ Send Long URL\n3️⃣ Send Both\n\nReply with 1, 2, or 3 within 30 seconds.`;
            
            await reply(textOptions);
            
            // Wait for user response
            const response = await new Promise((resolve) => {
                const timeout = setTimeout(() => resolve('timeout'), 30000);
                
                conn.ev.on('messages.upsert', async (msg) => {
                    const message = msg.messages[0];
                    if (message.key && message.key.remoteJid === from && !message.key.fromMe) {
                        const choice = message.message?.conversation || 
                                      message.message?.extendedTextMessage?.text || '';
                        if (['1', '2', '3'].includes(choice)) {
                            clearTimeout(timeout);
                            resolve(choice);
                        }
                    }
                });
            });

            if (response === 'timeout') {
                return reply("⏰ Timeout! No response received. Please try again.");
            }

            // Process based on choice
            if (response === '1' || response === '3') {
                try {
                    const shortenResponse = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(searchUrl)}`);
                    const shortUrl = shortenResponse.data;
                    
                    if (shortUrl.includes("Error")) {
                        reply("❌ Failed to shorten URL. Try again.");
                    } else {
                        if (response === '1') {
                            reply(`✅ *Shortened URL:*\n${shortUrl}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
                        }
                    }
                } catch (e) {
                    reply(`❌ Error shortening URL: ${e.message}`);
                }
            }
            
            if (response === '2' || response === '3') {
                if (response === '2') {
                    reply(`✅ *Long URL:*\n${searchUrl}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
                } else {
                    // For option 3, send long URL after short URL
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    reply(`✅ *Long URL:*\n${searchUrl}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
                }
            }
        }

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
});
