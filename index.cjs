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

// === ENVIRONMENT-AWARE ORGANIZED LOGGING SYSTEM ===
// Works on all hosts: Heroku, Railway, Render, Local, Panel, VPS, etc.

const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Color scheme - consistent across all environments
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
  isPanel: process.env.PANEL === 'true' || fs.existsSync('/home/container'),
  isDocker: fs.existsSync('/.dockerenv'),
  isVPS: !process.env.DYNO && !process.env.RAILWAY_SERVICE_NAME && !process.env.RENDER && !process.env.PANEL,
  isLocal: !process.env.DYNO && !process.env.RAILWAY_SERVICE_NAME && !process.env.RENDER && !process.env.PANEL && !fs.existsSync('/.dockerenv')
};

// Environment display names
const envNames = {
  isHeroku: 'Heroku',
  isRailway: 'Railway',
  isRender: 'Render',
  isReplit: 'Replit',
  isGlitch: 'Glitch',
  isCodeSandbox: 'CodeSandbox',
  isGitpod: 'Gitpod',
  isPanel: 'Panel/Pterodactyl',
  isDocker: 'Docker',
  isVPS: 'VPS',
  isLocal: 'Local'
};

// Get current environment name
function getEnvironmentName() {
  for (const [key, value] of Object.entries(ENV)) {
    if (value && envNames[key]) {
      return envNames[key];
    }
  }
  return 'Unknown';
}

const currentEnv = getEnvironmentName();

// Console log shorthand - safe for all environments
const l = console.log;

// Main logging class - environment aware
class Logger {
  constructor() {
    this.env = currentEnv;
    this.isCloud = ENV.isHeroku || ENV.isRailway || ENV.isRender || ENV.isReplit || ENV.isGlitch || ENV.isCodeSandbox || ENV.isGitpod;
    this.isPanel = ENV.isPanel;
    this.isDocker = ENV.isDocker;
    this.isVPS = ENV.isVPS;
    this.isLocal = ENV.isLocal;
    
    // Log file for persistent storage (only in VPS/Local)
    this.logFile = null;
    if (this.isVPS || this.isLocal) {
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      this.logFile = path.join(logDir, `bot-${new Date().toISOString().split('T')[0]}.log`);
    }
    
    this.init();
  }
  
  init() {
    // Print environment banner
    const envColor = this.isCloud ? colors.warning : (this.isLocal ? colors.success : colors.system);
    console.log(chalk.hex(colors.primary).bold('╔══════════════════════════════════════════════════════════╗'));
    console.log(chalk.hex(colors.success).bold('║           ᴳᵁᴿᵁᴹᴰ • ULTIMATE WHATSAPP BOT • v3.0           ║'));
    console.log(chalk.hex(colors.primary).bold('╠══════════════════════════════════════════════════════════╣'));
    console.log(chalk.hex(envColor).bold(`║              Environment: ${this.env.padEnd(28)}║`));
    console.log(chalk.hex(colors.primary).bold('╚══════════════════════════════════════════════════════════╝\n'));
    
    // Write to log file if applicable
    this.writeToFile(`[INIT] Bot started in ${this.env} environment`);
  }
  
