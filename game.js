/**
 * game.js — Monkey Banana Shooter (Cyberpunk Neo-Pixel Edition)
 * Visual Style matching reference:
 * - Rich Cyberpunk Street & Neo-Jungle aesthetic (Tiled sidewalks, neon signage, glowing vending machines, lanterns)
 * - Dynamic Neon Lighting & Ambient Blooms (Cyan, Magenta, Gold, Emerald)
 * - Cyberpunk Character Sprites (Cyber Monkey with glowing energy banana blaster, patrol guards, hover-jeeps)
 * - Rock-solid 5-Heart HP System: ONLY dies when all 5 hearts reach 0!
 *   - Energy shield bubble with 2-second invulnerability after being hit (prevents spam damage)
 * - Cyberpunk RPG HUD matching the screenshot (HP Bar, Shield/Stamina Bar, Energy/Ammo Bar)
 * - Bosses with telegraphing & balanced health
 * - Web Audio API Cyberpunk Synth Sounds
 */

// ============================================================================
// 1. CYBERPUNK SOUND SYNTHESIZER
// ============================================================================
class CyberSoundSystem {
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

  // Plasma Banana Shot
  playShoot(upgradeLevel = 1) {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = upgradeLevel >= 4 ? 'sawtooth' : 'triangle';
    const startF = 440 + upgradeLevel * 60;
    osc.frequency.setValueAtTime(startF, t);
    osc.frequency.exponentialRampToValueAtTime(880 + upgradeLevel * 80, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.14);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Cyber Reload / Power Recharge
  playReload() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [0, 0.15, 0.32].forEach((delay, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(i === 2 ? 740 : 380, t + delay);
      gain.gain.setValueAtTime(0.2, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.08);
    });
  }

  // Cyber Dash / Dodge Roll
  playDodge() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.21);
  }

  // Pickup Item
  playPickup(type) {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = type === 'gem' ? [587, 740, 880, 1174] : type === 'health' ? [440, 554, 659, 880] : [392, 493, 587];
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

  // Laser / Enemy Shoot
  playEnemyShoot() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(360, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.14);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Shield Deflect / Player Damage
  playPlayerHit() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(100, t + 0.22);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.23);
  }

  // Plasma Explosion
  playExplosion() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.42);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.42);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.44);
  }
}

// ============================================================================
// 2. MAIN ENGINE: CYBERPUNK MONKEY SHOOTER
// ============================================================================
class MonkeyBananaShooter {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 640;
    this.canvas.height = 460;
    this.ctx.imageSmoothingEnabled = false;

    // Config options
    this.isDuo = options.isDuo || false;
    this.bgTheme = options.bgTheme || 'jungle';
    this.skinP1 = options.skinP1 || 'classic';
    this.weaponLevel = options.weaponLevel || 1;
    this.playerAccount = options.playerAccount || null;

    this.sfx = new CyberSoundSystem();

    // Stats
    this.score = 0;
    this.wave = 1;
    this.gemsCollected = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.running = false;
    this.over = false;

    // Boss
    this.currentBoss = null;

    // Entities
    this.bananas = [];
    this.hunters = [];
    this.hunterBullets = [];
    this.itemDrops = [];
    this.particles = [];
    this.floatingTexts = [];

    // Screen Shake
    this.shakeTimer = 0;
    this.shakeIntensity = 0;

    // Input
    this.keys = {};
    this.mouseX = this.canvas.width / 2;
    this.mouseY = this.canvas.height / 2;
    this.mouseDown = false;

    // Player 1 (5 Full Hearts, rock solid!)
    this.p1 = this._createPlayer(this.canvas.width / 2 - (this.isDuo ? 40 : 0), this.canvas.height - 80, this.skinP1, 1);
    this.p2 = this.isDuo ? this._createPlayer(this.canvas.width / 2 + 40, this.canvas.height - 80, 'chimp_blue', 2) : null;

    // Cyber Street Bounds & Props (Matching screenshot: Marts, Stairs, Terminals, Neon)
    this.street = {
      left: 110,
      right: 530,
      width: 420,
      shops: this._generateCyberCityProps()
    };

    // Wave Progression
    this.waveTotalEnemies = 0;
    this.waveSpawnedEnemies = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 110;

