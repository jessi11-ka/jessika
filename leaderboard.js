/**
 * leaderboard.js
 * Leaderboard & Account System — LocalStorage + Supabase Manager
 * Konsep: Prioritas Supabase (online), fallback ke LocalStorage (offline).
 * Mendukung: Live Server lokal, Vercel deployment, Sistem Akun & Upgrade.
 */

// ============================================================================
// KONFIGURASI SUPABASE
// Dibaca dari: window.ENV (env.js) → /api/env (Vercel) → fallback kosong
// ============================================================================
let SUPABASE_URL      = (window.ENV && window.ENV.SUPABASE_URL)      || '';
let SUPABASE_ANON_KEY = (window.ENV && window.ENV.SUPABASE_ANON_KEY) || '';
let SUPABASE_TABLE    = (window.ENV && window.ENV.SUPABASE_TABLE_NAME) || 'leaderboard';

let supabaseClient = null;
let _envSynced     = false;

function _parseEnvText(text) {
  const result = {};
  if (!text) return result;
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val   = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

function _initClient(url, key) {
  if (!url || !key) return null;
  if (!window.supabase || !window.supabase.createClient) return null;
  try {
    return window.supabase.createClient(url, key);
  } catch (err) {
    console.error('❌ Gagal inisialisasi Supabase client:', err);
    return null;
  }
}

async function syncEnvConfig() {
  if (_envSynced) return;
  _envSynced = true;

  if (typeof window === 'undefined' || !window.location.protocol.startsWith('http')) return;

  try {
    const res = await fetch('.env');
    if (res.ok) {
      const parsed = _parseEnvText(await res.text());
      if (parsed.SUPABASE_URL && parsed.SUPABASE_ANON_KEY) {
        SUPABASE_URL      = parsed.SUPABASE_URL;
        SUPABASE_ANON_KEY = parsed.SUPABASE_ANON_KEY;
        if (parsed.SUPABASE_TABLE_NAME) SUPABASE_TABLE = parsed.SUPABASE_TABLE_NAME;
        supabaseClient = _initClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        if (supabaseClient) {
          console.log('⚡ Supabase terhubung via file .env (Live Server)');
          return;
        }
      }
    }
  } catch (_) {}

  try {
    const res = await fetch('/api/env');
    if (res.ok) {
      const cfg = await res.json();
      if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
        SUPABASE_URL      = cfg.SUPABASE_URL;
        SUPABASE_ANON_KEY = cfg.SUPABASE_ANON_KEY;
        if (cfg.SUPABASE_TABLE_NAME) SUPABASE_TABLE = cfg.SUPABASE_TABLE_NAME;
        supabaseClient = _initClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        if (supabaseClient) {
          console.log('🚀 Supabase terhubung via Vercel /api/env');
          return;
        }
      }
    }
  } catch (_) {}

  console.warn('⚠️ Supabase tidak terkonfigurasi. Berjalan dalam mode offline (LocalStorage).');
}

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseClient = _initClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

syncEnvConfig();

// ============================================================================
// ACCOUNT & PROGRESS MANAGER (Akun, Poin, Gems, Upgrade, Skins)
// ============================================================================
class AccountManager {
  constructor() {
    this.storageKey = 'monkey_banana_accounts_v2';
    this.currentKey = 'monkey_banana_active_session_v2';
    this.currentUser = null;

    // Load active session jika ada
    this._loadSession();
  }

