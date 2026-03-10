/* ============================================
   GURU MD - UPDATE SYSTEM
   COMMAND: .update
   UPDATES: Bot from GitHub repository
   STYLE: Clean & Organized
   ============================================ */

const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");
const { setCommitHash, getCommitHash } = require('../data/updateDB');
const config = require('../config');

// Load GitHub settings from config
const GITHUB_TOKEN = config.GITHUB_TOKEN || '';
const REPO = config.GITHUB_REPO || 'itsguruu/GURUH';
const BRANCH = config.GITHUB_BRANCH || 'main';

// Create axios instance with default headers for GitHub API
const githubApi = axios.create({
    timeout: 15000,
    headers: {
        'User-Agent': 'GURU-MD-Bot/1.0',
        'Accept': 'application/vnd.github.v3+json',
        ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
    }
});

// Helper function to format numbers
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Helper function to copy folder with protected files
function copyFolderSync(source, target, protectedFiles = []) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);
    
    for (const item of items) {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);

        if (protectedFiles.includes(item) || protectedFiles.includes(item.toLowerCase())) {
            console.log(`⏭️ Skipping protected: ${item}`);
            continue;
        }

        if (item === 'node_modules') {
            console.log("⏭️ Skipping node_modules");
            continue;
        }

        try {
            if (fs.lstatSync(srcPath).isDirectory()) {
                copyFolderSync(srcPath, destPath, protectedFiles);
            } else {
                if (!fs.existsSync(destPath) || 
                    fs.statSync(srcPath).mtime > fs.statSync(destPath).mtime) {
                    fs.copyFileSync(srcPath, destPath);
                    console.log(`✅ Updated: ${item}`);
                }
            }
        } catch (err) {
            console.error(`⚠️ Error copying ${item}:`, err.message);
        }
    }
}

