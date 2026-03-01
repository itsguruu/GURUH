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
    if (hour < 17) return "☀️ Good Afternoon";
    if (hour < 21) return "🌆 Good Evening";
    return "🌙 Good Night";
}

// ================= STEEL STYLE BORDERS =================
const steel = {
    tl: "┏", tr: "┓", bl: "┗", br: "┛",
    h: "━", v: "┃", l: "┣", r: "┫",
    title: "🔩", lock: "🔒", unlock: "🔓",
    bolt: "⚙️", gear: "⚙️", wrench: "🔧"
};

// ================= COMMAND CATEGORIES =================
const categories = {
    ai: {
        icon: "🤖",
        emoji: "🧠",
        lock: "🔒",
        commands: [
            { name: "ai", desc: "Ask AI anything" },
            { name: "aimenu", desc: "AI commands menu" },
            { name: "gpt", desc: "ChatGPT integration" },
            { name: "bard", desc: "Google Bard AI" },
            { name: "llama", desc: "Meta Llama AI" },
            { name: "gemini", desc: "Google Gemini" },
            { name: "claude", desc: "Claude AI" },
            { name: "perplexity", desc: "Perplexity AI" },
            { name: "copilot", desc: "Microsoft Copilot" },
            { name: "deepseek", desc: "DeepSeek AI" },
            { name: "mistral", desc: "Mistral AI" },
            { name: "quran", desc: "Quran verses" },
            { name: "prayer", desc: "Prayer times" },
            { name: "tafsir", desc: "Quran interpretation" },
            { name: "hadith", desc: "Prophet sayings" },
            { name: "islamic", desc: "Islamic knowledge" }
        ]
    },
    download: {
        icon: "⬇️",
        emoji: "📥",
        lock: "🔒",
        commands: [
            { name: "dl", desc: "Download menu" },
            { name: "dlmenu", desc: "All downloaders" },
            { name: "yt", desc: "YouTube video/audio" },
            { name: "ytmp3", desc: "YouTube to MP3" },
            { name: "ytmp4", desc: "YouTube to MP4" },
            { name: "fb", desc: "Facebook video" },
            { name: "ig", desc: "Instagram video" },
            { name: "tw", desc: "Twitter/X video" },
            { name: "tt", desc: "TikTok video" },
            { name: "pin", desc: "Pinterest video" },
            { name: "spotify", desc: "Spotify track" },
            { name: "soundcloud", desc: "SoundCloud audio" },
            { name: "play", desc: "Play music/video" },
            { name: "song", desc: "Download song" },
            { name: "video", desc: "Download video" },
            { name: "audio", desc: "Download audio" }
        ]
    },
    group: {
        icon: "👥",
        emoji: "👥",
        lock: "🔒",
        commands: [
            { name: "group", desc: "Group management" },
            { name: "groupmenu", desc: "Group commands" },
            { name: "welcome", desc: "Welcome message" },
            { name: "goodbye", desc: "Goodbye message" },
            { name: "promote", desc: "Make admin" },
            { name: "demote", desc: "Remove admin" },
            { name: "kick", desc: "Remove member" },
            { name: "add", desc: "Add member" },
            { name: "tagall", desc: "Mention all" },
            { name: "hidetag", desc: "Hidden mention" },
            { name: "link", desc: "Group link" },
            { name: "revoke", desc: "Reset link" },
            { name: "close", desc: "Close group" },
            { name: "open", desc: "Open group" },
            { name: "lockgc", desc: "Lock group" },
            { name: "unlockgc", desc: "Unlock group" },
            { name: "antilink", desc: "Block links" },
            { name: "antispam", desc: "Block spam" },
            { name: "antibot", desc: "Block bots" },
            { name: "warn", desc: "Warn member" },
            { name: "warnreset", desc: "Reset warns" }
        ]
    },
    fun: {
        icon: "🎮",
        emoji: "🎯",
        lock: "🔒",
        commands: [
            { name: "fun", desc: "Fun commands" },
            { name: "funmenu", desc: "Entertainment" },
            { name: "game", desc: "Play games" },
            { name: "rps", desc: "Rock paper scissors" },
            { name: "tictactoe", desc: "Tic tac toe" },
            { name: "quiz", desc: "Trivia quiz" },
            { name: "truth", desc: "Truth or dare" },
            { name: "dare", desc: "Dare game" },
            { name: "meme", desc: "Random meme" },
            { name: "joke", desc: "Random joke" },
            { name: "quote", desc: "Random quote" },
            { name: "fact", desc: "Random fact" },
            { name: "roast", desc: "Roast someone" },
            { name: "compliment", desc: "Say nice things" },
            { name: "ship", desc: "Ship names" },
            { name: "calculate", desc: "Love calculator" },
            { name: "8ball", desc: "Magic 8 ball" },
            { name: "flip", desc: "Flip coin" },
            { name: "roll", desc: "Roll dice" },
            { name: "slot", desc: "Slot machine" }
        ]
    },
    owner: {
        icon: "👑",
        emoji: "⚡",
        lock: "🔐",
        commands: [
            { name: "owner", desc: "Owner commands" },
            { name: "ownermenu", desc: "Admin panel" },
            { name: "ban", desc: "Ban user" },
            { name: "unban", desc: "Unban user" },
            { name: "block", desc: "Block user" },
            { name: "unblock", desc: "Unblock user" },
            { name: "broadcast", desc: "Broadcast message" },
            { name: "bc", desc: "Broadcast to all" },
            { name: "setprefix", desc: "Change prefix" },
            { name: "setmode", desc: "Change mode" },
            { name: "restart", desc: "Restart bot" },
            { name: "shutdown", desc: "Stop bot" },
            { name: "update", desc: "Update bot" },
            { name: "eval", desc: "Execute code" },
            { name: "exec", desc: "Run command" },
            { name: "getvar", desc: "Get variable" },
            { name: "setvar", desc: "Set variable" },
            { name: "delvar", desc: "Delete variable" },
            { name: "join", desc: "Join group" },
            { name: "leave", desc: "Leave group" }
        ]
    },
    converter: {
        icon: "🔄",
        emoji: "🔄",
        lock: "🔒",
        commands: [
            { name: "sticker", desc: "Image to sticker" },
            { name: "stickermenu", desc: "Sticker tools" },
            { name: "toimg", desc: "Sticker to image" },
            { name: "tomp4", desc: "Image to video" },
            { name: "togif", desc: "Video to GIF" },
            { name: "tomp3", desc: "Video to audio" },
            { name: "tourl", desc: "Media to URL" },
            { name: "qr", desc: "Generate QR" },
            { name: "readqr", desc: "Read QR code" },
            { name: "tts", desc: "Text to speech" },
            { name: "translate", desc: "Translate text" },
            { name: "short", desc: "Short URL" },
            { name: "weather", desc: "Weather info" },
            { name: "crypto", desc: "Crypto price" },
            { name: "stock", desc: "Stock price" }
        ]
    },
    tools: {
        icon: "🛠️",
        emoji: "🔧",
        lock: "🔒",
        commands: [
            { name: "tools", desc: "Utility tools" },
            { name: "toolsmenu", desc: "All tools" },
            { name: "calc", desc: "Calculator" },
            { name: "math", desc: "Math solver" },
            { name: "convert", desc: "Unit converter" },
            { name: "currency", desc: "Currency converter" },
            { name: "time", desc: "World time" },
            { name: "date", desc: "Date converter" },
            { name: "calendar", desc: "Hijri calendar" },
            { name: "pdf", desc: "PDF tools" },
            { name: "merge", desc: "Merge PDFs" },
            { name: "compress", desc: "Compress file" },
            { name: "password", desc: "Generate password" },
            { name: "hash", desc: "Hash generator" },
            { name: "binary", desc: "Binary converter" }
        ]
    },
    logo: {
        icon: "🎨",
        emoji: "🖼️",
        lock: "🔒",
        commands: [
            { name: "logo", desc: "Logo maker" },
            { name: "logomenu", desc: "All logos" },
            { name: "glitch", desc: "Glitch text" },
            { name: "neon", desc: "Neon text" },
            { name: "3d", desc: "3D text" },
            { name: "blackpink", desc: "Blackpink style" },
            { name: "lion", desc: "Lion logo" },
            { name: "wolf", desc: "Wolf logo" },
            { name: "dragon", desc: "Dragon logo" },
            { name: "fire", desc: "Fire text" },
            { name: "ice", desc: "Ice text" },
            { name: "metal", desc: "Metal text" },
            { name: "graffiti", desc: "Graffiti text" },
            { name: "typography", desc: "Typography" },
            { name: "banner", desc: "Banner maker" }
        ]
    },
    search: {
        icon: "🔍",
        emoji: "🔎",
        lock: "🔒",
        commands: [
            { name: "search", desc: "Search engine" },
            { name: "google", desc: "Google search" },
            { name: "image", desc: "Image search" },
            { name: "video", desc: "Video search" },
            { name: "news", desc: "News search" },
            { name: "wiki", desc: "Wikipedia" },
            { name: "urban", desc: "Urban dictionary" },
            { name: "lyrics", desc: "Song lyrics" },
            { name: "anime", desc: "Anime info" },
            { name: "manga", desc: "Manga info" },
            { name: "character", desc: "Character info" },
            { name: "movie", desc: "Movie info" },
            { name: "series", desc: "TV series" },
            { name: "book", desc: "Book info" },
            { name: "recipe", desc: "Food recipes" }
        ]
    },
    education: {
        icon: "📚",
        emoji: "🎓",
        lock: "🔒",
        commands: [
            { name: "learn", desc: "Learning menu" },
            { name: "dictionary", desc: "Word meaning" },
            { name: "thesaurus", desc: "Synonyms" },
            { name: "grammar", desc: "Grammar check" },
            { name: "spell", desc: "Spell check" },
            { name: "maths", desc: "Math lessons" },
            { name: "physics", desc: "Physics help" },
            { name: "chemistry", desc: "Chemistry help" },
            { name: "biology", desc: "Biology help" },
            { name: "history", desc: "History facts" },
            { name: "geography", desc: "Geography" },
            { name: "coding", desc: "Programming help" },
            { name: "python", desc: "Python help" },
            { name: "javascript", desc: "JS help" },
            { name: "html", desc: "HTML/CSS help" }
        ]
    }
};

