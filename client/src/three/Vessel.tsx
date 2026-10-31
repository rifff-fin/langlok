import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import {
  MathUtils,
  type Group,
  type MeshBasicMaterial,
  type MeshPhysicalMaterial,
  type PerspectiveCamera,
} from 'three';
import { isRevealed } from '../lib/preloader';
import { configView } from '../store/configurator';
import type { VesselId } from '../store/scene';
import { smoothstep, stage, targets } from './stations';
import { shadowTexture } from './geometry';
import type { LabelSet } from './labels';

interface VesselProps {
  id: VesselId;
  /** Vessel height and radius in cm; the model's base sits at y = 0. */
  height: number;
  radius: number;
  /** Height of the top (lid or cap) centre, cm: the dive brings this point to the middle. */
  topY: number;
  /** Where the dive ends up, forward of the top centre, cm (the can's opening). */
  aimZ?: number;
  label: MeshPhysicalMaterial;
  brand: LabelSet;
  /** YOUR LOGO HERE. */
  custom: LabelSet | null;
  /** The configurator's design (null until the visitor's first edit). */
  config: LabelSet | null;
  children: ReactNode;
}

const TILT_X = 0.11; // lean the top towards the camera so the rim reads, like the photos
const SPIN_SMOOTH = 0.22;
/** Hero dive: how far the top tips towards the camera (rad) and how much the vessel grows. */
const DIVE_TIP = 1.3;
const DIVE_GROW = 4.4;
const HOVER = window.matchMedia('(hover: hover) and (pointer: fine)');

/**
 * Places a vessel on the anchor the station router resolved for this frame (screen px ->
 * world units at z = 0), spins it to the scroll-driven target and swaps the label to
 * YOUR LOGO HERE only while the print faces away, so the change is never seen.
 * With full motion it also breathes (slow sway and float), turns a little towards the
 * pointer, rises in on first sight and performs the hero dive. In the configurator it
 * wears the visitor's design, which changes as they edit it, and turns and tilts as they
 * drag it (instead of following the pointer).
 */
