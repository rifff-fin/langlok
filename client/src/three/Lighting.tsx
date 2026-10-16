import { useMemo } from 'react';
import { BackSide, Color, Float32BufferAttribute, SphereGeometry } from 'three';
import { Environment, Lightformer } from '@react-three/drei';

/**
 * Soft studio built from shapes, rendered once into the environment map (no HDRI download):
 * a light-grey dome that darkens towards the floor, two tall strip lights for the vertical
 * highlights premium cans show, a wide top light and a faint back fill for the rims.
 */
export function Lighting() {
  return (
    <Environment resolution={256} frames={1}>
      <Dome />
      <Lightformer
        form="rect"
        intensity={4.2}
        position={[-4.5, 1.5, 5]}
        scale={[2.4, 16, 1]}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="rect"
        intensity={3}
        position={[5, 0.5, 4]}
        scale={[1.2, 16, 1]}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="rect"
        intensity={1.8}
        position={[0, 9, 1]}
        scale={[12, 4, 1]}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="rect"
        intensity={1}
        position={[0, 1, -8]}
        scale={[16, 8, 1]}
        target={[0, 0, 0]}
      />
    </Environment>
  );
}

function Dome() {
  const geometry = useMemo(() => {
    const g = new SphereGeometry(40, 48, 24);
    const pos = g.getAttribute('position');
    const top = new Color('#ffffff');
    const horizon = new Color('#e6e9ec');
    const floor = new Color('#8e959c');
    const c = new Color();
    const colors: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 40;
      if (y >= 0) c.copy(horizon).lerp(top, Math.pow(y, 0.6));
      else c.copy(horizon).lerp(floor, Math.pow(-y, 0.7));
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new Float32BufferAttribute(colors, 3));
    return g;
  }, []);
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors side={BackSide} toneMapped={false} />
    </mesh>
  );
}
