const axios = require('axios');

// ────────────────────────────────────────────────
// Fetch buffer from URL (with timeout + better error handling)
const getBuffer = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'GET',
      url,
      responseType: 'arraybuffer',
      timeout: 30000, // 30 seconds max — prevents bot freeze
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'DNT': 1,
        'Upgrade-Insecure-Requests': 1,
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
// Get group admins (safe + clean)
const getGroupAdmins = (participants = []) => {
  return participants
    .filter(p => p?.admin !== null)
    .map(p => p.id);
};

// ────────────────────────────────────────────────
// Random filename with extension (FIXED - no syntax error)
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
// Fetch JSON (with timeout + better error)
const fetchJson = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'GET',
      url,
      timeout: 20000, // 20 seconds timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...options.headers,
      },
      ...options,
    });
    return res.data;
  } catch (err) {
    console.error(`fetchJson failed for ${url}:`, err.message);
    return null;
  }
};

module.exports = {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson
};
