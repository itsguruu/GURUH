/* ============================================
   GURU MD - NEWSLETTER JID GENERATOR
   COMMAND: .newsletter [channel link]
   CONVERTS: Channel link → newsletter@jid format
   STYLE: Retro-Wave / Synthwave Design
   ============================================ */

const { cmd } = require('../command');

// Configuration
const BOT_NAME = 'ɢᴜʀᴜ ᴍᴅ';
const BOT_FOOTER = '∞ ɴᴇᴡꜱʟᴇᴛᴛᴇʀ ᴊɪᴅ ɢᴇɴᴇʀᴀᴛᴏʀ ∞';
const OWNER_NAME = 'ᴍʀꜱ ɢᴜʀᴜ';

// Helper to extract ID from channel link
function extractIdFromLink(link) {
    // Match various channel link formats
    const patterns = [
        /whatsapp\.com\/channel\/(\d+)/i,
        /wa\.me\/channel\/(\d+)/i,
        /chat\.whatsapp\.com\/channel\/(\d+)/i,
        /channel\/(\d+)/i,
        /id=(\d+)/i
    ];
    
    for (const pattern of patterns) {
        const match = link.match(pattern);
        if (match) return match[1];
    }
    
    // Try to extract any number that looks like a channel ID (15+ digits)
    const numbers = link.match(/\d{15,}/g);
    return numbers ? numbers[0] : null;
}

// Validate if it's a channel link
function isChannelLink(link) {
    return link.includes('channel') || /whatsapp\.com|wa\.me|chat\.whatsapp/i.test(link);
}

// Retro-Wave Design
function getRetroStyle(id, jid, originalLink) {
    return `
░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░

     📢 ɴᴇᴡꜱʟᴇᴛᴛᴇʀ ᴊɪᴅ    
     ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

     🔗 [ɪɴᴘᴜᴛ ʟɪɴᴋ]
     ~~~~~~~~~~~~~~~~
     ${originalLink.substring(0, 40)}...

     🆔 [ᴇxᴛʀᴀᴄᴛᴇᴅ ɪᴅ]
     ~~~~~~~~~~~~~~~~
     ${id}

     🔑 [ɴᴇᴡꜱʟᴇᴛᴛᴇʀ ᴊɪᴅ]
     ~~~~~~~~~~~~~~~~
     \`${jid}\`

     📋 [ᴄᴏᴘʏ ᴛʜɪꜱ]
     ~~~~~~~~~~~~~~~~
     ${jid}

     💡 [ᴜꜱᴇ ɪɴ ʙᴏᴛ ᴄᴏᴅᴇ]
     ~~~~~~~~~~~~~~~~
     forwardedNewsletterMessageInfo: {
         newsletterJid: '${jid}',
         newsletterName: 'ʏᴏᴜʀ_ɴᴀᴍᴇ',
         serverMessageId: 143
     }

░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░
`;
}

