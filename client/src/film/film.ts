/**
 * The hero's "living film": a scroll-driven story drawn live in a 2D canvas. Nothing in it is
 * a photo: the world is generated layers (scripts/build-film-layers.py), and the Chatak is a
 * drawn, animated silhouette (chatak.ts) on an acacia branch that moves in the wind
 * (branch.ts), both referenced from the client's pictures.
 *
 *   f (scroll)  0      out of the can's opening, falling through soft cloud
 *               ~0.1   a misty forest: the Chatak waits on the acacia branch (breathing,
 *                      looking about, crest flicking) while other birds fly down to drink
 *               ~0.28  smoky monsoon clouds roll in, colour drains, wind; he looks up
 *               ~0.44  he opens his wings and flies up into the storm; the camera tilts up
 *               ~0.6   beak open to the sky, he catches the first drop
 *               ~0.62  light breaks through; the rain becomes a river in a misty valley
 *               1      mist: the page colour, where the can stands
 *
 * Scroll owns the story (camera, scene mix, flight path); time owns the life (breathing,
 * wingbeats, wind, mist, rain, ripples), so it keeps moving when the visitor stops. With
 * reduced motion nothing moves on its own and the camera stays put: scenes crossfade.
 */
import { beakTip, drawChatak, type BirdPose } from './chatak';
import { Branch } from './branch';

const BASE = '/film/';
const LAYERS = {
  woodFar: 'wood-far.webp',
  woodMid: 'wood-mid.webp',
  woodNear: 'wood-near.webp',
  mistA: 'mist-a.webp',
  mistB: 'mist-b.webp',
  cloudsLight: 'clouds-light.webp',
  cloudsStorm: 'clouds-storm.webp',
  rays: 'rays.webp',
  bank: 'river-bank.webp',
} as const;

export type Layers = Record<keyof typeof LAYERS, HTMLImageElement>;

export async function loadLayers(): Promise<Layers> {
  const entries = await Promise.all(
    Object.entries(LAYERS).map(async ([key, file]) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = BASE + file;
      await img.decode();
      return [key, img] as const;
    }),
  );
  return Object.fromEntries(entries) as Layers;
}

