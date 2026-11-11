# 🍌 Monkey Banana Shooter - Leaderboard System

Sistem papan peringkat (*Leaderboard*) online yang terintegrasi dengan **Supabase Database** dan siap dideploy langsung ke **Vercel**.

---

## 📁 Struktur File Project

```text
├── api/
│   └── env.js          # Vercel Serverless Function untuk membaca Environment Variables
├── index.html          # Halaman antarmuka leaderboard dan form uji coba
├── monyet.js           # Sistem utama Leaderboard (Supabase & LocalStorage fallback)
├── env.js              # Konfigurasi environment untuk browser
├── supabase.js         # Modul komunikasi client Supabase
├── schema.sql          # Script SQL untuk membuat tabel di Supabase
├── vercel.json         # Konfigurasi routing Vercel
├── .env                # File Environment Variables lokal
├── .env.example        # Template Environment Variables (tanpa secret key)
└── .gitignore          # Mengabaikan file sensitif (.env) dari Git
```

---

## 🛠️ 1. Persiapan di Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Masuk ke menu **SQL Editor** di sidebar kiri.
3. Buka file `schema.sql`, salin seluruh isinya, lalu klik tombol **Run**. Tabel `leaderboard` beserta aturan Row Level Security (RLS) akan otomatis dibuat.
4. Buka menu **Project Settings** (ikon gerigi) > **API**:
   - Salin **Project URL**
   - Salin **anon / public key**

---

## 💻 2. Menjalankan di Komputer (Lokal)

Cukup buka file `index.html` dengan mengklik dua kali dari File Explorer, atau buka lewat browser apa saja:
```text
D:/jejesicaaaaaaaa/magang/index.html
```

---

## ☁️ 3. Deploy ke Vercel

1. **Upload ke GitHub:**
   - Buat repository baru di GitHub dan upload file-file di folder ini.
2. **Import ke Vercel:**
   - Masuk ke [vercel.com](https://vercel.com) > klik **"Add New..."** > **"Project"** > pilih repository Anda.
3. **Masukkan Environment Variables:**
   Pada bagian **Environment Variables** sebelum klik Deploy, tambahkan:
   - `SUPABASE_URL` : URL Project Supabase Anda
   - `SUPABASE_ANON_KEY` : Anon Public Key Supabase Anda
   - `SUPABASE_TABLE_NAME` : `leaderboard`
4. **Klik Deploy:**
   - Tunggu beberapa detik hingga proses selesai. Website leaderboard Anda kini sudah aktif secara global di internet!