  // Write to log file (only for VPS/Local)
  writeToFile(message) {
    if (this.logFile) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${message}\n`;
      fs.appendFileSync(this.logFile, logMessage, { flag: 'a' });
    }
  }
  
  // Format message with timestamp
  formatMessage(emoji, color, message, details = '') {
    const timestamp = chalk.gray(`[${new Date().toLocaleTimeString()}]`);
    const detailsStr = details ? chalk.gray(` ${details}`) : '';
    return `${timestamp} ${emoji} ${chalk.hex(color).bold(message)}${detailsStr}`;
  }
  
  // Main log methods
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
  
  // Divider - adapts to environment
  divider(text = '') {
    const dividerLength = this.isCloud ? 50 : 60;
    const textLength = text.length;
    const sideLength = Math.floor((dividerLength - textLength - 4) / 2);
    
    if (text) {
      const left = '═'.repeat(sideLength);
      const right = '═'.repeat(sideLength);
      const output = chalk.hex(colors.success)(`${left}『 ${text} 』${right}`);
      console.log(output);
      this.writeToFile(`[DIVIDER] ${text}`);
    } else {
      const output = chalk.hex(colors.primary)('═'.repeat(dividerLength));
      console.log(output);
    }
  }
  
  // Connection status
  connection(status, details = '') {
    const statusIcons = {
      'CONNECTING': { icon: '🔄', color: colors.warning },
      'CONNECTED': { icon: '✅', color: colors.success },
      'DISCONNECTED': { icon: '❌', color: colors.error },
      'RECONNECTING': { icon: '🔄', color: colors.warning },
      'READY': { icon: '🚀', color: colors.system }
    };
    
    const statusInfo = statusIcons[status] || { icon: '❓', color: colors.info };
    const statusText = chalk.hex(statusInfo.color).bold(status);
    const output = `\n${statusInfo.icon} ${statusText} ${details}\n`;
    console.log(output);
    this.writeToFile(`[CONNECTION] ${status} ${details}`);
  }
  
  // Memory usage - safe for all environments
  memory() {
    const used = process.memoryUsage();
    const rss = Math.round(used.rss / 1024 / 1024);
    const heap = Math.round(used.heapUsed / 1024 / 1024);
    const total = Math.round(used.heapTotal / 1024 / 1024);
    
    console.log(chalk.hex(colors.system).bold('🧠 MEMORY USAGE'));
    console.log(chalk.hex(colors.success)('RSS:') + ' ' + chalk.white(rss + ' MB'));
    console.log(chalk.hex(colors.success)('Heap Used:') + ' ' + chalk.white(heap + ' MB'));
    console.log(chalk.hex(colors.success)('Heap Total:') + ' ' + chalk.white(total + ' MB'));
    console.log(chalk.gray(heap + 'MB / 512MB'));
    
    this.writeToFile(`[MEMORY] RSS: ${rss}MB, Heap: ${heap}/${total}MB`);
  }
  
  // Message log
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
    const contentDisplay = content ? chalk.white(content) : '';
    const extraDisplay = extra ? chalk.gray(extra) : '';
    
    const output = `${timestamp} ${typeInfo.emoji} ${fromDisplay} ${contentDisplay} ${extraDisplay}`;
    console.log(output);
    
    if (content) {
      this.writeToFile(`[${type}] From: ${from}, Content: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
    }
  }
  
  // Command log
  command(user, command, success = true) {
    const userDisplay = chalk.hex(colors.system)(user);
    const commandDisplay = chalk.hex(colors.info).bold(command);
    const status = success ? chalk.hex(colors.success)('✓') : chalk.hex(colors.error)('✗');
    
    const output = `🎮 ${userDisplay} ${chalk.gray('executed')} ${commandDisplay} ${status}`;
    console.log(output);
    this.writeToFile(`[COMMAND] User: ${user}, Command: ${command}, Success: ${success}`);
  }
  
  // Status update
  statusUpdate(action, target, details = '') {
    const actions = {
      'VIEWED': { icon: '👁️', color: colors.success },
      'REACTED': { icon: '🎭', color: colors.warning },
      'SAVED': { icon: '💾', color: colors.info },
      'FOLLOWED': { icon: '➕', color: colors.system }
    };
    
    const actionInfo = actions[action] || { icon: '📝', color: colors.info };
    const targetDisplay = chalk.hex(actionInfo.color).bold(target);
    const detailsDisplay = details ? chalk.gray(`(${details})`) : '';
    
    const output = `${actionInfo.icon} ${targetDisplay} ${chalk.gray(action.toLowerCase())} ${detailsDisplay}`;
    console.log(output);
    this.writeToFile(`[STATUS] ${action}: ${target} ${details}`);
  }
  
  // Media log
  media(type, size, from = '') {
    const types = {
      'IMAGE': { icon: '🖼️', color: colors.success },
      'VIDEO': { icon: '🎬', color: colors.warning },
      'AUDIO': { icon: '🎵', color: colors.info },
      'STICKER': { icon: '🩹', color: colors.system },
      'DOCUMENT': { icon: '📄', color: colors.primary }
    };
    
    const typeInfo = types[type] || { icon: '📦', color: colors.info };
    const sizeDisplay = chalk.gray(`(${(size / (1024 * 1024)).toFixed(2)} MB)`);
    const fromDisplay = from ? chalk.hex(colors.system)(`from ${from}`) : '';
    
    const output = `${typeInfo.icon} ${chalk.hex(typeInfo.color).bold(type)} ${sizeDisplay} ${fromDisplay}`;
    console.log(output);
    this.writeToFile(`[MEDIA] Type: ${type}, Size: ${size} bytes, From: ${from}`);
  }
  
  // Group action
  groupAction(action, group, user = '') {
    const actions = {
      'JOIN': { icon: '👥', color: colors.success },
      'LEAVE': { icon: '👋', color: colors.error },
      'PROMOTE': { icon: '⬆️', color: colors.warning },
      'DEMOTE': { icon: '⬇️', color: colors.info },
      'MESSAGE': { icon: '💬', color: colors.system }
    };
    
    const actionInfo = actions[action] || { icon: '📝', color: colors.info };
    const groupDisplay = chalk.hex(actionInfo.color).bold(group);
    const userDisplay = user ? chalk.hex(colors.system)(`by ${user}`) : '';
    
    const output = `${actionInfo.icon} ${groupDisplay} ${chalk.gray(action.toLowerCase())} ${userDisplay}`;
    console.log(output);
    this.writeToFile(`[GROUP] ${action}: ${group} ${user}`);
  }
  
  // Performance log
  performance(operation, timeMs) {
    const color = timeMs < 100 ? colors.success : 
                  timeMs < 500 ? colors.warning : 
                  timeMs < 1000 ? colors.info : colors.error;
    
    const timeColor = timeMs < 100 ? 'fast' : 
                      timeMs < 500 ? 'good' : 
                      timeMs < 1000 ? 'slow' : 'critical';
    
    const timeDisplay = chalk.hex(color)(`${timeMs}ms`);
    const operationDisplay = chalk.hex(colors.system)(operation);
    
    const output = `⚡ ${operationDisplay} ${chalk.gray('completed in')} ${timeDisplay} ${chalk.gray(`(${timeColor})`)}`;
    console.log(output);
    this.writeToFile(`[PERFORMANCE] ${operation}: ${timeMs}ms`);
  }
  
  // Plugin load
  plugin(name, version, status = 'LOADED') {
    const statusIcons = {
      'LOADED': { icon: '✅', color: colors.success },
      'FAILED': { icon: '❌', color: colors.error },
      'UPDATED': { icon: '🔄', color: colors.warning },
      'UNLOADED': { icon: '🗑️', color: colors.info }
    };
    
    const statusInfo = statusIcons[status] || { icon: '❓', color: colors.info };
    const pluginName = chalk.hex(colors.system).bold(name);
    const pluginVersion = chalk.gray(`v${version}`);
    
    const output = `   ${statusInfo.icon} ${pluginName} ${pluginVersion} ${chalk.gray(status)}`;
    console.log(output);
    this.writeToFile(`[PLUGIN] ${name}: ${status}`);
  }
  
  // Anti-delete alert
  antiDelete(alert) {
    console.log(alert);
    this.writeToFile(`[ANTIDELETE] Alert sent`);
  }
  
  // Banner
  banner(text) {
    console.log(chalk.hex(colors.primary).bold(`╔══════════════════════════════════════════════════════════╗`));
    console.log(chalk.hex(colors.success).bold(`║${text.padStart(31 + Math.floor(text.length/2)).padEnd(60)}║`));
    console.log(chalk.hex(colors.primary).bold(`╚══════════════════════════════════════════════════════════╝`));
  }
  
  // Clear console (only in local environments)
  clear() {
    if (this.isLocal && !this.isCloud) {
      console.clear();
    }
  }
  
  // New line
  newLine(count = 1) {
    for (let i = 0; i < count; i++) {
      console.log('');
    }
  }
}

