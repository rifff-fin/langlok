# LANGLOK website — project brief for Claude Code

Premium canned water brand **LANGLOK** by **Langlok Int. Company Ltd.** (Panchagarh, Bangladesh).
Products: **LANGLOK Can 500 ml** and **LANGLOK Aluminium Bottle 990 ml**.
The brand was renamed from VERSA on 17 Oct 2026. The client's label artwork (and so the 3D labels built from it) still prints **VERSA** until LANGLOK label files arrive. Don't typeset LANGLOK onto the labels.
Business model: custom-branded cans/bottles for hotels, food franchises, events and venues, plus the closed-loop **ReCan** recycling programme.

Full specification: `docs/LANGLOK_Website_Master_Plan.md` (read the relevant section before starting any phase).
Phase prompts: `docs/PROMPTS_for_Claude_Code.md`.
**Current stage: `docs/STATUS.md`. Update it at the end of every piece of work** (what changed, what's next, what's blocked, a dated log line).

## Creative direction — "Monsoon Light"

- Bright, misty, editorial. Light backgrounds always. Aluminium silver, mist white, navy ink, rain blue.
- Story thread: the **Chatak** (pied cuckoo, _Clamator jacobinus_, চাতক) drinks only rain that falls from the sky. Never call it "machranga" (that is a kingfisher).
- Signature moments: the opening screen *is* the live 3D can (reference: morphowater.com, master plan §2.5), and scroll tips its lid and dives through the opening into the hero film: the Chatak waits in a misty forest, the monsoon comes, he flies into the storm and catches the first drop, the rain becomes a river. Then the can spins and comes round showing **YOUR LOGO HERE**; rain density follows scroll speed.
- Headlines have two voices: light Jost for the line, Bodoni Moda italic for its accent. Copy marks the accent `*like this*`; render titles with `components/ui/Emph` (the `.headline` class gives a non-heading element the same style).

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
- `/dev/studio?vessel=can|bottle&label=brand|yourlogo` (dev only) — one vessel on a transparent page at its frame; screenshot the plate (transparent background, 2x) to make `client/public/img/stills/*.webp` (1200 px tall). Re-render after changing models, labels or lighting.
- `python scripts/build-label-textures.py` — rebuild the 3D label textures from the mockup photos (Python 3.10+, Pillow, numpy, scipy)
- `python scripts/build-film-layers.py` — rebuild the hero film's generated layers (`client/public/film/`: misty woods, mist, clouds, rays, river bank); seeded, so the output is reproducible
- `/dev/bird` (dev only) — the film's Chatak in a grid of poses, for tuning its shape

Version pins: React stays `~19.3` (R3F 9.8 peer range is `<19.4`); TypeScript stays `~6.0` (typescript-eslint needs `<6.1`). Router is `react-router` v8: `createBrowserRouter` from `react-router`, `RouterProvider` from `react-router/dom`.

## Architecture rules (do not break)

1. **One WebGL canvas** for the whole site: a fixed, full-viewport, transparent R3F `<Canvas>` behind the DOM. Never mount a second WebGL canvas.
2. **ScrollTrigger writes, `useFrame` reads.** Sections register their ScrollTriggers (`registerSpin`) and DOM anchors (`useVesselAnchor`) in the zustand store (`store/scene.ts`) without React re-renders; the 3D reads `trigger.progress` and anchor rects every frame and damps with `maath/easing`.
3. Register GSAP plugins once in `client/src/lib/gsap.ts`. Use `useGSAP()` for every timeline so it reverts on unmount. Use `gsap.matchMedia()` for responsive and reduced-motion variants, with queries built by `lib/motion.ts` (`motionQuery(extra?)` / `reducedQuery(extra?)`, `useReducedMotion()`), never a raw `(prefers-reduced-motion…)` string: the Motion switch can override the OS setting.
4. Lenis drives the GSAP ticker (`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`). Touch scrolling stays native.
5. The hero film is a **2D canvas**, not `<video>`. It is drawn live: a scroll-driven story (`film/film.ts`) composed from generated layers, the drawn Chatak (`film/chatak.ts`) and the acacia branch (`film/branch.ts`). The canvas lazy-loads in its own chunk, fetches its layers at idle and draws on the GSAP ticker only while the sky layer is visible. Caption windows live in `film/timeline.ts`. Scroll owns the story; time owns the life (breathing, wingbeats, wind, rain), which freezes under reduced motion. Real footage could replace it later as an image sequence in the same sky layer, loaded progressively (every 8th frame, then 4th, 2nd, rest).
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