const MIST = '#f3f5f6';
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
const quad = (a: number, c: number, b: number, t: number) =>
  (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;

type Img = CanvasImageSource & { width: number; height: number };
type P2 = [number, number];

/** When the Chatak leaves the branch, catches the drop, and is gone. */
const LAUNCH = 0.46;
const CATCH = 0.6;
const GONE = 0.665;
/** Where he looks while he waits: a slow, deterministic round of head turns. */
const LOOKS = [0, -0.55, 0.18, -0.28, 0.42, -0.12, 0.3, -0.48];

interface Ripple {
  x: number;
  y: number;
  born: number;
  size: number;
}

export class Film {
  private ctx: CanvasRenderingContext2D;
  private w = 1;
  private h = 1;
  private dpr = 1;
  private reflection: HTMLCanvasElement;
  private water: HTMLCanvasElement;
  private smoke: HTMLCanvasElement;
  private ripples: Ripple[] = [];
  private lastSpawn = 0;
  private caughtAt = -1;
  private lastTime = 0;
  /** Pointer from the frame centre, -1..1, damped (desktop parallax). */
  private px = 0;
  private py = 0;
  /** The Chatak's head turn, damped (birds turn their heads in quick snaps). */
  private look = 0;
  private branch = new Branch({ limb: '#3d423b', back: '#7a8780', front: '#59665f' });

  constructor(
    private canvas: HTMLCanvasElement,
    private L: Layers,
    private motion: boolean,
  ) {
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.reflection = this.makeReflection();
    this.water = document.createElement('canvas');
    this.smoke = this.tint(L.mistB, '#8d8aa2');
  }

  resize(w: number, h: number, dpr: number) {
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingQuality = 'high';
  }

  /** The river bank upside down, cooler and darker: what the water reflects. */
  private makeReflection() {
    const src = this.L.bank;
    const c = document.createElement('canvas');
    c.width = src.width;
    c.height = src.height;
    const x = c.getContext('2d')!;
    x.translate(0, c.height);
    x.scale(1, -1);
    x.drawImage(src, 0, 0);
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalCompositeOperation = 'source-atop';
    x.fillStyle = 'rgba(70, 92, 104, 0.3)';
    x.fillRect(0, 0, c.width, c.height);
    return c;
  }

  /** A white texture recoloured (alpha kept): smoky mist from the plain mist. */
  private tint(img: Img, color: string) {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const x = c.getContext('2d')!;
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    return c;
  }

  /** A horizontally tiling band (mist, cloud), scrolled by `offset` px. */
  private band(img: Img, y: number, height: number, offset: number) {
    const tw = (img.width * height) / img.height;
    let x = -(((offset % tw) + tw) % tw);
    for (; x < this.w; x += tw) this.ctx.drawImage(img, x, y, tw, height);
  }

  /** Where the branch's perch sits, the branch scale and the bird's size, per screen shape. */
  private layout() {
    const { w, h } = this;
    return h > w
      ? { ax: w * 0.46, ay: h * 0.42, u: w * 1.1, size: w * 0.44 }
      : { ax: w * 0.3, ay: h * 0.62, u: h * 1.0, size: h * 0.29 };
  }

  /** The camera on a layer: push-in about the perch, tilt up, pointer parallax. */
  private camera(f: number, depth: number) {
    const { h } = this;
    const lay = this.layout();
    const push = this.motion ? ss(0.06, 0.44, f) : 0.3;
    const tilt = this.motion ? ss(0.45, 0.6, f) : 0;
    return {
      z: 1 + 0.22 * push * depth,
      x: lay.ax + this.px * 18 * depth,
      y: lay.ay + this.py * 12 * depth + tilt * h * (0.3 + depth * 1.05),
      ax: lay.ax,
      ay: lay.ay,
    };
  }

  draw(f: number, time: number, velocity: number, pointer: { x: number; y: number }) {
    const { ctx, w, h } = this;
    const t = this.motion ? time : 0;
    const dt = Math.min(0.1, Math.max(0, time - this.lastTime));
    this.lastTime = time;
    const portrait = h > w;
    const k = 0.05;
    this.px += ((this.motion ? pointer.x : 0) - this.px) * k;
    this.py += ((this.motion ? pointer.y : 0) - this.py) * k;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#dde6ed');
    sky.addColorStop(0.62, '#eef2f4');
    sky.addColorStop(1, MIST);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    const wFall = 1 - ss(0.06, 0.13, f);
    const wWoods = ss(0.03, 0.12, f) * (1 - ss(0.56, 0.62, f));
    const storm = ss(0.27, 0.42, f);
    const wSky = ss(0.42, 0.53, f) * (1 - ss(0.66, 0.72, f));
    const wBird = ss(0.05, 0.12, f) * (1 - ss(GONE - 0.012, GONE, f));
    const wRain = ss(0.38, 0.46, f) * (1 - ss(0.86, 0.95, f));
    const wLight = ss(0.6, 0.66, f) * (1 - ss(0.69, 0.74, f));
    const wRiver = ss(0.65, 0.72, f);
    const wOut = ss(0.88, 1, f);

    // where he looks while he waits (snappy turns), settling forward as the storm comes
    const target = this.motion ? LOOKS[Math.floor(t / 2.4) % LOOKS.length] * (1 - storm) : 0;
    this.look += (target - this.look) * (1 - Math.exp(-dt * 10));

    const flying = ss(LAUNCH, LAUNCH + 0.01, f) > 0;
    if (wWoods > 0) this.woods(f, t, wWoods, storm, wBird, flying);
    if (wSky > 0) this.stormSky(f, t, wSky);
    if (wBird > 0 && flying) this.flight(f, t, time, wBird, storm);
    if (wFall > 0) this.clouds(f, t, wFall);
    if (wLight > 0) this.light(t, wLight);
    if (wRiver > 0) this.river(f, t, wRiver, wRain, portrait);
    if (wRain > 0 && this.motion) this.rain(t, wRain, velocity, clamp01(wRiver + 0.6 * wLight));

    // the Monsoon Light register, and a quiet side for the captions to sit on
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    if (portrait) {
      const veil = ctx.createLinearGradient(0, h * 0.5, 0, h);
      veil.addColorStop(0, 'rgba(243, 245, 246, 0)');
      veil.addColorStop(1, 'rgba(243, 245, 246, 0.82)');
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, w, h);
    } else {
      const veil = ctx.createLinearGradient(w * 0.46, 0, w, 0);
      veil.addColorStop(0, 'rgba(243, 245, 246, 0)');
      veil.addColorStop(1, 'rgba(243, 245, 246, 0.58)');
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, w, h);
    }
    if (wOut > 0) {
      ctx.globalAlpha = wOut;
      this.band(this.L.mistA, h * 0.05, h * 0.95, t * 14);
      ctx.fillStyle = MIST;
      ctx.globalAlpha = ss(0.92, 1, f);
      ctx.fillRect(0, 0, w, h);
    }
    ctx.globalAlpha = 1;
  }

  /** Out of the can: falling through soft, bright cloud. */
  private clouds(f: number, t: number, wgt: number) {
    const { ctx, w, h } = this;
    const k = ss(0, 0.15, f);
    ctx.globalAlpha = wgt;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#d6e4ef');
    g.addColorStop(1, '#f1f4f6');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      const depth = (k * 1.5 + i / 4) % 1; // layers rush past the camera, nearest last
      const s = 0.7 + depth * 2.8;
      ctx.globalAlpha = wgt * Math.sin(Math.PI * depth) * 0.95;
      const ch = h * s;
      this.band(this.L.cloudsLight, h * 0.55 - ch / 2, ch, t * 6 + i * 410 + w * 0.5 * (s - 1));
    }
  }

  /** The Chatak while he waits, and as he crouches to leave (in branch coordinates). */
  private perchedPose(f: number, t: number, perch: P2, storm: number): BirdPose {
    const s = this.layout().size;
    const crouch = ss(0.43, 0.455, f) * (1 - ss(LAUNCH, LAUNCH + 0.012, f));
    const open = ss(0.448, 0.49, f);
    return {
      x: perch[0] - 0.035 * s,
      y: perch[1] - 0.17 * s + crouch * 0.04 * s,
      size: s,
      facing: 1,
      pitch: 0.86 + 0.02 * Math.sin(t * 0.45) - crouch * 0.16,
      roll: 0,
      open,
      flap: 0.6 * open,
      fold: 0,
      crest: 0.5 + 0.12 * Math.sin(t * 0.8) + 0.45 * storm,
      beak: 0,
      headYaw: this.look,
      headPitch: -0.72 + 0.9 * ss(0.3, 0.42, f) - crouch * 0.2,
      tailDroop: 0.42 + 0.04 * Math.sin(t * 0.9) + 0.07 * storm * Math.sin(t * 2.6) - crouch * 0.24,
      tailSpread: 0.15 + 0.15 * storm,
      breathe: Math.sin(t * 2.2),
      perch: { x: perch[0], y: perch[1] },
      alpha: 1,
    };
  }

  /** The wait and the monsoon: misty forest in layers, the branch, the bird, the weather. */
  private woods(f: number, t: number, wgt: number, storm: number, bird: number, flying: boolean) {
    const { ctx, w, h } = this;
    const lay = this.layout();
    const wind = storm;
    ctx.save();
    ctx.globalAlpha = wgt;
    // morning in the forest: pale, with warm light from the upper right
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#e7ecee');
    g.addColorStop(1, '#eef1f2');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * 0.82, -h * 0.05, 0, w * 0.82, -h * 0.05, h * 1.1);
    glow.addColorStop(0, `rgba(255, 244, 222, ${0.75 * (1 - storm)})`);
    glow.addColorStop(1, 'rgba(255, 244, 222, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    const layer = (depth: number, paint: () => void) => {
      const c = this.camera(f, depth);
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.z, c.z);
      ctx.translate(-c.ax, -c.ay);
      paint();
      ctx.restore();
    };

    layer(0.15, () => this.band(this.L.woodFar, -h * 0.1, h * 1.02, t * 1.5 + 200));
    ctx.globalAlpha = wgt * 0.55;
    this.band(this.L.mistA, h * 0.42, h * 0.5, t * 6);
    ctx.globalAlpha = wgt;
    layer(0.45, () => {
      this.band(this.L.woodMid, -h * 0.14, h * 1.14, t * 3 + 640);
      this.others(t, wgt * (1 - ss(0.28, 0.36, f)));
    });

    // sun shafts while the sky is clear, breathing slowly
    const sun = wgt * (1 - storm);
    if (sun > 0.01) {
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = sun * (0.55 + 0.15 * Math.sin(t * 0.45));
      const r = Math.max(w, h) * 1.15;
      ctx.drawImage(this.L.rays, w - r * 0.9 + Math.sin(t * 0.12) * 14, -r * 0.1, r, r);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = wgt * 0.45;
    this.band(this.L.mistB, h * 0.55, h * 0.42, -t * (10 + 30 * wind) + 300);
    ctx.globalAlpha = wgt;

    // the branch and the Chatak
    layer(1, () => {
      const perch = this.branch.layout(lay.ax, lay.ay, lay.u, t, wind);
      this.perch = perch;
      this.branch.drawBack(ctx, lay.u, t, wind);
      if (!flying && bird > 0) {
        ctx.globalAlpha = wgt * bird;
        drawChatak(ctx, this.perchedPose(f, t, perch, storm));
        ctx.globalAlpha = wgt;
      }
      this.branch.drawFront(ctx, lay.u, t, wind);
    });

    // out-of-focus fronds right in front of the lens
    const near = this.camera(f, 1.6);
    ctx.globalAlpha = wgt * 0.85;
    this.band(this.L.woodNear, h * 0.52 + (near.y - near.ay), h * 0.6, this.px * 40 + t * 1.2);
    ctx.globalAlpha = wgt;

    // motes drifting in the light
    if (sun > 0.01) {
      ctx.fillStyle = 'rgba(255, 246, 222, 0.9)';
      for (let i = 0; i < 46; i++) {
        const x = ((((hash(i) * 1.2 - 0.1) * w + Math.sin(t * 0.3 + i) * 18) % w) + w) % w;
        const y = (((hash(i + 9) * h - t * (6 + hash(i + 3) * 10)) % h) + h) % h;
        const rr = 0.6 + hash(i + 5) * 1.6;
        ctx.globalAlpha = sun * (0.2 + 0.4 * Math.sin(t * (0.8 + hash(i + 2)) + i) ** 2);
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // the monsoon arrives: colour drains towards bruised purple, smoky cloud rolls down
    if (storm > 0) {
      ctx.globalCompositeOperation = 'color';
      ctx.globalAlpha = wgt * storm * 0.5;
      ctx.fillStyle = '#7d7b93';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = wgt * storm * 0.3;
      ctx.fillStyle = '#9da1b6';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      const y = -h * 0.95 + storm * h * 0.62;
      ctx.globalAlpha = wgt * storm;
      this.band(this.L.cloudsStorm, y, h * 0.9, t * 12 + f * 900);
      ctx.globalAlpha = wgt * storm * 0.8;
      this.band(this.L.cloudsStorm, y - h * 0.2, h * 0.9, -t * 8 + 520);
      ctx.globalAlpha = wgt * storm * 0.5;
      this.band(this.smoke, h * 0.15, h * 0.7, t * (14 + 20 * wind));
    }
    ctx.restore();
  }

  /** The perch point (branch coordinates) for this frame. */
  private perch: P2 = [0, 0];

  /** Other birds flying low across the forest, down towards the water. */
  private others(t: number, wgt: number) {
    if (wgt <= 0.01) return;
    const { ctx, w, h } = this;
    ctx.save();
    ctx.strokeStyle = '#5f6e68';
    ctx.fillStyle = '#5f6e68';
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const dir = i % 2 ? -1 : 1;
      const span = w + 400;
      let x = ((t * (48 + 16 * i) + i * 523) % span) - 200;
      if (dir < 0) x = w - x;
      const y = h * (0.34 + 0.07 * i) + Math.sin(t * 0.7 + i * 2.1) * h * 0.04;
      const s = 6 + 2.5 * i;
      const fl = Math.sin(t * (10 + i) + i);
      ctx.globalAlpha = wgt * 0.7;
      ctx.lineWidth = Math.max(1, s * 0.2);
      ctx.beginPath();
      ctx.moveTo(x - s, y - fl * s * 0.7);
      ctx.quadraticCurveTo(x - s * 0.4, y - fl * s * 0.2 - s * 0.15, x, y);
      ctx.quadraticCurveTo(x + s * 0.4, y - fl * s * 0.2 - s * 0.15, x + s, y - fl * s * 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x + dir * s * 0.15, y + s * 0.05, s * 0.32, s * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** Looking up into the monsoon: the sky the Chatak climbs into. */
  private stormSky(f: number, t: number, wgt: number) {
    const { ctx, w, h } = this;
    const slide = (this.motion ? ss(0.45, 0.62, f) : 1) * h * 0.45;
    ctx.save();
    ctx.globalAlpha = wgt;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#8f8da4');
    g.addColorStop(0.55, '#aaacbd');
    g.addColorStop(1, '#c8cbd5');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = wgt * 0.95;
    this.band(this.L.cloudsStorm, -h * 0.45 + slide, h * 0.95, t * 10 + f * 700);
    ctx.globalAlpha = wgt * 0.7;
    this.band(this.L.cloudsStorm, h * 0.05 + slide * 0.6, h * 0.85, -t * 7 + 300);
    ctx.globalAlpha = wgt * 0.45;
    this.band(this.smoke, h * 0.35 + slide * 0.3, h * 0.7, t * 18);
    ctx.restore();
  }

  /** He leaves the branch, climbs into the rain, catches the first drop and is gone. */
  private flight(f: number, t: number, time: number, wgt: number, storm: number) {
    const { ctx, w, h } = this;
    const portrait = h > w;
    const lay = this.layout();
    // the perch as the camera sees it now (the branch keeps moving as the camera tilts)
    const cam = this.camera(Math.min(f, LAUNCH), 1); // he leaves from where the perch was
    const start = this.perchedPose(f, t, this.perch, storm);
    const P0: P2 = [cam.x + (start.x - cam.ax) * cam.z, cam.y + (start.y - cam.ay) * cam.z];
    const s0 = lay.size * cam.z;
    const K1: P2 = portrait ? [w * 0.5, h * 0.3] : [w * 0.35, h * 0.48];
    const K2: P2 = portrait ? [w * 0.62, -h * 0.3] : [w * 0.48, -h * 0.32];
    const C: P2 = [lerp(P0[0], K1[0], 0.3) + w * 0.03, K1[1] + h * 0.16];

    const up = ss(LAUNCH, CATCH, f); // leaves the branch, slows to hover for the catch
    const away = clamp01((f - CATCH) / (GONE - CATCH)) ** 2; // then away, accelerating
    let x: number;
    let y: number;
    if (f <= CATCH) {
      x = quad(P0[0], C[0], K1[0], up);
      y = quad(P0[1], C[1], K1[1], up);
    } else {
      const D: P2 = [K1[0] + (K1[0] - C[0]) * 0.4, K1[1] + (K1[1] - C[1]) * 0.4];
      x = quad(K1[0], D[0], K2[0], away);
      y = quad(K1[1], D[1], K2[1], away);
    }
    const size = f <= CATCH ? lerp(s0, s0 * 1.06, up) : lerp(s0 * 1.06, s0 * 0.75, away);
    const amp = ss(LAUNCH, LAUNCH + 0.04, f);
    const phase = t * Math.PI * 2 * 3.1;
    const pose: BirdPose = {
      x,
      y: y - Math.sin(phase) * 0.02 * size * amp,
      size,
      facing: 1,
      pitch: f <= CATCH ? lerp(0.8, 1.22, up) : lerp(1.22, 1.45, away),
      roll: f <= CATCH ? lerp(0, -1.0, up) : lerp(-1.0, -1.35, away),
      open: ss(0.448, 0.49, f),
      flap: 0.6 * (1 - amp) + (0.2 + 0.95 * Math.sin(phase)) * amp,
      fold: Math.max(0, Math.cos(phase)) * 0.6 * amp,
      crest: 0.35 + 0.2 * (1 - up),
      beak: ss(0.545, 0.58, f) * (1 - ss(0.605, 0.625, f)),
      headYaw: 0,
      headPitch: lerp(-0.45, 0.35, up),
      tailDroop: lerp(0.3, 0.04, up),
      tailSpread: lerp(0.35, 0.85, up),
      breathe: 0,
      perch: null,
      alpha: 1,
    };
    ctx.save();
    ctx.globalAlpha = wgt;
    drawChatak(ctx, pose);

    // the first drop falls into the open beak
    const [bx, by] = beakTip(pose);
    const r = Math.max(5, h * 0.011);
    if (!this.motion) {
      if (f > 0.5 && f < CATCH) this.drop(bx, by - h * 0.16, r, wgt); // still: it hangs above
    } else {
      const p = ss(0.552, CATCH, f);
      if (p < 1) {
        this.caughtAt = -1;
        if (p > 0) this.drop(bx, lerp(-h * 0.06, by, p * p), r, wgt * ss(0.552, 0.56, f));
      } else {
        if (this.caughtAt < 0) this.caughtAt = time;
        const age = time - this.caughtAt;
        if (age < 0.8) this.splash(bx, by, age, wgt);
      }
    }
    ctx.restore();
  }

  /** Light breaking through as the Chatak drinks: the storm opens over the valley. */
  private light(t: number, wgt: number) {
    const { ctx, w, h } = this;
    ctx.save();
    const g = ctx.createRadialGradient(w * 0.5, -h * 0.1, 0, w * 0.5, -h * 0.1, h * 1.2);
    g.addColorStop(0, `rgba(255, 250, 238, ${0.95 * wgt})`);
    g.addColorStop(1, `rgba(240, 244, 246, ${0.6 * wgt})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = wgt * 0.7;
    const r = Math.max(w, h) * 1.2;
    ctx.drawImage(this.L.rays, w * 0.5 - r * 0.62, -r * 0.18, r, r);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = wgt * 0.8;
    this.band(this.L.mistA, h * 0.2, h * 0.7, t * 9);
    ctx.restore();
  }

  private drop(x: number, y: number, r: number, alpha: number) {
    const { ctx } = this;
    ctx.globalCompositeOperation = 'source-over';
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
  }

  private splash(x: number, y: number, age: number, wgt: number) {
    const { ctx } = this;
    const k = age / 0.8;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.strokeStyle = `rgba(143, 195, 234, ${(1 - k) * 0.8 * wgt})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, 6 + k * 34, 2 + k * 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(143, 195, 234, ${(1 - k) * wgt})`;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * (0.15 + 0.7 * hash(i + 40));
      const d = k * (18 + hash(i + 50) * 30);
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(a) * d,
        y + Math.sin(a) * d + k * k * 30,
        1.6 * (1 - k) + 0.6,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  /** Rain: two depths of streaks, heavier while the visitor scrolls fast. */
  private rain(t: number, wgt: number, velocity: number, light: number) {
    const { ctx, w, h } = this;
    const pace = 0.75 + 0.6 * clamp01(Math.abs(velocity) / 2500);
    // white streaks over the dark storm, slate streaks over pale mist and water
    const k = clamp01(light);
    const mix = (a: number, b: number) => Math.round(a + (b - a) * k);
    const col = (a: number) =>
      `rgba(${mix(255, 92)}, ${mix(255, 112)}, ${mix(255, 132)}, ${a * (1 - 0.2 * k)})`;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = wgt;
    const slant = 0.16;
    for (const [count, thick, alpha, speed, len] of [
      [Math.round((w > h ? 240 : 130) * pace), 1, 0.32, 1500, 22],
      [Math.round((w > h ? 46 : 26) * pace), 2, 0.38, 2300, 44],
    ] as const) {
      ctx.strokeStyle = col(alpha);
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

  /** The rain returned to the earth: a calm river in a misty valley. */
  private river(f: number, t: number, wgt: number, rain: number, portrait: boolean) {
    const { ctx, w, h } = this;
    const horizon = h * (portrait ? 0.46 : 0.5);
    const zoom = this.motion ? 1 + 0.06 * ss(0.65, 1, f) : 1;
    ctx.save();
    ctx.globalAlpha = wgt;
    ctx.translate(w / 2 + this.px * w * 0.006, horizon);
    ctx.scale(zoom, zoom);
    ctx.translate(-w / 2, -horizon);

    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#e2eaf0');
    sky.addColorStop(1, '#eef2f4');
    ctx.fillStyle = sky;
    ctx.fillRect(-w, -h, w * 3, horizon + h);
    const water = ctx.createLinearGradient(0, horizon, 0, h);
    water.addColorStop(0, '#dde5e9');
    water.addColorStop(1, '#a9b9c2');
    ctx.fillStyle = water;
    ctx.fillRect(-w, horizon, w * 3, h);

    // treelines standing on the far bank, drifting very slowly
    const bh = portrait ? h * 0.24 : h * 0.36;
    this.band(this.L.bank, horizon - bh * 0.86, bh, t * 3);

    // their reflection, broken into slow ripples: built at full strength off-screen, then
    // laid on the water once (strips overlapping at partial alpha would band)
    const rh = Math.round(bh * 0.9);
    const ww = this.water;
    const dpr = this.dpr;
    if (ww.width !== Math.round(w * dpr) || ww.height !== Math.round(rh * dpr)) {
      ww.width = Math.round(w * dpr);
      ww.height = Math.round(rh * dpr);
    }
    const wc = ww.getContext('2d')!;
    wc.setTransform(dpr, 0, 0, dpr, 0, 0);
    wc.globalCompositeOperation = 'source-over';
    wc.clearRect(0, 0, w, rh);
    const refl = this.reflection;
    const tw = (refl.width * rh) / refl.height;
    const step = portrait ? 3 : 2;
    for (let y = 0; y < rh; y += step) {
      const k = y / rh;
      const amp = 1 + k * 9;
      const dx = Math.sin(y * 0.11 - t * 1.3) * amp + Math.sin(y * 0.037 + t * 0.6) * amp * 0.7;
      const sy = ((y + bh * 0.14) / rh) * refl.height * 0.9;
      let x = -((((t * 3 + dx) % tw) + tw) % tw);
      for (; x < w; x += tw) {
        wc.drawImage(refl, 0, sy, refl.width, (step / rh) * refl.height, x, y, tw, step);
      }
    }
    wc.globalCompositeOperation = 'destination-in';
    const fade = wc.createLinearGradient(0, 0, 0, rh);
    fade.addColorStop(0, 'rgba(0,0,0,0.78)');
    fade.addColorStop(1, 'rgba(0,0,0,0.25)');
    wc.fillStyle = fade;
    wc.fillRect(0, 0, w, rh);
    ctx.drawImage(ww, 0, horizon, w, rh);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // the bright line where water meets bank
    ctx.fillRect(-w, horizon - 1, w * 3, 2);

    // rain rings on the water
    if (this.motion && rain > 0.02) {
      const rate = 14 * rain;
      while (t - this.lastSpawn > 1 / rate) {
        this.lastSpawn += 1 / rate;
        const d = Math.random();
        this.ripples.push({
          x: Math.random() * w,
          y: horizon + 6 + d * d * (h - horizon - 6),
          born: this.lastSpawn,
          size: 6 + d * d * 34,
        });
      }
      if (this.ripples.length > 60) this.ripples.splice(0, this.ripples.length - 60);
    } else {
      this.lastSpawn = t;
    }
    ctx.lineWidth = 1;
    for (const r of this.ripples) {
      const age = t - r.born;
      if (age < 0 || age > 1.4) continue;
      const k = age / 1.4;
      ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - k) * 0.55 * wgt})`;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.size * k, r.size * k * 0.26, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // the drop that became the river: wide rings from the middle of the water
    const ring = ss(0.7, 0.86, f);
    if (ring > 0 && ring < 1) {
      for (let i = 0; i < 3; i++) {
        const k = clamp01(ring * 1.4 - i * 0.2);
        if (k <= 0) continue;
        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - k) * 0.7 * wgt})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const cx = portrait ? w * 0.5 : w * 0.34;
        ctx.ellipse(
          cx,
          horizon + (h - horizon) * 0.42,
          k * w * 0.42,
          k * w * 0.42 * 0.2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }

    // mist lying on the water
    ctx.globalAlpha = wgt * 0.75;
    this.band(this.L.mistA, horizon - h * 0.16, h * 0.32, t * 8);
    ctx.globalAlpha = wgt * 0.45;
    this.band(this.L.mistB, horizon - h * 0.05, h * 0.26, -t * 12 + 200);
    ctx.restore();
  }
}