// ================= GENERATE MENU SECTION =================
function generateMenuSection(title, icon, commands, prefix, isOwner = false, showAll = false) {
    let section = `\n${steel.l}${steel.h}${steel.h}${steel.h}『 ${icon} ${title} 』${steel.h}${steel.h}${steel.h}${steel.r}\n`;
    
    // Show only first 8 commands if not showing all (to save space)
    const cmdList = showAll ? commands : commands.slice(0, 8);
    
    cmdList.forEach(cmd => {
        const lockIcon = cmd.owner ? steel.lock : steel.unlock;
        section += `${steel.v} ${lockIcon} ${prefix}${cmd.name}  ─  ${cmd.desc}\n`;
    });
    
    if (!showAll && commands.length > 8) {
        section += `${steel.v} ${steel.bolt} ${prefix}${title.toLowerCase()}menu  ─  View all ${commands.length} commands\n`;
    }
    
    section += `${steel.l}${steel.h}${steel.h}${steel.h}${steel.h}${steel.h}${steel.h}${steel.h}${steel.h}${steel.h}${steel.h}${steel.h}${steel.h}${steel.h}${steel.h}${steel.r}\n`;
    
    return section;
}

// ================= MAIN MENU (STEEL STYLE) =================
cmd({
    pattern: "menu",
    desc: "Show steel style menu",
    category: "menu",
    react: "🔩",
    filename: __filename
},
async (conn, mek, m, { from, pushname, isOwner, args }) => {
    try {
        const pushName = pushname || 'User';
        const currentTime = new Date();
        const time = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const date = currentTime.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const uptime = runtime(process.uptime());
        const mode = config.MODE || 'public';
        const prefix = config.PREFIX || '.';
        
        // Check if user wants full menu
        const showAll = args[0] === 'all' || args[0] === 'full';
        
        // Build steel style menu
        let menuText = `${steel.tl}${steel.h.repeat(5)}『 ${steel.title} STEEL MENU ${steel.title} 』${steel.h.repeat(5)}${steel.tr}\n`;
        menuText += `${steel.v} 👤 User: ${pushName}\n`;
        menuText += `${steel.v} ${greeting()}\n`;
        menuText += `${steel.v} 🕒 Time: ${time} | 📅 ${date}\n`;
        menuText += `${steel.l}${steel.h.repeat(40)}${steel.r}\n`;
        
        menuText += `${steel.v} ⚙️ Uptime: ${uptime}\n`;
        menuText += `${steel.v} 🔧 Prefix: ${prefix} | Mode: ${mode}\n`;
        menuText += `${steel.v} 👑 Owner: ${isOwner ? '✅' : '❌'} | Version: 9.0.0\n`;
        menuText += `${steel.l}${steel.h.repeat(40)}${steel.r}\n`;

        // Add categories
        for (const [key, category] of Object.entries(categories)) {
            menuText += generateMenuSection(
                key.toUpperCase(), 
                category.icon, 
                category.commands, 
                prefix, 
                isOwner,
                showAll
            );
        }

        // Footer
        menuText += `\n${steel.v} 📌 Total: 150+ commands\n`;
        menuText += `${steel.v} 💡 ${prefix}menu all  -  View all commands\n`;
        menuText += `${steel.v} 🔍 ${prefix}search <cmd>  -  Search command\n`;
        menuText += `${steel.tl}${steel.h.repeat(10)}『 🔩 GURU TECH 』${steel.h.repeat(10)}${steel.tr}\n`;

        // Send menu
        await conn.sendMessage(from, { text: menuText }, { quoted: mek });

        // Send quick access panel
        const quickAccess = `
${steel.tl}${steel.h.repeat(15)}『 ⚡ QUICK ACCESS 』${steel.h.repeat(15)}${steel.tr}
${steel.v} 🎯 Categories: ${prefix}categories
${steel.v} 📋 List View: ${prefix}listmenu
${steel.v} 🖼️ Image View: ${prefix}imgmenu
${steel.v} 🔊 Sound: ${prefix}menusound
${steel.v} 🔍 Search: ${prefix}search <command>
${steel.tl}${steel.h.repeat(48)}${steel.tr}`;

        await conn.sendMessage(from, { text: quickAccess }, { quoted: mek });

    } catch (err) {
        console.log('Menu error:', err);
        await conn.sendMessage(from, { 
            text: '❌ Error loading menu. Use .listmenu instead.' 
        }, { quoted: mek });
    }
});