export function Vessel({
  id,
  height,
  radius,
  topY,
  aimZ = 0,
  label,
  brand,
  custom,
  config,
  children,
}: VesselProps) {
  const root = useRef<Group>(null);
  const lean = useRef<Group>(null);
  const tip = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const shadowMat = useRef<MeshBasicMaterial>(null);
  const phase = id === 'can' ? 0 : 2.1;
  const shadow = useMemo(() => shadowTexture(), []);
  // three.js objects are mutated per frame, so reach them through a ref, not props
  const labels = useRef({ label, brand, custom, config });
  useEffect(() => {
    labels.current = { label, brand, custom, config };
  }, [label, brand, custom, config]);

  const shown = useRef(false);
  const entered = useRef(false);
  // damped channels: dive progress, entrance rise, pointer, the visitor's turn (configurator)
  const live = useRef({ dive: 0, rise: 0, px: 0, py: 0, drift: 0, user: 0 });

  useFrame((state, delta) => {
    const t = targets[id];
    const g = root.current!;
    const s = spin.current!;
    const l = labels.current;
    const m = live.current;
    const want =
      t.label === 'config'
        ? (l.config ?? l.custom ?? l.brand)
        : t.label === 'yourlogo'
          ? (l.custom ?? l.brand)
          : l.brand;
    const setLabel = () => {
      if (l.label.map === want.map) return;
      l.label.map = want.map;
      l.label.roughnessMap = want.orm;
      l.label.metalnessMap = want.orm;
    };

    const appearing = t.visible && !shown.current;
    shown.current = t.visible;
    g.visible = t.visible;
    if (!t.visible) {
      setLabel(); // unseen: always carry the right label
      return;
    }

    const motion = stage.motion;
    easing.damp(m, 'dive', t.dive, appearing ? 0 : 0.1, delta);
    easing.damp(m, 'drift', motion ? 1 : 0, 0.6, delta);
    // in the configurator the visitor turns it by hand, so it stops following the pointer
    const configuring = t.label === 'config';
    easing.damp(m, 'user', configuring ? 1 : 0, appearing ? 0 : 0.3, delta);
    const pointing = motion && HOVER.matches && !configuring;
    easing.damp(m, 'px', pointing ? stage.pointer.x : 0, 0.35, delta);
    easing.damp(m, 'py', pointing ? stage.pointer.y : 0, 0.35, delta);

    const d = m.dive;
    const calm = 1 - smoothstep(0, 0.5, d); // drift and pointer fade out as the dive starts
    // the click: a small, quickly settling knock as the panel gives way (d 0.37..0.47)
    const knock =
      d > 0.37 && d < 0.47 ? Math.sin(((d - 0.37) / 0.1) * Math.PI * 3) * (0.47 - d) * 0.5 : 0;
    const tipAngle =
      TILT_X +
      DIVE_TIP * smoothstep(0.02, 0.78, d) +
      m.py * 0.07 * calm +
      knock +
      configView.pitch * m.user;
    const grow = 1 + DIVE_GROW * Math.pow(smoothstep(0.18, 1, d), 1.5);
    const focus = smoothstep(0.1, 0.85, d);

    // first sight on the opening screen: rise into place and turn to face the viewer (held
    // under the home page's preloader, so it plays as the preloader lifts)
    easing.damp(m, 'rise', isRevealed() ? 0 : m.rise, 0.55, delta);
    if (appearing && !entered.current) {
      entered.current = true;
      if (motion && t.station === 'hero-intro') m.rise = 1;
    }

    const cam = state.camera as PerspectiveCamera;
    const k = (2 * cam.position.z * Math.tan(MathUtils.degToRad(cam.fov) / 2)) / state.size.height;
    const scale = t.pxPerCm * k * grow; // world units per cm
    // keep the top centred while diving (then the opening): undo the aim point's height
    // above the vessel's middle after the tip
    const aim = aimZ * smoothstep(0.45, 1, d);
    const lift =
      ((topY - height / 2) * Math.cos(tipAngle) - aim * Math.sin(tipAngle)) * scale * focus;
    g.scale.setScalar(scale);
    g.position.set(
      (t.x - state.size.width / 2) * k,
      -(t.y - state.size.height / 2) * k - lift - m.rise * height * 0.22 * scale,
      0,
    );

    const time = state.clock.elapsedTime;
    const drift = m.drift * calm;
    const target =
      -t.turns * Math.PI * 2 +
      Math.sin(time * 0.55 + phase) * 0.06 * drift +
      m.px * 0.32 * calm -
      m.rise * 1.6 +
      configView.yaw * m.user;
    if (appearing || stage.still) {
      // after a jump (anchor link, reload, fast drag) arrive already in place, never mid-spin
      // (on first sight the target still carries the entrance turn, which then unwinds)
      s.rotation.y = target;
      setLabel();
    } else {
      easing.damp(s.rotation, 'y', target, SPIN_SMOOTH, delta);
      // while on screen, only change the print when it faces away from the viewer; once it
      // stands in the configurator, the visitor's own edits show at once
      if (Math.cos(s.rotation.y) < -0.25 || (configuring && t.settled)) setLabel();
    }
    tip.current!.rotation.x = tipAngle;
    easing.damp(lean.current!.rotation, 'z', t.lean - m.px * 0.05 * calm, 0.35, delta);
    lean.current!.position.y = Math.sin(time * 1.1 + phase) * 0.16 * drift;
    shadowMat.current!.opacity = (1 - smoothstep(0, 0.22, d)) * (1 - m.rise);
  });

  return (
    <group ref={root} visible={false}>
      {/* contact shadow on the page, drawn behind the base */}
      <mesh
        position={[0, -height / 2 + 0.05, -radius * 1.2]}
        scale={[radius * 3.8, radius * 0.95, 1]}
      >
        <planeGeometry />
        <meshBasicMaterial
          ref={shadowMat}
          map={shadow}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <group ref={lean}>
        <group ref={tip} rotation-x={TILT_X}>
          <group ref={spin} position-y={-height / 2}>
            {children}
          </group>
        </group>
      </group>
    </group>
  );
}
