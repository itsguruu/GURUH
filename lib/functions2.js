const fs = require('fs');
const axios = require('axios');
const path = './config.env';
const FormData = require("form-data");
const { config } = require('../config'); // optional: if you have config.js

// ────────────────────────────────────────────────
// 1. Upload file to Empire CDN (safe + timeout + better error)
async function empiretourl(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const form = new FormData();
  const fileStream = fs.createReadStream(filePath);
  form.append("file", fileStream);

  const originalFileName = filePath.split(/[\\/]/).pop(); // cross-platform safe
  form.append("originalFileName", originalFileName);

  try {
    const response = await axios.post(
      "https://cdn.empiretech.biz.id/api/upload.php",
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 60000, // 60 seconds timeout (prevents hanging forever)
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    if (!response.data || !response.data.status) {
      throw new Error(`Upload failed: ${JSON.stringify(response.data)}`);
    }

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timed out after 60 seconds');
    }
    if (error.response) {
      throw new Error(`API Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    }
    if (error.request) {
      throw new Error('No response from server – check network or API status');
    }
    throw new Error(`Upload request failed: ${error.message}`);
  }
}

// ────────────────────────────────────────────────
// 2. Fetch buffer from URL (added timeout + better headers)
const getBuffer = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'GET',
      url,
      responseType: 'arraybuffer',
      timeout: 30000, // 30 seconds timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        ...options.headers,
      },
      ...options,
    });
    return res.data;
  } catch (e) {
    console.error(`getBuffer failed for ${url}:`, e.message);
    return null;
  }
};

// ────────────────────────────────────────────────
// 3. Get group admins (unchanged but added safety)
const getGroupAdmins = (participants = []) => {
  return (participants || [])
    .filter(p => p.admin !== null)
    .map(p => p.id);
};

// ────────────────────────────────────────────────
// 4. Random string with extension (more readable)
const getRandom = (ext = '') => {
  return `\( {Math.floor(Math.random() * 1000000)} \){ext ? `.${ext}` : ''}`;
};

// ────────────────────────────────────────────────
// 5. Human-readable large numbers (K, M, B, T)
const h2k = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  if (num < 1000) return num.toString();

  const units = ['', 'K', 'M', 'B', 'T', 'P', 'E'];
  const exp = Math.floor(Math.log10(Math.abs(num)) / 3);
  const scaled = (num / Math.pow(10, exp * 3)).toFixed(1).replace(/\.0$/, '');
  return scaled + (units[exp] || '');
};

// ────────────────────────────────────────────────
// 6. URL validation (more strict and modern)
const isUrl = (str) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

// ────────────────────────────────────────────────
// 7. Pretty JSON (unchanged)
const Json = (data) => JSON.stringify(data, null, 2);

// ────────────────────────────────────────────────
// 8. Runtime formatter (more compact & readable)
const runtime = (seconds = 0) => {
  seconds = Math.floor(seconds);
  const d = Math.floor(seconds / 86400); seconds %= 86400;
  const h = Math.floor(seconds / 3600);  seconds %= 3600;
  const m = Math.floor(seconds / 60);   seconds %= 60;
  const s = seconds;

  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || parts.length === 0) parts.push(`${s}s`);

  return parts.join(' ');
};

// ────────────────────────────────────────────────
// 9. Sleep (unchanged but added type check)
const sleep = (ms) => {
  if (typeof ms !== 'number' || ms < 0) return Promise.resolve();
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ────────────────────────────────────────────────
// 10. Fetch JSON (added timeout + better error)
const fetchJson = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'GET',
      url,
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...options.headers,
      },
      ...options,
    });
    return res.data;
  } catch (err) {
    console.error(`fetchJson failed: ${url}`, err.message);
    return null;
  }
};

// ────────────────────────────────────────────────
// 11. Save config to .env (safer + atomic write)
const saveConfig = (key, value) => {
  try {
    let lines = fs.existsSync(path) ? fs.readFileSync(path, 'utf-8').split('\n') : [];
    let updated = false;

    lines = lines.map(line => {
      if (line.trim().startsWith(`${key}=`)) {
        updated = true;
        return `\( {key}= \){value}`;
      }
      return line;
    });

    if (!updated) {
      lines.push(`\( {key}= \){value}`);
    }

    // Atomic write: write to temp file first
    const tempPath = path + '.tmp';
    fs.writeFileSync(tempPath, lines.join('\n') + '\n', 'utf-8');
    fs.renameSync(tempPath, path); // atomic move

    // Reload dotenv
    require('dotenv').config({ path, override: true });
  } catch (err) {
    console.error('saveConfig failed:', err.message);
  }
};

module.exports = {
  empiretourl,
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson,
  saveConfig
};
