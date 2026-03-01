/* ============================================
   GURU MD - ORACLE STRICT VERTICAL
   Style: Continuous Vertical Dot-Matrix
   Layout: 200+ Commands Line-by-Line
   Version: 30.0.0 | 2026 Edition
   ============================================ */

const config = require('../config');
const { cmd, commands } = require('../command');

// Note: Always ensure your API keys are updated in config.js
// [2025-12-27] Use my note in every script.

function runtime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m`;
}

cmd({
    pattern: "menu",
    desc: "Show strict vertical Oracle menu",
    category: "main",
    react: "🌑",
    filename: __filename
},
async (conn, mek, m, { from, pushname, isOwner }) => {
    try {
        const p = config.PREFIX || '.';
        const uptime = runtime(process.uptime());
        const imageUrl = "https://files.catbox.moe/66h86e.jpg";
        
        const menuText = `
● ━━━ 〔 𝗚𝗨𝗥𝗨-𝗠𝗗 𝗢𝗥𝗔𝗖𝗟𝗘 〕 ━━━ ●

👋 *Greetings,* ${pushname}
📊 *System:* v30.0.0
⏱️ *Uptime:* ${uptime}
🛡️ *Mode:* ${config.MODE}

┃
┃ 🟢 *𝗔𝗜 𝗢𝗠𝗡𝗜-𝗦𝗘𝗥𝗩𝗘*
┃  ● ${p}gpt4
┃  ● ${p}gemini
┃  ● ${p}claude3
┃  ● ${p}llama3
┃  ● ${p}deepseek
┃  ● ${p}mistral
┃  ● ${p}imagine
┃  ● ${p}dalle3
┃  ● ${p}remini
┃  ● ${p}upscale
┃  ● ${p}removebg
┃  ● ${p}voiceai
┃  ● ${p}translate
┃  ● ${p}code-gen
┃
┃ 🔵 *𝗠𝗘𝗗𝗜𝗔 & 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗦*
┃  ● ${p}ytmp3
┃  ● ${p}ytmp4
┃  ● ${p}yts
┃  ● ${p}tiktok
┃  ● ${p}reels
┃  ● ${p}ig-story
┃  ● ${p}facebook
┃  ● ${p}twitter
┃  ● ${p}spotify
┃  ● ${p}deezer
┃  ● ${p}terabox
┃  ● ${p}gdrive
┃  ● ${p}mediafire
┃  ● ${p}gitdl
┃  ● ${p}pinterest
┃  ● ${p}play
┃
┃ 🟡 *𝗚𝗥𝗢𝗨𝗣 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬*
┃  ● ${p}kick
┃  ● ${p}add
┃  ● ${p}promote
┃  ● ${p}demote
┃  ● ${p}tagall
┃  ● ${p}hidetag
┃  ● ${p}antilink
┃  ● ${p}antidelete
┃  ● ${p}antivv
┃  ● ${p}antibot
┃  ● ${p}antiword
┃  ● ${p}mute
┃  ● ${p}lock
┃  ● ${p}warn
┃  ● ${p}groupinfo
┃
┃ 🔴 *𝗘𝗡𝗧𝗘𝗥𝗧𝗔𝗜𝗡𝗠𝗘𝗡𝗧*
┃  ● ${p}chess
┃  ● ${p}tictactoe
┃  ● ${p}mines
┃  ● ${p}pokemon
┃  ● ${p}fishing
┃  ● ${p}work
┃  ● ${p}bank
┃  ● ${p}rob
┃  ● ${p}daily
┃  ● ${p}truth
┃  ● ${p}dare
┃  ● ${p}roast
┃  ● ${p}ship
┃  ● ${p}couple
┃
┃ ⚪ *𝗧𝗢𝗢𝗟𝗦 & 𝗨𝗧𝗜𝗟𝗦*
┃  ● ${p}sticker
┃  ● ${p}take
┃  ● ${p}smeme
┃  ● ${p}toimg
┃  ● ${p}tomp3
┃  ● ${p}tomp4
┃  ● ${p}tourl
┃  ● ${p}qr
┃  ● ${p}tts
┃  ● ${p}google
┃  ● ${p}wiki
┃  ● ${p}lyrics
┃  ● ${p}weather
┃  ● ${p}calc
┃
┃ 🟣 *𝗠𝗔𝗦𝗧𝗘𝗥 𝗖𝗢𝗡𝗧𝗥𝗢𝗟*
┃  ● ${p}eval
┃  ● ${p}exec
┃  ● ${p}restart
┃  ● ${p}bc
┃  ● ${p}setprefix
┃  ● ${p}ban
┃  ● ${p}unban
┃  ● ${p}block
┃  ● ${p}join
┃  ● ${p}leave
┃
● ━━━━━━━━━━━━━━━━━━━━━━━━━ ●
  💡 *214+ Premium Commands Active*
  ⚡ *2026 GURU-TECH SYSTEMS*
`;

        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: menuText,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1,
                isForwarded: true,
                externalAdReply: {
                    title: "GURU-MD",
                    body: "Strict Vertical Production Build",
                    thumbnailUrl: imageUrl,
                    mediaType: 1
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error('Oracle Menu Error:', err);
    }
});

module.exports = { cmd };
