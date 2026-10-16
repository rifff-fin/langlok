# VERSA website — project brief for Claude Code

Premium canned water brand **VERSA** by **Langlok Int. Company Ltd.** (Panchagarh, Bangladesh).
Products: **VERSA Can 500 ml** and **VERSA Aluminium Bottle 990 ml**.
Business model: custom-branded cans/bottles for hotels, food franchises, events and venues, plus the closed-loop **ReCan** recycling programme.

Full specification: `docs/VERSA_Website_Master_Plan.md` (read the relevant section before starting any phase).
Phase prompts: `docs/PROMPTS_for_Claude_Code.md`.

## Creative direction — "Monsoon Light"

- Bright, misty, editorial. Light backgrounds always. Aluminium silver, mist white, navy ink, rain blue.
- Story thread: the **Chatak** (pied cuckoo, _Clamator jacobinus_, চাতক) drinks only rain that falls from the sky. Never call it "machranga" (that is a kingfisher).
- Signature moments: fogged-glass hero the cursor wipes clear; scroll-scrubbed "Sky to Seal" film; can spins and comes round showing **YOUR LOGO HERE**; rain density follows scroll speed in the story.

## Stack

- `client/`: Vite, React 19, TypeScript, three, @react-three/fiber v9, @react-three/drei v10, GSAP 3 (ScrollTrigger, SplitText, DrawSVG, MotionPath — all free) + `@gsap/react`, Lenis (`lenis/react`), zustand, maath, React Router, react-hook-form + zod, Tailwind v4 or CSS Modules.
- `server/`: Node LTS, Express 5, Mongoose, zod, multer, sharp, helmet, cors, express-rate-limit.
- MongoDB Atlas; uploads to Cloudinary or R2; email via Resend/Nodemailer.

## Commands

- `npm run dev` (root) — runs client and server together
- `npm run dev -w client` / `npm run dev -w server`
- `npm run build`, `npm run lint`, `npm run typecheck`
- `bash scripts/make-placeholder-frames.sh` — numbered placeholder hero frames
- `bash scripts/extract-frames.sh <master.mov>` — real hero frames (desktop + mobile + poster)
- `/dev` route (dev builds only) — Lenis + ScrollTrigger pin test
- `python scripts/build-label-textures.py` — rebuild the 3D label textures from the mockup photos (Python 3.10+, Pillow, numpy, scipy)

Version pins: React stays `~19.3` (R3F 9.8 peer range is `<19.4`); TypeScript stays `~6.0` (typescript-eslint needs `<6.1`). Router is `react-router` v8: `createBrowserRouter` from `react-router`, `RouterProvider` from `react-router/dom`.

## Architecture rules (do not break)

