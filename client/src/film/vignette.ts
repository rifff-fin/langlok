/**
 * Living illustrations for the Chatak story (section 06), drawn with the hero film's pieces
 * (the generated layers, the drawn Chatak, the acacia branch) so the story looks like the
 * film, never like a photo:
 *   'wait'   he sits on the acacia branch in the misty woods, breathing and looking about,
 *            now and then lifting his head to the sky
 *   'catch'  seen from below in the rain, wings beating, he catches drop after drop
 * Time drives everything (no scroll); without motion one telling frame is drawn.
 */
import { beakTip, drawChatak, type BirdPose } from './chatak';
import { Branch } from './branch';
import type { Layers } from './film';

export type Scene = 'wait' | 'catch';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** Where he looks while he waits: a slow round of head turns (as in the film). */
const LOOKS = [0, -0.55, 0.18, -0.28, 0.42, -0.12, 0.3, -0.48];
/** The film's monsoon slate (film.ts STORM). */
const STORM = ['#7f8797', '#a5acb8', '#c8ced5'] as const;
/** One drop every CYCLE seconds: it falls for FALL, then splashes on the beak. */
const CYCLE = 3.2;
const FALL = 0.9;

type Img = CanvasImageSource & { width: number; height: number };

export class Vignette {
  private ctx: CanvasRenderingContext2D;
  private w = 1;
  private h = 1;
  private look = 0;
  private last = 0;
  private branch = new Branch({ limb: '#3d423b', back: '#7a8780', front: '#59665f' });
  private smoke: HTMLCanvasElement;

