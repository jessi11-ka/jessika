// ============================================================================
// 🔑 TEMPAT MEMASUKKAN SUPABASE API KEYS & URL
// ============================================================================
// Petunjuk:
// 1. Buka https://supabase.com/dashboard -> Pilih Project Anda
// 2. Klik menu Project Settings (ikon gerigi di kiri bawah) -> API
// 3. Salin dan tempel (paste) ke dalam tanda petik di bawah ini:

// ============================================================================
// 🔑 KONFIGURASI SUPABASE (Mendukung Vercel, .env, & Fallback Lokal)
// ============================================================================
let SUPABASE_URL = (typeof window !== 'undefined' && window.ENV && window.ENV.SUPABASE_URL) || '';
let SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.ENV && window.ENV.SUPABASE_ANON_KEY) || '';
let SUPABASE_TABLE_NAME = (typeof window !== 'undefined' && window.ENV && window.ENV.SUPABASE_TABLE_NAME) || 'leaderboard';

let supabaseClient = null;
let hasCheckedEnv = false;

/**
 * Helper untuk parsing teks format .env (KEY=VALUE)
 */
function parseEnvText(text) {
  const result = {};
  if (!text) return result;
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        result[key] = val;
      }
    }
  }
  return result;
}

/**
 * Otomatis menghubungkan konfigurasi dari file .env (Live Server / Lokal)
 * atau dari Vercel Serverless Function (/api/env) jika dideploy ke Vercel.
 */
async function syncEnvConfig() {
  if (hasCheckedEnv) return;
  hasCheckedEnv = true;

  if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
    // 1. Coba baca file .env secara langsung (Sangat cocok saat klik 'Go Live' di VS Code!)
    try {
      const resEnv = await fetch('.env');
      if (resEnv.ok) {
        const text = await resEnv.text();
        const parsed = parseEnvText(text);
        if (parsed.SUPABASE_URL && parsed.SUPABASE_ANON_KEY) {
          SUPABASE_URL = parsed.SUPABASE_URL;
          SUPABASE_ANON_KEY = parsed.SUPABASE_ANON_KEY;
          if (parsed.SUPABASE_TABLE_NAME) SUPABASE_TABLE_NAME = parsed.SUPABASE_TABLE_NAME;

          if (window.supabase && window.supabase.createClient) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('⚡ Berhasil membaca dan terhubung langsung dari file .env!');
          }
          return;
        }
      }
    } catch (_) {}

    // 2. Coba endpoint Vercel /api/env (Saat berjalan di Vercel)
    try {
      const res = await fetch('/api/env');
      if (res.ok) {
        const config = await res.json();
        if (config.SUPABASE_URL && config.SUPABASE_ANON_KEY) {
          SUPABASE_URL = config.SUPABASE_URL;
          SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY;
          if (config.SUPABASE_TABLE_NAME) SUPABASE_TABLE_NAME = config.SUPABASE_TABLE_NAME;

          if (window.supabase && window.supabase.createClient) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('🚀 Berhasil memuat Supabase dari Vercel Environment Variables!');
          }
          return;
        }
      }
    } catch (_) {}
  }
}

// Inisialisasi awal saat script dimuat
if (typeof window !== 'undefined') {
  syncEnvConfig();
}

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const isConfigured = 
    SUPABASE_URL && 
    SUPABASE_URL.trim() !== '' && 
    !SUPABASE_URL.includes('MASUKKAN_SUPABASE_URL') &&
    SUPABASE_ANON_KEY && 
    SUPABASE_ANON_KEY.trim() !== '' && 
    !SUPABASE_ANON_KEY.includes('MASUKKAN_ANON_KEY');

  if (isConfigured) {
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
      try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return supabaseClient;
      } catch (err) {
        console.error('❌ Gagal menginisialisasi Supabase Client:', err);
      }
    }
  }

  // Fallback jika sudah diinisialisasi di supabase.js
  if (typeof window !== 'undefined' && window.supabaseClient) {
    return window.supabaseClient;
  }

  return null;
}

/**
 * Leaderboard System - LocalStorage & Supabase Manager
 * Menyimpan data skor pemain secara persisten.
 * Mendukung online (Supabase) dan offline fallback (LocalStorage).
 */
class LeaderboardManager {
  constructor() {
    this.storageKey = 'monkey_banana_shooter_scores_v1';
    this.tableName = SUPABASE_TABLE_NAME;
    this.defaultScores = [
      { name: 'Raja Monyet', score: 5800, wave: 6, accuracy: 88, date: '2026-11-01' },
      { name: 'Wukong Sakti', score: 4200, wave: 5, accuracy: 82, date: '2026-11-03' },
      { name: 'George Pintar', score: 3100, wave: 4, accuracy: 76, date: '2026-11-05' },
      { name: 'Tarzan Rimba', score: 2050, wave: 3, accuracy: 70, date: '2026-11-07' },
      { name: 'Chimp Pemula', score: 950, wave: 2, accuracy: 65, date: '2026-11-09' }
    ];
  }

