const { cmd } = require('../command');

cmd({
    pattern: "autoviewstatus(?: (on|off))?",   // supports .autoviewstatus, .autoviewstatus on, .autoviewstatus off
    desc: "Toggle or set auto-view status (automatically mark statuses as seen)",
    category: "utility",
    react: "👀",
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        let newState = global.AUTO_VIEW_STATUS;

        // Handle optional on/off argument
        if (args[0]) {
            const input = args[0].toLowerCase();
            if (['on', 'enable', 'true', '1'].includes(input)) {
                newState = true;
            } else if (['off', 'disable', 'false', '0'].includes(input)) {
                newState = false;
            } else {
                return reply("Invalid argument!\nUse: `.autoviewstatus on` or `.autoviewstatus off`");
            }
        } else {
            // No argument → toggle
            newState = !global.AUTO_VIEW_STATUS;
        }

        global.AUTO_VIEW_STATUS = newState;

        const statusText = newState ? "ON ✅" : "OFF ❌";

        const message = `Auto View Status: *${statusText}*\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`;

        // Send reaction for visual feedback
        await conn.sendMessage(from, { 
            react: { text: newState ? '✅' : '❌', key: mek.key }
        });

        await reply(message);

    } catch (e) {
        console.error('[autoviewstatus error]', e);
        await reply(`Error: ${e.message || 'Failed to toggle'}`);
    }
});
