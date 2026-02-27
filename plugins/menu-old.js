const config = require('../config');
const { cmd } = require('../command');

// ================= RUNTIME =================
function runtime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d ? d + "d " : ""}${h ? h + "h " : ""}${m ? m + "m " : ""}${s ? s + "s" : ""}`;
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
async (conn, mek, m, { from, pushname }) => {

    try {

        const time = new Date().toLocaleTimeString();
        const date = new Date().toLocaleDateString();
        const up = runtime(process.uptime());

        const caption = `
╭━━━〔 ⚡ GURU MD SYSTEM ⚡ 〕━━━⬣
┃ 👋 ${greeting()}, ${pushname}
┃ 🕒 Time   : ${time}
┃ 📅 Date   : ${date}
┃ ⏳ Uptime : ${up}
┃ 🛠 Mode   : ${config.MODE}
┃ ⚙ Prefix : ${config.PREFIX}
┃ 🚀 Version: 9.0.0 Ultra
╰━━━━━━━━━━━━━━━━━━━━━━⬣

💎 Choose how you want to open the menu below
`;

        // ===== BUTTON MENU =====
        const buttons = [
            { buttonId: `${config.PREFIX}menulist`, buttonText: { displayText: "📋 List Menu" }, type: 1 },
            { buttonId: `${config.PREFIX}menuimage`, buttonText: { displayText: "🖼 Image Menu" }, type: 1 },
            { buttonId: `${config.PREFIX}menucategories`, buttonText: { displayText: "📂 Categories" }, type: 1 }
        ];

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/66h86e.jpg" },
            caption: caption,
            footer: "✨ Powered By GuruTech Lab",
            buttons: buttons,
            headerType: 4,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

        // ===== MENU SOUND =====
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });

    } catch (err) {
        console.log(err);
    }
});


// ================= LIST MENU =================
cmd({
    pattern: "menulist",
    desc: "List style menu",
    category: "menu",
    filename: __filename
},
async (conn, mek, m, { from }) => {

    const sections = [
        {
            title: "🤖 AI & Search",
            rows: [
                { title: "AI Menu", rowId: `${config.PREFIX}aimenu` },
                { title: "Quran Menu", rowId: `${config.PREFIX}quranmenu` },
                { title: "Prayer Time", rowId: `${config.PREFIX}prayertime` }
            ]
        },
        {
            title: "⬇️ Download Center",
            rows: [
                { title: "Download Menu", rowId: `${config.PREFIX}dlmenu` }
            ]
        },
        {
            title: "👥 Group",
            rows: [
                { title: "Group Menu", rowId: `${config.PREFIX}groupmenu` }
            ]
        },
        {
            title: "👑 Owner",
            rows: [
                { title: "Owner Menu", rowId: `${config.PREFIX}ownermenu` }
            ]
        }
    ];

    await conn.sendMessage(from, {
        text: "📋 Select a category",
        footer: "GURU MD ULTRA",
        title: "Main Menu List",
        buttonText: "Open Menu",
        sections
    }, { quoted: mek });
});


// ================= IMAGE MENU =================
cmd({
    pattern: "menuimage",
    desc: "Image style menu",
    category: "menu",
    filename: __filename
},
async (conn, mek, m, { from }) => {

    const text = `
╭━━━〔 📂 ALL CATEGORIES 〕━━━⬣
┃ 🤖 aimenu
┃ 🕌 quranmenu
┃ 🕋 prayertime
┃ 😂 funmenu
┃ 💫 reactions
┃ ⬇️ dlmenu
┃ 👥 groupmenu
┃ 👑 ownermenu
┃ 🎨 logo
┃ 📜 listcmd
┃ 📦 repo
╰━━━━━━━━━━━━━━━━━━━━━━⬣
`;

    await conn.sendMessage(from, {
        image: { url: "https://files.catbox.moe/66h86e.jpg" },
        caption: text
    }, { quoted: mek });
});


// ================= SIMPLE CATEGORY MENU =================
cmd({
    pattern: "menucategories",
    desc: "Category quick menu",
    category: "menu",
    filename: __filename
},
async (conn, mek, m, { from }) => {

    await conn.sendMessage(from, {
        text: `
📂 *Quick Categories*

🤖 .aimenu
⬇️ .dlmenu
👥 .groupmenu
😂 .funmenu
👑 .ownermenu
`
    }, { quoted: mek });
});