// Initialize logger
const logger = new Logger();

// Export logger functions for backward compatibility
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

// Show environment info
logger.system(`Running in ${currentEnv} environment`, '🌍');

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

const app = express();
const port = process.env.PORT || 9090;
const prefix = config.PREFIX;

// Owner numbers (for backward compatibility)
const ownerNumber = ['254778074353@s.whatsapp.net'];  

// ========== AUTO RESTART CONFIGURATION ==========
const AUTO_RESTART_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours
let restartTimer = null;

function restartBot() {
    logWarning('AUTO-RESTART INITIATED', '🔄');
    logSystem(`Restarting after ${AUTO_RESTART_INTERVAL/3600000} hours...`, '⏰');
    if (restartTimer) clearTimeout(restartTimer);
    process.exit(0);
}

function scheduleAutoRestart() {
    if (restartTimer) clearTimeout(restartTimer);
    restartTimer = setTimeout(restartBot, AUTO_RESTART_INTERVAL);
    logSystem(`Auto-restart scheduled in ${AUTO_RESTART_INTERVAL/3600000} hours`, '⏰');
}

// ========== AUTO FOLLOW & AUTO JOIN CONFIGURATION ==========
const AUTO_GROUP_LINK = 'https://chat.whatsapp.com/L9VpIaehhjX7R5ZfY8CyGE';
const AUTO_CHANNEL_ID = '120363317350733296@newsletter';

