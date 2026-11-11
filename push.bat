@echo off
echo ==============================================
echo 🚀 Mengirim Perubahan ke GitHub & Vercel
echo ==============================================

git add .

if "%~1"=="" (
    git commit -m "update leaderboard & game"
) else (
    git commit -m "%~1"
)

git push

echo ==============================================
echo ✅ Selesai! Vercel otomatis memperbarui website.
echo ==============================================
pause
