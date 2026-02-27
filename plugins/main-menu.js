/* Note: GURU MD STEEL EDITION - CATBOX STABLE
   - Image: https://files.catbox.moe/66h86e.jpg
   - Layout: 100% Vertical Lines
   - Use my note in every script.
*/

const config = require('../config');
const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');

cmd({
    pattern: "menu3",
    alias: ["allmenu", "fullmenu"],
    desc: "Show all bot commands vertically",
    category: "menu",
    react: "📜",
    filename: __filename
}, 
async (conn, mek, m, { from, reply }) => {
    try {
        const userTag = `@${m.sender.split('@')[0]}`;
        const logoUrl = "https://files.catbox.moe/66h86e.jpg"; 

        let dec = `
█║▌│█│║▌║││█║▌║▌║
   *𝔾𝕌ℝ𝕌 𝕄𝔻 𝔸𝕃𝕃 𝕄𝔼ℕ𝕌*
█║▌│█│║▌║││█║▌║▌║

🛰️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐃𝐀𝐒𝐇𝐁𝐎𝐀𝐑𝐃*
▮ ▰ 👤 *𝐔𝐬𝐞𝐫:* ${userTag}
▮ ▰ ⏳ *𝐔𝐩𝐭𝐢𝐦𝐞:* ${runtime(process.uptime())}
▮ ▰ ⚙️ *𝐌𝐨𝐝𝐞:* ${config.MODE}

╭━━〔 📥 *𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃* 〕━━┈⊷
┃◈ facebook
┃◈ mediafire
┃◈ tiktok
┃◈ twitter
┃◈ insta
┃◈ apk
┃◈ img
┃◈ tt2
┃◈ pins
┃◈ apk2
┃◈ fb2
┃◈ pinterest
┃◈ spotify
┃◈ play
┃◈ play2
┃◈ audio
┃◈ video
┃◈ video2
┃◈ ytmp3
┃◈ ytmp4
┃◈ song
┃◈ darama
┃◈ gdrive
┃◈ ssweb
┃◈ tiks
╰──────────────┈⊷

╭━━〔 👥 *𝐆𝐑𝐎𝐔𝐏* 〕━━┈⊷
┃◈ grouplink
┃◈ kickall
┃◈ kickall2
┃◈ kickall3
┃◈ add
┃◈ remove
┃◈ kick
┃◈ promote
┃◈ demote
┃◈ dismiss
┃◈ revoke
┃◈ setgoodbye
┃◈ setwelcome
┃◈ delete
┃◈ getpic
┃◈ ginfo
┃◈ allreq
┃◈ updategname
┃◈ updategdesc
┃◈ joinrequests
┃◈ senddm
┃◈ nikal
┃◈ mute
┃◈ unmute
┃◈ lockgc
┃◈ unlockgc
┃◈ invite
┃◈ tag
┃◈ hidetag
┃◈ tagall
┃◈ tagadmins
╰──────────────┈⊷

╭━━〔 🎭 *𝐑𝐄𝐀𝐂𝐓𝐈𝐎𝐍𝐒* 〕━━┈⊷
┃◈ bully
┃◈ cuddle
┃◈ cry
┃◈ hug
┃◈ awoo
┃◈ kiss
┃◈ lick
┃◈ pat
┃◈ smug
┃◈ bonk
┃◈ yeet
┃◈ blush
┃◈ smile
┃◈ wave
┃◈ highfive
┃◈ handhold
┃◈ nom
┃◈ bite
┃◈ glomp
┃◈ slap
┃◈ kill
┃◈ happy
┃◈ wink
┃◈ poke
┃◈ dance
┃◈ cringe
╰──────────────┈⊷

╭━━〔 🎨 *𝐋𝐎𝐆𝐎 𝐌𝐀𝐊𝐄𝐑* 〕━━┈⊷
┃◈ neonlight
┃◈ blackpink
┃◈ dragonball
┃◈ 3dcomic
┃◈ america
┃◈ naruto
┃◈ sadgirl
┃◈ clouds
┃◈ futuristic
┃◈ 3dpaper
┃◈ eraser
┃◈ sunset
┃◈ leaf
┃◈ galaxy
┃◈ sans
┃◈ boom
┃◈ hacker
┃◈ devilwings
┃◈ nigeria
┃◈ bulb
┃◈ angelwings
┃◈ zodiac
┃◈ luxury
┃◈ paint
┃◈ frozen
┃◈ castle
┃◈ tatoo
┃◈ valorant
┃◈ bear
┃◈ typography
┃◈ birthday
╰──────────────┈⊷

╭━━〔 👑 *𝐎𝐖𝐍𝐄𝐑* 〕━━┈⊷
┃◈ owner
┃◈ menu
┃◈ menu2
┃◈ vv
┃◈ listcmd
┃◈ allmenu
┃◈ repo
┃◈ block
┃◈ unblock
┃◈ fullpp
┃◈ setpp
┃◈ restart
┃◈ shutdown
┃◈ updatecmd
┃◈ alive
┃◈ ping
┃◈ gjid
┃◈ jid
╰──────────────┈⊷

╭━━〔 🎉 *𝐅𝐔𝐍* 〕━━┈⊷
┃◈ shapar
┃◈ rate
┃◈ insult
┃◈ hack
┃◈ ship
┃◈ character
┃◈ pickup
┃◈ joke
┃◈ hrt
┃◈ hpy
┃◈ syd
┃◈ anger
┃◈ shy
┃◈ kiss
┃◈ mon
┃◈ cunfuzed
┃◈ hand
┃◈ nikal
┃◈ hold
┃◈ hug
┃◈ hifi
┃◈ poke
╰──────────────┈⊷

╭━━〔 🔄 *𝐂𝐎𝐍𝐕𝐄𝐑𝐓* 〕━━┈⊷
┃◈ sticker
┃◈ sticker2
┃◈ emojimix
┃◈ fancy
┃◈ take
┃◈ tomp3
┃◈ tts
┃◈ trt
┃◈ base64
┃◈ unbase64
┃◈ binary
┃◈ dbinary
┃◈ tinyurl
┃◈ urldecode
┃◈ urlencode
┃◈ url
┃◈ repeat
┃◈ ask
┃◈ readmore
╰──────────────┈⊷

╭━━〔 🤖 *𝐀𝐈* 〕━━┈⊷
┃◈ ai
┃◈ gpt3
┃◈ gpt2
┃◈ gptmini
┃◈ gpt
┃◈ meta
┃◈ blackbox
┃◈ luma
┃◈ dj
┃◈ obed
┃◈ hunter
┃◈ gpt4
┃◈ bing
┃◈ imagine
┃◈ imagine2
┃◈ copilot
╰──────────────┈⊷

╭━━〔 🎎 *𝐀𝐍𝐈𝐌𝐄* 〕━━┈⊷
┃◈ waifu
┃◈ neko
┃◈ megnumin
┃◈ maid
┃◈ loli
┃◈ animegirl
┃◈ animenews
┃◈ foxgirl
┃◈ naruto
╰──────────────┈⊷

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        await conn.sendMessage(from, {
            image: { url: logoUrl },
            caption: dec,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "𝔾𝕌ℝ𝕌 𝕄𝔻 - 𝕊𝕋𝔼𝔼𝕃 𝔼𝔻𝕀𝕋𝕀𝕆ℕ",
                    body: "⚡ 𝟹𝟻𝟶+ 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂 𝚅𝙴𝚁𝚃𝙸𝙲𝙰𝙻",
                    mediaType: 1,
                    sourceUrl: 'https://github.com/itsguruu/GURU',
                    thumbnailUrl: logoUrl,
                    renderLargerThumbnail: true 
                }
            }
        }, { quoted: mek });

        // Optional Audio
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });
        
    } catch (e) {
        console.error(e);
        reply("❌ Critical Error: Unable to send menu. Check Catbox link.");
    }
});
