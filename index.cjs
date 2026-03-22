// === HEROKU FIXES - MUST BE AT THE VERY TOP ===
// Prevent Heroku from crashing due to npm notices
process.env.NPM_CONFIG_LOGLEVEL = 'error';
process.env.NPM_CONFIG_PROGRESS = 'false';
process.env.NPM_CONFIG_FUND = 'false';
process.env.NPM_CONFIG_AUDIT = 'false';

// Handle uncaught exceptions properly
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    // Don't exit immediately, give time for cleanup
    setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
});

// Keep the process alive with heartbeat
setInterval(() => {
    console.log('❤️ Bot heartbeat - ' + new Date().toISOString());
}, 60000);

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
  isPanel: process.env.PANEL === 'true',
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
  isPanel: 'Panel',
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
    // Print environment banner - UPDATED to GURU-MD style
    const envColor = this.isCloud ? colors.warning : (this.isLocal ? colors.success : colors.system);
    console.log(chalk.hex(colors.primary).bold('╭══════════════════════════════════════════════════════════╮'));
    console.log(chalk.hex(colors.success).bold(`│              ${config.BOT_NAME} • ULTIMATE WHATSAPP BOT             │`));
    console.log(chalk.hex(colors.primary).bold('├──────────────────────────────────────────────────────────┤'));
    console.log(chalk.hex(envColor).bold(`│              Environment: ${this.env.padEnd(28)}         │`));
    console.log(chalk.hex(colors.primary).bold('╰══════════════════════════════════════════════════════════╯\n'));
    
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
    if (process.env.DEBUG === 'true' || config.DEBUG_LOG_LEVEL === 'debug') {
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
  
  // Divider - adapts to environment - UPDATED to GURU-MD style
  divider(text = '') {
    const dividerLength = this.isCloud ? 50 : 60;
    
    if (text) {
      const output = chalk.hex(colors.success)(`┌────[ ${text} ]────┐`);
      console.log(output);
      this.writeToFile(`[DIVIDER] ${text}`);
    } else {
      const output = chalk.hex(colors.primary)('─'.repeat(dividerLength));
      console.log(output);
    }
  }
  
  // Connection status - UPDATED to GURU-MD style
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
    const output = `\n╭────[ CONNECTION ]────✦\n│\n├❏ ${statusInfo.icon} ${statusText} ${details}\n│\n╰────────────────────✦\n`;
    console.log(output);
    this.writeToFile(`[CONNECTION] ${status} ${details}`);
  }
  
  // Memory usage - safe for all environments - UPDATED to GURU-MD style
  memory() {
    const used = process.memoryUsage();
    const rss = Math.round(used.rss / 1024 / 1024);
    const heap = Math.round(used.heapUsed / 1024 / 1024);
    const total = Math.round(used.heapTotal / 1024 / 1024);
    
    console.log(chalk.hex(colors.system).bold('╭────[ MEMORY USAGE ]────✦'));
    console.log(chalk.hex(colors.success)('├❏ RSS:') + ' ' + chalk.white(rss + ' MB'));
    console.log(chalk.hex(colors.success)('├❏ Heap Used:') + ' ' + chalk.white(heap + ' MB'));
    console.log(chalk.hex(colors.success)('├❏ Heap Total:') + ' ' + chalk.white(total + ' MB'));
    console.log(chalk.hex(colors.system).bold('╰────────────────────✦'));
    console.log(chalk.gray(heap + 'MB / 512MB'));
    
    this.writeToFile(`[MEMORY] RSS: ${rss}MB, Heap: ${heap}/${total}MB`);
  }
  
  // Message log - UPDATED to GURU-MD style
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
  
  // Command log - UPDATED to GURU-MD style
  command(user, command, success = true) {
    const userDisplay = chalk.hex(colors.system)(user);
    const commandDisplay = chalk.hex(colors.info).bold(command);
    const status = success ? chalk.hex(colors.success)('✓') : chalk.hex(colors.error)('✗');
    
    const output = `╭────[ COMMAND ]────✦\n│\n├❏ ${userDisplay} executed ${commandDisplay} ${status}\n│\n╰────────────────────✦`;
    console.log(output);
    this.writeToFile(`[COMMAND] User: ${user}, Command: ${command}, Success: ${success}`);
  }
  
  // Status update - UPDATED to GURU-MD style
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
  
  // Media log - UPDATED to GURU-MD style
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
  
  // Group action - UPDATED to GURU-MD style
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
    
    const output = `╭────[ GROUP ]────✦\n│\n├❏ ${actionInfo.icon} ${groupDisplay} ${chalk.gray(action.toLowerCase())} ${userDisplay}\n│\n╰────────────────────✦`;
    console.log(output);
    this.writeToFile(`[GROUP] ${action}: ${group} ${user}`);
  }
  
  // Performance log - UPDATED to GURU-MD style
  performance(operation, timeMs) {
    const color = timeMs < 100 ? colors.success : 
                  timeMs < 500 ? colors.warning : 
                  timeMs < 1000 ? colors.info : colors.error;
    
    const timeColor = timeMs < 100 ? 'fast' : 
                      timeMs < 500 ? 'good' : 
                      timeMs < 1000 ? 'slow' : 'critical';
    
    const timeDisplay = chalk.hex(color)(`${timeMs}ms`);
    const operationDisplay = chalk.hex(colors.system)(operation);
    
    const output = `╭────[ PERFORMANCE ]────✦\n│\n├❏ ${operationDisplay} completed in ${timeDisplay} (${timeColor})\n│\n╰────────────────────✦`;
    console.log(output);
    this.writeToFile(`[PERFORMANCE] ${operation}: ${timeMs}ms`);
  }
  
  // Plugin load - UPDATED to GURU-MD style
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
  
  // Anti-delete alert - UPDATED to GURU-MD style
  antiDelete(alert) {
    console.log(alert);
    this.writeToFile(`[ANTIDELETE] Alert sent`);
  }
  
  // Banner - UPDATED to GURU-MD style
  banner(text) {
    console.log(chalk.hex(colors.primary).bold(`╭══════════════════════════════════════════════════════════╮`));
    console.log(chalk.hex(colors.success).bold(`│${text.padStart(31 + Math.floor(text.length/2)).padEnd(60)}│`));
    console.log(chalk.hex(colors.primary).bold(`╰══════════════════════════════════════════════════════════╯`));
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

// === LOAD CONFIG ===
const config = require('./config');

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
logger.system(`Bot Name: ${config.BOT_NAME}`, '🤖');
logger.system(`Owner: ${config.OWNER_NAME} (${config.OWNER_NUMBER})`, '👑');

// === REQUIRED MODULES ===
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data');
const ff = require('fluent-ffmpeg');
const P = require('pino');
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

// Owner numbers (from config)
const ownerNumber = config.OWNER_NUMBER ? config.OWNER_NUMBER.split(',').map(n => n.trim() + '@s.whatsapp.net') : ['254778074353@s.whatsapp.net'];
const isPublicMode = config.PUBLIC_MODE === 'true' || config.MODE === 'public';

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
const AUTO_GROUP_LINK = config.GROUP_INVITE_CODE ? `https://chat.whatsapp.com/${config.GROUP_INVITE_CODE}` : '';
const AUTO_CHANNEL_ID = config.CHANNEL_JID;

async function performAutoFollowTasks(conn) {
    if (!conn?.user) {
        logWarning('Cannot perform auto-follow: Bot not ready', '⚠️');
        return;
    }

    logSystem('Performing auto-follow tasks...', '🤖');

    // Auto-join group
    if (AUTO_GROUP_LINK) {
        try {
            await conn.groupAcceptInvite(config.GROUP_INVITE_CODE);
            logSuccess(`Auto-joined ${config.BOT_NAME} group`, '👥');
            logGroupAction('JOIN', 'Bot Group', 'Bot');
        } catch (e) {
            logWarning(`Failed to auto-join group: ${e.message}`, '⚠️');
        }
    }

    // Auto-follow channel
    if (AUTO_CHANNEL_ID) {
        try {
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
        this.enabled = config.ANTI_DELETE === 'true'; // From config
        this.notifyOwner = true;            // Notify bot owner
        this.antiVV = config.ANTI_VV === 'true'; // Anti view once
        this.delPath = config.ANTI_DEL_PATH || 'log'; // Where to send deleted messages
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

        // Build alert - UPDATED to GURU-MD style
        const alert = this.buildAlert(msgData || editData.original, editData, mediaData, key, chatName, senderName);
        
        // Determine where to send based on config
        if (this.delPath === 'log') {
            // Send to bot owner
            if (conn.user?.id) {
                await this.sendNotification(conn, conn.user.id, alert, mediaData);
            }
        } else if (this.delPath === 'same') {
            // Resend in the same chat
            await this.sendNotification(conn, key.remoteJid, alert, mediaData);
        }

        // Also send to configured owner numbers for compatibility
        if (ownerNumber.length > 0 && ownerNumber[0] !== conn.user?.id && this.delPath === 'log') {
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
        
        // Beautiful table header - UPDATED to GURU-MD style
        lines.push('╭══════════════════════════════════════════════════════════╮');
        lines.push(`│              ${isEdit ? '✏️ EDIT DETECTED' : '🗑️ DELETE DETECTED'}               │`);
        lines.push('╰══════════════════════════════════════════════════════════╯\n');

        // Source Information Table - UPDATED to GURU-MD style
        lines.push('┌────[ 📍 SOURCE INFORMATION ]────');
        lines.push(`├❏ Chat: ${chatName} ${key.remoteJid.endsWith('@g.us') ? '👥' : '👤'}`);
        lines.push(`├❏ From: @${senderName}`);
        lines.push(`├❏ Time: ${new Date().toLocaleString()}`);
        lines.push(`├❏ ID: ${key.id.substring(0, 8)}...`);
        if (isEdit) {
            lines.push(`├❏ Status: ✏️ EDITED`);
            lines.push(`├❏ Edit Time: ${new Date(edit.edited.timestamp).toLocaleString()}`);
        }
        lines.push('└───────────────────────────────\n');

        // Message Content Table - UPDATED to GURU-MD style
        lines.push('┌────[ 📄 MESSAGE CONTENT ]────');
        
        if (msg) {
            const type = msg.type || 'unknown';
            const content = msg.content || {};
            
            lines.push(`├❏ Type: ${this.getTypeEmoji(type)} ${type.toUpperCase()}`);
            
            if (content.text) {
                const shortText = content.text.substring(0, 100);
                lines.push(`├❏ Text: "${shortText}${content.text.length > 100 ? '...' : ''}"`);
            }
            if (content.caption) {
                const shortCap = content.caption.substring(0, 100);
                lines.push(`├❏ Caption: "${shortCap}${content.caption.length > 100 ? '...' : ''}"`);
            }
            if (content.fileName) lines.push(`├❏ File: ${content.fileName}`);
            if (content.mimetype) lines.push(`├❏ Type: ${content.mimetype.split('/')[1] || content.mimetype}`);
            if (content.duration) lines.push(`├❏ Duration: ${content.duration}s`);
            
            if (isEdit && edit.edited) {
                lines.push('├❏');
                lines.push('├❏ ✏️ EDITED TO:');
                lines.push(`├❏ New Type: ${this.getTypeEmoji(edit.edited.type)} ${edit.edited.type.toUpperCase()}`);
                if (edit.edited.content.text) {
                    const shortNew = edit.edited.content.text.substring(0, 100);
                    lines.push(`├❏ New Text: "${shortNew}${edit.edited.content.text.length > 100 ? '...' : ''}"`);
                }
                if (edit.edited.content.caption) {
                    const shortNewCap = edit.edited.content.caption.substring(0, 100);
                    lines.push(`├❏ New Caption: "${shortNewCap}${edit.edited.content.caption.length > 100 ? '...' : ''}"`);
                }
            }
        } else {
            lines.push('├❏ ⚠️ Content not saved in time');
        }
        lines.push('└───────────────────────────────\n');

        if (media) {
            lines.push('┌────[ 📎 MEDIA ATTACHMENT ]────');
            lines.push('├❏ Media recovered and attached');
            lines.push('└───────────────────────────────\n');
        }

        lines.push('══════════════════════════════════════════════════════════');
        lines.push(`                    ${config.BOT_NAME} • AntiDelete`);
        lines.push('══════════════════════════════════════════════════════════');
        
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
                logSuccess(`Recovered media sent`, '📎');
            }
        } catch (err) {
            logError(`Notification failed: ${err.message}`);
        }
    }

    // Command handler - UPDATED to GURU-MD style
    async handleCommand(conn, from, args, reply) {
        if (!args.length) {
            return reply(`╭══════════════════════════════╮
│       🔰 ANTIDELETE SYSTEM    │
╰══════════════════════════════╯

┌────[ 📊 STATUS ]────
├❏ System: ${this.enabled ? '✅ ACTIVE' : '❌ INACTIVE'}
├❏ PM Notify: ${this.notifyOwner ? '✅ ON' : '❌ OFF'}
├❏ Anti VV: ${this.antiVV ? '✅ ON' : '❌ OFF'}
├❏ Stored: ${this.store.size} messages
├❏ Media: ${this.media.size} files
├❏ Edited: ${this.edited.size} edits
└────────────────────

┌────[ ⚡ COMMANDS ]────
├❏ .ad on - Enable system
├❏ .ad off - Disable system
├❏ .ad notify - Toggle PM
├❏ .ad stats - Show stats
├❏ .ad clear - Clear storage
└────────────────────

══════════════════════════════
${config.BOT_NAME} • AntiDelete v2.0
══════════════════════════════`);
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
            () => `${config.BOT_NAME} • ${new Date().toLocaleTimeString()}`,
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
            logger.debug(`Auto Bio updated: ${this.formats[this.current]()}`);
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

// ========== GLOBAL TOGGLES FROM CONFIG ==========
global.AUTO_VIEW_STATUS = config.AUTO_VIEW_STATUS === 'true';
global.AUTO_REACT_STATUS = config.AUTO_STATUS_REACT === 'true';
global.AUTO_REPLY = config.AUTO_REPLY === 'true';
global.AUTO_SAVE_STATUS = config.AUTO_SAVE_STATUS === 'true';
const autoReplyCooldown = new Map();

// Spam protection
const userMessageCount = new Map();
const SPAM_THRESHOLD = parseInt(config.SPAM_THRESHOLD) || 5;

// ========== HELPER FUNCTIONS ==========
const taggedReply = (conn, from, teks, quoted = null) => {
    if (!config.ENABLE_TAGGING) {
        const brandedText = `*${config.BOT_NAME}*\n\n${teks}`;
        return conn.sendMessage(from, { text: brandedText }, { quoted: quoted || undefined });
    }
    let tag = config.BOT_TAG_TEXT || `> _Powered by ${config.BOT_NAME} 💢_`;
    let finalText = config.TAG_POSITION === 'start' ? `${tag}\n\n${teks}` : `${teks}\n\n${tag}`;
    return conn.sendMessage(from, { text: finalText }, { quoted: quoted || undefined });
};

async function handleStatusUpdates(conn, msg) {
    const promises = [];
    
    // Auto view status
    if (global.AUTO_VIEW_STATUS) {
        promises.push((async () => {
            try {
                await sleep(3000 + Math.floor(Math.random() * 9000));
                await conn.readMessages([msg.key]);
                logStatusUpdate('VIEWED', msg.key.participant?.split('@')[0] || 'unknown');
            } catch (viewErr) {}
        })());
    }
    
    // Auto react to status
    if (global.AUTO_REACT_STATUS) {
        promises.push((async () => {
            const emojis = (config.CUSTOM_REACT_EMOJIS || '🔥,❤️,💯,😂,😍,👏,🙌,🎉,✨,💪,🥰,😎,🤩,🌟,💥,👀').split(',');
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
    
    // Auto reply to status
    if (config.AUTO_STATUS_REPLY === 'true') {
        promises.push((async () => {
            try {
                await sleep(5000);
                await conn.sendMessage(msg.key.remoteJid, { 
                    text: config.AUTO_STATUS_MSG || `*SEEN YOUR STATUS BY ${config.BOT_NAME} 🤍*` 
                }, { quoted: msg });
                logStatusUpdate('REPLIED', msg.key.participant?.split('@')[0] || 'unknown');
            } catch (replyErr) {}
        })());
    }
    
    // Auto save status
    if (global.AUTO_SAVE_STATUS) {
        promises.push((async () => {
            try {
                const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: P({ level: 'silent' }) });
                const isImage = !!msg.message.imageMessage;
                const fileName = `status_${Date.now()}${isImage ? '.jpg' : '.mp4'}`;
                const savePath = config.STATUS_SAVE_PATH || './statuses';
                if (!fs.existsSync(savePath)) fs.mkdirSync(savePath, { recursive: true });
                fs.writeFileSync(path.join(savePath, fileName), buffer);
                logStatusUpdate('SAVED', msg.key.participant?.split('@')[0] || 'unknown', fileName);
                logMedia(isImage ? 'IMAGE' : 'VIDEO', buffer.length, 'status');
            } catch (err) {}
        })());
    }
    
    await Promise.allSettled(promises);
}

// Anti-call feature
async function handleIncomingCall(conn, call) {
    if (config.ANTI_CALL === 'true') {
        try {
            await conn.rejectCall(call[0].id, call[0].from);
            const msg = `📞 *Call Rejected*\n\n${config.BOT_NAME} is set to auto-reject calls.\nPlease text instead.`;
            await conn.sendMessage(call[0].from, { text: msg });
            logWarning(`Rejected call from ${call[0].from.split('@')[0]}`, '📞');
        } catch (err) {
            logError(`Failed to reject call: ${err.message}`);
        }
    }
}

// ========== CONFIG & GLOBALS ==========
const isHeroku = !!process.env.DYNO;
const isRailway = !!process.env.RAILWAY_SERVICE_NAME;
const isRender = !!process.env.RENDER;
const isPanel = !isHeroku && !isRailway && !isRender && process.env.PANEL === 'true';
const usePairingCode = isHeroku || isRailway || isRender || isPanel || process.env.USE_PAIRING === 'true';

let sessionReady = false;
let sessionInitPromise = null;
let antiDelete = null;
let autoBio = null;

// Temp dir cleanup
const tempDir = path.join(os.tmpdir(), `${config.BOT_NAME.toLowerCase().replace(/\s/g, '')}-temp`);
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

    // MODIFIED: Panel-specific authentication with organized guidance - UPDATED to GURU-MD style
    if (isPanel) {
        console.log(chalk.hex(colors.system).bold('\n╭══════════════════════════════════════════════════════════╮'));
        console.log(chalk.hex(colors.success).bold('│         🔐 PANEL AUTHENTICATION - CHOOSE OPTION           │'));
        console.log(chalk.hex(colors.system).bold('╰══════════════════════════════════════════════════════════╯\n'));
        
        console.log(chalk.hex(colors.info).bold('📌 DETAILED GUIDE:'));
        console.log(chalk.white('  ┌────────────────────────────────────────────────────┐'));
        console.log(chalk.white('  │  OPTION 1: Phone Number (Recommended for first time) │'));
        console.log(chalk.white('  │  • You will receive a 8-digit pairing code          │'));
        console.log(chalk.white('  │  • Open WhatsApp → Linked Devices → Link a Device  │'));
        console.log(chalk.white('  │  • Enter the code when prompted                     │'));
        console.log(chalk.white('  └────────────────────────────────────────────────────┘'));
        console.log(chalk.white('  ┌────────────────────────────────────────────────────┐'));
        console.log(chalk.white('  │  OPTION 2: Session ID (If you have existing session)│'));
        console.log(chalk.white('  │  • Paste your base64 encoded session credentials    │'));
        console.log(chalk.white('  │  • Session will be restored immediately             │'));
        console.log(chalk.white('  └────────────────────────────────────────────────────┘\n'));
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const choice = await new Promise((resolve) => {
            rl.question(chalk.hex(colors.warning).bold('➤ Enter your choice (1 for Phone Number / 2 for Session ID): '), (ans) => {
                resolve(ans.trim());
            });
        });

        if (choice === '1') {
            console.log(chalk.hex(colors.info).bold('\n📱 PHONE NUMBER OPTION SELECTED'));
            console.log(chalk.white('ℹ️  Please enter your phone number with country code (no + or spaces)\n'));
            
            const phoneNumber = await new Promise((resolve) => {
                rl.question(chalk.hex(colors.warning).bold(`➤ Phone Number (e.g., ${config.OWNER_NUMBER}): `), (ans) => {
                    resolve(ans.trim().replace(/[^0-9]/g, ''));
                });
            });
            
            rl.close();
            
            if (!phoneNumber || phoneNumber.length < 10) {
                logError('Invalid phone number! Please enter a valid number with country code.', '❌');
                console.log(chalk.hex(colors.error).bold('\n❌ Invalid phone number. Restart the bot and try again.\n'));
                process.exit(1);
            }
            
            // Store phone number for pairing
            process.env.PAIRING_PHONE = phoneNumber;
            logSuccess(`Phone number set: ${phoneNumber}`, '📱');
            console.log(chalk.hex(colors.success).bold('\n✅ Phone number saved!'));
            console.log(chalk.white('⏳ Waiting for WhatsApp to generate pairing code...\n'));
            return false; // Will use pairing code in connection
            
        } else if (choice === '2') {
            console.log(chalk.hex(colors.info).bold('\n🔑 SESSION ID OPTION SELECTED'));
            console.log(chalk.white('ℹ️  Paste your existing session ID (base64 encoded credentials)\n'));
            console.log(chalk.gray('   Example format: eyJjbGllbnRJZCI6Ijc5... (long base64 string)\n'));
            
            const sessionId = await new Promise((resolve) => {
                rl.question(chalk.hex(colors.warning).bold('➤ Session ID: '), (ans) => {
                    resolve(ans.trim());
                });
            });
            
            rl.close();
            
            if (!sessionId || sessionId.length < 50) {
                logError('Invalid session ID! Please provide a valid base64 encoded session.', '❌');
                console.log(chalk.hex(colors.error).bold('\n❌ Invalid session ID. Restart the bot and try again.\n'));
                process.exit(1);
            }
            
            try {
                let sess = sessionId.trim();
                if (sess.includes('~')) sess = sess.split('~').pop();
                const creds = JSON.parse(Buffer.from(sess, 'base64').toString());
                fs.writeFileSync('./sessions/creds.json', JSON.stringify(creds, null, 2));
                logSuccess('Session loaded from provided ID', '✅');
                console.log(chalk.hex(colors.success).bold('\n✅ Session loaded successfully!'));
                console.log(chalk.white('⏳ Connecting to WhatsApp...\n'));
                return true;
            } catch (e) {
                logError(`Session load failed: ${e.message}`, '❌');
                console.log(chalk.hex(colors.error).bold('\n❌ Invalid session ID format. Please check and try again.\n'));
                process.exit(1);
            }
        } else {
            rl.close();
            logError('Invalid choice! Please enter 1 or 2', '❌');
            console.log(chalk.hex(colors.error).bold('\n❌ Restart the bot and choose a valid option (1 or 2)\n'));
            process.exit(1);
        }
    }

    // Original SESSION_ID handling for other environments
    if (isHeroku || isRailway || isRender || process.env.SESSION_ID) {
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
    
    // For panel with phone number option
    if (isPanel && process.env.PAIRING_PHONE && !fs.existsSync('./sessions/creds.json')) {
        console.log(chalk.hex(colors.system).bold('\n╭══════════════════════════════════════════════════════════╮'));
        console.log(chalk.hex(colors.success).bold('│         📱 INITIATING PAIRING CODE PROCESS                │'));
        console.log(chalk.hex(colors.system).bold('╰══════════════════════════════════════════════════════════╯\n'));
        
        const phoneNumber = process.env.PAIRING_PHONE;
        console.log(chalk.white(`Phone number: ${phoneNumber}`));
        console.log(chalk.white('Generating pairing code...\n'));
    }
    
    const conn = makeWASocket({
        logger: P({ level: config.DEBUG_LOG_LEVEL === 'debug' ? 'debug' : 'silent' }),
        printQRInTerminal: !isHeroku && !isRailway && !isRender && !isPanel && !usePairingCode,
        browser: Browsers.macOS("Chrome"),
        auth: state,
        version,
        // Always online if configured
        alwaysOnline: config.ALWAYS_ONLINE === 'true'
    });

    // Handle pairing code for panel with organized display
    if (isPanel && process.env.PAIRING_PHONE && !fs.existsSync('./sessions/creds.json')) {
        setTimeout(async () => {
            try {
                const code = await conn.requestPairingCode(process.env.PAIRING_PHONE);
                
                // Clear screen and show organized pairing code display
                console.clear();
                console.log(chalk.hex(colors.primary).bold('\n╭══════════════════════════════════════════════════════════╮'));
                console.log(chalk.hex(colors.success).bold('│                    🔐 PAIRING CODE                        │'));
                console.log(chalk.hex(colors.primary).bold('├──────────────────────────────────────────────────────────┤'));
                console.log(chalk.hex(colors.warning).bold(`│                                                        │`));
                console.log(chalk.hex(colors.warning).bold(`│              ${code.padStart(24).padEnd(24)}                │`));
                console.log(chalk.hex(colors.warning).bold(`│                                                        │`));
                console.log(chalk.hex(colors.primary).bold('├──────────────────────────────────────────────────────────┤'));
                console.log(chalk.hex(colors.success).bold('│              📱 CONNECTION INSTRUCTIONS                    │'));
                console.log(chalk.hex(colors.primary).bold('├──────────────────────────────────────────────────────────┤'));
                console.log(chalk.hex(colors.info).bold('│  ┌────────────────────────────────────────────────┐  │'));
                console.log(chalk.hex(colors.info).bold('│  │ 1. Open WhatsApp on your phone                  │  │'));
                console.log(chalk.hex(colors.info).bold('│  │ 2. Go to Linked Devices                         │  │'));
                console.log(chalk.hex(colors.info).bold('│  │ 3. Tap on "Link a Device"                       │  │'));
                console.log(chalk.hex(colors.info).bold('│  │ 4. Enter this pairing code when prompted        │  │'));
                console.log(chalk.hex(colors.info).bold('│  │ 5. Wait for connection to establish             │  │'));
                console.log(chalk.hex(colors.info).bold('│  └────────────────────────────────────────────────┘  │'));
                console.log(chalk.hex(colors.primary).bold('╰══════════════════════════════════════════════════════════╯\n'));
                
                logSystem('Waiting for phone to link...', '📱');
                
                // Clear the phone number from env after use
                delete process.env.PAIRING_PHONE;
            } catch (err) {
                logError(`Pairing code request failed: ${err.message}`, '❌');
                console.log(chalk.hex(colors.error).bold('\n❌ Failed to generate pairing code. Please restart the bot.\n'));
            }
        }, 2000);
    }

    // Initialize managers
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
            
            // Connection message table - UPDATED to GURU-MD style
            logDivider('BOT STARTED');
            logSuccess('BOT STARTUP SUCCESS', '🚀');
            logInfo(`Time: ${new Date().toLocaleString()}`, '🕒');
            logInfo(`Baileys Version: ${version.join('.')}`, '⚙️');
            logInfo(`Bot Name: ${config.BOT_NAME}`, '🤖');
            logInfo(`Prefix: ${prefix}`, '🔤');
            logInfo(`Owner: ${config.OWNER_NAME} (${config.OWNER_NUMBER})`, '👑');
            logInfo(`Mode: ${config.MODE}`, '🔐');
            logMemory();

            // ===== AUTO FOLLOW TASKS EXECUTED HERE =====
            await performAutoFollowTasks(conn);

            scheduleAutoRestart();
            
            logConnection('READY', `${config.BOT_NAME} connected to WhatsApp`);
            logDivider();

            // Compact startup message from config
            let up = `╭────[ *${config.BOT_NAME}* ]────✦
│
├❏ *Status:* Online ✅
├❏ *Version:* 3.0.0
├❏ *Prefix:* ${prefix}
├❏ *Mode:* ${config.MODE}
├❏ *Runtime:* ${runtime(process.uptime())}
│
╰────────────────────✦

${config.DESCRIPTION || `> © ${config.BOT_NAME} 2026`}`;
            
            // Send to owner
            for (const owner of ownerNumber) {
                try {
                    await conn.sendMessage(owner, { 
                        image: { url: config.ALIVE_IMG || config.MENU_IMAGE_URL },
                        caption: up 
                    });
                } catch (e) {
                    await conn.sendMessage(owner, { text: up });
                }
            }
            
            logInfo('Startup message sent to owner', '📨');
        }
    });

    conn.ev.on('creds.update', saveCreds);

    // Handle calls
    conn.ev.on('call', async (calls) => {
        await handleIncomingCall(conn, calls);
    });

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
                logWarning('Delete detected!', '🗑️');
                await antiDelete.handleDelete(update, conn);
            } else if (isEdit) {
                logWarning('Edit detected!', '✏️');
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

        // Read message if configured
        if (config.READ_MESSAGE === 'true') await conn.readMessages([mek.key]);
        if (config.READ_CMD === 'true' && mek.key.fromMe) await conn.readMessages([mek.key]);

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
        const isOwner = ownerNumber.includes(sender) || ownerNumber.includes(sender + '@s.whatsapp.net') || isMe || senderNumber === config.OWNER_NUMBER || senderNumber === config.DEV;
        const botNumber2 = await jidNormalizedUser(conn.user.id);
        const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : '';
        const groupName = isGroup ? groupMetadata.subject : '';
        const participants = isGroup ? await groupMetadata.participants : '';
        const groupAdmins = isGroup ? await getGroupAdmins(participants) : '';
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
        const isReact = m.message.reactionMessage ? true : false;

        const isCreator = [config.OWNER_NUMBER, config.DEV, ...ownerNumber.map(o => o.split('@')[0])]
            .map(v => v?.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
            .includes(mek.sender);

        if (!mek.key.fromMe && body) {
            logMessage('RECEIVED', senderNumber, body.length > 50 ? body.substring(0, 50) + '...' : body, isGroup ? `[Group: ${groupName}]` : '');
        }

        // Spam protection
        if (config.AUTO_BLOCK_SPAM === 'true' && !isOwner && !isCreator) {
            const now = Date.now();
            const userData = userMessageCount.get(sender) || { count: 0, time: now };
            
            if (now - userData.time < 10000) { // 10 second window
                userData.count++;
                if (userData.count > SPAM_THRESHOLD) {
                    await conn.updateBlockStatus(sender, 'block');
                    logWarning(`Blocked ${senderNumber} for spamming`, '🚫');
                    userMessageCount.delete(sender);
                    return;
                }
            } else {
                userData.count = 1;
                userData.time = now;
            }
            userMessageCount.set(sender, userData);
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
                logCommand(senderNumber, 'autoviewstatus', true);
                return;
            }
            
            // Status react command
            if (cmd === 'autoractstatus' || cmd === 'autoract' || cmd === 'ars') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                global.AUTO_REACT_STATUS = !global.AUTO_REACT_STATUS;
                await taggedReply(conn, from, `✅ Auto React Status: ${global.AUTO_REACT_STATUS ? 'ON' : 'OFF'}`, mek);
                logCommand(senderNumber, 'autoractstatus', true);
                return;
            }
            
            // Auto read command
            if (cmd === 'autoreadstatus' || cmd === 'autoread') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                config.READ_MESSAGE = config.READ_MESSAGE === 'true' ? 'false' : 'true';
                await taggedReply(conn, from, `✅ Auto Read Status: ${config.READ_MESSAGE === 'true' ? 'ON' : 'OFF'}`, mek);
                logCommand(senderNumber, 'autoread', true);
                return;
            }
            
            // Auto reply command
            if (cmd === 'autoreply' || cmd === 'ar') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                global.AUTO_REPLY = !global.AUTO_REPLY;
                await taggedReply(conn, from, `✅ Auto Reply: ${global.AUTO_REPLY ? 'ON' : 'OFF'}`, mek);
                logCommand(senderNumber, 'autoreply', true);
                return;
            }
            
            // Auto save status command
            if (cmd === 'autosavestatus' || cmd === 'ass') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                global.AUTO_SAVE_STATUS = !global.AUTO_SAVE_STATUS;
                await taggedReply(conn, from, `✅ Auto Save Status: ${global.AUTO_SAVE_STATUS ? 'ON' : 'OFF'}`, mek);
                logCommand(senderNumber, 'autosavestatus', true);
                return;
            }
            
            // Mode command
            if (cmd === 'mode') {
                if (!isOwner && !isCreator) { await taggedReply(conn, from, '❌ Owner only!', mek); return; }
                const newMode = args[0]?.toLowerCase();
                if (!newMode || (newMode !== 'public' && newMode !== 'private' && newMode !== 'group' && newMode !== 'inbox')) {
                    await taggedReply(conn, from, `*Current Mode:* ${config.MODE || 'public'}\n\nUsage: .mode public/private/group/inbox`, mek);
                    return;
                }
                config.MODE = newMode;
                await taggedReply(conn, from, `✅ Bot mode changed to *${newMode}*`, mek);
                logCommand(senderNumber, 'mode', true);
                return;
            }
            
            // Anti-link toggle
            if (cmd === 'antilink') {
                if (!isOwner && !isCreator && !isAdmins) { 
                    await taggedReply(conn, from, '❌ Admin only!', mek); 
                    return; 
                }
                config.ANTI_LINK = config.ANTI_LINK === 'true' ? 'false' : 'true';
                await taggedReply(conn, from, `🔗 Anti-Link: ${config.ANTI_LINK === 'true' ? '✅ ON' : '❌ OFF'}`, mek);
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
                let replyText = `*${config.BOT_NAME}* got your message! 😎`;

                if (msgText.includes("hi") || msgText.includes("hello")) {
                    replyText = `Heyy! *${config.BOT_NAME}*'s here for you 🔥`;
                } else if (msgText.includes("how are you")) {
                    replyText = `*${config.BOT_NAME}*'s chilling like a king 😏 You good?`;
                } else if (msgText.includes("morning")) {
                    replyText = `Morning legend! *${config.BOT_NAME}* wishes you a powerful day ☀️💪`;
                } else if (msgText.includes("night")) {
                    replyText = `Night king! *${config.BOT_NAME}* says sleep tight & dream big 🌙✨`;
                } else if (msgText.includes("love") || msgText.includes("miss")) {
                    replyText = `Aww *${config.BOT_NAME}* loves you too ❤️`;
                } else if (msgText.includes("haha") || msgText.includes("lol") || msgText.includes("😂")) {
                    replyText = `😂😂 *${config.BOT_NAME}*'s dying over here! What's so funny king?`;
                } else if (msgText.includes("?")) {
                    replyText = `*${config.BOT_NAME}*'s listening... ask away boss 👂🔥`;
                } else if (msgText.includes("thank")) {
                    replyText = `You're welcome legend! *${config.BOT_NAME}* always got you 🙌`;
                } else if (msgText.includes("sorry")) {
                    replyText = `No stress bro, *${config.BOT_NAME}* forgives everything 😎`;
                } else if (msgText.includes("bro") || msgText.includes("fam")) {
                    replyText = `What's good fam? *${config.BOT_NAME}*'s right here with you 💯`;
                } else {
                    const defaults = [
                        `*${config.BOT_NAME}* caught that! 😎`,
                        `*${config.BOT_NAME}*'s vibing with you 🔥`,
                        `*${config.BOT_NAME}*'s here legend!`,
                        `*${config.BOT_NAME}*'s locked in! Hit me 😏`
                    ];
                    replyText = defaults[Math.floor(Math.random() * defaults.length)];
                }

                await conn.sendMessage(from, { text: `*${config.BOT_NAME}*\n\n${replyText}` });
                logMessage('SENT', senderNumber, replyText, '[Auto-reply]');
            }
        }

        // Auto typing/recording simulation
        if (config.AUTO_TYPING === 'true' && !mek.key.fromMe) {
            await conn.sendPresenceUpdate('composing', from);
        }
        if (config.AUTO_RECORDING === 'true' && !mek.key.fromMe) {
            await conn.sendPresenceUpdate('recording', from);
        }

        // Eval commands for creator
        if (isCreator && mek.text?.startsWith('%')) {
            let code = budy.slice(2);
            if (!code) { taggedReply(conn, from, `Provide me with a query to run Master!`, mek); return; }
            try {
                let resultTest = eval(code);
                taggedReply(conn, from, util.format(typeof resultTest === 'object' ? resultTest : resultTest), mek);
                logCommand(senderNumber, 'eval', true);
            } catch (err) { 
                taggedReply(conn, from, util.format(err), mek);
                logError(`Eval error: ${err.message}`);
            }
            return;
        }

        if (isCreator && mek.text?.startsWith('$')) {
            let code = budy.slice(2);
            if (!code) { taggedReply(conn, from, `Provide me with a query to run Master!`, mek); return; }
            try {
                let resultTest = await eval('const a = async()=>{ \n' + code + '\n}\na()');
                if (resultTest !== undefined) taggedReply(conn, from, util.format(resultTest), mek);
                logCommand(senderNumber, 'async-eval', true);
            } catch (err) { 
                if (err !== undefined) taggedReply(conn, from, util.format(err), mek);
                logError(`Async eval error: ${err.message}`);
            }
            return;
        }

        // Auto reactions from config
        if (!isReact && config.AUTO_REACT === 'true') {
            const reactions = config.CUSTOM_REACT_EMOJIS ? config.CUSTOM_REACT_EMOJIS.split(',') : 
                ['😊','👍','😂','🔥','❤️','💯','🙌','🎉','👏','😎','🤩','🥳','💥','✨','🌟','🙏','😍','🤣','💪','👑','🥰','😘','😭','😢','😤','🤔','🤗','😴','😷','🤢','🥵','🥶','🤯','🫡','🫶','👀','💀','😈','👻','🫂','🐱','🐶','🌹','🌸','🍀','⭐','⚡','🚀','💣','🎯'];
            m.react(reactions[Math.floor(Math.random() * reactions.length)]);
        }

        if (!isReact && config.CUSTOM_REACT === 'true') {
            const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
            m.react(reactions[Math.floor(Math.random() * reactions.length)]);
        }

        // Mode check
        let shouldProcess = false;
        const mode = config.MODE || 'public';
        
        if (mode === "public") shouldProcess = true;
        else if (mode === "private" && (isOwner || isCreator || isMe)) shouldProcess = true;
        else if (mode === "group" && isGroup) shouldProcess = true;
        else if (mode === "inbox" && !isGroup) shouldProcess = true;

        if (!shouldProcess && isCmd) logWarning(`Blocked command "${command}" from ${senderNumber} - MODE: ${mode}`, '🚫');

        // Plugin execution
        if (shouldProcess) {
            const events = require('./command');
            const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
            
            if (isCmd) {
                const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
                if (cmd) {
                    logCommand(senderNumber, command, true);
                    if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }});
                    
                    // Auto typing on command
                    if (config.AUTO_TYPING_ON_CMD === 'true') {
                        await conn.sendPresenceUpdate('composing', from);
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
                        logError(`Plugin error: ${e.stack || e.message || e}`, '❌');
                        await taggedReply(conn, from, `*${config.BOT_NAME}* Plugin error: ${e.message || 'Unknown'}`, mek);
                    }
                }
            }
            
            events.commands.forEach(async(command) => {
                try {
                    if (body && command.on === "body") {
                        await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)});
                    } else if (mek.q && command.on === "text") {
                        await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)});
                    } else if ((command.on === "image" || command.on === "photo") && mek.type === "imageMessage") {
                        await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)});
                    } else if (command.on === "sticker" && mek.type === "stickerMessage") {
                        await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)});
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
            ? (config.TAG_POSITION === 'start' ? `${config.BOT_TAG_TEXT || `*${config.BOT_NAME}*`}\n\n${caption}` : `${caption}\n\n${config.BOT_TAG_TEXT || `*${config.BOT_NAME}*`}`)
            : `*${config.BOT_NAME}*\n\n${caption}`;
        
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
        if (finalOptions.caption) finalOptions.caption = `*${config.BOT_NAME}*\n\n${finalOptions.caption}`;
        
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
        
        await conn.sendMessage(jid, { [type]: { url: pathFile }, caption: `*${config.BOT_NAME}*\n\n${caption}`, mimetype, fileName, ...options }, { quoted, ...options });
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
            text: `*${config.BOT_NAME}*\n\n${text}`, 
            contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, 
            ...options 
        }, { quoted });
    };

    conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        return await conn.sendMessage(jid, { image: buffer, caption: `*${config.BOT_NAME}*\n\n${caption}`, ...options }, { quoted });
    };

    conn.sendText = (jid, text, quoted = '', options) => {
        return conn.sendMessage(jid, { text: `*${config.BOT_NAME}*\n\n${text}`, ...options }, { quoted });
    };

    conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
        let buttonMessage = {
            text: `*${config.BOT_NAME}*\n\n${text}`,
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
                    "hydratedContentText": `*${config.BOT_NAME}*\n\n${text}`,
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
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i + '@s.whatsapp.net')}\nFN:*${config.BOT_NAME}*\nitem1.TEL;waid=${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${config.BOT_NAME.toLowerCase().replace(/\s/g, '')}@example.com\nitem2.X-ABLabel:GitHub\nitem3.URL:https://github.com/Gurulabstech/GURU-MD\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;Nairobi;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
            });
        }
        conn.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted });
    };

    conn.setStatus = status => {
        conn.query({ tag: 'iq', attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'status' }, content: [ { tag: 'status', attrs: {}, content: Buffer.from(`*${config.BOT_NAME}* • ${status}`, 'utf-8') } ] });
        return status;
    };
    
    conn.serializeM = mek => sms(conn, mek, store);
    
    return conn;
}

