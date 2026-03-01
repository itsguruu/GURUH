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
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
}

// ================= MAIN MENU =================
cmd({
    pattern: "menu",
    desc: "Show bot menu",
    category: "menu",
    react: "📱",
    filename: __filename
},
async (conn, mek, m, { from, pushname, isOwner }) => {

    try {
        const pushName = pushname || 'User';
        const currentTime = new Date();
        const time = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        const date = currentTime.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const uptime = runtime(process.uptime());
        const mode = config.MODE || 'public';
        const prefix = config.PREFIX || '.';
        
        // Simple text menu first (most reliable)
        const menuText = `
╔══✪〘 *GURU MD* 〙✪══
║
║👋 *Hi* ${pushName}
║🌅 *${greeting()}*
║
╠══✪〘 *INFO* 〙✪══
║
║🕒 *Time:* ${time}
║📅 *Date:* ${date}
║⏳ *Uptime:* ${uptime}
║⚙️ *Prefix:* ${prefix}
║🛠️ *Mode:* ${mode}
║👑 *Owner:* ${isOwner ? '✅' : '❌'}
║📦 *Version:* 9.0.0
║
╠══✪〘 *COMMANDS* 〙✪══
║
║📋 *${prefix}listmenu* - List view
║🖼️ *${prefix}imgmenu* - Image view
║📂 *${prefix}categories* - Categories
║🔊 *${prefix}menusound* - Sound
║
╚══✪〘 *GURU TECH* 〙✪══

_Powered by GuruTech Lab_
`;

        // Send as simple text first (guaranteed to work)
        await conn.sendMessage(from, {
            text: menuText
        }, { quoted: mek });

        // Then try to send image with buttons (may not work on all WhatsApp versions)
        try {
            const buttons = [
                { 
                    buttonId: `${prefix}listmenu`, 
                    buttonText: { displayText: "📋 LIST" }, 
                    type: 1 
                },
                { 
                    buttonId: `${prefix}imgmenu`, 
                    buttonText: { displayText: "🖼️ IMAGE" }, 
                    type: 1 
                },
                { 
                    buttonId: `${prefix}categories`, 
                    buttonText: { displayText: "📂 CATS" }, 
                    type: 1 
                }
            ];

            await conn.sendMessage(from, {
                image: { url: "https://files.catbox.moe/66h86e.jpg" },
                caption: "🎯 *Click buttons below for different menu styles*",
                footer: "GURU MD",
                buttons: buttons,
                headerType: 4
            }, { quoted: mek });
        } catch (buttonError) {
            console.log('Button menu failed (normal):', buttonError.message);
            // Buttons failed but text already sent, so it's fine
        }

    } catch (err) {
        console.log('Menu error:', err);
        await conn.sendMessage(from, { 
            text: '❌ Error loading menu. Use .listmenu or .imgmenu instead.' 
        }, { quoted: mek });
    }
});

