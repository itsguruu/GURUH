/* ============================================
   GURU MD - AI AGENT SYSTEM
   COMMAND: .agent [task]
   FEATURES: Autonomous task execution, web searches, API calls
   ============================================ */

const { cmd } = require('../command');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI (get API key from config)
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY || 'YOUR_API_KEY');

// Store active agents per user
const activeAgents = {};

cmd({
    pattern: "agent",
    alias: ["aiagent", "auto"],
    desc: "Create autonomous AI agents for complex tasks",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q) {
            const menu = `
╔══════════════════════════════════════╗
║     🤖 *AI AGENT SYSTEM*             ║
╠══════════════════════════════════════╣
║ *Create autonomous agents that:*     ║
║                                      ║
║ 📌 *Task Examples:*                   ║
║ • "Book a restaurant for 4 at 7pm"   ║
║ • "Find cheapest flights to Tokyo"   ║
║ • "Summarize my unread emails"       ║
║ • "Research competitors and report"  ║
║ • "Monitor crypto prices and alert"  ║
╠══════════════════════════════════════╣
║ *Commands:*                          ║
║ ├─ .agent [task] - Create new agent  ║
║ ├─ .agents       - List your agents  ║
║ └─ .agent kill [id] - Stop agent     ║
╚══════════════════════════════════════╝
            `;
            return reply(menu);
        }

        // Create a new agent
        const agentId = Date.now().toString();
        
        activeAgents[agentId] = {
            userId: sender,
            task: q,
            status: 'running',
            createdAt: new Date(),
            logs: []
        };

        // Initial response
        await reply(`🤖 *Agent #${agentId.slice(-4)} created!*\n\n📋 Task: ${q}\n⏳ Working on it...`);

        // Process task in background
        (async () => {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                
                // Analyze task and break into steps
                const analysis = await model.generateContent(`
                    Break down this task into executable steps: "${q}"
                    Return as JSON array of steps with type (search/calculate/api/notify)
                `);
                
                const steps = JSON.parse(analysis.response.text());
                
                for (const step of steps) {
                    activeAgents[agentId].logs.push(`🔄 ${step.description}`);
                    
                    // Execute based on step type
                    if (step.type === 'search') {
                        // Perform web search
                        const searchRes = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(step.query)}&format=json`);
                        // Process results...
                    }
                    
                    // Report progress every 3 steps
                    if (steps.indexOf(step) % 3 === 0) {
                        await conn.sendMessage(from, {
                            text: `🤖 *Agent #${agentId.slice(-4)} Progress:*\n${activeAgents[agentId].logs.slice(-3).join('\n')}`
                        });
                    }
                }
                
                // Final report
                await conn.sendMessage(from, {
                    text: `✅ *Agent #${agentId.slice(-4)} Completed!*\n\n📋 Task: ${q}\n📊 Steps: ${steps.length}\n⏱️ Time: ${Math.round((Date.now() - activeAgents[agentId].createdAt)/1000)}s\n\n📄 *Final Report:*\n${activeAgents[agentId].logs.join('\n')}`
                });
                
                activeAgents[agentId].status = 'completed';
                
            } catch (err) {
                await conn.sendMessage(from, {
                    text: `❌ *Agent #${agentId.slice(-4)} Failed:*\n${err.message}`
                });
                activeAgents[agentId].status = 'failed';
            }
        })();

    } catch (err) {
        reply("❌ Error: " + err.message);
    }
});

// List active agents
cmd({
    pattern: "agents",
    alias: ["myagents"],
    desc: "List your active AI agents",
    category: "ai",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        const userAgents = Object.entries(activeAgents)
            .filter(([_, agent]) => agent.userId === sender && agent.status === 'running')
            .map(([id, agent]) => `🆔 #${id.slice(-4)}: ${agent.task.substring(0, 30)}...`);
        
        let list = `
╔══════════════════════════════════════╗
║     📋 *YOUR ACTIVE AGENTS*          ║
╠══════════════════════════════════════╣
`;
        
        if (userAgents.length === 0) {
            list += `║ No active agents                    ║`;
        } else {
            userAgents.forEach(agent => {
                list += `║ ${agent}\n`;
            });
        }
        
        list += `╚══════════════════════════════════════╝`;
        reply(list);
        
    } catch (err) {
        reply("❌ Error: " + err.message);
    }
});