// Main update command
cmd({
    pattern: "update",
    alias: ["upgrade", "sync"],
    react: '🆙',
    desc: "Update the bot to the latest version from your repo",
    category: "owner",
    filename: __filename
}, async (client, message, args, { reply, isOwner }) => {
    if (!isOwner) return reply("❌ This command is only for the bot owner.");

    try {
        await reply("🔍 *Checking for updates...*");

        // Check rate limit
        try {
            const rateLimit = await githubApi.get("https://api.github.com/rate_limit");
            const remaining = rateLimit.data.resources.core.remaining;
            
            if (remaining < 10) {
                return reply(`⚠️ *Low API Limit*\n\nRemaining: ${remaining}/60\nPlease add GitHub token to increase limit to 5000/hr`);
            }
        } catch (rateErr) {
            console.log("Rate limit check failed:", rateErr.message);
        }

        // Fetch latest commit
        const commitUrl = `https://api.github.com/repos/${REPO}/commits/${BRANCH}`;
        const commitRes = await githubApi.get(commitUrl);

        if (!commitRes.data?.sha) {
            throw new Error("Invalid GitHub response");
        }

        const latestCommitHash = commitRes.data.sha;
        const commitMessage = commitRes.data.commit?.message || "No commit message";
        const commitAuthor = commitRes.data.commit?.author?.name || "Unknown";
        const commitDate = commitRes.data.commit?.author?.date ? 
            new Date(commitRes.data.commit.author.date).toLocaleString() : "Unknown";

        const currentHash = await getCommitHash();

        // Fetch versions
        const packageUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/package.json`;
        const remotePkgRes = await axios.get(packageUrl, { timeout: 10000 });
        const remoteVersion = JSON.parse(remotePkgRes.data).version || "unknown";

        let localVersion = "unknown";
        const localPkgPath = path.join(__dirname, '..', 'package.json');
        if (fs.existsSync(localPkgPath)) {
            try {
                localVersion = JSON.parse(fs.readFileSync(localPkgPath, 'utf8')).version || "unknown";
            } catch (e) {}
        }

        // If already up to date
        if (latestCommitHash === currentHash) {
            return reply(`✅ *Bot is Up to Date*\n\n*Repository:* ${REPO}\n*Branch:* ${BRANCH}\n*Version:* ${localVersion}\n*Commit:* ${currentHash.substring(0, 7)}\n\nNo updates available.`);
        }

        // Show update info and ask for confirmation
        const updateInfo = `🔄 *Update Available*\n\n` +
            `*Repository:* ${REPO}\n` +
            `*Branch:* ${BRANCH}\n` +
            `*Current Version:* ${localVersion}\n` +
            `*Latest Version:* ${remoteVersion}\n` +
            `*Current Commit:* ${currentHash ? currentHash.substring(0, 7) : 'None'}\n` +
            `*Latest Commit:* ${latestCommitHash.substring(0, 7)}\n` +
            `*Changes:* ${commitMessage}\n` +
            `*Author:* ${commitAuthor}\n` +
            `*Date:* ${commitDate}\n\n` +
            `Reply with *YES* to update or *NO* to cancel. (30s timeout)`;

        await reply(updateInfo);

        // Wait for confirmation
        const confirmation = await new Promise((resolve) => {
            const listener = (responseMsg) => {
                if (responseMsg.key?.participant === message.key?.participant && 
                    responseMsg.message?.conversation) {
                    const userResponse = responseMsg.message.conversation.trim().toUpperCase();
                    if (userResponse === 'YES' || userResponse === 'NO') {
                        client.ev.off('messages.upsert', listener);
                        resolve(userResponse);
                    }
                }
            };
            
            client.ev.on('messages.upsert', listener);
            setTimeout(() => {
                client.ev.off('messages.upsert', listener);
                resolve('TIMEOUT');
            }, 30000);
        });

        if (confirmation !== 'YES') {
            return reply(confirmation === 'TIMEOUT' ? 
                "⏰ *Update cancelled* (timeout)" : 
                "❌ *Update cancelled*");
        }

        await reply("🚀 *Starting update...*");

        // Create temp directory
        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Download ZIP
        const zipPath = path.join(tempDir, "latest.zip");
        const writer = fs.createWriteStream(zipPath);
        
        const zipUrl = `https://github.com/${REPO}/archive/${BRANCH}.zip`;
        const zipRes = await axios({
            method: 'get',
            url: zipUrl,
            responseType: 'stream',
            timeout: 60000
        });

        const totalLength = zipRes.headers['content-length'];
        let downloadedLength = 0;
        let lastProgress = 0;

        zipRes.data.on('data', (chunk) => {
            downloadedLength += chunk.length;
            if (totalLength) {
                const progress = Math.round((downloadedLength / totalLength) * 100);
                if (progress - lastProgress >= 10) {
                    lastProgress = progress;
                    reply(`📥 Downloading: ${progress}%`).catch(() => {});
                }
            }
        });

        zipRes.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Extract
        await reply("📦 Extracting files...");
        const extractPath = path.join(tempDir, 'extracted');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        // Find source folder
        const extractedItems = fs.readdirSync(extractPath);
        const repoName = REPO.split('/')[1];
        const sourceFolder = extractedItems.find(item => 
            fs.statSync(path.join(extractPath, item)).isDirectory() && 
            (item.includes(repoName) || item.includes('GURUH'))
        );

        if (!sourceFolder) {
            throw new Error("Source folder not found");
        }

        const sourcePath = path.join(extractPath, sourceFolder);
        
        // Backup important files
        const backupDir = path.join(tempDir, 'backup_' + Date.now());
        fs.mkdirSync(backupDir, { recursive: true });
        
        const filesToBackup = ['config.js', 'config.env', '.env', 'app.json'];
        for (const file of filesToBackup) {
            const filePath = path.join(__dirname, '..', file);
            if (fs.existsSync(filePath)) {
                fs.copyFileSync(filePath, path.join(backupDir, file));
            }
        }

        // Copy files
        await reply("🔄 Applying updates...");
        const destinationPath = path.join(__dirname, '..');
        const protectedFiles = ['config.js', 'config.env', '.env', 'app.json', 'session', 'auth_info', 'node_modules'];
        copyFolderSync(sourcePath, destinationPath, protectedFiles);

        // Restore backups
        for (const file of filesToBackup) {
            const backupFile = path.join(backupDir, file);
            const destFile = path.join(destinationPath, file);
            if (fs.existsSync(backupFile)) {
                fs.copyFileSync(backupFile, destFile);
            }
        }

        // Save new hash
        await setCommitHash(latestCommitHash);

        // Cleanup
        fs.rmSync(tempDir, { recursive: true, force: true });

        await reply(`✅ *Update Complete!*\n\nVersion: ${remoteVersion}\nCommit: ${latestCommitHash.substring(0, 7)}\n\n♻️ Restarting in 3 seconds...`);
        
        setTimeout(() => process.exit(0), 3000);

    } catch (error) {
        console.error("Update error:", error);
        
        let errMsg = error.message;
        let solution = "\n\n*Solutions:*\n";
        
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            solution += "• Check internet connection\n• Try again later";
        } else if (error.response?.status === 403) {
            solution += "• GitHub API limit exceeded. Add token to config.env";
        } else if (error.response?.status === 404) {
            solution += `• Repository not found: ${REPO}`;
        } else {
            solution += "• Try manual update with 'git pull'\n• Check config settings";
        }
        
        // Cleanup temp
        const tempDir = path.join(__dirname, '..', 'temp');
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        
        return reply(`❌ *Update Failed*\n\nError: ${errMsg}${solution}`);
    }
});

