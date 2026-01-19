const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');

cmd({
  pattern: 'version',
  alias: ["changelog", "cupdate", "checkupdate", "v"],
  react: '🚀',
  desc: "Check bot's version, system stats, changelog & update status.",
  category: 'info',
  filename: __filename
}, async (conn, mek, m, {
  from, sender, pushname, reply
}) => {
  try {
    // Local version from data/version.json
    const localVersionPath = path.join(__dirname, '../data/version.json');
    let localVersion = 'Unknown';
    let localChangelog = 'No changelog available.';
    if (fs.existsSync(localVersionPath)) {
      const localData = JSON.parse(fs.readFileSync(localVersionPath, 'utf8'));
      localVersion = localData.version || 'Unknown';
      localChangelog = localData.changelog || 'No changelog available.';
    }

    // Fetch latest from your GitHub repo
    const rawVersionUrl = 'https://raw.githubusercontent.com/itsguruu/GURUH/main/data/version.json';
    let latestVersion = 'Unknown';
    let latestChangelog = 'No changelog available.';
    try {
      const { data } = await axios.get(rawVersionUrl);
      latestVersion = data.version || 'Unknown';
      latestChangelog = data.changelog || 'No changelog available.';
    } catch (error) {
      console.error('Failed to fetch latest version:', error.message);
    }

    // Plugin & command counts
    const pluginPath = path.join(__dirname, '../plugins');
    const pluginCount = fs.existsSync(pluginPath) 
      ? fs.readdirSync(pluginPath).filter(file => file.endsWith('.js')).length 
      : 0;

    const totalCommands = commands.length;

    // System stats
    const uptime = runtime(process.uptime());
    const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2);
    const hostName = os.hostname();
    const lastUpdate = fs.existsSync(localVersionPath) 
      ? fs.statSync(localVersionPath).mtime.toLocaleString() 
      : 'Unknown';

    // Update status
    let updateStatus = "✅ Your GURU MD is up-to-date!";
    if (localVersion !== 'Unknown' && latestVersion !== 'Unknown' && localVersion !== latestVersion) {
      updateStatus = `🚨 Update Available!\n` +
                     `Current: ${localVersion} → Latest: ${latestVersion}\n` +
                     `Use *.update* to upgrade now!`;
    }

    // Fancy boxed design
    const statusMessage = `
╔════════════════════════════════════╗
║         ✨  G U R U   M D  ✨        ║
║      v${localVersion} • Status Check     ║
╠════════════════════════════════════╣
║  • Bot Name     : GURU MD           ║
║  • Current Ver  : ${localVersion.padEnd(15)}║
║  • Latest Ver   : ${latestVersion.padEnd(15)}║
║  • Plugins      : ${pluginCount.toString().padEnd(15)}║
║  • Commands     : ${totalCommands.toString().padEnd(15)}║
╠════════════════════════════════════╣
║  System Stats:                      ║
║  • Uptime       : ${uptime.padEnd(15)}║
║  • RAM          : \( {ramUsage}/ \){totalRam} MB     ║
║  • Host         : ${hostName.slice(0,15).padEnd(15)}║
║  • Last Update  : ${lastUpdate.slice(0,15)}... ║
╠════════════════════════════════════╣
║  Changelog (Latest):                ║
║  ${latestChangelog.replace(/\\n/g, '\n║  ').slice(0, 200)}... ║
╠════════════════════════════════════╣
║  ${updateStatus}                    ║
╚════════════════════════════════════╝

🔗 Repo: https://github.com/itsguruu/GURUH
👑 Owner: GuruTech
⭐ Star & Fork the repo! 🚀`;

    // Send with image
    await conn.sendMessage(from, {
      image: { url: "https://res.cloudinary.com/dgy2dutjs/image/upload/v1751707342/url.crissvevo.co.tz/%E1%B4%8F%CA%99%E1%B4%87%E1%B4%85%E1%B4%9B%E1%B4%87%E1%B4%84%CA%9C1_exmbht.jpg" },
      caption: statusMessage,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363421164015033@newsletter',
          newsletterName: 'GURU MD',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

  } catch (error) {
    console.error('Version check error:', error);
    reply('❌ Error while checking version. Try again later.');
  }
});