// ================= CATEGORIES VIEW =================
cmd({
    pattern: "categories",
    desc: "Show all categories",
    category: "menu",
    react: "📂",
    filename: __filename
},
async (conn, mek, m, { from, args }) => {
    try {
        const prefix = config.PREFIX || '.';
        const category = args[0]?.toLowerCase();
        
        // If specific category requested
        if (category && categories[category]) {
            const cat = categories[category];
            let text = `${steel.tl}${steel.h.repeat(5)}『 ${cat.icon} ${category.toUpperCase()} 』${steel.h.repeat(5)}${steel.tr}\n`;
            
            cat.commands.forEach(cmd => {
                text += `${steel.v} ${steel.bolt} ${prefix}${cmd.name}\n`;
                text += `${steel.v}    └─ ${cmd.desc}\n`;
            });
            
            text += `${steel.tl}${steel.h.repeat(35)}${steel.tr}\n`;
            text += `${steel.v} 📝 Total: ${cat.commands.length} commands\n`;
            text += `${steel.tl}${steel.h.repeat(35)}${steel.tr}`;
            
            await conn.sendMessage(from, { text }, { quoted: mek });
            return;
        }
        
        // Show all categories
        let text = `${steel.tl}${steel.h.repeat(10)}『 📂 CATEGORIES 』${steel.h.repeat(10)}${steel.tr}\n\n`;
        
        for (const [key, cat] of Object.entries(categories)) {
            text += `${steel.v} ${cat.icon} ${key.toUpperCase()}\n`;
            text += `${steel.v}    └─ ${cat.commands.length} commands | ${prefix}categories ${key}\n`;
        }
        
        text += `\n${steel.tl}${steel.h.repeat(35)}${steel.tr}\n`;
        text += `${steel.v} 💡 Use: ${prefix}categories <name>\n`;
        text += `${steel.tl}${steel.h.repeat(35)}${steel.tr}`;
        
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
        const prefix = config.PREFIX || '.';
        const query = match.toLowerCase();
        
        let results = [];
        
        for (const [catName, category] of Object.entries(categories)) {
            category.commands.forEach(cmd => {
                if (cmd.name.includes(query) || cmd.desc.toLowerCase().includes(query)) {
                    results.push({
                        category: catName,
                        icon: category.icon,
                        ...cmd
                    });
                }
            });
        }
        
        if (results.length === 0) {
            await conn.sendMessage(from, { 
                text: `❌ No commands found for "${query}"` 
            }, { quoted: mek });
            return;
        }
        
        let text = `${steel.tl}${steel.h.repeat(5)}『 🔍 SEARCH RESULTS 』${steel.h.repeat(5)}${steel.tr}\n`;
        text += `${steel.v} Query: "${query}" (${results.length} found)\n`;
        text += `${steel.l}${steel.h.repeat(35)}${steel.r}\n`;
        
        results.slice(0, 15).forEach((cmd, i) => {
            text += `${steel.v} ${i+1}. ${cmd.icon} ${prefix}${cmd.name}\n`;
            text += `${steel.v}    └─ ${cmd.desc} [${cmd.category}]\n`;
        });
        
        if (results.length > 15) {
            text += `${steel.v} ... and ${results.length - 15} more\n`;
        }
        
        text += `${steel.tl}${steel.h.repeat(35)}${steel.tr}`;
        
        await conn.sendMessage(from, { text }, { quoted: mek });
        
    } catch (err) {
        console.log('Search error:', err);
    }
});