  _getAllAccounts() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (_) {
      return {};
    }
  }

  _saveAllAccounts(accs) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(accs));
    } catch (_) {}
  }

  _loadSession() {
    try {
      const session = localStorage.getItem(this.currentKey);
      if (session) {
        const parsed = JSON.parse(session);
        const accounts = this._getAllAccounts();
        if (accounts[parsed.username]) {
          this.currentUser = accounts[parsed.username];
          this.checkSkinUnlocks();
        } else if (parsed.isGuest) {
          this.currentUser = parsed;
        }
      }
    } catch (_) {}
  }

  getCurrentUser() {
    return this.currentUser;
  }

  login(username, isGuest = false) {
    const cleanName = (username || '').trim() || (isGuest ? 'Tamu Rimba' : 'Monyet Jagoan');
    const accounts = this._getAllAccounts();

    if (isGuest) {
      this.currentUser = {
        username: cleanName,
        isGuest: true,
        totalScore: 0,
        highScore: 0,
        gems: 10,
        weaponLevel: 1,
        equippedSkin: 'classic',
        unlockedSkins: ['classic']
      };
    } else {
      if (!accounts[cleanName]) {
        // Buat akun baru
        accounts[cleanName] = {
          username: cleanName,
          isGuest: false,
          totalScore: 0,
          highScore: 0,
          gems: 25, // bonus awal
          weaponLevel: 1,
          equippedSkin: 'classic',
          unlockedSkins: ['classic']
        };
        this._saveAllAccounts(accounts);
      }
      this.currentUser = accounts[cleanName];
    }

    try {
      localStorage.setItem(this.currentKey, JSON.stringify(this.currentUser));
    } catch (_) {}

    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    try {
      localStorage.removeItem(this.currentKey);
    } catch (_) {}
  }

  // Simpan hasil permainan (Poin akumulasi, Highscore, Gems)
  addGameResult(score, gems) {
    if (!this.currentUser) return;

    this.currentUser.totalScore = (this.currentUser.totalScore || 0) + score;
    this.currentUser.highScore = Math.max(this.currentUser.highScore || 0, score);
    this.currentUser.gems = (this.currentUser.gems || 0) + gems;

    this._persistCurrent();
  }

  // Beli Skin dengan Gems (Sesuai Permintaan: Hanya bisa dibuka dengan dibeli!)
  buySkin(skinId, cost) {
    if (!this.currentUser) return { success: false, msg: 'Silakan login terlebih dahulu!' };
    if (!this.currentUser.unlockedSkins) this.currentUser.unlockedSkins = ['classic'];
    
    if (this.currentUser.unlockedSkins.includes(skinId)) {
      this.currentUser.equippedSkin = skinId;
      this._persistCurrent();
      return { success: true, msg: 'Kostum sudah dimiliki dan langsung dipakai!' };
    }

    if ((this.currentUser.gems || 0) < cost) {
      return { success: false, msg: `Gems tidak cukup! Butuh 💎 ${cost} Gems (Kamu punya ${this.currentUser.gems || 0} Gems).` };
    }

    this.currentUser.gems -= cost;
    this.currentUser.unlockedSkins.push(skinId);
    this.currentUser.equippedSkin = skinId;
    this._persistCurrent();
    return { success: true, msg: '🎉 Kostum berhasil dibeli dan langsung dipakai!' };
  }

  equipSkin(skinId) {
    if (!this.currentUser) return false;
    if (!this.currentUser.unlockedSkins) this.currentUser.unlockedSkins = ['classic'];
    if (this.currentUser.unlockedSkins.includes(skinId)) {
      this.currentUser.equippedSkin = skinId;
      this._persistCurrent();
      return true;
    }
    return false;
  }

  // Biaya upgrade senjata: Lv2: 15 gems, Lv3: 35 gems, Lv4: 65 gems, Lv5: 110 gems
  getUpgradeCost() {
    const lv = (this.currentUser && this.currentUser.weaponLevel) || 1;
    const costs = [0, 15, 35, 65, 110];
    return costs[lv] || null;
  }

  upgradeWeapon() {
    if (!this.currentUser) return false;
    const cost = this.getUpgradeCost();
    if (cost === null) return false; // Sudah MAX

    if (this.currentUser.gems >= cost) {
      this.currentUser.gems -= cost;
      this.currentUser.weaponLevel = (this.currentUser.weaponLevel || 1) + 1;
      this._persistCurrent();
      return true;
    }
    return false;
  }

  _persistCurrent() {
    if (!this.currentUser) return;
    if (!this.currentUser.isGuest) {
      const accounts = this._getAllAccounts();
      accounts[this.currentUser.username] = this.currentUser;
      this._saveAllAccounts(accounts);
    }
    try {
      localStorage.setItem(this.currentKey, JSON.stringify(this.currentUser));
    } catch (_) {}
  }
}

