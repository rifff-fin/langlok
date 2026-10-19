import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import {
  ImageLoader,
  MeshPhysicalMaterial,
  type Group,
  type Sprite,
  type SpriteMaterial,
} from 'three';
import type { LabelBase } from '../configurator/compose';
import type { VesselId } from '../store/scene';
import layout from './labelLayout.json';
import spec from './vesselSpec.json';
import { knurlBand, latheBody, openingShape, pullTab, skyTexture, wispTexture } from './geometry';
import {
  brandLabel,
  composeYourLogo,
  configureLabel,
  labelUrls,
  watchDesign,
  type LabelSet,
} from './labels';
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
  // The client's artwork, as plain images (never uploaded as they are): every print the
  // vessel wears is composed from it. useLoader caches by URL.
  const urls = labelUrls(vessel, WIDE);
  const [color, orm] = useLoader(ImageLoader, [urls.map, urls.orm]);
  const base = useMemo<LabelBase>(() => ({ vessel, color, orm }), [vessel, color, orm]);
  // the official VERSA print: the artwork on the white can and bottle
  const brand = useMemo(() => brandLabel(base, gl), [base, gl]);
  const [custom, setCustom] = useState<LabelSet | null>(null);

  useEffect(() => {
    let alive = true;
    let made: LabelSet | null = null;
    composeYourLogo(base).then((set) => {
      if (!alive) return;
      made = configureLabel(set, gl);
      setCustom(made);
    });
    return () => {
      alive = false;
      made?.map.dispose();
      made?.orm.dispose();
    };
  }, [base, gl]);

  useEffect(
    () => () => {
      brand.map.dispose();
      brand.orm.dispose();
    },
    [brand],
  );

  // the configurator's design (made on the visitor's first edit, then updated in place)
  const [config, setConfig] = useState<LabelSet | null>(null);
  useEffect(() => watchDesign(base, gl, setConfig), [base, gl]);

  // Printed aluminium: metalness/roughness come from the ORM map (bare metal, white
  // basecoat, ink).
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
  return { brand, custom, config, material };
}

/** The lid's centre: the last point of the can's profile. */
const LID_Y = spec.can.profile[spec.can.profile.length - 1][1];

export function Can() {
  const { brand, custom, config, material } = useLabel('can');
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
      config={config}
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
const PUFF = 12; // wisps of cold vapour when the can opens
const PUFF_LIFE = 1.2; // s

function CanTop() {
  const tab = useMemo(() => pullTab(), []);
  const metal = useMemo(() => aluminium(0.24, '#c4c9ce'), []);
  const opening = useMemo(() => openingShape(), []);
  const lip = useMemo(() => openingShape(1.09), []);
  const lipMetal = useMemo(() => aluminium(0.3, '#8f979f'), []);
  const sky = useMemo(() => skyTexture(), []);
  const wisp = useMemo(() => wispTexture(), []);
  const hinge = useRef<Group>(null);
  const mouth = useRef<Group>(null);
  const puffs = useRef<(Sprite | null)[]>([]);
  const live = useRef({ d: 0, puffAt: -10 });
  const seeds = useMemo(
    () =>
      Array.from({ length: PUFF }, (_, i) => ({
        a: (i / PUFF) * Math.PI * 2 + Math.sin(i * 12.9) * 0.4,
        out: 0.6 + ((i * 7) % 5) * 0.18,
        up: 2.2 + ((i * 3) % 4) * 0.7,
        size: 0.55 + ((i * 5) % 3) * 0.25,
      })),
    [],
  );

  useFrame((state, delta) => {
    const m = live.current;
    const before = m.d;
    easing.damp(m, 'd', targets.can.dive, 0.1, delta);
    // the click: the ring snaps up, then is pressed back as the panel gives way
    const up = smoothstep(0.26, 0.36, m.d);
    const down = smoothstep(0.44, 0.58, m.d);
    hinge.current!.rotation.x = up * 0.95 - down * 0.7;
    const open = smoothstep(0.37, 0.5, m.d);
    mouth.current!.visible = open > 0.002;
    mouth.current!.scale.setScalar(Math.max(open, 0.001));
    // psst: vapour escapes the moment the panel opens (scrolling forwards)
    const now = state.clock.elapsedTime;
    if (before < 0.4 && m.d >= 0.4) m.puffAt = now;
    const age = (now - m.puffAt) / PUFF_LIFE;
    puffs.current.forEach((sp, i) => {
      if (!sp) return;
      sp.visible = age >= 0 && age < 1;
      if (!sp.visible) return;
      const s = seeds[i];
      const e = 1 - (1 - age) * (1 - age); // fast out, slowing
      sp.position.set(
        Math.cos(s.a) * s.out * e,
        LID_Y + 0.2 + s.up * e,
        1.25 + Math.sin(s.a) * s.out * e,
      );
      sp.scale.setScalar(s.size + e * 2.2);
      (sp.material as SpriteMaterial).opacity =
        0.5 * Math.sin(Math.PI * Math.min(1, age * 1.4)) * (1 - age);
    });
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
      {seeds.map((_, i) => (
        <sprite
          key={i}
          ref={(el) => {
            puffs.current[i] = el;
          }}
          visible={false}
        >
          <spriteMaterial map={wisp} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </>
  );
}

export function Bottle() {
  const { brand, custom, config, material } = useLabel('bottle');
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
      config={config}
    >
      <mesh geometry={body} material={material} />
      <mesh geometry={cap} material={capMetal} />
      <mesh geometry={knurl} material={capMetal} />
    </Vessel>
  );
}
