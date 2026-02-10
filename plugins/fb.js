const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "fb|facebook",
    desc: "Download Facebook video or photo",
    category: "download",
    react: "📥",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const url = q || (quoted && quoted.url) || null;

        if (!url || !url.includes('facebook.com') && !url.includes('fb.watch')) {
            return reply(`*Example:* ${config.PREFIX || '.'}fb https://www.facebook.com/reel/402579285704851`);
        }

        // Show processing message
        await reply("📥 *Downloading from Facebook...* Please wait...");

        // Use your new API
        const apiUrl = `https://api-rebix.zone.id/api/facebook?url=${encodeURIComponent(url)}`;

        const res = await axios.get(apiUrl);

        if (!res.data || !res.data.status) {
            return reply(`*Error:* ${res.data?.msg || 'Failed to fetch Facebook media. Try another link.'}`);
        }

        const data = res.data.result || {};

        // Prepare caption with available info
        let caption = `*Facebook Download*\n\n` +
                      `*Title:* ${data.title || 'Untitled'}\n` +
                      `*Duration:* ${data.duration || 'N/A'}\n` +
                      `*Views:* ${data.views || 'N/A'}\n` +
                      `*Likes:* ${data.likes || 'N/A'}\n` +
                      `*Posted:* ${data.uploaded || 'N/A'}\n\n` +
                      `Powered by *GURU MD* 💢`;

        // Video download (prefer HD)
        if (data.video?.hd || data.video?.sd) {
            const videoUrl = data.video.hd || data.video.sd;
            await conn.sendMessage(from, {
                video: { url: videoUrl },
                caption: caption,
                mimetype: 'video/mp4',
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363421164015033@newsletter',
                        newsletterName: 'GURU MD',
                        serverMessageId: 143
                    }
                }
            }, { quoted: mek });
        }

        // Photo download (if it's an image post)
        else if (data.photo || data.images?.length > 0) {
            const photoUrl = data.photo || data.images[0];
            await conn.sendMessage(from, {
                image: { url: photoUrl },
                caption: caption,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363421164015033@newsletter',
                        newsletterName: 'GURU MD',
                        serverMessageId: 143
                    }
                }
            }, { quoted: mek });
        }

        // Fallback if no media found
        else {
            await reply(`*No downloadable media found.*\nTry a direct Facebook video/photo link.`);
        }

    } catch (err) {
        console.error('[fb command] Error:', err.message);
        await reply(`*Error:* Failed to download from Facebook.\n${err.message.includes('timeout') ? 'API timeout' : 'Check link or try later'}`);
    }
});
