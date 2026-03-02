const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const config = require('../config');

// File hosting service functions
async function uploadToCatbox(filePath) {
    try {
        const form = new FormData();
        form.append('fileToUpload', fs.createReadStream(filePath));
        form.append('reqtype', 'fileupload');
        
        const response = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        return response.data.trim();
    } catch (e) {
        throw new Error('Catbox upload failed');
    }
}

async function uploadToTmpFiles(filePath) {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        
        const response = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
            headers: form.getHeaders()
        });
        
        if (response.data && response.data.data && response.data.data.url) {
            return response.data.data.url;
        }
        throw new Error('Invalid response');
    } catch (e) {
        throw new Error('TmpFiles upload failed');
    }
}

async function uploadToFileIo(filePath) {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        
        const response = await axios.post('https://file.io', form, {
            headers: form.getHeaders()
        });
        
        if (response.data && response.data.success && response.data.link) {
            return response.data.link;
        }
        throw new Error('File.io upload failed');
    } catch (e) {
        throw new Error('File.io upload failed');
    }
}

// Main upload function with fallbacks
async function uploadFileToUrl(filePath, fileName) {
    const services = [
        { name: 'Catbox', func: uploadToCatbox },
        { name: 'TmpFiles', func: uploadToTmpFiles },
        { name: 'File.io', func: uploadToFileIo }
    ];
    
    let lastError = '';
    
    for (const service of services) {
        try {
            console.log(`Trying ${service.name}...`);
            const url = await service.func(filePath);
            if (url) return { success: true, url, service: service.name };
        } catch (error) {
            lastError = error.message;
            console.log(`${service.name} failed:`, error.message);
            continue;
        }
    }
    
    return { success: false, error: lastError };
}

// Function to detect message type
function getMessageType(message) {
    if (message.imageMessage) return 'image';
    if (message.videoMessage) return 'video';
    if (message.audioMessage) return 'audio';
    if (message.documentMessage) return 'document';
    if (message.stickerMessage) return 'sticker';
    if (message.conversation || message.extendedTextMessage) return 'text';
    return 'unknown';
}

cmd({
    pattern: "url",
    alias: ["shorten", "tinyurl", "link", "upload", "share"],
    desc: "Convert anything (text, images, videos, files) to URL",
    category: "utility",
    use: ".url <text> or reply to media",
    react: "🔗",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, isReply }) => {
    try {
        // Check if replying to a message
        if (isReply) {
            const replyMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (replyMessage) {
                const messageType = getMessageType(replyMessage);
                
                // Handle media files
                if (['image', 'video', 'audio', 'document', 'sticker'].includes(messageType)) {
                    // Show processing message
                    await reply(`📤 *Converting ${messageType} to URL...*\nPlease wait.`);
                    
                    // Download the media
                    let mediaBuffer;
                    let fileName = '';
                    
                    if (messageType === 'image') {
                        mediaBuffer = await conn.downloadMediaMessage({
                            key: { remoteJid: from },
                            message: replyMessage
                        }, 'buffer');
                        fileName = `image_${Date.now()}.jpg`;
                    } 
                    else if (messageType === 'video') {
                        mediaBuffer = await conn.downloadMediaMessage({
                            key: { remoteJid: from },
                            message: replyMessage
                        }, 'buffer');
                        fileName = `video_${Date.now()}.mp4`;
                    }
                    else if (messageType === 'audio') {
                        mediaBuffer = await conn.downloadMediaMessage({
                            key: { remoteJid: from },
                            message: replyMessage
                        }, 'buffer');
                        fileName = `audio_${Date.now()}.mp3`;
                    }
                    else if (messageType === 'document') {
                        mediaBuffer = await conn.downloadMediaMessage({
                            key: { remoteJid: from },
                            message: replyMessage
                        }, 'buffer');
                        fileName = replyMessage.documentMessage?.fileName || `document_${Date.now()}.bin`;
                    }
                    else if (messageType === 'sticker') {
                        mediaBuffer = await conn.downloadMediaMessage({
                            key: { remoteJid: from },
                            message: replyMessage
                        }, 'buffer');
                        fileName = `sticker_${Date.now()}.webp`;
                    }
                    
                    if (!mediaBuffer) {
                        return reply("❌ Failed to download media.");
                    }
                    
                    // Save temporary file
                    const tempPath = `/tmp/${fileName}`;
                    fs.writeFileSync(tempPath, mediaBuffer);
                    
                    // Upload to URL
                    const uploadResult = await uploadFileToUrl(tempPath, fileName);
                    
                    // Clean up temp file
                    fs.unlinkSync(tempPath);
                    
                    if (uploadResult.success) {
                        const mediaUrl = uploadResult.url;
                        
                        // Ask user preference
                        const options = `📌 *${messageType.toUpperCase()} Uploaded Successfully!*\n\nService: ${uploadResult.service}\nFile: ${fileName}\nSize: ${(mediaBuffer.length / 1024).toFixed(2)} KB\n\nChoose an option:\n1️⃣ Send Short URL\n2️⃣ Send Long URL\n3️⃣ Send Both\n\nReply with 1, 2, or 3 within 30 seconds.`;
                        
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
                            return reply(`✅ *Long URL (Timeout - No choice made):*\n${mediaUrl}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
                        }
                        
                        // Process based on choice
                        if (response === '1' || response === '3') {
                            try {
                                const shortenResponse = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(mediaUrl)}`);
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
                                reply(`✅ *Long URL:*\n${mediaUrl}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
                            } else {
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                reply(`✅ *Long URL:*\n${mediaUrl}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
                            }
                        }
                    } else {
                        reply(`❌ Failed to upload ${messageType}.\nError: ${uploadResult.error}`);
                    }
                    
                    return;
                }
            }
        }
        
        // Handle text input (if no media or with text)
        if (!q) {
            return reply(`❌ Please provide text or reply to media!\n\nExamples:\n• .url https://example.com\n• .url how to make pizza\n• Reply to an image with .url\n• Reply to a video with .url`);
        }
        
        // Function to check if input is a URL
        function isUrl(string) {
            try {
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
                return reply(`✅ *Long URL (Timeout - No choice made):*\n${urlToShorten}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
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
                return reply(`✅ *Long URL (Timeout - No choice made):*\n${searchUrl}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
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
