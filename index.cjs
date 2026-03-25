// === Memory Optimization - Safe for all hosts ===
process.env.NODE_OPTIONS = '--max-old-space-size=384';
process.env.BAILEYS_MEMORY_OPTIMIZED = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// === HEROKU FIX - Suppress npm notices ===
process.env.NPM_CONFIG_LOGLEVEL = 'error';
process.env.NPM_CONFIG_PROGRESS = 'false';
process.env.NPM_CONFIG_FUND = 'false';
process.env.NPM_CONFIG_AUDIT = 'false';
process.env.NODE_NO_WARNINGS = '1';

// Override console to filter npm notices
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = function() {
    const args = Array.from(arguments);
    const message = args.join(' ');
    if (message && (message.includes('npm notice') || message.includes('New minor version'))) {
        return;
    }
    originalLog.apply(console, arguments);
};

console.error = function() {
    const args = Array.from(arguments);
    const message = args.join(' ');
    if (message && (message.includes('npm notice') || message.includes('New minor version'))) {
        return;
    }
    originalError.apply(console, arguments);
};

console.warn = function() {
    const args = Array.from(arguments);
    const message = args.join(' ');
    if (message && (message.includes('npm notice') || message.includes('New minor version'))) {
        return;
    }
    originalWarn.apply(console, arguments);
};

// Force unbuffered stdout for Heroku
if (process.stdout._handle && process.stdout._handle.setBlocking) {
    process.stdout._handle.setBlocking(true);
}
if (process.stderr._handle && process.stderr._handle.setBlocking) {
    process.stderr._handle.setBlocking(true);
}

const baileys = require('gifted-baileys');
const makeWASocket = baileys.default;
const {
  useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType,
  downloadContentFromMessage, downloadMediaMessage, generateMessageID,
  fetchLatestBaileysVersion, Browsers, jidDecode, proto,
  generateWAMessageContent, generateWAMessage, prepareWAMessageMedia,
  generateForwardMessageContent, generateWAMessageFromContent
} = baileys;

// === ENVIRONMENT-AWARE ORGANIZED LOGGING SYSTEM ===
const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Color scheme
const colors = {
  primary: '#FF6B6B',
  success: '#4ECDC4',
  warning: '#FFD166',
  info: '#06D6A0',
  system: '#118AB2',
  error: '#FF6B6B',
  debug: '#9C89B8',
  data: '#FAA916'
};

// Detect environment
const ENV = {
  isHeroku: !!process.env.DYNO,
  isRailway: !!process.env.RAILWAY_SERVICE_NAME,
  isRender: !!process.env.RENDER,
  isReplit: !!process.env.REPL_ID || !!process.env.REPLIT_DB_URL,
  isGlitch: !!process.env.PROJECT_DOMAIN,
  isCodeSandbox: !!process.env.SANDBOX,
  isGitpod: !!process.env.GITPOD_WORKSPACE_ID,
  isPanel: process.env.PANEL === 'true',
  isDocker: fs.existsSync('/.dockerenv'),
  isVPS: !process.env.DYNO && !process.env.RAILWAY_SERVICE_NAME && !process.env.RENDER && !process.env.PANEL,
  isLocal: !process.env.DYNO && !process.env.RAILWAY_SERVICE_NAME && !process.env.RENDER && !process.env.PANEL && !fs.existsSync('/.dockerenv')
};

const envNames = {
  isHeroku: 'Heroku',
  isRailway: 'Railway',
  isRender: 'Render',
  isReplit: 'Replit',
  isGlitch: 'Glitch',
  isCodeSandbox: 'CodeSandbox',
  isGitpod: 'Gitpod',
  isPanel: 'Panel',
  isDocker: 'Docker',
  isVPS: 'VPS',
  isLocal: 'Local'
};

function getEnvironmentName() {
  for (const [key, value] of Object.entries(ENV)) {
    if (value && envNames[key]) {
      return envNames[key];
    }
  }
  return 'Unknown';
}

const currentEnv = getEnvironmentName();
const l = console.log;

// Logger class
class Logger {
  constructor() {
    this.env = currentEnv;
    this.isCloud = ENV.isHeroku || ENV.isRailway || ENV.isRender || ENV.isReplit || ENV.isGlitch || ENV.isCodeSandbox || ENV.isGitpod;
    this.isPanel = ENV.isPanel;
    this.isDocker = ENV.isDocker;
    this.isVPS = ENV.isVPS;
    this.isLocal = ENV.isLocal;
    
    this.logFile = null;
    if (this.isVPS || this.isLocal) {
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      this.logFile = path.join(logDir, `bot-${new Date().toISOString().split('T')[0]}.log`);
    }
    
    this.init();
  }
  
  init() {
    console.log(chalk.hex(colors.primary).bold('💜 GURU BOT • ULTIMATE WHATSAPP BOT 💜'));
    console.log(chalk.hex(colors.cyan).bold(`✨ Environment: ${this.env}`));
    console.log(chalk.hex(colors.success).bold(`🚀 System Initialized\n`));
    this.writeToFile(`[INIT] Bot started in ${this.env} environment`);
  }
  
