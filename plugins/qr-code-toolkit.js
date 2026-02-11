const QRCode = require('qrcode');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
    name: "QR Code Toolkit",
    alias: ["qr", "qrcode", "makeqr", "readqr", "qrread"],
    desc: "Create and read QR codes",
    category: "Tools",
    usage: ".qr <text> or .readqr (reply to QR code)",
    react: "📱",
    start: async (conn, m, { text, prefix, reply, quoted }) => {
        const subCmd = text?.split(' ')[0]?.toLowerCase();
        
        // Read QR code from image
        if (subCmd === 'read' || subCmd === 'readqr' || subCmd === 'scan') {
            await readQRCode(conn, m, quoted, reply);
            return;
        }
        
        // Default: Create QR code
        await createQRCode(conn, m, text, prefix, reply);
    }
};

async function createQRCode(conn, m, text, prefix, reply) {
    if (!text) return reply(`❌ Please provide text or URL!\n\nExample: ${prefix}qr Hello World\n${prefix}qr https://github.com/itsguruu`);

    try {
        reply('📱 Generating QR code...');
        
        // QR code options
        const options = {
            errorCorrectionLevel: 'H',
            margin: 2,
            scale: 10,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        };
        
        // Generate QR code as buffer
        const qrBuffer = await QRCode.toBuffer(text, options);
        
        // Save temp file
        const tempPath = path.join(os.tmpdir(), `qr_${Date.now()}.png`);
        fs.writeFileSync(tempPath, qrBuffer);
        
        // Create fancy QR with logo
        if (text.includes('http') || text.includes('github') || text.includes('wa.me')) {
            const image = await Jimp.read(tempPath);
            const logoPath = path.join(os.tmpdir(), `logo_${Date.now()}.png`);
            
            // Try to add small logo
            try {
                const logo = await Jimp.read('https://files.catbox.moe/ntfw9h.jpg');
                logo.resize(50, 50);
                
                const x = (image.bitmap.width - logo.bitmap.width) / 2;
                const y = (image.bitmap.height - logo.bitmap.height) / 2;
                
                image.composite(logo, x, y, {
                    mode: Jimp.BLEND_SOURCE_OVER,
                    opacitySource: 0.8,
                    opacityDest: 1
                });
                
                await image.writeAsync(tempPath);
            } catch (e) {}
        }
        
        const caption = `*📱 QR Code Generated*\n\n*Content:* ${text.length > 100 ? text.substring(0, 100) + '...' : text}\n*Scan to view*\n\nᴳᵁᴿᵁᴹᴰ`;
        
        await conn.sendMessage(m.from, {
            image: fs.readFileSync(tempPath),
            caption: caption,
            mimetype: 'image/png'
        }, { quoted: m });
        
        fs.unlinkSync(tempPath);
        
    } catch (error) {
        console.error('[QR Error]:', error);
        reply(`❌ QR generation failed: ${error.message}`);
    }
}

async function readQRCode(conn, m, quoted, reply) {
    if (!quoted) return reply('❌ Reply to an image containing QR code!');
    
    let imageMsg = quoted.message?.imageMessage;
    if (!imageMsg) return reply('❌ Reply to an image only!');
    
    try {
        reply('🔍 Reading QR code...');
        
        // Download image
        const buffer = await quoted.download();
        
        // Read QR code
        const Jimp = require('jimp');
        const jsQR = require('jsqr');
        
        const image = await Jimp.read(buffer);
        const qrData = jsQR(
            image.bitmap.data,
            image.bitmap.width,
            image.bitmap.height
        );
        
        if (qrData) {
            const decodedText = qrData.data;
            const isUrl = /^https?:\/\//i.test(decodedText);
            
            let caption = `*✅ QR Code Scanned*\n\n*Decoded:* ${decodedText}`;
            
            if (isUrl) {
                caption += `\n\n🔗 This is a URL\n_You can use .short to shorten it_`;
            }
            
            caption += `\n\nᴳᵁᴿᵁᴹᴰ QR Scanner`;
            
            await conn.sendMessage(m.from, { text: caption }, { quoted: m });
        } else {
            reply('❌ No QR code found in the image!');
        }
        
    } catch (error) {
        console.error('[QR Read Error]:', error);
        reply(`❌ QR reading failed: ${error.message}`);
    }
}
