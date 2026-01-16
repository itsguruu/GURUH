const { cmd } = require('../command');
const { sleep } = require('../lib/functions');

cmd({
    pattern: "selfdestruct",
    alias: ["sd", "burn", "disappear"],
    desc: "Send a self-destructing message that deletes after specified time",
    category: "privacy",
    use: ".sd 30s Your secret message here",
    react: "🔥"
}, async (conn, mek, m, { from, quoted, body, args, text, reply, isGroup }) => {
    try {
        // Parse time (e.g., 30s, 5m, 1h)
        if (!args[0] || !text) {
            return reply(`*Usage:* .sd <time> <message>\nExample: .sd 30s This will burn in 30s! 🔥\nTime formats: s, m, h`);
        }

        const timeArg = args[0].toLowerCase();
        let seconds = 0;

        if (timeArg.endsWith('s')) {
            seconds = parseInt(timeArg);
        } else if (timeArg.endsWith('m')) {
            seconds = parseInt(timeArg) * 60;
        } else if (timeArg.endsWith('h')) {
            seconds = parseInt(timeArg) * 3600;
        } else {
            return reply("Invalid time format! Use s, m, or h (e.g., 30s, 5m, 1h)");
        }

        if (seconds < 10 || seconds > 86400) { // 10s min, 24h max
            return reply("Time must be between 10 seconds and 24 hours!");
        }

        // Remove time arg from message text
        const messageText = args.slice(1).join(' ');
        if (!messageText) return reply("Please provide a message to send!");

        // Send the destructing message
        const sentMsg = await conn.sendMessage(from, {
            text: `🔥 *SELF-DESTRUCTING MESSAGE*\n\n${messageText}\n\n*This message will delete in ${timeArg}* ⏳`
        }, { quoted: mek });

        // React success
        await conn.sendMessage(from, { react: { text: "🔥", key: mek.key } });

        // Countdown timer (optional visual feedback)
        let remaining = seconds;
        const interval = setInterval(async () => {
            if (remaining <= 0) {
                clearInterval(interval);
                try {
                    // Delete for everyone (works best if bot is admin in group)
                    await conn.sendMessage(from, { delete: sentMsg.key });
                    await reply("💥 Message self-destructed successfully!");
                } catch (e) {
                    console.log("[SELF-DESTRUCT ERROR]", e.message);
                    await reply("Message deleted (you may see it if not admin).");
                }
                return;
            }

            remaining -= 5; // update every 5s to reduce spam
            if (remaining > 0) {
                try {
                    await conn.sendMessage(from, {
                        text: `⏳ ${remaining}s remaining...`,
                        edit: sentMsg.key
                    });
                } catch {}
            }
        }, 5000);

    } catch (error) {
        console.error("[SELF-DESTRUCT PLUGIN ERROR]", error);
        reply("❌ Error sending self-destruct message: " + error.message);
    }
});
