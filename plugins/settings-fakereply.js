const { cmd } = require('../command');
const fs = require('fs');

const FAKE_REPLY_FILE = './data/fake-reply.json';
let fakeReplyEnabled = new Map(); // groupJid → boolean

// Load from file on startup
if (fs.existsSync(FAKE_REPLY_FILE)) {
    try {
        const data = JSON.parse(fs.readFileSync(FAKE_REPLY_FILE, 'utf8'));
        Object.entries(data).forEach(([jid, state]) => fakeReplyEnabled.set(jid, state));
    } catch (e) {
        console.error('[fakereply load]', e);
    }
}

function saveFakeReply() {
    const obj = Object.fromEntries(fakeReplyEnabled);
    fs.writeFileSync(FAKE_REPLY_FILE, JSON.stringify(obj, null, 2));
}

cmd({
    pattern: "fakereply(?:\\s+(on|off|enable|disable))?",
    desc: "Toggle fake quoted reply troll mode in this group",
    category: "fun",
    react: "😈",
    filename: __filename
}, async (conn, mek, m, { reply, args, isGroup, isAdmins, isOwner, from }) => {
    if (!isGroup) return reply("Only works in groups!");
    if (!isOwner && !isAdmins) return reply("Admins or owner only!");

    const current = fakeReplyEnabled.get(from) ?? false;

    if (!args[0]) {
        return reply(`Fake reply troll mode is *${current ? 'ON 😈' : 'OFF'}* here.\nUse: .fakereply on/off`);
    }

    const input = args[0].toLowerCase().trim();
    const enable = ['on', 'enable'].includes(input);

    fakeReplyEnabled.set(from, enable);
    saveFakeReply();

    await reply(`Fake quoted replies ${enable ? 'activated 😈' : 'deactivated'} for this group.`);
});

// Handler - call from messages.upsert
module.exports.handleFakeReply = async (conn, mek, { body, from, sender }) => {
    if (!fakeReplyEnabled.get(from)) return;
    if (!body || !body.toLowerCase().includes('.fake')) return;

    const fakeQuotes = [
        "Bro really thought 💀",
        "Not reading allat 🥱",
        "L + ratio + your dad left",
        "Skill issue detected",
        "Me when I see free food 🏃‍♂️💨",
        "Average Twitter user moment",
        "ngl that's kinda fire tho 🔥",
        "You just got cooked",
        "Cope + seethe + mald"
    ];

    const fakeText = fakeQuotes[Math.floor(Math.random() * fakeQuotes.length)];

    try {
        await conn.sendMessage(from, {
            text: fakeText,
            contextInfo: {
                stanzaId: mek.key.id,
                participant: sender || mek.key.participant,
                quotedMessage: mek.message
            }
        });
    } catch (e) {
        console.error('[fake reply]', e);
    }
};
