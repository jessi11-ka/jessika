/**
 * env.js
 * Konfigurasi Supabase untuk browser.
 * Di Vercel, nilai otomatis diambil via /api/env dari Environment Variables Vercel.
 * Di Local Live Server, otomatis membaca file .env.
 */
window.ENV = window.ENV || {
  SUPABASE_URL      : '',
  SUPABASE_ANON_KEY : '',
  SUPABASE_TABLE_NAME: 'leaderboard'
};
