// plugins/fakeread.js
// Self-registering Fake Read Receipts — no changes needed in index.js

// Global toggle (persists only during runtime — restarts reset it)
global.FAKE_READ = false; // default: OFF

// Helper: Wait until global.conn is ready
const waitForConn = (callback) => {
    if (global.conn) return callback(global.conn);
    const interval = setInterval(() => {
        if (global.conn) {
            clearInterval(interval);
            callback(global.conn);
        }
    }, 1000); // Check every second
};

waitForConn((conn) => {
    console.log('[FakeRead] Activated — fake read receipts ready (use .fakeread on/off)');

    // ─────────────── Command: .fakeread [on/off] ───────────────
    conn.ev.on('messages.upsert', async ({ messages }) => {
        const mek = messages[0];
        if (!mek?.message) return;

        const from = mek.key.remoteJid;
        const body = (
            mek.message.conversation ||
            mek.message.extendedTextMessage?.text ||
            ""
        ).trim().toLowerCase();

        if (!body.startsWith('.fakeread')) return;

        const args = body.slice('.fakeread'.length).trim().split(/\s+/);
        const isOwner = mek.key.fromMe || 
                        mek.key.participant === global.conn.user.id || 
                        // Add your owner numbers here if needed
                        ['254778074353@s.whatsapp.net'].includes(mek.key.participant);

        if (!isOwner) {
            return conn.sendMessage(from, { text: '❌ Owner only command!' }, { quoted: mek });
        }

        const sub = args[0]?.toLowerCase();

        if (!sub) {
            return conn.sendMessage(from, {
                text: `Fake read receipts: ${global.FAKE_READ ? 'ON (blue ticks hidden)' : 'OFF'}\n\n` +
                      `Use: .fakeread on / .fakeread off`
            }, { quoted: mek });
        }

        if (sub === 'on') {
            global.FAKE_READ = true;
            await conn.sendMessage(from, { text: '✅ Fake read receipts turned **ON** (no blue ticks shown)' }, { quoted: mek });
        } else if (sub === 'off') {
            global.FAKE_READ = false;
            await conn.sendMessage(from, { text: '✅ Fake read receipts turned **OFF** (normal behavior restored)' }, { quoted: mek });
        } else {
            await conn.sendMessage(from, { text: 'Invalid! Use: .fakeread on / off' }, { quoted: mek });
        }
    });

    // ─────────────── Override normal read receipts ───────────────
    // This block intercepts ALL incoming messages and decides whether to mark as read
    conn.ev.on('messages.upsert', async ({ messages }) => {
        const mek = messages[0];
        if (!mek?.key) return;

        // Skip if it's our own message or status
        if (mek.key.fromMe || mek.key.remoteJid === 'status@broadcast') return;

        // Your original config check (if you have READ_MESSAGE in config)
        const shouldReadNormally = global.config?.READ_MESSAGE === 'true' || false;

        if (shouldReadNormally && !global.FAKE_READ) {
            // Normal behavior: mark as read (blue ticks shown)
            await conn.readMessages([mek.key]).catch(() => {});
        }
        // If FAKE_READ is ON → we simply DO NOTHING → no read receipt sent
        // The message stays unread (no blue ticks) even though bot is online
    });
});

module.exports = {};
