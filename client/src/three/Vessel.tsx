import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { MathUtils, type Group, type MeshPhysicalMaterial, type PerspectiveCamera } from 'three';
import type { VesselId } from '../store/scene';
import { targets } from './stations';
import { shadowTexture } from './geometry';
import type { LabelSet } from './labels';

interface VesselProps {
  id: VesselId;
  /** Vessel height and radius in cm; the model's base sits at y = 0. */
  height: number;
  radius: number;
  label: MeshPhysicalMaterial;
  versa: LabelSet;
  custom: LabelSet | null;
  children: ReactNode;
}

const TILT_X = 0.11; // lean the top towards the camera so the rim reads, like the photos
const SPIN_SMOOTH = 0.22;

/**
 * Places a vessel on the anchor the station router resolved for this frame (screen px ->
 * world units at z = 0), spins it to the scroll-driven target and swaps the label to
 * YOUR LOGO HERE only while the print faces away, so the change is never seen.
 */
export function Vessel({ id, height, radius, label, versa, custom, children }: VesselProps) {
  const root = useRef<Group>(null);
  const tilt = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const phase = id === 'can' ? 0 : 2.1;
  const shadow = useMemo(() => shadowTexture(), []);
  // three.js objects are mutated per frame, so reach them through a ref, not props
  const labels = useRef({ label, versa, custom });
  useEffect(() => {
    labels.current = { label, versa, custom };
  }, [label, versa, custom]);

  const shown = useRef(false);

  useFrame((state, delta) => {
    const t = targets[id];
    const g = root.current!;
    const s = spin.current!;
    const l = labels.current;
    const want = l.custom && t.logo ? l.custom : l.versa;
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

    const cam = state.camera as PerspectiveCamera;
    const k = (2 * cam.position.z * Math.tan(MathUtils.degToRad(cam.fov) / 2)) / state.size.height;
    g.position.set((t.x - state.size.width / 2) * k, -(t.y - state.size.height / 2) * k, 0);
    g.scale.setScalar(t.pxPerCm * k);

    const time = state.clock.elapsedTime;
    const target = -t.turns * Math.PI * 2 + Math.sin(time * 0.55 + phase) * 0.06;
    if (appearing) {
      // after a jump (anchor link, reload, fast drag) arrive already in place, never mid-spin
      s.rotation.y = target;
      setLabel();
    } else {
      easing.damp(s.rotation, 'y', target, SPIN_SMOOTH, delta);
      // while on screen, only change the print when it faces away from the viewer
      if (Math.cos(s.rotation.y) < -0.25) setLabel();
    }
    easing.damp(tilt.current!.rotation, 'z', t.lean, 0.35, delta);
    tilt.current!.position.y = Math.sin(time * 1.1 + phase) * 0.16;
  });

  return (
    <group ref={root} visible={false}>
      {/* contact shadow on the page, drawn behind the base */}
      <mesh
        position={[0, -height / 2 + 0.05, -radius * 1.2]}
        scale={[radius * 3.2, radius * 0.8, 1]}
      >
        <planeGeometry />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={tilt}>
        <group rotation-x={TILT_X}>
          <group ref={spin} position-y={-height / 2}>
            {children}
          </group>
        </group>
      </group>
    </group>
  );
}
