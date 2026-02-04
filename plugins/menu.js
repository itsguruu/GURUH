const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');
const { sendButtons } = require('gifted-btns');

cmd({
    pattern: "menu2",
    desc: "Show interactive menu system",
    category: "menu",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
    try {
        // Show loading reaction
        await conn.sendMessage(from, {
            react: { text: '⏳', key: mek.key }
        });

        const userTag = `@${m.sender.split('@')[0]}`; // Tag the person who sent the command

        const menuCaption = `
╔════════════════════════════╗
║      ⋆★ 𝐆𝐔𝐑𝐔 𝐌𝐃 ★⋆       ║
║    ⚙️ 𝐒𝐭𝐞𝐞𝐥 𝐄𝐝𝐢𝐭𝐢𝐨𝐧 ⚙️    ║
╚════════════════════════════╝

✦ 𝐔𝐬𝐞𝐫     : ${userTag}
✦ 𝐏𝐫𝐞𝐟𝐢𝐱   : ${config.PREFIX}
✦ 𝐑𝐮𝐧𝐭𝐢𝐦𝐞  : ${runtime(process.uptime())}
✦ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧  : 5.0.0 MAX
✦ 𝐌𝐨𝐝𝐞     : ${config.MODE}
✦ 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦 : Vercel

════════════════════════════════

🔥 𝐒𝐄𝐋𝐄𝐂𝐓 𝐀 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐘 🔥
════════════════════════════════
1️⃣  𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗠𝗲𝗻𝘂
2️⃣  𝗚𝗿𝗼𝘂𝗽 𝗠𝗲𝗻𝘂
3️⃣  𝗙𝘂𝗻 𝗠𝗲𝗻𝘂
4️⃣  𝗢𝘄𝗻𝗲𝗿 𝗠𝗲𝗻𝘂
5️⃣  𝗔𝗜 𝗠𝗲𝗻𝘂
6️⃣  𝗔𝗻𝗶𝗺𝗲 𝗠𝗲𝗻𝘂
7️⃣  𝗖𝗼𝗻𝘃𝗲𝗿𝘁 𝗠𝗲𝗻𝘂
8️⃣  𝗢𝘁𝗵𝗲𝗿 𝗠𝗲𝗻𝘂
9️⃣  𝗥𝗲𝗮𝗰𝘁𝗶𝗼𝗻𝘀 𝗠𝗲𝗻𝘂
🔟  𝗕𝗮𝗰𝗸 𝘁𝗼 𝗠𝗮𝗶𝗻

════════════════════════════════

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech | https://github.com/itsguruu/GURU`;

        const contextInfo = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363421164015033@newsletter',
                newsletterName: 'GURU MD',
                serverMessageId: 143
            }
        };

        const sentMsg = await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/ntfw9h.jpg' },
                caption: menuCaption,
                contextInfo: contextInfo
            },
            { quoted: mek }
        );

        // Send menu audio only once
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
            mimetype: 'audio/mp4',
            ptt: true,       
        }, { quoted: mek });

        const messageID = sentMsg.key.id;

        // === SUB-MENUS (with bold steel & unique style) ===
        const menuData = {
            '1': {
                title: "🔥 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗠𝗘𝗡𝗨 🔥",
                content: `╔════════════════════════╗
║  𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬  ║
╚════════════════════════╝

• facebook [url]
• mediafire [url]
• tiktok [url]
• twitter [url]
• insta [url]
• apk [app]
• img [query]
• tt2 [url]
• pins [url]
• apk2 [app]
• fb2 [url]
• pinterest [url]
• spotify [query]
• play [song]
• play2 [song]
• audio [url]
• video [url]
• video2 [url]
• ytmp3 [url]
• ytmp4 [url]
• song [name]
• darama [name]
• gdrive [url]
• ssweb [url]
• tiks [url]

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`
            },
            '2': {
                title: "🛡️ 𝗚𝗥𝗢𝗨𝗣 𝗠𝗘𝗡𝗨 🛡️",
                content: `╔════════════════════════╗
║  𝐆𝐫𝐨𝐮𝐩 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬  ║
╚════════════════════════╝

• grouplink
• kickall
• kickall2
• kickall3
• add @user
• remove @user
• kick @user
• promote @user
• demote @user
• dismiss
• revoke
• setgoodbye [msg]
• setwelcome [msg]
• delete
• getpic
• ginfo
• disappear on/off
• disappear 7D,24H
• allreq
• updategname [name]
• updategdesc [desc]
• joinrequests
• senddm @user [msg]
• nikal
• mute
• unmute
• lockgc
• unlockgc
• invite
• tag @user
• hidetag [msg]
• tagall
• tagadmins

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`
            },
            '3': {
                title: "🎭 𝗙𝗨𝗡 𝗠𝗘𝗡𝗨 🎭",
                content: `╔════════════════════════╗
║  𝐅𝐮𝐧 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬  ║
╚════════════════════════╝

• shapar
• rate @user
• insult @user
• hack @user
• ship @user @user
• character @user
• pickup
• joke
• hrt
• hpy
• syd
• anger
• shy
• kiss @tag
• mon
• cunfuzed
• hand @tag
• nikal
• hold @tag
• hug @tag
• hifi
• poke @tag

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`
            },
            '4': {
                title: "👑 𝗢𝗪𝗡𝗘𝗥 𝗠𝗘𝗡𝗨 👑",
                content: `╔════════════════════════╗
║  𝐎𝐰𝐧𝐞𝐫 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬  ║
╚════════════════════════╝

• owner
• menu
• menu2
• vv
• listcmd
• allmenu
• repo
• block @user
• unblock @user
• fullpp
• setpp
• restart
• shutdown
• updatecmd
• alive
• ping
• gjid
• jid

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`
            },
            '5': {
                title: "🤖 𝗔𝗜 𝗠𝗘𝗡𝗨 🤖",
                content: `╔════════════════════════╗
║  𝐀𝐈 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬  ║
╚════════════════════════╝

• ai [query]
• gpt3 [query]
• gpt2 [query]
• gptmini [query]
• gpt [query]
• meta [query]
• blackbox [query]
• luma [query]
• dj [query]
• obed [query]
• hunter [query]
• gpt4 [query]
• bing [query]
• imagine [desc]
• imagine2 [desc]
• copilot [query]

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`
            },
            '6': {
                title: "🎎 𝗔𝗡𝗜𝗠𝗘 𝗠𝗘𝗡𝗨 🎎",
                content: `╔════════════════════════╗
║  𝐀𝐧𝐢𝐦𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬  ║
╚════════════════════════╝

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

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`
            },
            '7': {
                title: "🔄 𝗖𝗢𝗡𝗩𝗘𝗥𝗧 𝗠𝗘𝗡𝗨 🔄",
                content: `╔════════════════════════╗
║  𝐂𝐨𝐧𝐯𝐞𝐫𝐭 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬  ║
╚════════════════════════╝

• sticker
• sticker2
• emojimix
• fancy [text]
• take [pack/author]
• tomp3
• tts [text]
• trt [text]
• base64 [text]
• unbase64 [text]
• binary [text]
• dbinary [text]
• tinyurl [url]
• urldecode [url]
• urlencode [text]
• url [text]
• repeat [text]
• ask [query]
• readmore [text]

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`
            },
            '8': {
                title: "ℹ️ 𝗢𝗧𝗛𝗘𝗥 𝗠𝗘𝗡𝗨 ℹ️",
                content: `╔════════════════════════╗
║  𝐎𝐭𝐡𝐞𝐫 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬  ║
╚════════════════════════╝

• timenow
• date
• count
• calculate [expr]
• countx
• flip
• coinflip
• rcolor
• roll
• fact
• cpp [code]
• rw
• pair
• pair2
• pair3
• fancy [text]
• logo <text>
• define [word]
• news
• movie [name]
• weather [city]
• srepo [name]
• insult @tag
• save
• wikipedia [query]
• gpass
• githubstalk [user]
• yts [query]
• ytv [url]

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`
            },
            '9': {
                title: "🎭 𝗥𝗘𝗔𝗖𝗧𝗜𝗢𝗡𝗦 𝗠𝗘𝗡𝗨 🎭",
                content: `╔════════════════════════╗
║  𝐑𝐞𝐚𝐜𝐭𝐢𝐨𝐧𝐬  ║
╚════════════════════════╝

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

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`
            },
            '10': {
                title: "🏠 𝗠𝗔𝗜𝗡 𝗠𝗘𝗡𝗨 🏠",
                content: `╔════════════════════════╗
║  𝐌𝐚𝐢𝐧 𝐌𝐞𝐧𝐮  ║
╚════════════════════════╝

• ping
• alive
• menu
• menu2
• menu3
• repo
• owner
• restart

> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`
            }
        };

        // === MAIN MENU ===
        if (!mek.message?.buttonResponseMessage) {
            const sentMsg = await conn.sendMessage(
                from,
                {
                    image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/ntfw9h.jpg' },
                    caption: menuCaption,
                    contextInfo: contextInfo
                },
                { quoted: mek }
            );

            // Send menu audio
            await conn.sendMessage(from, {
                audio: { url: 'https://github.com/criss-vevo/CRISS-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
                mimetype: 'audio/mp4',
                ptt: true,
            }, { quoted: mek });

            const messageID = sentMsg.key.id;

            // === BUTTON CLICK HANDLER ===
            const handler = async (msgData) => {
                const receivedMsg = msgData.messages[0];
                if (!receivedMsg?.message || !receivedMsg.key?.remoteJid) return;

                const isReplyToMenu = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (isReplyToMenu) {
                    const receivedText = receivedMsg.message.conversation || 
                                       receivedMsg.message.extendedTextMessage?.text;
                    const senderID = receivedMsg.key.remoteJid;

                    await conn.sendMessage(senderID, {
                        react: { text: '⏳', key: receivedMsg.key }
                    });

                    if (menuData[receivedText]) {
                        const selectedMenu = menuData[receivedText];
                        
                        await conn.sendMessage(
                            senderID,
                            {
                                image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/ntfw9h.jpg' },
                                caption: selectedMenu.content,
                                contextInfo: contextInfo
                            },
                            { quoted: receivedMsg }
                        );

                        await conn.sendMessage(senderID, {
                            react: { text: '✅', key: receivedMsg.key }
                        });

                    } else {
                        await conn.sendMessage(
                            senderID,
                            {
                                text: `❌ *Invalid Option!* ❌\n\nReply with a number 1-10 to select a menu.\n\nExample: Reply with "1" for Download Menu\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`,
                                contextInfo: contextInfo
                            },
                            { quoted: receivedMsg }
                        );
                        await conn.sendMessage(senderID, {
                            react: { text: '❌', key: receivedMsg.key }
                        });
                    }
                }
            };

            conn.ev.on("messages.upsert", handler);

            setTimeout(() => {
                conn.ev.off("messages.upsert", handler);
            }, 300000); // 5 minutes timeout

        } else if (mek.message?.buttonResponseMessage) {
            // Handle direct button clicks if needed (fallback)
            const buttonId = mek.message.buttonResponseMessage.selectedButtonId;
            await reply(`You selected: ${buttonId}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
        }

    } catch (e) {
        console.error('Menu Error:', e);
        await conn.sendMessage(from, {
            react: { text: '❌', key: mek.key }
        });
        reply(`❌ An error occurred: ${e}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);
    }
});
