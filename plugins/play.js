const { cmd } = require('../command');
const yts = require('yt-search');
const { YtDlp } = require('ytdlp-nodejs');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "play",
    alias: ["song", "ytplay", "music"],
    desc: "Download & send YouTube song as MP3 with nice audio player",
    category: "download",
    use: ".play <song name or URL>",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q) return reply("❌ Provide song name or YouTube link!\nEg: .play perfect ed sheeran");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        let videoUrl, title, thumbnailUrl;

        // Handle URL or search
        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q.trim();
            const info = await yts({ videoId: q.split(/[=/]/).pop() });
            title = info.title || "Song";
            thumbnailUrl = info.thumbnail;
        } else {
            const search = await yts(q);
            if (!search.videos.length) return reply("No results found 😕");
            const vid = search.videos[0];
            videoUrl = vid.url;
            title = vid.title;
            thumbnailUrl = vid.thumbnail;
        }

        reply(`🎧 Downloading *${title}*...`);

        const ytdlp = new YtDlp();
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const safeTitle = title.replace(/[^\w\s]/gi, '_');
        const outputPath = path.join(tempDir, `\( {Date.now()}_ \){safeTitle}.mp3`);

        // Download best audio as mp3
        await ytdlp.download(videoUrl, {
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: 0, // best
            output: outputPath,
            addMetadata: true,
            embedThumbnail: true
        });

        if (!fs.existsSync(outputPath)) throw new Error("Download failed");

        // Optional: Get thumbnail buffer for better preview (WhatsApp loves it)
        let thumbBuffer;
        try {
            const thumbResponse = await fetch(thumbnailUrl);
            thumbBuffer = await thumbResponse.buffer();
        } catch {}

        // Send as AUDIO → gets the nice player + waveform + progress bar
        await conn.sendMessage(from, {
            audio: { url: outputPath },
            mimetype: 'audio/mpeg',
            fileName: `${safeTitle}.mp3`,
            caption: `🎵 *${title}*\nPowered by Guru MD • Downloaded from YouTube`,
            ...(thumbBuffer ? { jpegThumbnail: thumbBuffer } : {}),
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true, // optional: makes it look like forwarded music
                externalAdReply: {
                    title: title,
                    body: "Song • Artist • YouTube",
                    thumbnail: thumbBuffer || undefined,
                    mediaType: 2,
                    sourceUrl: videoUrl,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

        reply(`✅ Sent as audio player! Play & enjoy 🎧`);

        // Cleanup
        setTimeout(() => fs.unlink(outputPath, () => {}), 60000);

    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message || 'Something went wrong'}`);
    }
});