    this._bindEvents();
    this.startGame();
  }

  _createPlayer(x, y, skin, id) {
    return {
      id: id,
      x: x,
      y: y,
      radius: 18,
      speed: 3.9,
      angle: -Math.PI / 2,

      // ── SISTEM NYAWA: 5 HATI PENUH (HANYA MATI JIKA HABIS 0!) ──
      lives: 5,
      maxLives: 5,
      skin: skin,

      // Amunisi & Magasin
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
      shieldMaxTimer: 110 // ~1.9 detik kebal anti-spam!
    };
  }

  // ── GENERATE CYBERPUNK CITY PROPS (Matching Screenshot) ──
  _generateCyberCityProps() {
    return {
      // Toko Kiri: "WEFCO MART" & "YOKU FORGE"
      leftBuildings: [
        { name: 'wefco mart', x: 8, y: 35, w: 100, h: 95, color: '#162238', signColor: '#00e5ff' },
        { name: 'yoku forge', x: 8, y: 220, w: 100, h: 100, color: '#251b38', signColor: '#00e5ff' },
        { name: 'cyber terminal', x: 8, y: 345, w: 95, h: 95, color: '#1a1930', signColor: '#ff007f' }
      ],
      // Toko Kanan: "SOUL LINK" & "CYBER SHRINE"
      rightBuildings: [
        { name: 'soul LINK', x: 532, y: 40, w: 100, h: 95, color: '#1d1933', signColor: '#00e5ff' },
        { name: 'torii tech', x: 532, y: 225, w: 100, h: 95, color: '#2b1d2e', signColor: '#ff007f' },
        { name: 'storage pod', x: 535, y: 345, w: 95, h: 95, color: '#182436', signColor: '#ffd700' }
      ],
      // Vending machines & street lamps
      vendingMachines: [
        { x: 92, y: 145, color: '#00e5ff', label: 'BUZZ' },
        { x: 540, y: 150, color: '#ff007f', label: 'SHOP' },
        { x: 92, y: 325, color: '#ffd600', label: 'POTION' }
      ],
      // Decals (Stairs, sewer grates, cables)
      stairs: [
        { y: 170, h: 40 },
        { y: 310, h: 35 }
      ]
    };
  }

  // ─────────────────────────── EVENT BINDING ───────────────────────────
  _bindEvents() {
    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      this.mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    });

    this.canvas.addEventListener('mousedown', e => {
      if (e.button === 0 && this.running && !this.over) {
        this.mouseDown = true;
        this._tryShootPlayer(this.p1);
      }
    });

    window.addEventListener('mouseup', () => { this.mouseDown = false; });

    // Touch
    this.canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = (e.touches[0].clientX - rect.left) * (this.canvas.width / rect.width);
      this.mouseY = (e.touches[0].clientY - rect.top) * (this.canvas.height / rect.height);
    }, { passive: false });

    this.canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = (e.touches[0].clientX - rect.left) * (this.canvas.width / rect.width);
      this.mouseY = (e.touches[0].clientY - rect.top) * (this.canvas.height / rect.height);
      if (this.running && !this.over) this._tryShootPlayer(this.p1);
    }, { passive: false });

    // Keyboard
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (!this.running || this.over) return;

      // P1 Dodge: SPASI
      if (e.code === 'Space') {
        e.preventDefault();
        this._performDodge(this.p1);
      }
      // P1 Reload: R
      if (e.code === 'KeyR') {
        this._startReload(this.p1);
      }

      // P2 Controls
      if (this.p2 && this.p2.lives > 0) {
        if (e.code === 'Numpad0' || e.code === 'Enter' || e.code === 'KeyK') {
          this._tryShootPlayer(this.p2);
        }
        if (e.code === 'ShiftRight' || e.code === 'KeyM') {
          this._performDodge(this.p2);
        }
        if (e.code === 'KeyL' || e.code === 'KeyP') {
          this._startReload(this.p2);
        }
      }
    });

    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });
  }

  // ─────────────────────────── GAMEPLAY LOGIC ───────────────────────────
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

    // Reset P1 (5 Nyawa)
    this.p1 = this._createPlayer(this.canvas.width / 2 - (this.isDuo ? 40 : 0), this.canvas.height - 80, this.skinP1, 1);
    if (this.isDuo) {
      this.p2 = this._createPlayer(this.canvas.width / 2 + 40, this.canvas.height - 80, 'chimp_blue', 2);
    }

    this._startWave(1);
    this._loop();
  }

  _startWave(w) {
    this.wave = w;
    this.bananas = [];
    this.hunterBullets = [];
    this.hunters = [];
    this.currentBoss = null;

    this.waveTotalEnemies = 4 + w * 2;
    this.waveSpawnedEnemies = 0;
    this.spawnTimer = 35;
    this.spawnInterval = Math.max(65, 120 - w * 6);

    this._addFloatingText(this.canvas.width / 2, this.canvas.height / 2, `⚡ SECTOR ${w} ACTIVE!`, '#00e5ff', 45);
  }

  _performDodge(p) {
    if (p.isDodging || p.stamina < 30 || p.lives <= 0) return;

    p.stamina -= 30;
    p.isDodging = true;
    p.dodgeTimer = p.dodgeDuration;
    p.invulnerableTimer = p.dodgeDuration + 10;
    this.sfx.playDodge();

    const dashSpeed = 9.2;
    p.dodgeVx = Math.cos(p.angle) * dashSpeed;
    p.dodgeVy = Math.sin(p.angle) * dashSpeed;

    this._addFloatingText(p.x, p.y - 20, 'CYBER DASH! ⚡', '#00e5ff', 20);
    this._spawnParticles(p.x, p.y, '#00e5ff', 8);
  }

  _startReload(p) {
    if (p.isReloading || p.ammoMag >= p.maxAmmoMag || p.ammoStock <= 0) return;
    p.isReloading = true;
    p.reloadTimer = p.reloadDuration;
    this.sfx.playReload();
    this._addFloatingText(p.x, p.y - 25, 'RECHARGING... 🔋', '#ffeb3b', 25);
  }

  _finishReload(p) {
    const need = p.maxAmmoMag - p.ammoMag;
    const can = Math.min(need, p.ammoStock);
    p.ammoMag += can;
    p.ammoStock -= can;
    p.isReloading = false;
    this._addFloatingText(p.x, p.y - 25, 'PLASMA READY! ⚡', '#00e676', 20);
  }

  _tryShootPlayer(p) {
    if (!p || p.lives <= 0 || p.isDodging || p.isReloading) return;

    if (p.ammoMag <= 0) {
      if (p.ammoStock > 0) this._startReload(p);
      else this._addFloatingText(p.x, p.y - 25, 'CORE DEPLETED!', '#ff1744', 20);
      return;
    }

    p.ammoMag--;
    this.shotsFired++;
    this.sfx.playShoot(this.weaponLevel);

    const angle = p.angle;
    const speed = 10.2;

    if (this.weaponLevel === 1) {
      this._spawnBananaProjectile(p.x, p.y, angle, speed, 1, false);
    } else if (this.weaponLevel === 2) {
      this._spawnBananaProjectile(p.x, p.y, angle, speed * 1.25, 2, false);
    } else if (this.weaponLevel === 3) {
      this._spawnBananaProjectile(p.x + Math.cos(angle + 1.57) * 8, p.y + Math.sin(angle + 1.57) * 8, angle, speed, 2, false);
      this._spawnBananaProjectile(p.x + Math.cos(angle - 1.57) * 8, p.y + Math.sin(angle - 1.57) * 8, angle, speed, 2, false);
    } else if (this.weaponLevel === 4) {
      [-0.18, 0, 0.18].forEach(spread => {
        this._spawnBananaProjectile(p.x, p.y, angle + spread, speed, 2, false);
      });
    } else {
      this._spawnBananaProjectile(p.x, p.y, angle, speed * 1.15, 4, true);
    }
  }

  _spawnBananaProjectile(x, y, angle, speed, damage, isExplosive) {
    this.bananas.push({
      x: x + Math.cos(angle) * 22,
      y: y + Math.sin(angle) * 22,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: angle,
      rotSpeed: 0.35,
      damage: damage,
      isExplosive: isExplosive,
      radius: isExplosive ? 14 : 9
    });
  }

  // ─────────────────────────── MUSUH BERKECEPATAN SANTAI ───────────────────────────
  _spawnEnemy() {
    const w = this.wave;
    let type = 'zookeeper';

    if (w === 1) {
      type = 'zookeeper';
    } else if (w >= 2 && w < 5) {
      type = Math.random() > 0.4 ? 'hunter' : 'zookeeper';
    } else {
      const r = Math.random();
      type = r < 0.3 ? 'jeep' : r < 0.7 ? 'hunter' : 'zookeeper';
    }

    const spawnX = this.street.left + 40 + Math.random() * (this.street.width - 80);
    const spawnY = -40;

    let hp = 1;
    let speed = 0.95; // Santai & terukur
    let radius = 18;

    if (type === 'zookeeper') {
      hp = 1 + Math.floor(w / 4);
      speed = 0.95;
    } else if (type === 'hunter') {
      hp = 2 + Math.floor(w / 4);
      speed = 0.75;
    } else if (type === 'jeep') {
      hp = 4 + w;
      speed = 1.25;
      radius = 28;
    }

    this.hunters.push({
      type: type,
      x: spawnX,
      y: spawnY,
      radius: radius,
      speed: speed,
      hp: hp,
      maxHp: hp,
      angle: Math.PI / 2,
      canShoot: type === 'hunter' || type === 'jeep',
      shootCooldown: 80 + Math.floor(Math.random() * 80),
      walkCycle: 0
    });
  }

  // ─────────────────────────── BOSS GAMPANG & BERSAHABAT ───────────────────────────
  _spawnBoss() {
    this.sfx.playBossAlert();
    this._screenShake(18, 4);

    const w = this.wave;
    let bossName = `Cyborg Warden (Lv.${w})`;
    let bossType = 'boss_zookeeper';

    // HP disesuaikan agar mudah dikalahkan & menyenangkan
    let maxHp = 14;
    if (w >= 2 && w < 5) {
      bossName = `Laser Commander (Lv.${w})`;
      bossType = 'boss_hunter';
      maxHp = 20 + (w - 2) * 4;
    } else if (w >= 5) {
      bossName = `Heavy Cyber-Jeep (Lv.${w})`;
      bossType = 'boss_jeep';
      maxHp = 30 + (w - 5) * 5;
    }

    this.currentBoss = {
      name: bossName,
      type: bossType,
      x: this.canvas.width / 2,
      y: -60,
      radius: 35,
      speed: 0.75,
      hp: maxHp,
      maxHp: maxHp,
      angle: Math.PI / 2,
      shootCooldown: 110,
      telegraphTimer: 0,
      walkCycle: 0
    };

    this._addFloatingText(this.canvas.width / 2, 75, `⚠️ BOSS WARNING: ${bossName}!`, '#ff007f', 50);
  }

  // ─────────────────────────── ITEM DROPS ───────────────────────────
  _dropRandomItem(x, y) {
    if (Math.random() > 0.5) return;

    const r = Math.random();
    let itemType = 'gem';

    if (r < 0.40) itemType = 'gem';
    else if (r < 0.70) itemType = 'ammo';
    else if (r < 0.85) itemType = 'health'; // Sering drop hati!
    else itemType = 'stamina';

    this.itemDrops.push({
      type: itemType,
      x: x,
      y: y,
      life: 600,
      floatOffset: Math.random() * Math.PI * 2
    });
  }

  // ─────────────────────────── UPDATE LOOP ───────────────────────────
  _update() {
    if (!this.running || this.over) return;

    if (this.shakeTimer > 0) this.shakeTimer--;

    // 1. Players
    this._updatePlayerMovement(this.p1, 'KeyW', 'KeyS', 'KeyA', 'KeyD', this.mouseX, this.mouseY);

    if (this.mouseDown && Math.random() < 0.22) {
      this._tryShootPlayer(this.p1);
    }

    if (this.p2 && this.p2.lives > 0) {
      let tx = this.p2.x;
      let ty = this.p2.y - 100;
      if (this.hunters.length > 0) {
        tx = this.hunters[0].x;
        ty = this.hunters[0].y;
      }
      this._updatePlayerMovement(this.p2, 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', tx, ty);
    }

    // 2. Spawn enemies / Boss
    if (this.waveSpawnedEnemies < this.waveTotalEnemies) {
      this.spawnTimer--;
      if (this.spawnTimer <= 0) {
        this._spawnEnemy();
        this.waveSpawnedEnemies++;
        this.spawnTimer = this.spawnInterval;
      }
    } else if (!this.currentBoss && this.hunters.length === 0) {
      this._spawnBoss();
    }

    // 3. Boss
    if (this.currentBoss) this._updateBoss(this.currentBoss);

    // 4. Regular Enemies
    for (let i = this.hunters.length - 1; i >= 0; i--) {
      this._updateHunter(this.hunters[i], i);
    }

    // 5. Bananas
    this._updateBananas();

    // 6. Enemy Bullets
    this._updateHunterBullets();

    // 7. Drops
    this._updateItemDrops();

    // 8. Particles & Texts
    this._updateParticles();

    // 9. GAME OVER: HANYA JIKA NYAWA BENAR-BENAR HABIS <= 0!
    const p1Dead = this.p1.lives <= 0;
    const p2Dead = this.isDuo ? (this.p2 && this.p2.lives <= 0) : true;
    if (p1Dead && p2Dead) {
      this._triggerGameOver();
    }
  }

  _updatePlayerMovement(player, upKey, downKey, leftKey, rightKey, targetX, targetY) {
    if (player.lives <= 0) return;

    if (player.stamina < player.maxStamina && !player.isDodging) {
      player.stamina = Math.min(player.maxStamina, player.stamina + 0.45);
    }

    if (player.isReloading) {
      player.reloadTimer--;
      if (player.reloadTimer <= 0) this._finishReload(player);
    }

    if (player.isDodging) {
      player.x += player.dodgeVx;
      player.y += player.dodgeVy;
      player.dodgeTimer--;
      if (player.dodgeTimer <= 0) player.isDodging = false;
    } else {
      let mx = 0;
      let my = 0;
      if (this.keys[upKey]) my -= 1;
      if (this.keys[downKey]) my += 1;
      if (this.keys[leftKey]) mx -= 1;
      if (this.keys[rightKey]) mx += 1;

      if (mx !== 0 && my !== 0) {
        mx *= 0.7071;
        my *= 0.7071;
      }

      player.x += mx * player.speed;
      player.y += my * player.speed;
    }

    const pad = 24;
    player.x = Math.max(pad, Math.min(this.canvas.width - pad, player.x));
    player.y = Math.max(pad, Math.min(this.canvas.height - pad, player.y));

    player.angle = Math.atan2(targetY - player.y, targetX - player.x);

    if (player.invulnerableTimer > 0) player.invulnerableTimer--;
  }

  _updateHunter(h, index) {
    h.walkCycle += 0.1;
    const targetPlayer = (this.p2 && this.p2.lives > 0 && Math.random() > 0.5) ? this.p2 : this.p1;
    const angleToP = Math.atan2(targetPlayer.y - h.y, targetPlayer.x - h.x);
    h.angle = angleToP;

    h.x += Math.cos(angleToP) * h.speed * 0.7;
    h.y += Math.sin(angleToP) * h.speed;

    if (h.canShoot) {
      h.shootCooldown--;
      if (h.shootCooldown <= 0) {
        h.shootCooldown = h.type === 'jeep' ? 80 : 120 + Math.floor(Math.random() * 40);
        this.sfx.playEnemyShoot();

        const bSpeed = 4.2;
        this.hunterBullets.push({
          x: h.x + Math.cos(h.angle) * 20,
          y: h.y + Math.sin(h.angle) * 20,
          vx: Math.cos(h.angle) * bSpeed,
          vy: Math.sin(h.angle) * bSpeed,
          radius: 5
        });

        if (h.type === 'jeep') {
          this.hunterBullets.push({
            x: h.x + Math.cos(h.angle + 0.2) * 20,
            y: h.y + Math.sin(h.angle + 0.2) * 20,
            vx: Math.cos(h.angle + 0.2) * bSpeed,
            vy: Math.sin(h.angle + 0.2) * bSpeed,
            radius: 5
          });
        }
      }
    }

    [this.p1, this.p2].forEach(p => {
      if (!p || p.lives <= 0) return;
      const d = Math.hypot(h.x - p.x, h.y - p.y);
      if (d < h.radius + p.radius) {
        if (p.invulnerableTimer === 0) {
          this._damagePlayer(p, 1);
        }
        // Always push enemy back so it doesn't overlap or spam damage
        const pushAngle = Math.atan2(h.y - p.y, h.x - p.x);
        h.x += Math.cos(pushAngle) * 45;
        h.y += Math.sin(pushAngle) * 45;
      }
    });
  }

  _updateBoss(boss) {
    boss.walkCycle += 0.08;
    const targetPlayer = (this.p2 && this.p2.lives > 0 && Math.random() > 0.5) ? this.p2 : this.p1;
    const angleToP = Math.atan2(targetPlayer.y - boss.y, targetPlayer.x - boss.x);
    boss.angle = angleToP;

    if (boss.y < 115) {
      boss.y += boss.speed * 1.2;
    } else {
      boss.x += Math.sin(Date.now() * 0.0018) * boss.speed * 1.6;
      boss.y += Math.cos(Date.now() * 0.0025) * boss.speed * 0.5;
    }

    boss.shootCooldown--;
    if (boss.shootCooldown <= 25) {
      boss.telegraphTimer = 25;
    }

    if (boss.shootCooldown <= 0) {
      boss.shootCooldown = 110;
      this.sfx.playEnemyShoot();

      [-0.25, 0, 0.25].forEach(spread => {
        this.hunterBullets.push({
          x: boss.x + Math.cos(boss.angle + spread) * 32,
          y: boss.y + Math.sin(boss.angle + spread) * 32,
          vx: Math.cos(boss.angle + spread) * 3.4,
          vy: Math.sin(boss.angle + spread) * 3.4,
          radius: 7
        });
      });
    }

    [this.p1, this.p2].forEach(p => {
      if (!p || p.lives <= 0) return;
      const d = Math.hypot(boss.x - p.x, boss.y - p.y);
      if (d < boss.radius + p.radius) {
        if (p.invulnerableTimer === 0) {
          this._damagePlayer(p, 1);
        }
        // Push player safely away from boss
        const pushAngle = Math.atan2(p.y - boss.y, p.x - boss.x);
        p.x = Math.max(this.street.left + 25, Math.min(this.street.right - 25, p.x + Math.cos(pushAngle) * 45));
        p.y = Math.max(60, Math.min(this.canvas.height - 40, p.y + Math.sin(pushAngle) * 45));
      }
    });
  }

  _updateBananas() {
    for (let i = this.bananas.length - 1; i >= 0; i--) {
      const b = this.bananas[i];
      b.x += b.vx;
      b.y += b.vy;
      b.rotation += b.rotSpeed;

      if (b.x < -30 || b.x > this.canvas.width + 30 || b.y < -30 || b.y > this.canvas.height + 30) {
        this.bananas.splice(i, 1);
        continue;
      }

      if (this.currentBoss) {
        const d = Math.hypot(b.x - this.currentBoss.x, b.y - this.currentBoss.y);
        if (d < b.radius + this.currentBoss.radius) {
          this.shotsHit++;
          this.currentBoss.hp -= b.damage;
          this.sfx.playHit();
          this._spawnParticles(b.x, b.y, '#00e5ff', 8);
          this._addFloatingText(this.currentBoss.x, this.currentBoss.y - 20, `-${b.damage}`, '#ffeb3b', 18);

          if (b.isExplosive) this._triggerExplosion(b.x, b.y, 65, 3);

          if (this.currentBoss.hp <= 0) {
            this.score += 2000 * this.wave;
            this._screenShake(25, 6);
            this.sfx.playExplosion();
            this._spawnParticles(this.currentBoss.x, this.currentBoss.y, '#ff007f', 35);
            this._addFloatingText(this.currentBoss.x, this.currentBoss.y, '🏆 BOSS CLEARED!', '#00e5ff', 45);

            for (let g = 0; g < 7; g++) {
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
            }, 1200);
          }

          this.bananas.splice(i, 1);
          continue;
        }
      }

      for (let j = this.hunters.length - 1; j >= 0; j--) {
        const h = this.hunters[j];
        const d = Math.hypot(b.x - h.x, b.y - h.y);
        if (d < b.radius + h.radius) {
          this.shotsHit++;
          h.hp -= b.damage;
          this.sfx.playHit();
          this._spawnParticles(h.x, h.y, '#00e5ff', 7);
          this._addFloatingText(h.x, h.y - 15, `-${b.damage}`, '#ffeb3b', 16);

          if (b.isExplosive) this._triggerExplosion(b.x, b.y, 55, 3);

          if (h.hp <= 0) {
            this.score += (h.type === 'jeep' ? 400 : 150) * this.wave;
            this._spawnParticles(h.x, h.y, h.type === 'jeep' ? '#ff007f' : '#00e5ff', 15);
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
    this._screenShake(16, 4);
    this._spawnParticles(x, y, '#ff007f', 22);

    this.hunters.forEach(h => {
      if (Math.hypot(h.x - x, h.y - y) < radius + h.radius) h.hp -= damage;
    });
    if (this.currentBoss && Math.hypot(this.currentBoss.x - x, this.currentBoss.y - y) < radius + this.currentBoss.radius) {
      this.currentBoss.hp -= damage;
    }
  }

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
          // Hanya kena jika tidak dalam perlindungan shield!
          if (p.invulnerableTimer === 0) {
            this._damagePlayer(p, 1);
          }
        }
      });
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
            this._addFloatingText(item.x, item.y - 15, '+1 GEM 💎', '#00e5ff', 22);
          } else if (item.type === 'ammo') {
            p.ammoStock = Math.min(250, p.ammoStock + 24);
            this.sfx.playPickup('ammo');
            this._addFloatingText(item.x, item.y - 15, '+24 AMMO 🔋', '#ffeb3b', 22);
          } else if (item.type === 'health') {
            p.lives = Math.min(p.maxLives, p.lives + 1);
            this.sfx.playPickup('health');
            this._addFloatingText(item.x, item.y - 15, '+1 HEART ❤️', '#ff007f', 22);
          } else if (item.type === 'stamina') {
            p.stamina = p.maxStamina;
            this.sfx.playPickup('ammo');
            this._addFloatingText(item.x, item.y - 15, 'MAX SHIELD ⚡', '#00e5ff', 22);
          }
          this.itemDrops.splice(i, 1);
        }
      });
    }
  }

  // ── SISTEM NYAWA: HANYA HILANG 1 HATI DENGAN SHIELD PERLINDUNGAN LAMA ──
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
      this._addFloatingText(p.x, p.y - 45, 'UNIT DOWN 💥', '#ff1744', 45);
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
        size: 2.5 + Math.random() * 3.5,
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

  get accuracy() {
    return this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;
  }

  // ─────────────────────────── CYBERPUNK NEO-PIXEL RENDERING ───────────────────────────
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

    // 1. Cyberpunk Street & Mart Background (Matching reference screenshot)
    this._drawCyberStreetBackground(ctx, W, H);

    // 2. Item Drops
    this.itemDrops.forEach(item => {
      this._drawCyberItemDrop(ctx, item);
    });

    // 3. Enemies
    this.hunters.forEach(h => {
      this._drawCyberEnemy(ctx, h);
    });

    // 4. Boss
    if (this.currentBoss) {
      this._drawCyberBoss(ctx, this.currentBoss);
    }

    // 5. Enemy Laser Bullets
    this.hunterBullets.forEach(b => {
      ctx.save();
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(b.x - 3, b.y - 3, 6, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(b.x - 1, b.y - 1, 2, 2);
      ctx.restore();
    });

    // 6. Glowing Plasma Bananas
    this.bananas.forEach(b => {
      this._drawPlasmaBanana(ctx, b);
    });

    // 7. Players (Cyber Monkey with Energy Weapon)
    if (this.p1.lives > 0) this._drawCyberMonkey(ctx, this.p1);
    if (this.p2 && this.p2.lives > 0) this._drawCyberMonkey(ctx, this.p2);

    // 8. Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.floor(p.size), Math.floor(p.size));
    });

    // 9. Floating texts
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 5;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();

    // 10. Cyberpunk Boss Bar
    if (this.currentBoss) {
      this._drawCyberBossHud(ctx, W, this.currentBoss);
    }
  }

  // ── CYBERPUNK STREET BACKGROUND (TILED SIDEWALKS, NEON SIGNS, WEFCO MART) ──
  _drawCyberStreetBackground(ctx, W, H) {
    // 1. Dark Indigo/Purple Night Foundation
    ctx.fillStyle = '#0f0e1c';
    ctx.fillRect(0, 0, W, H);

    const sLeft = this.street.left;
    const sRight = this.street.right;
    const sWidth = this.street.width;

    // 2. Central Paved Cyber Street / Plaza (Tiled Sidewalk Grid like Screenshot)
    const streetGrad = ctx.createLinearGradient(sLeft, 0, sRight, 0);
    streetGrad.addColorStop(0, '#1c1b30');
    streetGrad.addColorStop(0.5, '#282747');
    streetGrad.addColorStop(1, '#1c1b30');
    ctx.fillStyle = streetGrad;
    ctx.fillRect(sLeft, 0, sWidth, H);

    // Checkered Tile Pattern (Like screenshot pavement tiles)
    const tileSize = 20;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let x = sLeft; x < sRight; x += tileSize) {
      for (let y = 0; y < H; y += tileSize) {
        if ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0) {
          ctx.fillRect(x, y, tileSize, tileSize);
        }
      }
    }

    // Right-Side Cracked Dune / Wasteland Outpost (Matching Reference Screenshot)
    ctx.save();
    ctx.fillStyle = '#262238';
    ctx.fillRect(sRight, 0, W - sRight, H);
    // Sandy cracked polygon overlay
    ctx.fillStyle = '#453a54';
    ctx.beginPath();
    ctx.moveTo(sRight + 5, 40);
    ctx.bezierCurveTo(sRight + 25, 80, sRight + 15, 160, sRight + 30, 220);
    ctx.bezierCurveTo(sRight + 45, 280, sRight + 10, 360, sRight + 35, H);
    ctx.lineTo(W, H);
    ctx.lineTo(W, 40);
    ctx.closePath();
    ctx.fill();

    // Cracked ground lines
    ctx.strokeStyle = '#2b2236';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sRight + 40, 80); ctx.lineTo(sRight + 75, 110); ctx.lineTo(sRight + 60, 140);
    ctx.moveTo(sRight + 55, 120); ctx.lineTo(sRight + 90, 130);
    ctx.moveTo(sRight + 30, 240); ctx.lineTo(sRight + 70, 270); ctx.lineTo(sRight + 85, 250);
    ctx.stroke();

    // Wall Retaining Border with "soul LiNk v2.1" Graffiti
    ctx.fillStyle = '#181628';
    ctx.fillRect(sRight - 2, 40, 8, 120);
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillText('soul LiNk v2.1', sRight + 16, 75);
    ctx.shadowBlur = 0;
    ctx.restore();

    // Street Curbs & Neon Guide Stripes
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 6;
    ctx.fillRect(sLeft, 0, 3, H);
    ctx.fillRect(sRight - 3, 0, 3, H);
    ctx.shadowBlur = 0;

    // Decal Stairs (Like screenshot central stair flights)
    ctx.fillStyle = '#161529';
    ctx.fillRect(sLeft + 20, 160, sWidth - 40, 35);
    ctx.fillRect(sLeft + 20, 310, sWidth - 40, 35);
    ctx.fillStyle = '#39375e';
    for (let st = 160; st <= 190; st += 7) ctx.fillRect(sLeft + 20, st, sWidth - 40, 2);
    for (let st = 310; st <= 340; st += 7) ctx.fillRect(sLeft + 20, st, sWidth - 40, 2);

    // 3. Cyber Shopfronts (Left & Right Outposts)
    const p = this.street.shops;

    // Left Shops: WEFCO MART & YOKU FORGE
    p.leftBuildings.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = '#3d3868';
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);

      // Neon Signboard
      ctx.save();
      ctx.fillStyle = '#0a0914';
      ctx.fillRect(b.x + 8, b.y + 10, b.w - 16, 22);
      ctx.shadowColor = b.signColor;
      ctx.shadowBlur = 8;
      ctx.fillStyle = b.signColor;
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(b.name, b.x + b.w / 2, b.y + 24);
      ctx.restore();
    });

    // Right Shops: SOUL LINK & TORII TECH
    p.rightBuildings.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = '#3d3868';
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);

      ctx.save();
      ctx.fillStyle = '#0a0914';
      ctx.fillRect(b.x + 8, b.y + 10, b.w - 16, 22);
      ctx.shadowColor = b.signColor;
      ctx.shadowBlur = 8;
      ctx.fillStyle = b.signColor;
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(b.name, b.x + b.w / 2, b.y + 24);
      ctx.restore();
    });

    // Vending Machines & Street Lanterns
    p.vendingMachines.forEach(v => {
      ctx.save();
      ctx.fillStyle = '#1c1b30';
      ctx.fillRect(v.x, v.y, 16, 26);
      ctx.shadowColor = v.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = v.color;
      ctx.fillRect(v.x + 3, v.y + 4, 10, 10);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 6px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(v.label, v.x + 8, v.y + 22);
      ctx.restore();
    });

    // Overhead Hanging Lantern Strings (Like screenshot)
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sLeft, 85);
    ctx.quadraticCurveTo(W / 2, 98, sRight, 85);
    ctx.stroke();

    for (let l = sLeft + 35; l < sRight - 30; l += 40) {
      const ly = 85 + Math.sin((l - sLeft) / sWidth * Math.PI) * 12;
      ctx.fillStyle = '#ffeb3b';
      ctx.shadowColor = '#ffeb3b';
      ctx.shadowBlur = 6;
      ctx.fillRect(l, ly, 5, 7);
      ctx.shadowBlur = 0;
    }
  }

  // ── CYBER MONKEY (CYBER COAT, GLOWING ENERGY BLADE/BLASTER) ──
  _drawCyberMonkey(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    // 1. Energy Shield Bubble (Jika invulnerable / baru kena hit)
    if (p.invulnerableTimer > 0) {
      ctx.save();
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.fill();
      ctx.restore();
    }

    // 2. Cast Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 3, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Cyber Coat Body (Dark Charcoal with Neon Trim)
    let coatColor = '#212130';
    let trimColor = '#00e5ff';

    if (p.skin === 'ninja') {
      coatColor = '#121218';
      trimColor = '#ff007f';
    } else if (p.skin === 'king') {
      coatColor = '#2d2038';
      trimColor = '#ffd700';
    } else if (p.skin === 'mecha') {
      coatColor = '#37474f';
      trimColor = '#00e5ff';
    } else if (p.skin === 'chimp_blue') {
      coatColor = '#1a237e';
      trimColor = '#40c4ff';
    }

    ctx.fillStyle = coatColor;
    ctx.fillRect(-12, -10, 24, 20);

    // Neon Coat Trim
    ctx.fillStyle = trimColor;
    ctx.shadowColor = trimColor;
    ctx.shadowBlur = 6;
    ctx.fillRect(-12, -10, 3, 20);
    ctx.shadowBlur = 0;

    // Ears
    ctx.fillStyle = '#615147';
    ctx.fillRect(-4, -14, 6, 4);
    ctx.fillRect(-4, 10, 6, 4);

    // Face / Snout
    ctx.fillStyle = '#c7a38b';
    ctx.fillRect(4, -6, 10, 12);

    // Glowing Cybernetic Visor / Eyes (Like screenshot character)
    ctx.fillStyle = trimColor;
    ctx.shadowColor = trimColor;
    ctx.shadowBlur = 8;
    ctx.fillRect(8, -5, 3, 10);
    ctx.shadowBlur = 0;

    // Special Accessories
    if (p.skin === 'ninja') {
      // Flowing red headband
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(-14, -6, 4, 12);
    } else if (p.skin === 'king') {
      // Golden Crown
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(1, -6, 5, 12);
    }

    // 4. Glowing Neon Energy Banana Sword / Blaster (Green Beam like screenshot!)
    ctx.save();
    ctx.translate(12, 8);
    ctx.rotate(0.3);

    ctx.shadowColor = '#00e676';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#76ff03';
    ctx.fillRect(0, -2, 16, 5);

    // White core beam
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, -1, 12, 3);
    ctx.restore();

    ctx.restore();
  }

  // ── CYBER ENEMIES (PATROL DRONES, LASER HUNTERS, HOVER-JEEP) ──
  _drawCyberEnemy(ctx, h) {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(h.angle);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 3, h.radius * 0.9, h.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    if (h.type === 'zookeeper') {
      // Sector Guard (Dark Tactical Armor with Stun-Net)
      ctx.fillStyle = '#1e382b';
      ctx.fillRect(-10, -9, 20, 18);
      ctx.fillStyle = '#3a5f49';
      ctx.fillRect(-7, -7, 14, 14);

      // Neon Visor
      ctx.fillStyle = '#00e676';
      ctx.shadowColor = '#00e676';
      ctx.shadowBlur = 6;
      ctx.fillRect(5, -4, 3, 8);
      ctx.shadowBlur = 0;

      // Electric Stun Net
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 4, 10, 8);
    } else if (h.type === 'hunter') {
      // Cyber Sniper (Trenchcoat + Red Laser Rifle)
      ctx.fillStyle = '#2b1f33';
      ctx.fillRect(-10, -9, 20, 18);
      ctx.fillStyle = '#4a3258';
      ctx.fillRect(-6, -6, 12, 12);

      // Red Laser Sight Rifle
      ctx.fillStyle = '#212121';
      ctx.fillRect(2, 6, 22, 4);
      ctx.fillStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 6;
      ctx.fillRect(18, 7, 8, 2);
      ctx.shadowBlur = 0;
    } else if (h.type === 'jeep') {
      // Hover-Jeep (Anti-Grav Thrusters + Heavy Plating)
      ctx.fillStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      // 4 Glowing Hover Pads
      ctx.fillRect(-16, -17, 8, 5);
      ctx.fillRect(8, -17, 8, 5);
      ctx.fillRect(-16, 12, 8, 5);
      ctx.fillRect(8, 12, 8, 5);
      ctx.shadowBlur = 0;

      // Chassis
      ctx.fillStyle = '#1c1b30';
      ctx.fillRect(-16, -13, 32, 26);
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-16, -13, 32, 26);

      // Gradient Windshield
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(6, -9, 6, 18);
    }

    ctx.restore();

    if (h.maxHp > 1) {
      const bw = 24;
      const bx = h.x - bw / 2;
      const by = h.y - h.radius - 8;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(bx, by, bw, 4);
      ctx.fillStyle = '#00e676';
      ctx.fillRect(bx, by, (h.hp / h.maxHp) * bw, 4);
    }
  }

  // ── CYBER BOSS ──
  _drawCyberBoss(ctx, boss) {
    ctx.save();
    ctx.translate(boss.x, boss.y);
    ctx.rotate(boss.angle);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 5, boss.radius * 1.1, boss.radius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Plated Mech Tank
    ctx.fillStyle = '#1a102b';
    ctx.fillRect(-26, -24, 52, 48);
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-26, -24, 52, 48);

    // Glowing Reactor Core
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Dual Plasma Cannons
    ctx.fillStyle = '#212121';
    ctx.fillRect(16, -10, 24, 6);
    ctx.fillRect(16, 4, 24, 6);

    // Laser Telegraph
    if (boss.telegraphTimer > 0) {
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(38, 0);
      ctx.lineTo(260, 0);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  _drawCyberBossHud(ctx, W, boss) {
    const barW = 320;
    const barH = 14;
    const barX = W / 2 - barW / 2;
    const barY = 16;

    ctx.fillStyle = 'rgba(15, 14, 28, 0.9)';
    ctx.fillRect(barX - 4, barY - 4, barW + 8, barH + 8);
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX - 4, barY - 4, barW + 8, barH + 8);

    const hpPct = Math.max(0, boss.hp / boss.maxHp);
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 8;
    ctx.fillRect(barX, barY, barW * hpPct, barH);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${boss.name} [HP: ${Math.ceil(boss.hp)} / ${boss.maxHp}]`, W / 2, barY + 11);
  }

  // ── GLOWING PLASMA BANANA ──
  _drawPlasmaBanana(ctx, b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rotation);

    if (b.isExplosive) {
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(-8, -4, 16, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -2, 8, 4);
    } else {
      ctx.shadowColor = '#00e676';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#76ff03';
      ctx.fillRect(-7, -3, 14, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -1, 6, 2);
    }

    ctx.restore();
  }

  // ── CYBER ITEM DROPS (HOLOGRAPHIC GEMS, BATTERIES, NANO-MEDS) ──
  _drawCyberItemDrop(ctx, item) {
    const bob = Math.sin(Date.now() * 0.005 + item.floatOffset) * 4;
    const x = item.x;
    const y = item.y + bob;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x, item.y + 10, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

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
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 2, y - 2, 4, 4);
    } else if (item.type === 'ammo') {
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(x - 7, y - 6, 14, 12);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 2, y - 4, 4, 8);
    } else if (item.type === 'health') {
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(x - 6, y - 2, 12, 4);
      ctx.fillRect(x - 2, y - 6, 4, 12);
    } else if (item.type === 'stamina') {
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ── GAME LOOP ──
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
