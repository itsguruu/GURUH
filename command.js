var commands = [];

function cmd(info, func) {
    var data = info;
    data.function = func;
    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!info.desc) info.desc = '';
    if (!data.fromMe) data.fromMe = false;
    if (!info.category) data.category = 'misc';
    if(!info.filename) data.filename = "Not Provided";
    commands.push(data);
    return data;
}

// ──────────────── AUTO-LOAD PLUGINS FROM ./plugins/ ────────────────
const fs = require('fs');
const path = require('path');

function loadPlugins() {
    const pluginsDir = path.join(__dirname, 'plugins');

    if (!fs.existsSync(pluginsDir)) {
        console.log('[COMMAND] Plugins folder not found!');
        return;
    }

    fs.readdirSync(pluginsDir).forEach(file => {
        if (path.extname(file).toLowerCase() === '.js') {
            try {
                const pluginPath = path.join(pluginsDir, file);
                const plugin = require(pluginPath);

                // 1. Old style: plugin uses cmd() and exports nothing → already pushed via cmd()
                // 2. New style: plugin exports { pattern, function, ... }
                if (plugin.pattern && typeof plugin.function === 'function') {
                    // Make it compatible with your cmd structure
                    const data = {
                        pattern: plugin.pattern,
                        desc: plugin.desc || '',
                        category: plugin.category || 'misc',
                        react: plugin.react || '',
                        filename: plugin.filename || file,
                        function: plugin.function,
                        dontAddCommandList: plugin.dontAddCommandList || false,
                        fromMe: plugin.fromMe || false
                    };
                    commands.push(data);
                    console.log(`[COMMAND] Loaded new-style plugin: ${file} → ${plugin.pattern}`);
                } else if (!plugin.pattern) {
                    console.log(`[COMMAND] Skipped ${file} — no pattern defined`);
                }

            } catch (err) {
                console.error(`[COMMAND] Failed to load plugin ${file}: ${err.message}`);
            }
        }
    });

    console.log(`[COMMAND] Total commands loaded: ${commands.length}`);
}

// Automatically load plugins when this file is required
loadPlugins();

module.exports = {
    cmd,
    AddCommand: cmd,
    Function: cmd,
    Module: cmd,
    commands,
};
