/* ============================================
   GURU MD - SLICK VERTICAL MENU
   Style: Clean Line Design with Real Version
   Version: 30.0.0 | 2026 Edition
   ============================================ */

const config = require('../config');
const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const { version } = require('../package.json'); // Get real version from package.json

function runtime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

cmd({
    pattern: "menu",
    react: "📋",
    desc: "Show all bot commands",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from, pushname, isOwner }) => {
    try {
        const p = config.PREFIX || ',';
        const uptime = runtime(process.uptime());
        const imageUrl = "https://files.catbox.moe/66h86e.jpg";
        
        // Get real version from package.json or use default
        const botVersion = version || "30.0.0";
        
        // Get all plugins count
        const pluginsDir = path.join(__dirname, '../plugins');
        const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
        
        // Get all commands from the imported commands array
        const { commands } = require('../command');
        const allCommands = commands || [];
        
        // Group commands by category
        const categories = {};
        
        allCommands.forEach(cmd => {
            if (cmd.dontAddCommandList) return;
            const category = cmd.category || 'misc';
            if (!categories[category]) {
                categories[category] = [];
            }
            const commandName = cmd.pattern || 'unknown';
            categories[category].push(commandName);
        });
        
        // Sort commands alphabetically in each category
        Object.keys(categories).forEach(key => {
            categories[key].sort();
        });
        
        const totalVisibleCommands = allCommands.filter(cmd => !cmd.dontAddCommandList).length;
        
        // Clean header - removed box borders, cleaner design
        let menuText = `
╭── ❖ *ＧＵＲＵ ＭＤ* ❖ v${botVersion}
│ 👋 𝐇𝐞𝐥𝐥𝐨, ${pushname || 'User'}
│ 📊 𝐒𝐲𝐬𝐭𝐞𝐦 𝐒𝐭𝐚𝐭𝐬:
│  │ 📁 𝐏𝐥𝐮𝐠𝐢𝐧𝐬: ${pluginFiles.length}
│  │ 🔧 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬: ${totalVisibleCommands}
│  │ ⏱️ 𝐔𝐩𝐭𝐢𝐦𝐞: ${uptime}
│  └ 🛡️ 𝐌𝐨𝐝𝐞: ${config.MODE || 'public'}
│
`;

        // Category emojis mapping
        const categoryEmojis = {
            'main': '🏠',
            'ai': '🤖',
            'downloader': '📥',
            'group': '👥',
            'games': '🎮',
            'fun': '🎉',
            'tools': '🛠️',
            'owner': '👑',
            'admin': '⚡',
            'audio': '🎵',
            'anime': '🌸',
            'info': 'ℹ️',
            'search': '🔍',
            'sticker': '🖼️',
            'utility': '🔧',
            'utilities': '🔧',
            'convert': '🔄',
            'media': '🎬',
            'privacy': '🔒',
            'wallpapers': '🖥️',
            'misc': '📌'
        };
        
        // Sort categories
        const sortedCategories = Object.keys(categories).sort((a, b) => {
            if (a === 'owner') return 1;
            if (b === 'owner') return -1;
            if (a === 'main') return -1;
            if (b === 'main') return 1;
            return a.localeCompare(b);
        });
        
        // Add each category with commands
        for (const category of sortedCategories) {
            const cmds = categories[category];
            if (cmds.length > 0) {
                const emoji = categoryEmojis[category.toLowerCase()] || '📌';
                const categoryName = category.toUpperCase();
                menuText += `╭── ${emoji} *${categoryName}* [${cmds.length}]\n`;
                
                cmds.forEach((cmdName, index) => {
                    const isLast = index === cmds.length - 1;
                    const prefix = isLast ? '└──' : '├──';
                    menuText += `│ ${prefix} ${p}${cmdName}\n`;
                });
                menuText += `│\n`;
            }
        }

        // Simple channel line with the requested separator
        menuText += `╰── 🧷 ──── ✦ ──── 🧷\n`;
        menuText += `    *© 2026 GURU-TECH SYSTEMS*\n`;

        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: menuText,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363421164015033@newsletter',
                    newsletterName: '𝐆𝐔𝐑𝐔 𝐌𝐃',
                    serverMessageId: 143
                },
                externalAdReply: {
                    title: `GURU MD v${botVersion}`,
                    body: `${totalVisibleCommands} Commands • ${pluginFiles.length} Plugins`,
                    mediaType: 1,
                    sourceUrl: `https://github.com/Gurulabstech/GURU-MD`,
                    thumbnailUrl: imageUrl,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error('Menu Error:', err);
        await conn.sendMessage(from, { 
            text: "❌ Error loading menu. Please try again." 
        }, { quoted: mek });
    }
});

// Keep the check command for debugging
cmd({
    pattern: "check",
    react: "🔍",
    desc: "Check commands in system",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const { commands } = require('../command');
        const allCmds = commands || [];
        
        let response = `*📊 COMMANDS DEBUG*\n\n`;
        response += `Total in array: ${allCmds.length}\n\n`;
        
        if (allCmds.length > 0) {
            response += `First 5 commands:\n`;
            allCmds.slice(0, 5).forEach((cmd, i) => {
                response += `${i+1}. Pattern: ${cmd.pattern} | Category: ${cmd.category}\n`;
            });
        } else {
            response += `⚠️ No commands found in array!\n`;
        }
        
        await conn.sendMessage(from, { text: response }, { quoted: mek });
    } catch (err) {
        await conn.sendMessage(from, { text: `Error: ${err.message}` }, { quoted: mek });
    }
});

module.exports = { cmd };
