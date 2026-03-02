const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");
const { setCommitHash, getCommitHash } = require('../data/updateDB');

cmd({
    pattern: "update",
    alias: ["upgrade", "sync"],
    react: '🆙',
    desc: "Update the bot to the latest version from your repo with version check.",
    category: "misc",
    filename: __filename
}, async (client, message, args, { reply, isOwner }) => {
    if (!isOwner) return reply("This command is only for the bot owner.");

    try {
        const updateMsg = await reply("🔍 Checking for GURU-MD updates...");

        // Fetch latest commit hash with proper headers & timeout
        const commitRes = await axios.get("https://api.github.com/repos/itsguruu/GURUH/commits/main", {
            timeout: 15000,
            headers: { 
                'User-Agent': 'GURU-MD-Bot/1.0',
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!commitRes.data || typeof commitRes.data !== 'object' || !commitRes.data.sha) {
            throw new Error("Invalid GitHub commit response - missing SHA");
        }

        const latestCommitHash = commitRes.data.sha;
        const commitMessage = commitRes.data.commit?.message || "No commit message";
        const commitAuthor = commitRes.data.commit?.author?.name || "Unknown";
        const commitDate = commitRes.data.commit?.author?.date ? 
            new Date(commitRes.data.commit.author.date).toLocaleString() : "Unknown";

        const currentHash = await getCommitHash();

        // Fetch remote package.json
        const remotePkgRes = await axios.get("https://raw.githubusercontent.com/itsguruu/GURUH/main/package.json", {
            timeout: 10000
        });

        let remoteVersion = "unknown";
        try {
            const remotePkg = JSON.parse(remotePkgRes.data);
            remoteVersion = remotePkg.version || "unknown";
        } catch (parseErr) {
            console.error("Failed to parse remote package.json:", parseErr.message);
        }

        // Local package.json
        let localVersion = "unknown";
        const localPkgPath = path.join(__dirname, '..', 'package.json');
        if (fs.existsSync(localPkgPath)) {
            try {
                const localPkg = JSON.parse(fs.readFileSync(localPkgPath, 'utf8'));
                localVersion = localPkg.version || "unknown";
            } catch (parseErr) {
                console.error("Failed to parse local package.json:", parseErr.message);
            }
        }

        // Display update info
        let updateInfo = `📊 *Update Information*\n\n`;
        updateInfo += `*Current Version:* ${localVersion}\n`;
        updateInfo += `*Latest Version:* ${remoteVersion}\n`;
        updateInfo += `*Current Commit:* ${currentHash ? currentHash.substring(0, 7) : 'None'}\n`;
        updateInfo += `*Latest Commit:* ${latestCommitHash.substring(0, 7)}\n`;
        updateInfo += `*Commit Message:* ${commitMessage}\n`;
        updateInfo += `*Author:* ${commitAuthor}\n`;
        updateInfo += `*Date:* ${commitDate}\n\n`;

        if (latestCommitHash === currentHash) {
            return reply(updateInfo + "✅ Your GURU-MD is already on the latest commit (no new changes).");
        }

        // Ask for confirmation
        updateInfo += `🔄 *Do you want to update?*\n`;
        updateInfo += `Reply with *YES* to proceed or *NO* to cancel. (30s timeout)`;
        
        await reply(updateInfo);

        // Wait for user confirmation
        const confirmation = await new Promise((resolve) => {
            const listener = async (responseMsg) => {
                if (responseMsg.key.participant === message.key.participant && 
                    responseMsg.message?.conversation) {
                    const userResponse = responseMsg.message.conversation.trim().toUpperCase();
                    if (userResponse === 'YES' || userResponse === 'NO') {
                        client.ev.off('messages.upsert', listener);
                        resolve(userResponse);
                    }
                }
            };
            
            client.ev.on('messages.upsert', listener);
            
            // Timeout after 30 seconds
            setTimeout(() => {
                client.ev.off('messages.upsert', listener);
                resolve('TIMEOUT');
            }, 30000);
        });

        if (confirmation !== 'YES') {
            return reply(confirmation === 'TIMEOUT' ? 
                "⏰ Update confirmation timeout. Please try again." : 
                "❌ Update cancelled.");
        }

        await reply(`🚀 Starting update to version ${remoteVersion} from https://github.com/itsguruu/GURUH ...`);

        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Download ZIP with progress tracking
        const zipPath = path.join(tempDir, "latest.zip");
        const writer = fs.createWriteStream(zipPath);
        
        const zipRes = await axios({
            method: 'get',
            url: "https://github.com/itsguruu/GURUH/archive/main.zip",
            responseType: 'stream',
            timeout: 60000,
            maxContentLength: 100 * 1024 * 1024 // 100MB max
        });

        const totalLength = zipRes.headers['content-length'];
        let downloadedLength = 0;
        let lastProgress = 0;

        zipRes.data.on('data', (chunk) => {
            downloadedLength += chunk.length;
            if (totalLength) {
                const progress = Math.round((downloadedLength / totalLength) * 100);
                // Update progress every 10%
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
            zipRes.data.on('error', reject);
        });

        // Verify download
        if (!fs.existsSync(zipPath) || fs.statSync(zipPath).size === 0) {
            throw new Error("Download failed - file is empty");
        }

        // Extract
        await reply("📦 Extracting latest code...");
        const extractPath = path.join(tempDir, 'extracted');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        // Find the extracted folder (it will be GURUH-main or similar)
        const extractedItems = fs.readdirSync(extractPath);
        const sourceFolder = extractedItems.find(item => 
            fs.statSync(path.join(extractPath, item)).isDirectory() && 
            item.includes('GURUH')
        );

        if (!sourceFolder) {
            throw new Error("Could not find extracted source folder");
        }

        const sourcePath = path.join(extractPath, sourceFolder);
        
        // Backup important files
        const backupDir = path.join(tempDir, 'backup_' + Date.now());
        fs.mkdirSync(backupDir, { recursive: true });
        
        const filesToBackup = ['config.js', 'app.json', 'config.env'];
        for (const file of filesToBackup) {
            const filePath = path.join(__dirname, '..', file);
            if (fs.existsSync(filePath)) {
                fs.copyFileSync(filePath, path.join(backupDir, file));
            }
        }

        // Copy files
        await reply("🔄 Applying updates (preserving your config files)...");
        const destinationPath = path.join(__dirname, '..');
        
        // Copy all files except protected ones
        const protectedFiles = ['config.js', 'app.json', 'config.env', 'session', 'auth_info'];
        copyFolderSync(sourcePath, destinationPath, protectedFiles);

        // Restore backed up files
        for (const file of filesToBackup) {
            const backupFile = path.join(backupDir, file);
            const destFile = path.join(destinationPath, file);
            if (fs.existsSync(backupFile)) {
                fs.copyFileSync(backupFile, destFile);
                console.log(`Restored ${file} from backup`);
            }
        }

        // Save new hash
        await setCommitHash(latestCommitHash);

        // Cleanup temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });

        await reply(`✅ Update to version ${remoteVersion} complete!\n♻️ Restarting the bot in 3 seconds...`);
        
        // Give time for the message to be sent before restart
        setTimeout(() => {
            process.exit(0);
        }, 3000);

    } catch (error) {
        console.error("Update error details:", error);
        
        let errMsg = error.message || "Unknown error";
        let solution = "\n\n*Possible solutions:*\n";
        
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            solution += "• Check your internet connection\n• GitHub might be slow, try again later";
        } else if (error.response?.status === 403) {
            solution += "• GitHub API rate limit exceeded. Try again in an hour\n• Use a GitHub token for higher limits";
        } else if (error.response?.status === 404) {
            solution += "• Repository not found. Check if the repo URL is correct";
        } else if (error.message.includes('ENOSPC')) {
            solution += "• Not enough disk space. Free up some space and try again";
        } else {
            solution += "• Try manual update with 'git pull' in Termux\n• Check your internet connection";
        }
        
        // Clean up temp directory if it exists
        const tempDir = path.join(__dirname, 'temp');
        if (fs.existsSync(tempDir)) {
            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
            } catch (cleanupErr) {
                console.error("Cleanup error:", cleanupErr);
            }
        }
        
        return reply(`❌ *Update failed*\n\nError: ${errMsg}${solution}`);
    }
});

// Enhanced copyFolderSync with protected files
function copyFolderSync(source, target, protectedFiles = []) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);
    
    for (const item of items) {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);

        // Skip protected files/folders
        if (protectedFiles.includes(item) || protectedFiles.includes(item.toLowerCase())) {
            console.log(`⏭️ Skipping protected item: ${item}`);
            continue;
        }

        // Skip node_modules to avoid conflicts
        if (item === 'node_modules') {
            console.log("⏭️ Skipping node_modules (will be restored via npm install)");
            continue;
        }

        try {
            if (fs.lstatSync(srcPath).isDirectory()) {
                copyFolderSync(srcPath, destPath, protectedFiles);
            } else {
                // Only copy if source is newer or destination doesn't exist
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

// Add a helper function to check for updates without applying
cmd({
    pattern: "checkupdate",
    alias: ["checkup", "versioncheck"],
    react: '🔍',
    desc: "Check for available updates without applying them",
    category: "misc",
    filename: __filename
}, async (client, message, args, { reply, isOwner }) => {
    if (!isOwner) return reply("This command is only for the bot owner.");

    try {
        const commitRes = await axios.get("https://api.github.com/repos/itsguruu/GURUH/commits/main", {
            timeout: 10000,
            headers: { 'User-Agent': 'GURU-MD-Bot/1.0' }
        });

        const latestCommitHash = commitRes.data.sha;
        const commitMessage = commitRes.data.commit?.message || "No commit message";
        const currentHash = await getCommitHash();

        let status = latestCommitHash === currentHash ? "✅ Up to date" : "🔄 Update available";
        
        let info = `📊 *Update Status*\n\n`;
        info += `*Status:* ${status}\n`;
        info += `*Current:* ${currentHash ? currentHash.substring(0, 7) : 'None'}\n`;
        info += `*Latest:* ${latestCommitHash.substring(0, 7)}\n`;
        info += `*Latest Changes:* ${commitMessage}\n\n`;
        
        if (latestCommitHash !== currentHash) {
            info += `Use *${args[0] || ''}update* to apply the update.`;
        }

        await reply(info);
    } catch (error) {
        return reply(`❌ Failed to check updates: ${error.message}`);
    }
});
