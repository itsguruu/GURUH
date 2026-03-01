/* ============================================
   GURU MD - CLEAN MENU WITH IMAGE
   Style: Modern Glass Design
   Layout: Clean Vertical with Image Header
   Version: 18.0.0
   ============================================ */

const config = require('../config');
const { cmd, commands } = require('../command');

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
    if (hour < 17) return "☀️ Good Afternoon";
    if (hour < 21) return "🌆 Good Evening";
    return "🌙 Good Night";
}

// ================= MAIN MENU WITH IMAGE =================
cmd({
    pattern: "menu",
    desc: "Show main menu",
    category: "menu",
    react: "✨",
    filename: __filename
},
async (conn, mek, m, { from, pushname, isOwner }) => {
    try {
        const pushName = pushname || 'User';
        const uptime = runtime(process.uptime());
        const mode = config.MODE || 'public';
        const prefix = config.PREFIX || '.';
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();
        
        // Your image URL
        const imageUrl = "https://files.catbox.moe/66h86e.jpg";
        
        // Clean menu text
        const menuText = `
╭──────────────────────╮
│    ✦ GURU MD ✦      │
╰──────────────────────╯

👋 Hi, ${pushName}
${greeting()}

⏳ Uptime: ${uptime}
📅 ${date} | 🕒 ${time}
⚙️ Prefix: ${prefix} | Mode: ${mode}
👑 Owner: ${isOwner ? '✅' : '❌'}

━━━━━━━━━━━━━━━━━━━━

🤖 *AI COMMANDS*
▸ ${prefix}gpt
▸ ${prefix}gemini
▸ ${prefix}claude
▸ ${prefix}llama
▸ ${prefix}bard
▸ ${prefix}deepseek
▸ ${prefix}mistral
▸ ${prefix}quran
▸ ${prefix}prayer
▸ ${prefix}tafsir
▸ ${prefix}hadith

📥 *DOWNLOAD COMMANDS*
▸ ${prefix}yt
▸ ${prefix}fb
▸ ${prefix}ig
▸ ${prefix}tt
▸ ${prefix}tw
▸ ${prefix}pin
▸ ${prefix}spotify
▸ ${prefix}soundcloud
▸ ${prefix}play
▸ ${prefix}song
▸ ${prefix}video
▸ ${prefix}audio

👥 *GROUP COMMANDS*
▸ ${prefix}welcome
▸ ${prefix}goodbye
▸ ${prefix}promote
▸ ${prefix}demote
▸ ${prefix}kick
▸ ${prefix}add
▸ ${prefix}tagall
▸ ${prefix}hidetag
▸ ${prefix}link
▸ ${prefix}revoke
▸ ${prefix}close
▸ ${prefix}open
▸ ${prefix}antilink

🎮 *FUN COMMANDS*
▸ ${prefix}game
▸ ${prefix}rps
▸ ${prefix}tictactoe
▸ ${prefix}quiz
▸ ${prefix}truth
▸ ${prefix}dare
▸ ${prefix}meme
▸ ${prefix}joke
▸ ${prefix}quote
▸ ${prefix}fact
▸ ${prefix}roast
▸ ${prefix}ship
▸ ${prefix}8ball

👑 *OWNER COMMANDS*
▸ ${prefix}ban
▸ ${prefix}unban
▸ ${prefix}block
▸ ${prefix}unblock
▸ ${prefix}broadcast
▸ ${prefix}setprefix
▸ ${prefix}setmode
▸ ${prefix}restart
▸ ${prefix}shutdown
▸ ${prefix}eval
▸ ${prefix}join
▸ ${prefix}leave

🔄 *CONVERTER COMMANDS*
▸ ${prefix}sticker
▸ ${prefix}toimg
▸ ${prefix}tomp4
▸ ${prefix}togif
▸ ${prefix}tomp3
▸ ${prefix}tourl
▸ ${prefix}qr
▸ ${prefix}readqr
▸ ${prefix}tts
▸ ${prefix}translate

🔧 *TOOLS COMMANDS*
▸ ${prefix}calc
▸ ${prefix}math
▸ ${prefix}convert
▸ ${prefix}currency
▸ ${prefix}time
▸ ${prefix}date
▸ ${prefix}password
▸ ${prefix}hash
▸ ${prefix}binary

🎨 *LOGO COMMANDS*
▸ ${prefix}glitch
▸ ${prefix}neon
▸ ${prefix}3d
▸ ${prefix}blackpink
▸ ${prefix}lion
▸ ${prefix}wolf
▸ ${prefix}dragon
▸ ${prefix}fire
▸ ${prefix}ice
▸ ${prefix}metal

🔍 *SEARCH COMMANDS*
▸ ${prefix}google
▸ ${prefix}image
▸ ${prefix}video
▸ ${prefix}news
▸ ${prefix}wiki
▸ ${prefix}urban
▸ ${prefix}lyrics
▸ ${prefix}anime

━━━━━━━━━━━━━━━━━━━━
🔥 FOREVER RESPECTED 😈 
🔍 Use ${prefix}search <command>
📋 Use ${prefix}categories
━━━━━━━━━━━━━━━━━━━━

✨ Powered by GuruTech
`;

        // Send image with caption
        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: menuText,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "GURU MD",
                    body: "Premium WhatsApp Bot",
                    thumbnailUrl: imageUrl,
                    sourceUrl: "https://github.com/yourrepo",
                    mediaType: 1,
                    renderLargerThumbnail: false
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

// ================= CATEGORIES MENU =================
cmd({
    pattern: "categories",
    desc: "Show categories",
    category: "menu",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const prefix = config.PREFIX || '.';
        
        const text = `
╭──────────────────────╮
│    📋 CATEGORIES     │
╰──────────────────────╯

🤖 AI (11)
📥 DOWNLOAD (12)
👥 GROUP (13)
🎮 FUN (13)
👑 OWNER (12)
🔄 CONVERTER (10)
🔧 TOOLS (9)
🎨 LOGO (10)
🔍 SEARCH (8)

━━━━━━━━━━━━━━━━━━━━
💡 Use ${prefix}menu to view all commands
📌 Total: 100+ Commands
`;

        await conn.sendMessage(from, { text }, { quoted: mek });
        
    } catch (err) {
        console.log('Categories error:', err);
    }
});

// ================= SEARCH COMMAND =================
cmd({
    pattern: "search (.*)",
    desc: "Search for commands",
    category: "menu",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, match }) => {
    try {
        const query = match.toLowerCase();
        const prefix = config.PREFIX || '.';
        
        const text = `
╭──────────────────────╮
│    🔍 SEARCH RESULTS  │
╰──────────────────────╯

Query: "${query}"

💡 Try using:
${prefix}${query}

📌 Use ${prefix}menu to see all commands
`;

        await conn.sendMessage(from, { text }, { quoted: mek });
        
    } catch (err) {
        console.log('Search error:', err);
    }
});

// ================= QUICK HELP =================
cmd({
    pattern: "help",
    desc: "Quick help",
    category: "menu",
    react: "❓",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const prefix = config.PREFIX || '.';
        
        const text = `
╭──────────────────────╮
│    ❓ QUICK HELP     │
╰──────────────────────╯

📌 Basic Commands:
${prefix}menu - Main menu
${prefix}categories - Browse categories
${prefix}search - Find commands
${prefix}ping - Check bot
${prefix}alive - Bot status

✨ GURU MD v9
`;

        await conn.sendMessage(from, { text }, { quoted: mek });
        
    } catch (err) {
        console.log('Help error:', err);
    }
});

module.exports = { cmd };
