// plugins/autoreplymood.js
const { cmd } = require('../command');

global.REPLY_MOOD = 'normal'; // normal | sassy | savage | cute

cmd({
    pattern: "mood ?(normal|sassy|savage|cute)?",
    desc: "Change bot's auto-reply personality",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!args[0]) return reply(`Current mood: ${global.REPLY_MOOD}`);

    const mood = args[0].toLowerCase();
    if (!['normal','sassy','savage','cute'].includes(mood)) return reply("Options: normal | sassy | savage | cute");

    global.REPLY_MOOD = mood;
    await reply(`Mood changed to ${mood}`);
});

// In your auto-reply block (messages.upsert)
let response = "Default reply";

if (global.REPLY_MOOD === 'sassy') response = "Oh wow, you really thought I'd reply fast? 😏";
else if (global.REPLY_MOOD === 'savage') response = "Girl bye 💅";
else if (global.REPLY_MOOD === 'cute') response = "Hehe hi cutie pieee 🥰✨";

await reply(response);
