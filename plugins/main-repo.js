const fetch = require('node-fetch');
const config = require('../config');    
const { cmd } = require('../command');

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info", "github"],
    desc: "Show information about GURU-MD GitHub repository",
    react: "📂",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply, sender }) => {
    const githubRepoURL = 'https://github.com/itsguruu/GURUH'; // Updated to correct repo

    try {
        // Extract username and repo name with better regex
        const match = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) {
            throw new Error("Invalid GitHub URL format");
        }
        
        const [, username, repoName] = match;
        
        // Show loading message
        await reply("🔍 Fetching repository information...");

        // Fetch repo data from GitHub API with proper headers
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
            headers: {
                'User-Agent': 'GURU-MD-Bot/1.0',
                'Accept': 'application/vnd.github.v3+json'
            },
            timeout: 10000
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Repository not found. Please check the repository URL.");
            } else if (response.status === 403) {
                throw new Error("GitHub API rate limit exceeded. Try again later.");
            } else {
                throw new Error(`GitHub API failed: ${response.status} - ${response.statusText}`);
            }
        }

        const repoData = await response.json();

        // Fetch additional data (contributors, issues, etc.)
        const [contributorsRes, issuesRes, pullsRes] = await Promise.allSettled([
            fetch(`https://api.github.com/repos/${username}/${repoName}/contributors?per_page=5`, {
                headers: { 'User-Agent': 'GURU-MD-Bot/1.0' }
            }),
            fetch(`https://api.github.com/repos/${username}/${repoName}/issues?state=open&per_page=1`, {
                headers: { 'User-Agent': 'GURU-MD-Bot/1.0' }
            }),
            fetch(`https://api.github.com/repos/${username}/${repoName}/pulls?state=open&per_page=1`, {
                headers: { 'User-Agent': 'GURU-MD-Bot/1.0' }
            })
        ]);

        // Parse additional data
        let contributors = [];
        let openIssues = 0;
        let openPulls = 0;

        if (contributorsRes.status === 'fulfilled' && contributorsRes.value.ok) {
            const contributorsData = await contributorsRes.value.json();
            contributors = contributorsData.map(c => c.login);
        }

        if (issuesRes.status === 'fulfilled' && issuesRes.value.ok) {
            const issuesData = await issuesRes.value.json();
            openIssues = issuesData.length;
        }

        if (pullsRes.status === 'fulfilled' && pullsRes.value.ok) {
            const pullsData = await pullsRes.value.json();
            openPulls = pullsData.length;
        }

        // Format date
        const lastUpdated = new Date(repoData.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const createdAt = new Date(repoData.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Format numbers with commas
        const formatNumber = (num) => {
            return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
        };

        // Create star rating based on stars count
        const getStarRating = (stars) => {
            if (stars >= 1000) return "🌟🌟🌟🌟🌟";
            if (stars >= 500) return "🌟🌟🌟🌟";
            if (stars >= 100) return "🌟🌟🌟";
            if (stars >= 50) return "🌟🌟";
            if (stars >= 10) return "🌟";
            return "⭐";
        };

        // Format repository info with emojis and better layout
        const formattedInfo = `╭══━ ★GURU-MD REPO★ ━══╮\n\n` +
                             `📁 *Repository:* ${repoData.name}\n` +
                             `👤 *Owner:* ${repoData.owner?.login || username}\n` +
                             `📝 *Description:*\n> ${repoData.description || 'No description provided'}\n\n` +
                             `╭══━ ★STATISTICS★ ━══╮\n` +
                             `│ ⭐ *Stars:* ${formatNumber(repoData.stargazers_count)} ${getStarRating(repoData.stargazers_count)}\n` +
                             `│ 🍴 *Forks:* ${formatNumber(repoData.forks_count)}\n` +
                             `│ 👀 *Watchers:* ${formatNumber(repoData.watchers_count)}\n` +
                             `│ 🐛 *Open Issues:* ${formatNumber(openIssues)}\n` +
                             `│ 🔀 *Open PRs:* ${formatNumber(openPulls)}\n` +
                             `│ 📦 *Releases:* ${formatNumber(repoData.releases_count || 0)}\n` +
                             `│ 👥 *Contributors:* ${formatNumber(repoData.contributors_count || contributors.length)}\n` +
                             `╰═══════════════════╯\n\n` +
                             `╭══━ ★DETAILS★ ━══╮\n` +
                             `│ 📅 *Created:* ${createdAt}\n` +
                             `│ 🔄 *Last Updated:* ${lastUpdated}\n` +
                             `│ 📊 *Default Branch:* ${repoData.default_branch}\n` +
                             `│ 📜 *License:* ${repoData.license?.name || 'Not specified'}\n` +
                             `│ 📏 *Size:* ${(repoData.size / 1024).toFixed(2)} MB\n` +
                             `│ 🌐 *Language:* ${repoData.language || 'Multiple'}\n` +
                             `╰═══════════════════╯\n\n` +
                             `╭══━ ★TOP CONTRIBUTORS★ ━══╮\n` +
                             (contributors.length > 0 ? 
                                 contributors.map((c, i) => `│ ${i+1}. @${c}`).join('\n') : 
                                 '│ No contributors data available') + '\n' +
                             `╰═══════════════════╯\n\n` +
                             `🔗 *Repository Link:*\n${repoData.html_url}\n\n` +
                             `📢 *Don't forget to Star ⭐ & Fork 🍴 the repo!*\n\n` +
                             `> *Clone with:*\n` +
                             `> \`\`\`git clone ${repoData.clone_url}\`\`\`\n\n` +
                             `> *Homepage:* ${repoData.homepage || 'Not available'}\n\n` +
                             `╰══━ ★GURU-MD BOT★ ━══╯\n` +
                             `> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ GuruTech\n` +
                             `> ${new Date().toLocaleDateString()}`;

        // Send image with caption - using a more reliable image URL
        const imageUrl = "https://files.catbox.moe/ntfw9h.jpg";
        
        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: formattedInfo,
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "📂 GURU-MD Repository",
                    body: `⭐ ${formatNumber(repoData.stargazers_count)} Stars | 🍴 ${formatNumber(repoData.forks_count)} Forks`,
                    thumbnailUrl: imageUrl,
                    sourceUrl: repoData.html_url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

        // Optionally send a voice note (commented out - uncomment if you have audio)
        /*
        try {
            await conn.sendMessage(from, {
                audio: { url: 'https://files.catbox.moe/your-audio-file.m4a' },
                mimetype: 'audio/mp4',
                ptt: true,
                contextInfo: { 
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: mek });
        } catch (audioErr) {
            console.log("Audio not available:", audioErr.message);
        }
        */

    } catch (error) {
        console.error("Repo command error:", error);
        
        let errorMessage = "❌ Sorry, couldn't fetch repository info.\n\n";
        
        if (error.message.includes("rate limit")) {
            errorMessage += "GitHub API rate limit exceeded.\n";
            errorMessage += "Please try again in about an hour.";
        } else if (error.message.includes("not found")) {
            errorMessage += "Repository not found or is private.\n";
            errorMessage += "Please check the repository URL.";
        } else if (error.code === 'FETCH_ERROR' || error.message.includes('network')) {
            errorMessage += "Network error. Check your internet connection.\n";
            errorMessage += "Make sure GitHub is accessible.";
        } else {
            errorMessage += error.message || "Unknown error occurred.";
        }
        
        errorMessage += "\n\nYou can still visit:\n";
        errorMessage += "> " + githubRepoURL;
        
        await reply(errorMessage);
        
        // Send a fallback message with just the URL
        await conn.sendMessage(from, {
            text: `📂 *GURU-MD Repository*\n\n🔗 ${githubRepoURL}\n\n⭐ Please star the repo to show support!`,
            contextInfo: {
                externalAdReply: {
                    title: "GURU-MD on GitHub",
                    body: "Click to view repository",
                    thumbnailUrl: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
                    sourceUrl: githubRepoURL,
                    mediaType: 1
                }
            }
        }, { quoted: mek });
    }
});

// Add a separate command for quick stats
cmd({
    pattern: "stats",
    alias: ["gitstats", "repostats"],
    react: "📊",
    desc: "Show quick repository statistics",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
    const githubRepoURL = 'https://github.com/itsguruu/GURUH';
    
    try {
        const match = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
        const [, username, repoName] = match;
        
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
            headers: { 'User-Agent': 'GURU-MD-Bot/1.0' }
        });
        
        if (!response.ok) throw new Error("Failed to fetch");
        
        const data = await response.json();
        
        const statsMsg = `📊 *GURU-MD GitHub Stats*\n\n` +
                        `⭐ *Stars:* ${data.stargazers_count}\n` +
                        `🍴 *Forks:* ${data.forks_count}\n` +
                        `👀 *Watchers:* ${data.watchers_count}\n` +
                        `🐛 *Issues:* ${data.open_issues_count}\n\n` +
                        `🔗 ${data.html_url}`;
        
        await reply(statsMsg);
        
    } catch (error) {
        reply("❌ Could not fetch stats right now.");
    }
});
