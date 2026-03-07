/* ============================================
   GURU MD - DYNAMIC VERTICAL MENU (FIXED)
   Style: All Commands Line-by-Line with Categories
   Version: 30.0.0 | 2026 Edition
   ============================================ */

const config = require('../config');
const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');

// IMPORTANT: Import commands from command.js
const { commands } = require('../command');

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
        
        // Get all plugins count
        const pluginsDir = path.join(__dirname, '../plugins');
        const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
        
        // Get all commands from the imported commands array
        const allCommands = commands || [];
        
        console.log('Total commands found:', allCommands.length); // Debug log
        
        // Group commands by category
        const categories = {};
        
        allCommands.forEach(cmd => {
            // Skip commands that shouldn't be in menu
            if (cmd.dontAddCommandList) return;
            
            const category = cmd.category || 'misc';
            if (!categories[category]) {
                categories[category] = [];
            }
            // Use pattern or if pattern doesn't exist, try to get from the command
            const commandName = cmd.pattern || (cmd.pattern ? cmd.pattern.toString() : 'unknown');
            categories[category].push(commandName);
        });
        
        // Sort commands alphabetically in each category
        Object.keys(categories).forEach(key => {
            categories[key].sort();
        });
        
        // Calculate total visible commands
        const totalVisibleCommands = allCommands.filter(cmd => !cmd.dontAddCommandList).length;
        
        // Build menu header
        let menuText = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃      𝗚𝗨𝗥𝗨-𝗠𝗗 𝗩𝟯𝟬.𝟬.𝟬       ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 👋 *Hello,* ${pushname || 'User'}
┃ 📊 *System Stats:*
┃ ├─ 📁 Plugins: ${pluginFiles.length}
┃ ├─ 🔧 Commands: ${totalVisibleCommands}
┃ ├─ ⏱️ Uptime: ${uptime}
┃ └─ 🛡️ Mode: ${config.MODE || 'public'}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
`;

        // Add each category with all commands vertically
        const categoryEmojis = {
            'main': '🏠',
            'ai': '🤖',
            'downloader': '📥',
            'group': '👥',
            'games': '🎮',
            'fun': '🎉',
            'tools': '🛠️',
            'owner': '👑',
            'misc': '📌'
        };
        
        // Check if we have any categories with commands
        if (Object.keys(categories).length === 0) {
            menuText += `┃ ⚠️ *No commands found in categories*\n`;
            menuText += `┃ └─ Check if plugins are loading correctly\n`;
            menuText += `┃\n`;
        } else {
            // Sort categories (owner last, main first)
            const sortedCategories = Object.keys(categories).sort((a, b) => {
                if (a === 'owner') return 1;
                if (b === 'owner') return -1;
                if (a === 'main') return -1;
                if (b === 'main') return 1;
                return a.localeCompare(b);
            });
            
            for (const category of sortedCategories) {
                const cmds = categories[category];
                if (cmds.length > 0) {
                    const emoji = categoryEmojis[category.toLowerCase()] || '📌';
                    const categoryName = category.toUpperCase();
                    menuText += `┃ ${emoji} *${categoryName}* (${cmds.length})\n`;
                    
                    // Add each command on its own line with vertical tree
                    cmds.forEach((cmdName, index) => {
                        const isLast = index === cmds.length - 1;
                        // Clean up command name (remove any special characters if needed)
                        const cleanCmd = cmdName.toString().replace(/\s+/g, ' ');
                        menuText += `┃ ${isLast ? '└─' : '├─'} ${p}${cleanCmd}\n`;
                    });
                    menuText += `┃\n`;
                }
            }
        }

        // Add footer with stylish separator
        menuText += `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🧷 ──── ✦ ──── 🧷
┃ 📊 *TOTAL ACTIVE:* ${totalVisibleCommands} COMMANDS
┃ 📁 *PLUGINS LOADED:* ${pluginFiles.length}
┃ ⚡ *PREFIX:* ${p}
┃ 💡 *Type ${p}help <command> for details*
┃
┃ *© 2026 GURU-TECH SYSTEMS*
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`;

        console.log('Menu text length:', menuText.length); // Debug log

        // Send the menu with image
        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: menuText,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363421164015033@newsletter',
                    newsletterName: '𝐆𝐔𝐑𝐔 𝐌𝐃 • 𝐌𝐄𝐍𝐔',
                    serverMessageId: 143
                },
                externalAdReply: {
                    title: `✨ GURU-MD ✨`,
                    body: `📊 ${totalVisibleCommands} Commands • ${pluginFiles.length} Plugins`,
                    mediaType: 1,
                    sourceUrl: `https://github.com/itsguruu/GURUH`,
                    thumbnailUrl: imageUrl,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error('Menu Error:', err);
        await conn.sendMessage(from, { 
            text: "❌ Error loading menu: " + err.message 
        }, { quoted: mek });
    }
});

// Add a debug command to check commands
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
            response += `Check if plugins are loading properly.`;
        }
        
        await conn.sendMessage(from, { text: response }, { quoted: mek });
    } catch (err) {
        await conn.sendMessage(from, { text: `Error: ${err.message}` }, { quoted: mek });
    }
});

module.exports = { cmd };