// ================= LIST MENU (COMPACT) =================
cmd({
    pattern: "listmenu",
    desc: "Compact list menu",
    category: "menu",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const prefix = config.PREFIX || '.';
        
        let text = `╔════════════════════════════╗\n`;
        text += `║    📋 *COMMAND LIST*  📋    ║\n`;
        text += `╚════════════════════════════╝\n\n`;
        
        for (const [key, cat] of Object.entries(categories)) {
            text += `╔══『 ${cat.icon} ${key.toUpperCase()} 』\n`;
            const cmdList = cat.commands.slice(0, 5).map(c => `${prefix}${c.name}`).join(' · ');
            text += `║ ${cmdList}\n`;
            if (cat.commands.length > 5) {
                text += `║ ⚡ +${cat.commands.length - 5} more | ${prefix}${key}menu\n`;
            }
            text += `╚════════════════════════════\n`;
        }
        
        text += `\n✨ *Total: 150+ commands*`;
        
        await conn.sendMessage(from, { text }, { quoted: mek });
        
    } catch (err) {
        console.log('Listmenu error:', err);
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
        
        let caption = `╔══════════════════╗\n`;
        caption += `║    🖼️ *MENU IMAGE*  🖼️    ║\n`;
        caption += `╚══════════════════╝\n\n`;
        
        // Show categories in two columns
        const catArray = Object.entries(categories);
        for (let i = 0; i < catArray.length; i += 2) {
            const row = catArray.slice(i, i + 2);
            let line = '';
            row.forEach(([key, cat]) => {
                line += `${cat.icon} ${key.toUpperCase().padEnd(12)} `;
            });
            caption += line + '\n';
            
            row.forEach(([key, cat]) => {
                caption += `└ ${prefix}${key}menu  `.padEnd(20);
            });
            caption += '\n\n';
        }
        
        caption += `✨ *GURU MD v9.0.0*`;
        
        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/66h86e.jpg" },
            caption: caption
        }, { quoted: mek });
        
    } catch (err) {
        console.log('Imgmenu error:', err);
    }
});

