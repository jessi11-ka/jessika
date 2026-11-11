/**
 * supabase.js
 * Modul Komunikasi Supabase untuk Monkey Banana Shooter
 */

const SUPABASE_URL = (typeof window !== 'undefined' && window.ENV && window.ENV.SUPABASE_URL) || '';
const SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.ENV && window.ENV.SUPABASE_ANON_KEY) || '';
const SUPABASE_TABLE = (typeof window !== 'undefined' && window.ENV && window.ENV.SUPABASE_TABLE_NAME) || 'leaderboard';

// Inisialisasi client Supabase
let supabase = null;

if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
  if (SUPABASE_URL && !SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Berhasil terhubung dengan Supabase!');
    } catch (err) {
      console.error('❌ Gagal menginisialisasi Supabase client:', err);
    }
  }
}

/**
 * Service Komunikasi Data Leaderboard ke Supabase
 */
const SupabaseService = {
  isReady() {
    return supabase !== null;
  },

  async getLeaderboard(limit = 15) {
    if (!this.isReady()) {
      throw new Error('Supabase belum siap');
    }

    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .select('name, score, wave, accuracy, created_at')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error Supabase getLeaderboard:', error.message);
      throw error;
    }

    return (data || []).map(item => ({
      name: item.name,
      score: item.score,
      wave: item.wave,
      accuracy: item.accuracy,
      date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
    }));
  },

  async addScore(name, score, wave, accuracy) {
    if (!this.isReady()) {
      throw new Error('Supabase belum siap');
    }

    const newRecord = {
      name: name ? name.trim().slice(0, 14) : 'Monyet Misterius',
      score: Math.floor(score),
      wave: Number(wave) || 1,
      accuracy: Math.floor(accuracy) || 0
    };

    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .insert([newRecord])
      .select();

    if (error) {
      console.error('❌ Error Supabase addScore:', error.message);
      throw error;
    }

    console.log('✅ Skor berhasil disimpan ke Supabase:', data);
    return data;
  }
};

window.SupabaseService = SupabaseService;
window.supabaseClient = supabase;