Fonts: **Jost** (headlines in light 300, UI/body, uppercase eyebrows tracked 0.24em), **Bodoni Moda** italic (headline accents, big volumes, `.accent`), **Noto Serif Bengali** (Bengali accents). The logo is always the client's SVG, never typeset. Sizes: `--text-hero` (opening headline), `--text-display`, `--text-h2`, `--text-h3`.

Styling is **Tailwind v4**. `globals.css` maps the tokens into `@theme inline`, so use `bg-mist`, `text-ink`, `border-aluminium`, `font-display`, `ease-liquid`, etc. Raw font and ease tokens are `--ff-display|sans|bengali` and `--ease-water-*`. They must not share names with Tailwind's `--font-*`/`--ease-*`, which would create a cyclic `var()`. Fluid sizes: `text-[length:var(--text-h2)]`; gutters: `px-[var(--gutter)]`. Fonts load via `<link>` in `client/index.html`.

Motion: liquid eases (`power2.out`, `expo.out`, `sine.inOut`), no bounce. UI 200–350 ms, reveals 700–1100 ms. Text reveals line by line with SplitText masks.

## Never

- Dark or black page backgrounds, neon, purple-blue "AI gradients", glassmorphism everywhere, floating blobs.
- Text inside WebGL. Auto-playing audio.
- AI-generated versions of the logo or the label's bird. The logo and the label artwork are always the client's.
- The client's bird pictures pasted straight into the film. They are references only (user, 17 Oct 2026). The film's Chatak is drawn in code as an animated silhouette (`film/chatak.ts`): crest, black above and white below, white wing crescents, white-tipped graduated tail.
- Absolute health claims ("zero microplastics", "leaches nothing") in new copy; keep the client's wording only where `copy.ts` already has it and flag it.
- Inventing statistics. Counters stay hidden until real data exists.
- Serving user-uploaded SVGs: sanitize on the client, rasterize with `sharp` on the server.

## Performance budgets

- LCP < 2.5 s (hero poster `<img fetchpriority="high">`); initial JS < 200 KB gz excluding the lazy 3D chunk.
- Hero frames ≤ 12 MB desktop, ≤ 5 MB mobile. 3D at 60 fps desktop, ≥ 40 fps mid-range Android.
- R3F `dpr={[1, 1.75]}` with drei `PerformanceMonitor`; contact shadows only; no heavy postprocessing.
- Reduced motion (OS setting or the Motion switch): Lenis off, the film's scenes crossfade with scroll (nothing moves on its own, the camera stays put), no auto-spin, no rain, no pins, no dive. The live 3D vessels still render and turn in place as their section passes (no drift, glides or pointer tilt).
- No WebGL: the vessel plates keep their studio stills; 2D label preview in the configurator.

## How to work in this repo

- Before a phase: read the matching section of the master plan and propose a short plan; wait for approval if it changes architecture.
- After changes: run `npm run typecheck` and `npm run lint`, then check the page in the browser at 390 × 844 and 1440 × 900, and with reduced motion enabled (or the Motion switch off). Then update `docs/STATUS.md`.
- This dev PC has Windows *Animation effects* off, so its browsers report reduced motion; use the Motion switch to see the full version.
- Keep components small; one section per file in `client/src/sections/`; 3D in `client/src/three/`. Pages in `client/src/pages/` compose sections; shared pieces in `client/src/components/` (`ui/` for primitives: Container, Eyebrow, Hairline, ChapterHead, Button).
- The hero is a tall track (`(HERO_SCROLL_VH + 100)svh`) with a CSS-sticky full-viewport stage (`[data-hero-stage]`); the film canvas lives in its sky layer (`[data-hero-sky]`). Its height is already final, so drive it with a ScrollTrigger on the track (progress only, no `pin`). The opening screen (intro + dive) is an absolutely placed sticky layer at the top of the track. Other pinned sections are `min-h-svh` panels; their pin spacing gets added later.
- The static Phase 1 layouts double as the reduced-motion and no-WebGL versions. Enhance them; don't replace them.
- Until the client sends the master SVG, `components/Logo.tsx` is a neutral text placeholder (`data-placeholder="logo"`). Vessel plates (`components/VesselPlate.tsx`) show studio stills of the whole vessel, never the cropped mockup photos; `SlottedVessel` + `logoSlots.ts` remain for the configurator's 2D preview.
- When unsure about copy or a brand fact, leave a `// TODO(client):` comment instead of guessing.