// ============================================================================
// LEADERBOARD MANAGER
// ============================================================================
class LeaderboardManager {
  constructor() {
    this.storageKey    = 'monkey_banana_shooter_scores_v1';
    this.tableName     = SUPABASE_TABLE;
    this.defaultScores = [
      { name: 'Raja Monyet',  score: 5800, wave: 6, accuracy: 88, date: '2026-11-01' },
      { name: 'Wukong Sakti', score: 4200, wave: 5, accuracy: 82, date: '2026-11-03' },
      { name: 'George Pintar',score: 3100, wave: 4, accuracy: 76, date: '2026-11-05' },
      { name: 'Tarzan Rimba', score: 2050, wave: 3, accuracy: 70, date: '2026-11-07' },
      { name: 'Chimp Pemula', score: 950,  wave: 2, accuracy: 65, date: '2026-11-09' }
    ];
  }

  isSupabaseReady() {
    return getSupabaseClient() !== null;
  }

  _getLocalScores() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.defaultScores));
        return this.defaultScores;
      }
      return JSON.parse(data);
    } catch (e) {
      return this.defaultScores;
    }
  }

  _saveLocalScore(name, score, wave, accuracy) {
    if (!name || name.trim() === '') name = 'Monyet Misterius';
    name = name.trim().slice(0, 14);

    const scores = this._getLocalScores();
    const today  = new Date().toISOString().split('T')[0];

    scores.push({
      name,
      score: Math.floor(score),
      wave,
      accuracy: Math.floor(accuracy),
      date: today
    });

    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 15);

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(topScores));
    } catch (_) {}

    return topScores;
  }

  async getScores() {
    await syncEnvConfig();
    const client = getSupabaseClient();

    if (client) {
      try {
        const { data, error } = await client
          .from(this.tableName)
          .select('name, score, wave, accuracy, created_at')
          .order('score', { ascending: false })
          .limit(15);

        if (!error && data && data.length > 0) {
          const formatted = data.map(item => ({
            name    : item.name,
            score   : item.score,
            wave    : item.wave,
            accuracy: item.accuracy,
            date    : item.created_at
                        ? item.created_at.split('T')[0]
                        : new Date().toISOString().split('T')[0]
          }));

          try { localStorage.setItem(this.storageKey, JSON.stringify(formatted)); } catch (_) {}
          return formatted;
        }
      } catch (_) {}
    }

    return this._getLocalScores();
  }

  async saveScore(name, score, wave, accuracy) {
    await syncEnvConfig();
    const localTopScores = this._saveLocalScore(name, score, wave, accuracy);

    const client = getSupabaseClient();
    if (client) {
      try {
        const record = {
          name    : name ? name.trim().slice(0, 14) : 'Monyet Misterius',
          score   : Math.floor(score),
          wave    : Number(wave)     || 1,
          accuracy: Math.floor(accuracy) || 0
        };
        await client.from(this.tableName).insert([record]);
      } catch (_) {}
    }

    return localTopScores;
  }

  async renderToTable(tbodyElement) {
    if (!tbodyElement) return;

    tbodyElement.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:15px; color:#ffe082;">⏳ Memuat leaderboard...</td></tr>`;

    const scores = await this.getScores();
    tbodyElement.innerHTML = '';

    if (scores.length === 0) {
      tbodyElement.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color:#81c784;">Belum ada skor tercatat. Mulai main sekarang!</td></tr>`;
      return;
    }

    scores.forEach((item, index) => {
      const tr = document.createElement('tr');
      let rankDisplay = `#${index + 1}`;
      let rankClass   = '';
      if (index === 0) {
        rankDisplay = '🥇 1';
        rankClass   = 'rank-gold';
      } else if (index === 1) {
        rankDisplay = '🥈 2';
        rankClass   = 'rank-silver';
      } else if (index === 2) {
        rankDisplay = '🥉 3';
        rankClass   = 'rank-bronze';
      }

      tr.innerHTML = `
        <td class="${rankClass}">${rankDisplay}</td>
        <td><strong>${this.escapeHtml(item.name)}</strong></td>
        <td style="color:#ffeb3b; font-weight:800;">${Number(item.score).toLocaleString('id-ID')}</td>
        <td>W-${item.wave}</td>
        <td>${item.accuracy}%</td>
      `;

      tbodyElement.appendChild(tr);
    });
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
  }
}

// Inisialisasi global
window.accountManager = new AccountManager();
window.leaderboardManager = new LeaderboardManager();