// ================= MENU SOUND =================
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

// ================= GENERATE CATEGORY MENUS =================
// Auto-generate menu commands for each category
Object.keys(categories).forEach(catName => {
    cmd({
        pattern: `${catName}menu`,
        desc: `Show ${catName} menu`,
        category: "menu",
        react: categories[catName].icon,
        filename: __filename
    },
    async (conn, mek, m, { from }) => {
        try {
            const prefix = config.PREFIX || '.';
            const category = categories[catName];
            
            let text = `${steel.tl}${steel.h.repeat(5)}『 ${category.icon} ${catName.toUpperCase()} MENU 』${steel.h.repeat(5)}${steel.tr}\n\n`;
            
            // Group commands by type if needed
            category.commands.forEach(cmd => {
                text += `${steel.v} ${steel.bolt} ${prefix}${cmd.name}\n`;
                text += `${steel.v}    └─ ${cmd.desc}\n`;
            });
            
            text += `\n${steel.tl}${steel.h.repeat(35)}${steel.tr}\n`;
            text += `${steel.v} 📝 Total: ${category.commands.length} commands\n`;
            text += `${steel.tl}${steel.h.repeat(35)}${steel.tr}`;
            
            await conn.sendMessage(from, { text }, { quoted: mek });
            
        } catch (err) {
            console.log(`${catName}menu error:`, err);
        }
    });
});

// ================= HELP MENU =================
cmd({
    pattern: "help",
    desc: "Quick help menu",
    category: "menu",
    react: "❓",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const prefix = config.PREFIX || '.';
        
        const helpText = `
${steel.tl}${steel.h.repeat(10)}『 ❓ HELP 』${steel.h.repeat(10)}${steel.tr}
${steel.v} 📌 *Basic Commands:*
${steel.v} ${prefix}menu     - Main steel menu
${steel.v} ${prefix}categories - Browse categories
${steel.v} ${prefix}listmenu  - Compact list
${steel.v} ${prefix}imgmenu   - Image menu
${steel.v} ${prefix}search    - Search commands
${steel.v} ${prefix}ping      - Check bot status
${steel.v} ${prefix}alive     - Bot health
${steel.v} ${prefix}repo      - Bot information
${steel.tl}${steel.h.repeat(28)}${steel.tr}

💡 *Tip: Use ${prefix}menu all to see all commands*
🔩 *GURU MD v9.0.0*
`;

        await conn.sendMessage(from, { text: helpText }, { quoted: mek });
        
    } catch (err) {
        console.log('Help error:', err);
    }
});

module.exports = { cmd };
