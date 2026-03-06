const fs = require('fs');
const path = require('path');

// Store for anonymous view replies
const viewRepliesStore = new Map();
const VIEW_REPLIES_FILE = path.join(__dirname, '../database/view_replies.json');

// Load saved replies on startup
try {
    if (fs.existsSync(VIEW_REPLIES_FILE)) {
        const data = fs.readFileSync(VIEW_REPLIES_FILE, 'utf8');
        const parsed = JSON.parse(data);
        Object.keys(parsed).forEach(key => {
            viewRepliesStore.set(key, parsed[key]);
        });
        console.log('✅ Loaded anonymous view replies from storage');
    }
} catch (err) {
    console.error('Error loading view replies:', err);
}

// Save to file periodically
setInterval(() => {
    try {
        const obj = Object.fromEntries(viewRepliesStore);
        fs.writeFileSync(VIEW_REPLIES_FILE, JSON.stringify(obj, null, 2));
    } catch (err) {
        console.error('Error saving view replies:', err);
    }
}, 60000); // Save every minute

module.exports = {
    name: 'Anonymous View Reply',
    version: '1.0.0',
    description: 'Saves replies to view-once messages anonymously to owner PM',
    
    async execute(conn, mek, m, { from, isGroup, sender, senderNumber, isOwner, reply }) {
        try {
            // Check if this is a reply to a view-once message
            const quotedMsg = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedMsgType = quotedMsg ? Object.keys(quotedMsg)[0] : null;
            
            // Check if quoted message is a view-once message
            const isViewOnce = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2 || 
                               mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2Extension ||
                               quotedMsgType === 'viewOnceMessage' ||
                               quotedMsgType === 'viewOnceMessageV2' ||
                               quotedMsgType === 'viewOnceMessageV2Extension';
            
            if (!isViewOnce) return false; // Not a reply to view-once
            
            // Get the message content (emoji or text)
            let content = '';
            const type = Object.keys(mek.message)[0];
            
            if (type === 'conversation') {
                content = mek.message.conversation;
            } else if (type === 'extendedTextMessage') {
                content = mek.message.extendedTextMessage.text;
            } else if (type === 'reactionMessage') {
                content = mek.message.reactionMessage.text;
            } else {
                content = '[Media/Sticker]';
            }
            
            if (!content) content = '[Empty Reply]';
            
            // Get original sender info
            const originalSender = mek.message?.extendedTextMessage?.contextInfo?.participant || 
                                   mek.message?.extendedTextMessage?.contextInfo?.remoteJid ||
                                   from;
            const originalSenderNumber = originalSender.split('@')[0];
            
            // Get chat info
            let chatName = 'Private Chat';
            let groupName = '';
            
            if (isGroup) {
                try {
                    const metadata = await conn.groupMetadata(from);
                    groupName = metadata.subject || 'Unknown Group';
                    chatName = groupName;
                } catch (e) {}
            }
            
            // Create a unique ID for this interaction
            const replyId = `${Date.now()}_${senderNumber}`;
            
            // Store the reply
            const replyData = {
                id: replyId,
                from: senderNumber,
                fromName: mek.pushName || 'Unknown',
                to: originalSenderNumber,
                content: content,
                type: type,
                timestamp: new Date().toISOString(),
                chatType: isGroup ? 'group' : 'private',
                groupName: groupName,
                messageId: mek.key.id
            };
            
            // Store in map
            viewRepliesStore.set(replyId, replyData);
            
            // Get owner JID
            const ownerJid = conn.user.id;
            
            // Build anonymous message for owner
            const ownerMsg = `╭────[ *ANONYMOUS VIEW REPLY* ]────✦
│
├❏ *From:* ${senderNumber} (${mek.pushName || 'Unknown'})
├❏ *To:* ${originalSenderNumber}
├❏ *Time:* ${new Date().toLocaleString()}
├❏ *Location:* ${isGroup ? `Group: ${groupName}` : 'Private Chat'}
├❏ *Reply:* "${content}"
│
╰────────────────────✦

> This reply was sent anonymously to a view-once message`;

            // Send to owner PM
            await conn.sendMessage(ownerJid, { text: ownerMsg });
            
            // Also try to send to configured owner numbers
            const ownerNumbers = (process.env.OWNER_NUMBER || '254778074353').split(',').map(n => n.trim());
            for (const ownerNum of ownerNumbers) {
                if (ownerNum && ownerNum !== senderNumber) {
                    try {
                        await conn.sendMessage(ownerNum + '@s.whatsapp.net', { text: ownerMsg });
                    } catch (e) {}
                }
            }
            
            // Log the action
            console.log(`📝 Anonymous view reply from ${senderNumber} to ${originalSenderNumber}: "${content}"`);
            
            // React to confirm (optional - remove if you want completely invisible)
            // await m.react('✅');
            
            return true; // Indicate we handled this
            
        } catch (err) {
            console.error('Error in anonymous view plugin:', err);
            return false;
        }
    }
};
