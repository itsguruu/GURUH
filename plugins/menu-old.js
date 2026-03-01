const config = require('../config');
const { cmd } = require('../command');

// ================= RUNTIME =================
function runtime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

// ================= GREETING =================
function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "🌅 Good Morning";
    if (hour < 17) return "🌞 Good Afternoon";
    if (hour < 21) return "🌆 Good Evening";
    return "🌙 Good Night";
}

// ================= MAIN MENU =================
cmd({
    pattern: "menu",
    desc: "Ultra interactive menu",
    category: "menu",
    react: "🚀",
    filename: __filename
},
async (conn, mek, m, { from, pushname, isOwner }) => {

    try {
        const pushName = pushname || 'User';
        const time = new Date().toLocaleTimeString();
        const date = new Date().toLocaleDateString();
        const up = runtime(process.uptime());
        const mode = config.MODE || 'public';
        const prefix = config.PREFIX || '.';

        const caption = `
╭━━━〔 ⚡ GURU MD SYSTEM ⚡ 〕━━━⬣
┃ 👋 ${greeting()}, ${pushName}
┃ 🕒 Time   : ${time}
┃ 📅 Date   : ${date}
┃ ⏳ Uptime : ${up}
┃ 🛠 Mode   : ${mode}
┃ ⚙ Prefix : ${prefix}
┃ 🚀 Version: 9.0.0 Ultra
┃ 👑 Owner  : ${isOwner ? '✅ Yes' : '❌ No'}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

💎 Choose how you want to open the menu below
`;

        // ===== BUTTON MENU =====
        const buttons = [
            { 
                buttonId: `${prefix}listmenu`, 
                buttonText: { displayText: "📋 List Menu" }, 
                type: 1 
            },
            { 
                buttonId: `${prefix}imgmenu`, 
                buttonText: { displayText: "🖼 Image Menu" }, 
                type: 1 
            },
            { 
                buttonId: `${prefix}categories`, 
                buttonText: { displayText: "📂 Categories" }, 
                type: 1 
            }
        ];

        // Send image with buttons
        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/66h86e.jpg" },
            caption: caption,
            footer: "✨ Powered By GuruTech Lab",
            buttons: buttons,
            headerType: 4,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363317350733296@newsletter',
                    newsletterName: 'GURU MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // ===== MENU SOUND =====
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });

    } catch (err) {
        console.log('Menu error:', err);
        await conn.sendMessage(from, { 
            text: '❌ Error loading menu. Please try again.' 
        }, { quoted: mek });
    }
});

// ================= LIST MENU =================
cmd({
    pattern: "listmenu",
    desc: "List style menu",
    category: "menu",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const prefix = config.PREFIX || '.';
        
        const sections = [
            {
                title: "🤖 AI & SEARCH COMMANDS",
                highlight_label: "Popular",
                rows: [
                    { title: "🤖 AI Menu", description: "AI and chatbot commands", id: `${prefix}aimenu` },
                    { title: "📖 Quran Menu", description: "Quran verses and recitations", id: `${prefix}quranmenu` },
                    { title: "🕌 Prayer Times", description: "Islamic prayer timings", id: `${prefix}prayertime` },
                    { title: "🔍 Search", description: "Internet search commands", id: `${prefix}searchmenu` }
                ]
            },
            {
                title: "⬇️ DOWNLOAD CENTER",
                rows: [
                    { title: "🎵 Download Menu", description: "Video & audio downloads", id: `${prefix}dlmenu` },
                    { title: "📥 Media Download", description: "Social media downloads", id: `${prefix}mediadl` }
                ]
            },
            {
                title: "👥 GROUP MANAGEMENT",
                rows: [
                    { title: "👥 Group Menu", description: "Group management tools", id: `${prefix}groupmenu` },
                    { title: "🛡️ Admin Tools", description: "Group admin commands", id: `${prefix}adminmenu` }
                ]
            },
            {
                title: "🎮 FUN & GAMES",
                rows: [
                    { title: "🎮 Fun Menu", description: "Fun and games", id: `${prefix}funmenu` },
                    { title: "🎲 Games", description: "Interactive games", id: `${prefix}games` }
                ]
            },
            {
                title: "👑 OWNER & BOT SETTINGS",
                rows: [
                    { title: "👑 Owner Menu", description: "Bot owner commands", id: `${prefix}ownermenu` },
                    { title: "⚙️ Settings", description: "Bot configuration", id: `${prefix}settings` }
                ]
            }
        ];

        const listMessage = {
            text: "📋 *SELECT A MENU CATEGORY*\n\nChoose from the options below to view specific commands:",
            footer: "GURU MD ULTRA • Version 9.0.0",
            title: "🌟 MAIN MENU CATEGORIES",
            buttonText: "📱 OPEN MENU",
            sections: sections
        };

        await conn.sendMessage(from, listMessage, { quoted: mek });
        
    } catch (err) {
        console.log('Listmenu error:', err);
        await conn.sendMessage(from, { 
            text: '❌ Error loading list menu.' 
        }, { quoted: mek });
    }
});

