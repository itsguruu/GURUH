/* ============================================
   GURU MD - PROFESSIONAL FILE CREATION
   COMMAND: .create [type] [data]
   FEATURES: Generate Excel, PDF, PPT, JSON, CSV files
   ============================================ */

const { cmd } = require('../command');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const PPTX = require('nodejs-pptx');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "create",
    alias: ["makefile", "generate"],
    desc: "Create professional documents on-the-fly",
    category: "tools",
    react: "📄",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            const menu = `
╔══════════════════════════════════════╗
║     📄 *PROFESSIONAL FILE CREATOR*   ║
╠══════════════════════════════════════╣
║ *Commands:*                          ║
║                                      ║
║ 📊 *Excel (.xlsx)*                    ║
║ .create excel title:A1=Sales,Q1=100K ║
║                                      ║
║ 📄 *PDF (.pdf)*                       ║
║ .create pdf "Invoice#123|Total:$500" ║
║                                      ║
║ 📽️ *PowerPoint (.pptx)*               ║
║ .create ppt "Slide1:Welcome|Slide2:Data" ║
║                                      ║
║ 📝 *CSV (.csv)*                       ║
║ .create csv "Name,Age,City"           ║
║                                      ║
║ 📋 *JSON (.json)*                     ║
║ .create json {name:"John",age:30}    ║
╠══════════════════════════════════════╣
║ *Examples:*                          ║
║ .create excel Month:January,Sales:500K ║
║ .create pdf "Meeting Notes|Action Items" ║
╚══════════════════════════════════════╝
            `;
            return reply(menu);
        }

        const parts = q.split(' ');
        const type = parts[0].toLowerCase();
        const data = parts.slice(1).join(' ');

        if (!data) return reply("❌ Please provide data to create!");

        const fileName = `guru_${Date.now()}`;
        let filePath = '';
        let mimeType = '';
        let buffer = null;

        // EXCEL CREATION
        if (type === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');
            
            // Parse data format: key:value pairs
            const pairs = data.split(',');
            pairs.forEach((pair, index) => {
                const [key, value] = pair.split('=');
                if (key && value) {
                    worksheet.getCell(key).value = value;
                }
            });
            
            filePath = path.join(__dirname, `${fileName}.xlsx`);
            await workbook.xlsx.writeFile(filePath);
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }

        // PDF CREATION
        else if (type === 'pdf') {
            filePath = path.join(__dirname, `${fileName}.pdf`);
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);
            
            // Add content
            const lines = data.split('|');
            lines.forEach((line, i) => {
                doc.text(line, { continued: false });
                if (i < lines.length - 1) doc.moveDown();
            });
            
            doc.end();
            await new Promise(resolve => stream.on('finish', resolve));
            mimeType = 'application/pdf';
        }

        // POWERPOINT CREATION
        else if (type === 'ppt' || type === 'pptx') {
            const pptx = new PPTX.Composer();
            await pptx.compose(async (ppt) => {
                const slides = data.split('|');
                for (const slideData of slides) {
                    const [title, content] = slideData.split(':');
                    await ppt.addSlide((slide) => {
                        slide.addText(title, { x: 1, y: 0.5, fontSize: 24 });
                        if (content) {
                            slide.addText(content, { x: 1, y: 2, fontSize: 18 });
                        }
                    });
                }
            });
            
            filePath = path.join(__dirname, `${fileName}.pptx`);
            await pptx.save(filePath);
            mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        }

        // CSV CREATION
        else if (type === 'csv') {
            filePath = path.join(__dirname, `${fileName}.csv`);
            fs.writeFileSync(filePath, data);
            mimeType = 'text/csv';
        }

        // JSON CREATION
        else if (type === 'json') {
            filePath = path.join(__dirname, `${fileName}.json`);
            try {
                const jsonData = JSON.parse(data);
                fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
            } catch {
                fs.writeFileSync(filePath, data);
            }
            mimeType = 'application/json';
        }

        else {
            return reply("❌ Unknown file type! Use: excel, pdf, ppt, csv, json");
        }

        // Send the file
        await conn.sendMessage(from, {
            document: { url: filePath },
            mimetype: mimeType,
            fileName: path.basename(filePath),
            caption: `📄 *File Created*\n\nType: ${type.toUpperCase()}\nSize: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`
        }, { quoted: mek });

        // Clean up
        setTimeout(() => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, 60000);

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});