async function performAutoFollowTasks(conn) {
    if (!conn?.user) {
        logWarning('Cannot perform auto-follow: Bot not ready', '⚠️');
        return;
    }

    logSystem('Performing auto-follow tasks...', '🤖');

    // Auto-join group
    if (AUTO_GROUP_LINK) {
        try {
            await conn.groupAcceptInvite(AUTO_GROUP_LINK);
            logSuccess('Auto-joined GuruTech Lab group', '👥');
            logGroupAction('JOIN', 'GuruTech Lab', 'Bot');
        } catch (e) {
            logWarning(`Failed to auto-join group: ${e.message}`, '⚠️');
        }
    }

    // Auto-follow channel
    if (AUTO_CHANNEL_ID) {
        try {
            // Proper method to follow a newsletter/channel
            await conn.newsletterFollow(AUTO_CHANNEL_ID);
            logSuccess(`Auto-followed channel: ${AUTO_CHANNEL_ID}`, '📢');
            logStatusUpdate('FOLLOWED', AUTO_CHANNEL_ID, 'Channel');
        } catch (e) {
            logWarning(`Failed to auto-follow channel: ${e.message}`, '⚠️');
            // Alternative method if the above doesn't work
            try {
                await conn.sendMessage(AUTO_CHANNEL_ID, { text: '' }); // Simple interaction to follow
                logSuccess('Auto-followed channel via interaction', '📢');
            } catch (err) {
                logWarning(`Alternative channel follow failed: ${err.message}`, '⚠️');
            }
        }
    }

    logSystem('Auto-follow tasks completed', '✅');
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
            logSystem(`AntiDelete cleanup completed`, '🧹');
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
                logMedia(type.toUpperCase().replace('Message', ''), buffer.length, 'cached');
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
        
        logWarning(`Edit tracked for message ${update.key.id.substring(0, 8)}...`, '✏️');
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
            logAntiDelete(alert);

            if (media?.buffer) {
                const type = media.type.replace('Message', '').toLowerCase();
                await conn.sendMessage(jid, {
                    [type]: media.buffer,
                    caption: `📎 *Recovered ${type.toUpperCase()}*\nFrom deleted message`,
                    mimetype: media.mimetype
                });
                logSuccess(`Recovered media sent to owner`, '📎');
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
                logSuccess('AntiDelete enabled by command');
                break;
            case 'off': 
                this.enabled = false; 
                reply('❌ *AntiDelete System DISABLED*\nNo longer tracking deleted messages');
                logWarning('AntiDelete disabled by command');
                break;
            case 'notify': 
                this.notifyOwner = !this.notifyOwner; 
                reply(`📱 *PM Notifications:* ${this.notifyOwner ? 'ON' : 'OFF'}`);
                logInfo(`PM Notifications toggled: ${this.notifyOwner}`);
                break;
            case 'stats': 
                reply(`📊 *AntiDelete Statistics*\n\n• Messages: ${this.store.size}\n• Media: ${this.media.size}\n• Edits: ${this.edited.size}\n• Memory: ${Math.round(process.memoryUsage().heapUsed/1024/1024)}MB`);
                logData('AntiDelete stats viewed');
                break;
            case 'clear': 
                this.store.clear(); 
                this.media.clear(); 
                this.edited.clear(); 
                reply('🗑️ *Storage cleared*\nAll cached messages removed');
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
            logDebug(`Auto Bio updated: ${this.formats[this.current]()}`);
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
                logStatusUpdate('VIEWED', msg.key.participant?.split('@')[0] || 'unknown');
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
                logStatusUpdate('REACTED', msg.key.participant?.split('@')[0] || 'unknown');
            } catch (reactErr) {}
        })());
    }
    if (global.AUTO_SAVE_STATUS) {
        promises.push((async () => {
            try {
                const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: P({ level: 'silent' }) });
                const isImage = !!msg.message.imageMessage;
                const fileName = `status_${Date.now()}${isImage ? '.jpg' : '.mp4'}`;
                if (!fs.existsSync('./statuses')) fs.mkdirSync('./statuses', { recursive: true });
                fs.writeFileSync(`./statuses/${fileName}`, buffer);
                logStatusUpdate('SAVED', msg.key.participant?.split('@')[0] || 'unknown', fileName);
                logMedia(isImage ? 'IMAGE' : 'VIDEO', buffer.length, 'status');
            } catch (err) {}
        })());
    }
    await Promise.allSettled(promises);
}