1. **One WebGL canvas** for the whole site: a fixed, full-viewport, transparent R3F `<Canvas>` behind the DOM. Never mount a second WebGL canvas.
2. **ScrollTrigger writes, `useFrame` reads.** Sections register their ScrollTriggers (`registerSpin`) and DOM anchors (`useVesselAnchor`) in the zustand store (`store/scene.ts`) without React re-renders; the 3D reads `trigger.progress` and anchor rects every frame and damps with `maath/easing`.
3. Register GSAP plugins once in `client/src/lib/gsap.ts`. Use `useGSAP()` for every timeline so it reverts on unmount. Use `gsap.matchMedia()` for responsive and reduced-motion variants.
4. Lenis drives the GSAP ticker (`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`). Touch scrolling stays native.
5. The hero film is a **2D canvas image sequence** (not `<video>`), loaded progressively (every 8th frame, then 4th, 2nd, rest), drawing the nearest loaded frame.
6. Can and bottle are **procedural** lathes built from `three/vesselSpec.json` (profiles traced from the photos). The label is mapped on the body itself: `phiStart = PI` puts u = 0.5 on the camera, v runs by height across the printable zone and clamps to bare-silver edge rows (the print continues onto the neck taper, which a straight band can't follow). Bottle cap = lathe + knurl band; can = lathe + pull tab. Units: 1 unit = 1 cm.
7. Label textures are pre-created and uploaded once (`labels.ts`, `gl.initTexture`); the YOUR LOGO HERE swap changes the material's `map`/`roughnessMap`/`metalnessMap` references only while the print faces away (or while the vessel is off-screen), keyed on scroll progress, so it is deterministic in both directions. Never re-upload textures each frame.
8. **All copy lives in `client/src/content/copy.ts`.** Components never hard-code marketing text.
9. All text is real DOM text. Canvases are `aria-hidden="true"`.
10. One clock: R3F runs `frameloop="never"` and is `advance()`d from the GSAP ticker after Lenis/ScrollTrigger update, only while a vessel is on screen (plus one clearing frame).

## Design tokens (source of truth: `client/src/styles/tokens.css`)

```
--mist #F3F5F6   --cloud #E6EBEE   --paper #FBFCFC   --aluminium #C7CDD2
--ink #16233F    --slate #5B6875
--rain #2F7FC1 (large text/graphics only)   --rain-deep #1F64A0 (links/small text)
--rain-light #8FC3EA   --leaf #6E8B5E   --sun #E9B872 (story only)   --monsoon #6C6A86 (story only)
```

Fonts: **Bodoni Moda** (display), **Jost** (UI/body/eyebrows, uppercase eyebrows tracked 0.24em), **Noto Serif Bengali** (Bengali accents). The logo is always the client's SVG, never typeset.

Styling is **Tailwind v4**. `globals.css` maps the tokens into `@theme inline`, so use `bg-mist`, `text-ink`, `border-aluminium`, `font-display`, `ease-liquid`, etc. Raw font and ease tokens are `--ff-display|sans|bengali` and `--ease-water-*`. They must not share names with Tailwind's `--font-*`/`--ease-*`, which would create a cyclic `var()`. Fluid sizes: `text-[length:var(--text-h2)]`; gutters: `px-[var(--gutter)]`. Fonts load via `<link>` in `client/index.html`.

Motion: liquid eases (`power2.out`, `expo.out`, `sine.inOut`), no bounce. UI 200–350 ms, reveals 700–1100 ms. Text reveals line by line with SplitText masks.

## Never

- Dark or black page backgrounds, neon, purple-blue "AI gradients", glassmorphism everywhere, floating blobs.
- Text inside WebGL. Auto-playing audio.
- AI-generated versions of the logo or the bird; use client artwork from `client/public/img/`.
- Absolute health claims ("zero microplastics", "leaches nothing") in new copy; keep the client's wording only where `copy.ts` already has it and flag it.
- Inventing statistics. Counters stay hidden until real data exists.
- Serving user-uploaded SVGs: sanitize on the client, rasterize with `sharp` on the server.

## Performance budgets

- LCP < 2.5 s (hero poster `<img fetchpriority="high">`); initial JS < 200 KB gz excluding the lazy 3D chunk.
- Hero frames ≤ 12 MB desktop, ≤ 5 MB mobile. 3D at 60 fps desktop, ≥ 40 fps mid-range Android.
- R3F `dpr={[1, 1.75]}` with drei `PerformanceMonitor`; contact shadows only; no heavy postprocessing.
- `prefers-reduced-motion`: Lenis off, 3 crossfading stills instead of the film, no auto-spin, no rain.
- No WebGL: static product images and a 2D label preview in the configurator.

## How to work in this repo

- Before a phase: read the matching section of the master plan and propose a short plan; wait for approval if it changes architecture.
- After changes: run `npm run typecheck` and `npm run lint`, then check the page in the browser at 390 × 844 and 1440 × 900, and with reduced motion enabled.
- Keep components small; one section per file in `client/src/sections/`; 3D in `client/src/three/`. Pages in `client/src/pages/` compose sections; shared pieces in `client/src/components/` (`ui/` for primitives: Container, Eyebrow, Hairline, ChapterHead, Button).
- The hero is a tall track (`(HERO_SCROLL_VH + 100)svh`) with a CSS-sticky full-viewport stage (`[data-hero-stage]`). Its height is already final, so drive it with a ScrollTrigger on the track (progress only, no `pin`). Other pinned sections are `min-h-svh` panels; their pin spacing gets added later.
- The static Phase 1 layouts double as the reduced-motion and no-WebGL versions. Enhance them; don't replace them.
- Until the client sends the master SVG, `components/Logo.tsx` is a neutral text placeholder (`data-placeholder="logo"`). The mockup photos are stand-ins: `ProductPlate`, plus `SlottedVessel` + `logoSlots.ts` for the "YOUR LOGO HERE" slot.
- When unsure about copy or a brand fact, leave a `// TODO(client):` comment instead of guessing.

## 3D vessels (Phase 3)

- **Layering:** the canvas is fixed at z 0 under `main` and the footer (z 1), so section backgrounds cover the vessels and all text stays above them. A section that must show a vessel keeps a transparent background (the hero stage fades out as beat F arrives).
- **Stations:** `three/stations.ts` routes each vessel through DOM anchors (`hero-can`, `products-can`, `products-bottle`, `logo-pair`). The vessel follows its anchor, holds while that section is pinned, `travel`s between neighbouring anchors (stays on the vertical centre line, glides across, adds a turn) or `cut`s while off-screen. `travel-wide` = glide on wide screens only. `fitCm` = how many cm an anchor's height represents (keeps real proportions).
- **Spins:** one full turn per section, completing at 85% (products) / 80% (YOUR LOGO) of the pin, then holding. Desktop pins each panel for `+=100%`; phones don't pin, and the turn completes as the anchor reaches the centre.
- **Stand-ins:** anchors are `[data-vessel-plate]` boxes (sized before load, no layout shift). `SceneHost` lazy-loads the 3D chunk at idle when anchors exist, WebGL works and motion is allowed; `Ready` sets `html[data-webgl="ready"]` and the photos fade out (unlayered CSS in `globals.css`). Reduced motion / no WebGL: the photos stay, no pins.
- **Labels:** generated by `scripts/build-label-textures.py` into `client/public/textures/` (2048 and 1024 px colour + ORM maps) and `three/labelLayout.json` (silver colour, roughness, logo zone). The bottle's bird/wordmark/back panel are the can's artwork scaled (its own photos' reflections are too strong to key). The back paragraph with absolute health claims is deliberately left out. TODO(client): flat label files replace the whole script.
- **Reveals:** `hooks/useReveals.ts` animates `h2`, `[data-reveal="intro|lines|fade|stagger"]` and `[data-chapter-head]` from markup alone; callouts in pinned panels animate with their pin instead.
