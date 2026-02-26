// plugins/setmimic.js
const { cmd } = require('../command');

global.MIMIC_TARGET = null; // jid to mimic

cmd({
    pattern: "mimic ?(.*)",
    desc: "Make bot copy someone's typing/presence style",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!args[0]) {
        return reply(global.MIMIC_TARGET 
            ? `Currently mimicking ${global.MIMIC_TARGET}` 
            : "No one is being mimicked.\n.mimic 2547xxx@s.whatsapp.net");
    }

    if (args[0].toLowerCase() === 'stop') {
        global.MIMIC_TARGET = null;
        return reply("Mimic stopped.");
    }

    const target = args[0].trim();
    if (!target.includes('@s.whatsapp.net')) return reply("Invalid JID");

    global.MIMIC_TARGET = target;
    await reply(`Now mimicking ${target}'s typing style 😏`);
});

// In messages.upsert → when target sends message
(async () => {
    conn.ev.on('messages.upsert', async ({ messages }) => {
        const mek = messages[0];
        if (!mek.key.fromMe && global.MIMIC_TARGET && mek.key.participant === global.MIMIC_TARGET) {
            const from = mek.key.remoteJid;
            if (!from) return; // safety check

            const states = ['composing', 'recording', 'paused'];
            const random = states[Math.floor(Math.random() * states.length)];
            await conn.sendPresenceUpdate(random, from);
        }
    });
})();
