import { useEffect, useMemo, useState } from 'react';
import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { MeshPhysicalMaterial } from 'three';
import type { VesselId } from '../store/scene';
import layout from './labelLayout.json';
import spec from './vesselSpec.json';
import { knurlBand, latheBody, pullTab } from './geometry';
import { composeYourLogo, configureLabel, labelUrls, type LabelSet } from './labels';
import { Vessel } from './Vessel';

const WIDE = window.innerWidth >= 1024;
const SEGMENTS = WIDE ? 128 : 72;

/** Bare brushed aluminium: matches the label's silver so print and metal read as one surface. */
function aluminium(roughness = layout.roughness.metal, color = layout.silver) {
  return new MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness,
    clearcoat: 0.2,
    clearcoatRoughness: 0.3,
  });
}

function useLabel(vessel: VesselId) {
  const gl = useThree((s) => s.gl);
  // useTexture caches by URL; key the memo on the textures, not the wrapper object it returns.
  const { map, orm } = useTexture(labelUrls(vessel, WIDE));
  const versa = useMemo(() => configureLabel({ map, orm }, gl), [map, orm, gl]);
  const [custom, setCustom] = useState<LabelSet | null>(null);

  useEffect(() => {
    let alive = true;
    let made: LabelSet | null = null;
    composeYourLogo(vessel, versa).then((set) => {
      if (!alive) return;
      made = configureLabel(set, gl);
      setCustom(made);
    });
    return () => {
      alive = false;
      made?.map.dispose();
      made?.orm.dispose();
    };
  }, [vessel, versa, gl]);

  // Printed aluminium: metalness/roughness come from the ORM map (bare metal vs matte ink).
  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        map: versa.map,
        metalnessMap: versa.orm,
        roughnessMap: versa.orm,
        metalness: 1,
        roughness: 1,
        clearcoat: 0.2,
        clearcoatRoughness: 0.3,
      }),
    [versa],
  );
  return { versa, custom, material };
}

export function Can() {
  const { versa, custom, material } = useLabel('can');
  const body = useMemo(() => latheBody(spec.can.profile, SEGMENTS, spec.can.label), []);
  const tab = useMemo(() => pullTab(), []);
  const tabMetal = useMemo(() => aluminium(0.24, '#c4c9ce'), []);

  return (
    <Vessel
      id="can"
      height={spec.can.height}
      radius={spec.can.radius}
      label={material}
      versa={versa}
      custom={custom}
    >
      <mesh geometry={body} material={material} />
      <mesh geometry={tab} material={tabMetal} position={[0, 17.81, 0.62]} />
      <mesh material={tabMetal} position={[0, 17.84, 0]}>
        <cylinderGeometry args={[0.17, 0.19, 0.08, 20]} />
      </mesh>
    </Vessel>
  );
}

export function Bottle() {
  const { versa, custom, material } = useLabel('bottle');
  const body = useMemo(() => latheBody(spec.bottle.profile, SEGMENTS, spec.bottle.label), []);
  const cap = useMemo(() => latheBody(spec.bottle.cap.profile, SEGMENTS), []);
  const knurl = useMemo(() => knurlBand(spec.bottle.cap.knurl), []);
  const capMetal = useMemo(() => aluminium(0.38, '#b9bfc5'), []);

  return (
    <Vessel
      id="bottle"
      height={spec.bottle.height}
      radius={spec.bottle.radius}
      label={material}
      versa={versa}
      custom={custom}
    >
      <mesh geometry={body} material={material} />
      <mesh geometry={cap} material={capMetal} />
      <mesh geometry={knurl} material={capMetal} />
    </Vessel>
  );
}
