/* ============================================
   GURU MD - ANTI LINK SYSTEM
   COMMAND: .antilink (on/off/set)
   FEATURES: Block WhatsApp group links and custom URLs
   ============================================ */

const { cmd } = require('../command');

// Store anti-link settings per group
const antilinkSettings = {};

// Common link patterns to block
const defaultPatterns = [
    'chat.whatsapp.com',
    'whatsapp.com/channel',
    'youtube.com',
    'youtu.be',
    'instagram.com',
    'facebook.com',
    't.me',
    'telegram.me',
    'twitter.com',
    'x.com',
    'tiktok.com'
];

cmd({
    pattern: "antilink",
    alias: ["blocklink", "nourl"],
    desc: "Block unwanted links in groups",
    category: "group",
    react: "🔗",
    filename: __filename
}, async (conn, mek, m, { from, args, q, isGroup, isAdmin, isBotAdmin, reply, sender }) => {
    try {
        if (!isGroup) return reply("❌ This command only works in groups!");
        if (!isAdmin && !isBotAdmin) return reply("❌ Group admin required!");
        
        const groupId = from;
        
        if (!q) {
            const settings = antilinkSettings[groupId] || { 
                enabled: false, 
                action: 'delete', // delete, warn, kick
                patterns: [...defaultPatterns],
                warnings: {}
            };
            
            const status = settings.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
            const actionEmoji = settings.action === 'delete' ? '🗑️' : settings.action === 'warn' ? '⚠️' : '👢';
            
            let patternsList = settings.patterns.slice(0, 5).map(p => `├─ ${p}`).join('\n');
            if (settings.patterns.length > 5) {
                patternsList += `\n└─ ... and ${settings.patterns.length - 5} more`;
            }
            
            const menu = `
╔══════════════════════════════════════╗
║     🔗 *ANTI LINK SYSTEM*            ║
╠══════════════════════════════════════╣
║ 📌 *Group:* ${mek?.chat?.name || 'Unknown'}
║ ⚙️ *Status:* ${status}
║ ${actionEmoji} *Action:* ${settings.action}
╠══════════════════════════════════════╣
║ *Commands:*                          ║
║ ├─ .antilink on        - Enable      ║
║ ├─ .antilink off       - Disable     ║
║ ├─ .antilink action delete/warn/kick ║
║ ├─ .antilink add [url] - Add pattern ║
║ ├─ .antilink remove [url] - Remove   ║
║ └─ .antilink list      - Show all    ║
╠══════════════════════════════════════╣
║ *Blocked Patterns:*                  ║
${patternsList}
╚══════════════════════════════════════╝
            `;
            return reply(menu);
        }
        
        const parts = q.split(' ');
        const command = parts[0].toLowerCase();
        
        if (!antilinkSettings[groupId]) {
            antilinkSettings[groupId] = {
                enabled: false,
                action: 'delete',
                patterns: [...defaultPatterns],
                warnings: {}
            };
        }
        
        const settings = antilinkSettings[groupId];
        
        if (command === 'on') {
            settings.enabled = true;
            return reply("✅ *Anti-link enabled!*\n\nAll blocked links will be removed.");
        }
        
        if (command === 'off') {
            settings.enabled = false;
            return reply("❌ *Anti-link disabled!*");
        }
        
        if (command === 'action') {
            const action = parts[1];
            if (!action || !['delete', 'warn', 'kick'].includes(action)) {
                return reply("❌ Please specify: delete, warn, or kick");
            }
            settings.action = action;
            return reply(`✅ *Action set to ${action}!*`);
        }
        
        if (command === 'add') {
            const pattern = parts.slice(1).join(' ');
            if (!pattern) return reply("❌ Please provide a URL pattern to block!");
            
            if (!settings.patterns.includes(pattern)) {
                settings.patterns.push(pattern);
                return reply(`✅ *Added pattern:* ${pattern}`);
            } else {
                return reply(`⚠️ Pattern already exists!`);
            }
        }
        
        if (command === 'remove') {
            const pattern = parts.slice(1).join(' ');
            if (!pattern) return reply("❌ Please provide a URL pattern to remove!");
            
            const index = settings.patterns.indexOf(pattern);
            if (index > -1) {
                settings.patterns.splice(index, 1);
                return reply(`✅ *Removed pattern:* ${pattern}`);
            } else {
                return reply(`❌ Pattern not found!`);
            }
        }
        
        if (command === 'list') {
            let list = `
╔══════════════════════════════════════╗
║     📋 *BLOCKED LINK PATTERNS*       ║
╠══════════════════════════════════════╣
`;
            settings.patterns.forEach((pattern, i) => {
                list += `║ ${i+1}. ${pattern}\n`;
            });
            list += `╠══════════════════════════════════════╣
║ Total: ${settings.patterns.length} patterns        ║
╚══════════════════════════════════════╝`;
            return reply(list);
        }
        
    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// Message handler to detect and block links
cmd({
    pattern: "antilinkhandler",
    desc: "Handle link detection",
    category: "system",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply }) => {
    try {
        if (!isGroup) return;
        
        const groupId = from;
        const settings = antilinkSettings[groupId];
        
        if (!settings || !settings.enabled) return;
        
        const messageText = m.text || m.message?.conversation || 
                           m.message?.extendedTextMessage?.text || '';
        
        if (!messageText) return;
        
        // Check for blocked patterns
        for (const pattern of settings.patterns) {
            if (messageText.includes(pattern)) {
                // Found blocked link
                
                // Delete the message
                await conn.sendMessage(from, {
                    delete: m.key
                });
                
                // Take action based on settings
                if (settings.action === 'delete') {
                    await conn.sendMessage(from, {
                        text: `⚠️ @${sender.split('@')[0]} links are not allowed in this group!`,
                        mentions: [sender]
                    });
                }
                
                if (settings.action === 'warn') {
                    if (!settings.warnings[sender]) {
                        settings.warnings[sender] = 1;
                    } else {
                        settings.warnings[sender]++;
                    }
                    
                    const warningCount = settings.warnings[sender];
                    
                    await conn.sendMessage(from, {
                        text: `⚠️ @${sender.split('@')[0]} links are not allowed!\nWarning: ${warningCount}/3`,
                        mentions: [sender]
                    });
                    
                    if (warningCount >= 3) {
                        await conn.groupParticipantsUpdate(from, [sender], 'remove');
                        delete settings.warnings[sender];
                    }
                }
                
                if (settings.action === 'kick') {
                    await conn.sendMessage(from, {
                        text: `👢 @${sender.split('@')[0]} kicked for sending links!`,
                        mentions: [sender]
                    });
                    await conn.groupParticipantsUpdate(from, [sender], 'remove');
                }
                
                break;
            }
        }
        
    } catch (err) {
        console.error("Anti-link handler error:", err);
    }
});