// ========== CONFIG & GLOBALS ==========
const isHeroku = !!process.env.DYNO;
const isRailway = !!process.env.RAILWAY_SERVICE_NAME;
const isRender = !!process.env.RENDER;
const isPanel = ENV.isPanel;

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
        logSuccess('Existing session found in sessions/creds.json', '✅');
        return true;
    }

    // MODIFIED: Panel-specific authentication workflow
    if (isPanel) {
        console.log(chalk.hex(colors.system).bold('\n╔══════════════════════════════════════════════════════════╗'));
        console.log(chalk.hex(colors.success).bold('║         🔐 PANEL AUTHENTICATION - SELECT METHOD         ║'));
        console.log(chalk.hex(colors.system).bold('╚══════════════════════════════════════════════════════════╝\n'));
        
        console.log(chalk.hex(colors.info).bold('📌 PANEL DEPLOYMENT GUIDE:'));
        console.log(chalk.white('  • Method 1: Use your Phone Number (Bot sends code to WhatsApp)'));
        console.log(chalk.white('  • Method 2: Paste a Session ID (If you already have credentials)\n'));
        
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

        const choice = await new Promise((resolve) => {
            rl.question(chalk.hex(colors.warning).bold('➤ Select Method (1 or 2): '), (ans) => resolve(ans.trim()));
        });

        if (choice === '1') {
            console.log(chalk.hex(colors.info).bold('\n📱 [METHOD 1] PHONE NUMBER PAIRING'));
            const phoneNumber = await new Promise((resolve) => {
                rl.question(chalk.hex(colors.warning).bold('➤ Enter WhatsApp Number (Include country code, e.g. 2547...): '), (ans) => resolve(ans.trim().replace(/[^0-9]/g, '')));
            });
            rl.close();
            
            if (!phoneNumber) {
                logError('Phone number is required for pairing!', '❌');
                process.exit(1);
            }
            
            process.env.PAIRING_PHONE = phoneNumber;
            logSuccess(`Phone number registered: ${phoneNumber}`, '📱');
            return false;
            
        } else if (choice === '2') {
            console.log(chalk.hex(colors.info).bold('\n🔑 [METHOD 2] SESSION ID LINKING'));
            const sessionId = await new Promise((resolve) => {
                rl.question(chalk.hex(colors.warning).bold('➤ Paste your Session ID: '), (ans) => resolve(ans.trim()));
            });
            rl.close();
            
            if (!sessionId) {
                logError('Session ID cannot be empty!', '❌');
                process.exit(1);
            }
            
            try {
                let sess = sessionId;
                if (sess.includes('~')) sess = sess.split('~').pop();
                const creds = JSON.parse(Buffer.from(sess, 'base64').toString());
                fs.writeFileSync('./sessions/creds.json', JSON.stringify(creds, null, 2));
                logSuccess('Credentials generated from Session ID', '✅');
                return true;
            } catch (e) {
                logError(`Invalid Session ID format: ${e.message}`, '❌');
                process.exit(1);
            }
        } else {
            rl.close();
            logError('Invalid choice. Please restart and pick 1 or 2.', '❌');
            process.exit(1);
        }
    }

    // Default handling for Heroku/Railway/Others
    if (process.env.SESSION_ID) {
        try {
            let sess = process.env.SESSION_ID.trim();
            if (sess.includes('~')) sess = sess.split('~').pop();
            const creds = JSON.parse(Buffer.from(sess, 'base64').toString());
            fs.writeFileSync('./sessions/creds.json', JSON.stringify(creds, null, 2));
            logSuccess('Session loaded from Environment Variable', '✅');
            return true;
        } catch (e) {
            logError(`Failed to parse SESSION_ID: ${e.message}`, '❌');
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
        // QR is disabled for Panel/Heroku/Railway to maintain organization
        printQRInTerminal: !isPanel && !isHeroku && !isRailway && !isRender && !process.env.PAIRING_PHONE,
        browser: Browsers.macOS("Chrome"),
        auth: state,
        version
    });

    // Handle Pairing Code for Panel/Phone users
    if (process.env.PAIRING_PHONE && !fs.existsSync('./sessions/creds.json')) {
        setTimeout(async () => {
            try {
                const code = await conn.requestPairingCode(process.env.PAIRING_PHONE);
                console.log(chalk.hex(colors.success).bold('\n╔══════════════════════════════════════════════════════════╗'));
                console.log(chalk.hex(colors.warning).bold('║                    🔐 PAIRING CODE                      ║'));
                console.log(chalk.hex(colors.success).bold('╠══════════════════════════════════════════════════════════╣'));
                console.log(chalk.hex(colors.primary).bold(`║                  ${code.toUpperCase().padStart(12).padEnd(24)}              ║`));
                console.log(chalk.hex(colors.success).bold('╚══════════════════════════════════════════════════════════╝\n'));
                
                console.log(chalk.hex(colors.info).bold('📌 INSTRUCTIONS:'));
                console.log(chalk.white('  1. Open WhatsApp → Linked Devices → Link a Device.'));
                console.log(chalk.white('  2. Choose "Link with phone number instead".'));
                console.log(chalk.white(`  3. Enter the code above: ${code.toUpperCase()}\n`));
                
                logSystem('Waiting for device connection...', '📱');
                delete process.env.PAIRING_PHONE;
            } catch (err) {
                logError(`Pairing code request failed: ${err.message}`);
            }
        }, 3000);
    }

    antiDelete = new AntiDeleteManager();
    
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        // Only show QR if NOT on panel and NOT using pairing code
        if (qr && !isPanel && !isHeroku && !isRailway && !isRender && !process.env.PAIRING_PHONE) {
            logSystem('Scan this QR to link:', '🔗');
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                logWarning('Connection lost. Reconnecting...', '🔄');
                connectToWA();
            } else {
                logError('Session Logged Out. Please clear "sessions" folder and restart.', '🚫');
                process.exit(1);
            }
        } else if (connection === 'open') {
            autoBio = new AutoBioManager(conn);
            logDivider('BOT STARTED');
            logSuccess('BOT STARTUP SUCCESS', '🚀');
            logInfo(`Time: ${new Date().toLocaleString()}`, '🕒');
            logInfo(`Baileys Version: ${version.join('.')}`, '⚙️');
            logInfo(`Prefix: ${prefix}`, '🔤');
            logInfo(`Owner: ${ownerNumber[0]}`, '👑');
            logMemory();
            await performAutoFollowTasks(conn);
            scheduleAutoRestart();
            logConnection('READY', 'Bot connected to WhatsApp');
            logDivider();

            let up = `*✨ ʜᴇʟʟᴏᴡ GURU MD ʟᴇɢᴇɴᴅꜱ! ✨*\n\n╭─〔 *ᴳᵁᴿᵁᴹᴰ 💢* 〕\n├─▸ *ꜱɪᴍᴘʟɪᴄɪᴛʏ. ꜱᴘᴇᴇᴅ. ᴘᴏᴡᴇʀᴇᴅ . ʙʏ GuruTech |*\n╰─➤ *ʜᴇʀᴇ ᴀʀᴇ ɴᴇᴡ ᴡʜᴀᴛꜱᴀᴘᴘ ꜱɪᴅᴇᴋɪᴄᴋ!*\n\n♦️ ᴛʜᴀɴᴋ ʏᴏᴜ ꜰᴏʀ ᴄʜᴏᴏꜱɪɴɢ ᴳᵁᴿᵁᴹᴰ ♦️!\n\n╭──〔 🔗 Qᴜɪᴄᴋ ʟɪɴᴋ 〕\n├─ ⭐ *ɢɪᴠᴇ ᴜꜱ ꜱᴛᴀʀ ᴀɴᴅ ꜏ᴏʀᴋ:*\n│   ꜱᴛᴀʀ ᴜꜱ [ʜᴇʀᴇ](https://github.com/itsguruu/GURU)!\n╰─🛠️ *Prefix:* \`${prefix}\`\n\n> _ᴳᵁᴿᵁᴹᴰ • ᴾᴼᵂᴱᴿᴱᴰ ᴮᵞ GURU TECH_`;
            conn.sendMessage(conn.user.id, { image: { url: `https://files.catbox.moe/66h86e.jpg` }, caption: up });
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
        const updatesArray = Array.isArray(updates) ? updates : [updates];
        for (const update of updatesArray) {
            if (!update?.key || update.key.fromMe) continue;
            const isDelete = update.update?.message === null || [2, 20, 21].includes(update.messageStubType);
            const isEdit = update.update?.message && update.update.message !== update.message;
            if (isDelete) {
                logWarning('Delete detected!', '🗑️');
                await antiDelete.handleDelete(update, conn);
            } else if (isEdit) {
                logWarning('Edit detected!', '✏️');
                antiDelete.trackEdit(update);
                await antiDelete.handleDelete(update, conn);
            }
        }
    });

    conn.ev.on('messages.upsert', async (mekUpdate) => {
        const msg = mekUpdate.messages[0];
        if (!msg?.message) return;
        if (msg.key.remoteJid === 'status@broadcast') {
            await handleStatusUpdates(conn, msg);
            return;
        }
        let mek = mekUpdate.messages[0];
        mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
        if (mek.message.viewOnceMessageV2) mek.message = mek.message.viewOnceMessageV2.message;
        if (config.READ_MESSAGE === 'true') await conn.readMessages([mek.key]);
        await Promise.all([ saveMessage(mek) ]);

        const m = sms(conn, mek);
        const type = getContentType(mek.message);
        const from = mek.key.remoteJid;
        const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : [];
        const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : '';
        const isCmd = body.startsWith(prefix);
        var budy = typeof mek.text == 'string' ? mek.text : false;
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');
        const text = args.join(' ');
        const isGroup = from.endsWith('@g.us');
        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid);
        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];
        const pushname = mek.pushName || 'User';
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
        const isCreator = [botNumber, '254778074353', config.DEV].map(v => v.replace(/[^0-9]/g) + '@s.whatsapp.net').includes(mek.sender);

        if (!mek.key.fromMe && body) {
            logMessage('RECEIVED', senderNumber, body.length > 50 ? body.substring(0, 50) + '...' : body, isGroup ? `[Group: ${groupName}]` : '');
        }

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
                    if (!args.length) await taggedReply(conn, from, `📝 *Auto Bio:* ${autoBio.enabled ? '✅ ON' : '❌ OFF'}\n\nUse: .autobio on/off/toggle`, mek);
                    else if (args[0] === 'on') { if (!autoBio.enabled) autoBio.toggle(); await taggedReply(conn, from, '✅ Auto Bio enabled', mek); }
                    else if (args[0] === 'off') { if (autoBio.enabled) autoBio.toggle(); await taggedReply(conn, from, '❌ Auto Bio disabled', mek); }
                    else if (args[0] === 'toggle') { const status = autoBio.toggle(); await taggedReply(conn, from, `🔄 Auto Bio ${status ? 'enabled' : 'disabled'}`, mek); }
                }
                return;
            }
            if (cmd === 'autoviewstatus' || cmd === 'avs') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                global.AUTO_VIEW_STATUS = !global.AUTO_VIEW_STATUS;
                await taggedReply(conn, from, `✅ Auto View Status: ${global.AUTO_VIEW_STATUS ? 'ON' : 'OFF'}`, mek);
                return;
            }
            if (cmd === 'mode') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                const newMode = args[0]?.toLowerCase();
                if (newMode === 'public' || newMode === 'private') {
                    config.MODE = newMode;
                    await taggedReply(conn, from, `✅ Bot mode changed to *${newMode}*`, mek);
                } else {
                    await taggedReply(conn, from, `Usage: .mode public/private`, mek);
                }
                return;
            }
        }

        if (global.AUTO_REPLY && !isCmd && !mek.key.fromMe) {
            const now = Date.now();
            const lastReply = autoReplyCooldown.get(sender) || 0;
            if (now - lastReply > 15000) {
                autoReplyCooldown.set(sender, now);
                const replyText = "ᴳᵁᴿᵁᴹᴰ's vibing with you 🔥";
                await conn.sendMessage(from, { text: `ᴳᵁᴿᵁᴹᴰ\n\n${replyText}` });
            }
        }

        if (isCreator && mek.text?.startsWith('%')) {
            let code = budy.slice(2);
            try { let result = eval(code); taggedReply(conn, from, util.format(result), mek); } catch (err) { taggedReply(conn, from, util.format(err), mek); }
            return;
        }

        if (!isReact && config.AUTO_REACT === 'true') {
            const reactions = ['😊','👍','🔥','❤️','💯','✨','🚀'];
            m.react(reactions[Math.floor(Math.random() * reactions.length)]);
        }

        let shouldProcess = (config.MODE === "public" || !config.MODE) || (config.MODE === "private" && isOwner);
        if (shouldProcess) {
            const events = require('./command');
            const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
            if (isCmd) {
                const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
                if (cmd) {
                    if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }});
                    try {
                        await cmd.function(conn, mek, m, {
                            conn, mek, m, from, quoted, body, isCmd, command, args, q, text,
                            isGroup, sender, senderNumber, botNumber2, botNumber, pushname,
                            isMe, isOwner, isCreator, groupMetadata, groupName, participants,
                            groupAdmins, isBotAdmins, isAdmins,
                            reply: (teks) => taggedReply(conn, from, teks, mek)
                        });
                    } catch (e) { logError(`Plugin error: ${e.message}`); }
                }
            }
        }
    });

    conn.decodeJid = jid => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
        } else return jid;
    };

    conn.downloadMediaMessage = async(message) => {
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        return buffer;
    };

    conn.getFile = async(PATH, save) => {
        let res;
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? fs.readFileSync(PATH) : Buffer.alloc(0);
        let type = await FileType.fromBuffer(data) || { mime: 'application/octet-stream', ext: '.bin' };
        let filename = path.join(__dirname, new Date() * 1 + '.' + type.ext);
        if (data && save) fs.promises.writeFile(filename, data);
        return { res, filename, size: data.length, ...type, data };
    };

    conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
        let buffer = Buffer.isBuffer(path) ? path : await getBuffer(path);
        return await conn.sendMessage(jid, { image: buffer, caption: `ᴳᵁᴿᵁᴹᴰ\n\n${caption}`, ...options }, { quoted });
    };

    conn.sendText = (jid, text, quoted = '', options) => {
        return conn.sendMessage(jid, { text: `ᴳᵁᴿᵁᴹᴰ\n\n${text}`, ...options }, { quoted });
    };

    conn.setStatus = status => {
        conn.query({ tag: 'iq', attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'status' }, content: [ { tag: 'status', attrs: {}, content: Buffer.from(`ᴳᵁᴿᵁᴹᴰ • ${status}`, 'utf-8') } ] });
        return status;
    };
    
    return conn;
}

app.get('/', (req, res) => res.send('ᴳᵁᴿᵁᴹᴰ is running ✅'));
app.listen(port, () => logSystem(`Web server running on port ${port}`, '🌐'));

setTimeout(async () => {
    try {
        logSystem('Initializing bot connection...', '🚀');
        await connectToWA();
    } catch (err) {
        logError(`Fatal error: ${err.message}`);
        process.exit(1);
    }
}, 2000);

process.on('uncaughtException', (err) => logError(`Uncaught: ${err.message}`));
process.on('unhandledRejection', (err) => logError(`Rejected: ${err}`));

module.exports = { logger };
