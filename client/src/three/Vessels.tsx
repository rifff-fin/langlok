import { useEffect, useMemo, useRef, useState } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import { MeshPhysicalMaterial, type Group } from 'three';
import type { VesselId } from '../store/scene';
import layout from './labelLayout.json';
import spec from './vesselSpec.json';
import { knurlBand, latheBody, openingShape, pullTab, skyTexture } from './geometry';
import { composeYourLogo, configureLabel, labelUrls, type LabelSet } from './labels';
import { smoothstep, targets } from './stations';
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
  const brand = useMemo(() => configureLabel({ map, orm }, gl), [map, orm, gl]);
  const [custom, setCustom] = useState<LabelSet | null>(null);

  useEffect(() => {
    let alive = true;
    let made: LabelSet | null = null;
    composeYourLogo(vessel, brand).then((set) => {
      if (!alive) return;
      made = configureLabel(set, gl);
      setCustom(made);
    });
    return () => {
      alive = false;
      made?.map.dispose();
      made?.orm.dispose();
    };
  }, [vessel, brand, gl]);

  // Printed aluminium: metalness/roughness come from the ORM map (bare metal vs matte ink).
  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        map: brand.map,
        metalnessMap: brand.orm,
        roughnessMap: brand.orm,
        metalness: 1,
        roughness: 1,
        clearcoat: 0.2,
        clearcoatRoughness: 0.3,
      }),
    [brand],
  );
  return { brand, custom, material };
}

const LID_Y = 17.8; // lid centre (vesselSpec can profile)

export function Can() {
  const { brand, custom, material } = useLabel('can');
  const body = useMemo(() => latheBody(spec.can.profile, SEGMENTS, spec.can.label), []);

  return (
    <Vessel
      id="can"
      height={spec.can.height}
      radius={spec.can.radius}
      topY={LID_Y}
      aimZ={1.25}
      label={material}
      brand={brand}
      custom={custom}
    >
      <mesh geometry={body} material={material} />
      <CanTop />
    </Vessel>
  );
}

/**
 * Lid furniture: the pull tab on its rivet and the opening. During the hero dive the tab
 * lifts with a small click, its nose presses the panel in and the opening shows the sky
 * the film continues from.
 */
function CanTop() {
  const tab = useMemo(() => pullTab(), []);
  const metal = useMemo(() => aluminium(0.24, '#c4c9ce'), []);
  const opening = useMemo(() => openingShape(), []);
  const lip = useMemo(() => openingShape(1.09), []);
  const lipMetal = useMemo(() => aluminium(0.3, '#8f979f'), []);
  const sky = useMemo(() => skyTexture(), []);
  const hinge = useRef<Group>(null);
  const mouth = useRef<Group>(null);
  const live = useRef({ d: 0 });

  useFrame((_, delta) => {
    const m = live.current;
    easing.damp(m, 'd', targets.can.dive, 0.1, delta);
    // ring up, then back down as the panel gives way
    const lift = smoothstep(0.28, 0.42, m.d) * (1 - 0.75 * smoothstep(0.46, 0.62, m.d));
    hinge.current!.rotation.x = lift * 0.55;
    const open = smoothstep(0.4, 0.56, m.d);
    mouth.current!.visible = open > 0.002;
    mouth.current!.scale.setScalar(Math.max(open, 0.001));
  });

  return (
    <>
      {/* ring towards the back, nose towards the viewer, over the opening */}
      <group ref={hinge} position={[0, LID_Y + 0.01, 0]}>
        <mesh geometry={tab} material={metal} position={[0, 0, -0.62]} rotation-y={Math.PI} />
      </group>
      <mesh material={metal} position={[0, LID_Y + 0.04, 0]}>
        <cylinderGeometry args={[0.17, 0.19, 0.08, 20]} />
      </mesh>
      <group ref={mouth} position={[0, LID_Y + 0.008, 0.52]} visible={false}>
        <mesh geometry={lip} material={lipMetal} />
        <mesh geometry={opening} position-y={0.004}>
          <meshBasicMaterial map={sky} toneMapped={false} />
        </mesh>
      </group>
    </>
  );
}

export function Bottle() {
  const { brand, custom, material } = useLabel('bottle');
  const body = useMemo(() => latheBody(spec.bottle.profile, SEGMENTS, spec.bottle.label), []);
  const cap = useMemo(() => latheBody(spec.bottle.cap.profile, SEGMENTS), []);
  const knurl = useMemo(() => knurlBand(spec.bottle.cap.knurl), []);
  const capMetal = useMemo(() => aluminium(0.38, '#b9bfc5'), []);

  return (
    <Vessel
      id="bottle"
      height={spec.bottle.height}
      radius={spec.bottle.radius}
      topY={spec.bottle.height}
      label={material}
      brand={brand}
      custom={custom}
    >
      <mesh geometry={body} material={material} />
      <mesh geometry={cap} material={capMetal} />
      <mesh geometry={knurl} material={capMetal} />
    </Vessel>
  );
}
