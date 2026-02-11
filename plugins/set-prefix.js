// plugins/set-prefix.js
const { cmd } = require('../command');

cmd({
    pattern: "setprefix ?(.*)",
    desc: "Change bot prefix (owner only)",
    category: "owner",
    react: "🔧",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only command!");

    try {
        const newPrefix = args[0]?.trim();

        if (!newPrefix) {
            return reply(`Current prefix: *${global.prefix || '+'}*\n\nUsage: .setprefix !  (or any symbol)`);
        }

        // You can store in global or config — here we use global
        global.prefix = newPrefix;

        await reply(`Prefix changed to *${newPrefix}* successfully!\n\nNew example: ${newPrefix}ping`);

    } catch (e) {
        console.error('[setprefix]', e);
        await reply(`Error: ${e.message}`);
    }
});