// Check update command
cmd({
    pattern: "checkupdate",
    alias: ["checkup", "version"],
    react: '🔍',
    desc: "Check for available updates",
    category: "owner",
    filename: __filename
}, async (client, message, args, { reply, isOwner }) => {
    if (!isOwner) return reply("❌ This command is only for the bot owner.");

    try {
        await reply("🔍 *Checking for updates...*");

        // Get rate limit info
        let rateInfo = "";
        try {
            const rateLimit = await githubApi.get("https://api.github.com/rate_limit");
            const remaining = rateLimit.data.resources.core.remaining;
            const limit = rateLimit.data.resources.core.limit;
            const resetTime = new Date(rateLimit.data.resources.core.reset * 1000);
            
            rateInfo = `*API:* ${remaining}/${limit} remaining\n`;
            rateInfo += `*Token:* ${GITHUB_TOKEN ? '✅' : '❌'} (${GITHUB_TOKEN ? '5000/hr' : '60/hr'})\n`;
            rateInfo += `*Resets:* ${resetTime.toLocaleTimeString()}\n\n`;
        } catch (e) {}

        // Get latest commit
        const commitUrl = `https://api.github.com/repos/${REPO}/commits/${BRANCH}`;
        const commitRes = await githubApi.get(commitUrl);

        const latestCommitHash = commitRes.data.sha;
        const commitMessage = commitRes.data.commit?.message || "No message";
        const currentHash = await getCommitHash();

        // Get versions
        let remoteVersion = "unknown", localVersion = "unknown";
        try {
            const pkgRes = await axios.get(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/package.json`);
            remoteVersion = JSON.parse(pkgRes.data).version || "unknown";
            
            const localPkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
            localVersion = localPkg.version || "unknown";
        } catch (e) {}

        const status = latestCommitHash === currentHash ? "✅ Up to date" : "🔄 Update available";
        
        const info = `📊 *Update Status*\n\n` +
            `${rateInfo}` +
            `*Repository:* ${REPO}\n` +
            `*Branch:* ${BRANCH}\n` +
            `*Status:* ${status}\n` +
            `*Version:* ${localVersion} → ${remoteVersion}\n` +
            `*Current:* ${currentHash ? currentHash.substring(0, 7) : 'None'}\n` +
            `*Latest:* ${latestCommitHash.substring(0, 7)}\n` +
            `*Changes:* ${commitMessage.substring(0, 50)}${commitMessage.length > 50 ? '...' : ''}\n\n` +
            `Use *${args[0] || ''}update* to apply update.`;

        await reply(info);

    } catch (error) {
        if (error.response?.status === 403) {
            return reply(`❌ *API Limit Exceeded*\n\nAdd GitHub token to config.env for 5000 requests/hour`);
        } else if (error.response?.status === 404) {
            return reply(`❌ *Repository Not Found*\n\nCheck GITHUB_REPO in config.env`);
        }
        return reply(`❌ *Error*\n\n${error.message}`);
    }
});
