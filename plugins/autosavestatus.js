const { cmd } = require('../command');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Global toggle (will reset on restart - you can make it DB later)
global.AUTO_SAVE_STATUS = false;

cmd({
    pattern: "autosavestatus",
    desc: "Toggle auto-save status (download photos/videos automatically)",
    category: "utility",
    react: "💾",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        global.AUTO_SAVE_STATUS = !global.AUTO_SAVE_STATUS;

        const status = global.AUTO_SAVE_STATUS ? "ON ✅" : "OFF ❌";

        reply(`Auto Save Status: *${status}*\nFiles saved to: ./statuses/\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech`);

    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message || e}`);
    }
});

// Auto-save logic - attach listener safely (runs when bot starts)
setTimeout(() => {
    conn.ev.on('messages.upsert', async (mekUpdate) => {
        const msg = mekUpdate.messages[0];
        if (!msg.message) return;

        // Only process statuses
        if (msg.key.remoteJid === 'status@broadcast' && global.AUTO_SAVE_STATUS) {
            try {
                const buffer = await downloadMediaMessage(msg, 'buffer', {});
                const type = msg.message?.imageMessage ? 'image' : 'video';
                const ext = type === 'image' ? '.jpg' : '.mp4';
                const fileName = `status_\( {Date.now()} \){ext}`;
                const savePath = path.join(process.cwd(), 'statuses', fileName);

                // Create folder if not exists
                if (!fs.existsSync(path.dirname(savePath))) {
                    fs.mkdirSync(path.dirname(savePath), { recursive: true });
                }

                fs.writeFileSync(savePath, buffer);
                console.log(`[AUTO-SAVE] Saved status: ${fileName}`);
            } catch (e) {
                console.error("Auto-save error:", e);
            }
        }
    });
}, 5000); // Delay 5 seconds so conn is fully ready
