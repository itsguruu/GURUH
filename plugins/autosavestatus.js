const { cmd } = require('../command');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const config = require('../config');

cmd({
    pattern: "autosavestatus",
    desc: "Toggle auto-save status",
    category: "utility",
    react: "💾",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        global.AUTO_SAVE_STATUS = !global.AUTO_SAVE_STATUS;

        const status = global.AUTO_SAVE_STATUS ? "ON ✅" : "OFF ❌";

        reply(`Auto Save Status: *${status}*\nSaved to: ./statuses/\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);

    } catch (e) {
        console.log(e);
        reply(`Error: ${e}`);
    }
});

// Auto-save logic (runs on every status)
conn.ev.on('messages.upsert', async (mekUpdate) => {
    const msg = mekUpdate.messages[0];
    if (!msg.message) return;

    if (msg.key.remoteJid === 'status@broadcast' && global.AUTO_SAVE_STATUS) {
        try {
            const buffer = await downloadMediaMessage(msg, 'buffer', {});
            const type = msg.message?.imageMessage ? 'image' : 'video';
            const ext = type === 'image' ? '.jpg' : '.mp4';
            const fileName = `status_\( {Date.now()} \){ext}`;
            const savePath = path.join(__dirname, '../../statuses', fileName);

            // Create folder if not exists
            if (!fs.existsSync(path.dirname(savePath))) {
                fs.mkdirSync(path.dirname(savePath), { recursive: true });
            }

            fs.writeFileSync(savePath, buffer);
            console.log(`Auto-saved status: ${fileName}`);
        } catch (e) {
            console.error("Auto-save error:", e);
        }
    }
});
