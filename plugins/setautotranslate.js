// plugins/autotranslate.js
const { cmd } = require('../command');
const translate = require('@vitalets/google-translate-api');

global.AUTO_TRANSLATE = false;
global.TRANSLATE_TO = 'en';

cmd({
    pattern: "autotrans(?:\\s+(on|off|to\\s+\\w+))?",
    desc: "Auto-translate incoming foreign messages",
    category: "utility",
    filename: __filename
}, async (conn, mek, m, { reply, args, isOwner }) => {
    if (!isOwner) return reply("Owner only!");

    if (!args[0]) {
        return reply(`Auto-translate: ${global.AUTO_TRANSLATE ? 'ON' : 'OFF'}\nTarget: ${global.TRANSLATE_TO}`);
    }

    if (args[0].toLowerCase() === 'on') {
        global.AUTO_TRANSLATE = true;
        return reply("Auto-translate activated");
    }
    if (args[0].toLowerCase() === 'off') {
        global.AUTO_TRANSLATE = false;
        return reply("Auto-translate deactivated");
    }

    if (args[0].toLowerCase() === 'to') {
        const lang = args[1]?.toLowerCase();
        if (!lang || lang.length !== 2) return reply("Use 2-letter code: .autotrans to sw");
        global.TRANSLATE_TO = lang;
        return reply(`Now translating to: ${lang}`);
    }
});

// In messages.upsert
if (global.AUTO_TRANSLATE && body && !body.startsWith(prefix)) {
    try {
        const { text } = await translate(body, { to: global.TRANSLATE_TO });
        if (text !== body) {
            await reply(`Translated: ${text}`);
        }
    } catch (e) {
        console.error('[autotrans]', e);
    }
}
