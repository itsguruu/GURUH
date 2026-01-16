const { cmd } = require('../command');
const { sleep } = require('../lib/functions');

cmd({
    pattern: "selfdestruct",
    alias: ["sd", "burn", "disappear", "ephemeral"],
    desc: "Send a normal text message that deletes after specified time",
    category: "privacy",
    use: ".sd 30s Your secret text here",
    react: "💥"
}, async (conn, mek, m, { from, text, args, reply }) => {
    try {
        if (!args[0] || !text) {
            return reply(`*Usage:* .sd <time> <text>\nExample: .sd 30s This will burn in 30 seconds! 🔥\nTime: s, m, h`);
        }

        const timeArg = args[0].toLowerCase();
        let seconds = 0;

        if (timeArg.endsWith('s')) seconds = parseInt(timeArg);
        else if (timeArg.endsWith('m')) seconds = parseInt(timeArg) * 60;
        else if (timeArg.endsWith('h')) seconds = parseInt(timeArg) * 3600;
        else return reply("Invalid time! Use s, m, or h (e.g., 30s, 5m, 1h)");

        if (seconds < 10 || seconds > 86400) {
            return reply("Time must be between 10 seconds and 24 hours!");
        }

        const messageText = args.slice(1).join(' ');
        if (!messageText) return reply("Please provide the text to send!");

        // Send the text message
        const sentMsg = await conn.sendMessage(from, {
            text: `🔥 *SELF-DESTRUCTING TEXT*\n\n${messageText}\n\n*Will delete in ${timeArg}* ⏳`
        }, { quoted: mek });

        // Success reaction
        await conn.sendMessage(from, { react: { text: "💥", key: mek.key } });

        // Wait and delete
        await sleep(seconds * 1000);

        try {
            await conn.sendMessage(from, { delete: sentMsg.key });
            await reply("💥 Text message self-destructed!");
        } catch (e) {
            await reply("Message sent, but couldn't delete for everyone (bot needs admin in group).");
        }

    } catch (error) {
        reply("❌ Error: " + error.message);
    }
});