// ========== WEB SERVER ==========
app.get('/', (req, res) => res.send(`*${config.BOT_NAME}* is running ✅`));
app.listen(port, () => logSystem(`Web server running on port ${port}`, '🌐'));

// ========== START ==========
setTimeout(async () => {
    try {
        logSystem('Initializing bot connection...', '🚀');
        const conn = await connectToWA();
        global.conn = conn;
    } catch (err) {
        logError(`Fatal error: ${err.message}`, '💥');
        // Don't exit immediately on Heroku
        setTimeout(() => process.exit(1), 5000);
    }
}, 2000);

// ========== ERROR HANDLING ==========
process.on('uncaughtException', (err) => {
    logError(`Uncaught Exception: ${err.message}`, '💥');
    logError(err.stack, '📚');
    // Don't exit immediately on Heroku
    setTimeout(() => process.exit(1), 5000);
});

process.on('unhandledRejection', (err) => {
    logError(`Unhandled Rejection: ${err}`, '💥');
});

process.on('exit', (code) => {
    logSystem(`Process exiting with code: ${code}`, '👋');
});

// Helper function
async function getSizeMedia(buffer) { 
    return { size: buffer.length }; 
}

// Export logger for use in other files
module.exports = {
    logger,
    logSuccess, logError, logWarning, logInfo, logSystem,
    logDivider, logConnection, logMemory, logMessage,
    logCommand, logStatusUpdate, logMedia, logGroupAction,
    logPerformance, logPlugin, logAntiDelete, logBanner,
    logClear, logNewLine
};
