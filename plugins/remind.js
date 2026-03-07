/* ============================================
   GURU MD - SMART REMINDER SYSTEM
   COMMAND: .remind [when] [what]
   FEATURES: Natural language parsing, timezone support, recurring reminders
   ============================================ */

const { cmd } = require('../command');
const cron = require('node-cron');
const moment = require('moment-timezone');

// Store reminders in memory (in production, use database)
const reminders = {};
let reminderCounter = 0;

// Timezone mapping
const timezones = {
    'wib': 'Asia/Jakarta',
    'wita': 'Asia/Makassar',
    'wit': 'Asia/Jayapura',
    'ist': 'Asia/Kolkata',
    'pst': 'America/Los_Angeles',
    'est': 'America/New_York',
    'gmt': 'Europe/London',
    'cet': 'Europe/Paris',
    'jst': 'Asia/Tokyo',
    'aest': 'Australia/Sydney'
};

cmd({
    pattern: "remind",
    alias: ["reminder", "schedule", "alarm"],
    desc: "Set smart reminders with natural language",
    category: "tools",
    react: "⏰",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q) {
            const menu = `
╔══════════════════════════════════════╗
║     ⏰ *SMART REMINDER SYSTEM*       ║
╠══════════════════════════════════════╣
║ *Natural Language Examples:*         ║
║                                      ║
║ ⏰ .remind in 30 mins take medicine   ║
║ ⏰ .remind tomorrow 9am meeting       ║
║ ⏰ .remind every day 7am workout      ║
║ ⏰ .remind Monday 10am team call      ║
║ ⏰ .remind next week pay bills        ║
║ ⏰ .remind 25 Dec Christmas party     ║
╠══════════════════════════════════════╣
║ *Commands:*                          ║
║ ├─ .remind [when] [what] - Set      ║
║ ├─ .myreminders         - List      ║
║ └─ .cancelremind [id]   - Cancel    ║
╚══════════════════════════════════════╝
            `;
            return reply(menu);
        }

        // Parse natural language
        const lowerQ = q.toLowerCase();
        let timeStr = '';
        let message = '';
        let recurring = null;
        let timezone = 'Asia/Kolkata'; // Default

        // Detect timezone
        Object.keys(timezones).forEach(tz => {
            if (lowerQ.includes(tz)) {
                timezone = timezones[tz];
            }
        });

        // Detect recurring patterns
        if (lowerQ.includes('every day') || lowerQ.includes('daily')) {
            recurring = 'daily';
            timeStr = q.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)?.[0] || '9am';
            message = q.replace(/every day|daily/i, '').trim();
        } else if (lowerQ.includes('every week') || lowerQ.includes('weekly')) {
            recurring = 'weekly';
            timeStr = q.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)?.[0] || 'monday';
            message = q.replace(/every week|weekly/i, '').trim();
        }

        // Parse relative time
        if (lowerQ.includes('in ')) {
            const match = q.match(/in (\d+) (minute|minutes|min|hour|hours|day|days)/i);
            if (match) {
                const amount = parseInt(match[1]);
                const unit = match[2].toLowerCase();
                let ms = 0;
                if (unit.includes('min')) ms = amount * 60000;
                if (unit.includes('hour')) ms = amount * 3600000;
                if (unit.includes('day')) ms = amount * 86400000;
                
                const remindTime = Date.now() + ms;
                message = q.replace(match[0], '').trim();
                
                const reminderId = ++reminderCounter;
                if (!reminders[sender]) reminders[sender] = [];
                
                reminders[sender].push({
                    id: reminderId,
                    time: remindTime,
                    message: message,
                    recurring: recurring,
                    timezone: timezone
                });
                
                // Schedule the reminder
                setTimeout(() => {
                    conn.sendMessage(sender, {
                        text: `⏰ *REMINDER*\n\n${message}`
                    });
                }, ms);
                
                return reply(`✅ *Reminder set!*\n\n⏰ When: ${match[0]}\n📝 What: ${message}\n🆔 ID: #${reminderId}`);
            }
        }

        // Parse specific time
        const timeMatch = q.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]) || 0;
            const ampm = timeMatch[3]?.toLowerCase();
            
            if (ampm === 'pm' && hours < 12) hours += 12;
            if (ampm === 'am' && hours === 12) hours = 0;
            
            const now = moment().tz(timezone);
            let remindTime = moment().tz(timezone).set({ hour: hours, minute: minutes, second: 0 });
            
            if (remindTime.isBefore(now)) {
                remindTime.add(1, 'day');
            }
            
            message = q.replace(timeMatch[0], '').trim();
            
            const reminderId = ++reminderCounter;
            if (!reminders[sender]) reminders[sender] = [];
            
            reminders[sender].push({
                id: reminderId,
                time: remindTime.valueOf(),
                message: message,
                recurring: recurring,
                timezone: timezone
            });
            
            const ms = remindTime.valueOf() - Date.now();
            setTimeout(() => {
                conn.sendMessage(sender, {
                    text: `⏰ *REMINDER*\n\n${message}`
                });
            }, ms);
            
            return reply(`✅ *Reminder set!*\n\n⏰ When: ${remindTime.format('YYYY-MM-DD HH:mm')}\n📝 What: ${message}\n🆔 ID: #${reminderId}`);
        }

    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// List user reminders
cmd({
    pattern: "myreminders",
    alias: ["reminders", "listreminders"],
    desc: "List all your active reminders",
    category: "tools",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        const userReminders = reminders[sender] || [];
        
        if (userReminders.length === 0) {
            return reply("⏰ No active reminders!");
        }
        
        let list = `
╔══════════════════════════════════════╗
║     📋 *YOUR ACTIVE REMINDERS*       ║
╠══════════════════════════════════════╣
`;
        
        userReminders.forEach(r => {
            const time = new Date(r.time).toLocaleString();
            list += `║ #${r.id}: ${time}\n║   📝 ${r.message.substring(0, 30)}\n║\n`;
        });
        
        list += `╚══════════════════════════════════════╝`;
        reply(list);
        
    } catch (err) {
        reply("❌ Error: " + err.message);
    }
});
