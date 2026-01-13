const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    // ──────────────── Core Settings ────────────────
    SESSION_ID: process.env.SESSION_ID || "",
    PREFIX: process.env.PREFIX || ".",
    BOT_NAME: process.env.BOT_NAME || "GURU MD",
    STICKER_NAME: process.env.STICKER_NAME || "GURU MD",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "254778074353",
    OWNER_NAME: process.env.OWNER_NAME || "GuruTech",
    DEV: process.env.DEV || "254778074353",
    DESCRIPTION: process.env.DESCRIPTION || "*© ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech*",
    MODE: process.env.MODE || "public", // public, private, group, inbox

    // ──────────────── Status Features ────────────────
    AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "true",
    AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
    AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*SEEN YOUR STATUS BY GURU MD 🤍*",

    // ──────────────── Anti & Protection ────────────────
    ANTI_LINK: process.env.ANTI_LINK || "true",
    ANTI_LINK_KICK: process.env.ANTI_LINK_KICK || "false",
    DELETE_LINKS: process.env.DELETE_LINKS || "true",
    ANTI_BAD: process.env.ANTI_BAD || "false",
    ANTI_VV: process.env.ANTI_VV || "true", // Anti view once
    ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "log", // 'same' to resend in chat

    // ──────────────── Auto Features ────────────────
    AUTO_REACT: process.env.AUTO_REACT || "false",
    CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
    CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",
    AUTO_VOICE: process.env.AUTO_VOICE || "false",
    AUTO_STICKER: process.env.AUTO_STICKER || "false",
    AUTO_REPLY: process.env.AUTO_REPLY || "false",
    AUTO_TYPING: process.env.AUTO_TYPING || "false",
    AUTO_RECORDING: process.env.AUTO_RECORDING || "true",
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true",
    READ_MESSAGE: process.env.READ_MESSAGE || "false",
    READ_CMD: process.env.READ_CMD || "false",

    // ──────────────── Group Features ────────────────
    WELCOME: process.env.WELCOME || "true",
    ADMIN_EVENTS: process.env.ADMIN_EVENTS || "false",

    // ──────────────── Visuals & Media ────────────────
    MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://files.catbox.moe/ntfw9h.jpg",
    ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/ntfw9h.jpg",
    LIVE_MSG: process.env.LIVE_MSG || "> Zinda Hun Yar *GURU MD* ⚡",

    // ──────────────── NEW & ADVANCED OPTIONS (2026) ────────────────
    AUTO_VIEW_STATUS: process.env.AUTO_VIEW_STATUS || "true",        // Auto mark status as seen
    AUTO_SAVE_STATUS: process.env.AUTO_SAVE_STATUS || "false",      // Auto-download statuses to folder
    STATUS_SAVE_PATH: process.env.STATUS_SAVE_PATH || "./statuses", // Where to save statuses
    ANTI_CALL: process.env.ANTI_CALL || "true",                     // Reject incoming calls
    AUTO_BLOCK_SPAM: process.env.AUTO_BLOCK_SPAM || "false",        // Block users spamming
    SPAM_THRESHOLD: process.env.SPAM_THRESHOLD || 5,                // Messages in 10s to consider spam
    PUBLIC_MODE: process.env.PUBLIC_MODE || "true",                 // Allow non-contacts to use bot
    ANTI_DELETE: process.env.ANTI_DELETE || "true",                 // Detect & log deleted messages
    AUTO_TYPING_ON_CMD: process.env.AUTO_TYPING_ON_CMD || "true",   // Show typing when processing cmds
    AUTO_READ_RECEIPTS: process.env.AUTO_READ_RECEIPTS || "true",   // Send blue ticks automatically

    // Add more here if you want (future-proof)
    // MAX_GROUP_LIMIT: process.env.MAX_GROUP_LIMIT || 10,
    // AUTO_BACKUP: process.env.AUTO_BACKUP || "false",
};
