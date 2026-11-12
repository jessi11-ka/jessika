/**
 * game.js — Monkey Banana Shooter (Vibrant Colorful Pixel Edition)
 * Fitur:
 * - Grafik Pixel Art Colorful: Hutan tropis rimbun, trotoar batu warna-warni, bunga tropis, sungai jernih, pilar kuno.
 * - Karakter Monyet Pixel Lucu: Animasi mata, telinga, mantel, dan Blaster Pisang Emas bercahaya.
 * - Sistem Nyawa: 5 HATI PENUH (Hanya mati saat seluruh hati habis <= 0!).
 *   - Energy Shield Bubble kebal 2.0 detik setiap kena hit + efek pentalan musuh agar tidak kena hit berulang.
 * - Tingkat Kesulitan Berjenjang Tiap Level:
 *   - Level 1: Zookeeper (lambat, tidak menembak, mengejar membawa jaring).
 *   - Level 2: Dart Hunter (mulai menembakkan peluru bius kuning).
 *   - Level 3: Armored Riot Guard (tameng baja biru, butuh 3 hit).
 *   - Level 4: Commando Sniper (laser telegraph merah, tembakan cepat).
 *   - Level 5+: Hunter Safari Jeep (mobil off-road kuning, peluru menyebar 3 arah).
 *   - Boss Unik Tiap Level dengan HP bar berwarna & pola serangan khusus.
 * - Mode Multiplayer Online via Room Code (Sistem Kode mirip Among Us dengan WebRTC PeerJS).
 * - Web Audio API Synthesizer (SFX retro arcade jernih tanpa file eksternal).
 */

// ============================================================================
// 1. SOUND SYSTEM RETRO COLORFUL
// ============================================================================
class ColorfulRetroAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  _init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playShoot(tier = 1) {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = tier >= 4 ? 'sawtooth' : 'triangle';
    const startF = 460 + tier * 50;
    osc.frequency.setValueAtTime(startF, t);
    osc.frequency.exponentialRampToValueAtTime(900 + tier * 70, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.13);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.13);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  playDodge() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.18);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.19);
  }

  playHit() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.11);
  }

  playPlayerHit() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.25);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  playExplosion() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  playPickup(type) {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = type === 'gem' ? [523, 659, 784, 1046] : type === 'health' ? [440, 554, 659, 880] : [392, 493, 587];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.045;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.13);
    });
  }

  playReload() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [0, 0.14, 0.28].forEach((delay, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(i === 2 ? 740 : 420, t + delay);
      gain.gain.setValueAtTime(0.18, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.08);
    });
  }
}

// ============================================================================
// 2. ENGINE GAMEPLAY UTAMA: COLORFUL PIXEL MONKEY BANANA SHOOTER
// ============================================================================
class MonkeyBananaShooter {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 640;
    this.canvas.height = 460;
    this.ctx.imageSmoothingEnabled = false;

    // Mode Multiplayer Online / Local
    this.isDuo = options.isDuo || false;
    this.isOnline = options.isOnline || false;
    this.isHost = options.isHost !== false; // default host jika online
    this.networkConn = options.networkConn || null;

    // Konfigurasi
    this.skinP1 = options.skinP1 || 'classic';
    this.weaponLevel = options.weaponLevel || 1;
    this.playerAccount = options.playerAccount || null;

    this.sfx = new ColorfulRetroAudio();

    // Statistik Permainan
    this.score = 0;
    this.wave = 1;
    this.gemsCollected = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.running = false;
    this.over = false;

    // Entitas
    this.bananas = [];
    this.hunters = [];
    this.hunterBullets = [];
    this.itemDrops = [];
    this.particles = [];
    this.floatingTexts = [];
    this.currentBoss = null;

    // Screen Shake
    this.shakeTimer = 0;
    this.shakeIntensity = 0;

    // Input P1
    this.keys = {};
    this.mouseX = this.canvas.width / 2;
    this.mouseY = this.canvas.height / 2;
    this.mouseDown = false;

    // Input Remote P2 (dari WebRTC PeerJS)
    this.remoteInputP2 = {
      x: this.canvas.width / 2 + 40,
      y: this.canvas.height - 80,
      angle: -Math.PI / 2,
      shooting: false,
      dodging: false,
      reloading: false
    };

    // Karakter Pemain (5 NYAWA LENGKAP - ANTI MATI MENDADAK!)
    this.p1 = this._createPlayer(this.canvas.width / 2 - (this.isDuo ? 40 : 0), this.canvas.height - 80, this.skinP1, 1);
    this.p2 = this.isDuo ? this._createPlayer(this.canvas.width / 2 + 40, this.canvas.height - 80, 'ninja', 2) : null;

    // Arena Hutan Tropis Colorful
    this.arena = {
      left: 100,
      right: 540,
      width: 440,
      decorations: this._generateJungleDecorations()
    };

    // Wave Progression
    this.waveTotalEnemies = 0;
    this.waveSpawnedEnemies = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 110;

