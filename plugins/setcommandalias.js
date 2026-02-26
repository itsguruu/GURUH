// plugins/setcommandalias.js
const { cmd } = require('../command');

global.COMMAND_ALIASES = new Map(); // alias → real command

cmd({
    pattern: "alias ?(.*)",
    desc: "Create shortcut/alias for any command (owner only)",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    const parts = args.join(' ').trim().split(/\s+/);
    if (parts.length < 2) {
        const aliasesList = [...global.COMMAND_ALIASES.entries()]
            .map(([a, c]) => `${a} → ${c}`)
            .join('\n') || 'None';
        return reply(`Current aliases:\n${aliasesList}\n\nExample: .alias dl tiktokdl`);
    }

    const alias = parts[0].toLowerCase();
    const targetCmd = parts[1].toLowerCase();

    global.COMMAND_ALIASES.set(alias, targetCmd);
    await reply(`Alias created: ${alias} → ${targetCmd}`);
});

// In messages.upsert - before normal command check
const bodyText = body?.toLowerCase() || '';
const words = bodyText.slice(prefix.length).trim().split(/\s+/);
const possibleAlias = words[0];

if (global.COMMAND_ALIASES.has(possibleAlias)) {
    const realCmd = global.COMMAND_ALIASES.get(possibleAlias);
    // Replace body with real command
    mek.message.conversation = `\( {prefix} \){realCmd} ${words.slice(1).join(' ')}`;
}
