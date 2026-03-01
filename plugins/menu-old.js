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
        const time = new Date().toLocaleTimeString('en-US', { hour12: true });
        const date = new Date().toLocaleDateString('en-US');
        const up = runtime(process.uptime());
        const mode = config.MODE || 'public';
        // Fix: Get prefix correctly
        const prefix = config.PREFIX || '.';
        
        // Log to check if prefix is being read
        console.log('Current prefix:', prefix);

        const caption = `
╭━━━〔 ⚡ GURU MD SYSTEM ⚡ 〕━━━⬣
┃ 👋 ${greeting()}, ${pushName}
┃ 🕒 Time   : ${time}
┃ 📅 Date   : ${date}
┃ ⏳ Uptime : ${up}
┃ 🛠 Mode   : ${mode}
┃ ⚙ Prefix : 「 ${prefix} 」
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

        // Send image with buttons only once
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
                    newsletterName: 'GURU TECH',
                    serverMessageId: 143
                }
            }
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
                rows: [
                    { title: "🤖 AI Menu", description: "AI and chatbot commands", rowId: `${prefix}aimenu` },
                    { title: "📖 Quran Menu", description: "Quran verses and recitations", rowId: `${prefix}quranmenu` },
                    { title: "🕌 Prayer Times", description: "Islamic prayer timings", rowId: `${prefix}prayertime` }
                ]
            },
            {
                title: "⬇️ DOWNLOAD CENTER",
                rows: [
                    { title: "🎵 Download Menu", description: "Video & audio downloads", rowId: `${prefix}dlmenu` }
                ]
            },
            {
                title: "👥 GROUP MANAGEMENT",
                rows: [
                    { title: "👥 Group Menu", description: "Group management tools", rowId: `${prefix}groupmenu` }
                ]
            },
            {
                title: "🎮 FUN & GAMES",
                rows: [
                    { title: "🎮 Fun Menu", description: "Fun and games", rowId: `${prefix}funmenu` }
                ]
            },
            {
                title: "👑 OWNER & BOT SETTINGS",
                rows: [
                    { title: "👑 Owner Menu", description: "Bot owner commands", rowId: `${prefix}ownermenu` }
                ]
            }
        ];

        await conn.sendMessage(from, {
            text: "*📋 SELECT A MENU CATEGORY*\n\nChoose from the options below to view specific commands:",
            footer: "GURU MD • Version 9.0.0",
            title: "🌟 MAIN MENU",
            buttonText: "📱 OPEN MENU",
            sections: sections
        }, { quoted: mek });
        
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
┃      🖼️ *IMAGE MENU*  🖼️
╰━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🤖 AI 〕━━━⬣
┃ ${prefix}aimenu
┃ ${prefix}quranmenu
┃ ${prefix}prayertime
╰━━━━━━━━━━━━━━⬣

╭━━━〔 ⬇️ DOWNLOAD 〕━━━⬣
┃ ${prefix}dlmenu
╰━━━━━━━━━━━━━━⬣

╭━━━〔 👥 GROUP 〕━━━⬣
┃ ${prefix}groupmenu
╰━━━━━━━━━━━━━━⬣

╭━━━〔 🎮 FUN 〕━━━⬣
┃ ${prefix}funmenu
╰━━━━━━━━━━━━━━⬣

╭━━━〔 👑 OWNER 〕━━━⬣
┃ ${prefix}ownermenu
╰━━━━━━━━━━━━━━⬣

╭━━━〔 🎨 OTHER 〕━━━⬣
┃ ${prefix}logo
┃ ${prefix}repo
┃ ${prefix}listcmd
╰━━━━━━━━━━━━━━⬣

✨ *Use ${prefix}help <command> for details*
`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/66h86e.jpg" },
            caption: text
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

💡 *Example: ${prefix}aimenu*
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

// ================= SOUND COMMAND (SEPARATE) =================
cmd({
    pattern: "menusound",
    desc: "Play menu sound",
    category: "menu",
    react: "🔊",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });
    } catch (err) {
        console.log('Sound error:', err);
    }
});

// ================= BACKWARD COMPATIBILITY =================
cmd({
    pattern: "menulist",
    desc: "Redirect to listmenu",
    category: "menu",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    const prefix = config.PREFIX || '.';
    await conn.sendMessage(from, { 
        text: `🔄 Use *${prefix}listmenu* instead` 
    }, { quoted: mek });
});

cmd({
    pattern: "menuimage",
    desc: "Redirect to imgmenu",
    category: "menu",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    const prefix = config.PREFIX || '.';
    await conn.sendMessage(from, { 
        text: `🔄 Use *${prefix}imgmenu* instead` 
    }, { quoted: mek });
});

cmd({
    pattern: "menucategories",
    desc: "Redirect to categories",
    category: "menu",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    const prefix = config.PREFIX || '.';
    await conn.sendMessage(from, { 
        text: `🔄 Use *${prefix}categories* instead` 
    }, { quoted: mek });
});

module.exports = { cmd };
