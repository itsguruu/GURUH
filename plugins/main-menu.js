const config = require('../config');
const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "menu3",
    alias: ["allmenu", "fullmenu"],
    use: '.menu3',
    desc: "Show all bot commands",
    category: "menu",
    react: "📜",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `╔═════ ⋆★ GURU MD ★⋆ ═════╗
║        Powered by GuruTech        ║
╚═══════════════════════════════════╝

✦ Prefix     : ${config.PREFIX}
✦ Runtime    : ${runtime(process.uptime())}
✦ Version    : 5.0.0 MAX
✦ Status     : Online & Ready 💢

───────────────────────────────

📥 DOWNLOAD COMMANDS
───────────────────────────────
• facebook
• mediafire
• tiktok
• twitter
• insta
• apk
• img
• tt2
• pins
• apk2
• fb2
• pinterest
• spotify
• play
• play2
• audio
• video
• video2
• ytmp3
• ytmp4
• song
• darama
• gdrive
• ssweb
• tiks

───────────────────────────────

👥 GROUP COMMANDS
───────────────────────────────
• grouplink
• kickall
• kickall2
• kickall3
• add
• remove
• kick
• promote
• demote
• dismiss
• revoke
• setgoodbye
• setwelcome
• delete
• getpic
• ginfo
• disappear on
• disappear off
• disappear 7D,24H
• allreq
• updategname
• updategdesc
• joinrequests
• senddm
• nikal
• mute
• unmute
• lockgc
• unlockgc
• invite
• tag
• hidetag
• tagall
• tagadmins

───────────────────────────────

🎭 REACTIONS MENU
───────────────────────────────
• bully @tag
• cuddle @tag
• cry @tag
• hug @tag
• awoo @tag
• kiss @tag
• lick @tag
• pat @tag
• smug @tag
• bonk @tag
• yeet @tag
• blush @tag
• smile @tag
• wave @tag
• highfive @tag
• handhold @tag
• nom @tag
• bite @tag
• glomp @tag
• slap @tag
• kill @tag
• happy @tag
• wink @tag
• poke @tag
• dance @tag
• cringe @tag

───────────────────────────────

🎨 LOGO MAKER
───────────────────────────────
• neonlight
• blackpink
• dragonball
• 3dcomic
• america
• naruto
• sadgirl
• clouds
• futuristic
• 3dpaper
• eraser
• sunset
• leaf
• galaxy
• sans
• boom
• hacker
• devilwings
• nigeria
• bulb
• angelwings
• zodiac
• luxury
• paint
• frozen
• castle
• tatoo
• valorant
• bear
• typography
• birthday

───────────────────────────────

👑 OWNER COMMANDS
───────────────────────────────
• owner
• menu
• menu2
• vv
• listcmd
• allmenu
• repo
• block
• unblock
• fullpp
• setpp
• restart
• shutdown
• updatecmd
• alive
• ping
• gjid
• jid

───────────────────────────────

🎉 FUN COMMANDS
───────────────────────────────
• shapar
• rate
• insult
• hack
• ship
• character
• pickup
• joke
• hrt
• hpy
• syd
• anger
• shy
• kiss
• mon
• cunfuzed
• hand
• nikal
• hold
• hug
• hifi
• poke

───────────────────────────────

🔄 CONVERT COMMANDS
───────────────────────────────
• sticker
• sticker2
• emojimix
• fancy
• take
• tomp3
• tts
• trt
• base64
• unbase64
• binary
• dbinary
• tinyurl
• urldecode
• urlencode
• url
• repeat
• ask
• readmore

───────────────────────────────

🤖 AI COMMANDS
───────────────────────────────
• ai
• gpt3
• gpt2
• gptmini
• gpt
• meta
• blackbox
• luma
• dj
• obed
• hunter
• gpt4
• bing
• imagine
• imagine2
• copilot

───────────────────────────────

🎎 ANIME COMMANDS
───────────────────────────────
• fack
• truth
• dare
• dog
• awoo
• garl
• waifu
• neko
• megnumin
• maid
• loli
• animegirl
• animegirl1-5
• anime1-5
• animenews
• foxgirl
• naruto

───────────────────────────────

ℹ️ OTHER COMMANDS
───────────────────────────────
• timenow
• date
• count
• calculate
• countx
• flip
• coinflip
• rcolor
• roll
• fact
• cpp
• rw
• pair
• pair2
• pair3
• fancy
• logo <text>
• define
• news
• movie
• weather
• srepo
• insult
• save
• wikipedia
• gpass
• githubstalk
• yts
• ytv

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech | https://github.com/itsguruu/GURU`;

        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/ntfw9h.jpg' },
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
            },
            { quoted: mek }
        );

        // Send audio
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });
        
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e}`);
    }
});
