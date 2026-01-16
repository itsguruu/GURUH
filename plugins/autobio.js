const { cmd } = require('../command');
const { runtime } = require('../lib/functions');

let autoBioInterval = null;

cmd({
    pattern: "autobio",
    alias: ["bio", "setbio"],
    desc: "Auto-change bio every 5 seconds with bot info",
    category: "owner",
    onlyOwner: true
}, async (conn, mek, m, { args, reply }) => {
    const subCmd = args[0]?.toLowerCase();

    // Start auto bio
    if (!subCmd || subCmd === "on" || subCmd === "start") {
        if (autoBioInterval) return reply("Auto-bio is already running!");

        autoBioInterval = setInterval(async () => {
            const uptime = runtime(process.uptime());
            const prefix = global.prefix || ".";
            const mode = global.mode || "public";
            const owner = "254778074353"; // Change if needed

            const bioTexts = [
                `GURU MD • Prefix: ${prefix} • Uptime: ${uptime}`,
                `Powered by GuruTech • Mode: ${mode} • Owner: ${owner}`,
                `GURU MD v4.5.0 • Always Online • ${uptime} running`,
                `Bot by GuruTech • Prefix ${prefix} • ${mode} mode`,
                `Uptime: ${uptime} • GURU MD • Fast & Powerful`,
                `GURU MD • ${mode.toUpperCase()} • Owner: ${owner} 🔥`,
                `Running since ${uptime} • GURU MD • Prefix: ${prefix}`
            ];

            const randomBio = bioTexts[Math.floor(Math.random() * bioTexts.length)];

            try {
                await conn.setStatus(randomBio);
                console.log(`[AUTO-BIO] Changed to: ${randomBio}`);
            } catch (e) {
                console.error("[AUTO-BIO ERROR]", e.message);
            }
        }, 5000); // Every 5 seconds

        return reply("🚀 Auto-bio started! Changing every 5 seconds with real bot info.");
    }

    // Stop auto bio
    if (subCmd === "off" || subCmd === "stop") {
        if (!autoBioInterval) return reply("No auto-bio running.");
        clearInterval(autoBioInterval);
        autoBioInterval = null;
        return reply("🛑 Auto-bio stopped.");
    }

    // Set manual bio
    if (subCmd === "set") {
        const newBio = args.slice(1).join(" ");
        if (!newBio) return reply("Usage: .autobio set <your bio>");
        await conn.setStatus(newBio);
        return reply(`✅ Bio set to:\n${newBio}`);
    }

    reply("Usage:\n.autobio on/start → start auto change every 5s\n.autobio off/stop → stop auto\n.autobio set <text> → manual bio");
});