  /**
   * Cek apakah Supabase aktif dan siap digunakan
   */
  isSupabaseReady() {
    return getSupabaseClient() !== null;
  }

  /**
   * Mengambil data skor lokal dari LocalStorage
   */
  getLocalScores() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.defaultScores));
        return this.defaultScores;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn('Gagal membaca LocalStorage:', e);
      return this.defaultScores;
    }
  }

  /**
   * Menyimpan data skor ke LocalStorage
   */
  saveLocalScore(name, score, wave, accuracy) {
    if (!name || name.trim() === '') name = 'Monyet Misterius';
    name = name.trim().slice(0, 14);

    const scores = this.getLocalScores();
    const today = new Date().toISOString().split('T')[0];

    scores.push({
      name: name,
      score: Math.floor(score),
      wave: wave,
      accuracy: Math.floor(accuracy),
      date: today
    });

    // Urutkan dari skor tertinggi
    scores.sort((a, b) => b.score - a.score);

    // Ambil top 15
    const topScores = scores.slice(0, 15);

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(topScores));
    } catch (e) {
      console.warn('Gagal menyimpan ke LocalStorage:', e);
    }

    return topScores;
  }

  /**
   * Mengambil skor: Prioritas ke Supabase, fallback ke LocalStorage jika offline/belum disetting
   */
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
            name: item.name,
            score: item.score,
            wave: item.wave,
            accuracy: item.accuracy,
            date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
          }));

          // Simpan ke LocalStorage sebagai cadangan cache
          try {
            localStorage.setItem(this.storageKey, JSON.stringify(formatted));
          } catch (_) {}

          return formatted;
        } else if (error) {
          console.warn('⚠️ Gagal mengambil data dari Supabase:', error.message);
        }
      } catch (err) {
        console.warn('⚠️ Terjadi kendala koneksi ke Supabase, beralih ke data lokal:', err.message);
      }
    }

    return this.getLocalScores();
  }

  /**
   * Menyimpan skor: Kirim ke Supabase dan backup ke LocalStorage
   */
  async saveScore(name, score, wave, accuracy) {
    await syncEnvConfig();
    // 1. Simpan ke local storage
    const localTopScores = this.saveLocalScore(name, score, wave, accuracy);

    // 2. Jika Supabase aktif, kirim ke database online
    const client = getSupabaseClient();
    if (client) {
      try {
        const newRecord = {
          name: name ? name.trim().slice(0, 14) : 'Monyet Misterius',
          score: Math.floor(score),
          wave: Number(wave) || 1,
          accuracy: Math.floor(accuracy) || 0
        };

        const { error } = await client
          .from(this.tableName)
          .insert([newRecord]);

        if (error) {
          console.warn('⚠️ Gagal menyimpan skor ke Supabase:', error.message);
        } else {
          console.log('✅ Skor berhasil disimpan ke Supabase:', newRecord);
        }
      } catch (err) {
        console.warn('⚠️ Gagal mengirim skor ke Supabase:', err.message);
      }
    }

    return localTopScores;
  }

  async getHighestScore() {
    const scores = await this.getScores();
    return scores.length > 0 ? scores[0].score : 0;
  }

  /**
   * Render data leaderboard ke elemen <tbody> HTML
   */
  async renderToTable(tbodyElement) {
    if (!tbodyElement) return;

    tbodyElement.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 15px; color:#ffe082;">⏳ Memuat leaderboard...</td></tr>`;

    const scores = await this.getScores();
    tbodyElement.innerHTML = '';

    if (!scores || scores.length === 0) {
      tbodyElement.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color:#81c784;">Belum ada skor tercatat. Mulai main sekarang!</td></tr>`;
      return;
    }

    scores.forEach((item, index) => {
      const tr = document.createElement('tr');

      let rankDisplay = `#${index + 1}`;
      let rankClass = '';
      if (index === 0) {
        rankDisplay = '🥇 1';
        rankClass = 'rank-gold';
      } else if (index === 1) {
        rankDisplay = '🥈 2';
        rankClass = 'rank-silver';
      } else if (index === 2) {
        rankDisplay = '🥉 3';
        rankClass = 'rank-bronze';
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

  clearLeaderboard() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.warn(e);
    }
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
  }
}

// Inisialisasi instance global
const leaderboardManager = new LeaderboardManager();
window.leaderboardManager = leaderboardManager;
