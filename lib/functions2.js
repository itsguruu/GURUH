const fs = require('fs');
const axios = require('axios');
const path = './config.env';
const FormData = require("form-data");

// ────────────────────────────────────────────────
// Upload file to Rebix CDN (new API) - safe + timeout + better error
async function empiretourl(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const form = new FormData();
  const fileStream = fs.createReadStream(filePath);
  form.append("file", fileStream);

  const originalFileName = filePath.split(/[\\/]/).pop(); // safe for Windows/Linux
  form.append("originalFileName", originalFileName);

  try {
    const response = await axios.post(
      "https://api-rebix.zone.id/api/upload",  // ← your new Rebix upload endpoint
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 60000, // 60s timeout
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
      throw new Error('No response from Rebix server – check network/API status');
    }
    throw new Error(`Upload request failed: ${error.message}`);
  }
}

// ────────────────────────────────────────────────
// Fetch buffer from URL (timeout + modern headers)
const getBuffer = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'GET',
      url,
      responseType: 'arraybuffer',
      timeout: 30000, // 30s timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        ...options.headers,
      },
      ...options,
    });
    return res.data;
  } catch (e) {
    console.error(`getBuffer failed: ${url}`, e.message);
    return null;
  }
};

// ────────────────────────────────────────────────
// Get group admins (safe)
const getGroupAdmins = (participants = []) => {
  return participants
    .filter(p => p?.admin !== null)
    .map(p => p.id);
};

// ────────────────────────────────────────────────
// Random filename with extension (FIXED - no backslash typo)
const getRandom = (ext = '') => {
  return `\( {Math.floor(Math.random() * 1000000)} \){ext ? `.${ext}` : ''}`;
};

// ────────────────────────────────────────────────
// Human-readable large numbers (K, M, B, T)
const h2k = (num) => {
  if (typeof num !== 'number' || isNaN(num) || num < 1000) return num.toString();

  const units = ['', 'K', 'M', 'B', 'T', 'P', 'E'];
  const exp = Math.floor(Math.log10(Math.abs(num)) / 3);
  const scaled = (num / Math.pow(10, exp * 3)).toFixed(1).replace(/\.0$/, '');
  return scaled + units[exp];
};

// ────────────────────────────────────────────────
// Strict URL validation
const isUrl = (str) => {
  if (typeof str !== 'string') return false;
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

// ────────────────────────────────────────────────
// Pretty-print JSON
const Json = (data) => {
  return JSON.stringify(data, null, 2);
};

// ────────────────────────────────────────────────
// Runtime formatter (compact & accurate)
const runtime = (seconds = 0) => {
  seconds = Math.floor(Number(seconds));
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
// Sleep utility
const sleep = async (ms) => {
  if (typeof ms !== 'number' || ms < 0) return;
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ────────────────────────────────────────────────
// Fetch JSON (timeout + headers)
const fetchJson = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'GET',
      url,
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
// Save config to .env (atomic + safe)
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

    if (!updated) lines.push(`\( {key}= \){value}`);

    const tempPath = path + '.tmp';
    fs.writeFileSync(tempPath, lines.join('\n') + '\n', 'utf-8');
    fs.renameSync(tempPath, path); // atomic move

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
