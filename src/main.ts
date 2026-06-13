import Phaser from "phaser";
import { gsap } from "gsap";
import { audio } from "./audio";
import "./styles.css";

type Mode = "fighter" | "gerwalk" | "armor";
type PickupKind = "cannon" | "missile" | "repair" | "core" | "laser" | "swarm" | "nuke" | "lightning" | "aegis";

interface PlayerState {
  hp: number;
  hpMax: number;
  shield: number;
  shieldMax: number;
  mode: Mode;
  cannonLevel: number;
  missileLevel: number;
  laserLevel: number;
  swarmLevel: number;
  lightningLevel: number;
  aegisLevel: number;
  nukeStock: number;
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
  laser: document.querySelector<HTMLElement>("#laser")!,
  swarm: document.querySelector<HTMLElement>("#swarm")!,
  warning: document.querySelector<HTMLElement>("#warning-banner")!,
  batchName: document.querySelector<HTMLElement>("#batch-name")!,
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
    // 1. Redesigned Player Ships (Fighter, Gerwalk, Armor)
    const createShip = (key: string, mainColor: string, accentColor: string, type: "fighter" | "gerwalk" | "armor") => {
      const size = 128;
      const tex = this.textures.createCanvas(key, size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;

      // Draw Engine Glow behind the ship
      const engineGlow = ctx.createRadialGradient(cx, cy + 30, 5, cx, cy + 45, 30);
      engineGlow.addColorStop(0, mainColor);
      engineGlow.addColorStop(0.5, accentColor + "88");
      engineGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = engineGlow;
      ctx.beginPath();
      ctx.arc(cx, cy + 30, 30, 0, Math.PI * 2);
      ctx.fill();

      // Outer Glow shadow for ship body
      ctx.shadowBlur = 12;
      ctx.shadowColor = mainColor;

      ctx.fillStyle = "#0a1220";
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 3.5;
      ctx.lineJoin = "round";

      if (type === "fighter") {
        ctx.beginPath();
        ctx.moveTo(cx, cy - 54);
        ctx.lineTo(cx + 12, cy - 20);
        ctx.lineTo(cx + 48, cy + 24);
        ctx.lineTo(cx + 18, cy + 18);
        ctx.lineTo(cx + 8, cy + 38);
        ctx.lineTo(cx - 8, cy + 38);
        ctx.lineTo(cx - 18, cy + 18);
        ctx.lineTo(cx - 48, cy + 24);
        ctx.lineTo(cx - 12, cy - 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Details / Wing stripes
        ctx.shadowBlur = 0;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy + 10);
        ctx.lineTo(cx - 12, cy - 10);
        ctx.moveTo(cx + 30, cy + 10);
        ctx.lineTo(cx + 12, cy - 10);
        ctx.stroke();

        // Glass Cockpit Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffffff";
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 15, 6, 16, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === "gerwalk") {
        ctx.beginPath();
        ctx.moveTo(cx, cy - 42);
        ctx.lineTo(cx + 20, cy - 15);
        ctx.lineTo(cx + 42, cy + 8);
        ctx.lineTo(cx + 34, cy + 34);
        ctx.lineTo(cx + 14, cy + 20);
        ctx.lineTo(cx + 8, cy + 38);
        ctx.lineTo(cx - 8, cy + 38);
        ctx.lineTo(cx - 14, cy + 20);
        ctx.lineTo(cx - 34, cy + 34);
        ctx.lineTo(cx - 42, cy + 8);
        ctx.lineTo(cx - 20, cy - 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Mech Wing Panels
        ctx.shadowBlur = 0;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 26, cy);
        ctx.lineTo(cx - 32, cy + 22);
        ctx.moveTo(cx + 26, cy);
        ctx.lineTo(cx + 32, cy + 22);
        ctx.stroke();

        // Dual Laser Pods
        ctx.fillStyle = accentColor;
        ctx.fillRect(cx - 24, cy - 25, 6, 12);
        ctx.fillRect(cx + 18, cy - 25, 6, 12);

        // Cockpit
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffffff";
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 5, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Armor Mode
        ctx.beginPath();
        ctx.moveTo(cx, cy - 32);
        ctx.lineTo(cx + 30, cy - 22);
        ctx.lineTo(cx + 56, cy + 6);
        ctx.lineTo(cx + 40, cy + 42);
        ctx.lineTo(cx + 15, cy + 34);
        ctx.lineTo(cx - 15, cy + 34);
        ctx.lineTo(cx - 40, cy + 42);
        ctx.lineTo(cx - 56, cy + 6);
        ctx.lineTo(cx - 30, cy - 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Heavy Shield Plates & Core Lines
        ctx.shadowBlur = 0;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 40, cy + 4);
        ctx.lineTo(cx - 20, cy - 12);
        ctx.moveTo(cx + 40, cy + 4);
        ctx.lineTo(cx + 20, cy - 12);
        ctx.stroke();

        // Heavy Armored Canopy
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffffff";
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.rect(cx - 8, cy - 8, 16, 14);
        ctx.fill();
      }
      tex.refresh();
    };

    createShip("player-fighter", "#51f6ff", "#008bff", "fighter");
    createShip("player-gerwalk", "#ffcb57", "#ff7b00", "gerwalk");
    createShip("player-armor", "#ff477e", "#ff003c", "armor");

    // 2. Scout Enemy (Sleek dart-shape with glowing crimson sensor)
    const createScout = () => {
      const size = 96;
      const tex = this.textures.createCanvas("enemy-scout", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;

      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ff3b30";
      ctx.fillStyle = "#160508";
      ctx.strokeStyle = "#ff3b30";
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(cx, cy + 30);
      ctx.lineTo(cx + 22, cy - 15);
      ctx.lineTo(cx + 6, cy - 32);
      ctx.lineTo(cx, cy - 18);
      ctx.lineTo(cx - 6, cy - 32);
      ctx.lineTo(cx - 22, cy - 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing Eye
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 5, 0, Math.PI * 2);
      ctx.fill();
      tex.refresh();
    };
    createScout();

    // 3. Frigate Enemy (Broad wing interceptor with secondary reactors)
    const createFrigate = () => {
      const size = 128;
      const tex = this.textures.createCanvas("enemy-frigate", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;

      ctx.shadowBlur = 12;
      ctx.shadowColor = "#a855f7";
      ctx.fillStyle = "#12091c";
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 3.5;

      ctx.beginPath();
      ctx.moveTo(cx, cy - 25);
      ctx.lineTo(cx + 28, cy - 20);
      ctx.lineTo(cx + 54, cy + 12);
      ctx.lineTo(cx + 24, cy + 24);
      ctx.lineTo(cx + 12, cy + 10);
      ctx.lineTo(cx - 12, cy + 10);
      ctx.lineTo(cx - 24, cy + 24);
      ctx.lineTo(cx - 54, cy + 12);
      ctx.lineTo(cx - 28, cy - 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Reactor cores
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#51f6ff";
      ctx.fillStyle = "#51f6ff";
      ctx.beginPath();
      ctx.arc(cx - 24, cy - 5, 4, 0, Math.PI * 2);
      ctx.arc(cx + 24, cy - 5, 4, 0, Math.PI * 2);
      ctx.fill();
      tex.refresh();
    };
    createFrigate();

    // 3b. Heavy Destroyer (Tank ship with front heavy shield plates, dark grey/orange)
    const createDestroyer = () => {
      const size = 160;
      const tex = this.textures.createCanvas("enemy-destroyer", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;

      ctx.shadowBlur = 15;
      ctx.shadowColor = "#f97316";
      ctx.fillStyle = "#1c0d02";
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 4;
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(cx, cy - 40);
      ctx.lineTo(cx + 38, cy - 30);
      ctx.lineTo(cx + 64, cy + 10);
      ctx.lineTo(cx + 42, cy + 50);
      ctx.lineTo(cx + 14, cy + 38);
      ctx.lineTo(cx - 14, cy + 38);
      ctx.lineTo(cx - 42, cy + 50);
      ctx.lineTo(cx - 64, cy + 10);
      ctx.lineTo(cx - 38, cy - 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Heavy weapon pods
      ctx.fillStyle = "#f97316";
      ctx.fillRect(cx - 38, cy + 5, 12, 24);
      ctx.fillRect(cx + 26, cy + 5, 12, 24);

      tex.refresh();
    };
    createDestroyer();

    // 3c. Elite Cruiser (Broadwing carrier, purple/indigo with twin main thruster lines)
    const createCruiser = () => {
      const size = 192;
      const tex = this.textures.createCanvas("enemy-cruiser", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;

      ctx.shadowBlur = 16;
      ctx.shadowColor = "#8b5cf6";
      ctx.fillStyle = "#0d061a";
      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 4.5;
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(cx, cy - 50);
      ctx.lineTo(cx + 28, cy - 30);
      ctx.lineTo(cx + 78, cy + 15);
      ctx.lineTo(cx + 52, cy + 58);
      ctx.lineTo(cx + 20, cy + 40);
      ctx.lineTo(cx - 20, cy + 40);
      ctx.lineTo(cx - 52, cy + 58);
      ctx.lineTo(cx - 78, cy + 15);
      ctx.lineTo(cx - 28, cy - 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing sensor lines
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#a78bfa";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy - 10);
      ctx.lineTo(cx + 40, cy - 10);
      ctx.stroke();

      tex.refresh();
    };
    createCruiser();

    // 4. Boss Carrier
    const createBoss = () => {
      const w = 320;
      const h = 220;
      const tex = this.textures.createCanvas("boss-carrier", w, h)!;
      const ctx = tex.getCanvas().getContext("2d")!;

      ctx.shadowBlur = 18;
      ctx.shadowColor = "#e11d48";
      ctx.fillStyle = "#1e0b11";
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 4.5;
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(w / 2, 30);
      ctx.lineTo(w / 2 + 55, 30);
      ctx.lineTo(w / 2 + 90, 75);
      ctx.lineTo(w - 30, 95);
      ctx.lineTo(w - 15, 165);
      ctx.lineTo(w / 2 + 75, 145);
      ctx.lineTo(w / 2 + 45, 185);
      ctx.lineTo(w / 2 - 45, 185);
      ctx.lineTo(w / 2 - 75, 145);
      ctx.lineTo(15, 165);
      ctx.lineTo(30, 95);
      ctx.lineTo(w / 2 - 90, 75);
      ctx.lineTo(w / 2 - 55, 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#fda4af";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 70, 95);
      ctx.lineTo(w / 2 - 50, 145);
      ctx.moveTo(w / 2 + 70, 95);
      ctx.lineTo(w / 2 + 50, 145);
      ctx.moveTo(w / 2 - 30, 65);
      ctx.lineTo(w / 2 - 15, 35);
      ctx.lineTo(w / 2 + 15, 35);
      ctx.lineTo(w / 2 + 30, 65);
      ctx.stroke();

      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ffffff";
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(w / 2, 70, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = "#38bdf8";
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.rect(w / 2 - 35, 186, 16, 12);
      ctx.rect(w / 2 + 19, 186, 16, 12);
      ctx.fill();

      tex.refresh();
    };
    createBoss();

    // 4b. Boss Nebula (Level 2 Boss)
    const createBossNebula = () => {
      const w = 320;
      const h = 220;
      const tex = this.textures.createCanvas("boss-nebula", w, h)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#a855f7";
      ctx.fillStyle = "#110724";
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 5;
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(w / 2, 20);
      ctx.lineTo(w / 2 + 40, 50);
      ctx.lineTo(w - 20, 50);
      ctx.lineTo(w - 40, 160);
      ctx.lineTo(w / 2 + 80, 190);
      ctx.lineTo(w / 2 + 20, 170);
      ctx.lineTo(w / 2 - 20, 170);
      ctx.lineTo(w / 2 - 80, 190);
      ctx.lineTo(20, 160);
      ctx.lineTo(40, 50);
      ctx.lineTo(w / 2 - 40, 50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cyan Cores
      ctx.shadowColor = "#06b6d4";
      ctx.fillStyle = "#22d3ee";
      ctx.beginPath();
      ctx.arc(w / 2 - 60, 100, 12, 0, Math.PI * 2);
      ctx.arc(w / 2 + 60, 100, 12, 0, Math.PI * 2);
      ctx.fill();
      tex.refresh();
    };
    createBossNebula();

    // 4c. Boss Destroyer (Level 3 Boss)
    const createBossDestroyer = () => {
      const w = 320;
      const h = 240;
      const tex = this.textures.createCanvas("boss-destroyer", w, h)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      ctx.shadowBlur = 22;
      ctx.shadowColor = "#ea580c";
      ctx.fillStyle = "#200d02";
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 5;
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(w / 2, 40);
      ctx.lineTo(w - 40, 20);
      ctx.lineTo(w - 10, 110);
      ctx.lineTo(w - 50, 210);
      ctx.lineTo(w / 2 + 60, 170);
      ctx.lineTo(w / 2, 220);
      ctx.lineTo(w / 2 - 60, 170);
      ctx.lineTo(50, 210);
      ctx.lineTo(10, 110);
      ctx.lineTo(40, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Rocket launcher bay lines
      ctx.shadowBlur = 10;
      ctx.strokeStyle = "#ffcb57";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(80, 80);
      ctx.lineTo(120, 80);
      ctx.moveTo(200, 80);
      ctx.lineTo(240, 80);
      ctx.stroke();
      tex.refresh();
    };
    createBossDestroyer();

    // 4d. Boss Fortress (Level 4 Boss)
    const createBossFortress = () => {
      const w = 320;
      const h = 240;
      const tex = this.textures.createCanvas("boss-fortress", w, h)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      ctx.shadowBlur = 24;
      ctx.shadowColor = "#22c55e";
      ctx.fillStyle = "#051e0e";
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 5;
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(w / 2 - 80, 20);
      ctx.lineTo(w / 2 + 80, 20);
      ctx.lineTo(w - 20, 80);
      ctx.lineTo(w - 20, 180);
      ctx.lineTo(w / 2 + 100, 220);
      ctx.lineTo(w / 2 - 100, 220);
      ctx.lineTo(20, 180);
      ctx.lineTo(20, 80);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Hex green shields
      ctx.shadowBlur = 12;
      ctx.strokeStyle = "#86efac";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(w / 2 - 40, 60, 80, 60);
      tex.refresh();
    };
    createBossFortress();

    // 4e. Boss Ragnarok (Level 5 Boss)
    const createBossRagnarok = () => {
      const w = 320;
      const h = 260;
      const tex = this.textures.createCanvas("boss-ragnarok", w, h)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      ctx.shadowBlur = 28;
      ctx.shadowColor = "#eab308";
      ctx.fillStyle = "#1e1602";
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 5.5;
      ctx.lineJoin = "round";

      // Sharp golden geometry spikes
      ctx.beginPath();
      ctx.moveTo(w / 2, 10);
      ctx.lineTo(w / 2 + 50, 70);
      ctx.lineTo(w - 10, 70);
      ctx.lineTo(w / 2 + 90, 130);
      ctx.lineTo(w - 30, 200);
      ctx.lineTo(w / 2 + 60, 200);
      ctx.lineTo(w / 2, 250);
      ctx.lineTo(w / 2 - 60, 200);
      ctx.lineTo(30, 200);
      ctx.lineTo(w / 2 - 90, 130);
      ctx.lineTo(10, 70);
      ctx.lineTo(w / 2 - 50, 70);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Singularity Core
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#ffffff";
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(w / 2, 130, 24, 0, Math.PI * 2);
      ctx.fill();
      tex.refresh();
    };
    createBossRagnarok();

    // 4f. New Enemies
    // Bomber: Heavy green octa ship
    const createBomber = () => {
      const size = 144;
      const tex = this.textures.createCanvas("enemy-bomber", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#10b981";
      ctx.fillStyle = "#041a12";
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 36);
      ctx.lineTo(cx + 42, cy - 18);
      ctx.lineTo(cx + 42, cy + 18);
      ctx.lineTo(cx + 18, cy + 36);
      ctx.lineTo(cx - 18, cy + 36);
      ctx.lineTo(cx - 42, cy + 18);
      ctx.lineTo(cx - 42, cy - 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      tex.refresh();
    };
    createBomber();

    // Drone: Kamikaze Neon red/yellow triangle
    const createDrone = () => {
      const size = 64;
      const tex = this.textures.createCanvas("enemy-drone", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#f43f5e";
      ctx.fillStyle = "#27050b";
      ctx.strokeStyle = "#fb7185";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 20);
      ctx.lineTo(cx + 18, cy - 20);
      ctx.lineTo(cx - 18, cy - 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      tex.refresh();
    };
    createDrone();

    // Vanguard: Shielded front Cobalt blue ship
    const createVanguard = () => {
      const size = 112;
      const tex = this.textures.createCanvas("enemy-vanguard", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#3b82f6";
      ctx.fillStyle = "#051024";
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 30);
      ctx.lineTo(cx + 36, cy - 10);
      ctx.lineTo(cx + 24, cy + 24);
      ctx.lineTo(cx - 24, cy + 24);
      ctx.lineTo(cx - 36, cy - 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Shield plate line
      ctx.strokeStyle = "#93c5fd";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 8);
      ctx.lineTo(cx + 30, cy - 8);
      ctx.stroke();
      tex.refresh();
    };
    createVanguard();

    // Dreadnought: Massive orange/red battlecruiser
    const createDreadnought = () => {
      const size = 176;
      const tex = this.textures.createCanvas("enemy-dreadnought", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#f97316";
      ctx.fillStyle = "#1f0c02";
      ctx.strokeStyle = "#fdba74";
      ctx.lineWidth = 4;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(cx, cy - 50);
      ctx.lineTo(cx + 46, cy - 24);
      ctx.lineTo(cx + 64, cy + 20);
      ctx.lineTo(cx + 34, cy + 50);
      ctx.lineTo(cx - 34, cy + 50);
      ctx.lineTo(cx - 64, cy + 20);
      ctx.lineTo(cx - 46, cy - 24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      tex.refresh();
    };
    createDreadnought();

    // Goliath Battleship: Giant heavy cruiser with pink/neon outline
    const createGoliathBattleship = () => {
      const size = 220;
      const tex = this.textures.createCanvas("enemy-goliath-battleship", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;
      ctx.shadowBlur = 24;
      ctx.shadowColor = "#d946ef";
      ctx.fillStyle = "#160620";
      ctx.strokeStyle = "#e879f9";
      ctx.lineWidth = 5;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(cx, cy - 80);
      ctx.lineTo(cx + 64, cy - 40);
      ctx.lineTo(cx + 80, cy + 20);
      ctx.lineTo(cx + 46, cy + 80);
      ctx.lineTo(cx - 46, cy + 80);
      ctx.lineTo(cx - 80, cy + 20);
      ctx.lineTo(cx - 64, cy - 40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Add double cannons
      ctx.fillStyle = "#e879f9";
      ctx.fillRect(cx - 24, cy - 90, 8, 30);
      ctx.fillRect(cx + 16, cy - 90, 8, 30);
      tex.refresh();
    };
    createGoliathBattleship();

    // Enemy heavy bomb texture
    const createEnemyBomb = () => {
      const tex = this.textures.createCanvas("enemy-bomb", 48, 48)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const rad = ctx.createRadialGradient(24, 24, 2, 24, 24, 24);
      rad.addColorStop(0, "#ffffff");
      rad.addColorStop(0.3, "#f97316");
      rad.addColorStop(1, "rgba(249, 115, 22, 0)");
      ctx.fillStyle = rad;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#f97316";
      ctx.beginPath();
      ctx.arc(24, 24, 24, 0, Math.PI * 2);
      ctx.fill();
      tex.refresh();
    };
    createEnemyBomb();

    // 4g. Multi-functional Battleship Textures
    // Shield Projector
    const createShieldProjectorTex = () => {
      const size = 144;
      const tex = this.textures.createCanvas("enemy-shield-projector", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;
      ctx.shadowBlur = 16;
      ctx.shadowColor = "#06b6d4";
      ctx.fillStyle = "#06182c";
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 40);
      ctx.lineTo(cx + 40, cy - 10);
      ctx.lineTo(cx + 50, cy + 30);
      ctx.lineTo(cx + 20, cy + 45);
      ctx.lineTo(cx - 20, cy + 45);
      ctx.lineTo(cx - 50, cy + 30);
      ctx.lineTo(cx - 40, cy - 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Core emitter
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy + 5, 8, 0, Math.PI * 2);
      ctx.fill();
      tex.refresh();
    };
    createShieldProjectorTex();

    // Beam Cruiser
    const createBeamCruiserTex = () => {
      const size = 160;
      const tex = this.textures.createCanvas("enemy-beam-cruiser", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#f97316";
      ctx.fillStyle = "#1e0b02";
      ctx.strokeStyle = "#fb923c";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 60);
      ctx.lineTo(cx + 15, cy - 60);
      ctx.lineTo(cx + 20, cy - 20);
      ctx.lineTo(cx + 50, cy + 20);
      ctx.lineTo(cx + 30, cy + 50);
      ctx.lineTo(cx - 30, cy + 50);
      ctx.lineTo(cx - 50, cy + 20);
      ctx.lineTo(cx - 20, cy - 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glow indicators
      ctx.fillStyle = "#f97316";
      ctx.fillRect(cx - 4, cy - 50, 8, 20);
      tex.refresh();
    };
    createBeamCruiserTex();

    // Mine Carrier
    const createMineCarrierTex = () => {
      const size = 144;
      const tex = this.textures.createCanvas("enemy-mine-carrier", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;
      ctx.shadowBlur = 16;
      ctx.shadowColor = "#e11d48";
      ctx.fillStyle = "#1c060d";
      ctx.strokeStyle = "#fb7185";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 45);
      ctx.lineTo(cx + 45, cy - 20);
      ctx.lineTo(cx + 45, cy + 20);
      ctx.lineTo(cx, cy + 45);
      ctx.lineTo(cx - 45, cy + 20);
      ctx.lineTo(cx - 45, cy - 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Launch tubes
      ctx.fillStyle = "#fb7185";
      ctx.fillRect(cx - 25, cy - 5, 8, 16);
      ctx.fillRect(cx + 17, cy - 5, 8, 16);
      tex.refresh();
    };
    createMineCarrierTex();

    // Space Mine
    const createSpaceMineTex = () => {
      const size = 48;
      const tex = this.textures.createCanvas("space-mine", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#ef4444";
      ctx.fillStyle = "#1e0b0b";
      ctx.strokeStyle = "#f87171";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Spikes
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * 14, cy + Math.sin(angle) * 14);
        ctx.lineTo(cx + Math.cos(angle) * 22, cy + Math.sin(angle) * 22);
        ctx.stroke();
      }
      tex.refresh();
    };
    createSpaceMineTex();

    // Shield Dome aura
    const createShieldDomeTex = () => {
      const size = 220;
      const tex = this.textures.createCanvas("enemy-shield-dome", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;
      const grad = ctx.createRadialGradient(cx, cy, 80, cx, cy, 108);
      grad.addColorStop(0, "rgba(6, 182, 212, 0)");
      grad.addColorStop(0.7, "rgba(6, 182, 212, 0.15)");
      grad.addColorStop(0.9, "rgba(6, 182, 212, 0.45)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0.8)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 108, 0, Math.PI * 2);
      ctx.fill();
      tex.refresh();
    };
    createShieldDomeTex();

    // 4h. Advanced Weapon Textures
    // Player Tactical Nuke
    const createNukeBombTex = () => {
      const tex = this.textures.createCanvas("nuke-bomb", 48, 64)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#facc15";
      ctx.fillStyle = "#1e1e1e";
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 3;
      // Drawing nuke silhouette
      ctx.beginPath();
      ctx.moveTo(24, 4);
      ctx.lineTo(36, 20);
      ctx.lineTo(36, 44);
      ctx.lineTo(44, 56);
      ctx.lineTo(4, 56);
      ctx.lineTo(12, 44);
      ctx.lineTo(12, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Yellow hazard stripes
      ctx.fillStyle = "#eab308";
      ctx.fillRect(16, 28, 16, 6);
      tex.refresh();
    };
    createNukeBombTex();

    // Nuke Blast Shockwave
    const createNukeBlastTex = () => {
      const size = 256;
      const tex = this.textures.createCanvas("nuke-blast", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 128);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.2, "#fda4af");
      grad.addColorStop(0.5, "#f43f5e");
      grad.addColorStop(0.8, "#ea580c");
      grad.addColorStop(1, "rgba(234, 88, 12, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 128, 0, Math.PI * 2);
      ctx.fill();
      tex.refresh();
    };
    createNukeBlastTex();

    // Lightning Spark
    const createLightningSparkTex = () => {
      const tex = this.textures.createCanvas("lightning-spark", 32, 32)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#60a5fa";
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(16, 2);
      ctx.lineTo(20, 12);
      ctx.lineTo(30, 16);
      ctx.lineTo(20, 20);
      ctx.lineTo(16, 30);
      ctx.lineTo(12, 20);
      ctx.lineTo(2, 16);
      ctx.lineTo(12, 12);
      ctx.closePath();
      ctx.fill();
      tex.refresh();
    };
    createLightningSparkTex();

    // Aegis Shield Orbiter
    const createAegisOrbiterTex = () => {
      const tex = this.textures.createCanvas("aegis-orbiter", 32, 32)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#06b6d4";
      ctx.fillStyle = "#0e7490";
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(16, 16, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glowing core
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(16, 16, 4, 0, Math.PI * 2);
      ctx.fill();
      tex.refresh();
    };
    createAegisOrbiterTex();

    // Enemy Toxic Nuke
    const createEnemyNukeTex = () => {
      const tex = this.textures.createCanvas("enemy-nuke", 64, 64)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#22c55e";
      ctx.fillStyle = "#052e16";
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(32, 4);
      ctx.lineTo(46, 24);
      ctx.lineTo(46, 48);
      ctx.lineTo(54, 60);
      ctx.lineTo(10, 60);
      ctx.lineTo(18, 48);
      ctx.lineTo(18, 24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Radiation symbol
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.arc(32, 36, 6, 0, Math.PI * 2);
      ctx.fill();
      tex.refresh();
    };
    createEnemyNukeTex();

    // 5. Upgrade Projectiles & Particles
    const createBolt = () => {
      const tex = this.textures.createCanvas("bolt", 16, 48)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const gradient = ctx.createLinearGradient(8, 0, 8, 48);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.3, "#51f6ff");
      gradient.addColorStop(1, "rgba(81, 246, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#51f6ff";
      ctx.fillRect(4, 0, 8, 48);
      tex.refresh();
    };
    createBolt();

    // Piercing Laser beam texture
    const createLaserBeam = () => {
      const tex = this.textures.createCanvas("laser-beam", 24, 64)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const grad = ctx.createLinearGradient(0, 0, 24, 0);
      grad.addColorStop(0, "rgba(239, 68, 68, 0)");
      grad.addColorStop(0.3, "rgba(255, 255, 255, 0.95)");
      grad.addColorStop(0.5, "rgba(239, 68, 68, 1)");
      grad.addColorStop(0.7, "rgba(255, 255, 255, 0.95)");
      grad.addColorStop(1, "rgba(239, 68, 68, 0)");
      ctx.fillStyle = grad;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#ef4444";
      ctx.fillRect(2, 0, 20, 64);
      tex.refresh();
    };
    createLaserBeam();

    const createMissile = () => {
      const tex = this.textures.createCanvas("missile", 24, 48)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ffcb57";
      ctx.fillStyle = "#ffcb57";
      ctx.fillRect(8, 8, 8, 24);
      ctx.fillStyle = "#ff477e";
      ctx.beginPath();
      ctx.moveTo(8, 8);
      ctx.lineTo(16, 8);
      ctx.lineTo(12, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffcb57";
      ctx.fillRect(4, 24, 4, 8);
      ctx.fillRect(16, 24, 4, 8);
      tex.refresh();
    };
    createMissile();

    const createEnemyShot = () => {
      const tex = this.textures.createCanvas("enemy-shot", 32, 32)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const rad = ctx.createRadialGradient(16, 16, 2, 16, 16, 16);
      rad.addColorStop(0, "#ffffff");
      rad.addColorStop(0.4, "#ff477e");
      rad.addColorStop(1, "rgba(255, 71, 126, 0)");
      ctx.fillStyle = rad;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#ff477e";
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
      tex.refresh();
    };
    createEnemyShot();

    const createSpark = () => {
      const tex = this.textures.createCanvas("spark", 32, 32)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const rad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      rad.addColorStop(0, "rgba(255, 255, 255, 1)");
      rad.addColorStop(0.3, "rgba(81, 246, 255, 0.8)");
      rad.addColorStop(1, "rgba(81, 246, 255, 0)");
      ctx.fillStyle = rad;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
      tex.refresh();
    };
    createSpark();

    // Armored Shield Bubble visual representation
    const createShieldBubble = () => {
      const size = 160;
      const tex = this.textures.createCanvas("shield-bubble", size, size)!;
      const ctx = tex.getCanvas().getContext;
      const context = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;
      const rad = context.createRadialGradient(cx, cy, 60, cx, cy, 78);
      rad.addColorStop(0, "rgba(81, 246, 255, 0)");
      rad.addColorStop(0.85, "rgba(81, 246, 255, 0.45)");
      rad.addColorStop(1, "rgba(255, 255, 255, 0.88)");
      context.fillStyle = rad;
      context.beginPath();
      context.arc(cx, cy, 78, 0, Math.PI * 2);
      context.fill();
      tex.refresh();
    };
    createShieldBubble();

    // Gold Medal star texture
    const createMedal = () => {
      const size = 32;
      const tex = this.textures.createCanvas("medal", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#facc15";
      ctx.fillStyle = "#eab308";
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const spikes = 5, outerRadius = 11, innerRadius = 5;
      let rot = (Math.PI / 2) * 3;
      let x = cx, y = cy;
      const step = Math.PI / spikes;
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      tex.refresh();
    };
    createMedal();

    // Upgraded Pickups with letter overlays for different functions
    const createPickup = () => {
      const size = 64;
      const tex = this.textures.createCanvas("pickup", size, size)!;
      const ctx = tex.getCanvas().getContext("2d")!;
      const cx = size / 2;
      const cy = size / 2;

      const gradient = ctx.createRadialGradient(cx, cy, 5, cx, cy, 28);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.15)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 12;
      ctx.shadowColor = "#79ff9f";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.stroke();

      tex.refresh();
    };
    createPickup();
  }
}

class BattleScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private bullets!: Phaser.Physics.Arcade.Group;
  private missiles!: Phaser.Physics.Arcade.Group;
  private lasers!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyShots!: Phaser.Physics.Arcade.Group;
  private enemyShields!: Phaser.Physics.Arcade.Group;
  private aegisGroup!: Phaser.Physics.Arcade.Group;
  private laserGraphics!: Phaser.GameObjects.Graphics;
  private lightningGraphics!: Phaser.GameObjects.Graphics;
  private pickups!: Phaser.Physics.Arcade.Group;
  private medalsGroup!: Phaser.Physics.Arcade.Group;
  private fx!: Phaser.GameObjects.Particles.ParticleEmitter;
  private thrusterFx!: Phaser.GameObjects.Particles.ParticleEmitter;
  private shieldBubble!: Phaser.GameObjects.Image;
  private playerState: PlayerState = {
    hp: 120,
    hpMax: 120,
    shield: 80,
    shieldMax: 80,
    mode: "fighter",
    cannonLevel: 1,
    missileLevel: 1,
    laserLevel: 0,
    swarmLevel: 0,
    special: 0,
    invuln: 0,
    lightningLevel: 0,
    aegisLevel: 0,
    nukeStock: 1
  };
  private score = 0;
  private wave = 1;
  private level = 1;
  private currentBatch = 0; // 0: Scout Swarm, 1: Flanking Fleet, 2: Heavy Guard, 3: Boss Assault
  private batchSpawnedCount = 0;
  private maxBatchSpawns = 10;
  private bossHp = 0;
  private fireTimer = 0;
  private missileTimer = 0;
  private swarmTimer = 0;
  private spawnTimer = 0;
  private bossTimer = 0; // Starts immediately when batch 3 is active
  private warningTimer = 0;
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
    this.lasers = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: 5 });
    this.enemies = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: 60 });
    this.enemyShots = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 100 });
    this.enemyShields = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite });
    this.aegisGroup = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite });
    this.laserGraphics = this.add.graphics().setDepth(5);
    this.lightningGraphics = this.add.graphics().setDepth(5);
    this.pickups = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 24 });
    this.player = this.physics.add.sprite(W / 2, H - 170, "player-fighter").setDepth(8);
    this.player.setCollideWorldBounds(true);
    this.player.setCircle(26, 38, 38);

    // Armored Shield Bubble visual representation
    this.shieldBubble = this.add.image(this.player.x, this.player.y, "shield-bubble").setDepth(9).setVisible(false).setBlendMode(Phaser.BlendModes.ADD);

    // Dynamic Engine Thrusters
    this.thrusterFx = this.add.particles(0, 0, "spark", {
      lifespan: 220,
      speedY: { min: 280, max: 480 },
      scale: { start: 0.38, end: 0 },
      alpha: { start: 0.9, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: true
    });
    this.thrusterFx.startFollow(this.player, 0, 32);

    this.fx = this.add.particles(0, 0, "spark", {
      lifespan: 360,
      speed: { min: 80, max: 360 },
      scale: { start: 0.32, end: 0 },
      alpha: { start: 0.88, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false
    });
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys("W,A,S,D,SPACE,X,P,C") as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.on("keydown-SPACE", () => this.cycleMode());
    this.input.keyboard!.on("keydown-X", () => this.special());
    this.input.keyboard!.on("keydown-P", () => this.togglePause());
    this.input.keyboard!.on("keydown-C", () => this.launchNuke());
    this.input.keyboard!.on("keydown-SPACE", () => this.launchNuke());
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, undefined, this);
    this.physics.add.overlap(this.missiles, this.enemies, this.hitEnemyWithMissile, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.ramPlayer, undefined, this);
    this.physics.add.overlap(this.player, this.enemyShots, this.shotPlayer, undefined, this);
    this.physics.add.overlap(this.player, this.pickups, this.collectPickup, undefined, this);
    this.physics.add.overlap(this.lasers, this.enemies, this.hitEnemyWithLaser, undefined, this);
    this.physics.add.overlap(this.bullets, this.enemyShields, this.hitEnemyShield, undefined, this);
    this.physics.add.overlap(this.missiles, this.enemyShields, this.hitEnemyShield, undefined, this);
    this.physics.add.overlap(this.lasers, this.enemyShields, this.hitEnemyShieldWithLaser, undefined, this);
    this.physics.add.overlap(this.enemyShots, this.aegisGroup, this.hitAegis, undefined, this);
    this.physics.add.overlap(this.bullets, this.enemyShots, this.hitEnemyShot, undefined, this);
    this.medalsGroup = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image });
    this.physics.add.overlap(this.player, this.medalsGroup, this.collectMedal, undefined, this);
    this.physics.add.overlap(this.missiles, this.enemyShots, this.hitEnemyShot, undefined, this);
    this.physics.add.overlap(this.lasers, this.enemyShots, this.hitEnemyShotWithLaser, undefined, this);

    // Click listeners for HUD mode buttons
    Object.entries(hud.modeButtons).forEach(([mode, el]) => {
      el.addEventListener("click", () => {
        this.changeMode(mode as Mode);
      });
    });

    hud.start.addEventListener("click", () => this.startRun());
    this.updateHud();
    this.scale.on("resize", this.resize, this);
    this.resize();
  }

  update(_: number, deltaMs: number) {
    const dt = deltaMs / 1000;
    const scrollSpeeds = [460, 520, 600, 700, 800];
    const speed = scrollSpeeds[this.level - 1] || 460;
    this.starfield.tilePositionY -= speed * dt;
    this.nebula.tilePositionY -= (speed * 0.18) * dt;

    const levelColors = [0x1569b4, 0xa855f7, 0xea580c, 0x22c55e, 0xeab308];
    const currentColor = levelColors[this.level - 1] || 0x1569b4;
    this.nebula.setTint(currentColor);

    if (this.pausedByOverlay) {
      if (this.thrusterFx.emitting) this.thrusterFx.stop();
      this.laserGraphics.clear();
      this.lightningGraphics.clear();
      return;
    }
    if (!this.thrusterFx.emitting) this.thrusterFx.start();

    this.playerState.invuln = Math.max(0, this.playerState.invuln - dt);
    this.handleMovement(dt);
    this.handleWeapons(dt);
    this.handleSpawns(dt);
    this.updateEnemies(dt);
    this.updateHomingMissiles(dt);
    this.cleanup();
    this.regenShield(dt);

    // Update Shield bubble visual tracking player
    this.shieldBubble.setPosition(this.player.x, this.player.y);
    this.shieldBubble.setVisible(this.playerState.invuln > 0 || this.playerState.mode === "armor");
    if (this.playerState.mode === "armor") {
      this.shieldBubble.setAlpha(0.55 + Math.sin(this.time.now * 0.005) * 0.15);
      this.shieldBubble.setScale(0.85);
    } else {
      this.shieldBubble.setAlpha(0.8);
      this.shieldBubble.setScale(0.75);
    }

    // Sync Shield Domes to Projector owners
    this.enemyShields.children.each((child) => {
      const dome = child as Phaser.Physics.Arcade.Sprite;
      if (!dome.active) return true;
      const owner = dome.getData("owner");
      if (!owner || !owner.active) {
        dome.disableBody(true, true);
      } else {
        dome.setPosition(owner.x, owner.y);
      }
      return true;
    });

    // Manage Aegis Orbiters
    const targetCount = this.playerState.aegisLevel > 0 ? 2 : 0;
    const activeOrbiters = this.aegisGroup.getChildren() as Phaser.Physics.Arcade.Sprite[];
    if (activeOrbiters.length < targetCount) {
      for (let i = activeOrbiters.length; i < targetCount; i++) {
        const orb = this.aegisGroup.create(this.player.x, this.player.y, "aegis-orbiter") as Phaser.Physics.Arcade.Sprite;
        orb.enableBody(true, this.player.x, this.player.y, true, true);
        orb.setActive(true).setVisible(true).setDepth(9).setCircle(10, 6, 6);
      }
    } else if (activeOrbiters.length > targetCount) {
      for (let i = activeOrbiters.length - 1; i >= targetCount; i--) {
        activeOrbiters[i].destroy();
      }
    }
    if (targetCount > 0) {
      const angleStep = (Math.PI * 2) / targetCount;
      const radius = 64;
      const speed = 0.003;
      const elapsed = this.time.now * speed;
      activeOrbiters.forEach((orb, idx) => {
        const angle = elapsed + idx * angleStep;
        const targetX = this.player.x + Math.cos(angle) * radius;
        const targetY = this.player.y + Math.sin(angle) * radius;
        orb.setPosition(targetX, targetY);
      });
    }

    // Draw active warning laser lines and sweeping heavy beams
    this.laserGraphics.clear();
    this.lightningGraphics.clear();
    this.enemies.children.each((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) return true;
      if (enemy.getData("kind") === "beam-cruiser") {
        const state = enemy.getData("beamState") || "idle";
        if (state === "targeting") {
          this.laserGraphics.lineStyle(2, 0xff0000, 0.7);
          this.laserGraphics.lineBetween(enemy.x, enemy.y + 40, enemy.x, H);
        } else if (state === "firing") {
          const width = 36 + Math.sin(this.time.now * 0.06) * 10;
          this.laserGraphics.lineStyle(width, 0xf97316, 0.85);
          this.laserGraphics.lineBetween(enemy.x, enemy.y + 45, enemy.x, H);
          this.laserGraphics.lineStyle(width * 0.4, 0xffffff, 0.95);
          this.laserGraphics.lineBetween(enemy.x, enemy.y + 45, enemy.x, H);
          if (Math.abs(this.player.x - enemy.x) < (width / 2 + 16) && this.player.y > enemy.y) {
            this.damagePlayer(42 * dt);
          }
        }
      }
      return true;
    });

    // Warning Banner alerts
    if (this.warningTimer > 0) {
      this.warningTimer -= dt;
      hud.warning.classList.add("visible");
    } else {
      hud.warning.classList.remove("visible");
    }

    // Cycle active weapon/missile pickups over time (Raiden style!)
    this.pickups.children.each((child) => {
      const p = child as Phaser.Physics.Arcade.Image;
      if (!p.active) return true;
      
      let timer = p.getData("cycleTimer") ?? 2.2;
      timer -= dt;
      p.setData("cycleTimer", timer);
      if (timer <= 0) {
        p.setData("cycleTimer", 2.2);
        const kind = p.getData("kind") as PickupKind;
        let nextKind: PickupKind = kind;
        
        if (kind === "cannon" || kind === "laser" || kind === "lightning") {
          const cycle: PickupKind[] = ["cannon", "laser", "lightning"];
          const idx = (cycle.indexOf(kind) + 1) % cycle.length;
          nextKind = cycle[idx];
        } else if (kind === "missile" || kind === "swarm") {
          nextKind = kind === "missile" ? "swarm" : "missile";
        }
        
        if (nextKind !== kind) {
          p.setData("kind", nextKind);
          const tintMap: Record<string, number> = {
            cannon: 0xef4444, // Red
            laser: 0x3b82f6, // Blue
            lightning: 0xd946ef, // Purple
            missile: 0xfacc15, // Yellow
            swarm: 0x8b5cf6 // Violet
          };
          p.setTint(tintMap[nextKind] || 0xffffff);
          
          this.tweens.add({
            targets: p,
            scaleX: 1.35,
            scaleY: 1.35,
            duration: 100,
            yoyo: true
          });
        }
      }
      return true;
    });



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
    blue.addColorStop(0, "rgba(255, 255, 255, 0.34)");
    blue.addColorStop(1, "rgba(255, 255, 255, 0)");
    nebulaCtx.fillStyle = blue;
    nebulaCtx.fillRect(0, 0, W, H);
    const rose = nebulaCtx.createRadialGradient(760, 860, 10, 760, 860, 430);
    rose.addColorStop(0, "rgba(255, 255, 255, 0.22)");
    rose.addColorStop(1, "rgba(255, 255, 255, 0)");
    nebulaCtx.fillStyle = rose;
    nebulaCtx.fillRect(0, 0, W, H);
    nebulaTexture!.refresh();
    this.add.rectangle(W / 2, H / 2, W, H, 0x02050c).setDepth(-10);
    this.nebula = this.add.tileSprite(W / 2, H / 2, W, H, "nebula").setDepth(-9).setBlendMode(Phaser.BlendModes.ADD);
    this.starfield = this.add.tileSprite(W / 2, H / 2, W, H, "stars").setDepth(-8);
  }

  private startRun() {
    audio.init();
    audio.startMusic();
    audio.resume();
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
      laserLevel: 0,
      swarmLevel: 0,
      lightningLevel: 0,
      aegisLevel: 0,
      nukeStock: 1,
      special: 35,
      invuln: 1.4
    };
    this.score = 0;
    this.wave = 1;
    this.level = 1;
    this.currentBatch = 0;
    this.batchSpawnedCount = 0;
    this.maxBatchSpawns = 10;
    this.bossHp = 0;
    this.bossTimer = 0;
    this.warningTimer = 0;
    this.laserGraphics.clear();
    this.lightningGraphics.clear();
    this.enemies.clear(true, true);
    this.enemyShots.clear(true, true);
    this.bullets.clear(true, true);
    this.missiles.clear(true, true);
    this.lasers.clear(true, true);
    this.pickups.clear(true, true);
    this.medalsGroup.clear(true, true);
    this.player.setPosition(W / 2, H - 170).setTexture("player-fighter").setAlpha(1);
    this.thrusterFx.setParticleTint(0x51f6ff);
  }

  private handleMovement(dt: number) {
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;
    const modeSpeed = { fighter: 600, gerwalk: 460, armor: 350 }[this.playerState.mode];
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

    if (this.fireTimer <= 0) {
      audio.playLaser();
      if (this.playerState.mode === "fighter") {
        // --- 1. Raiden Blue Focused Laser ---
        this.fireTimer = 0.065;
        const cols = 2 + this.playerState.laserLevel * 2;
        const spacing = 10;
        for (let i = 0; i < cols; i += 1) {
          const offset = (i - (cols - 1) / 2) * spacing;
          const bullet = this.bullets.get(this.player.x + offset, this.player.y - 46, "bolt") as Phaser.Physics.Arcade.Image;
          if (!bullet) continue;
          bullet.enableBody(true, this.player.x + offset, this.player.y - 46, true, true);
          bullet.setActive(true).setVisible(true).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
          bullet.setTint(0x3b82f6); // Glowing Blue
          bullet.setScale(1.2);
          bullet.setRotation(0);
          bullet.setVelocity(0, -1500); // Super fast straight line
          bullet.setData("damage", 10 + this.playerState.laserLevel * 3.5);
        }
      } else if (this.playerState.mode === "gerwalk") {
        // --- 2. Raiden Red Vulcan Spread ---
        this.fireTimer = 0.10;
        const count = 3 + this.playerState.cannonLevel * 2;
        const spreadAngle = 10 + this.playerState.cannonLevel * 3.5;
        for (let i = 0; i < count; i += 1) {
          const angle = ((i - (count - 1) / 2) * spreadAngle * Math.PI) / (180 * (count - 1 || 1));
          const bullet = this.bullets.get(this.player.x, this.player.y - 46, "bolt") as Phaser.Physics.Arcade.Image;
          if (!bullet) continue;
          bullet.enableBody(true, this.player.x, this.player.y - 46, true, true);
          bullet.setActive(true).setVisible(true).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
          bullet.setTint(0xff5555); // Glowing Red
          bullet.setScale(1);
          bullet.setVelocity(Math.sin(angle) * 1150, -Math.cos(angle) * 1150);
          bullet.setRotation(angle);
          bullet.setData("damage", 12 + this.playerState.cannonLevel * 4);
        }
      } else {
        // --- 3. Raiden Purple Curving Plasma Laser ---
        this.fireTimer = 0.05; // Fast tick rate for plasma beams
        const maxTargets = Math.min(3, 1 + Math.floor(this.playerState.lightningLevel / 2));
        const targets = (this.enemies.getChildren() as Phaser.Physics.Arcade.Sprite[]).filter((e) => e.active && e.y > -20 && e.y < H).sort((a, b) => {
          return Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y) - Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
        }).slice(0, maxTargets);

        if (targets.length > 0) {
          targets.forEach((target) => {
            const startX = this.player.x;
            const startY = this.player.y - 30;
            const endX = target.x;
            const endY = target.y;

            const points: Phaser.Math.Vector2[] = [];
            const segments = 10;
            const waveOffset = Math.sin(this.time.now * 0.05) * 25;
            for (let i = 0; i <= segments; i++) {
              const t = i / segments;
              const lx = Phaser.Math.Linear(startX, endX, t);
              const ly = Phaser.Math.Linear(startY, endY, t);
              const wave = Math.sin(t * Math.PI) * waveOffset;
              
              const angle = Phaser.Math.Angle.Between(startX, startY, endX, endY) + Math.PI / 2;
              points.push(new Phaser.Math.Vector2(lx + Math.cos(angle) * wave, ly + Math.sin(angle) * wave));
            }

            // Outer purple glow
            this.lightningGraphics.lineStyle(5, 0xd946ef, 0.9);
            this.lightningGraphics.beginPath();
            this.lightningGraphics.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
              this.lightningGraphics.lineTo(points[i].x, points[i].y);
            }
            this.lightningGraphics.stroke();

            // Inner white core
            this.lightningGraphics.lineStyle(2, 0xffffff, 0.95);
            this.lightningGraphics.beginPath();
            this.lightningGraphics.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
              this.lightningGraphics.lineTo(points[i].x, points[i].y);
            }
            this.lightningGraphics.stroke();

            // Deal continuous tick damage
            this.damageEnemy(target, 60 * dt * (1 + this.playerState.lightningLevel * 0.5), false);
            
            if (Math.random() < 0.25) {
              this.fx.explode(3, target.x, target.y);
            }
          });
        }
      }
    }

    if (this.missileTimer <= 0 && this.playerState.missileLevel > 0) {
      this.missileTimer = Math.max(0.48, 1.2 - this.playerState.missileLevel * 0.12);
      audio.playMissile();
      const pairs = this.playerState.mode === "armor" ? 2 : 1;
      for (let i = 0; i < pairs; i += 1) {
        const side = i % 2 === 0 ? -34 : 34;
        const missile = this.missiles.get(this.player.x + side, this.player.y - 12, "missile") as Phaser.Physics.Arcade.Image;
        if (!missile) continue;
        missile.enableBody(true, this.player.x + side, this.player.y - 12, true, true);
        missile.setActive(true).setVisible(true).setDepth(5).setVelocity(side * 4, -680);
        missile.setData("damage", 38 + this.playerState.missileLevel * 16);
      }
    }

    // Phase 2: Piercing Laser Beam Sub-weapon (only active in Fighter mode)
    if (this.playerState.mode === "fighter" && this.playerState.laserLevel > 0) {
      const laser = this.lasers.get(this.player.x, this.player.y - 340, "laser-beam") as Phaser.Physics.Arcade.Sprite;
      if (laser) {
        laser.enableBody(true, this.player.x, this.player.y - 340, true, true);
        laser.setActive(true).setVisible(true).setDepth(4).setScale(this.playerState.laserLevel * 1.1, 11).setBlendMode(Phaser.BlendModes.ADD);
        laser.setVelocity(0, 0); // Stays attached to player
        laser.setData("damage", (40 + this.playerState.laserLevel * 15) * dt); // Tick damage
        // Move manual coordinate to stay aligned with ship nose
        laser.x = this.player.x;
        laser.y = this.player.y - 370;
      }
    } else {
      this.lasers.clear(true, true);
    }

    // Phase 2: Homing Swarm Micro-missiles (only active in Gerwalk mode)
    if (this.playerState.mode === "gerwalk" && this.playerState.swarmLevel > 0) {
      this.swarmTimer -= dt;
      if (this.swarmTimer <= 0) {
        this.swarmTimer = Math.max(0.32, 1.0 - this.playerState.swarmLevel * 0.15);
        audio.playMissile();
        const count = this.playerState.swarmLevel * 2;
        for (let i = 0; i < count; i += 1) {
          const rx = this.player.x + Phaser.Math.Between(-24, 24);
          const ry = this.player.y - 16;
          const missile = this.missiles.get(rx, ry, "missile") as Phaser.Physics.Arcade.Image;
          if (!missile) continue;
          missile.enableBody(true, rx, ry, true, true);
          missile.setActive(true).setVisible(true).setDepth(6).setScale(0.8);
          const launchAngle = Phaser.Math.FloatBetween(-Math.PI * 0.8, -Math.PI * 0.2);
          const launchSpeed = 640;
          missile.setVelocity(Math.cos(launchAngle) * launchSpeed, Math.sin(launchAngle) * launchSpeed);
          missile.setData("damage", 22 + this.playerState.swarmLevel * 8);
        }
      }
    }
  }

  private updateHomingMissiles(dt: number) {
    this.missiles.children.each((child) => {
      const missile = child as Phaser.Physics.Arcade.Image;
      if (!missile.active || !missile.body) return true;
      const target = this.physics.closest(missile, this.enemies.getChildren().filter(e => e.active)) as Phaser.Physics.Arcade.Sprite | null;
      if (target && target.active) {
        const angle = Phaser.Math.Angle.Between(missile.x, missile.y, target.x, target.y);
        const currentAngle = Math.atan2(missile.body.velocity.y, missile.body.velocity.x);
        const nextAngle = Phaser.Math.Angle.RotateTo(currentAngle, angle, 0.16);
        const speed = 780;
        missile.setVelocity(Math.cos(nextAngle) * speed, Math.sin(nextAngle) * speed);
        missile.setRotation(nextAngle + Math.PI / 2);
      } else {
        missile.setVelocityY(-720);
        missile.setRotation(0);
      }
      return true;
    });
  }

  private handleSpawns(dt: number) {
    // Progress batches when all enemies are cleared
    if (this.batchSpawnedCount >= this.maxBatchSpawns && this.enemies.countActive(true) === 0) {
      if (this.currentBatch < 3) {
        this.currentBatch += 1;
        this.batchSpawnedCount = 0;
        this.maxBatchSpawns = 8 + this.currentBatch * 4 + this.wave * 2;
        this.spawnTimer = 2.5; // Brief transition pause
      } else if (this.bossHp <= 0) {
        // Wave/Level fully cleared! Progress to next Level/Wave
        if (this.level < 5) {
          this.level += 1;
        } else {
          // Loop back to Level 1 but increase wave multiplier
          this.level = 1;
          this.wave += 1;
        }
        audio.setLevel(this.level);
        this.currentBatch = 0;
        this.batchSpawnedCount = 0;
        this.maxBatchSpawns = 10 + this.wave * 2;
        this.spawnTimer = 3.5;
        this.bossHp = 0;
      }
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      if (this.currentBatch === 3) {
        // Boss assault batch
        if (this.bossHp <= 0 && this.enemies.countActive(true) === 0) {
          this.spawnEnemy("boss");
        }
        this.spawnTimer = 4.0;
      } else {
        // 24% chance of Swarm Assault in Level 3, 4, 5 when enemies are low
        if (this.level >= 3 && Math.random() < 0.24 && this.enemies.countActive(true) < 3) {
          this.spawnTimer = 4.0; 
          this.batchSpawnedCount += 4; 
          const swarmCount = 7 + this.wave * 2;
          for (let i = 0; i < swarmCount; i++) {
            const xPos = Phaser.Math.Between(50, W - 50);
            const enemyKey = Math.random() < 0.6 ? "enemy-drone" : "enemy-scout";
            const enemy = this.enemies.get(xPos, -40, enemyKey) as Phaser.Physics.Arcade.Sprite;
            if (enemy) {
              enemy.setTexture(enemyKey);
              enemy.enableBody(true, xPos, -40, true, true);
              enemy.clearTint();
              enemy.setScale(1);
              enemy.setActive(true).setVisible(true).setDepth(3);
              
              let hp = 35 + this.wave * 6;
              enemy.setData({
                kind: Math.random() < 0.6 ? "drone" : "scout",
                hp: hp,
                hpMax: hp,
                tier: 0,
                shoot: Phaser.Math.FloatBetween(0.2, 0.8),
                sway: Phaser.Math.FloatBetween(-1.5, 1.5),
                isDiving: true 
              });
              
              const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
              const diveSpeed = 460 + this.wave * 15;
              enemy.setVelocity(Math.cos(angle) * diveSpeed, Math.sin(angle) * diveSpeed);
              enemy.setRotation(angle + Math.PI / 2);
              enemy.setTint(0xff5555);
            }
          }
          return;
        }

        if (this.batchSpawnedCount < this.maxBatchSpawns) {
          this.spawnTimer = Math.max(0.32, 1.25 - this.wave * 0.05 - this.currentBatch * 0.15);
          this.batchSpawnedCount += 1;

          // Level-based spawns configuration
          if (this.level === 1) {
            if (this.currentBatch === 0) {
              this.spawnEnemy("scout");
            } else if (this.currentBatch === 1) {
              this.spawnEnemy(Math.random() < 0.65 ? "scout" : "frigate");
            } else {
              this.spawnEnemy(Math.random() < 0.5 ? "frigate" : "destroyer");
            }
          } else if (this.level === 2) {
            if (this.currentBatch === 0) {
              this.spawnEnemy("drone");
            } else if (this.currentBatch === 1) {
              this.spawnEnemy(Math.random() < 0.6 ? "drone" : "scout");
            } else {
              this.spawnEnemy(Math.random() < 0.5 ? "frigate" : "cruiser");
            }
          } else if (this.level === 3) {
            if (this.currentBatch === 0) {
              this.spawnEnemy(Math.random() < 0.75 ? "bomber" : "shield-projector");
            } else if (this.currentBatch === 1) {
              const roll = Math.random();
              this.spawnEnemy(roll < 0.5 ? "bomber" : roll < 0.8 ? "frigate" : "mine-carrier");
            } else {
              const roll = Math.random();
              this.spawnEnemy(roll < 0.35 ? "destroyer" : roll < 0.65 ? "bomber" : roll < 0.85 ? "mine-carrier" : "goliath-battleship");
            }
          } else if (this.level === 4) {
            if (this.currentBatch === 0) {
              this.spawnEnemy(Math.random() < 0.75 ? "vanguard" : "shield-projector");
            } else if (this.currentBatch === 1) {
              const roll = Math.random();
              this.spawnEnemy(roll < 0.5 ? "vanguard" : roll < 0.8 ? "drone" : "beam-cruiser");
            } else {
              const roll = Math.random();
              this.spawnEnemy(roll < 0.35 ? "cruiser" : roll < 0.65 ? "dreadnought" : roll < 0.85 ? "beam-cruiser" : "goliath-battleship");
            }
          } else {
            // Level 5
            if (this.currentBatch === 0) {
              const roll = Math.random();
              this.spawnEnemy(roll < 0.45 ? "dreadnought" : roll < 0.8 ? "drone" : "shield-projector");
            } else if (this.currentBatch === 1) {
              const roll = Math.random();
              this.spawnEnemy(roll < 0.45 ? "vanguard" : roll < 0.8 ? "bomber" : "mine-carrier");
            } else {
              const roll = Math.random();
              this.spawnEnemy(
                roll < 0.20 ? "dreadnought" :
                roll < 0.40 ? "cruiser" :
                roll < 0.55 ? "destroyer" :
                roll < 0.70 ? "beam-cruiser" :
                roll < 0.80 ? "mine-carrier" :
                roll < 0.90 ? "shield-projector" : "goliath-battleship"
              );
            }
          }
        }
      }
    }
  }

  private spawnEnemy(kind: "scout" | "frigate" | "destroyer" | "cruiser" | "bomber" | "drone" | "vanguard" | "dreadnought" | "shield-projector" | "beam-cruiser" | "mine-carrier" | "boss" | "goliath-battleship") {
    let key = "enemy-scout";
    if (kind === "frigate") key = "enemy-frigate";
    else if (kind === "destroyer") key = "enemy-destroyer";
    else if (kind === "cruiser") key = "enemy-cruiser";
    else if (kind === "bomber") key = "enemy-bomber";
    else if (kind === "drone") key = "enemy-drone";
    else if (kind === "vanguard") key = "enemy-vanguard";
    else if (kind === "dreadnought") key = "enemy-dreadnought";
    else if (kind === "shield-projector") key = "enemy-shield-projector";
    else if (kind === "beam-cruiser") key = "enemy-beam-cruiser";
    else if (kind === "mine-carrier") key = "enemy-mine-carrier";
    else if (kind === "goliath-battleship") key = "enemy-goliath-battleship";
    else if (kind === "boss") {
      const bossKeys = ["boss-carrier", "boss-nebula", "boss-destroyer", "boss-fortress", "boss-ragnarok"];
      key = bossKeys[this.level - 1] || "boss-carrier";
    }

    const x = Phaser.Math.Between(100, W - 100);
    const y = kind === "boss" ? -120 : -80;
    const enemy = this.enemies.get(x, y, key) as Phaser.Physics.Arcade.Sprite;
    if (!enemy) return;
    enemy.setTexture(key);
    enemy.enableBody(true, x, y, true, true);
    enemy.clearTint();
    enemy.setScale(1);

    // Roll for Tier (Standard: 0, Elite: 1, Champion: 2)
    let tier = 0;
    if (kind !== "boss") {
      const tierRoll = Math.random();
      const eliteChance = 0.15 + this.wave * 0.02;
      const championChance = 0.05 + this.wave * 0.01;
      if (tierRoll < championChance) {
        tier = 2; // Champion
      } else if (tierRoll < championChance + eliteChance) {
        tier = 1; // Elite
      }
    }

    // Custom stats per class
    let hp = 42 + this.wave * 7;
    let sizeRadius = 24;
    let speedY = Phaser.Math.Between(120, 220) + this.wave * 6;
    let isHeavy = false;

    if (kind === "frigate") {
      hp = 145 + this.wave * 18;
      sizeRadius = 36;
    } else if (kind === "destroyer") {
      hp = 480 + this.wave * 60;
      sizeRadius = 54;
      speedY = Phaser.Math.Between(80, 130) + this.wave * 3;
      isHeavy = true;
    } else if (kind === "cruiser") {
      hp = 320 + this.wave * 45;
      sizeRadius = 64;
      speedY = Phaser.Math.Between(100, 150) + this.wave * 4;
      isHeavy = true;
    } else if (kind === "bomber") {
      hp = 360 + this.wave * 40;
      sizeRadius = 48;
      speedY = Phaser.Math.Between(70, 110) + this.wave * 3;
      isHeavy = true;
    } else if (kind === "drone") {
      hp = 22 + this.wave * 4;
      sizeRadius = 18;
      speedY = Phaser.Math.Between(260, 360) + this.wave * 8;
    } else if (kind === "vanguard") {
      hp = 240 + this.wave * 25;
      sizeRadius = 32;
      speedY = Phaser.Math.Between(110, 160) + this.wave * 4;
    } else if (kind === "dreadnought") {
      hp = 750 + this.wave * 90;
      sizeRadius = 60;
      speedY = Phaser.Math.Between(60, 100) + this.wave * 2;
      isHeavy = true;
    } else if (kind === "shield-projector") {
      hp = 380 + this.wave * 40;
      sizeRadius = 48;
      speedY = Phaser.Math.Between(60, 90) + this.wave * 2;
      isHeavy = true;
    } else if (kind === "beam-cruiser") {
      hp = 440 + this.wave * 50;
      sizeRadius = 54;
      speedY = Phaser.Math.Between(70, 100) + this.wave * 2;
      isHeavy = true;
    } else if (kind === "mine-carrier") {
      hp = 500 + this.wave * 60;
      sizeRadius = 50;
      speedY = Phaser.Math.Between(80, 120) + this.wave * 3;
      isHeavy = true;
    } else if (kind === "goliath-battleship") {
      hp = 1400 + this.wave * 150;
      sizeRadius = 80;
      speedY = Phaser.Math.Between(40, 70) + this.wave * 1.5;
      isHeavy = true;
    } else if (kind === "boss") {
      const bossHps = [1800, 3000, 4500, 6000, 9000];
      hp = (bossHps[this.level - 1] || 1800) + this.wave * 300;
      sizeRadius = 84;
      speedY = 46;
      isHeavy = true;
    }

    // Apply Tier modifiers
    if (tier === 1) {
      hp = Math.round(hp * 1.6);
      enemy.setTint(0x00ffff);
      enemy.setScale(1.15);
      sizeRadius = Math.round(sizeRadius * 1.1);
    } else if (tier === 2) {
      hp = Math.round(hp * 2.6);
      enemy.setTint(0xffbb00);
      enemy.setScale(1.3);
      sizeRadius = Math.round(sizeRadius * 1.25);
    }

    // 50% chance to assign a dive-bomb timer to lightweight scouts, drones, and vanguards
    let diveTimer: number | undefined = undefined;
    if (kind === "scout" || kind === "drone" || kind === "vanguard") {
      if (Math.random() < 0.50) {
        diveTimer = Phaser.Math.FloatBetween(1.0, 3.5);
      }
    }

    enemy.setActive(true).setVisible(true).setDepth(kind === "boss" || kind === "goliath-battleship" ? 6 : 3)
      .setData({ kind, hp, hpMax: hp, tier, shoot: Phaser.Math.FloatBetween(0.4, 1.6), sway: Phaser.Math.FloatBetween(-1.6, 1.6), diveTimer });
    enemy.setVelocity(Phaser.Math.Between(-60, 60), speedY);
    enemy.setAngularVelocity(kind === "scout" || kind === "drone" ? Phaser.Math.Between(-45, 45) : 0);
    enemy.setCircle(sizeRadius, kind === "boss" ? 76 : 0, kind === "boss" ? 22 : 0);

    // Spawn Shield Dome if Shield Projector
    if (kind === "shield-projector") {
      const dome = this.enemyShields.get(x, y, "enemy-shield-dome") as Phaser.Physics.Arcade.Sprite;
      if (dome) {
        dome.enableBody(true, x, y, true, true);
        dome.setActive(true).setVisible(true).setDepth(4).setScale(1.0).setBlendMode(Phaser.BlendModes.ADD);
        dome.setData({ owner: enemy, hp: 300 + this.wave * 50, hpMax: 300 + this.wave * 50 });
        dome.setCircle(92, 18, 18);
        enemy.setData("shieldDome", dome);
      }
    }

    if (isHeavy || tier > 0) {
      this.warningTimer = 2.2;
      this.cameras.main.shake(450, 0.01);
      if (kind === "boss") {
        this.bossHp = hp;
      }
    }
  }

  private updateEnemies(dt: number) {
    this.enemies.children.each((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) return true;
      const kind = enemy.getData("kind") as string;

      // Handle dive bomb charge behavior for light fighters
      const isDiving = enemy.getData("isDiving") === true;
      let diveTimer = enemy.getData("diveTimer");
      if (!isDiving && diveTimer !== undefined) {
        diveTimer -= dt;
        enemy.setData("diveTimer", diveTimer);
        if (diveTimer <= 0) {
          enemy.setData("isDiving", true);
          enemy.setTint(0xff3333);
          audio.playMissile();
        }
      }
      
      // Kamikaze drone pursues the player directly, others sway slightly
      if (enemy.getData("isDiving") === true) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const diveSpeed = 380 + this.wave * 15;
        enemy.setVelocity(Math.cos(angle) * diveSpeed, Math.sin(angle) * diveSpeed);
        enemy.setRotation(angle + Math.PI / 2);
      } else if (kind === "drone") {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const droneSpeed = 260 + this.wave * 12;
        enemy.setVelocity(Math.cos(angle) * droneSpeed, Math.sin(angle) * droneSpeed);
        enemy.setRotation(angle + Math.PI / 2);
      } else if (kind === "goliath-battleship") {
        const hp = enemy.getData("hp");
        const hpMax = enemy.getData("hpMax");
        const isRaged = hp < hpMax * 0.55;
        if (isRaged) {
          enemy.setTint(0xff5555);
          enemy.setVelocityY(220 + this.wave * 5);
          // Raged battleships fire significantly faster!
          enemy.setData("shoot", enemy.getData("shoot") - dt * 1.25);
        } else {
          enemy.setVelocityY(50 + this.wave * 1.5);
        }
        enemy.x += Math.sin(this.time.now * 0.0018 + enemy.getData("sway")) * 1.2;
      } else if (kind === "beam-cruiser") {
        const state = enemy.getData("beamState") || "idle";
        if (state === "targeting" || state === "firing") {
          enemy.setVelocity(0, 0); // Stops completely when charging or firing
        } else {
          enemy.x += Math.sin(this.time.now * 0.0018 + enemy.getData("sway")) * 1.5;
          enemy.setVelocityY(80 + this.wave * 2);
        }
      } else {
        enemy.x += Math.sin(this.time.now * 0.0018 + enemy.getData("sway")) * (kind === "boss" ? 0.9 : 1.8);
        if (kind === "boss" && enemy.y > 170) enemy.setVelocityY(8);
      }
      
      const shoot = enemy.getData("shoot") - dt;
      enemy.setData("shoot", shoot);
      if (shoot <= 0) {
        const tier = enemy.getData("tier") as number;
        let shootDelay = 1.0;
        let isHoming = (tier === 2);

        // Goliath Battleship Weapon Attacks
        if (kind === "goliath-battleship") {
          shootDelay = 1.15;
          const roll = Math.random();
          if (roll < 0.35) {
            // Massive 9-bullet shotgun blast
            const count = 9;
            for (let i = 0; i < count; i++) {
              const angle = Math.PI / 2 + ((i - (count - 1) / 2) * 0.22);
              this.enemyFireAngle(enemy.x, enemy.y + 60, angle, 300);
            }
          } else if (roll < 0.70) {
            // Launch 2 toxic nukes!
            this.enemyFireNuke(enemy.x - 40, enemy.y + 50);
            this.enemyFireNuke(enemy.x + 40, enemy.y + 50);
          } else {
            // Deploy space mines behind it
            this.enemyDropMine(enemy.x - 50, enemy.y + 40);
            this.enemyDropMine(enemy.x + 50, enemy.y + 40);
          }
        }

        // Heavy ships have a chance to fire Toxic Nuclear Missiles
        const heavyNukeRoll = (kind === "dreadnought" || kind === "cruiser" || kind === "destroyer" || kind === "boss") && Math.random() < 0.16;

        if (heavyNukeRoll) {
          shootDelay = 2.2;
          this.enemyFireNuke(enemy.x, enemy.y + 40);
        } else if (kind === "boss") {
          if (this.level === 1) {
            shootDelay = 0.22;
            const lanes = [-44, 0, 44];
            lanes.forEach((lane) => this.enemyFire(enemy.x + lane, enemy.y + 36, 240));
          } else if (this.level === 2) {
            shootDelay = 0.48;
            const count = 12;
            for (let i = 0; i < count; i++) {
              const angle = (i * Math.PI * 2) / count;
              this.enemyFireAngle(enemy.x, enemy.y + 40, angle, 260);
            }
          } else if (this.level === 3) {
            shootDelay = 0.8;
            this.enemyFire(enemy.x - 60, enemy.y + 40, 280, true);
            this.enemyFire(enemy.x + 60, enemy.y + 40, 280, true);
          } else if (this.level === 4) {
            shootDelay = 0.16;
            const step = (this.time.now / 120) % (Math.PI * 2);
            this.enemyFireAngle(enemy.x, enemy.y + 50, step, 280);
            this.enemyFireAngle(enemy.x, enemy.y + 50, step + Math.PI / 2, 280);
            this.enemyFireAngle(enemy.x, enemy.y + 50, step + Math.PI, 280);
            this.enemyFireAngle(enemy.x, enemy.y + 50, step - Math.PI / 2, 280);
          } else {
            // Level 5 Ultimate Boss
            shootDelay = 0.28;
            const rand = Math.random();
            if (rand < 0.45) {
              for (let i = 0; i < 16; i++) {
                const angle = (i * Math.PI * 2) / 16;
                this.enemyFireAngle(enemy.x, enemy.y + 60, angle, 300);
              }
            } else {
              this.enemyFire(enemy.x - 30, enemy.y + 60, 350, true);
              this.enemyFire(enemy.x + 30, enemy.y + 60, 350, true);
            }
          }
        } else if (kind === "destroyer") {
          shootDelay = tier === 2 ? 0.75 : tier === 1 ? 0.95 : 1.15;
          this.enemyFire(enemy.x - 30, enemy.y + 30, 260, isHoming);
          this.enemyFire(enemy.x, enemy.y + 40, 280, isHoming);
          this.enemyFire(enemy.x + 30, enemy.y + 30, 260, isHoming);
        } else if (kind === "cruiser") {
          shootDelay = tier === 2 ? 0.9 : tier === 1 ? 1.15 : 1.4;
          this.enemyFire(enemy.x - 45, enemy.y + 35, 230, true);
          this.enemyFire(enemy.x + 45, enemy.y + 35, 230, true);
          if (tier > 0) {
            this.enemyFire(enemy.x, enemy.y + 45, 250, true);
          }
        } else if (kind === "frigate") {
          shootDelay = tier === 2 ? 0.5 : tier === 1 ? 0.68 : 0.86;
          this.enemyFire(enemy.x, enemy.y + 36, 310, isHoming);
          if (tier > 0) {
            this.enemyFire(enemy.x - 20, enemy.y + 24, 290, isHoming);
            this.enemyFire(enemy.x + 20, enemy.y + 24, 290, isHoming);
          }
        } else if (kind === "bomber") {
          shootDelay = tier === 2 ? 1.2 : tier === 1 ? 1.5 : 1.8;
          this.enemyDropBomb(enemy.x, enemy.y + 32);
        } else if (kind === "drone") {
          shootDelay = 999.0;
        } else if (kind === "vanguard") {
          shootDelay = tier === 2 ? 0.7 : tier === 1 ? 0.9 : 1.1;
          this.enemyFire(enemy.x, enemy.y + 24, 330, isHoming);
          this.time.delayedCall(160, () => {
            if (enemy.active) this.enemyFire(enemy.x, enemy.y + 24, 330, isHoming);
          });
          this.time.delayedCall(320, () => {
            if (enemy.active) this.enemyFire(enemy.x, enemy.y + 24, 330, isHoming);
          });
        } else if (kind === "dreadnought") {
          shootDelay = tier === 2 ? 0.9 : tier === 1 ? 1.2 : 1.5;
          const count = 10;
          const startAngle = (this.time.now / 150) % (Math.PI * 2);
          for (let i = 0; i < count; i++) {
            const angle = startAngle + (i * Math.PI * 2) / count;
            this.enemyFireAngle(enemy.x, enemy.y + 45, angle, 250);
          }
        } else if (kind === "shield-projector") {
          shootDelay = 1.4;
          this.enemyFire(enemy.x, enemy.y + 30, 240, isHoming);
        } else if (kind === "mine-carrier") {
          shootDelay = 1.8;
          this.enemyDropMine(enemy.x, enemy.y + 32);
        } else if (kind === "beam-cruiser") {
          const state = enemy.getData("beamState") || "idle";
          if (state === "idle") {
            enemy.setData("beamState", "targeting");
            shootDelay = 1.2; // charging lock duration
          } else if (state === "targeting") {
            enemy.setData("beamState", "firing");
            shootDelay = 2.2; // firing beam duration
            audio.playSpecial();
          } else {
            enemy.setData("beamState", "idle");
            shootDelay = 2.8; // cooldown
          }
        } else {
          // scout
          shootDelay = tier === 2 ? 0.8 : tier === 1 ? 1.1 : 1.45;
          this.enemyFire(enemy.x, enemy.y + 24, 300, isHoming);
          if (tier > 0) {
            this.enemyFire(enemy.x - 12, enemy.y + 18, 300, isHoming);
            this.enemyFire(enemy.x + 12, enemy.y + 18, 300, isHoming);
          }
        }
        enemy.setData("shoot", shootDelay);
      }
      return true;
    });

    // Update seeking enemy shots (Homing logic & Bomb/Mine explosion)
    this.enemyShots.children.each((child) => {
      const shot = child as Phaser.Physics.Arcade.Image;
      if (!shot.active || !shot.body) return true;
      
      const isMine = shot.getData("isMine") === true;
      const isNuke = shot.getData("isNuke") === true;

      if (isMine) {
        shot.angle += 2; // slow spin
      } else if (isNuke) {
        // slight smoke trail
        if (Math.random() < 0.15) {
          this.fx.explode(2, shot.x, shot.y);
        }
      }

      if (shot.getData("isBomb") === true) {
        let timer = shot.getData("timer") - dt;
        shot.setData("timer", timer);
        shot.setScale(0.8 + Math.sin(this.time.now * 0.01) * 0.15);
        if (timer <= 0) {
          const count = 8;
          for (let i = 0; i < count; i++) {
            const angle = (i * Math.PI * 2) / count;
            this.enemyFireAngle(shot.x, shot.y, angle, 280);
          }
          this.fx.explode(12, shot.x, shot.y);
          shot.disableBody(true, true);
        }
      } else if (shot.getData("homing") === true) {
        const angle = Phaser.Math.Angle.Between(shot.x, shot.y, this.player.x, this.player.y);
        const currentAngle = Math.atan2(shot.body.velocity.y, shot.body.velocity.x);
        const nextAngle = Phaser.Math.Angle.RotateTo(currentAngle, angle, 0.05);
        const speed = 250;
        shot.setVelocity(Math.cos(nextAngle) * speed, Math.sin(nextAngle) * speed);
        shot.setRotation(nextAngle + Math.PI / 2);
      }
      return true;
    });
  }

  private enemyFire(x: number, y: number, speed: number, isHoming = false) {
    const shot = this.enemyShots.get(x, y, "enemy-shot") as Phaser.Physics.Arcade.Image;
    if (!shot) return;
    shot.enableBody(true, x, y, true, true);
    const angle = Phaser.Math.Angle.Between(x, y, this.player.x, this.player.y);
    shot.setActive(true).setVisible(true).setDepth(4).setScale(0.55).setBlendMode(Phaser.BlendModes.ADD);
    if (isHoming) {
      shot.setTint(0xa855f7); // Purple homing indicator
      shot.setData("homing", true);
    } else {
      shot.clearTint();
      shot.setData("homing", false);
    }
    shot.setData("isBomb", false);
    shot.setData("isMine", false);
    shot.setData("isNuke", false);
    shot.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  private enemyFireAngle(x: number, y: number, angle: number, speed: number, isHoming = false) {
    const shot = this.enemyShots.get(x, y, "enemy-shot") as Phaser.Physics.Arcade.Image;
    if (!shot) return;
    shot.enableBody(true, x, y, true, true);
    shot.setActive(true).setVisible(true).setDepth(4).setScale(0.55).setBlendMode(Phaser.BlendModes.ADD);
    if (isHoming) {
      shot.setTint(0xa855f7);
      shot.setData("homing", true);
    } else {
      shot.clearTint();
      shot.setData("homing", false);
    }
    shot.setData("isBomb", false);
    shot.setData("isMine", false);
    shot.setData("isNuke", false);
    shot.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  private enemyDropBomb(x: number, y: number) {
    const bomb = this.enemyShots.get(x, y, "enemy-bomb") as Phaser.Physics.Arcade.Image;
    if (!bomb) return;
    bomb.enableBody(true, x, y, true, true);
    bomb.setActive(true).setVisible(true).setDepth(4).setScale(0.8).setBlendMode(Phaser.BlendModes.ADD);
    bomb.clearTint();
    bomb.setVelocity(0, 160);
    bomb.setData({ isBomb: true, timer: 1.5, isMine: false, isNuke: false });
  }

  private enemyDropMine(x: number, y: number) {
    const mine = this.enemyShots.get(x, y, "space-mine") as Phaser.Physics.Arcade.Image;
    if (!mine) return;
    mine.enableBody(true, x, y, true, true);
    mine.setActive(true).setVisible(true).setDepth(4).setScale(1.0);
    mine.clearTint();
    mine.setVelocity(Phaser.Math.Between(-60, 60), 80);
    mine.setData({ isBomb: false, isMine: true, isNuke: false, hp: 30 });
  }

  private enemyFireNuke(x: number, y: number) {
    const nuke = this.enemyShots.get(x, y, "enemy-nuke") as Phaser.Physics.Arcade.Image;
    if (!nuke) return;
    nuke.enableBody(true, x, y, true, true);
    nuke.setActive(true).setVisible(true).setDepth(4).setScale(0.85);
    nuke.clearTint();
    const angle = Phaser.Math.Angle.Between(x, y, this.player.x, this.player.y);
    nuke.setVelocity(Math.cos(angle) * 140, Math.sin(angle) * 140);
    nuke.setData({ isBomb: false, isMine: false, isNuke: true, hp: 50 });
  }

  private changeMode(mode: Mode) {
    if (this.pausedByOverlay || this.playerState.mode === mode) return;
    audio.playModeChange();
    this.playerState.mode = mode;
    this.player.setTexture(`player-${mode}`);
    this.playerState.shield = clamp(this.playerState.shield + (mode === "armor" ? 20 : 8), 0, this.playerState.shieldMax);
    this.cameras.main.flash(120, 81, 246, 255, false);
    this.fx.explode(25, this.player.x, this.player.y);

    const colors = { fighter: 0x51f6ff, gerwalk: 0xffcb57, armor: 0xff477e };
    this.thrusterFx.setParticleTint(colors[mode]);

    this.tweens.add({
      targets: this.player,
      scale: { start: 0.7, to: 1 },
      duration: 200,
      ease: "Back.easeOut"
    });
  }

  private cycleMode() {
    const next: Record<Mode, Mode> = { fighter: "gerwalk", gerwalk: "armor", armor: "fighter" };
    this.changeMode(next[this.playerState.mode]);
  }

  private special() {
    if (this.pausedByOverlay || this.playerState.special < 100) return;
    audio.playSpecial();
    this.playerState.special = 0;
    this.cameras.main.shake(540, 0.018);
    this.cameras.main.flash(220, 255, 203, 87, false);
    for (let i = 0; i < 18; i += 1) {
      const x = 80 + (i % 6) * 160;
      const y = H - 120 - Math.floor(i / 6) * 70;
      const missile = this.missiles.get(x, y, "missile") as Phaser.Physics.Arcade.Image;
      if (!missile) continue;
      missile.enableBody(true, x, y, true, true);
      missile.setActive(true).setVisible(true).setDepth(7).setScale(1.15).setVelocity(Phaser.Math.Between(-80, 80), -980);
      missile.setData("damage", 180);
    }
  }

  private hitEnemy: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (projectileObj, enemyObj) => {
    const projectile = projectileObj as Phaser.Physics.Arcade.Image;
    const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
    projectile.disableBody(true, true);
    
    const isHyper = projectile.getData("isHyperShell") === true;
    const dmg = projectile.getData("damage") ?? (isHyper ? 80 : 10);
    this.damageEnemy(enemy, dmg, isHyper);

    if (isHyper) {
      // Area of effect splash damage
      this.fx.explode(22, enemy.x, enemy.y);
      const radius = 180;
      this.enemies.children.each((child) => {
        const other = child as Phaser.Physics.Arcade.Sprite;
        if (other.active && other !== enemy && Phaser.Math.Distance.Between(enemy.x, enemy.y, other.x, other.y) < radius) {
          this.damageEnemy(other, Math.round(dmg * 0.55), true);
        }
        return true;
      });
    }
  };

  private hitEnemyWithMissile: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (projectileObj, enemyObj) => {
    const projectile = projectileObj as Phaser.Physics.Arcade.Image;
    const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
    projectile.disableBody(true, true);
    this.fx.explode(22, projectile.x, projectile.y);
    this.damageEnemy(enemy, projectile.getData("damage") ?? 50, true);
  };

  private hitEnemyShield: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (projectileObj, shieldObj) => {
    const projectile = projectileObj as Phaser.Physics.Arcade.Image;
    const shield = shieldObj as Phaser.Physics.Arcade.Sprite;
    projectile.disableBody(true, true);
    this.fx.explode(8, projectile.x, projectile.y);
    
    const dmg = projectile.getData("damage") ?? 10;
    const hp = shield.getData("hp") - dmg;
    shield.setData("hp", hp);
    shield.setTintFill(0xffffff);
    this.time.delayedCall(45, () => shield.clearTint());

    if (hp <= 0) {
      this.fx.explode(32, shield.x, shield.y);
      shield.disableBody(true, true);
    }
  };

  private hitEnemyShieldWithLaser: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (laserObj, shieldObj) => {
    const laser = laserObj as Phaser.Physics.Arcade.Sprite;
    const shield = shieldObj as Phaser.Physics.Arcade.Sprite;
    const dmg = laser.getData("damage") ?? 2;
    const hp = shield.getData("hp") - dmg;
    shield.setData("hp", hp);
    if (hp <= 0) {
      this.fx.explode(32, shield.x, shield.y);
      shield.disableBody(true, true);
    }
  };

  private hitEnemyShot: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (projectileObj, shotObj) => {
    const projectile = projectileObj as Phaser.Physics.Arcade.Image;
    const shot = shotObj as Phaser.Physics.Arcade.Image;
    
    const isMine = shot.getData("isMine") === true;
    const isNuke = shot.getData("isNuke") === true;
    
    if (isMine || isNuke) {
      projectile.disableBody(true, true);
      this.fx.explode(6, projectile.x, projectile.y);
      
      const dmg = projectile.getData("damage") ?? (projectile.getData("isHyperShell") === true ? 80 : 10);
      const hp = (shot.getData("hp") ?? 10) - dmg;
      shot.setData("hp", hp);
      
      if (hp <= 0) {
        this.fx.explode(18, shot.x, shot.y);
        shot.disableBody(true, true);
        this.score += isNuke ? 150 : 80;
      }
    }
  };

  private hitEnemyShotWithLaser: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (laserObj, shotObj) => {
    const shot = shotObj as Phaser.Physics.Arcade.Image;
    const laser = laserObj as Phaser.Physics.Arcade.Sprite;
    const isMine = shot.getData("isMine") === true;
    const isNuke = shot.getData("isNuke") === true;
    
    if (isMine || isNuke) {
      const dmg = laser.getData("damage") ?? 2;
      const hp = (shot.getData("hp") ?? 10) - dmg;
      shot.setData("hp", hp);
      if (hp <= 0) {
        this.fx.explode(18, shot.x, shot.y);
        shot.disableBody(true, true);
        this.score += isNuke ? 150 : 80;
      }
    }
  };

  private hitAegis: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (shotObj, aegisObj) => {
    const shot = shotObj as Phaser.Physics.Arcade.Image;
    const orb = aegisObj as Phaser.Physics.Arcade.Sprite;
    shot.disableBody(true, true);
    this.fx.explode(6, shot.x, shot.y);
    
    orb.setTint(0xffffff);
    this.time.delayedCall(80, () => { if (orb.active) orb.clearTint(); });
    audio.playLaser();
  };

  private launchNuke() {
    if (this.pausedByOverlay || this.playerState.nukeStock <= 0) return;
    this.playerState.nukeStock -= 1;
    this.cameras.main.shake(900, 0.03);
    this.cameras.main.flash(450, 255, 255, 255, false);
    audio.playSpecial();

    // Spawn expanding shockwave
    const blast = this.add.image(W / 2, H / 2, "nuke-blast").setDepth(7).setScale(0.1).setAlpha(0.9);
    this.tweens.add({
      targets: blast,
      scale: 12.0,
      alpha: 0,
      duration: 1200,
      ease: "Quad.easeOut",
      onComplete: () => blast.destroy()
    });

    // Clear all enemy projectiles
    this.enemyShots.clear(true, true);

    // Damage all active enemies
    this.enemies.children.each((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (enemy.active) {
        this.damageEnemy(enemy, 420, true);
      }
      return true;
    });
  }

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
    audio.playExplosion(kind === "boss");
    this.fx.explode(kind === "boss" ? 130 : kind === "frigate" ? 44 : 22, enemy.x, enemy.y);
    this.cameras.main.shake(kind === "boss" ? 900 : 160, kind === "boss" ? 0.026 : 0.005);
    this.score += kind === "boss" ? 10000 : kind === "frigate" ? 840 : 180;
    this.playerState.special = clamp(this.playerState.special + (kind === "boss" ? 45 : 7), 0, 100);
    
    // Spawn spinning gold medal (50% chance for non-boss enemies)
    if (Math.random() < 0.50 && kind !== "boss") {
      const medal = this.medalsGroup.get(enemy.x, enemy.y, "medal") as Phaser.Physics.Arcade.Sprite;
      if (medal) {
        medal.enableBody(true, enemy.x, enemy.y, true, true);
        medal.setActive(true).setVisible(true).setDepth(5).setVelocity(0, 160);
      }
    }

    if (Math.random() < (kind === "boss" ? 1 : 0.26)) this.dropPickup(enemy.x, enemy.y, kind === "boss" ? "core" : undefined);
    if (kind === "boss") {
      this.wave += 1;
      this.bossHp = 0;
      this.bossTimer = 34;
    }
    enemy.disableBody(true, true);
  }

  private hitEnemyWithLaser: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (laserObj, enemyObj) => {
    const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
    const laser = laserObj as Phaser.Physics.Arcade.Sprite;
    this.damageEnemy(enemy, laser.getData("damage") ?? 2, false);
  };

  private dropPickup(x: number, y: number, force?: PickupKind) {
    const kinds: PickupKind[] = ["cannon", "missile", "repair", "core", "laser", "swarm", "nuke", "lightning", "aegis"];
    const kind = force ?? kinds[Phaser.Math.Between(0, kinds.length - 1)];
    const pickup = this.pickups.get(x, y, "pickup") as Phaser.Physics.Arcade.Image;
    if (!pickup) return;
    pickup.enableBody(true, x, y, true, true);
    pickup.setActive(true).setVisible(true).setDepth(5).setData("kind", kind).setVelocity(Phaser.Math.Between(-40, 40), 150);
    pickup.setTint(kind === "cannon" ? 0x51f6ff : kind === "missile" ? 0xffcb57 : kind === "repair" ? 0x79ff9f : kind === "laser" ? 0xef4444 : kind === "swarm" ? 0xa855f7 : kind === "nuke" ? 0xfacc15 : kind === "lightning" ? 0x60a5fa : kind === "aegis" ? 0x06b6d4 : 0xff477e);
  }

  private collectMedal: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObj, medalObj) => {
    const medal = medalObj as Phaser.Physics.Arcade.Image;
    audio.playPickup();
    this.score += 500;
    
    const text = this.add.text(medal.x, medal.y, "+500", {
      fontFamily: "Outfit, sans-serif",
      fontSize: "20px",
      color: "#facc15",
      stroke: "#000000",
      strokeThickness: 3
    }).setDepth(10);
    this.tweens.add({
      targets: text,
      y: medal.y - 60,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy()
    });

    medal.disableBody(true, true);
  };

  private collectPickup: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObj, pickupObj) => {
    const pickup = pickupObj as Phaser.Physics.Arcade.Image;
    const kind = pickup.getData("kind") as PickupKind;
    audio.playPickup();
    
    // Raiden style: Collecting Red/Blue/Purple weapons changes active mode and upgrades it!
    if (kind === "cannon") {
      this.changeMode("gerwalk");
      this.playerState.cannonLevel = clamp(this.playerState.cannonLevel + 1, 1, 5);
    }
    if (kind === "laser") {
      this.changeMode("fighter");
      this.playerState.laserLevel = clamp(this.playerState.laserLevel + 1, 1, 5);
    }
    if (kind === "lightning") {
      this.changeMode("armor");
      this.playerState.lightningLevel = clamp(this.playerState.lightningLevel + 1, 1, 5);
    }
    
    if (kind === "missile") this.playerState.missileLevel = clamp(this.playerState.missileLevel + 1, 1, 5);
    if (kind === "swarm") this.playerState.swarmLevel = clamp(this.playerState.swarmLevel + 1, 0, 5);
    if (kind === "aegis") this.playerState.aegisLevel = clamp(this.playerState.aegisLevel + 1, 0, 5);
    if (kind === "nuke") this.playerState.nukeStock = clamp(this.playerState.nukeStock + 1, 0, 3);
    if (kind === "repair") this.playerState.hp = clamp(this.playerState.hp + 32, 0, this.playerState.hpMax);
    if (kind === "core") {
      this.playerState.cannonLevel = clamp(this.playerState.cannonLevel + 1, 1, 5);
      this.playerState.missileLevel = clamp(this.playerState.missileLevel + 1, 1, 5);
      this.playerState.laserLevel = clamp(this.playerState.laserLevel + 1, 0, 5);
      this.playerState.swarmLevel = clamp(this.playerState.swarmLevel + 1, 0, 5);
      this.playerState.lightningLevel = clamp(this.playerState.lightningLevel + 1, 0, 5);
      this.playerState.aegisLevel = clamp(this.playerState.aegisLevel + 1, 0, 5);
      this.playerState.nukeStock = clamp(this.playerState.nukeStock + 1, 0, 3);
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
    const isMine = shot.getData("isMine") === true;
    const isNuke = shot.getData("isNuke") === true;
    shot.disableBody(true, true);
    
    const damage = isNuke ? 48 : isMine ? 34 : 14;
    this.damagePlayer(damage);
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
    audio.playGameOver();
    audio.stopMusic();
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
    [this.bullets, this.missiles, this.enemyShots, this.pickups, this.enemies, this.medalsGroup].forEach((group) => {
      group.children.each((child) => {
        const obj = child as Phaser.Physics.Arcade.Image;
        if (obj.active && (obj.y < -150 || obj.y > H + 64 || obj.x < -64 || obj.x > W + 64)) {
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
    hud.wave.textContent = `${this.level}-${this.wave}`;
    hud.boss.textContent = this.bossHp > 0 ? `${Math.ceil(this.bossHp)}` : "--";
    hud.cannon.textContent = `Lv.${this.playerState.cannonLevel}`;
    hud.missile.textContent = `Lv.${this.playerState.missileLevel}`;
    hud.laser.textContent = `Lv.${this.playerState.laserLevel}`;
    hud.swarm.textContent = `Lv.${this.playerState.swarmLevel}`;
    Object.entries(hud.modeButtons).forEach(([mode, el]) => el.classList.toggle("active", mode === this.playerState.mode));

    const batchNamesMatrix = [
      // Level 1
      ["Scout Swarm Incoming", "Flanking Fleet Engaging", "Heavy Warship Guard Wall", "Boss Carrier Assault"],
      // Level 2
      ["Kamikaze Drones Swarm", "Sleek Infiltrators Grid", "Heavy Cruiser Squad", "Boss Nebula Dreadnought"],
      // Level 3
      ["Heavy Bomber Formations", "Bombers & Frigates Grid", "Destroyers Vanguard Wall", "Boss Destroyer Assault"],
      // Level 4
      ["Shield Vanguard Grid", "Vanguards & Drones Swarm", "Dreadnought Battle Line", "Boss Fortress Assault"],
      // Level 5
      ["Dreadnoughts & Drones Alert", "Vanguard & Bomber Assault", "Elite Fleet Heavy Guard", "Ultimate Ragnarok Core"]
    ];

    const currentLevelBatches = batchNamesMatrix[this.level - 1] || batchNamesMatrix[0];
    hud.batchName.textContent = currentLevelBatches[this.currentBatch] || "Unknown Threat";
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
