import Phaser from "phaser";
import { gsap } from "gsap";
import "./styles.css";

type Mode = "fighter" | "gerwalk" | "armor";
type PickupKind = "cannon" | "missile" | "repair" | "core";

interface PlayerState {
  hp: number;
  hpMax: number;
  shield: number;
  shieldMax: number;
  mode: Mode;
  cannonLevel: number;
  missileLevel: number;
  special: number;
  invuln: number;
}

const W = 960;
const H = 1280;
const clamp = Phaser.Math.Clamp;

const hud = {
  hp: document.querySelector<HTMLSpanElement>("#hp-bar")!,
  shield: document.querySelector<HTMLSpanElement>("#shield-bar")!,
  special: document.querySelector<HTMLSpanElement>("#special-bar")!,
  score: document.querySelector<HTMLElement>("#score")!,
  wave: document.querySelector<HTMLElement>("#wave")!,
  boss: document.querySelector<HTMLElement>("#boss")!,
  cannon: document.querySelector<HTMLElement>("#cannon")!,
  missile: document.querySelector<HTMLElement>("#missile")!,
  overlay: document.querySelector<HTMLElement>("#overlay")!,
  start: document.querySelector<HTMLButtonElement>("#start-button")!,
  modeButtons: {
    fighter: document.querySelector<HTMLElement>("#mode-fighter")!,
    gerwalk: document.querySelector<HTMLElement>("#mode-gerwalk")!,
    armor: document.querySelector<HTMLElement>("#mode-armor")!
  }
};

class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  create() {
    this.createTextures();
    this.scene.start("battle");
  }

  private createTextures() {
    const g = this.add.graphics();
    const makeShip = (key: string, tint: number, wing: number, body = 1) => {
      g.clear();
      g.lineStyle(3, 0xffffff, 0.88);
      g.fillStyle(tint, 1);
      g.beginPath();
      g.moveTo(0, -38 * body);
      g.lineTo(16, 20);
      g.lineTo(wing, 34);
      g.lineTo(9, 8);
      g.lineTo(0, 18);
      g.lineTo(-9, 8);
      g.lineTo(-wing, 34);
      g.lineTo(-16, 20);
      g.closePath();
      g.fillPath();
      g.strokePath();
      g.fillStyle(0x06111f, 1);
      g.fillEllipse(0, -10, 12, 20);
      g.generateTexture(key, 90, 92);
    };

    makeShip("player-fighter", 0x49e7ff, 38, 1.1);
    makeShip("player-gerwalk", 0xffcb57, 28, 0.9);
    makeShip("player-armor", 0xff477e, 48, 0.72);

    g.clear();
    g.fillStyle(0xff4f6e, 1);
    g.fillTriangle(0, 32, 20, -18, 0, -30);
    g.fillTriangle(0, 32, -20, -18, 0, -30);
    g.lineStyle(2, 0xffd4df, 0.8);
    g.strokeTriangle(0, 32, 20, -18, 0, -30);
    g.strokeTriangle(0, 32, -20, -18, 0, -30);
    g.generateTexture("enemy-scout", 54, 68);

    g.clear();
    g.fillStyle(0x9f55ff, 1);
    g.fillRoundedRect(4, 10, 58, 36, 8);
    g.fillTriangle(6, 28, -20, 4, -16, 46);
    g.fillTriangle(62, 28, 88, 4, 82, 46);
    g.lineStyle(2, 0xf4dcff, 0.75);
    g.strokeRoundedRect(4, 10, 58, 36, 8);
    g.generateTexture("enemy-frigate", 96, 64);

    g.clear();
    g.fillStyle(0x2d4f7f, 1);
    g.fillRoundedRect(16, 26, 170, 80, 14);
    g.fillTriangle(28, 26, 88, 0, 170, 26);
    g.fillTriangle(16, 82, -22, 120, 60, 104);
    g.fillTriangle(186, 82, 224, 120, 142, 104);
    g.fillStyle(0xff477e, 1);
    g.fillCircle(70, 64, 10);
    g.fillCircle(132, 64, 10);
    g.lineStyle(4, 0xbfeeff, 0.85);
    g.strokeRoundedRect(16, 26, 170, 80, 14);
    g.generateTexture("boss-carrier", 240, 148);

    g.clear();
    g.fillStyle(0x51f6ff, 1);
    g.fillRoundedRect(0, 0, 6, 28, 3);
    g.generateTexture("bolt", 8, 30);
    g.clear();
    g.fillStyle(0xffcb57, 1);
    g.fillRoundedRect(0, 0, 12, 26, 5);
    g.fillStyle(0xff477e, 1);
    g.fillTriangle(0, 24, 12, 24, 6, 36);
    g.generateTexture("missile", 14, 38);
    g.clear();
    g.fillStyle(0xff477e, 1);
    g.fillCircle(16, 16, 14);
    g.generateTexture("enemy-shot", 32, 32);
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(24, 24, 22);
    g.generateTexture("spark", 48, 48);
    g.clear();
    g.fillStyle(0x79ff9f, 1);
    g.fillCircle(24, 24, 18);
    g.lineStyle(4, 0xffffff, 0.9);
    g.strokeCircle(24, 24, 18);
    g.generateTexture("pickup", 48, 48);
    g.destroy();
  }
}

class BattleScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private bullets!: Phaser.Physics.Arcade.Group;
  private missiles!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyShots!: Phaser.Physics.Arcade.Group;
  private pickups!: Phaser.Physics.Arcade.Group;
  private fx!: Phaser.GameObjects.Particles.ParticleEmitter;
  private playerState: PlayerState = {
    hp: 120,
    hpMax: 120,
    shield: 80,
    shieldMax: 80,
    mode: "fighter",
    cannonLevel: 1,
    missileLevel: 1,
    special: 0,
    invuln: 0
  };
  private score = 0;
  private wave = 1;
  private bossHp = 0;
  private fireTimer = 0;
  private missileTimer = 0;
  private spawnTimer = 0;
  private bossTimer = 28;
  private pausedByOverlay = true;
  private starfield!: Phaser.GameObjects.TileSprite;
  private nebula!: Phaser.GameObjects.TileSprite;

  constructor() {
    super("battle");
  }

  create() {
    this.physics.world.setBounds(0, 0, W, H);
    this.createBackdrop();
    this.bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 180 });
    this.missiles = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 42 });
    this.enemies = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: 60 });
    this.enemyShots = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 100 });
    this.pickups = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 24 });
    this.player = this.physics.add.sprite(W / 2, H - 170, "player-fighter").setDepth(8);
    this.player.setCollideWorldBounds(true);
    this.player.setCircle(26, 18, 18);
    this.fx = this.add.particles(0, 0, "spark", {
      lifespan: 360,
      speed: { min: 80, max: 360 },
      scale: { start: 0.32, end: 0 },
      alpha: { start: 0.88, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false
    });
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys("W,A,S,D,SPACE,X,P") as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.on("keydown-SPACE", () => this.cycleMode());
    this.input.keyboard!.on("keydown-X", () => this.special());
    this.input.keyboard!.on("keydown-P", () => this.togglePause());
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, undefined, this);
    this.physics.add.overlap(this.missiles, this.enemies, this.hitEnemyWithMissile, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.ramPlayer, undefined, this);
    this.physics.add.overlap(this.player, this.enemyShots, this.shotPlayer, undefined, this);
    this.physics.add.overlap(this.player, this.pickups, this.collectPickup, undefined, this);
    hud.start.addEventListener("click", () => this.startRun());
    this.updateHud();
    this.scale.on("resize", this.resize, this);
    this.resize();
  }

  update(_: number, deltaMs: number) {
    const dt = deltaMs / 1000;
    this.starfield.tilePositionY -= 460 * dt;
    this.nebula.tilePositionY -= 80 * dt;
    if (this.pausedByOverlay) return;
    this.playerState.invuln = Math.max(0, this.playerState.invuln - dt);
    this.handleMovement(dt);
    this.handleWeapons(dt);
    this.handleSpawns(dt);
    this.updateEnemies(dt);
    this.cleanup();
    this.regenShield(dt);
    this.updateHud();
  }

  private createBackdrop() {
    const starTexture = this.textures.createCanvas("stars", W, H);
    const starCanvas = starTexture!.getCanvas();
    const starCtx = starCanvas.getContext("2d")!;
    starCtx.fillStyle = "#02050c";
    starCtx.fillRect(0, 0, W, H);
    for (let i = 0; i < 240; i += 1) {
      const size = Phaser.Math.FloatBetween(0.7, 2.4);
      starCtx.globalAlpha = Phaser.Math.FloatBetween(0.35, 1);
      starCtx.fillStyle = `rgb(${140 + (i % 80)}, 220, 255)`;
      starCtx.beginPath();
      starCtx.arc(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), size, 0, Math.PI * 2);
      starCtx.fill();
    }
    starCtx.globalAlpha = 1;
    starTexture!.refresh();

    const nebulaTexture = this.textures.createCanvas("nebula", W, H);
    const nebulaCanvas = nebulaTexture!.getCanvas();
    const nebulaCtx = nebulaCanvas.getContext("2d")!;
    const blue = nebulaCtx.createRadialGradient(260, 360, 20, 260, 360, 390);
    blue.addColorStop(0, "rgba(21, 105, 180, 0.34)");
    blue.addColorStop(1, "rgba(21, 105, 180, 0)");
    nebulaCtx.fillStyle = blue;
    nebulaCtx.fillRect(0, 0, W, H);
    const rose = nebulaCtx.createRadialGradient(760, 860, 10, 760, 860, 430);
    rose.addColorStop(0, "rgba(255, 71, 126, 0.22)");
    rose.addColorStop(1, "rgba(255, 71, 126, 0)");
    nebulaCtx.fillStyle = rose;
    nebulaCtx.fillRect(0, 0, W, H);
    nebulaTexture!.refresh();
    this.add.rectangle(W / 2, H / 2, W, H, 0x02050c).setDepth(-10);
    this.nebula = this.add.tileSprite(W / 2, H / 2, W, H, "nebula").setDepth(-9).setBlendMode(Phaser.BlendModes.ADD);
    this.starfield = this.add.tileSprite(W / 2, H / 2, W, H, "stars").setDepth(-8);
  }

  private startRun() {
    hud.overlay.classList.remove("visible");
    this.pausedByOverlay = false;
    this.resetState();
    gsap.fromTo("#toast", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" });
  }

  private resetState() {
    this.playerState = {
      hp: 120,
      hpMax: 120,
      shield: 80,
      shieldMax: 80,
      mode: "fighter",
      cannonLevel: 1,
      missileLevel: 1,
      special: 35,
      invuln: 1.4
    };
    this.score = 0;
    this.wave = 1;
    this.bossHp = 0;
    this.bossTimer = 28;
    this.enemies.clear(true, true);
    this.enemyShots.clear(true, true);
    this.bullets.clear(true, true);
    this.missiles.clear(true, true);
    this.pickups.clear(true, true);
    this.player.setPosition(W / 2, H - 170).setTexture("player-fighter").setAlpha(1);
  }

  private handleMovement(dt: number) {
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;
    const modeSpeed = { fighter: 560, gerwalk: 440, armor: 340 }[this.playerState.mode];
    const vx = Number(right) - Number(left);
    const vy = Number(down) - Number(up);
    const mag = Math.hypot(vx, vy) || 1;
    this.player.setVelocity((vx / mag) * modeSpeed, (vy / mag) * modeSpeed);
    this.player.setRotation(Phaser.Math.Linear(this.player.rotation, vx * 0.18, 12 * dt));
    this.player.setAlpha(this.playerState.invuln > 0 ? 0.58 + Math.sin(this.time.now * 0.04) * 0.24 : 1);
  }

  private handleWeapons(dt: number) {
    this.fireTimer -= dt;
    this.missileTimer -= dt;
    const fireRate = { fighter: 0.085, gerwalk: 0.115, armor: 0.16 }[this.playerState.mode];
    if (this.fireTimer <= 0) {
      this.fireTimer = fireRate;
      const spread = Math.min(4, this.playerState.cannonLevel);
      for (let i = 0; i < spread; i += 1) {
        const offset = (i - (spread - 1) / 2) * 18;
        const bullet = this.bullets.get(this.player.x + offset, this.player.y - 46, "bolt") as Phaser.Physics.Arcade.Image;
        if (!bullet) continue;
        bullet.setActive(true).setVisible(true).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
        bullet.setVelocity(offset * 3, -1060);
        bullet.setData("damage", 13 + this.playerState.cannonLevel * 4);
      }
    }
    if (this.missileTimer <= 0 && this.playerState.missileLevel > 0) {
      this.missileTimer = Math.max(0.52, 1.25 - this.playerState.missileLevel * 0.12);
      const pairs = this.playerState.mode === "armor" ? 2 : 1;
      for (let i = 0; i < pairs; i += 1) {
        const side = i % 2 === 0 ? -34 : 34;
        const missile = this.missiles.get(this.player.x + side, this.player.y - 12, "missile") as Phaser.Physics.Arcade.Image;
        if (!missile) continue;
        missile.setActive(true).setVisible(true).setDepth(5).setVelocity(side * 3, -720);
        missile.setData("damage", 40 + this.playerState.missileLevel * 18);
      }
    }
  }

  private handleSpawns(dt: number) {
    this.spawnTimer -= dt;
    this.bossTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(0.28, 0.95 - this.wave * 0.045);
      const heavy = Math.random() < Math.min(0.18 + this.wave * 0.02, 0.45);
      this.spawnEnemy(heavy ? "frigate" : "scout");
    }
    if (this.bossTimer <= 0 && this.bossHp <= 0) {
      this.spawnEnemy("boss");
      this.bossTimer = 42;
    }
  }

  private spawnEnemy(kind: "scout" | "frigate" | "boss") {
    const key = kind === "scout" ? "enemy-scout" : kind === "frigate" ? "enemy-frigate" : "boss-carrier";
    const enemy = this.enemies.get(Phaser.Math.Between(90, W - 90), kind === "boss" ? -110 : -60, key) as Phaser.Physics.Arcade.Sprite;
    if (!enemy) return;
    const hp = kind === "boss" ? 1800 + this.wave * 220 : kind === "frigate" ? 145 + this.wave * 18 : 42 + this.wave * 7;
    enemy.setActive(true).setVisible(true).setDepth(kind === "boss" ? 6 : 3).setData({ kind, hp, hpMax: hp, shoot: Phaser.Math.FloatBetween(0.4, 1.6), sway: Phaser.Math.FloatBetween(-1.6, 1.6) });
    enemy.setVelocity(Phaser.Math.Between(-70, 70), kind === "boss" ? 46 : Phaser.Math.Between(120, 220) + this.wave * 6);
    enemy.setAngularVelocity(kind === "scout" ? Phaser.Math.Between(-40, 40) : 0);
    enemy.setCircle(kind === "boss" ? 78 : kind === "frigate" ? 36 : 24, kind === "boss" ? 42 : 0, kind === "boss" ? 18 : 0);
    if (kind === "boss") {
      this.bossHp = hp;
      this.cameras.main.shake(500, 0.012);
    }
  }

  private updateEnemies(dt: number) {
    this.enemies.children.each((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) return true;
      const kind = enemy.getData("kind") as string;
      enemy.x += Math.sin(this.time.now * 0.0018 + enemy.getData("sway")) * (kind === "boss" ? 0.9 : 1.8);
      if (kind === "boss" && enemy.y > 170) enemy.setVelocityY(8);
      const shoot = enemy.getData("shoot") - dt;
      enemy.setData("shoot", shoot);
      if (shoot <= 0) {
        enemy.setData("shoot", kind === "boss" ? 0.22 : kind === "frigate" ? 0.86 : 1.45);
        const lanes = kind === "boss" ? [-44, 0, 44] : [0];
        lanes.forEach((lane) => this.enemyFire(enemy.x + lane, enemy.y + 36, kind === "boss" ? 240 : 310));
      }
      return true;
    });
  }

  private enemyFire(x: number, y: number, speed: number) {
    const shot = this.enemyShots.get(x, y, "enemy-shot") as Phaser.Physics.Arcade.Image;
    if (!shot) return;
    const angle = Phaser.Math.Angle.Between(x, y, this.player.x, this.player.y);
    shot.setActive(true).setVisible(true).setDepth(4).setScale(0.55).setBlendMode(Phaser.BlendModes.ADD);
    shot.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  private cycleMode() {
    if (this.pausedByOverlay) return;
    const next: Record<Mode, Mode> = { fighter: "gerwalk", gerwalk: "armor", armor: "fighter" };
    this.playerState.mode = next[this.playerState.mode];
    this.player.setTexture(`player-${this.playerState.mode}`);
    this.playerState.shield = clamp(this.playerState.shield + (this.playerState.mode === "armor" ? 16 : 4), 0, this.playerState.shieldMax);
    this.cameras.main.flash(120, 81, 246, 255, false);
    this.fx.explode(18, this.player.x, this.player.y);
  }

  private special() {
    if (this.pausedByOverlay || this.playerState.special < 100) return;
    this.playerState.special = 0;
    this.cameras.main.shake(540, 0.018);
    this.cameras.main.flash(220, 255, 203, 87, false);
    for (let i = 0; i < 18; i += 1) {
      const x = 80 + (i % 6) * 160;
      const y = H - 120 - Math.floor(i / 6) * 70;
      const missile = this.missiles.get(x, y, "missile") as Phaser.Physics.Arcade.Image;
      if (!missile) continue;
      missile.setActive(true).setVisible(true).setDepth(7).setScale(1.15).setVelocity(Phaser.Math.Between(-80, 80), -980);
      missile.setData("damage", 180);
    }
  }

  private hitEnemy: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (projectileObj, enemyObj) => {
    const projectile = projectileObj as Phaser.Physics.Arcade.Image;
    const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
    projectile.disableBody(true, true);
    this.damageEnemy(enemy, projectile.getData("damage") ?? 10, false);
  };

  private hitEnemyWithMissile: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (projectileObj, enemyObj) => {
    const projectile = projectileObj as Phaser.Physics.Arcade.Image;
    const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
    projectile.disableBody(true, true);
    this.fx.explode(22, projectile.x, projectile.y);
    this.damageEnemy(enemy, projectile.getData("damage") ?? 50, true);
  };

  private damageEnemy(enemy: Phaser.Physics.Arcade.Sprite, damage: number, big: boolean) {
    const hp = enemy.getData("hp") - damage;
    enemy.setData("hp", hp);
    enemy.setTintFill(big ? 0xfff1a6 : 0xffffff);
    this.time.delayedCall(45, () => enemy.clearTint());
    if (enemy.getData("kind") === "boss") this.bossHp = Math.max(0, hp);
    if (hp <= 0) this.killEnemy(enemy);
  }

  private killEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
    const kind = enemy.getData("kind") as string;
    this.fx.explode(kind === "boss" ? 130 : kind === "frigate" ? 44 : 22, enemy.x, enemy.y);
    this.cameras.main.shake(kind === "boss" ? 900 : 160, kind === "boss" ? 0.026 : 0.005);
    this.score += kind === "boss" ? 10000 : kind === "frigate" ? 840 : 180;
    this.playerState.special = clamp(this.playerState.special + (kind === "boss" ? 45 : 7), 0, 100);
    if (Math.random() < (kind === "boss" ? 1 : 0.26)) this.dropPickup(enemy.x, enemy.y, kind === "boss" ? "core" : undefined);
    if (kind === "boss") {
      this.wave += 1;
      this.bossHp = 0;
      this.bossTimer = 34;
    }
    enemy.disableBody(true, true);
  }

  private dropPickup(x: number, y: number, force?: PickupKind) {
    const kinds: PickupKind[] = ["cannon", "missile", "repair", "core"];
    const kind = force ?? kinds[Phaser.Math.Between(0, kinds.length - 1)];
    const pickup = this.pickups.get(x, y, "pickup") as Phaser.Physics.Arcade.Image;
    if (!pickup) return;
    pickup.setActive(true).setVisible(true).setDepth(5).setData("kind", kind).setVelocity(Phaser.Math.Between(-40, 40), 150);
    pickup.setTint(kind === "cannon" ? 0x51f6ff : kind === "missile" ? 0xffcb57 : kind === "repair" ? 0x79ff9f : 0xff477e);
  }

  private collectPickup: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObj, pickupObj) => {
    const pickup = pickupObj as Phaser.Physics.Arcade.Image;
    const kind = pickup.getData("kind") as PickupKind;
    if (kind === "cannon") this.playerState.cannonLevel = clamp(this.playerState.cannonLevel + 1, 1, 5);
    if (kind === "missile") this.playerState.missileLevel = clamp(this.playerState.missileLevel + 1, 1, 5);
    if (kind === "repair") this.playerState.hp = clamp(this.playerState.hp + 32, 0, this.playerState.hpMax);
    if (kind === "core") {
      this.playerState.cannonLevel = clamp(this.playerState.cannonLevel + 1, 1, 5);
      this.playerState.missileLevel = clamp(this.playerState.missileLevel + 1, 1, 5);
      this.playerState.special = 100;
    }
    this.fx.explode(18, pickup.x, pickup.y);
    pickup.disableBody(true, true);
  };

  private ramPlayer: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObj, enemyObj) => {
    const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
    this.damagePlayer(enemy.getData("kind") === "boss" ? 38 : 22);
    this.damageEnemy(enemy, 80, true);
  };

  private shotPlayer: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObj, shotObj) => {
    const shot = shotObj as Phaser.Physics.Arcade.Image;
    shot.disableBody(true, true);
    this.damagePlayer(14);
  };

  private damagePlayer(damage: number) {
    if (this.playerState.invuln > 0) return;
    this.playerState.invuln = 0.55;
    const absorbed = Math.min(this.playerState.shield, damage);
    this.playerState.shield -= absorbed;
    this.playerState.hp -= damage - absorbed;
    this.fx.explode(12, this.player.x, this.player.y);
    this.cameras.main.shake(140, 0.007);
    if (this.playerState.hp <= 0) this.gameOver();
  }

  private regenShield(dt: number) {
    const rate = this.playerState.mode === "armor" ? 18 : this.playerState.mode === "gerwalk" ? 10 : 6;
    this.playerState.shield = clamp(this.playerState.shield + rate * dt, 0, this.playerState.shieldMax);
  }

  private gameOver() {
    this.pausedByOverlay = true;
    hud.overlay.classList.add("visible");
    hud.overlay.querySelector(".title")!.textContent = "MISSION FAILED";
    hud.overlay.querySelector("p")!.textContent = `得分 ${this.score.toLocaleString()}。核心已保存战斗数据，点击重新出击。`;
    hud.start.textContent = "再次出击";
  }

  private togglePause() {
    if (hud.overlay.classList.contains("visible")) return;
    this.pausedByOverlay = !this.pausedByOverlay;
    gsap.to("#toast", { opacity: this.pausedByOverlay ? 1 : 0.75, scale: this.pausedByOverlay ? 1.04 : 1, duration: 0.18 });
  }

  private cleanup() {
    [this.bullets, this.missiles, this.enemyShots, this.pickups, this.enemies].forEach((group) => {
      group.children.each((child) => {
        const obj = child as Phaser.Physics.Arcade.Image;
        if (obj.active && (obj.y < -220 || obj.y > H + 220 || obj.x < -220 || obj.x > W + 220)) {
          obj.disableBody(true, true);
        }
        return true;
      });
    });
  }

  private updateHud() {
    hud.hp.style.transform = `scaleX(${clamp(this.playerState.hp / this.playerState.hpMax, 0, 1)})`;
    hud.shield.style.transform = `scaleX(${clamp(this.playerState.shield / this.playerState.shieldMax, 0, 1)})`;
    hud.special.style.transform = `scaleX(${this.playerState.special / 100})`;
    hud.score.textContent = this.score.toLocaleString();
    hud.wave.textContent = String(this.wave);
    hud.boss.textContent = this.bossHp > 0 ? `${Math.ceil(this.bossHp)}` : "--";
    hud.cannon.textContent = `Lv.${this.playerState.cannonLevel}`;
    hud.missile.textContent = `Lv.${this.playerState.missileLevel}`;
    Object.entries(hud.modeButtons).forEach(([mode, el]) => el.classList.toggle("active", mode === this.playerState.mode));
  }

  private resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const zoom = Math.min(width / W, height / H);
    this.cameras.main.setZoom(zoom);
    this.cameras.main.centerOn(W / 2, H / 2);
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-root",
  width: W,
  height: H,
  backgroundColor: "#02050c",
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    antialias: true,
    pixelArt: false,
    powerPreference: "high-performance"
  },
  scene: [BootScene, BattleScene]
});

window.addEventListener("beforeunload", () => game.destroy(true));
