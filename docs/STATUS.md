# LANGLOK website — current status

**Updated:** 17 Oct 2026 · **Branch:** `phase-3-3d-products` (not merged into `main` yet)
**Stage:** Phases 0, 1 and 3 done. The hero film is built (drawn live, no footage needed). **Next: the preloader, then Phase 4 (configurator).**

> Keep this file current: update it at the end of every piece of work (what changed, what's next, what's blocked).

## What you see now (home page, top to bottom)

1. **Opening screen**: the live 3D can, large and centred, headline left, serif aside right (the morphowater.com idea). It rises in with a turn, breathes and turns slightly towards the mouse.
2. **The dive** (first scroll): the can tips its lid to the camera, the tab clicks (a small knock and a puff of cold vapour), the opening shows sky ("One small click. *The sky opens.*") and the camera dives in.
3. **The living film**, drawn live in the page, one caption at a time:
   - **The wait**: a misty forest; the Chatak (drawn, animated) sits on a swaying acacia branch, breathing, looking about, crest flicking, while other birds fly past.
   - **The monsoon**: smoky clouds roll in, colours drain to bruised purple, wind and rain; he looks up.
   - **The flight**: he opens his wings and flies up into the storm as the camera tilts up.
   - **The first drop**: seen from below, beak open, he catches a raindrop, then flies off into breaking light.
   - **The river**: the rain becomes a river in a misty valley.
4. **Meet LANGLOK**: the film ends in mist, the can comes back, then glides on to the products (desktop).
5. **Products**: the can, then the bottle, each about 70% of the screen tall, a full turn as you scroll (pinned on desktop), with the spec list.
6. **Your logo here**: can and bottle side by side at true size; one more turn and both come round wearing YOUR LOGO HERE.
7. The other sections (configurator, Chatak story, mission, ReCan, why aluminium, who we serve, CTA) are the static layouts with text reveals.

## Done

| Phase | What | Where |
|---|---|---|
| 0 Setup | Monorepo (client + server), Vite/React 19/TS, Tailwind v4 tokens, GSAP + Lenis, lint/format | `main` |
| 1 Skeleton | Every section and route as a static, responsive layout; all copy in `copy.ts` | `phase-1-skeleton` |
| 3 3D products | Procedural can + bottle from the photos, label textures, studio lighting, scroll spins, station router, YOUR LOGO swap | `phase-3-3d-products` |
| 3.1 Showcase | Morpho-style opening + dive, chrome-contrast lighting, bigger vessels, studio stills instead of cropped photos, two-voice headlines, Motion switch, rename to LANGLOK | `phase-3-3d-products` |
| 2 Hero film | The living film: a drawn, animated Chatak (no photos), generated misty forest, monsoon, flight and catch, river; captions from the client's story | `phase-3-3d-products` |

## Next

1. **Preloader** (rest of Phase 2): a drop that becomes a thin progress line while fonts, the can and the film's layers load.
2. **Phase 4, configurator**: upload a logo and see it on the 3D can and bottle (the YOUR LOGO swap already works).
3. **Phase 5 polish**: Chatak story section, ReCan loop drawing, chapter rail ("01 / 07").
4. Then the backend (Phase 6), real assets and performance (7), launch (8).
5. Optional, any time: real AI-generated footage of the same story can replace the drawn film (prompts in `docs/PROMPTS_for_Claude_Code.md`, Part C).

## Waiting on the client

- **LANGLOK label artwork.** The can and bottle artwork still prints **VERSA**, so the 3D labels show VERSA. We need the LANGLOK label files (flat, unwrapped) and the logo SVG.
- Supplier dimension drawings for the can and bottle (the shapes are traced from photos).
- Lining type before any purity claims; ReCan details; social links; full address and sales email.
- The open questions in master plan §1.3 (bird name, "Umm Lajj", etc.).

## Good to know

- **Windows "Animation effects" off = reduced motion.** On this development PC the setting is off, so browsers ask the site for reduced motion. The site then shows a calm version: no pins or glides, the film's scenes crossfade. Use the **Motion** switch (bottom-right corner) to turn the full version on.
- **The film's bird is drawn in code** (`client/src/film/chatak.ts`), not taken from the client's pictures. Those pictures are references only. Tune its shape at `/dev/bird`.
- **No WebGL**: the plates show studio stills (`client/public/img/stills/`), rendered from the same 3D scene at `/dev/studio`; re-render them after changing the models, labels or lighting.
- Not yet measured: frame rate on real phones (budget ≥ 40 fps mid-range Android).
- Bundle: initial JS 188 KB gz (budget 200), lazy 3D chunk 271 KB gz, film chunk 7 KB gz plus 1.1 MB of film layers loaded at idle.

## How to run and check

```bash
npm run dev          # http://localhost:5173 (client) + :4000 (API)
npm run typecheck && npm run lint
python scripts/build-film-layers.py   # only after changing the film's generated layers
```

Check 1440 × 900 and 390 × 844, with the Motion switch on and off. Dev routes: `/dev` (pin test), `/dev/studio` (stills), `/dev/bird` (the film's Chatak).

## Log

- **17 Oct 2026, later**:
  - **The hero film, rebuilt.** The client's two bird pictures are now references only (as asked). The Chatak is a drawn, animated silhouette: he perches, breathes, looks around, takes off, beats his wings, climbs and catches the drop.
  - **The forest before the river is generated** in the river scene's misty layered style, so the film reads as one piece.
  - **New caption**: "He flew into the storm."
  - **Unchanged**: the river scene ("The rain has returned") and everything after it.
- **17 Oct 2026**:
  - **3D made visible** for reduced-motion PCs (Motion switch).
  - **Morpho-style opening and dive**.
  - **Look and scale:** stronger lighting, bigger vessels, whole-vessel stills.
  - **Rename** VERSA → LANGLOK. This file was added.
- **16–17 Oct 2026**: Phase 3, the 3D can and bottle spinning with scroll.
- **16 Oct 2026**: Phases 0 and 1; GitHub repo connected (`rifff-fin/langlok`).