// ================= IMAGE MENU =================
cmd({
    pattern: "imgmenu",
    desc: "Image style menu",
    category: "menu",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const prefix = config.PREFIX || '.';
        
        const text = `
╭━━━━━━━━━━━━━━━━━━━⬣
┃  🖼️ *IMAGE MENU*  🖼️
╰━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🤖 AI & SEARCH 〕━━━⬣
┃ ${prefix}aimenu - AI Commands
┃ ${prefix}quranmenu - Quran
┃ ${prefix}prayertime - Prayer
┃ ${prefix}search - Search
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 ⬇️ DOWNLOAD 〕━━━⬣
┃ ${prefix}dlmenu - Downloads
┃ ${prefix}ytdl - YouTube
┃ ${prefix}fbdl - Facebook
┃ ${prefix}igdl - Instagram
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 👥 GROUP 〕━━━⬣
┃ ${prefix}groupmenu - Group
┃ ${prefix}admin - Admin
┃ ${prefix}welcome - Welcome
┃ ${prefix}goodbye - Goodbye
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🎮 FUN 〕━━━⬣
┃ ${prefix}funmenu - Fun
┃ ${prefix}game - Games
┃ ${prefix}reaction - React
┃ ${prefix}quote - Quotes
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 👑 OWNER 〕━━━⬣
┃ ${prefix}ownermenu - Owner
┃ ${prefix}settings - Settings
┃ ${prefix}ban - Ban user
┃ ${prefix}unban - Unban
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🎨 CREATIVE 〕━━━⬣
┃ ${prefix}logo - Logo maker
┃ ${prefix}sticker - Stickers
┃ ${prefix}effect - Effects
┃ ${prefix}edit - Edit images
╰━━━━━━━━━━━━━━━━━━⬣

✨ *Total Commands: 50+*
📌 *Use ${prefix}help <command> for details*
`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/66h86e.jpg" },
            caption: text,
            footer: "✨ Powered By GuruTech Lab",
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });
        
    } catch (err) {
        console.log('Imgmenu error:', err);
        await conn.sendMessage(from, { 
            text: '❌ Error loading image menu.' 
        }, { quoted: mek });
    }
});

// ================= SIMPLE CATEGORY MENU =================
cmd({
    pattern: "categories",
    desc: "Category quick menu",
    category: "menu",
    react: "📂",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const prefix = config.PREFIX || '.';
        
        const text = `
📂 *QUICK CATEGORY MENU*

╭━━━〔 MAIN CATEGORIES 〕━━━⬣
┃ 🤖 *AI* - ${prefix}aimenu
┃ ⬇️ *DL* - ${prefix}dlmenu
┃ 👥 *GROUP* - ${prefix}groupmenu
┃ 🎮 *FUN* - ${prefix}funmenu
┃ 👑 *OWNER* - ${prefix}ownermenu
┃ 🎨 *LOGO* - ${prefix}logo
┃ 📜 *LIST* - ${prefix}listcmd
┃ 📦 *REPO* - ${prefix}repo
╰━━━━━━━━━━━━━━━━━━⬣

💡 *Send any category command to view its menu*
⚡ *Example: ${prefix}aimenu*
`;

        await conn.sendMessage(from, { 
            text: text 
        }, { quoted: mek });
        
    } catch (err) {
        console.log('Categories error:', err);
        await conn.sendMessage(from, { 
            text: '❌ Error loading categories.' 
        }, { quoted: mek });
    }
});

// ================= REDIRECT OLD COMMANDS =================
cmd({
    pattern: "menulist",
    desc: "Redirect to listmenu",
    category: "menu",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    await conn.sendMessage(from, { 
        text: '🔄 Redirecting to list menu...' 
    }, { quoted: mek });
    
    // Execute the listmenu command
    const listmenuCmd = require('./menu.js').cmd.find(c => c.pattern === "listmenu");
    if (listmenuCmd) {
        await listmenuCmd.function(conn, mek, m, { from });
    }
});

cmd({
    pattern: "menuimage",
    desc: "Redirect to imgmenu",
    category: "menu",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    await conn.sendMessage(from, { 
        text: '🔄 Redirecting to image menu...' 
    }, { quoted: mek });
    
    const imgmenuCmd = require('./menu.js').cmd.find(c => c.pattern === "imgmenu");
    if (imgmenuCmd) {
        await imgmenuCmd.function(conn, mek, m, { from });
    }
});

cmd({
    pattern: "menucategories",
    desc: "Redirect to categories",
    category: "menu",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    await conn.sendMessage(from, { 
        text: '🔄 Redirecting to categories...' 
    }, { quoted: mek });
    
    const categoriesCmd = require('./menu.js').cmd.find(c => c.pattern === "categories");
    if (categoriesCmd) {
        await categoriesCmd.function(conn, mek, m, { from });
    }
});

module.exports = { cmd };
