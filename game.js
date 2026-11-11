/**
 * game.js - Monkey Banana Shooter
 * Game engine berbasis HTML5 Canvas & Web Audio API
 * Terintegrasi langsung dengan LeaderboardManager (Supabase & LocalStorage)
 */

class MonkeyBananaShooter {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Ukuran virtual game
    this.width = 600;
    this.height = 450;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Status Game
    this.state = 'START'; // 'START', 'PLAYING', 'GAMEOVER'
    this.score = 0;
    this.wave = 1;
    this.lives = 3;
    this.shotsFired = 0;
    this.shotsHit = 0;

    // Entitas
    this.player = {
      x: this.width / 2,
      y: this.height - 35,
      angle: -Math.PI / 2,
      width: 48,
      height: 48
    };

    this.mouse = { x: this.width / 2, y: 100 };
    this.projectiles = [];
    this.enemies = [];
    this.particles = [];
    this.floatingTexts = [];

    // Wave & Spawn Management
    this.spawnTimer = 0;
    this.enemiesSpawnedInWave = 0;
    this.enemiesPerWave = 12;
    this.waveTransitionTimer = 0;

    // Web Audio API Synthesizer (Bebas file eksternal)
    this.audioCtx = null;
    this.soundEnabled = true;

    this.initEvents();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSound(type) {
    if (!this.soundEnabled || !this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'shoot') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'hit') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'gold') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        osc.frequency.setValueAtTime(783, now + 0.16);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'hurt') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'wave') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.1);
        osc.frequency.setValueAtTime(659, now + 0.2);
        osc.frequency.setValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (_) {}
  }

  initEvents() {
    const updateMousePos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;

      // Hitung sudut bidik
      const dx = this.mouse.x - this.player.x;
      const dy = this.mouse.y - this.player.y;
      this.player.angle = Math.atan2(dy, dx);
      // Batasi sudut tembak agar hanya menghadap ke atas
      if (this.player.angle > -0.2) this.player.angle = -0.2;
      if (this.player.angle < -Math.PI + 0.2) this.player.angle = -Math.PI + 0.2;
    };

    this.canvas.addEventListener('mousemove', updateMousePos);

    this.canvas.addEventListener('click', (e) => {
      this.initAudio();
      if (this.state === 'START') {
        this.startGame();
      } else if (this.state === 'PLAYING') {
        this.shoot();
      } else if (this.state === 'GAMEOVER') {
        // Tombol restart ada di modal HTML
      }
    });

    // Touch support (Mobile friendly)
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        updateMousePos(e.touches[0]);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.initAudio();
      if (e.touches.length > 0) {
        updateMousePos(e.touches[0]);
      }
      if (this.state === 'START') {
        this.startGame();
      } else if (this.state === 'PLAYING') {
        this.shoot();
      }
    }, { passive: false });
  }

  startGame() {
    this.state = 'PLAYING';
    this.score = 0;
    this.wave = 1;
    this.lives = 3;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.projectiles = [];
    this.enemies = [];
    this.particles = [];
    this.floatingTexts = [];
    this.enemiesSpawnedInWave = 0;
    this.enemiesPerWave = 10;
    this.spawnTimer = 0;
    this.waveTransitionTimer = 60; // animasi awal wave
    this.playSound('wave');

    const gameOverOverlay = document.getElementById('gameOverModal');
    if (gameOverOverlay) gameOverOverlay.style.display = 'none';
  }

  shoot() {
    if (this.state !== 'PLAYING') return;

    this.shotsFired++;
    const speed = 9;
    const vx = Math.cos(this.player.angle) * speed;
    const vy = Math.sin(this.player.angle) * speed;

    this.projectiles.push({
      x: this.player.x + Math.cos(this.player.angle) * 30,
      y: this.player.y + Math.sin(this.player.angle) * 30,
      vx: vx,
      vy: vy,
      rotation: this.player.angle,
      radius: 9
    });

    this.playSound('shoot');

    // Partikel asap tembakan
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: this.player.x + Math.cos(this.player.angle) * 30,
        y: this.player.y + Math.sin(this.player.angle) * 30,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: '#ffeb3b',
        radius: Math.random() * 3 + 2,
        life: 15
      });
    }
  }

  spawnEnemy() {
    const types = [
      { name: 'coconut', emoji: '🥥', hp: 1, pts: 100, speed: 1.2 + (this.wave * 0.15), radius: 16 },
      { name: 'pineapple', emoji: '🍍', hp: 2, pts: 250, speed: 1.0 + (this.wave * 0.12), radius: 18 },
      { name: 'gold', emoji: '⭐', hp: 1, pts: 500, speed: 2.0 + (this.wave * 0.1), radius: 14 }
    ];

    let chosenType = types[0];
    const rand = Math.random();
    if (rand < 0.15) {
      chosenType = types[2]; // Bintang emas (langka)
    } else if (rand < 0.45 && this.wave >= 2) {
      chosenType = types[1]; // Nanas (butuh 2 tembakan)
    }

    const padding = 40;
    const x = Math.random() * (this.width - padding * 2) + padding;
    const y = -25;

    this.enemies.push({
      x: x,
      y: y,
      type: chosenType.name,
      emoji: chosenType.emoji,
      hp: chosenType.hp,
      maxHp: chosenType.hp,
      pts: chosenType.pts,
      speed: chosenType.speed,
      radius: chosenType.radius,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.05 + 0.02
    });

    this.enemiesSpawnedInWave++;
  }

  createExplosion(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color || '#ffeb3b',
        radius: Math.random() * 3 + 1.5,
        life: Math.floor(Math.random() * 20 + 15)
      });
    }
  }

  addFloatingText(text, x, y, color = '#ffeb3b') {
    this.floatingTexts.push({
      text: text,
      x: x,
      y: y,
      vy: -1.2,
      life: 35,
      color: color
    });
  }

  update() {
    if (this.state !== 'PLAYING') return;

    // Transisi antar wave
    if (this.waveTransitionTimer > 0) {
      this.waveTransitionTimer--;
      return;
    }

    // Spawn Musuh
    this.spawnTimer++;
    const spawnRate = Math.max(30, 80 - (this.wave * 5));
    if (this.spawnTimer >= spawnRate && this.enemiesSpawnedInWave < this.enemiesPerWave) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }

    // Cek wave selesai
    if (this.enemiesSpawnedInWave >= this.enemiesPerWave && this.enemies.length === 0) {
      this.wave++;
      this.enemiesSpawnedInWave = 0;
      this.enemiesPerWave = 10 + (this.wave * 3);
      this.waveTransitionTimer = 90;
      this.addFloatingText(`WAVE ${this.wave}!`, this.width / 2, this.height / 2, '#4caf50');
      this.playSound('wave');
    }

    // Update Proyektil (Pisang Terbang)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += 0.25;

      // Hapus jika keluar layar
      if (p.x < -20 || p.x > this.width + 20 || p.y < -20 || p.y > this.height + 20) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Tabrakan dengan musuh
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        if (dist < p.radius + e.radius) {
          this.shotsHit++;
          e.hp--;

          if (e.hp <= 0) {
            this.score += e.pts;
            if (e.type === 'gold') {
              this.playSound('gold');
              this.createExplosion(e.x, e.y, '#ffd700', 20);
              this.addFloatingText(`+${e.pts} ⭐`, e.x, e.y, '#ffd700');
            } else {
              this.playSound('hit');
              this.createExplosion(e.x, e.y, '#a1887f', 14);
              this.addFloatingText(`+${e.pts}`, e.x, e.y, '#ffeb3b');
            }
            this.enemies.splice(j, 1);
          } else {
            this.playSound('hit');
            this.createExplosion(e.x, e.y, '#ffca28', 8);
          }

          this.projectiles.splice(i, 1);
          break;
        }
      }
    }

    // Update Musuh
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.y += e.speed;
      e.wobble += e.wobbleSpeed;
      e.x += Math.sin(e.wobble) * 0.8;

      // Mencapai tanah (Pemain kehilangan darah)
      if (e.y >= this.height - 40) {
        this.lives--;
        this.playSound('hurt');
        this.createExplosion(e.x, this.height - 30, '#ef5350', 16);
        this.enemies.splice(i, 1);

        if (this.lives <= 0) {
          this.triggerGameOver();
          return;
        }
      }
    }

    // Update Partikel
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  triggerGameOver() {
    this.state = 'GAMEOVER';
    const accuracy = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;

    // Tampilkan modal Game Over di HTML
    const modal = document.getElementById('gameOverModal');
    if (modal) {
      document.getElementById('finalScoreVal').innerText = this.score.toLocaleString('id-ID');
      document.getElementById('finalWaveVal').innerText = this.wave;
      document.getElementById('finalAccuracyVal').innerText = accuracy + '%';
      modal.style.display = 'flex';
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Gambar Background Rimba Tropis
    const bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#102810');
    bgGrad.addColorStop(0.7, '#1b4d1b');
    bgGrad.addColorStop(1, '#2e7d32');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Hiasan Pohon / Daun di latar
    this.ctx.fillStyle = 'rgba(0, 40, 0, 0.35)';
    this.ctx.beginPath();
    this.ctx.arc(80, 0, 120, 0, Math.PI * 2);
    this.ctx.arc(520, 0, 140, 0, Math.PI * 2);
    this.ctx.fill();

    // Tanah / Platform Rumput
    this.ctx.fillStyle = '#1b3b1b';
    this.ctx.fillRect(0, this.height - 35, this.width, 35);
    this.ctx.fillStyle = '#4caf50';
    this.ctx.fillRect(0, this.height - 35, this.width, 4);

    // 2. Gambar Musuh
    for (const e of this.enemies) {
      this.ctx.font = `${e.radius * 1.8}px serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(e.emoji, e.x, e.y);

      // Bar HP jika musuh butuh >1 hit
      if (e.maxHp > 1) {
        const barW = 24;
        const barH = 3;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(e.x - barW / 2, e.y - e.radius - 6, barW, barH);
        this.ctx.fillStyle = '#ffeb3b';
        this.ctx.fillRect(e.x - barW / 2, e.y - e.radius - 6, (barW * e.hp) / e.maxHp, barH);
      }
    }

    // 3. Gambar Proyektil (Pisang Berputar)
    for (const p of this.projectiles) {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.font = '22px serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('🍌', 0, 0);
      this.ctx.restore();
    }

    // 4. Gambar Partikel
    for (const pt of this.particles) {
      this.ctx.fillStyle = pt.color;
      this.ctx.beginPath();
      this.ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 5. Gambar Karakter Pemain (Monyet & Meriam Bambu)
    this.drawPlayer();

    // 6. Gambar Crosshair Target Bidikan
    this.drawCrosshair();

    // 7. Gambar Floating Texts
    for (const ft of this.floatingTexts) {
      this.ctx.fillStyle = ft.color;
      this.ctx.font = 'bold 16px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(ft.text, ft.x, ft.y);
    }

    // 8. Tampilan Transisi Wave
    if (this.waveTransitionTimer > 0 && this.state === 'PLAYING') {
      this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#ffeb3b';
      this.ctx.font = 'bold 36px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`🌴 WAVE ${this.wave} 🌴`, this.width / 2, this.height / 2 - 10);
      this.ctx.font = '16px sans-serif';
      this.ctx.fillStyle = '#e8f5e9';
      this.ctx.fillText('Tembak buah kelapa sebelum jatuh!', this.width / 2, this.height / 2 + 30);
    }

    // 9. Layar Start
    if (this.state === 'START') {
      this.ctx.fillStyle = 'rgba(10, 25, 10, 0.85)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.fillStyle = '#ffeb3b';
      this.ctx.font = 'bold 34px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('🐒 MONKEY BANANA SHOOTER 🍌', this.width / 2, this.height / 2 - 40);

      this.ctx.font = '16px sans-serif';
      this.ctx.fillStyle = '#c8e6c9';
      this.ctx.fillText('Gerakkan kursor/sentuh layar untuk membidik & menembak!', this.width / 2, this.height / 2 + 10);

      this.ctx.font = 'bold 20px sans-serif';
      this.ctx.fillStyle = '#69f0ae';
      this.ctx.fillText('👉 KLIK DI SINI UNTUK MULAI 👈', this.width / 2, this.height / 2 + 65);
    }

    // 10. Update HUD di luar Canvas
    this.updateHUD();
  }

  drawPlayer() {
    this.ctx.save();
    this.ctx.translate(this.player.x, this.player.y);

    // Meriam bambu / pelontar pisang
    this.ctx.save();
    this.ctx.rotate(this.player.angle);
    this.ctx.fillStyle = '#6d4c41';
    this.ctx.fillRect(0, -7, 32, 14);
    this.ctx.fillStyle = '#4e342e';
    this.ctx.fillRect(24, -8, 8, 16);
    this.ctx.restore();

    // Monyet (Emoji)
    this.ctx.font = '38px serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🐒', 0, 0);

    this.ctx.restore();
  }

  drawCrosshair() {
    if (this.state !== 'PLAYING') return;
    this.ctx.strokeStyle = 'rgba(255, 235, 59, 0.6)';
    this.ctx.lineWidth = 1.5;

    // Lingkaran bidik
    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, 10, 0, Math.PI * 2);
    this.ctx.stroke();

    // Garis bidik
    this.ctx.beginPath();
    this.ctx.moveTo(this.mouse.x - 14, this.mouse.y);
    this.ctx.lineTo(this.mouse.x + 14, this.mouse.y);
    this.ctx.moveTo(this.mouse.x, this.mouse.y - 14);
    this.ctx.lineTo(this.mouse.x, this.mouse.y + 14);
    this.ctx.stroke();
  }

  updateHUD() {
    const scoreEl = document.getElementById('hudScore');
    const waveEl = document.getElementById('hudWave');
    const livesEl = document.getElementById('hudLives');
    const accEl = document.getElementById('hudAccuracy');

    if (scoreEl) scoreEl.innerText = this.score.toLocaleString('id-ID');
    if (waveEl) waveEl.innerText = this.wave;
    if (livesEl) livesEl.innerText = '❤️'.repeat(Math.max(0, this.lives));
    if (accEl) {
      const acc = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 100;
      accEl.innerText = acc + '%';
    }
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

window.MonkeyBananaShooter = MonkeyBananaShooter;
