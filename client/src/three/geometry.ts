import {
  BufferAttribute,
  CanvasTexture,
  CylinderGeometry,
  ExtrudeGeometry,
  LatheGeometry,
  Path,
  Shape,
  SRGBColorSpace,
  Vector2,
} from 'three';

type Profile = readonly (readonly number[])[];

/**
 * Densify a measured [r, y] profile: short segments (curves: neck, shoulder, rim, base)
 * get centripetal Catmull-Rom points (no overshoot); long straight walls stay straight.
 */
export function densify(profile: Profile, steps = 4): Vector2[] {
  const p = profile.map(([r, y]) => new Vector2(r, y));
  const out: Vector2[] = [p[0].clone()];
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(p.length - 1, i + 2)];
    if (p1.distanceTo(p2) > 1) {
      out.push(p2.clone());
      continue;
    }
    for (let s = 1; s <= steps; s++) out.push(centripetal(p0, p1, p2, p3, s / steps));
  }
  return out;
}

function centripetal(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, u: number) {
  const knot = (a: Vector2, b: Vector2) => Math.max(Math.sqrt(a.distanceTo(b)), 1e-4);
  const t0 = 0;
  const t1 = t0 + knot(p0, p1);
  const t2 = t1 + knot(p1, p2);
  const t3 = t2 + knot(p2, p3);
  const t = t1 + (t2 - t1) * u;
  const mix = (a: Vector2, b: Vector2, ta: number, tb: number) =>
    a
      .clone()
      .multiplyScalar((tb - t) / (tb - ta))
      .add(b.clone().multiplyScalar((t - ta) / (tb - ta)));
  const a1 = mix(p0, p1, t0, t1);
  const a2 = mix(p1, p2, t1, t2);
  const a3 = mix(p2, p3, t2, t3);
  const b1 = mix(a1, a2, t0, t2);
  const b2 = mix(a2, a3, t1, t3);
  return mix(b1, b2, t1, t2);
}

/**
 * Lathe body. `phiStart = PI` puts u = 0.5 (the label front) on +z, facing the camera.
 * v is remapped by height across the printable zone; outside it the texture clamps to its
 * bare-silver edge rows, so rim, lid and base read as plain aluminium with no seam.
 */
export function latheBody(profile: Profile, segments: number, label?: { y0: number; y1: number }) {
  const geo = new LatheGeometry(densify(profile), segments, Math.PI, Math.PI * 2);
  if (label) {
    const pos = geo.getAttribute('position');
    const uv = geo.getAttribute('uv') as BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      uv.setY(i, (pos.getY(i) - label.y0) / (label.y1 - label.y0));
    }
    uv.needsUpdate = true;
  }
  return geo;
}

/** Vertical knurling on the bottle cap: radius modulated around the circumference. */
export function knurlBand(k: {
  y0: number;
  y1: number;
  radius: number;
  ribs: number;
  depth: number;
}) {
  const segs = k.ribs * 4;
  const geo = new CylinderGeometry(k.radius, k.radius, k.y1 - k.y0, segs, 1, true);
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const a = Math.atan2(x, z);
    const r = k.radius - k.depth * (0.5 - 0.5 * Math.cos(a * k.ribs));
    const len = Math.hypot(x, z) || 1;
    pos.setX(i, (x / len) * r);
    pos.setZ(i, (z / len) * r);
  }
  geo.translate(0, (k.y0 + k.y1) / 2, 0);
  geo.computeVertexNormals();
  return geo;
}

/** Pull tab: a thin rounded plate with a finger hole, lying on the lid. */
export function pullTab() {
  const w = 1.25;
  const l = 2.05;
  const r = 0.55;
  const s = new Shape();
  s.moveTo(-w / 2 + r, -l / 2);
  s.lineTo(w / 2 - r, -l / 2);
  s.quadraticCurveTo(w / 2, -l / 2, w / 2, -l / 2 + r);
  s.lineTo(w / 2, l / 2 - r);
  s.quadraticCurveTo(w / 2, l / 2, w / 2 - r, l / 2);
  s.lineTo(-w / 2 + r, l / 2);
  s.quadraticCurveTo(-w / 2, l / 2, -w / 2, l / 2 - r);
  s.lineTo(-w / 2, -l / 2 + r);
  s.quadraticCurveTo(-w / 2, -l / 2, -w / 2 + r, -l / 2);
  const hole = new Path();
  hole.absellipse(0, -0.35, 0.36, 0.42, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const geo = new ExtrudeGeometry(s, {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.025,
    bevelSegments: 2,
    curveSegments: 16,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

/** Soft elliptical contact shadow, drawn once to a small canvas. */
export function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(22,35,63,0.55)');
  g.addColorStop(0.45, 'rgba(22,35,63,0.22)');
  g.addColorStop(1, 'rgba(22,35,63,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}
