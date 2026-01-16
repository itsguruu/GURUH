const { cmd } = require('../command');
const { sleep } = require('../lib/functions');

cmd({
    pattern: "selfdestruct",
    alias: ["sd", "burn", "disappear", "ephemeral"],
    desc: "Send a self-destructing (view once) message",
    category: "privacy",
    use: ".sd <message or quote media>",
    react: "💥"
}, async (conn, mek, m, { from, quoted, text, reply, isGroup }) => {
    try {
        if (!text && !quoted) {
            return reply(`*Usage:* .sd <secret message>\nOr quote image/video/sticker + .sd\n\nMessages disappear after one view (or after timer in fallback mode)`);
        }

        let content = {};
        let caption = text || "🔒 Secret • View once only";

        // Try view-once for text (most reliable)
        if (text && !quoted) {
            content = {
                text: caption,
                viewOnce: true
            };
        } 
        // For quoted media: try view-once, fallback if fails
        else if (quoted) {
            try {
                const buffer = await conn.downloadMediaMessage(quoted);
                const type = quoted.message?.imageMessage ? 'image' :
                             quoted.message?.videoMessage ? 'video' :
                             quoted.message?.stickerMessage ? 'sticker' :
                             quoted.message?.documentMessage ? 'document' : null;

                if (!type || !buffer) throw new Error("No valid media found in quoted message");

                content = {
                    [type]: buffer,
                    caption: caption,
                    mimetype: quoted.message?.[type + 'Message']?.mimetype || 'application/octet-stream',
                    viewOnce: true
                };
            } catch (mediaErr) {
                console.log("[VIEW ONCE MEDIA ERROR]", mediaErr.message);
                // Fallback: send normal media + countdown timer
                await reply("⚠️ View-once media failed (old/expired). Sending normal with timer instead.");
                const sent = await conn.sendMessage(from, {
                    text: `⏳ Secret message incoming...\nWill disappear in 30 seconds!`,
                    quoted: mek
                });

                await sleep(30000); // 30 seconds
                try {
                    await conn.sendMessage(from, { delete: sent.key });
                    await reply("💥 Message auto-destructed!");
                } catch {
                    await reply("Message sent normally (couldn't delete for everyone).");
                }
                return;
            }
        }

        // Send the final message
        const sentMsg = await conn.sendMessage(from, content, { quoted: mek });

        // Success reaction
        await conn.sendMessage(from, { react: { text: "💥", key: mek.key } });

        await reply(`🔒 View-once message sent successfully!\nIt will disappear after the recipient views it once.`);

    } catch (error) {
        console.error("[SELF-DESTRUCT PLUGIN ERROR]", error.message || error);
        reply("❌ Failed to send self-destruct message: " + (error.message || "Unknown error"));
    }
});
