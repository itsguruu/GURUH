const config = require('../config');
const { cmd } = require('../command');

// ================= RANDOM EMOJIS =================
const coolEmojis = ['✨', '🔥', '🌟', '💫', '⚡', '🚀', '💎', '🌈', '🪐', '🎇', '💥', '🦋', '🧊', '🪩', '🌙'];

// ================= RUNTIME FUNCTION =================
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
    desc: "Main menu",
    category: "menu",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, pushname }) => {
    try {

        const randomEmoji = coolEmojis[Math.floor(Math.random() * coolEmojis.length)];
        const time = new Date().toLocaleTimeString();
        const date = new Date().toLocaleDateString();
        const up = runtime(process.uptime());

        const dec = `
╭━━━〔 ${randomEmoji} GURU MD SYSTEM ${randomEmoji} 〕━━━⬣
┃ 👋 ${greeting()}, ${pushname}
┃ 🕒 Time   : ${time}
┃ 📅 Date   : ${date}
┃ ⏳ Uptime : ${up}
┃ 🛠 Mode   : ${config.MODE}
┃ ⚙ Prefix : ${config.PREFIX}
┃ 🚀 Version: 8.0.0 Premium
╰━━━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 📂 MENU CATEGORIES 〕━━━⬣
┃ 🤖 aimenu
┃ 🕌 quranmenu
┃ 🕋 prayertime
┃ 🎌 animemenu
┃ 💫 reactions
┃ 🔄 convertmenu
┃ 😂 funmenu
┃ ⬇️ dlmenu
┃ 👥 groupmenu
┃ 👑 ownermenu
┃ 🎨 logo
┃ 📜 listcmd
┃ 📦 repo
┃ 📂 allmenu
╰━━━━━━━━━━━━━━━━━━━━━━⬣

> 💎 Powered By GuruTech Lab
`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/66h86e.jpg" },
            caption: dec,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363421164015033@newsletter',
                    newsletterName: 'GURU MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // Menu Sound
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
    }
});


// ================= LOGO MENU =================
cmd({
    pattern: "logo",
    alias: ["logomenu"],
    desc: "Logo menu",
    category: "menu",
    react: "🎨",
    filename: __filename
},
async (conn, mek, m, { from }) => {

    const dec = `
╭━━━〔 🎨 LOGO GENERATOR 〕━━━⬣
┃ ✨ neonlight
┃ ✨ blackpink
┃ ✨ dragonball
┃ ✨ futuristic
┃ ✨ galaxy
┃ ✨ hacker
┃ ✨ devilwings
┃ ✨ angelwings
┃ ✨ luxury
┃ ✨ frozen
┃ ✨ valorant
┃ ✨ typography
┃ ✨ birthday
╰━━━━━━━━━━━━━━━━━━━━━━⬣
`;

    await conn.sendMessage(from, {
        image: { url: "https://files.catbox.moe/66h86e.jpg" },
        caption: dec
    }, { quoted: mek });
});


// ================= REACTIONS MENU =================
cmd({
    pattern: "reactions",
    desc: "Reaction commands",
    category: "menu",
    react: "💫",
    filename: __filename
},
async (conn, mek, m, { from }) => {

    const dec = `
╭━━━〔 💫 REACTIONS MENU 〕━━━⬣
┃ 💕 hug @tag
┃ 😘 kiss @tag
┃ 😭 cry @tag
┃ 😡 slap @tag
┃ 🥺 cuddle @tag
┃ 😎 smile
┃ 💃 dance
┃ 🐶 awoo
┃ 🤝 highfive
┃ 😳 blush
╰━━━━━━━━━━━━━━━━━━━━━━⬣
`;

    await conn.sendMessage(from, {
        image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
        caption: dec
    }, { quoted: mek });
});


// ================= DOWNLOAD MENU =================
cmd({
    pattern: "dlmenu",
    desc: "Download menu",
    category: "menu",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, { from }) => {

    const dec = `
╭━━━〔 ⬇️ DOWNLOAD CENTER 〕━━━⬣
┃ 🎵 play
┃ 🎶 ytmp3
┃ 🎬 ytmp4
┃ 📱 tiktok
┃ 📘 facebook
┃ 📸 instagram
┃ 🐦 twitter
┃ 📦 mediafire
┃ 📌 pinterest
┃ ☁ gdrive
┃ 🌐 ssweb
╰━━━━━━━━━━━━━━━━━━━━━━⬣
`;

    await conn.sendMessage(from, {
        image: { url: "https://files.catbox.moe/66h86e.jpg" },
        caption: dec
    }, { quoted: mek });
});


// ================= GROUP MENU =================
cmd({
    pattern: "groupmenu",
    desc: "Group menu",
    category: "menu",
    react: "👥",
    filename: __filename
},
async (conn, mek, m, { from }) => {

    const dec = `
╭━━━〔 👥 GROUP MANAGEMENT 〕━━━⬣
┃ 🔗 grouplink
┃ ➕ add
┃ ➖ remove
┃ 👢 kick
┃ ⬆ promote
┃ ⬇ demote
┃ 🔒 lockgc
┃ 🔓 unlockgc
┃ 🏷 tagall
┃ 👑 tagadmins
┃ 📴 mute
┃ 🔊 unmute
┃ 📝 updategname
┃ 📄 updategdesc
╰━━━━━━━━━━━━━━━━━━━━━━⬣
`;

    await conn.sendMessage(from, {
        image: { url: "https://files.catbox.moe/66h86e.jpg" },
        caption: dec
    }, { quoted: mek });
});
