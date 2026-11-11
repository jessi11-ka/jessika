/**
 * env.js - Konfigurasi Supabase untuk browser
 * Key diambil otomatis dari Vercel Environment Variables via /api/env
 * Untuk lokal: diisi dari file .env secara otomatis oleh monyet.js
 */
window.ENV = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  SUPABASE_TABLE_NAME: 'leaderboard'
};
