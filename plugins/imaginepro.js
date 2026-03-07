/* ============================================
   GURU MD - MULTI-PROVIDER IMAGE GENERATION
   COMMAND: .imaginepro [prompt]
   FEATURES: 5+ AI models with automatic fallback
   ============================================ */

const { cmd } = require('../command');
const axios = require('axios');

const providers = [
    {
        name: 'Pollinations FLUX',
        url: (prompt) => `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&nologo=true`,
        type: 'direct'
    },
    {
        name: 'Pollinations FLUX-2',
        url: (prompt) => `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux-2-dev&width=1024&height=1024&nologo=true`,
        type: 'direct'
    },
    {
        name: 'Stability AI',
        url: (prompt) => `https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image`,
        type: 'api',
        key: config.STABILITY_API_KEY,
        payload: (prompt) => ({
            text_prompts: [{ text: prompt }],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            samples: 1,
            steps: 30
        })
    },
    {
        name: 'Prodia',
        url: (prompt) => `https://api.prodia.com/v1/sd/generate`,
        type: 'api',
        key: config.PRODIA_API_KEY,
        payload: (prompt) => ({
            model: 'sd_xl_base_1.0.safetensors',
            prompt: prompt,
            negative_prompt: 'nsfw, bad quality, ugly',
            steps: 25,
            cfg_scale: 7,
            sampler: 'DPM++ 2M Karras'
        })
    },
    {
        name: 'DeepAI',
        url: (prompt) => `https://api.deepai.org/api/text2img`,
        type: 'api',
        key: config.DEEPAI_API_KEY,
        payload: (prompt) => ({ text: prompt })
    }
];

cmd({
    pattern: "imaginepro",
    alias: ["genimg", "aigen"],
    desc: "Generate images with automatic provider fallback",
    category: "ai",
    react: "🎨",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a prompt!\n\nExample: .imaginepro beautiful sunset over mountains");

        await conn.sendMessage(from, { react: { text: "🎨", key: mek.key } });

        const statusMsg = await reply(`🎨 *Generating:* "${q}"\n⏳ Trying multiple AI models...`);

        let imageBuffer = null;
        let usedProvider = null;

        // Try each provider in sequence
        for (const provider of providers) {
            try {
                console.log(`🔄 Trying ${provider.name}...`);
                
                if (provider.type === 'direct') {
                    // Direct URL provider (Pollinations)
                    const response = await axios.get(provider.url(q), {
                        responseType: 'arraybuffer',
                        timeout: 30000
                    });
                    imageBuffer = Buffer.from(response.data);
                    usedProvider = provider.name;
                    break;
                    
                } else if (provider.type === 'api' && provider.key) {
                    // API provider with authentication
                    const response = await axios.post(provider.url(q), 
                        provider.payload(q),
                        {
                            headers: {
                                'Authorization': `Bearer ${provider.key}`,
                                'Content-Type': 'application/json'
                            },
                            responseType: 'arraybuffer',
                            timeout: 30000
                        }
                    );
                    imageBuffer = Buffer.from(response.data);
                    usedProvider = provider.name;
                    break;
                }
                
            } catch (err) {
                console.log(`${provider.name} failed: ${err.message}`);
                continue;
            }
        }

        if (!imageBuffer) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ All providers failed!\n\nTry a different prompt or try again later.`);
        }

        // Send the generated image
        await conn.sendMessage(from, {
            image: imageBuffer,
            caption: `🎨 *Generated Image*\n\n📝 Prompt: ${q}\n🤖 Model: ${usedProvider}\n⚡ Status: ✅ Success`,
            contextInfo: {
                externalAdReply: {
                    title: "AI Image Generator Pro",
                    body: q.substring(0, 30),
                    mediaType: 1
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Error: " + err.message);
    }
});

// Check provider status
cmd({
    pattern: "imagestatus",
    desc: "Check image generation providers",
    category: "ai",
    react: "🔌",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let status = `
╔══════════════════════════════════════╗
║     🎨 *IMAGE PROVIDER STATUS*       ║
╠══════════════════════════════════════╣
`;
        for (const provider of providers) {
            try {
                if (provider.type === 'direct') {
                    await axios.head(provider.url('test'), { timeout: 3000 });
                    status += `║ ✅ ${provider.name}\n`;
                } else {
                    status += `║ ${provider.key ? '✅' : '❌'} ${provider.name} ${provider.key ? '' : '(no API key)'}\n`;
                }
            } catch {
                status += `║ ❌ ${provider.name}\n`;
            }
        }
        status += `╚══════════════════════════════════════╝`;
        reply(status);
        
    } catch (err) {
        reply("❌ Error: " + err.message);
    }
});
