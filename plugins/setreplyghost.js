// plugins/replyghost.js
const { cmd } = require('../command');

cmd({
    pattern: "replyghost ?(.*)",
    desc: "Reply as if someone else sent it (owner only)",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { reply, q, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!q) return reply("What to reply? .replyghost Hello from ghost");

    const fakeSender = "254700000000@s.whatsapp.net"; // change to any number

    await conn.sendMessage(from, {
        text: q,
        contextInfo: {
            participant: fakeSender,
            stanzaId: mek.key.id + '_fake',
            quotedMessage: mek.message
        }
    });

    await reply("Ghost reply sent 😶‍🌫️");
});
