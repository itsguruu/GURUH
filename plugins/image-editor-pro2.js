const Jimp = require('jimp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
    name: "Image Editor Pro",
    alias: ["edit", "editimg", "filter", "enhance", "blur", "bright", "contrast", "greyscale", "sepia", "invert", "mirror", "flip", "circle", "pixelate", "rotate"],
    desc: "Advanced image editing tools",
    category: "Tools",
    usage: ".edit <filter> (reply to image)",
    react: "🎨",
    start: async (conn, m, { text, prefix, reply, quoted }) => {
        if (!text) return reply(`❌ Please specify a filter!\n\n*Available Filters:*\n▸ blur\n▸ greyscale / bw\n▸ sepia\n▸ invert\n▸ mirror / flip\n▸ circle / round\n▸ pixelate\n▸ bright <1-100>\n▸ contrast <1-100>\n▸ rotate <degrees>\n▸ resize <width> <height>\n\n*Usage:* ${prefix}edit blur (reply to image)`);

        // Check if replied to an image
        if (!quoted) return reply('❌ Please reply to an image!');
        
        let imageMsg = quoted.message?.imageMessage || 
                      quoted.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        
        if (!imageMsg) return reply('❌ Reply to an image only!');

        try {
            reply('🎨 Processing image...');
            
            // Download image
            const buffer = await quoted.download();
            let image = await Jimp.read(buffer);
            
            // Parse command and parameters
            const args = text.toLowerCase().split(' ');
            const filter = args[0];
            
            // Apply filter
            switch(filter) {
                case 'blur':
                    const blurLevel = parseInt(args[1]) || 5;
                    image.blur(blurLevel);
                    break;
                    
                case 'greyscale':
                case 'bw':
                    image.greyscale();
                    break;
                    
                case 'sepia':
                    image.sepia();
                    break;
                    
                case 'invert':
                    image.invert();
                    break;
                    
                case 'mirror':
                case 'flip':
                    image.flip(true, false);
                    break;
                    
                case 'circle':
                case 'round':
                    image = await makeCircle(image);
                    break;
                    
                case 'pixelate':
                    const pixelSize = parseInt(args[1]) || 5;
                    image.pixelate(pixelSize);
                    break;
                    
                case 'bright':
                    const brightVal = parseInt(args[1]) || 50;
                    image.brightness(brightVal / 100);
                    break;
                    
                case 'contrast':
                    const contrastVal = parseInt(args[1]) || 50;
                    image.contrast(contrastVal / 100);
                    break;
                    
                case 'rotate':
                    const degrees = parseInt(args[1]) || 90;
                    image.rotate(degrees);
                    break;
                    
                case 'resize':
                    const width = parseInt(args[1]) || 500;
                    const height = parseInt(args[2]) || width;
                    image.resize(width, height);
                    break;
                    
                default:
                    return reply('❌ Unknown filter! Use .edit to see available filters.');
            }
            
            // Save edited image
            const tempPath = path.join(os.tmpdir(), `edited_${Date.now()}.png`);
            await image.writeAsync(tempPath);
            
            // Send edited image
            await conn.sendMessage(m.from, {
                image: fs.readFileSync(tempPath),
                caption: `✨ *Filter applied:* ${filter.toUpperCase()}\n\nᴳᵁᴿᵁᴹᴰ Image Editor`,
                mimetype: 'image/png'
            }, { quoted: m });
            
            // Clean up
            fs.unlinkSync(tempPath);
            
        } catch (error) {
            console.error('[Image Editor Error]:', error);
            reply(`❌ Editing failed: ${error.message}`);
        }
    }
};

// Make circle image
async function makeCircle(image) {
    const size = Math.min(image.bitmap.width, image.bitmap.height);
    const mask = new Jimp(size, size, 0x00000000);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;
    
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius) {
                mask.setPixelColor(x, y, 0xFFFFFFFF);
            }
        }
    }
    
    image.resize(size, size);
    image.mask(mask, 0, 0);
    return image;
}
