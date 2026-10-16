import { useEffect } from 'react';
import { VesselPlate, type StillLabel } from '../components/VesselPlate';
import { registerSpin, sceneStore, type VesselId } from '../store/scene';

/**
 * Dev only: one vessel, front on, on a transparent page, at its frame. Screenshot the plate
 * (transparent background) to make the studio stills in public/img/stills/, e.g.
 *   /dev/studio?vessel=bottle&label=yourlogo
 * The stills are what visitors without WebGL see, and what the page shows until the 3D
 * loads, so they must be rendered by this same scene.
 */
export function DevStudio() {
  const params = new URLSearchParams(window.location.search);
  const vessel: VesselId = params.get('vessel') === 'bottle' ? 'bottle' : 'can';
  const label: StillLabel = params.get('label') === 'yourlogo' ? 'yourlogo' : 'brand';

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.studio = '';
    sceneStore.setState({ still: true });
    // a finished logo turn: front facing, wearing YOUR LOGO HERE
    if (label === 'yourlogo') registerSpin('logo', { progress: 1 });
    return () => {
      delete root.dataset.studio;
      sceneStore.setState({ still: false });
      registerSpin('logo', null);
    };
  }, [label]);

  return (
    <div className="grid min-h-svh place-items-center">
      <VesselPlate
        vessel={vessel}
        anchor={`stage-${vessel}`}
        label={label}
        alt=""
        height="1200px"
      />
    </div>
  );
}
