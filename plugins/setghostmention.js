// plugins/ghostmention.js
const { cmd } = require('../command');

cmd({
    pattern: "ghostmention ?(.*)",
    desc: "Mention user without blue ticks or notification (owner only)",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { reply, q, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!q) return reply("Mention who? .ghostmention 2547xxx");

    const jid = q.trim() + '@s.whatsapp.net';
    try {
        await conn.sendMessage(from, {
            text: `Secret mention → @${q}`,
            mentions: [jid]
        }, { ephemeralExpiration: 86400 }); // 24h vanish
        await reply("Ghost mention sent (they won't get notification)");
    } catch (e) {
        await reply("Failed to ghost mention");
    }
});