    this._bindEvents();
    this._bindNetwork();
    this.startGame();
  }

  _createPlayer(x, y, skin, id) {
    return {
      id: id,
      x: x,
      y: y,
      radius: 18,
      speed: 3.8,
      angle: -Math.PI / 2,

      // ── SISTEM NYAWA: 5 HATI PENUH (HANYA MATI JIKA HABIS 0!) ──
      lives: 5,
      maxLives: 5,
      skin: skin,

      // Amunisi & Reload
      ammoMag: 12,
      maxAmmoMag: 12,
      ammoStock: 100,
      isReloading: false,
      reloadTimer: 0,
      reloadDuration: 55,

      // Stamina & Dodge Roll
      stamina: 100,
      maxStamina: 100,
      isDodging: false,
      dodgeTimer: 0,
      dodgeDuration: 18,
      dodgeVx: 0,
      dodgeVy: 0,

      // Shield Pelindung (Kebal selama timer > 0)
      invulnerableTimer: 0,
      shieldMaxTimer: 120 // 2.0 detik kebal anti-spam hit
    };
  }

  // ── GENERATE DEKORASI HUTAN COLORFUL ──
  _generateJungleDecorations() {
    const flowers = [];
    const colors = ['#ff007f', '#ffd600', '#00e5ff', '#ff5722', '#e040fb'];
    for (let i = 0; i < 28; i++) {
      flowers.push({
        x: 10 + Math.random() * 620,
        y: 10 + Math.random() * 440,
        color: colors[i % colors.length],
        size: 3 + Math.random() * 3,
        petals: 4 + (i % 3)
      });
    }

    const ancientPillars = [
      { x: 50, y: 80, w: 34, h: 50, gem: '#00e5ff' },
      { x: 50, y: 320, w: 34, h: 50, gem: '#ffd600' },
      { x: 580, y: 120, w: 34, h: 50, gem: '#ff007f' },
      { x: 580, y: 340, w: 34, h: 50, gem: '#76ff03' }
    ];

    return { flowers, ancientPillars };
  }

  // ── NETWORK BINDING (WEBRTC PEERJS AMONG US STYLE) ──
  _bindNetwork() {
    if (!this.isOnline || !this.networkConn) return;

    this.networkConn.on('data', (data) => {
      if (this.isHost) {
        // Host menerima input Player 2 dari Guest
        if (data.type === 'guest_input') {
          this.remoteInputP2 = data.payload;
          if (this.p2 && this.p2.lives > 0) {
            this.p2.x = data.payload.x;
            this.p2.y = data.payload.y;
            this.p2.angle = data.payload.angle;
            if (data.payload.shooting) this._tryShootPlayer(this.p2);
            if (data.payload.dodging) this._performDodge(this.p2);
            if (data.payload.reloading) this._startReload(this.p2);
          }
        }
      } else {
        // Guest menerima snapshot game state dari Host
        if (data.type === 'host_sync') {
          this._applyHostSync(data.payload);
        }
      }
    });
  }

  _broadcastStateToGuest() {
    if (!this.isOnline || !this.isHost || !this.networkConn || !this.networkConn.open) return;

    // Kirim snapshot state ringkas setiap beberapa frame
    const payload = {
      score: this.score,
      wave: this.wave,
      p1: { x: this.p1.x, y: this.p1.y, angle: this.p1.angle, lives: this.p1.lives, stamina: this.p1.stamina, ammo: this.p1.ammoMag, skin: this.p1.skin },
      p2Lives: this.p2 ? this.p2.lives : 0,
      enemies: this.hunters.map(h => ({ x: h.x, y: h.y, angle: h.angle, type: h.type, hp: h.hp, maxHp: h.maxHp })),
      bullets: this.hunterBullets.map(b => ({ x: b.x, y: b.y })),
      bananas: this.bananas.map(b => ({ x: b.x, y: b.y, rot: b.rotation })),
      items: this.itemDrops.map(it => ({ x: it.x, y: it.y, type: it.type })),
      boss: this.currentBoss ? { x: this.currentBoss.x, y: this.currentBoss.y, hp: this.currentBoss.hp, maxHp: this.currentBoss.maxHp, name: this.currentBoss.name } : null
    };

    try {
      this.networkConn.send({ type: 'host_sync', payload });
    } catch (_) {}
  }

  _applyHostSync(state) {
    this.score = state.score;
    this.wave = state.wave;
    this.p1.x = state.p1.x;
    this.p1.y = state.p1.y;
    this.p1.angle = state.p1.angle;
    this.p1.lives = state.p1.lives;

    if (this.p2) {
      this.p2.lives = state.p2Lives;
    }

    // Sync entitas
    this.hunters = state.enemies.map(e => ({ ...e, radius: e.type === 'jeep' ? 26 : 16 }));
    this.hunterBullets = state.bullets.map(b => ({ ...b, radius: 4 }));
    this.bananas = state.bananas.map(b => ({ ...b, radius: 8, rotation: b.rot }));
    this.itemDrops = state.items.map(it => ({ ...it, floatOffset: 0 }));
    this.currentBoss = state.boss ? { ...state.boss, radius: 36 } : null;
  }

  // ── BIND INPUT EVENT ──
  _bindEvents() {
    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      this.mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    });

    this.canvas.addEventListener('mousedown', e => {
      if (e.button === 0 && this.running && !this.over) {
        this.mouseDown = true;
        const playerControl = (this.isOnline && !this.isHost && this.p2) ? this.p2 : this.p1;
        this._tryShootPlayer(playerControl);

        if (this.isOnline && !this.isHost && this.networkConn && this.networkConn.open) {
          this.networkConn.send({
            type: 'guest_input',
            payload: { x: this.p2.x, y: this.p2.y, angle: this.p2.angle, shooting: true }
          });
        }
      }
    });

    window.addEventListener('mouseup', () => { this.mouseDown = false; });

    // Keyboard Events
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (!this.running || this.over) return;

      const activePlayer = (this.isOnline && !this.isHost && this.p2) ? this.p2 : this.p1;

      // P1 Dodge: SPASI
      if (e.code === 'Space') {
        e.preventDefault();
        this._performDodge(activePlayer);
        if (this.isOnline && !this.isHost && this.networkConn && this.networkConn.open) {
          this.networkConn.send({ type: 'guest_input', payload: { x: activePlayer.x, y: activePlayer.y, angle: activePlayer.angle, dodging: true } });
        }
      }

      // P1 Reload: R
      if (e.code === 'KeyR') {
        this._startReload(activePlayer);
        if (this.isOnline && !this.isHost && this.networkConn && this.networkConn.open) {
          this.networkConn.send({ type: 'guest_input', payload: { x: activePlayer.x, y: activePlayer.y, angle: activePlayer.angle, reloading: true } });
        }
      }

      // Local Duo (Jika bukan online, player 2 main via tombol panah + Enter/Shift)
      if (this.isDuo && !this.isOnline && this.p2 && this.p2.lives > 0) {
        if (e.code === 'Enter' || e.code === 'Numpad0' || e.code === 'KeyK') this._tryShootPlayer(this.p2);
        if (e.code === 'ShiftRight' || e.code === 'KeyM') this._performDodge(this.p2);
        if (e.code === 'KeyL' || e.code === 'KeyP') this._startReload(this.p2);
      }
    });

    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });
  }

  // ── GAMEPLAY LOOP & WAVE PROGRESSION ──
  startGame() {
    this.score = 0;
    this.wave = 1;
    this.gemsCollected = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.running = true;
    this.over = false;

    this.bananas = [];
    this.hunters = [];
    this.hunterBullets = [];
    this.itemDrops = [];
    this.particles = [];
    this.floatingTexts = [];
    this.currentBoss = null;

    // Reset P1 & P2
    this.p1 = this._createPlayer(this.canvas.width / 2 - (this.isDuo ? 40 : 0), this.canvas.height - 80, this.skinP1, 1);
    if (this.isDuo) {
      this.p2 = this._createPlayer(this.canvas.width / 2 + 40, this.canvas.height - 80, 'ninja', 2);
    }

    this._startWave(1);
    this._loop();
  }

  // ── PER LEVEL DIBIKIN LEBIH SUSAH DENGAN TIPE MUSUH BARU ──
  _startWave(w) {
    this.wave = w;
    this.bananas = [];
    this.hunterBullets = [];
    this.hunters = [];
    this.currentBoss = null;

    // Jumlah musuh bertambah tiap level
    this.waveTotalEnemies = 5 + w * 3;
    this.waveSpawnedEnemies = 0;
    this.spawnTimer = 25;
    // Interval spawn semakin cepat per level
    this.spawnInterval = Math.max(55, 120 - w * 10);

    const waveThemes = [
      '🌿 LEVEL 1: SERBUAN ZOOKEEPER!',
      '🎯 LEVEL 2: PENEMBAK BIUS DATANG!',
      '🛡️ LEVEL 3: PASUKAN TAMENG BAJA!',
      '⚡ LEVEL 4: SNIPER KOMANDO!',
      '🚗 LEVEL 5: PATROLI SAFARI JEEP!'
    ];
    const bannerText = waveThemes[Math.min(w - 1, waveThemes.length - 1)] || `🔥 LEVEL ${w}: PERANG TOTAL RIMBA!`;
    this._addFloatingText(this.canvas.width / 2, this.canvas.height / 2, bannerText, '#ffd600', 50);
  }

  _performDodge(p) {
    if (p.isDodging || p.stamina < 30 || p.lives <= 0) return;

    p.stamina -= 30;
    p.isDodging = true;
    p.dodgeTimer = p.dodgeDuration;
    p.invulnerableTimer = p.dodgeDuration + 12; // Kebal saat roll
    this.sfx.playDodge();

    const dashSpeed = 9.5;
    p.dodgeVx = Math.cos(p.angle) * dashSpeed;
    p.dodgeVy = Math.sin(p.angle) * dashSpeed;

    this._addFloatingText(p.x, p.y - 20, 'DODGE! ⚡', '#00e5ff', 20);
    this._spawnParticles(p.x, p.y, '#ffd600', 10);
  }

  _startReload(p) {
    if (p.isReloading || p.ammoMag >= p.maxAmmoMag || p.ammoStock <= 0) return;
    p.isReloading = true;
    p.reloadTimer = p.reloadDuration;
    this.sfx.playReload();
    this._addFloatingText(p.x, p.y - 20, 'RELOADING... 🍌', '#ffd600', 25);
  }

  _tryShootPlayer(p) {
    if (p.lives <= 0 || p.isDodging) return;

    if (p.isReloading) {
      this._addFloatingText(p.x, p.y - 20, 'RELOADING! ⏳', '#ff5722', 15);
      return;
    }

    if (p.ammoMag <= 0) {
      this._startReload(p);
      return;
    }

    p.ammoMag--;
    this.shotsFired++;
    const tier = this.weaponLevel || 1;
    this.sfx.playShoot(tier);

    const bSpeed = 10;
    const dmg = tier;
    const isExplosive = tier >= 4;

    // Pola Tembakan Sesuai Tier Senjata
    if (tier === 3) {
      // 3 Tembakan Menyebar (Spread Shot)
      [-0.18, 0, 0.18].forEach(offsetAngle => {
        this.bananas.push({
          x: p.x + Math.cos(p.angle) * 18,
          y: p.y + Math.sin(p.angle) * 18,
          vx: Math.cos(p.angle + offsetAngle) * bSpeed,
          vy: Math.sin(p.angle + offsetAngle) * bSpeed,
          radius: 8,
          damage: dmg,
          isExplosive: false,
          rotation: p.angle,
          rotSpeed: 0.28
        });
      });
    } else {
      this.bananas.push({
        x: p.x + Math.cos(p.angle) * 18,
        y: p.y + Math.sin(p.angle) * 18,
        vx: Math.cos(p.angle) * bSpeed,
        vy: Math.sin(p.angle) * bSpeed,
        radius: 8,
        damage: dmg,
        isExplosive: isExplosive,
        rotation: p.angle,
        rotSpeed: 0.28
      });
    }

    this._spawnParticles(p.x + Math.cos(p.angle) * 20, p.y + Math.sin(p.angle) * 20, '#ffd600', 4);

    if (p.ammoMag <= 0 && p.ammoStock > 0) {
      this._startReload(p);
    }
  }

  // ── UPDATE LOOP UTAMA ──
  _update() {
    if (!this.running || this.over) return;

    if (this.shakeTimer > 0) this.shakeTimer--;

    // 1. Update Player 1 (Host / Solo)
    if (!this.isOnline || this.isHost) {
      this._updatePlayerMovement(this.p1, 'KeyW', 'KeyS', 'KeyA', 'KeyD', this.mouseX, this.mouseY);
    }

    // 2. Update Player 2
    if (this.p2 && this.p2.lives > 0) {
      if (this.isOnline && this.isHost) {
        // P2 digerakkan dari remote input
        this._updatePlayerRemote(this.p2);
      } else if (!this.isOnline) {
        // P2 Local via Panah Keyboard
        const p2TargetX = this.keys['ArrowLeft'] ? this.p2.x - 50 : this.keys['ArrowRight'] ? this.p2.x + 50 : this.p2.x;
        const p2TargetY = this.keys['ArrowUp'] ? this.p2.y - 50 : this.keys['ArrowDown'] ? this.p2.y + 50 : this.p2.y;
        this._updatePlayerMovement(this.p2, 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', p2TargetX, p2TargetY);
      }
    }

    // Hanya Host yang mengkalkulasi musuh & spawn agar sinkron
    if (!this.isOnline || this.isHost) {
      // 3. Spawning Musuh Berdasarkan Level
      this.spawnTimer--;
      if (this.spawnTimer <= 0 && this.waveSpawnedEnemies < this.waveTotalEnemies) {
        this.spawnTimer = this.spawnInterval;
        this._spawnEnemyForLevel(this.wave);
        this.waveSpawnedEnemies++;
      }

      // 4. Spawn Boss saat seluruh musuh wave habis
      if (this.waveSpawnedEnemies >= this.waveTotalEnemies && this.hunters.length === 0 && !this.currentBoss) {
        this._spawnBossForLevel(this.wave);
      }

      // 5. Update Musuh & Boss
      for (let i = this.hunters.length - 1; i >= 0; i--) {
        this._updateHunter(this.hunters[i], i);
      }
      if (this.currentBoss) {
        this._updateBoss(this.currentBoss);
      }

      // 6. Broadcast ke Player 2
      if (this.isOnline && this.isHost && Math.random() < 0.5) {
        this._broadcastStateToGuest();
      }
    }

    // 7. Bananas & Bullets
    this._updateBananas();
    this._updateHunterBullets();
    this._updateItemDrops();
    this._updateParticles();

    // 8. CEK GAME OVER: HANYA JIKA SELURUH NYAWA BENAR-BENAR 0!
    const p1Dead = this.p1.lives <= 0;
    const p2Dead = this.isDuo ? (!this.p2 || this.p2.lives <= 0) : true;
    if (p1Dead && p2Dead) {
      this._triggerGameOver();
    }
  }

  _updatePlayerMovement(p, upKey, downKey, leftKey, rightKey, targetX, targetY) {
    if (p.lives <= 0) return;

    if (p.stamina < p.maxStamina && !p.isDodging) {
      p.stamina = Math.min(p.maxStamina, p.stamina + 0.45);
    }

    if (p.isReloading) {
      p.reloadTimer--;
      if (p.reloadTimer <= 0) {
        p.isReloading = false;
        const needed = p.maxAmmoMag - p.ammoMag;
        const take = Math.min(needed, p.ammoStock);
        p.ammoMag += take;
        p.ammoStock -= take;
        this._addFloatingText(p.x, p.y - 20, 'READY! ⚡', '#76ff03', 20);
      }
    }

    if (p.isDodging) {
      p.x += p.dodgeVx;
      p.y += p.dodgeVy;
      p.dodgeTimer--;
      if (p.dodgeTimer <= 0) p.isDodging = false;
    } else {
      let dx = 0;
      let dy = 0;
      if (this.keys[upKey]) dy -= 1;
      if (this.keys[downKey]) dy += 1;
      if (this.keys[leftKey]) dx -= 1;
      if (this.keys[rightKey]) dx += 1;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      p.x += dx * p.speed;
      p.y += dy * p.speed;
    }

    // Batas Arena
    p.x = Math.max(this.arena.left + p.radius, Math.min(this.arena.right - p.radius, p.x));
    p.y = Math.max(60, Math.min(this.canvas.height - 35, p.y));

    // Arah Rotasi Hadap Kursor
    p.angle = Math.atan2(targetY - p.y, targetX - p.x);

    if (p.invulnerableTimer > 0) p.invulnerableTimer--;
  }

  _updatePlayerRemote(p) {
    if (p.lives <= 0) return;
    if (p.invulnerableTimer > 0) p.invulnerableTimer--;
    if (p.stamina < p.maxStamina && !p.isDodging) {
      p.stamina = Math.min(p.maxStamina, p.stamina + 0.45);
    }
  }

  // ── SPAWN MUSUH BERDASARKAN LEVEL (SEMAKIN TINGGI SEMAKIN SUSAH) ──
  _spawnEnemyForLevel(level) {
    const startX = this.arena.left + 30 + Math.random() * (this.arena.width - 60);
    const startY = -25;

    let type = 'zookeeper';
    // Level 1: Hanya Zookeeper
    if (level === 1) {
      type = 'zookeeper';
    } else if (level === 2) {
      type = Math.random() > 0.4 ? 'shooter' : 'zookeeper';
    } else if (level === 3) {
      const r = Math.random();
      type = r > 0.5 ? 'armored' : r > 0.25 ? 'shooter' : 'zookeeper';
    } else if (level === 4) {
      const r = Math.random();
      type = r > 0.6 ? 'sniper' : r > 0.3 ? 'armored' : 'shooter';
    } else {
      // Level 5+: Muncul Jeep & musuh kuat
      const r = Math.random();
      type = r > 0.6 ? 'jeep' : r > 0.4 ? 'sniper' : 'armored';
    }

    const enemy = {
      x: startX,
      y: startY,
      type: type,
      radius: type === 'jeep' ? 26 : 16,
      speed: type === 'jeep' ? 2.4 : type === 'zookeeper' ? 1.6 : 1.4 + level * 0.08,
      angle: Math.PI / 2,
      hp: type === 'jeep' ? 9 : type === 'armored' ? 4 : 2,
      maxHp: type === 'jeep' ? 9 : type === 'armored' ? 4 : 2,
      canShoot: type !== 'zookeeper',
      shootCooldown: 80 + Math.floor(Math.random() * 60),
      walkCycle: 0
    };

    this.hunters.push(enemy);
  }

  // ── SPAWN BOSS UNIK TIAP LEVEL ──
  _spawnBossForLevel(level) {
    this.sfx.playExplosion();
    this._screenShake(25, 7);

    const bossHp = 16 + (level - 1) * 12; // Level 1 = 16 HP, Level 2 = 28 HP...
    const names = [
      '👑 GORILLA CAGE MECH (LV.1)',
      '🚁 COMMANDER HOVERCRAFT (LV.2)',
      '🛡️ SAFARI HEAVY TANK (LV.3)',
      '⚡ CYBER MECHA HUNTER (LV.4)',
      '🔥 TITAN HUNTER FORTRESS (LV.5)'
    ];

    this.currentBoss = {
      x: this.canvas.width / 2,
      y: -60,
      radius: 36,
      speed: 1.5 + level * 0.12,
      hp: bossHp,
      maxHp: bossHp,
      name: names[Math.min(level - 1, names.length - 1)],
      shootCooldown: 90,
      telegraphTimer: 0,
      walkCycle: 0
    };

    this._addFloatingText(this.canvas.width / 2, 90, `⚠️ BOSS INCOMING: ${this.currentBoss.name}!`, '#ff1744', 60);
  }

  // ── UPDATE MUSUH ──
  _updateHunter(h, index) {
    h.walkCycle += 0.1;
    const targetPlayer = (this.p2 && this.p2.lives > 0 && Math.random() > 0.5) ? this.p2 : this.p1;
    const angleToP = Math.atan2(targetPlayer.y - h.y, targetPlayer.x - h.x);
    h.angle = angleToP;

    h.x += Math.cos(angleToP) * h.speed * 0.7;
    h.y += Math.sin(angleToP) * h.speed;

    // Musuh Menembak (Level 2+)
    if (h.canShoot) {
      h.shootCooldown--;
      if (h.shootCooldown <= 0) {
        h.shootCooldown = h.type === 'jeep' ? 70 : 120 + Math.floor(Math.random() * 40);
        this.sfx.playHit();

        const bSpeed = 4.0 + this.wave * 0.15;
        this.hunterBullets.push({
          x: h.x + Math.cos(h.angle) * 18,
          y: h.y + Math.sin(h.angle) * 18,
          vx: Math.cos(h.angle) * bSpeed,
          vy: Math.sin(h.angle) * bSpeed,
          radius: 5
        });

        // Jeep menembak 2 peluru menyebar
        if (h.type === 'jeep') {
          this.hunterBullets.push({
            x: h.x + Math.cos(h.angle + 0.25) * 18,
            y: h.y + Math.sin(h.angle + 0.25) * 18,
            vx: Math.cos(h.angle + 0.25) * bSpeed,
            vy: Math.sin(h.angle + 0.25) * bSpeed,
            radius: 5
          });
        }
      }
    }

    // Tabrakan Musuh dengan Pemain
    [this.p1, this.p2].forEach(p => {
      if (!p || p.lives <= 0) return;
      const d = Math.hypot(h.x - p.x, h.y - p.y);
      if (d < h.radius + p.radius) {
        if (p.invulnerableTimer === 0) {
          this._damagePlayer(p, 1);
        }
        // PENTALKAN MUSUH AGAR TIDAK MENEMPEL DAN TIDAK SPAM DAMAGE!
        const pushAngle = Math.atan2(h.y - p.y, h.x - p.x);
        h.x += Math.cos(pushAngle) * 50;
        h.y += Math.sin(pushAngle) * 50;
      }
    });
  }

  // ── UPDATE BOSS ──
  _updateBoss(boss) {
    boss.walkCycle += 0.08;
    const targetPlayer = (this.p2 && this.p2.lives > 0 && Math.random() > 0.5) ? this.p2 : this.p1;
    const angleToP = Math.atan2(targetPlayer.y - boss.y, targetPlayer.x - boss.x);
    boss.angle = angleToP;

    if (boss.y < 115) {
      boss.y += boss.speed * 1.2;
    } else {
      boss.x += Math.sin(Date.now() * 0.0018) * boss.speed * 1.5;
      boss.y += Math.cos(Date.now() * 0.0025) * boss.speed * 0.5;
    }

    boss.shootCooldown--;
    if (boss.shootCooldown <= 25) {
      boss.telegraphTimer = 25; // Garis laser peringatan sebelum nembak
    }

    if (boss.shootCooldown <= 0) {
      boss.shootCooldown = Math.max(65, 110 - this.wave * 6);
      boss.telegraphTimer = 0;
      this.sfx.playHit();

      // Boss Tembak 5 Peluru Menyebar
      for (let a = -0.5; a <= 0.5; a += 0.25) {
        this.hunterBullets.push({
          x: boss.x + Math.cos(boss.angle + a) * 25,
          y: boss.y + Math.sin(boss.angle + a) * 25,
          vx: Math.cos(boss.angle + a) * 3.8,
          vy: Math.sin(boss.angle + a) * 3.8,
          radius: 6
        });
      }
    }

    [this.p1, this.p2].forEach(p => {
      if (!p || p.lives <= 0) return;
      const d = Math.hypot(boss.x - p.x, boss.y - p.y);
      if (d < boss.radius + p.radius) {
        if (p.invulnerableTimer === 0) {
          this._damagePlayer(p, 1);
        }
        // Dorong pemain menjauh dari boss
        const pushAngle = Math.atan2(p.y - boss.y, p.x - boss.x);
        p.x = Math.max(this.arena.left + 25, Math.min(this.arena.right - 25, p.x + Math.cos(pushAngle) * 50));
        p.y = Math.max(60, Math.min(this.canvas.height - 40, p.y + Math.sin(pushAngle) * 50));
      }
    });
  }

  // ── UPDATE PELURU PISANG ──
  _updateBananas() {
    for (let i = this.bananas.length - 1; i >= 0; i--) {
      const b = this.bananas[i];
      b.x += b.vx;
      b.y += b.vy;
      b.rotation += b.rotSpeed;

      if (b.x < -20 || b.x > this.canvas.width + 20 || b.y < -20 || b.y > this.canvas.height + 20) {
        this.bananas.splice(i, 1);
        continue;
      }

      // Hit Boss
      if (this.currentBoss) {
        const d = Math.hypot(b.x - this.currentBoss.x, b.y - this.currentBoss.y);
        if (d < b.radius + this.currentBoss.radius) {
          this.shotsHit++;
          this.currentBoss.hp -= b.damage;
          this.sfx.playHit();
          this._spawnParticles(b.x, b.y, '#ffd600', 8);
          this._addFloatingText(this.currentBoss.x, this.currentBoss.y - 20, `-${b.damage}`, '#ffeb3b', 18);

          if (b.isExplosive) this._triggerExplosion(b.x, b.y, 65, 3);

          if (this.currentBoss.hp <= 0) {
            this.score += 2500 * this.wave;
            this._screenShake(25, 7);
            this.sfx.playExplosion();
            this._spawnParticles(this.currentBoss.x, this.currentBoss.y, '#ffd600', 35);
            this._addFloatingText(this.currentBoss.x, this.currentBoss.y, '🏆 BOSS DEFEATED!', '#76ff03', 50);

            // Drop Hadiah Banyak!
            for (let g = 0; g < 8; g++) {
              this.itemDrops.push({
                type: 'gem',
                x: this.currentBoss.x + (Math.random() - 0.5) * 60,
                y: this.currentBoss.y + (Math.random() - 0.5) * 60,
                life: 700,
                floatOffset: Math.random() * Math.PI * 2
              });
            }
            this.itemDrops.push({ type: 'health', x: this.currentBoss.x + 20, y: this.currentBoss.y, life: 700, floatOffset: 0 });
            this.itemDrops.push({ type: 'ammo', x: this.currentBoss.x - 20, y: this.currentBoss.y, life: 700, floatOffset: 0 });

            this.currentBoss = null;

            setTimeout(() => {
              if (this.running && !this.over) {
                this.wave++;
                this._startWave(this.wave);
              }
            }, 1400);
          }

          this.bananas.splice(i, 1);
          continue;
        }
      }

      // Hit Enemies
      for (let j = this.hunters.length - 1; j >= 0; j--) {
        const h = this.hunters[j];
        const d = Math.hypot(b.x - h.x, b.y - h.y);
        if (d < b.radius + h.radius) {
          this.shotsHit++;
          h.hp -= b.damage;
          this.sfx.playHit();
          this._spawnParticles(h.x, h.y, '#ffd600', 6);
          this._addFloatingText(h.x, h.y - 15, `-${b.damage}`, '#ffeb3b', 16);

          if (b.isExplosive) this._triggerExplosion(b.x, b.y, 55, 3);

          if (h.hp <= 0) {
            this.score += (h.type === 'jeep' ? 500 : 180) * this.wave;
            this._spawnParticles(h.x, h.y, h.type === 'jeep' ? '#ff5722' : '#76ff03', 16);
            if (h.type === 'jeep') this.sfx.playExplosion();

            this._dropRandomItem(h.x, h.y);
            this.hunters.splice(j, 1);
          }

          this.bananas.splice(i, 1);
          break;
        }
      }
    }
  }

  _triggerExplosion(x, y, radius, damage) {
    this.sfx.playExplosion();
    this._screenShake(16, 5);
    this._spawnParticles(x, y, '#ff007f', 24);

    this.hunters.forEach(h => {
      if (Math.hypot(h.x - x, h.y - y) < radius + h.radius) h.hp -= damage;
    });
    if (this.currentBoss && Math.hypot(this.currentBoss.x - x, this.currentBoss.y - y) < radius + this.currentBoss.radius) {
      this.currentBoss.hp -= damage;
    }
  }

  // ── UPDATE PELURU MUSUH ──
  _updateHunterBullets() {
    for (let i = this.hunterBullets.length - 1; i >= 0; i--) {
      const hb = this.hunterBullets[i];
      hb.x += hb.vx;
      hb.y += hb.vy;

      if (hb.x < 0 || hb.x > this.canvas.width || hb.y < 0 || hb.y > this.canvas.height) {
        this.hunterBullets.splice(i, 1);
        continue;
      }

      [this.p1, this.p2].forEach(p => {
        if (!p || p.lives <= 0) return;
        const d = Math.hypot(hb.x - p.x, hb.y - p.y);
        if (d < hb.radius + p.radius) {
          this.hunterBullets.splice(i, 1);
          // HANYA TERKENA HIT JIKA TIDAK SEDANG KEBAL (SHIELD HABIS)
          if (p.invulnerableTimer === 0) {
            this._damagePlayer(p, 1);
          }
        }
      });
    }
  }

  // ── RANDOM ITEM DROPS ──
  _dropRandomItem(x, y) {
    const r = Math.random();
    if (r < 0.28) {
      // 28% drop Gems
      this.itemDrops.push({ type: 'gem', x, y, life: 600, floatOffset: Math.random() * Math.PI * 2 });
    } else if (r < 0.45) {
      // 17% drop Ammo
      this.itemDrops.push({ type: 'ammo', x, y, life: 600, floatOffset: Math.random() * Math.PI * 2 });
    } else if (r < 0.58) {
      // 13% drop Medkit / Heart
      this.itemDrops.push({ type: 'health', x, y, life: 600, floatOffset: Math.random() * Math.PI * 2 });
    }
  }

  _updateItemDrops() {
    for (let i = this.itemDrops.length - 1; i >= 0; i--) {
      const item = this.itemDrops[i];
      item.life--;
      if (item.life <= 0) {
        this.itemDrops.splice(i, 1);
        continue;
      }

      [this.p1, this.p2].forEach(p => {
        if (!p || p.lives <= 0) return;
        const d = Math.hypot(item.x - p.x, item.y - p.y);
        if (d < p.radius + 18) {
          if (item.type === 'gem') {
            this.gemsCollected++;
            this.sfx.playPickup('gem');
            this._addFloatingText(item.x, item.y - 15, '+1 GEM 💎', '#00e5ff', 24);
          } else if (item.type === 'ammo') {
            p.ammoStock = Math.min(250, p.ammoStock + 24);
            this.sfx.playPickup('ammo');
            this._addFloatingText(item.x, item.y - 15, '+24 PISANG 🍌', '#ffd600', 24);
          } else if (item.type === 'health') {
            p.lives = Math.min(p.maxLives, p.lives + 1);
            this.sfx.playPickup('health');
            this._addFloatingText(item.x, item.y - 15, '+1 HEART ❤️', '#ff007f', 26);
          }
          this.itemDrops.splice(i, 1);
        }
      });
    }
  }

  // ── SISTEM NYAWA: HANYA HILANG 1 HATI, KEBAL 2 DETIK, DAN HANYA MATI JIKA 0! ──
  _damagePlayer(p, amount = 1) {
    if (p.lives <= 0 || p.invulnerableTimer > 0) return;

    p.lives -= amount;
    // Jeda kebal 120 frame (~2.0 detik penuh) agar pemain aman bergerak
    p.invulnerableTimer = 120;

    this.sfx.playPlayerHit();
    this._screenShake(16, 5);
    this._spawnParticles(p.x, p.y, '#ff007f', 16);
    this._addFloatingText(p.x, p.y - 25, `-${amount} ❤️`, '#ff007f', 32);

    // HANYA MATI JIKA SELURUH NYAWA TEPAT <= 0!
    if (p.lives <= 0) {
      p.lives = 0;
      this._addFloatingText(p.x, p.y - 45, 'MONKEY DOWN 💥', '#ff1744', 45);
    }
  }

  _screenShake(duration, intensity) {
    this.shakeTimer = duration;
    this.shakeIntensity = intensity;
  }

  _triggerGameOver() {
    this.running = false;
    this.over = true;
    if (typeof window.onGameOver === 'function') {
      window.onGameOver(this.score, this.wave, this.shotsFired, this.shotsHit, this.gemsCollected);
    }
  }

  _spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 4;
      this.particles.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color,
        size: 3 + Math.random() * 3,
        life: 20 + Math.floor(Math.random() * 12)
      });
    }
  }

  _addFloatingText(x, y, text, color, life = 30) {
    this.floatingTexts.push({ x, y, text, color, life, maxLife: life });
  }

  _updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.8;
      ft.life--;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  // ─────────────────────────── COLORFUL PIXEL ART RENDERING ───────────────────────────
  _draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    ctx.save();

    if (this.shakeTimer > 0) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity;
      const sy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(sx, sy);
    }

    // 1. Gambar Background Hutan Tropis Colorful
    this._drawColorfulJungle(ctx, W, H);

    // 2. Item Drops
    this.itemDrops.forEach(it => this._drawItemDrop(ctx, it));

    // 3. Enemies
    this.hunters.forEach(h => this._drawColorfulEnemy(ctx, h));

    // 4. Boss
    if (this.currentBoss) this._drawColorfulBoss(ctx, this.currentBoss);

    // 5. Enemy Bullets
    this.hunterBullets.forEach(b => {
      ctx.save();
      ctx.fillStyle = '#ff1744';
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 8;
      ctx.fillRect(b.x - 3, b.y - 3, 6, 6);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(b.x - 1, b.y - 1, 2, 2);
      ctx.restore();
    });

    // 6. Bananas (Golden Spinning Projectiles)
    this.bananas.forEach(b => this._drawGoldenBanana(ctx, b));

    // 7. Players (P1 & P2 Pixel Monkey)
    if (this.p1.lives > 0) this._drawPixelMonkey(ctx, this.p1);
    if (this.p2 && this.p2.lives > 0) this._drawPixelMonkey(ctx, this.p2);

    // 8. Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.floor(p.size), Math.floor(p.size));
    });

    // 9. Floating Texts
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();

    // 10. Boss Health Bar
    if (this.currentBoss) {
      this._drawBossHud(ctx, W, this.currentBoss);
    }
  }

  // ── BACKGROUND HUTAN TROPIS COLORFUL DENGAN TROTOAR BATU & SUNGAI ──
  _drawColorfulJungle(ctx, W, H) {
    // 1. Rumput Hijau Cerah Berlapis Kotak-kotak (Pixel Checkerboard)
    const tileSize = 20;
    for (let x = 0; x < W; x += tileSize) {
      for (let y = 0; y < H; y += tileSize) {
        const isEven = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
        ctx.fillStyle = isEven ? '#2e7d32' : '#388e3c';
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }

    const aLeft = this.arena.left;
    const aRight = this.arena.right;
    const aWidth = this.arena.width;

    // 2. Jalur Trotoar Batu Alam Hangat (Warm Cobblestone Path)
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(aLeft, 0, aWidth, H);

    // Pola Batu Cobblestone
    ctx.fillStyle = '#a1887f';
    for (let x = aLeft + 6; x < aRight - 10; x += 22) {
      for (let y = 5; y < H; y += 18) {
        ctx.fillRect(x, y, 18, 14);
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 18, 14);
      }
    }

    // Pinggiran Trotoar (Pita Emas & Lumut)
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(aLeft, 0, 4, H);
    ctx.fillRect(aRight - 4, 0, 4, H);

    // 3. Sungai Biru Berkilau di Sisi Kanan (Crystal Stream)
    ctx.fillStyle = '#00b0ff';
    ctx.fillRect(aRight + 15, 0, W - (aRight + 15), H);
    // Gelombang air
    ctx.fillStyle = '#80d8ff';
    for (let y = 10; y < H; y += 30) {
      ctx.fillRect(aRight + 25, y, 40, 4);
      ctx.fillRect(aRight + 45, y + 14, 30, 3);
    }
    // Teratai / Bunga Air
    ctx.fillStyle = '#ff4081';
    ctx.beginPath();
    ctx.arc(aRight + 40, 110, 6, 0, Math.PI * 2);
    ctx.arc(aRight + 65, 270, 7, 0, Math.PI * 2);
    ctx.fill();

    // 4. Bunga-bunga Liar Tropis Penuh Warna
    const dec = this.arena.decorations;
    dec.flowers.forEach(fl => {
      ctx.fillStyle = fl.color;
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, fl.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(fl.x - 1, fl.y - 1, 2, 2);
    });

    // 5. Pilar Kuno Rimba dengan Permata Menyala
    dec.ancientPillars.forEach(p => {
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = '#3e2723';
      ctx.strokeRect(p.x, p.y, p.w, p.h);

      // Permata di tengah pilar
      ctx.save();
      ctx.shadowColor = p.gem;
      ctx.shadowBlur = 10;
      ctx.fillStyle = p.gem;
      ctx.fillRect(p.x + p.w / 2 - 4, p.y + 12, 8, 8);
      ctx.restore();
    });
  }

  // ── SPRITE PIXEL MONKEY (LENGKAP DENGAN 5 AVATAR/SKIN COLORFUL) ──
  _drawPixelMonkey(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    // 1. Energy Shield Bubble (Jika sedang kebal setelah kena hit)
    if (p.invulnerableTimer > 0) {
      ctx.save();
      const shieldHue = (Date.now() * 0.4) % 360;
      ctx.shadowColor = `hsl(${shieldHue}, 100%, 50%)`;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = `hsl(${shieldHue}, 100%, 70%)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.fill();
      ctx.restore();
    }

    // 2. Bayangan Karakter
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 16, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Warna Bulu & Kostum Sesuai Skin
    let furColor = '#795548';
    let chestColor = '#ffccbc';
    let accColor = '#ff1744';

    if (p.skin === 'ninja') {
      furColor = '#212121';
      chestColor = '#424242';
      accColor = '#ff007f'; // Neon magenta
    } else if (p.skin === 'mecha') {
      furColor = '#00b0ff';
      chestColor = '#cfd8dc';
      accColor = '#ffd600';
    } else if (p.skin === 'king') {
      furColor = '#ffd700'; // Radiant Gold!
      chestColor = '#fff9c4';
      accColor = '#d50000'; // Crown Ruby
    } else if (p.skin === 'cosmic') {
      furColor = '#651fff'; // Nebula Violet!
      chestColor = '#b388ff';
      accColor = '#00e5ff';
    }

    // Tubuh Monyet
    ctx.fillStyle = furColor;
    ctx.fillRect(-12, -10, 24, 20);

    // Dada & Perut
    ctx.fillStyle = chestColor;
    ctx.fillRect(-6, -6, 12, 12);

    // Telinga Bulat
    ctx.fillStyle = furColor;
    ctx.fillRect(-4, -14, 6, 4);
    ctx.fillRect(-4, 10, 6, 4);
    ctx.fillStyle = '#ffab91';
    ctx.fillRect(-3, -13, 4, 2);
    ctx.fillRect(-3, 11, 4, 2);

    // Wajah & Moncong
    ctx.fillStyle = chestColor;
    ctx.fillRect(4, -6, 10, 12);

    // Mata Karakter
    ctx.fillStyle = '#000';
    ctx.fillRect(8, -4, 3, 3);
    ctx.fillRect(8, 2, 3, 3);
    ctx.fillStyle = '#fff';
    ctx.fillRect(8, -4, 1, 1);
    ctx.fillRect(8, 2, 1, 1);

    // Aksesoris Spesial
    if (p.skin === 'ninja') {
      // Syal Ninja Melambai
      ctx.fillStyle = accColor;
      ctx.fillRect(-14, -5, 4, 10);
    } else if (p.skin === 'king') {
      // Mahkota Emas Berkilau
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(1, -7, 5, 14);
      ctx.fillStyle = accColor;
      ctx.fillRect(4, -1, 3, 3);
    } else if (p.skin === 'mecha') {
      // Visor Sibernetik
      ctx.fillStyle = accColor;
      ctx.fillRect(8, -4, 3, 9);
    }

    // 4. Golden Banana Blaster (Senjata Pisang Emas Menyala!)
    ctx.save();
    ctx.translate(12, 7);
    ctx.shadowColor = '#ffd600';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffd600';
    ctx.fillRect(0, -3, 15, 6);
    ctx.fillStyle = '#fff';
    ctx.fillRect(12, -2, 4, 4); // Moncong bersinar
    ctx.restore();

    ctx.restore();
  }

  // ── SPRITE MUSUH COLORFUL BERDASARKAN TIPE ──
  _drawColorfulEnemy(ctx, h) {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(h.angle);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 2, h.radius, h.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    if (h.type === 'zookeeper') {
      // ZOOKEEPER: Baju safari khaki + Topi rimba + Jaring kupu-kupu besar!
      ctx.fillStyle = '#c5a059';
      ctx.fillRect(-10, -9, 20, 18);
      // Topi
      ctx.fillStyle = '#558b2f';
      ctx.fillRect(-12, -12, 16, 24);
      // Jaring Penangkap
      ctx.strokeStyle = '#80d8ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(14, 8, 10, 0, Math.PI * 2);
      ctx.stroke();
    } else if (h.type === 'shooter') {
      // DART HUNTER: Jaket merah menyala + Kacamata goggle hijau
      ctx.fillStyle = '#e53935';
      ctx.fillRect(-10, -9, 20, 18);
      // Senapan
      ctx.fillStyle = '#212121';
      ctx.fillRect(4, 5, 16, 4);
      // Goggle
      ctx.fillStyle = '#76ff03';
      ctx.fillRect(6, -4, 3, 8);
    } else if (h.type === 'armored') {
      // ARMORED GUARD: Pelindung tameng baja cyan transparan
      ctx.fillStyle = '#1565c0';
      ctx.fillRect(-11, -10, 22, 20);
      // Tameng
      ctx.fillStyle = 'rgba(0, 229, 255, 0.65)';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.fillRect(10, -12, 6, 24);
      ctx.strokeRect(10, -12, 6, 24);
    } else if (h.type === 'sniper') {
      // COMMANDER SNIPER: Jubah loreng & garis laser bidik merah
      ctx.fillStyle = '#33691e';
      ctx.fillRect(-10, -8, 20, 16);
      ctx.fillStyle = '#000';
      ctx.fillRect(4, 4, 20, 3);
      // Laser bidik
      ctx.strokeStyle = 'rgba(255, 23, 68, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(24, 5);
      ctx.lineTo(160, 5);
      ctx.stroke();
    } else if (h.type === 'jeep') {
      // SAFARI JEEP: Mobil off-road kuning cerah + 4 roda hitam
      ctx.fillStyle = '#ff8f00';
      ctx.fillRect(-22, -14, 44, 28);
      // Kap & Kaca Depan
      ctx.fillStyle = '#80d8ff';
      ctx.fillRect(2, -10, 10, 20);
      // 4 Roda Berputar
      ctx.fillStyle = '#212121';
      ctx.fillRect(-18, -17, 10, 4);
      ctx.fillRect(8, -17, 10, 4);
      ctx.fillRect(-18, 13, 10, 4);
      ctx.fillRect(8, 13, 10, 4);
      // Lampu Depan Kuning Terang
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(22, -9, 3, 5);
      ctx.fillRect(22, 4, 3, 5);
    }

    ctx.restore();
  }

  // ── SPRITE BOSS COLORFUL TIAP LEVEL ──
  _drawColorfulBoss(ctx, boss) {
    ctx.save();
    ctx.translate(boss.x, boss.y);
    ctx.rotate(boss.angle);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 4, boss.radius + 6, boss.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bodi Utama Mech Boss
    ctx.fillStyle = '#d50000';
    ctx.fillRect(-28, -24, 56, 48);
    ctx.strokeStyle = '#ffd600';
    ctx.lineWidth = 3;
    ctx.strokeRect(-28, -24, 56, 48);

    // Inti Energi Tengah
    ctx.fillStyle = '#ffd600';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Meriam Ganda Kiri & Kanan
    ctx.fillStyle = '#212121';
    ctx.fillRect(18, -14, 24, 7);
    ctx.fillRect(18, 7, 24, 7);

    // Laser Telegraph
    if (boss.telegraphTimer > 0) {
      ctx.strokeStyle = 'rgba(255, 23, 68, 0.75)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(42, 0);
      ctx.lineTo(300, 0);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  _drawBossHud(ctx, W, boss) {
    const barW = 340;
    const barH = 14;
    const barX = W / 2 - barW / 2;
    const barY = 16;

    ctx.fillStyle = 'rgba(10, 20, 10, 0.9)';
    ctx.fillRect(barX - 4, barY - 4, barW + 8, barH + 8);
    ctx.strokeStyle = '#ff1744';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX - 4, barY - 4, barW + 8, barH + 8);

    const hpPct = Math.max(0, boss.hp / boss.maxHp);
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(barX, barY, barW * hpPct, barH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${boss.name} [HP: ${Math.ceil(boss.hp)} / ${boss.maxHp}]`, W / 2, barY + 11);
  }

  // ── PELURU PISANG EMAS BERPUTAR ──
  _drawGoldenBanana(ctx, b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rotation);

    ctx.shadowColor = '#ffd600';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffea00';
    // Bentuk Pisang Melengkung
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0.2, Math.PI - 0.2, false);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffd600';
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.fillRect(-2, -2, 4, 4);

    ctx.restore();
  }

  // ── ITEM DROPS BERKILAU (DIAMOND, HEART, AMMO) ──
  _drawItemDrop(ctx, item) {
    const bob = Math.sin(Date.now() * 0.006 + item.floatOffset) * 4;
    const x = item.x;
    const y = item.y + bob;

    ctx.save();
    if (item.type === 'gem') {
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.moveTo(x, y - 8);
      ctx.lineTo(x + 7, y - 2);
      ctx.lineTo(x, y + 8);
      ctx.lineTo(x - 7, y - 2);
      ctx.closePath();
      ctx.fill();
    } else if (item.type === 'ammo') {
      ctx.shadowColor = '#ffd600';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ffd600';
      ctx.fillRect(x - 6, y - 6, 12, 12);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 2, y - 4, 4, 8);
    } else if (item.type === 'health') {
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(x - 6, y - 2, 12, 4);
      ctx.fillRect(x - 2, y - 6, 4, 12);
    }
    ctx.restore();
  }

  // ── LOOP FRAME ENGINE ──
  _loop() {
    if (!this.running) return;

    try {
      this._update();
      this._draw();
    } catch (err) {
      console.error("Game loop error:", err);
    }

    if (!this.over && this.running) {
      requestAnimationFrame(() => this._loop());
    }
  }
}

window.MonkeyBananaShooter = MonkeyBananaShooter;
