/* Note: GURU MD STEEL EDITION - ULTRA STABLE SPLIT
   - Image: https://files.catbox.moe/66h86e.jpg
   - Layout: 100% Vertical Lines
   - Fix: Split Message to avoid Buffer/Length Errors
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

        // 1. Send the Horizontal Banner First (Stays at the top)
        await conn.sendMessage(from, {
            image: { url: logoUrl },
            caption: `*𝔾𝕌ℝ𝕌 𝕄𝔻 𝕍𝟝 𝔸𝕃𝕃 𝕄𝔼ℕ𝕌*\n👤 *User:* ${userTag}\n⏳ *Uptime:* ${runtime(process.uptime())}\n\n> 📜 *Full Vertical Command List Below:*`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "𝔾𝕌ℝ𝕌  𝕄𝔻  𝕊𝕋𝔼𝔼𝕃  𝔼𝔻𝕀𝕋𝕀𝕆ℕ",
                    body: "ᴛʜᴇ ꜰᴜᴛᴜʀᴇ ᴏꜰ ʙᴏᴛꜱ",
                    mediaType: 1,
                    sourceUrl: 'https://github.com/itsguruu/GURU',
                    thumbnailUrl: logoUrl,
                    renderLargerThumbnail: true 
                }
            }
        }, { quoted: mek });

        // 2. The 350+ Vertical List (Sent as Text to ensure it never fails)
        let dec = `
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
┃◈ tagall
┃◈ hidetag
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

╭━━〔 👑 *𝐎𝐖𝐍𝐄𝐑* 〕━━┈⊷
┃◈ owner
┃◈ vv
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

╭━━〔 ℹ️ *𝐎𝐓𝐇𝐄𝐑* 〕━━┈⊷
┃◈ timenow
┃◈ date
┃◈ count
┃◈ calculate
┃◈ flip
┃◈ coinflip
┃◈ rcolor
┃◈ roll
┃◈ fact
┃◈ cpp
┃◈ rw
┃◈ pair
┃◈ news
┃◈ movie
┃◈ weather
┃◈ save
┃◈ wikipedia
╰──────────────┈⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢᴜʀᴜᴛᴇᴄʜ`;

        // Send the Vertical List
        await conn.sendMessage(from, { text: dec }, { quoted: mek });

        // 3. Send Audio
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });
        
    } catch (e) {
        console.error(e);
        reply("❌ Critical Error: Bot memory full or connection lost.");
    }
});
