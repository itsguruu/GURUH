/* ============================================
   📌 GURU MD - CONTINUOUS STEEL BEAM
   Style: Single Vertical Industrial Rail
   Layout: One Long Steel Track with Commands
   Version: 16.0.0
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

// ================= SINGLE STEEL BEAM =================
const beam = {
    // The continuous steel beam (just one vertical line)
    rail: "┃",
    top: "┏",
    bottom: "┗",
    joint: "┣",
    
    // Steel hardware (minimal)
    bolt: "🔩",
    gear: "⚙️",
    wrench: "🔧",
    
    // Status markers
    lock: "🔒",
    unlock: "🔓",
    
    // Simple bullet
    bullet: "•"
};

// ================= ALL COMMANDS IN ONE VERTICAL LINE =================
cmd({
    pattern: "menu",
    desc: "Show steel beam menu",
    category: "menu",
    react: "📌",
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
        
        // ONE LONG CONTINUOUS STEEL BEAM with all commands in vertical line
        let menuText = `${beam.top}════════════════════════════════════\n`;
        menuText += `${beam.rail}  📌 STEEL COMMAND RAIL\n`;
        menuText += `${beam.joint}════════════════════════════════════\n`;
        menuText += `${beam.rail}  👤 ${pushName}\n`;
        menuText += `${beam.rail}  ⏱️ ${uptime} | ${date} ${time}\n`;
        menuText += `${beam.rail}  ⚙️ ${prefix} | ${mode}\n`;
        menuText += `${beam.joint}════════════════════════════════════\n`;
        
        // ALL COMMANDS in one continuous vertical line (no boxes, just the steel rail)
        menuText += `${beam.rail}  ${beam.bolt} 🤖 AI\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}gpt\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}gemini\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}claude\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}llama\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}bard\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}deepseek\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}mistral\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}quran\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}prayer\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}tafsir\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}hadith\n`;
        
        menuText += `${beam.rail}  ${beam.gear} 📥 DOWNLOAD\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}yt\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}fb\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}ig\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}tt\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}tw\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}pin\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}spotify\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}soundcloud\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}play\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}song\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}video\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}audio\n`;
        
        menuText += `${beam.rail}  ${beam.wrench} 👥 GROUP\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}welcome\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}goodbye\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}promote\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}demote\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}kick\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}add\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}tagall\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}hidetag\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}link\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}revoke\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}close\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}open\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}antilink\n`;
        
        menuText += `${beam.rail}  ${beam.bolt} 🎮 FUN\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}game\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}rps\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}tictactoe\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}quiz\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}truth\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}dare\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}meme\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}joke\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}quote\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}fact\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}roast\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}ship\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}8ball\n`;
        
        menuText += `${beam.rail}  ${beam.gear} 👑 OWNER\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}ban\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}unban\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}block\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}unblock\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}broadcast\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}setprefix\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}setmode\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}restart\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}shutdown\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}eval\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}join\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}leave\n`;
        
        menuText += `${beam.rail}  ${beam.wrench} 🔄 CONVERTER\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}sticker\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}toimg\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}tomp4\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}togif\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}tomp3\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}tourl\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}qr\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}readqr\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}tts\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}translate\n`;
        
        menuText += `${beam.rail}  ${beam.bolt} 🔧 TOOLS\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}calc\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}math\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}convert\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}currency\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}time\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}date\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}password\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}hash\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}binary\n`;
        
        menuText += `${beam.rail}  ${beam.gear} 🎨 LOGO\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}glitch\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}neon\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}3d\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}blackpink\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}lion\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}wolf\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}dragon\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}fire\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}ice\n`;
        
        menuText += `${beam.rail}  ${beam.wrench} 🔍 SEARCH\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}google\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}image\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}video\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}news\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}wiki\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}urban\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}lyrics\n`;
        menuText += `${beam.rail}     ${beam.bullet} ${prefix}anime\n`;
        
        menuText += `${beam.joint}════════════════════════════════════\n`;
        menuText += `${beam.rail}  📊 TOTAL: 100+ COMMANDS\n`;
        menuText += `${beam.rail}  🔍 ${prefix}search <cmd>\n`;
        menuText += `${beam.rail}  📋 ${prefix}categories\n`;
        menuText += `${beam.bottom}════════════════════════════════════\n`;
        
        await conn.sendMessage(from, { 
            text: menuText 
        }, { quoted: mek });
        
    } catch (err) {
        console.log('Menu error:', err);
        await conn.sendMessage(from, { 
            text: '❌ Error loading menu' 
        }, { quoted: mek });
    }
});

// ================= CATEGORIES VIEW (Also on same steel beam) =================
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
        
        let text = `${beam.top}════════════════════════════\n`;
        text += `${beam.rail}  📋 CATEGORIES\n`;
        text += `${beam.joint}════════════════════════════\n`;
        text += `${beam.rail}  ${beam.bolt} 🤖 AI\n`;
        text += `${beam.rail}  ${beam.gear} 📥 DOWNLOAD\n`;
        text += `${beam.rail}  ${beam.wrench} 👥 GROUP\n`;
        text += `${beam.rail}  ${beam.bolt} 🎮 FUN\n`;
        text += `${beam.rail}  ${beam.gear} 👑 OWNER\n`;
        text += `${beam.rail}  ${beam.wrench} 🔄 CONVERTER\n`;
        text += `${beam.rail}  ${beam.bolt} 🔧 TOOLS\n`;
        text += `${beam.rail}  ${beam.gear} 🎨 LOGO\n`;
        text += `${beam.rail}  ${beam.wrench} 🔍 SEARCH\n`;
        text += `${beam.joint}════════════════════════════\n`;
        text += `${beam.rail}  💡 ${prefix}menu to view all\n`;
        text += `${beam.bottom}════════════════════════════\n`;
        
        await conn.sendMessage(from, { text }, { quoted: mek });
        
    } catch (err) {
        console.log('Categories error:', err);
    }
});

// ================= SEARCH COMMAND =================
cmd({
    pattern: "search (.*)",
    desc: "Search commands",
    category: "menu",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, match }) => {
    try {
        const query = match.toLowerCase();
        
        // Simple search response
        let text = `${beam.top}════════════════════════════\n`;
        text += `${beam.rail}  🔍 SEARCH: ${query}\n`;
        text += `${beam.joint}════════════════════════════\n`;
        text += `${beam.rail}  ${beam.bullet} Try: ${prefix}${query}\n`;
        text += `${beam.rail}  ${beam.bullet} Use ${prefix}menu to see all\n`;
        text += `${beam.bottom}════════════════════════════\n`;
        
        await conn.sendMessage(from, { text }, { quoted: mek });
        
    } catch (err) {
        console.log('Search error:', err);
    }
});

module.exports = { cmd };