  constructor(
    private canvas: HTMLCanvasElement,
    private L: Layers,
    private scene: Scene,
    private motion: boolean,
  ) {
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.smoke = document.createElement('canvas');
    this.smoke.width = L.mistB.width;
    this.smoke.height = L.mistB.height;
    const x = this.smoke.getContext('2d')!;
    x.drawImage(L.mistB, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = '#8c93a1';
    x.fillRect(0, 0, this.smoke.width, this.smoke.height);
  }

  resize(w: number, h: number, dpr: number) {
    this.w = w;
    this.h = h;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingQuality = 'high';
  }

  /** Draw the scene at `time` (s). Without motion a fixed, telling moment is drawn. */
  draw(time: number) {
    const t = this.motion ? time : this.scene === 'catch' ? 0.62 : 0;
    const dt = Math.min(0.1, Math.max(0, time - this.last));
    this.last = time;
    const { ctx } = this;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    if (this.scene === 'wait') this.wait(t, dt);
    else this.catch(t);
    ctx.globalAlpha = 1;
  }

  /** A horizontally tiling band (mist, cloud, woods), scrolled by `offset` px. */
  private band(img: Img, y: number, height: number, offset: number) {
    const tw = (img.width * height) / img.height;
    let x = -(((offset % tw) + tw) % tw);
    for (; x < this.w; x += tw) this.ctx.drawImage(img, x, y, tw, height);
  }

  /* ---------------------------------------------------------------- the wait */

  private wait(t: number, dt: number) {
    const { ctx, w, h, L } = this;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#e7ecee');
    sky.addColorStop(1, '#eef1f2');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    // the dry season's warm light, from the upper right
    const glow = ctx.createRadialGradient(w * 0.85, -h * 0.05, 0, w * 0.85, -h * 0.05, h * 1.05);
    glow.addColorStop(0, 'rgba(255, 244, 222, 0.8)');
    glow.addColorStop(1, 'rgba(255, 244, 222, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    this.band(L.woodFar, -h * 0.06, h * 1.0, t * 1.5 + 200);
    ctx.globalAlpha = 0.55;
    this.band(L.mistA, h * 0.4, h * 0.5, t * 6);
    ctx.globalAlpha = 1;
    this.band(L.woodMid, -h * 0.1, h * 1.1, t * 3 + 640);

    // sun shafts, breathing slowly
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.55 + 0.15 * Math.sin(t * 0.45);
    const r = Math.max(w, h) * 1.2;
    ctx.drawImage(L.rays, w - r * 0.9 + Math.sin(t * 0.12) * 10, -r * 0.12, r, r);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.45;
    this.band(L.mistB, h * 0.56, h * 0.4, -t * 10 + 300);
    ctx.globalAlpha = 1;

    // where he looks: quick snaps between slow holds, and now and then up at the sky
    const target = this.motion ? LOOKS[Math.floor(t / 2.4) % LOOKS.length] : 0.18;
    this.look += (target - this.look) * (1 - Math.exp(-dt * 10));
    const skyward = this.motion ? ss(0, 0.6, Math.sin((t / 11) * Math.PI * 2) - 0.55) : 0;

    // the branch and the Chatak (the branch's perch point moves with it)
    const u = w * 1.15;
    const size = w * 0.46;
    const wind = 0.08;
    const [px, py] = this.branch.layout(w * 0.5, h * 0.56, u, t, wind);
    this.branch.drawBack(ctx, u, t, wind);
    const pose: BirdPose = {
      x: px - 0.035 * size,
      y: py - 0.17 * size,
      size,
      facing: 1,
      pitch: 0.86 + 0.02 * Math.sin(t * 0.45),
      roll: 0,
      open: 0,
      flap: 0,
      fold: 0,
      crest: 0.5 + 0.12 * Math.sin(t * 0.8) + 0.3 * skyward,
      beak: 0,
      headYaw: this.look * (1 - skyward),
      headPitch: -0.72 + 0.8 * skyward,
      tailDroop: 0.42 + 0.04 * Math.sin(t * 0.9),
      tailSpread: 0.15,
      breathe: Math.sin(t * 2.2),
      perch: { x: px, y: py },
      alpha: 1,
    };
    drawChatak(ctx, pose);
    this.branch.drawFront(ctx, u, t, wind);

    // out-of-focus fronds right in front of the lens
    ctx.globalAlpha = 0.85;
    this.band(L.woodNear, h * 0.62, h * 0.48, t * 1.2);
    ctx.globalAlpha = 1;

    // motes drifting in the light
    ctx.fillStyle = 'rgba(255, 246, 222, 0.9)';
    for (let i = 0; i < 30; i++) {
      const x = ((((hash(i) * 1.2 - 0.1) * w + Math.sin(t * 0.3 + i) * 14) % w) + w) % w;
      const y = (((hash(i + 9) * h - t * (6 + hash(i + 3) * 10)) % h) + h) % h;
      ctx.globalAlpha = 0.2 + 0.4 * Math.sin(t * (0.8 + hash(i + 2)) + i) ** 2;
      ctx.beginPath();
      ctx.arc(x, y, 0.6 + hash(i + 5) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------------------------------------------------------------- the catch */

  private catch(t: number) {
    const { ctx, w, h, L } = this;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, STORM[0]);
    sky.addColorStop(0.6, STORM[1]);
    sky.addColorStop(1, STORM[2]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    // light behind the storm, high up, where he is flying
    const glow = ctx.createRadialGradient(w * 0.5, -h * 0.1, 0, w * 0.5, -h * 0.1, h * 0.8);
    glow.addColorStop(0, 'rgba(244, 246, 248, 0.55)');
    glow.addColorStop(1, 'rgba(244, 246, 248, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    // he climbs, so the clouds slide slowly down past him (each band wraps once it has
    // left the frame entirely)
    const climb = t * 9;
    const loop = h * 1.9;
    ctx.globalAlpha = 0.95;
    this.band(L.cloudsStorm, (climb % loop) - h * 0.9, h * 0.9, t * 8);
    this.band(L.cloudsStorm, ((climb + loop / 2) % loop) - h * 0.9, h * 0.9, -t * 6 + 400);
    ctx.globalAlpha = 0.5;
    this.band(this.smoke, h * 0.45 + Math.sin(t * 0.2) * h * 0.03, h * 0.6, t * 16);
    ctx.globalAlpha = 1;

    this.rain(t, 0.75);

    // the Chatak from below: wings beating, beak opening as each drop arrives
    const size = w * 0.5;
    const phase = t * Math.PI * 2 * 3.1;
    const p = t % CYCLE; // where this drop is in its fall
    const pose: BirdPose = {
      x: w * 0.46,
      y: h * 0.54 - Math.sin(phase) * 0.02 * size + Math.sin(t * 0.7) * h * 0.012,
      size,
      facing: 1,
      pitch: 1.24,
      roll: -1.0,
      open: 1,
      flap: 0.2 + 0.95 * Math.sin(phase),
      fold: Math.max(0, Math.cos(phase)) * 0.6,
      crest: 0.35,
      beak: ss(FALL - 0.5, FALL - 0.15, p) * (1 - ss(FALL + 0.35, FALL + 0.75, p)),
      headYaw: 0,
      headPitch: 0.35,
      tailDroop: 0.04,
      tailSpread: 0.85,
      breathe: 0,
      perch: null,
      alpha: 1,
    };
    drawChatak(ctx, pose);

    const [bx, by] = beakTip(pose);
    const r = Math.max(5, h * 0.016);
    if (p < FALL) {
      const k = p / FALL;
      this.drop(bx, lerp(-h * 0.06, by, k * k), r, ss(0, 0.12, p));
    } else if (p < FALL + 0.8) {
      this.splash(bx, by, (p - FALL) / 0.8);
    }
  }

  private rain(t: number, alpha: number) {
    const { ctx, w, h } = this;
    const slant = 0.16;
    ctx.globalCompositeOperation = 'source-over';
    for (const [count, thick, a, speed, len] of [
      [Math.round((w * h) / 2600), 1, 0.3, 1100, 18],
      [Math.round((w * h) / 14000), 1.6, 0.36, 1700, 34],
    ] as const) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${a * alpha})`;
      ctx.lineWidth = thick;
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const sp = speed * (0.75 + 0.5 * hash(i + thick * 100));
        const y = ((t * sp + hash(i + 7 + thick) * h * 1.4) % (h * 1.3)) - h * 0.15;
        const x = hash(i + 3 + thick * 31) * (w + h * slant) - h * slant + y * slant;
        const l = len * (0.6 + 0.8 * hash(i + 11));
        ctx.moveTo(x, y);
        ctx.lineTo(x + l * slant, y + l);
      }
      ctx.stroke();
    }
  }

  private drop(x: number, y: number, r: number, alpha: number) {
    const { ctx } = this;
    const trail = ctx.createLinearGradient(x, y - r * 9, x, y - r);
    trail.addColorStop(0, 'rgba(143, 195, 234, 0)');
    trail.addColorStop(1, 'rgba(143, 195, 234, 0.55)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = trail;
    ctx.fillRect(x - r * 0.18, y - r * 9, r * 0.36, r * 8);
    ctx.beginPath();
    ctx.moveTo(x, y - r * 2.4);
    ctx.quadraticCurveTo(x + r * 1.05, y - r * 0.5, x + r, y + r * 0.25);
    ctx.arc(x, y + r * 0.25, r, 0, Math.PI);
    ctx.quadraticCurveTo(x - r * 1.05, y - r * 0.5, x, y - r * 2.4);
    const body = ctx.createRadialGradient(x - r * 0.35, y, r * 0.1, x, y + r * 0.2, r * 1.6);
    body.addColorStop(0, '#f2f8fd');
    body.addColorStop(0.45, '#8fc3ea');
    body.addColorStop(1, '#2f7fc1');
    ctx.fillStyle = body;
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(x - r * 0.38, y - r * 0.05, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /** The drop meeting the beak: a ring and a few bright beads, k = 0..1 over its life. */
  private splash(x: number, y: number, k: number) {
    const { ctx } = this;
    ctx.globalAlpha = 1;
    ctx.strokeStyle = `rgba(200, 228, 247, ${(1 - k) * 0.85})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, 5 + k * 26, 2 + k * 7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(200, 228, 247, ${1 - k})`;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * (0.15 + 0.7 * hash(i + 40));
      const d = k * (14 + hash(i + 50) * 24);
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(a) * d,
        y + Math.sin(a) * d + k * k * 24,
        1.5 * (1 - k) + 0.6,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}