// Main command
cmd({
    pattern: "newsletter",
    alias: ["nid", "jid", "channeltojid"],
    desc: "Convert channel link to newsletter JID",
    category: "tools",
    react: "📢",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, sender }) => {
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
        ▄▄▄▄▄▄▄▄▄▄▄▄▄

     ᴜꜱᴀɢᴇ: .ɴᴇᴡꜱʟᴇᴛᴛᴇʀ [ᴄʜᴀɴɴᴇʟ ʟɪɴᴋ]

     ᴇxᴀᴍᴘʟᴇꜱ:
     ☍ .ɴᴇᴡꜱʟᴇᴛᴛᴇʀ ʜᴛᴛᴘꜱ://ᴡʜᴀᴛꜱᴀᴘᴘ.ᴄᴏᴍ/ᴄʜᴀɴɴᴇʟ/120363421164015033
     ☍ .ɴᴇᴡꜱʟᴇᴛᴛᴇʀ ʜᴛᴛᴘꜱ://ᴡᴀ.ᴍᴇ/ᴄʜᴀɴɴᴇʟ/120363421164015033
     ☍ .ɴᴇᴡꜱʟᴇᴛᴛᴇʀ ʜᴛᴛᴘꜱ://ᴄʜᴀᴛ.ᴡʜᴀᴛꜱᴀᴘᴘ.ᴄᴏᴍ/ᴄʜᴀɴɴᴇʟ/120363421164015033

     ɢᴇɴᴇʀᴀᴛᴇꜱ:
     ☍ 120363421164015033@ɴᴇᴡꜱʟᴇᴛᴛᴇʀ

     ʜᴏᴡ ᴛᴏ ɢᴇᴛ ʟɪɴᴋ:
     ☍ ᴏᴘᴇɴ ᴄʜᴀɴɴᴇʟ
     ☍ ᴛᴀᴘ ᴄʜᴀɴɴᴇʟ ɴᴀᴍᴇ
     ☍ ꜱʜᴀʀᴇ → ᴄᴏᴘʏ ʟɪɴᴋ

     ᴏᴡɴᴇʀ: ${OWNER_NAME}

░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░
`;
            return await reply(helpMsg);
        }

        const link = q.trim();

        // Check if it's a valid channel link
        if (!isChannelLink(link)) {
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

     ʜᴏᴡ ᴛᴏ ɢᴇᴛ:
     ☍ ᴏᴘᴇɴ ʏᴏᴜʀ ᴄʜᴀɴɴᴇʟ
     ☍ ᴛᴀᴘ ᴄʜᴀɴɴᴇʟ ɴᴀᴍᴇ
     ☍ ꜱʜᴀʀᴇ → ᴄᴏᴘʏ ʟɪɴᴋ

░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░
`;
            return await reply(errorMsg);
        }

        // Extract ID from link
        const channelId = extractIdFromLink(link);
        
        if (!channelId) {
            const errorMsg = `
░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░

        ❌ ᴇxᴛʀᴀᴄᴛɪᴏɴ ꜰᴀɪʟᴇᴅ     
        ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

     ᴄᴏᴜʟᴅ ɴᴏᴛ ᴇxᴛʀᴀᴄᴛ ᴄʜᴀɴɴᴇʟ ɪᴅ
     ꜰʀᴏᴍ ᴛʜᴇ ᴘʀᴏᴠɪᴅᴇᴅ ʟɪɴᴋ.

     ᴍᴀᴋᴇ ꜱᴜʀᴇ ʏᴏᴜ'ʀᴇ ᴜꜱɪɴɢ
     ᴀ ᴅɪʀᴇᴄᴛ ᴄʜᴀɴɴᴇʟ ꜱʜᴀʀᴇ ʟɪɴᴋ.

░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░
`;
            return await reply(errorMsg);
        }

        // Generate JID
        const newsletterJid = `${channelId}@newsletter`;

        // Send the result with retro style
        const responseMsg = getRetroStyle(channelId, newsletterJid, link);
        
        // Send with button for easy copying
        const buttonMessage = {
            text: responseMsg,
            footer: BOT_FOOTER,
            buttons: [
                {
                    buttonId: `.newsletter ${link}`,
                    buttonText: { displayText: '🔄 ɢᴇɴᴇʀᴀᴛᴇ ᴀɢᴀɪɴ' },
                    type: 1
                }
            ],
            headerType: 1
        };

        await conn.sendMessage(from, buttonMessage, { quoted: mek });

        // Send the JID separately for easy copying
        await conn.sendMessage(from, {
            text: `📢 *NEWSLETTER JID*\n\n\`\`\`${newsletterJid}\`\`\`\n\n📌 Copy this and use in your bot code:\n\nforwardedNewsletterMessageInfo: {\n    newsletterJid: '${newsletterJid}',\n    newsletterName: 'your_name',\n    serverMessageId: 143\n}`
        }, { quoted: mek });

        // Success reaction
        await conn.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        });

    } catch (err) {
        console.error('[NEWSLETTER] Error:', err.message);
        
        const errorMsg = `
░▒▓█ █▓▒░ ░▒▓█ █▓▒░ ░▒▓█ █▓▒░

        ❌ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ     
        ▄▄▄▄▄▄▄▄▄▄▄▄▄▄

     ${err.message.substring(0, 40)}

     ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ
     ᴏʀ ᴄᴏɴᴛᴀᴄᴛ ᴏᴡɴᴇʀ

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
