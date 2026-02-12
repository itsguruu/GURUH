// plugins/autostatusview.js
const { cmd } = require('../command');

const statusVIPs = new Set(); // jids to auto-view + react

cmd({
    pattern: "statusvip ?(.*)",
    desc: "Add/remove user from auto-status view + react list (owner only)",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    const jid = args[0]?.trim();
    if (!jid) {
        return reply(`Auto-status VIPs (\( {statusVIPs.size}):\n \){[...statusVIPs].join('\n') || 'None'}\n\n.add 2547xxx@s.whatsapp.net`);
    }

    if (jid.startsWith('add')) {
        const target = jid.replace('add', '').trim();
        statusVIPs.add(target);
        await reply(`Added ${target} to status VIPs`);
    } else if (jid.startsWith('remove')) {
        const target = jid.replace('remove', '').trim();
        statusVIPs.delete(target);
        await reply(`Removed ${target}`);
    }
});

// In your status handler (status@broadcast):
if (statusVIPs.has(msg.key.participant)) {
    await conn.readMessages([msg.key]);
    await conn.sendMessage('status@broadcast', {
        reactionMessage: {
            key: msg.key,
            text: ['🔥', '💜', '🤍', '👀'][Math.floor(Math.random() * 4)]
        }
    });
}
