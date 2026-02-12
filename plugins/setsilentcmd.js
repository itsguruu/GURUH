// plugins/silentcmd.js
const { cmd } = require('../command');

global.SILENT_COMMANDS = new Set();

cmd({
    pattern: "silentcmd ?(.*)",
    desc: "Add/remove command from silent mode (no reply)",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!args[0]) {
        return reply(`Silent commands (\( {global.SILENT_COMMANDS.size}):\n \){[...global.SILENT_COMMANDS].join(', ') || 'None'}`);
    }

    const cmdName = args[0].toLowerCase().trim();
    if (global.SILENT_COMMANDS.has(cmdName)) {
        global.SILENT_COMMANDS.delete(cmdName);
        await reply(`${cmdName} removed from silent mode`);
    } else {
        global.SILENT_COMMANDS.add(cmdName);
        await reply(`${cmdName} added to silent mode (no reply)`);
    }
});

// In command execution block (before reply()):
if (global.SILENT_COMMANDS.has(command.toLowerCase())) {
    // Run command function but suppress reply()
    // You can still send media/files silently
    return; // or just skip reply logic
}
