/* ============================================
   GURU MD - DYNAMIC VERTICAL MENU
   Style: All Commands Line-by-Line with Categories
   Version: 30.0.0 | 2026 Edition
   ============================================ */

const config = require('../config');
const { cmd, commands } = require('../command');
const fs = require('fs');
const path = require('path');

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
        const p = config.PREFIX || '.';
        const uptime = runtime(process.uptime());
        const imageUrl = "https://files.catbox.moe/66h86e.jpg";
        
        // Get all plugins count
        const pluginsDir = path.join(__dirname, '../plugins');
        const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
        
        // Get all commands from the global commands array
        const allCommands = global.commands || [];
        
        // Group commands by category
        const categories = {};
        
        allCommands.forEach(cmd => {
            // Skip commands that shouldn't be in menu
            if (cmd.dontAddCommandList) return;
            
            const category = cmd.category || 'misc';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(cmd.pattern);
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
┃ 👋 *Hello,* ${pushname}
┃ 📊 *System Stats:*
┃ ├─ 📁 Plugins: ${pluginFiles.length}
┃ ├─ 🔧 Commands: ${totalVisibleCommands}
┃ ├─ ⏱️ Uptime: ${uptime}
┃ └─ 🛡️ Mode: ${config.MODE}
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
                    menuText += `┃ ${isLast ? '└─' : '├─'} ${p}${cmdName}\n`;
                });
                menuText += `┃\n`;
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
            text: "❌ Error loading menu. Please try again." 
        }, { quoted: mek });
    }
});

// Add a command to list all plugins
cmd({
    pattern: "plugins",
    react: "📁",
    desc: "List all installed plugins",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const pluginsDir = path.join(__dirname, '../plugins');
        const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
        
        let pluginList = `┏━━━━━━━━━━━━━━━━━━━━━━┓
┃   𝗜𝗡𝗦𝗧𝗔𝗟𝗟𝗘𝗗 𝗣𝗟𝗨𝗚𝗜𝗡𝗦   ┃
┣━━━━━━━━━━━━━━━━━━━━━━┫\n`;
        
        pluginFiles.forEach((file, index) => {
            const isLast = index === pluginFiles.length - 1;
            pluginList += `┃ ${isLast ? '└─' : '├─'} 📌 ${file}\n`;
        });
        
        pluginList += `┗━━━━━━━━━━━━━━━━━━━━━━┛\n`;
        pluginList += `\n📊 *Total:* ${pluginFiles.length} plugins`;
        
        await conn.sendMessage(from, {
            text: pluginList,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1,
                isForwarded: true
            }
        }, { quoted: mek });
        
    } catch (err) {
        console.error('Plugins List Error:', err);
    }
});

module.exports = { cmd };