## 3D vessels (Phase 3)

- **Layering:** the canvas is fixed at z 0 under `main` and the footer (z 1), so section backgrounds cover the vessels and all text stays above them. A section that must show a vessel keeps a transparent background (the hero's sky layer `[data-hero-sky]` is clear during the opening screen and comes up as the dive ends; its sticky stage `[data-hero-stage]` fades out as beat F arrives. One scrubbed tween per element: two on the same element fight after a jump). The page colour lives on `html` and `body` is transparent, so a fixed backdrop at a negative z-index (the hero's studio light, portalled to `body`) sits between the page and the canvas.
- **Stations:** `three/stations.ts` routes each vessel through DOM anchors (`hero-intro`, `hero-can`, `products-can`, `products-bottle`, `logo-can`, `logo-bottle`; `stage-*` exist only on `/dev/studio`). An anchor's height represents the vessel's `frame` from `vesselSpec.json` (vessel + shadow + margin; plates use its aspect ratio), so the 3D lands exactly on the still. The vessel follows its anchor, holds while that section is pinned, `travel`s between neighbouring anchors (stays on the vertical centre line, glides across, adds a turn) or `cut`s while off-screen. `travel-wide` = glide on wide screens only; reduced motion turns every travel into a cut. A travel completes when the destination plate reaches the centre line, so pinned destinations must sit centred in their pinned screen (YOUR LOGO keeps its chapter head out of flow on desktop for this).
- **The dive:** `hero-intro` is a `dive` station driven by the `heroDive` move (`Hero.tsx`, first 90% of a viewport, opening screen held sticky). With full motion the can tips its lid to the camera (`DIVE_TIP`), grows (`DIVE_GROW`), brings its top and then the opening to the screen centre, lifts the pull tab and opens the mouth (`CanTop` in `Vessels.tsx`); when the move ends the can is gone until `hero-can`.
- **Spins:** one full turn per section, completing at 85% (products) / 80% (YOUR LOGO) of the pin, then holding. Desktop pins each panel for `+=100%`; phones and reduced motion don't pin, and the turn completes as the anchor reaches the centre.
- **Life (full motion only):** entrance rise + turn on first sight at `hero-intro`, slow sway and float, a small turn and tilt towards the mouse pointer (`stage.pointer`, hover devices).
- **Lighting:** `Lighting.tsx` = light dome + strip lights + a back rim light + two dark flags at the sides (they print the dark bands that make aluminium read as metal on a light page).
- **Stand-ins:** anchors are `[data-vessel-plate]` boxes (sized before load, no layout shift) holding studio stills. `SceneHost` lazy-loads the 3D chunk at idle whenever anchors exist and WebGL works (reduced motion included); `Ready` sets `html[data-webgl="ready"]` and the stills fade out (unlayered CSS in `globals.css`). No WebGL: the stills stay.
- **Labels:** generated by `scripts/build-label-textures.py` into `client/public/textures/` (2048 and 1024 px colour + ORM maps) and `three/labelLayout.json` (silver colour, roughness, logo zone). The bottle's bird/wordmark/back panel are the can's artwork scaled (its own photos' reflections are too strong to key). The back paragraph with absolute health claims is deliberately left out. TODO(client): flat label files replace the whole script.
- **Reveals:** `hooks/useReveals.ts` animates `h2`, `[data-reveal="intro|lines|fade|stagger"]` and `[data-chapter-head]` from markup alone; callouts in pinned panels animate with their pin instead.
