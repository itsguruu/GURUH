// plugins/randombio.js
const { cmd } = require('../command');

const bios = [
    "Powered by chaos & coffee ☕🔥",
    "Just here for the vibes 😈",
    "Don't @ me unless it's important",
    "404: Motivation not found",
    "Living rent-free in your notifications",
    "GURU MD • Level 100 Aura",
    "Catch flights, not feelings ✈️"
];

let bioInterval = null;

cmd({
    pattern: "randombio(?:\\s+(\\d+))?",
    desc: "Start/stop random bio changer (minutes)",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (args[0] === 'stop') {
        if (bioInterval) clearInterval(bioInterval);
        bioInterval = null;
        return reply("Random bio changer stopped.");
    }

    const minutes = Number(args[0]) || 30;
    if (minutes < 5 || minutes > 1440) return reply("Minutes: 5–1440");

    if (bioInterval) clearInterval(bioInterval);

    bioInterval = setInterval(async () => {
        const newBio = bios[Math.floor(Math.random() * bios.length)];
        try {
            await conn.updateProfileStatus(newBio);
            console.log(`[AutoBio] Changed to: ${newBio}`);
        } catch (e) {
            console.error('[AutoBio]', e);
        }
    }, minutes * 60 * 1000);

    await reply(`Random bio changer started — changes every ${minutes} minutes.`);
});
