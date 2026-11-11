/**
 * api/env.js
 * Vercel Serverless Function
 * Menyediakan konfigurasi Supabase dari Environment Variables Vercel ke frontend.
 */

module.exports = (req, res) => {
  // Izinkan akses CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ambil dari Environment Variables di Vercel Dashboard
  const config = {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    SUPABASE_TABLE_NAME: process.env.SUPABASE_TABLE_NAME || 'leaderboard'
  };

  return res.status(200).json(config);
};
