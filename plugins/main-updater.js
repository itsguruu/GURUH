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
        await reply("🔍 Checking for GURU-MD updates...");

        // Fetch latest commit hash with proper headers & timeout
        const commitRes = await axios.get("https://api.github.com/repos/itsguruu/GURUH/commits/main", {
            timeout: 10000,
            headers: { 'User-Agent': 'GURU-MD-Bot/1.0' }
        });

        if (!commitRes.data || typeof commitRes.data !== 'object' || !commitRes.data.sha) {
            throw new Error("Invalid GitHub commit response - missing SHA");
        }

        const latestCommitHash = commitRes.data.sha;

        const currentHash = await getCommitHash();

        // Fetch remote package.json
        const remotePkgRes = await axios.get("https://raw.githubusercontent.com/itsguruu/GURUH/main/package.json", {
            timeout: 8000
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

        await reply(`Current version: ${localVersion} | Latest on repo: ${remoteVersion}`);

        if (latestCommitHash === currentHash) {
            return reply("✅ Your GURU-MD is already on the latest commit (no new changes).");
        }

        // Proceed with update even if versions match but commit differs
        await reply(`🚀 Updating GURU-MD to version ${remoteVersion} from https://github.com/itsguruu/GURUH ...`);

        // Download ZIP
        const zipPath = path.join(__dirname, "latest.zip");
        const zipRes = await axios.get("https://github.com/itsguruu/GURUH/archive/main.zip", {
            responseType: "arraybuffer",
            timeout: 30000
        });
        fs.writeFileSync(zipPath, zipRes.data);

        // Extract
        await reply("📦 Extracting latest code...");
        const extractPath = path.join(__dirname, 'latest');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        // Copy files
        await reply("🔄 Applying updates (preserving your config.js & app.json)...");
        const sourcePath = path.join(extractPath, "GURUH-main");
        const destinationPath = path.join(__dirname, '..');
        copyFolderSync(sourcePath, destinationPath);

        // Save new hash
        await setCommitHash(latestCommitHash);

        // Cleanup
        fs.unlinkSync(zipPath);
        fs.rmSync(extractPath, { recursive: true, force: true });

        await reply(`✅ Update to version ${remoteVersion} complete! Restarting the bot...`);
        process.exit(0);

    } catch (error) {
        console.error("Update error details:", error.message, error.response?.data || error.stack);
        let errMsg = error.message || "Unknown error";
        if (error.response) {
            errMsg += ` (HTTP ${error.response.status})`;
        }
        return reply(`❌ Update failed: ${errMsg}\nPossible causes: Network issue, GitHub rate limit, or API error.\nTry again later or do manual git pull in Termux.`);
    }
});

// copyFolderSync remains unchanged
function copyFolderSync(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);
    for (const item of items) {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);

        if (item === "config.js" || item === "app.json") {
            console.log(`Skipping ${item} to preserve your custom settings.`);
            continue;
        }

        if (fs.lstatSync(srcPath).isDirectory()) {
            copyFolderSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