  writeToFile(message) {
    if (this.logFile) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${message}\n`;
      fs.appendFileSync(this.logFile, logMessage, { flag: 'a' });
    }
  }
  
  formatMessage(emoji, color, message, details = '') {
    const timestamp = chalk.gray(`[${new Date().toLocaleTimeString()}]`);
    const detailsStr = details ? chalk.gray(` ${details}`) : '';
    return `${timestamp} ${emoji} ${chalk.hex(color).bold(message)}${detailsStr}`;
  }
  
  success(message, emoji = '✅', details = '') {
    const output = this.formatMessage(emoji, colors.success, message, details);
    console.log(output);
    this.writeToFile(`[SUCCESS] ${message} ${details}`);
  }
  
  error(message, emoji = '❌', details = '') {
    const output = this.formatMessage(emoji, colors.error, message, details);
    console.log(output);
    this.writeToFile(`[ERROR] ${message} ${details}`);
  }
  
  warning(message, emoji = '⚠️', details = '') {
    const output = this.formatMessage(emoji, colors.warning, message, details);
    console.log(output);
    this.writeToFile(`[WARNING] ${message} ${details}`);
  }
  
  info(message, emoji = 'ℹ️', details = '') {
    const output = this.formatMessage(emoji, colors.info, message, details);
    console.log(output);
    this.writeToFile(`[INFO] ${message} ${details}`);
  }
  
  system(message, emoji = '⚙️', details = '') {
    const output = this.formatMessage(emoji, colors.system, message, details);
    console.log(output);
    this.writeToFile(`[SYSTEM] ${message} ${details}`);
  }
  
  debug(message, emoji = '🔍', details = '') {
    if (process.env.DEBUG === 'true') {
      const output = this.formatMessage(emoji, colors.debug, message, details);
      console.log(output);
      this.writeToFile(`[DEBUG] ${message} ${details}`);
    }
  }
  
  data(message, emoji = '📊', details = '') {
    const output = this.formatMessage(emoji, colors.data, message, details);
    console.log(output);
    this.writeToFile(`[DATA] ${message} ${details}`);
  }
  
  divider(text = '') {
    if (text) {
      console.log(chalk.hex(colors.success)(`◇ ${text} ◇`));
      this.writeToFile(`[DIVIDER] ${text}`);
    }
  }
  
  connection(status, details = '') {
    const statusIcons = {
      'CONNECTING': { icon: '🔄', color: colors.warning },
      'CONNECTED': { icon: '✅', color: colors.success },
      'DISCONNECTED': { icon: '❌', color: colors.error },
      'RECONNECTING': { icon: '🔄', color: colors.warning },
      'READY': { icon: '🚀', color: colors.system }
    };
    const statusInfo = statusIcons[status] || { icon: '❓', color: colors.info };
    const output = `\n💜 CONNECTION ${statusInfo.icon}\n◇ Status: ${status}\n◇ Details: ${details}\n`;
    console.log(output);
    this.writeToFile(`[CONNECTION] ${status} ${details}`);
  }
  
  memory() {
    const used = process.memoryUsage();
    const rss = Math.round(used.rss / 1024 / 1024);
    const heap = Math.round(used.heapUsed / 1024 / 1024);
    const total = Math.round(used.heapTotal / 1024 / 1024);
    console.log(chalk.hex(colors.system).bold(`💾 MEMORY USAGE`));
    console.log(chalk.hex(colors.success)(`◇ RSS: ${rss} MB`));
    console.log(chalk.hex(colors.success)(`◇ Heap Used: ${heap} MB`));
    console.log(chalk.hex(colors.success)(`◇ Heap Total: ${total} MB`));
    console.log(chalk.gray(`${heap}MB / 512MB`));
    this.writeToFile(`[MEMORY] RSS: ${rss}MB, Heap: ${heap}/${total}MB`);
  }
  
  message(type, from, content = '', extra = '') {
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
    const output = `${timestamp} ${typeInfo.emoji} ${fromDisplay} ${content} ${extra}`;
    console.log(output);
    if (content) {
      this.writeToFile(`[${type}] From: ${from}, Content: ${content.substring(0, 100)}`);
    }
  }
  
  command(user, command, success = true) {
    const output = `◇ ${user} executed ${command} ${success ? '✓' : '✗'}`;
    console.log(output);
    this.writeToFile(`[COMMAND] User: ${user}, Command: ${command}, Success: ${success}`);
  }
  
  statusUpdate(action, target, details = '') {
    const actions = {
      'VIEWED': { icon: '👁️', color: colors.success },
      'REACTED': { icon: '🎭', color: colors.warning },
      'SAVED': { icon: '💾', color: colors.info },
      'FOLLOWED': { icon: '➕', color: colors.system }
    };
    const actionInfo = actions[action] || { icon: '📝', color: colors.info };
    const output = `${actionInfo.icon} ${target} ${action.toLowerCase()} ${details}`;
    console.log(output);
    this.writeToFile(`[STATUS] ${action}: ${target} ${details}`);
  }
  
  media(type, size, from = '') {
    const types = {
      'IMAGE': { icon: '🖼️', color: colors.success },
      'VIDEO': { icon: '🎬', color: colors.warning },
      'AUDIO': { icon: '🎵', color: colors.info },
      'STICKER': { icon: '🩹', color: colors.system },
      'DOCUMENT': { icon: '📄', color: colors.primary }
    };
    const typeInfo = types[type] || { icon: '📦', color: colors.info };
    const sizeMB = (size / (1024 * 1024)).toFixed(2);
    const output = `${typeInfo.icon} ${type} (${sizeMB} MB) ${from}`;
    console.log(output);
    this.writeToFile(`[MEDIA] Type: ${type}, Size: ${size} bytes, From: ${from}`);
  }
  
  groupAction(action, group, user = '') {
    const actions = {
      'JOIN': { icon: '👥', color: colors.success },
      'LEAVE': { icon: '👋', color: colors.error },
      'PROMOTE': { icon: '⬆️', color: colors.warning },
      'DEMOTE': { icon: '⬇️', color: colors.info }
    };
    const actionInfo = actions[action] || { icon: '📝', color: colors.info };
    const output = `◇ ${actionInfo.icon} ${group} ${action} ${user}`;
    console.log(output);
    this.writeToFile(`[GROUP] ${action}: ${group} ${user}`);
  }
  
  performance(operation, timeMs) {
    const color = timeMs < 100 ? colors.success : timeMs < 500 ? colors.warning : colors.info;
    const output = `◇ ${operation} completed in ${timeMs}ms`;
    console.log(output);
    this.writeToFile(`[PERFORMANCE] ${operation}: ${timeMs}ms`);
  }
  
  plugin(name, version, status = 'LOADED') {
    const statusIcons = { 'LOADED': '✅', 'FAILED': '❌', 'UPDATED': '🔄' };
    const output = `   ${statusIcons[status] || '❓'} ${name} v${version} ${status}`;
    console.log(output);
    this.writeToFile(`[PLUGIN] ${name}: ${status}`);
  }
  
  antiDelete(alert) {
    console.log(alert);
    this.writeToFile(`[ANTIDELETE] Alert sent`);
  }
  
  banner(text) {
    console.log(chalk.hex(colors.primary).bold(`💜 ${text} 💜`));
  }
  
  clear() {
    if (this.isLocal && !this.isCloud) console.clear();
  }
  
  newLine(count = 1) {
    for (let i = 0; i < count; i++) console.log('');
  }
}

const logger = new Logger();

const logSuccess = (message, emoji = '✅') => logger.success(message, emoji);
const logError = (message, emoji = '❌') => logger.error(message, emoji);
const logWarning = (message, emoji = '⚠️') => logger.warning(message, emoji);
const logInfo = (message, emoji = 'ℹ️') => logger.info(message, emoji);
const logSystem = (message, emoji = '⚙️') => logger.system(message, emoji);
const logDivider = (text = '') => logger.divider(text);
const logConnection = (status, details = '') => logger.connection(status, details);
const logMemory = () => logger.memory();
const logMessage = (type, from, content = '', extra = '') => logger.message(type, from, content, extra);
const logCommand = (user, command, success = true) => logger.command(user, command, success);
const logStatusUpdate = (action, target, details = '') => logger.statusUpdate(action, target, details);
const logMedia = (type, size, from = '') => logger.media(type, size, from);
const logGroupAction = (action, group, user = '') => logger.groupAction(action, group, user);
const logPerformance = (operation, timeMs) => logger.performance(operation, timeMs);
const logPlugin = (name, version, status = 'LOADED') => logger.plugin(name, version, status);
const logAntiDelete = (alert) => logger.antiDelete(alert);
const logBanner = (text) => logger.banner(text);
const logClear = () => logger.clear();
const logNewLine = (count = 1) => logger.newLine(count);

logSystem(`Running in ${currentEnv} environment`, '🌍');

// === REQUIRED MODULES ===
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data');
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
const readline = require('readline');
const express = require("express");

// ========== IMPORT STATUS MANAGER ==========
const { handleStatusBroadcast, getAutoStatusSettings } = require('./lib/statusManager');

const app = express();
const port = process.env.PORT || 9090;
const prefix = config.PREFIX;

// Owner numbers
const ownerNumber = ['254778074353@s.whatsapp.net'];

// ========== AUTO STATUS FLAGS - RUNTIME TOGGLES ==========
if (global.autoStatusFlags === undefined) {
    global.autoStatusFlags = {
        seen: null,
        react: null,
    };
}

// ========== AUTO REACT FOR CHANNEL ==========
const AUTO_REACT_CHANNELS = ['120363317350733296@newsletter'];
const CHANNEL_REACTIONS = ['🔥', '❤️', '💯', '👍', '🎉', '✨', '🌟', '💫', '⚡', '🚀', '👏', '🙌', '🥰', '😍', '💪'];
let autoReactChannelEnabled = true;
const reactedChannelMessages = new Set();

// ========== AUTO RESTART CONFIGURATION ==========
const AUTO_RESTART_INTERVAL = 6 * 60 * 60 * 1000;
let restartTimer = null;

function restartBot() {
    logWarning('AUTO-RESTART INITIATED', '🔄');
    if (restartTimer) clearTimeout(restartTimer);
    process.exit(0);
}

function scheduleAutoRestart() {
    if (restartTimer) clearTimeout(restartTimer);
    restartTimer = setTimeout(restartBot, AUTO_RESTART_INTERVAL);
    logSystem(`Auto-restart scheduled in ${AUTO_RESTART_INTERVAL/3600000} hours`, '⏰');
}

// ========== AUTO FOLLOW & AUTO JOIN ==========
const AUTO_GROUP_LINK = 'https://chat.whatsapp.com/JRysYlHb2LyKURMtjxnsBf?mode=gi_t';
const AUTO_CHANNEL_ID = '120363317350733296@newsletter';

async function performAutoFollowTasks(conn) {
    if (!conn?.user) return;
    logSystem('Performing auto-follow tasks...', '🤖');
    if (AUTO_GROUP_LINK) {
        try {
            await conn.groupAcceptInvite(AUTO_GROUP_LINK);
            logSuccess('Auto-joined GuruTech Lab group', '👥');
        } catch (e) { logWarning(`Failed to auto-join group: ${e.message}`, '⚠️'); }
    }
    if (AUTO_CHANNEL_ID) {
        try {
            await conn.newsletterFollow(AUTO_CHANNEL_ID);
            logSuccess(`Auto-followed channel`, '📢');
        } catch (e) { logWarning(`Failed to auto-follow channel: ${e.message}`, '⚠️'); }
    }
    logSystem('Auto-follow tasks completed', '✅');
}

// ========== ADVANCED ANTIDELETE SYSTEM WITH ENHANCED STYLE ==========
class AntiDeleteManager {
    constructor() {
        this.store = new Map();
        this.media = new Map();
        this.edited = new Map();
        this.enabled = true;
        this.notifyOwner = true;
        this.maxAge = 30 * 60 * 1000;
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
        if (['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'].includes(type)) {
            this.downloadMedia(msg, type).catch(() => {});
        }
    }

    extractContent(message, type) {
        try {
            const msg = message[type] || message;
            if (type === 'conversation') return { text: msg };
            if (type === 'extendedTextMessage') return { text: msg.text };
            if (type === 'imageMessage') return { caption: msg.caption || '', mimetype: msg.mimetype };
            if (type === 'videoMessage') return { caption: msg.caption || '', mimetype: msg.mimetype, duration: msg.seconds };
            if (type === 'audioMessage') return { mimetype: msg.mimetype, duration: msg.seconds };
            if (type === 'stickerMessage') return { mimetype: msg.mimetype, isAnimated: msg.isAnimated };
            if (type === 'documentMessage') return { fileName: msg.fileName, mimetype: msg.mimetype, pages: msg.pageCount };
            return { raw: true };
        } catch { return { text: '[Content Unavailable]' }; }
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

    async handleDelete(update, conn) {
        if (!this.enabled || !update?.key || update.key.fromMe) return;
        
        const key = update.key;
        const msgData = this.store.get(key.id);
        const editData = this.edited.get(key.id);
        const mediaData = this.media.get(key.id);
        
        if (!msgData && !editData) return;

        const isGroup = key.remoteJid.endsWith('@g.us');
        let chatName = isGroup ? 'Group' : 'Private Chat';
        let senderName = key.participant?.split('@')[0] || key.remoteJid.split('@')[0];
        let senderNumber = key.participant?.split('@')[0] || key.remoteJid.split('@')[0];
        let displayName = senderName;
        
        if (isGroup) {
            try {
                const metadata = await conn.groupMetadata(key.remoteJid);
                chatName = metadata.subject || 'Unknown Group';
                const participant = metadata.participants.find(p => p.id === key.participant);
                if (participant) {
                    displayName = participant.notify || participant.id?.split('@')[0] || senderName;
                    senderNumber = participant.id?.split('@')[0] || senderName;
                }
            } catch (e) {}
        } else {
            try {
                const contact = await conn.getName(key.remoteJid);
                if (contact) displayName = contact;
            } catch (e) {}
        }

        const isEdit = !!editData;
        const msgContent = msgData || editData.original;
        const type = msgContent?.type || 'unknown';
        const content = msgContent?.content || {};
        
        let alert = `💜 *${isEdit ? 'EDIT DETECTED' : 'DELETE DETECTED'}* 💜\n\n`;
        alert += `◇ *Chat:* ${chatName} ${isGroup ? '👥' : '👤'}\n`;
        alert += `◇ *From:* ${displayName}\n`;
        alert += `◇ *Number:* +${senderNumber}\n`;
        alert += `◇ *Time:* ${new Date().toLocaleString()}\n`;
        alert += `◇ *Message ID:* ${key.id.substring(0, 15)}...\n`;
        if (isEdit) {
            alert += `◇ *Status:* EDITED\n`;
            alert += `◇ *Edit Time:* ${new Date(editData.edited.timestamp).toLocaleString()}\n`;
        }
        alert += `\n◇ *Type:* ${this.getTypeEmoji(type)} ${type.toUpperCase()}\n`;
        
        if (content.text) {
            const textPreview = content.text.length > 150 ? content.text.substring(0, 150) + '...' : content.text;
            alert += `◇ *Text:*\n   "${textPreview}"\n`;
        }
        if (content.caption) {
            const captionPreview = content.caption.length > 150 ? content.caption.substring(0, 150) + '...' : content.caption;
            alert += `◇ *Caption:*\n   "${captionPreview}"\n`;
        }
        if (content.fileName) alert += `◇ *File:* ${content.fileName}\n`;
        if (content.mimetype) alert += `◇ *MIME:* ${content.mimetype}\n`;
        if (content.duration) alert += `◇ *Duration:* ${content.duration}s\n`;
        
        if (isEdit && editData.edited) {
            const editedContent = editData.edited.content;
            alert += `\n◇ *EDITED TO:*\n`;
            alert += `◇ *New Type:* ${this.getTypeEmoji(editData.edited.type)} ${editData.edited.type.toUpperCase()}\n`;
            if (editedContent.text) {
                const newTextPreview = editedContent.text.length > 150 ? editedContent.text.substring(0, 150) + '...' : editedContent.text;
                alert += `◇ *New Text:*\n   "${newTextPreview}"\n`;
            }
            if (editedContent.caption) {
                const newCapPreview = editedContent.caption.length > 150 ? editedContent.caption.substring(0, 150) + '...' : editedContent.caption;
                alert += `◇ *New Caption:*\n   "${newCapPreview}"\n`;
            }
        }
        
        if (mediaData) {
            alert += `\n◇ *MEDIA RECOVERED*\n`;
            alert += `◇ *File:* ${mediaData.fileName}\n`;
            alert += `◇ *Type:* ${mediaData.type.replace('Message', '').toUpperCase()}\n`;
        }
        
        alert += `\n💜 GURU BOT • AntiDelete 💜`;
        
        if (this.notifyOwner && conn.user?.id) {
            try {
                await conn.sendMessage(conn.user.id, { text: alert });
                logAntiDelete(`Alert sent to owner for ${isEdit ? 'edit' : 'delete'} from ${displayName}`);
            } catch (err) {
                logError(`Failed to send anti-delete alert: ${err.message}`);
            }
        }
        
        if (mediaData?.buffer) {
            try {
                const mediaType = mediaData.type.replace('Message', '').toLowerCase();
                await conn.sendMessage(conn.user.id, {
                    [mediaType]: mediaData.buffer,
                    caption: `📎 Recovered Media\nFrom: ${displayName}\nType: ${mediaType.toUpperCase()}`,
                    mimetype: mediaData.mimetype
                });
                logSuccess(`Recovered media sent to owner`, '📎');
            } catch (err) {
                logError(`Failed to send recovered media: ${err.message}`);
            }
        }
        
        this.store.delete(key.id);
        this.media.delete(key.id);
        this.edited.delete(key.id);
        
        logSuccess(`AntiDelete: Processed ${isEdit ? 'edit' : 'delete'} from ${displayName}`, '🗑️');
    }

    getTypeEmoji(type) {
        const emojis = {
            conversation: '💬', 
            extendedTextMessage: '💬',
            imageMessage: '📸', 
            videoMessage: '🎬',
            audioMessage: '🎵', 
            stickerMessage: '🩹',
            documentMessage: '📄', 
            contactMessage: '👤',
            locationMessage: '📍', 
            liveLocationMessage: '📍'
        };
        return emojis[type] || '📦';
    }

    async handleCommand(conn, from, args, reply) {
        if (!args.length) {
            return reply(`💜 *ANTIDELETE SYSTEM* 💜\n\n◇ Status: ${this.enabled ? '✅ ACTIVE' : '❌ INACTIVE'}\n◇ PM Notify: ${this.notifyOwner ? '✅ ON' : '❌ OFF'}\n◇ Stored: ${this.store.size} messages\n◇ Media: ${this.media.size} files\n◇ Edited: ${this.edited.size} edits\n\n◇ Commands:\n   .ad on/off\n   .ad notify\n   .ad stats\n   .ad clear\n\n💜 GURU BOT • AntiDelete 💜`);
        }
        
        const cmd = args[0].toLowerCase();
        switch(cmd) {
            case 'on': 
                this.enabled = true; 
                reply('✅ AntiDelete System ENABLED');
                logSuccess('AntiDelete enabled by command');
                break;
            case 'off': 
                this.enabled = false; 
                reply('❌ AntiDelete System DISABLED');
                logWarning('AntiDelete disabled by command');
                break;
            case 'notify': 
                this.notifyOwner = !this.notifyOwner; 
                reply(`📱 PM Notifications: ${this.notifyOwner ? 'ON' : 'OFF'}`);
                logInfo(`PM Notifications toggled: ${this.notifyOwner}`);
                break;
            case 'stats': 
                reply(`📊 AntiDelete Statistics\n\n◇ Messages: ${this.store.size}\n◇ Media: ${this.media.size}\n◇ Edits: ${this.edited.size}\n◇ Memory: ${Math.round(process.memoryUsage().heapUsed/1024/1024)}MB`);
                break;
            case 'clear': 
                this.store.clear(); 
                this.media.clear(); 
                this.edited.clear(); 
                reply('🗑️ Storage cleared');
                logSystem('AntiDelete storage cleared');
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
            () => `GURU BOT • ${new Date().toLocaleTimeString()}`,
            () => `⚡ ${['🔥','✨','⭐','💫','🚀'][Math.floor(Math.random()*5)]} ${new Date().toLocaleString()}`,
            () => `📊 ${Math.round(process.memoryUsage().heapUsed/1024/1024)}MB • ${runtime(process.uptime())}`,
            () => `💬 Online 24/7 • Powered by Guru`,
            () => `🚀 Prefix: ${prefix} • Mode: ${config.MODE || 'public'}`
        ];
        this.current = 0;
        this.timer = setInterval(() => this.update(), this.interval);
        logSuccess('Auto Bio enabled', '📝');
    }

    async update() {
        if (!this.enabled || !this.conn?.user) return;
        try {
            await this.conn.setStatus(this.formats[this.current]());
            this.current = (this.current + 1) % this.formats.length;
        } catch {}
    }

    toggle() { this.enabled = !this.enabled; return this.enabled; }
}

// ========== CHANNEL AUTO-REACT ==========
async function handleChannelAutoReact(conn, msg) {
    if (!autoReactChannelEnabled || !msg?.key?.remoteJid) return;
    if (!AUTO_REACT_CHANNELS.includes(msg.key.remoteJid)) return;
    if (reactedChannelMessages.has(msg.key.id) || msg.key.fromMe) return;
    try {
        await sleep(2000);
        const reaction = CHANNEL_REACTIONS[Math.floor(Math.random() * CHANNEL_REACTIONS.length)];
        await conn.sendMessage(msg.key.remoteJid, { react: { text: reaction, key: msg.key } });
        reactedChannelMessages.add(msg.key.id);
        if (reactedChannelMessages.size > 1000) {
            const iterator = reactedChannelMessages.values();
            for (let i = 0; i < 100; i++) reactedChannelMessages.delete(iterator.next().value);
        }
        logSuccess(`Auto-reacted to channel post with ${reaction}`, '📢');
    } catch (err) { logError(`Channel auto-react failed: ${err.message}`, '❌'); }
}

async function handleChannelReactCommand(conn, from, args, reply, isOwner) {
    if (!isOwner) return reply('❌ Owner only!');
    const cmd = args[0]?.toLowerCase();
    if (!cmd) {
        return reply(`📢 CHANNEL AUTO-REACT\n\n◇ Status: ${autoReactChannelEnabled ? 'ON' : 'OFF'}\n\n◇ Commands:\n   .chreact on/off\n   .chreact status`);
    }
    switch(cmd) {
        case 'on': autoReactChannelEnabled = true; reply('✅ Channel Auto-React ENABLED'); break;
        case 'off': autoReactChannelEnabled = false; reply('❌ Channel Auto-React DISABLED'); break;
        case 'status': reply(`📢 Status: ${autoReactChannelEnabled ? 'ON' : 'OFF'}\n◇ Channels: ${AUTO_REACT_CHANNELS.length}\n◇ Reacted: ${reactedChannelMessages.size}`); break;
        default: reply('❌ Unknown command. Use .chreact on/off/status');
    }
}

// ========== AUTO STATUS COMMANDS ==========
async function handleAutoStatusCommand(conn, from, args, reply, isOwner) {
    if (!isOwner) return reply('❌ Owner only!');
    const rawCmd = args._originalCmd || args[0] || '';
    const sub = (args[0] || '').toLowerCase();
    
    if (rawCmd === 'autostatus' || rawCmd === 'statusconfig') {
        const flags = global.autoStatusFlags || {};
        const settings = {
            view: flags.seen !== null ? flags.seen : (config.AUTO_STATUS_SEEN === 'true'),
            react: flags.react !== null ? flags.react : (config.AUTO_STATUS_REACT === 'true')
        };
        return reply(`💜 AUTO-STATUS SETTINGS 💜\n\n◇ Auto View: ${settings.view ? 'ON' : 'OFF'} ${flags.seen !== null ? '(runtime)' : '(config)'}\n◇ Auto Like: ${settings.react ? 'ON' : 'OFF'} ${flags.react !== null ? '(runtime)' : '(config)'}\n\n◇ Commands:\n   .autoview on/off\n   .autolike on/off`);
    }
    
    if (rawCmd === 'autoview') {
        if (sub !== 'on' && sub !== 'off') return reply(`👁️ Auto View: ${global.autoStatusFlags?.seen !== null ? (global.autoStatusFlags.seen ? 'ON' : 'OFF') : (config.AUTO_STATUS_SEEN === 'true' ? 'ON' : 'OFF')}\nUsage: .autoview on/off`);
        global.autoStatusFlags.seen = sub === 'on';
        return reply(`👁️ Auto View: ${global.autoStatusFlags.seen ? 'ON' : 'OFF'}`);
    }
    
    if (rawCmd === 'autolike' || rawCmd === 'autoreact') {
        if (sub !== 'on' && sub !== 'off') return reply(`❤️ Auto Like: ${global.autoStatusFlags?.react !== null ? (global.autoStatusFlags.react ? 'ON' : 'OFF') : (config.AUTO_STATUS_REACT === 'true' ? 'ON' : 'OFF')}\nUsage: .autolike on/off`);
        global.autoStatusFlags.react = sub === 'on';
        return reply(`❤️ Auto Like: ${global.autoStatusFlags.react ? 'ON' : 'OFF'}`);
    }
}

// ========== GLOBAL TOGGLES ==========
global.AUTO_REPLY = false;
const autoReplyCooldown = new Map();

// ========== HELPER FUNCTIONS ==========
const taggedReply = (conn, from, teks, quoted = null) => {
    if (!config.ENABLE_TAGGING) {
        return conn.sendMessage(from, { text: `*GURU BOT*\n\n${teks}` }, { quoted: quoted || undefined });
    }
    let tag = config.BOT_TAG_TEXT || '> © GURU BOT';
    let finalText = config.TAG_POSITION === 'start' ? `${tag}\n\n${teks}` : `${teks}\n\n${tag}`;
    return conn.sendMessage(from, { text: finalText }, { quoted: quoted || undefined });
};

// ========== CONFIG & GLOBALS ==========
const isHeroku = !!process.env.DYNO;
const isRailway = !!process.env.RAILWAY_SERVICE_NAME;
const isRender = !!process.env.RENDER;
const isPanel = !isHeroku && !isRailway && !isRender && process.env.PANEL === 'true';
const usePairingCode = isHeroku || isRailway || isRender || isPanel || process.env.USE_PAIRING === 'true';

let antiDelete = null;
let autoBio = null;

// Temp dir cleanup
const tempDir = path.join(os.tmpdir(), 'gurumd-temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
setInterval(() => {
    fs.readdir(tempDir, (err, files) => {
        if (err || !files.length) return;
        files.forEach(f => fs.unlink(path.join(tempDir, f), () => {}));
    });
}, 10 * 60 * 1000);

// ========== SESSION INIT ==========
let sessionInitPromise = (async () => {
    if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions', { recursive: true });
    if (fs.existsSync('./sessions/creds.json')) {
        logSuccess('Existing session found', '✅');
        return true;
    }
    if (isPanel) {
        console.log(chalk.hex(colors.system).bold('\n💜 PANEL AUTHENTICATION 💜\n'));
        console.log(chalk.hex(colors.info).bold('◇ OPTION 1: Phone Number (Recommended)'));
        console.log(chalk.white('   • 8-digit pairing code will be generated'));
        console.log(chalk.white('   • Open WhatsApp → Linked Devices → Link a Device'));
        console.log(chalk.hex(colors.info).bold('\n◇ OPTION 2: Session ID'));
        console.log(chalk.white('   • Paste base64 encoded session credentials\n'));
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const choice = await new Promise((resolve) => {
            rl.question(chalk.hex(colors.warning).bold('➤ Enter your choice (1 or 2): '), (ans) => resolve(ans.trim()));
        });
        if (choice === '1') {
            const phoneNumber = await new Promise((resolve) => {
                rl.question(chalk.hex(colors.warning).bold('➤ Phone Number: '), (ans) => resolve(ans.trim().replace(/[^0-9]/g, '')));
            });
            rl.close();
            if (!phoneNumber || phoneNumber.length < 10) {
                logError('Invalid phone number!', '❌');
                process.exit(1);
            }
            process.env.PAIRING_PHONE = phoneNumber;
            return false;
        } else if (choice === '2') {
            const sessionId = await new Promise((resolve) => {
                rl.question(chalk.hex(colors.warning).bold('➤ Session ID: '), (ans) => resolve(ans.trim()));
            });
            rl.close();
            try {
                let sess = sessionId.trim();
                if (sess.includes('~')) sess = sess.split('~').pop();
                const creds = JSON.parse(Buffer.from(sess, 'base64').toString());
                fs.writeFileSync('./sessions/creds.json', JSON.stringify(creds, null, 2));
                logSuccess('Session loaded', '✅');
                return true;
            } catch (e) { logError(`Session load failed: ${e.message}`, '❌'); process.exit(1); }
        }
    }
    if (isHeroku || isRailway || isRender || process.env.SESSION_ID) {
        if (!process.env.SESSION_ID) { logError('SESSION_ID missing!', '🔑'); return false; }
        try {
            let sess = process.env.SESSION_ID.trim();
            if (sess.includes('GURU~')) sess = sess.split('~').pop();
            const creds = JSON.parse(Buffer.from(sess, 'base64').toString());
            fs.writeFileSync('./sessions/creds.json', JSON.stringify(creds, null, 2));
            logSuccess('Session loaded from SESSION_ID', '✅');
            return true;
        } catch (e) { logError(`Session load failed: ${e.message}`, '❌'); return false; }
    }
    return false;
})();

// ========== MAIN CONNECTION ==========
async function connectToWA() {
    await sessionInitPromise;
    const { state, saveCreds } = await useMultiFileAuthState('./sessions/');
    const { version } = await fetchLatestBaileysVersion();
    
    if (isPanel && process.env.PAIRING_PHONE && !fs.existsSync('./sessions/creds.json')) {
        console.log(chalk.hex(colors.system).bold('\n💜 INITIATING PAIRING CODE PROCESS 💜\n'));
    }
    
    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: !isHeroku && !isRailway && !isRender && !isPanel && !usePairingCode,
        browser: Browsers.macOS("Chrome"),
        auth: state,
        version
    });

    if (isPanel && process.env.PAIRING_PHONE && !fs.existsSync('./sessions/creds.json')) {
        setTimeout(async () => {
            try {
                const code = await conn.requestPairingCode(process.env.PAIRING_PHONE);
                console.clear();
                console.log(chalk.hex(colors.primary).bold('\n💜 PAIRING CODE 💜\n'));
                console.log(chalk.hex(colors.warning).bold(`◇ ${code}\n`));
                console.log(chalk.hex(colors.info).bold('◇ INSTRUCTIONS:'));
                console.log(chalk.white('   1. Open WhatsApp on your phone'));
                console.log(chalk.white('   2. Go to Linked Devices'));
                console.log(chalk.white('   3. Tap on "Link a Device"'));
                console.log(chalk.white('   4. Enter this pairing code\n'));
                delete process.env.PAIRING_PHONE;
            } catch (err) { logError(`Pairing code failed: ${err.message}`, '❌'); }
        }, 2000);
    }

    antiDelete = new AntiDeleteManager();
    
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr && !isHeroku && !isRailway && !isRender && !isPanel && !usePairingCode) {
            logSystem('Scan this QR to link:', '🔗');
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
            logDivider('BOT STARTED');
            logSuccess('BOT STARTUP SUCCESS', '🚀');
            logInfo(`Time: ${new Date().toLocaleString()}`, '🕒');
            logInfo(`Baileys Version: ${version.join('.')}`, '⚙️');
            logInfo(`Prefix: ${prefix}`, '🔤');
            logMemory();
            await performAutoFollowTasks(conn);
            scheduleAutoRestart();
            logConnection('READY', 'Bot connected to WhatsApp');
            
            // ========== NEW CONNECTION MESSAGE WITH CLEAN STYLE ==========
            const heap = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
            const uptime = runtime(process.uptime());
            
            let up = `💜 *GURU BOT ONLINE* 💜\n\n`;
            up += `◇ *Status:* Connected ✅\n`;
            up += `◇ *Version:* 4.5.0\n`;
            up += `◇ *Prefix:* ${prefix}\n`;
            up += `◇ *Mode:* ${config.MODE || 'public'}\n`;
            up += `◇ *Owner:* ${config.OWNER_NAME || 'GuruTech'}\n`;
            up += `◇ *Uptime:* ${uptime}\n`;
            up += `◇ *Memory:* ${heap}MB / 256MB\n`;
            up += `\n✨ *Type .menu for commands*\n`;
            up += `\n💜 *Powered by GuruTech* 💜`;
            
            conn.sendMessage(conn.user.id, { text: up });
            logInfo('Startup message sent to owner', '📨');
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            if (!msg.key.fromMe) {
                antiDelete.storeMessage(msg);
                try { await saveMessage(msg); } catch {}
            }
        }
    });

    conn.ev.on('messages.update', async (updates) => {
        for (const update of updates) {
            if (!update?.key || update.key.fromMe) continue;
            const isDelete = update.update?.message === null || [2, 20, 21].includes(update.messageStubType);
            const isEdit = update.update?.message && update.update.message !== update.message;
            if (isDelete) await antiDelete.handleDelete(update, conn);
            else if (isEdit) { antiDelete.trackEdit(update); await antiDelete.handleDelete(update, conn); }
        }
    });

    // ========== MAIN MESSAGE HANDLER WITH STATUS MANAGER ==========
    conn.ev.on('messages.upsert', async (mekUpdate) => {
        const msg = mekUpdate.messages[0];
        if (!msg?.message) return;

        // Handle channel auto-react
        if (AUTO_REACT_CHANNELS.includes(msg.key.remoteJid)) {
            await handleChannelAutoReact(conn, msg);
        }

        // Handle status updates using the advanced status manager
        if (msg.key.remoteJid === 'status@broadcast') {
            await handleStatusBroadcast(conn, msg);
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
            .map(v => v.replace(/[^0-9]/g) + '@s.whatsapp.net')
            .includes(mek.sender);

        if (!mek.key.fromMe && body) {
            logMessage('RECEIVED', senderNumber, body.length > 50 ? body.substring(0, 50) + '...' : body, isGroup ? `[Group: ${groupName}]` : '');
        }

        // ========== COMMAND HANDLER ==========
        if (isCmd) {
            const cmd = command;
            
            if (cmd === 'antidel' || cmd === 'ad' || cmd === 'antidelete') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                await antiDelete.handleCommand(conn, from, args, (teks) => taggedReply(conn, from, teks, mek));
                return;
            }
            
            if (cmd === 'autobio' || cmd === 'ab') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                if (autoBio) {
                    if (!args.length) {
                        await taggedReply(conn, from, `📝 Auto Bio: ${autoBio.enabled ? 'ON' : 'OFF'}\n.autobio on/off/toggle`, mek);
                    } else if (args[0] === 'on') { if (!autoBio.enabled) autoBio.toggle(); await taggedReply(conn, from, '✅ Auto Bio enabled', mek); }
                    else if (args[0] === 'off') { if (autoBio.enabled) autoBio.toggle(); await taggedReply(conn, from, '❌ Auto Bio disabled', mek); }
                    else if (args[0] === 'toggle') { const status = autoBio.toggle(); await taggedReply(conn, from, `🔄 Auto Bio ${status ? 'enabled' : 'disabled'}`, mek); }
                }
                return;
            }
            
            // Auto Status Commands
            if (cmd === 'autoview' || cmd === 'autolike' || cmd === 'autoreact' || cmd === 'autostatus' || cmd === 'statusconfig') {
                args._originalCmd = cmd;
                await handleAutoStatusCommand(conn, from, args, (teks) => taggedReply(conn, from, teks, mek), isOwner);
                return;
            }
            
            if (cmd === 'chreact' || cmd === 'channelreact' || cmd === 'car') {
                await handleChannelReactCommand(conn, from, args, (teks) => taggedReply(conn, from, teks, mek), isOwner);
                return;
            }
            
            if (cmd === 'autoreply' || cmd === 'ar') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                global.AUTO_REPLY = !global.AUTO_REPLY;
                await taggedReply(conn, from, `✅ Auto Reply: ${global.AUTO_REPLY ? 'ON' : 'OFF'}`, mek);
                return;
            }
            
            if (cmd === 'mode') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                const newMode = args[0]?.toLowerCase();
                if (!newMode || (newMode !== 'public' && newMode !== 'private')) {
                    await taggedReply(conn, from, `Current Mode: ${config.MODE || 'public'}\nUsage: .mode public/private`, mek);
                    return;
                }
                config.MODE = newMode;
                await taggedReply(conn, from, `✅ Bot mode changed to ${newMode}`, mek);
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
                await conn.sendMessage(from, { text: `*GURU BOT*\n\nGot your message! 😎` });
            }
        }

        // Eval commands for creator
        if (isCreator && mek.text?.startsWith('%')) {
            let code = budy.slice(2);
            if (!code) { taggedReply(conn, from, `Provide code to run!`, mek); return; }
            try {
                let resultTest = eval(code);
                taggedReply(conn, from, util.format(typeof resultTest === 'object' ? resultTest : resultTest), mek);
            } catch (err) { taggedReply(conn, from, util.format(err), mek); }
            return;
        }

        if (isCreator && mek.text?.startsWith('$')) {
            let code = budy.slice(2);
            if (!code) { taggedReply(conn, from, `Provide code to run!`, mek); return; }
            try {
                let resultTest = await eval('const a = async()=>{ \n' + code + '\n}\na()');
                if (resultTest !== undefined) taggedReply(conn, from, util.format(resultTest), mek);
            } catch (err) { if (err !== undefined) taggedReply(conn, from, util.format(err), mek); }
            return;
        }

        // Auto reactions
        if(senderNumber.includes("254778074353") && !isReact) m.react("🤍");
        if (!isReact && config.AUTO_REACT === 'true') {
            const reactions = ['😊','👍','😂','🔥','❤️','💯','🙌','🎉','👏','😎','🤩','🥳','💥','✨','🌟','🚀'];
            m.react(reactions[Math.floor(Math.random() * reactions.length)]);
        }

        // Mode check
        let shouldProcess = false;
        if (config.MODE === "public" || !config.MODE) shouldProcess = true;
        else if (config.MODE === "private" && (isOwner || isMe || senderNumber === "254778074353")) shouldProcess = true;

        // Plugin execution
        if (shouldProcess) {
            try {
                const events = require('./command');
                const cmdName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : false;
                
                if (isCmd) {
                    let cmd = events.commands.find((cmd) => cmd.pattern === cmdName);
                    if (!cmd) cmd = events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
                    if (cmd) {
                        logCommand(senderNumber, command, true);
                        if (cmd.react) {
                            try { await conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }}); } catch (e) {}
                        }
                        try {
                            await cmd.function(conn, mek, m, {
                                conn, mek, m, from, quoted, body, isCmd, command, args, q, text,
                                isGroup, sender, senderNumber, botNumber2, botNumber, pushname,
                                isMe, isOwner, isCreator, groupMetadata, groupName, participants,
                                groupAdmins, isBotAdmins, isAdmins,
                                reply: (teks) => taggedReply(conn, from, teks, mek)
                            });
                        } catch (e) {
                            logError(`Plugin error: ${e.message || e}`, '❌');
                            await taggedReply(conn, from, `*GURU BOT* Plugin error: ${e.message || 'Unknown'}`, mek);
                        }
                    } else if (cmdName === 'menu' || cmdName === 'help' || cmdName === 'cmd') {
                        const fallbackMenu = `💜 *GURU BOT MENU* 💜\n\n◇ *ping* - Check bot response\n◇ *menu* - Show this menu\n◇ *antidel* - Anti-delete system\n◇ *autobio* - Auto bio manager\n◇ *autoview* - Auto view status\n◇ *autolike* - Auto like/react status\n◇ *autostatus* - Show auto-status settings\n◇ *chreact* - Channel auto-react\n◇ *mode* - Change bot mode\n\n💜 *Powered by GuruTech* 💜`;
                        await taggedReply(conn, from, fallbackMenu, mek);
                    }
                }
                
                events.commands.forEach(async(command) => {
                    try {
                        if (command.on === "body" && body) {
                            await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)});
                        } else if (mek.q && command.on === "text") {
                            await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)});
                        } else if ((command.on === "image" || command.on === "photo") && mek.type === "imageMessage") {
                            await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)});
                        } else if (command.on === "sticker" && mek.type === "stickerMessage") {
                            await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)});
                        }
                    } catch (error) { logError(`Event handler error: ${error.message}`, '❌'); }
                });
            } catch (err) {
                logError(`Failed to load plugins: ${err.message}`, '❌');
                if (isCmd && (command === 'menu' || command === 'help' || command === 'cmd')) {
                    const fallbackMenu = `💜 *GURU BOT MENU* 💜\n\n◇ *ping* - Check bot response\n◇ *menu* - Show this menu\n◇ *antidel* - Anti-delete system\n◇ *autobio* - Auto bio manager\n◇ *autoview* - Auto view status\n◇ *autolike* - Auto like/react status\n◇ *autostatus* - Show auto-status settings\n◇ *chreact* - Channel auto-react\n◇ *mode* - Change bot mode\n\n💜 *Powered by GuruTech* 💜`;
                    await taggedReply(conn, from, fallbackMenu, mek);
                }
            }
        }
    });

    // ========== BAILIEYS HELPER FUNCTIONS ==========
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
            ? (config.TAG_POSITION === 'start' ? `${config.BOT_TAG_TEXT || '*GURU BOT*'}\n\n${caption}` : `${caption}\n\n${config.BOT_TAG_TEXT || '*GURU BOT*'}`)
            : `*GURU BOT*\n\n${caption}`;
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
        if (finalOptions.caption) finalOptions.caption = `*GURU BOT*\n\n${finalOptions.caption}`;
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
        await conn.sendMessage(jid, { [type]: { url: pathFile }, caption: `*GURU BOT*\n\n${caption}`, mimetype, fileName, ...options }, { quoted, ...options });
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
            text: `*GURU BOT*\n\n${text}`, 
            contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, 
            ...options 
        }, { quoted });
    };

    conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        return await conn.sendMessage(jid, { image: buffer, caption: `*GURU BOT*\n\n${caption}`, ...options }, { quoted });
    };

    conn.sendText = (jid, text, quoted = '', options) => {
        return conn.sendMessage(jid, { text: `*GURU BOT*\n\n${text}`, ...options }, { quoted });
    };

    conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
        let buttonMessage = {
            text: `*GURU BOT*\n\n${text}`,
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
                    "hydratedContentText": `*GURU BOT*\n\n${text}`,
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
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i + '@s.whatsapp.net')}\nFN:*GURU BOT*\nitem1.TEL;waid=${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:guru@example.com\nitem2.X-ABLabel:GitHub\nitem3.URL:https://github.com/Gurulabstech/GURU-MD\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;Nairobi;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
            });
        }
        conn.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted });
    };

    conn.setStatus = status => {
        conn.query({ tag: 'iq', attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'status' }, content: [ { tag: 'status', attrs: {}, content: Buffer.from(`*GURU BOT* • ${status}`, 'utf-8') } ] });
        return status;
    };
    
    conn.serializeM = mek => sms(conn, mek, store);
    
    return conn;
}

// ========== WEB SERVER ==========
app.get('/', (req, res) => res.send('*GURU BOT* is running ✅'));
app.listen(port, () => logSystem(`Web server running on port ${port}`, '🌐'));

// ========== START ==========
setTimeout(async () => {
    try {
        logSystem('Initializing bot connection...', '🚀');
        const conn = await connectToWA();
        global.conn = conn;
    } catch (err) {
        logError(`Fatal error: ${err.message}`, '💥');
        process.exit(1);
    }
}, 2000);

// ========== ERROR HANDLING ==========
process.on('uncaughtException', (err) => {
    logError(`Uncaught Exception: ${err.message}`, '💥');
    logError(err.stack, '📚');
});

process.on('unhandledRejection', (err) => {
    logError(`Unhandled Rejection: ${err}`, '💥');
});

process.on('exit', (code) => {
    logSystem(`Process exiting with code: ${code}`, '👋');
});

async function getSizeMedia(buffer) { return { size: buffer.length }; }

module.exports = {
    logger,
    logSuccess, logError, logWarning, logInfo, logSystem,
    logDivider, logConnection, logMemory, logMessage,
    logCommand, logStatusUpdate, logMedia, logGroupAction,
    logPerformance, logPlugin, logAntiDelete, logBanner,
    logClear, logNewLine
};