// ================= LIST MENU (Simple) =================
cmd({
    pattern: "listmenu",
    desc: "Simple list menu",
    category: "menu",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const prefix = config.PREFIX || '.';
        
        const menuList = `
╔════════════════════╗
║   📋 *COMMAND LIST*  📋
╚════════════════════╝

╭───『 *🤖 AI* 』───
├ ${prefix}ai
├ ${prefix}aimenu
├ ${prefix}quran
├ ${prefix}prayer
╰────────────

╭───『 *⬇️ DOWNLOAD* 』───
├ ${prefix}dl
├ ${prefix}dlmenu
├ ${prefix}yt
├ ${prefix}fb
╰────────────

╭───『 *👥 GROUP* 』───
├ ${prefix}group
├ ${prefix}groupmenu
├ ${prefix}welcome
├ ${prefix}goodbye
╰────────────

╭───『 *🎮 FUN* 』───
├ ${prefix}fun
├ ${prefix}funmenu
├ ${prefix}game
├ ${prefix}quote
╰────────────

╭───『 *👑 OWNER* 』───
├ ${prefix}owner
├ ${prefix}ownermenu
├ ${prefix}ban
├ ${prefix}unban
╰────────────

╭───『 *🛠️ OTHER* 』───
├ ${prefix}logo
├ ${prefix}repo
├ ${prefix}sticker
├ ${prefix}ping
╰────────────

📌 *Total: 50+ commands*
💡 *Use ${prefix}help <command> for details*
`;

        await conn.sendMessage(from, {
            text: menuList
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
        
        const caption = `
╔══════════════════╗
║    🖼️ *IMAGE MENU*  🖼️
╚══════════════════╝

╔════『 *AI* 』════
║ ${prefix}aimenu
║ ${prefix}quranmenu
║ ${prefix}prayertime
╚══════════════════

╔════『 *DOWNLOAD* 』════
║ ${prefix}dlmenu
║ ${prefix}ytdl
║ ${prefix}fbdl
╚══════════════════

╔════『 *GROUP* 』════
║ ${prefix}groupmenu
║ ${prefix}adminmenu
║ ${prefix}welcomemenu
╚══════════════════

╔════『 *FUN* 』════
║ ${prefix}funmenu
║ ${prefix}gamesmenu
║ ${prefix}reactions
╚══════════════════

╔════『 *OWNER* 』════
║ ${prefix}ownermenu
║ ${prefix}settings
║ ${prefix}blockmenu
╚══════════════════

╔════『 *OTHER* 』════
║ ${prefix}logomenu
║ ${prefix}stickermenu
║ ${prefix}repomenu
╚══════════════════

✨ *GURU MD v9.0.0*
`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/66h86e.jpg" },
            caption: caption
        }, { quoted: mek });
        
    } catch (err) {
        console.log('Imgmenu error:', err);
        await conn.sendMessage(from, { 
            text: '❌ Error loading image menu.' 
        }, { quoted: mek });
    }
});

// ================= SIMPLE CATEGORIES =================
cmd({
    pattern: "categories",
    desc: "Quick categories",
    category: "menu",
    react: "📂",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const prefix = config.PREFIX || '.';
        
        const text = `
📂 *QUICK MENU CATEGORIES*

╔══════════════════╗
║  📱 TYPE TO ACCESS
╚══════════════════╝

▸ *AI MENU* → ${prefix}aimenu
▸ *DL MENU* → ${prefix}dlmenu
▸ *GROUP MENU* → ${prefix}groupmenu
▸ *FUN MENU* → ${prefix}funmenu
▸ *OWNER MENU* → ${prefix}ownermenu
▸ *LOGO MENU* → ${prefix}logomenu
▸ *STICKER MENU* → ${prefix}stickermenu
▸ *REPO MENU* → ${prefix}repomenu

━━━━━━━━━━━━━━━━
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
        await conn.sendMessage(from, { 
            text: '❌ Sound unavailable' 
        }, { quoted: mek });
    }
});

// ================= BACKWARD COMPATIBILITY =================
cmd({
    pattern: "menulist",
    desc: "Alias for listmenu",
    category: "menu",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    const prefix = config.PREFIX || '.';
    await conn.sendMessage(from, { 
        text: `🔄 Use *${prefix}listmenu*` 
    }, { quoted: mek });
});

cmd({
    pattern: "menuimage",
    desc: "Alias for imgmenu",
    category: "menu",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    const prefix = config.PREFIX || '.';
    await conn.sendMessage(from, { 
        text: `🔄 Use *${prefix}imgmenu*` 
    }, { quoted: mek });
});

cmd({
    pattern: "menucategories",
    desc: "Alias for categories",
    category: "menu",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    const prefix = config.PREFIX || '.';
    await conn.sendMessage(from, { 
        text: `🔄 Use *${prefix}categories*` 
    }, { quoted: mek });
});

// ================= ALTERNATIVE SIMPLE MENU =================
cmd({
    pattern: "help",
    desc: "Simple help menu",
    category: "menu",
    react: "❓",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const prefix = config.PREFIX || '.';
        
        const helpText = `
╔══════════════════╗
║   ❓ *HELP MENU*  ❓
╚══════════════════╝

📱 *AVAILABLE COMMANDS*

${prefix}menu - Main menu
${prefix}listmenu - List view
${prefix}imgmenu - Image view
${prefix}categories - Categories
${prefix}menusound - Play sound
${prefix}ping - Check bot
${prefix}alive - Bot status
${prefix}repo - Bot info

━━━━━━━━━━━━━━━━
✨ *GURU MD v9.0.0*
`;

        await conn.sendMessage(from, {
            text: helpText
        }, { quoted: mek });
        
    } catch (err) {
        console.log('Help error:', err);
    }
});

module.exports = { cmd };
