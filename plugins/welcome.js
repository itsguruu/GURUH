// plugins/welcome.js
const { cmd } = require('../command');

cmd({
    pattern: "welcome(?: (on|off))?",
    desc: "Toggle welcome message for new group members",
    category: "group",
    react: "👋",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, isGroup, isBotAdmins, groupMetadata }) => {
    if (!isGroup) return reply("This is a group command!");
    if (!isBotAdmins) return reply("Bot must be admin!");

    try {
        let newState = global.WELCOME || false; // Per-group or global

        if (args[0]) {
            const input = args[0].toLowerCase();
            if (['on', 'enable'].includes(input)) {
                newState = true;
            } else if (['off', 'disable'].includes(input)) {
                newState = false;
            } else {
                return reply("Use: `.welcome on/off`");
            }
        } else {
            newState = !newState;
        }

        global.WELCOME = newState; // Or save to DB for per-group

        reply(`Welcome Message: *${newState ? 'ON ✅' : 'OFF ❌'}*\nNew members will be welcomed.\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);

    } catch (e) {
        console.error('[welcome]', e);
        reply(`Error: ${e.message}`);
    }
});

// In index.js group-participants.update:
conn.ev.on('group-participants.update', async (update) => {
    if (global.WELCOME && update.action === 'add') {
        const group = await conn.groupMetadata(update.id);
        const newMember = update.participants[0];
        conn.sendMessage(update.id, { text: `Welcome @${newMember.split('@')[0]} to ${group.subject}! 👋\n\n> © GuruTech`, mentions: [newMember] });
    }
});
