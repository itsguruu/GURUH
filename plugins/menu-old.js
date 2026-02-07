// ─── Main Menu ───
cmd({
    pattern: "menu",
    desc: "menu the bot",
    category: "menu",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, pushname, reply }) => {
    try {
        const dec = `*GURU MD 5.0*
Prefix: ${config.PREFIX}
Owner: +254778074353
Mode: ${config.MODE}
Dev: GuruTech

Quran • Prayertime • AI • Anime
Reactions • Convert • Fun • Download
Group • Owner • Other • Logo • Repo

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
            caption: dec,
            footer: "GURU MD Menu",
            buttons: [
                { buttonId: `${config.PREFIX}allmenu`, buttonText: { displayText: "All Commands" }, type: 1 },
                { buttonId: `${config.PREFIX}dlmenu`, buttonText: { displayText: "Download Menu" }, type: 1 },
                { buttonId: `${config.PREFIX}groupmenu`, buttonText: { displayText: "Group Menu" }, type: 1 }
            ],
            headerType: 4,
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

        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });
        
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// ─── Logo Menu ───
cmd({
    pattern: "logo",
    alias: ["logomenu"],
    desc: "logo commands",
    category: "menu",
    react: "🧃",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `*Logo Commands*
neonlight • blackpink • dragonball • 3dcomic
america • naruto • sadgirl • clouds • futuristic
3dpaper • eraser • sunset • leaf • galaxy
sans • boom • hacker • devilwings • nigeria
bulb • angelwings • zodiac • luxury • paint
frozen • castle • tatoo • valorant • bear
typography • birthday

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
            caption: dec,
            footer: "Logo Menu",
            buttons: [
                { buttonId: `${config.PREFIX}neonlight test`, buttonText: { displayText: "Try Neonlight" }, type: 1 },
                { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: "Back to Menu" }, type: 1 }
            ],
            headerType: 4,
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

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// ─── Reactions Menu ───
cmd({
    pattern: "reactions",
    desc: "Shows the reaction commands",
    category: "menu",
    react: "💫",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, reply }) => {
    try {
        let dec = `*Reactions*
bully • cuddle • cry • hug • awoo • kiss • lick
pat • smug • bonk • yeet • blush • smile • wave
highfive • handhold • nom • bite • glomp • slap
kill • happy • wink • poke • dance • cringe

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
            caption: dec,
            footer: "Reactions Menu",
            buttons: [
                { buttonId: `\( {config.PREFIX}hug @ \){m.sender.split('@')[0]}`, buttonText: { displayText: "Hug Someone" }, type: 1 },
                { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: "Back to Menu" }, type: 1 }
            ],
            headerType: 4,
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

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// ─── Download Menu ───
cmd({
    pattern: "dlmenu",
    desc: "download commands",
    category: "menu",
    react: "⤵️",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `*Download*
facebook • mediafire • tiktok • twitter • insta
apk • img • tt2 • pins • apk2 • fb2 • pinterest
spotify • play(1-10) • audio • video(1-10)
ytmp3 • ytmp4 • song • darama • gdrive • ssweb • tiks

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
            caption: dec,
            footer: "Download Menu",
            buttons: [
                { buttonId: `${config.PREFIX}play example song`, buttonText: { displayText: "Play Song" }, type: 1 },
                { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: "Back to Menu" }, type: 1 }
            ],
            headerType: 4,
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

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// ─── Group Menu ───
cmd({
    pattern: "groupmenu",
    desc: "group commands",
    category: "menu",
    react: "⤵️",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `*Group*
grouplink • kickall(1-3) • add • remove/kick
promote • demote • dismiss • revoke
setgoodbye • setwelcome • delete • getpic • ginfo
disappear on/off/7D/24H • allreq
updategname • updategdesc • joinrequests
senddm • nikal • mute • unmute • lockgc • unlockgc
invite • tag/hidetag/tagall/tagadmins

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/ntfw9h.jpg" },
            caption: dec,
            footer: "Group Menu",
            buttons: [
                { buttonId: `${config.PREFIX}ginfo`, buttonText: { displayText: "Group Info" }, type: 1 },
                { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: "Back to Menu" }, type: 1 }
            ],
            headerType: 4,
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

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
