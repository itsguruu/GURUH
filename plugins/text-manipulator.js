const axios = require('axios');
const crypto = require('crypto');

module.exports = {
    name: "Text Manipulator",
    alias: ["text", "style", "fancy", "reverse", "capitalize", "lowercase", "uppercase", "bold", "italic", "strike", "monospace", "hash", "base64", "translate", "count"],
    desc: "Advanced text manipulation tools",
    category: "Tools",
    usage: ".text <style> <text>",
    react: "✍️",
    start: async (conn, m, { text, prefix, reply, args }) => {
        if (!text) return reply(`❌ Please specify text style!\n\n*Styles:*\n▸ fancy / style - Fancy text\n▸ reverse - Reverse text\n▸ uppercase / caps\n▸ lowercase\n▸ capitalize\n▸ bold - Bold text\n▸ italic - Italic text\n▸ strike - Strikethrough\n▸ monospace\n▸ hash - Generate hash\n▸ base64 encode/decode\n▸ count - Count characters\n▸ translate - Translate text\n\nExample: ${prefix}text fancy Hello World`);

        const subCmd = args[0]?.toLowerCase();
        const inputText = args.slice(1).join(' ');
        
        if (!inputText && subCmd !== 'hash' && subCmd !== 'base64') {
            return reply(`❌ Please provide text to manipulate!`);
        }
        
        try {
            let result = '';
            let type = '';
            
            switch(subCmd) {
                case 'fancy':
                case 'style':
                    result = fancyText(inputText);
                    type = 'Fancy Text';
                    break;
                    
                case 'reverse':
                    result = inputText.split('').reverse().join('');
                    type = 'Reversed Text';
                    break;
                    
                case 'uppercase':
                case 'caps':
                    result = inputText.toUpperCase();
                    type = 'Uppercase';
                    break;
                    
                case 'lowercase':
                    result = inputText.toLowerCase();
                    type = 'Lowercase';
                    break;
                    
                case 'capitalize':
                    result = inputText.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ');
                    type = 'Capitalized';
                    break;
                    
                case 'bold':
                    result = convertToBold(inputText);
                    type = 'Bold Text';
                    break;
                    
                case 'italic':
                    result = convertToItalic(inputText);
                    type = 'Italic Text';
                    break;
                    
                case 'strike':
                    result = inputText.split('').join('̶') + '̶';
                    type = 'Strikethrough';
                    break;
                    
                case 'monospace':
                    result = '```' + inputText + '```';
                    type = 'Monospace';
                    break;
                    
                case 'hash':
                    result = generateHash(inputText || crypto.randomBytes(16).toString('hex'));
                    type = 'Hash (SHA256)';
                    break;
                    
                case 'base64':
                    if (args[1] === 'encode') {
                        result = Buffer.from(args.slice(2).join(' ')).toString('base64');
                        type = 'Base64 Encode';
                    } else if (args[1] === 'decode') {
                        result = Buffer.from(args.slice(2).join(' '), 'base64').toString('utf-8');
                        type = 'Base64 Decode';
                    } else {
                        result = Buffer.from(inputText).toString('base64');
                        type = 'Base64 Encode';
                    }
                    break;
                    
                case 'count':
                    const chars = inputText.length;
                    const words = inputText.split(/\s+/).filter(w => w.length > 0).length;
                    const lines = inputText.split('\n').length;
                    const spaces = (inputText.match(/\s/g) || []).length;
                    
                    result = `Characters: ${chars}\nWords: ${words}\nLines: ${lines}\nSpaces: ${spaces}`;
                    type = 'Text Statistics';
                    break;
                    
                case 'translate':
                    result = await translateText(inputText);
                    type = 'Translation';
                    break;
                    
                default:
                    return reply('❌ Unknown text style!');
            }
            
            const caption = `*✍️ ${type}*\n\n${result}\n\n_ᴳᵁᴿᵁᴹᴰ Text Tools_`;
            
            await conn.sendMessage(m.from, { text: caption }, { quoted: m });
            
        } catch (error) {
            console.error('[Text Error]:', error);
            reply(`❌ Text manipulation failed: ${error.message}`);
        }
    }
};

// Fancy text styles
function fancyText(text) {
    const fancyMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ', 'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ғ', 
        'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ', 'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 
        'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ', 'S': 's', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 
        'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ'
    };
    
    return text.split('').map(char => fancyMap[char] || char).join('');
}

// Bold text (Unicode mathematical bold)
function convertToBold(text) {
    const boldMap = {
        'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡',
        'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩',
        'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱',
        'y': '𝐲', 'z': '𝐳', 'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅',
        'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍',
        'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕',
        'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙'
    };
    return text.split('').map(char => boldMap[char] || char).join('');
}

// Italic text (Unicode mathematical italic)
function convertToItalic(text) {
    const italicMap = {
        'a': '𝑎', 'b': '𝑏', 'c': '𝑐', 'd': '𝑑', 'e': '𝑒', 'f': '𝑓', 'g': '𝑔', 'h': 'ℎ',
        'i': '𝑖', 'j': '𝑗', 'k': '𝑘', 'l': '𝑙', 'm': '𝑚', 'n': '𝑛', 'o': '𝑜', 'p': '𝑝',
        'q': '𝑞', 'r': '𝑟', 's': '𝑠', 't': '𝑡', 'u': '𝑢', 'v': '𝑣', 'w': '𝑤', 'x': '𝑥',
        'y': '𝑦', 'z': '𝑧', 'A': '𝐴', 'B': '𝐵', 'C': '𝐶', 'D': '𝐷', 'E': '𝐸', 'F': '𝐹',
        'G': '𝐺', 'H': '𝐻', 'I': '𝐼', 'J': '𝐽', 'K': '𝐾', 'L': '𝐿', 'M': '𝑀', 'N': '𝑁',
        'O': '𝑂', 'P': '𝑃', 'Q': '𝑄', 'R': '𝑅', 'S': '𝑆', 'T': '𝑇', 'U': '𝑈', 'V': '𝑉',
        'W': '𝑊', 'X': '𝑋', 'Y': '𝑌', 'Z': '𝑍'
    };
    return text.split('').map(char => italicMap[char] || char).join('');
}

// Generate hash
function generateHash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

// Translate text
async function translateText(text) {
    try {
        const res = await axios.get(`https://api.akuari.my.id/tools/translate?text=${encodeURIComponent(text)}&to=en`);
        return res.data.result || 'Translation unavailable';
    } catch (e) {
        return 'Translation service unavailable';
    }
}
