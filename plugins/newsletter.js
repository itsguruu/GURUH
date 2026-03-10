/* ============================================
   GURU MD - NEWSLETTER CODE GENERATOR
   COMMAND: .newsletter [channel link]
   CONVERTS: Channel link → Newsletter code
   STYLE: Retro-Wave / Synthwave Design
   ============================================ */

const { cmd } = require('../command');
const axios = require('axios');

// Configuration
const BOT_NAME = 'GURU MD';
const BOT_FOOTER = '∞ ｓｙｎｔｈｗａｖｅ ｅｄｉｔｉｏｎ ∞';
const OWNER_NAME = 'ＭＲＳ ＧＵＲＵ';
const BOT_VERSION = '𝟯𝟬.𝟬.𝟬';

// Helper function to extract channel info from link
function extractChannelInfo(link) {
    // WhatsApp channel link formats:
    // https://whatsapp.com/channel/123456789
    // https://wa.me/channel/123456789
    // https://chat.whatsapp.com/channel/123456789
    
    let channelId = '';
    
    if (link.includes('channel/')) {
        channelId = link.split('channel/')[1].split(/[?#&]/)[0].trim();
    } else if (link.includes('wa.me/')) {
        channelId = link.split('wa.me/')[1].split(/[?#&]/)[0].trim();
    }
    
    return {
        fullLink: link,
        channelId: channelId,
        newsletterCode: channelId ? `L${channelId}` : null
    };
}

// Helper to validate WhatsApp channel link
function isValidChannelLink(link) {
    const patterns = [
        /whatsapp\.com\/channel\/\d+/i,
        /wa\.me\/channel\/\d+/i,
        /chat\.whatsapp\.com\/channel\/\d+/i
    ];
    return patterns.some(pattern => pattern.test(link));
}

// Retro-Wave Design (New Style)
function getRetroWaveStyle(channelInfo) {
    return `
░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░

     📢 ɴᴇᴡꜱʟᴇᴛᴛᴇʀ ᴄᴏᴅᴇ    
     ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

     🔗 [ɪɴᴘᴜᴛ ʟɪɴᴋ]
     ~~~~~~~~~~~~~~~~
     ${channelInfo.fullLink.substring(0, 35)}

     🆔 [ᴄʜᴀɴɴᴇʟ ɪᴅ]
     ~~~~~~~~~~~~~~~~
     ${channelInfo.channelId}

     🔑 [ɴᴇᴡꜱʟᴇᴛᴛᴇʀ ᴄᴏᴅᴇ]
     ~~~~~~~~~~~~~~~~
     ${channelInfo.newsletterCode}

     ⚡ [ʜᴏᴡ ᴛᴏ ᴜꜱᴇ]
     ~~~~~~~~~~~~~~~~
     ☍ ᴏᴘᴇɴ ᴡʜᴀᴛꜱᴀᴘᴘ
     ☍ ɢᴏ ᴛᴏ ᴜᴘᴅᴀᴛᴇꜱ ᴛᴀʙ
     ☍ ᴛᴀᴘ "ꜰɪɴᴅ ᴄʜᴀɴɴᴇʟꜱ"
     ☍ ᴘᴀꜱᴛᴇ ᴛʜɪꜱ ᴄᴏᴅᴇ
     ☍ ᴊᴏɪɴ ʏᴏᴜʀ ᴄʜᴀɴɴᴇʟ

     ▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀

░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░
`;
}

// Alternative Neon Style
function getNeonStyle(channelInfo) {
    return `
╔═══✧❁✧═══╗
  📢 ＮＥＷＳＬＥＴＴＥＲ  
  ＣＯＤＥ ＧＥＮＥＲＡＴＯＲ
╚═══✧❁✧═══╝

┏━━━━━━━━━━━━━━━━━━━━┓
┃  🔗 ＬＩＮＫ          ┃
┃  ${channelInfo.fullLink.substring(0, 25)}...  
┃━━━━━━━━━━━━━━━━━━━━┃
┃  🆔 ＣＨＡＮＮＥＬ ＩＤ   ┃
┃  ${channelInfo.channelId}                    
┃━━━━━━━━━━━━━━━━━━━━┃
┃  🔑 ＣＯＤＥ          ┃
┃  ${channelInfo.newsletterCode}                
┃━━━━━━━━━━━━━━━━━━━━┃
┃  📱 ＨＯＷ ＴＯ ＵＳＥ   ┃
┃  ✦ Ｏｐｅｎ ＷｈａｔｓＡｐｐ ┃
┃  ✦ Ｕｐｄａｔｅｓ ｔａｂ    ┃
┃  ✦ Ｆｉｎｄ ｃｈａｎｎｅｌｓ ┃
┃  ✦ Ｓｅａｒｃｈ ｃｏｄｅ   ┃
┃  ✦ Ｊｏｉｎ ｃｈａｎｎｅｌ ┃
┗━━━━━━━━━━━━━━━━━━━━┛

     ✦ ＧＵＲＵ ＭＤ ✦
`;
}

// Main command
cmd({
    pattern: "newsletter",
    alias: ["ncode", "channelcode", "newslettercode"],
    desc: "Convert WhatsApp channel link to newsletter code",
    category: "tools",
    react: "📢",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, sender, pushname }) => {
    try {
        // Initial reaction
        await conn.sendMessage(from, {
            react: {
                text: "📢",
                key: mek.key
            }
        });

        // Check if link is provided
        if (!q) {
            const helpMsg = `
░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░

        📢 ʜᴇʟᴘ ᴍᴇɴᴜ     
        ▄▄▄▄▄▄▄▄▄▄▄▄

     ᴜꜱᴀɢᴇ: .ɴᴇᴡꜱʟᴇᴛᴛᴇʀ [ʟɪɴᴋ]

     ᴇxᴀᴍᴘʟᴇꜱ:
     ☍ .ɴᴇᴡꜱʟᴇᴛᴛᴇʀ ʜᴛᴛᴘꜱ://ᴡʜᴀᴛꜱᴀᴘᴘ.ᴄᴏᴍ/ᴄʜᴀɴɴᴇʟ/123456789
     ☍ .ɴᴇᴡꜱʟᴇᴛᴛᴇʀ ʜᴛᴛᴘꜱ://ᴡᴀ.ᴍᴇ/ᴄʜᴀɴɴᴇʟ/123456789

     ʜᴏᴡ ᴛᴏ ɢᴇᴛ ʟɪɴᴋ:
     ☍ ᴏᴘᴇɴ ʏᴏᴜʀ ᴄʜᴀɴɴᴇʟ
     ☍ ᴛᴀᴘ ᴄʜᴀɴɴᴇʟ ɴᴀᴍᴇ
     ☍ ꜱʜᴀʀᴇ → ᴄᴏᴘʏ ʟɪɴᴋ

     ᴏᴡɴᴇʀ: ${OWNER_NAME}
     ᴠᴇʀꜱɪᴏɴ: ${BOT_VERSION}

░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░
`;
            return await reply(helpMsg);
        }

        console.log('[NEWSLETTER] Processing link:', q);

        // Validate the link
        if (!isValidChannelLink(q)) {
            const errorMsg = `
░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░

        ❌ ɪɴᴠᴀʟɪᴅ ʟɪɴᴋ     
        ▄▄▄▄▄▄▄▄▄▄▄▄▄

     ᴘʟᴇᴀꜱᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ
     ᴡʜᴀᴛꜱᴀᴘᴘ ᴄʜᴀɴɴᴇʟ ʟɪɴᴋ.

     ᴠᴀʟɪᴅ ꜰᴏʀᴍᴀᴛꜱ:
     ☍ ʜᴛᴛᴘꜱ://ᴡʜᴀᴛꜱᴀᴘᴘ.ᴄᴏᴍ/ᴄʜᴀɴɴᴇʟ/...
     ☍ ʜᴛᴛᴘꜱ://ᴡᴀ.ᴍᴇ/ᴄʜᴀɴɴᴇʟ/...
     ☍ ʜᴛᴛᴘꜱ://ᴄʜᴀᴛ.ᴡʜᴀᴛꜱᴀᴘᴘ.ᴄᴏᴍ/ᴄʜᴀɴɴᴇʟ/...

     ᴇxᴀᴍᴘʟᴇ:
     ʜᴛᴛᴘꜱ://ᴡʜᴀᴛꜱᴀᴘᴘ.ᴄᴏᴍ/ᴄʜᴀɴɴᴇʟ/123456789

░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░
`;
            return await reply(errorMsg);
        }

        // Extract channel information
        const channelInfo = extractChannelInfo(q);
        
        if (!channelInfo.channelId) {
            return await reply(`
░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░

        ❌ ᴇxᴛʀᴀᴄᴛɪᴏɴ ꜰᴀɪʟᴇᴅ     
        ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

     ᴄᴏᴜʟᴅ ɴᴏᴛ ᴇxᴛʀᴀᴄᴛ ᴄʜᴀɴɴᴇʟ ɪᴅ
     ꜰʀᴏᴍ ᴛʜᴇ ᴘʀᴏᴠɪᴅᴇᴅ ʟɪɴᴋ.

     ᴘʟᴇᴀꜱᴇ ᴍᴀᴋᴇ ꜱᴜʀᴇ ʏᴏᴜ'ʀᴇ
     ᴜꜱɪɴɢ ᴛʜᴇ ᴄᴏʀʀᴇᴄᴛ ꜰᴏʀᴍᴀᴛ.

░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░
`);
        }

        // Choose which style to use (you can switch between them)
        const responseMessage = getRetroWaveStyle(channelInfo);
        // const responseMessage = getNeonStyle(channelInfo); // Alternative style

        // Send the result with the channel link as a button for easy copying
        const buttonMessage = {
            text: responseMessage,
            footer: BOT_FOOTER,
            buttons: [
                {
                    buttonId: `.newsletter ${q}`,
                    buttonText: { displayText: '🔄 ɢᴇɴᴇʀᴀᴛᴇ ᴀɢᴀɪɴ' },
                    type: 1
                }
            ],
            headerType: 1
        };

        await conn.sendMessage(from, buttonMessage, { quoted: mek });

        // Also send the code separately for easy copying
        await conn.sendMessage(from, {
            text: `🔑 *NEWSLETTER CODE:*\n\`\`\`${channelInfo.newsletterCode}\`\`\`\n\n📌 *Copy and paste this in WhatsApp Updates → Find channels*`
        }, { quoted: mek });

        // Success reaction
        await conn.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        });

    } catch (err) {
        console.error('[NEWSLETTER] Error:', err);
        
        const errorMsg = `
░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░

        ❌ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ     
        ▄▄▄▄▄▄▄▄▄▄▄▄▄

     ${err.message.substring(0, 40)}

     ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ
     ᴏʀ ᴄᴏɴᴛᴀᴄᴛ ᴏᴡɴᴇʀ.

░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░
`;

        await reply(errorMsg);
        
        await conn.sendMessage(from, {
            react: {
                text: "❌",
                key: mek.key
            }
        });
    }
});
