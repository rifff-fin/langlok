# LANGLOK website — current status

**Updated:** 17 Oct 2026 · **Branch:** `phase-3-3d-products` (not merged into `main` yet)
**Stage:** Phases 0, 1 and 3 done (3D can and bottle, Morpho-style opening). **Next: Phase 2, the hero film.**

> Keep this file current: update it at the end of every piece of work (what changed, what's next, what's blocked).

## What you see now (home page, top to bottom)

1. **Opening screen**: the live 3D can, large and centred, with the headline on the left and a serif aside on the right (the morphowater.com idea). It rises in with a turn, breathes, and turns slightly towards the mouse.
2. **The dive** (first scroll): the can tips its lid to the camera, the tab clicks, the opening shows sky ("One small click. *The sky opens.*") and the camera dives in.
3. **Sky stage**: placeholder sky with the film's text beats (the real film comes in Phase 2).
4. **Meet LANGLOK**: the can comes back, then glides on to the products (desktop).
5. **Products**: the can, then the bottle, each about 70% of the screen tall, a full turn as you scroll (pinned on desktop), with the spec list.
6. **Your logo here**: can and bottle side by side at true size; one more turn and both come round wearing YOUR LOGO HERE.
7. The other sections (configurator, Chatak story, mission, ReCan, why aluminium, who we serve, CTA) are the static layouts with text reveals.

## Done

| Phase | What | Where |
|---|---|---|
| 0 Setup | Monorepo (client + server), Vite/React 19/TS, Tailwind v4 tokens, GSAP + Lenis, lint/format | `main` |
| 1 Skeleton | Every section and route as a static, responsive layout; all copy in `copy.ts` | `phase-1-skeleton` |
| 3 3D products | Procedural can + bottle from the photos, label textures, studio lighting, scroll spins, station router, YOUR LOGO swap | `phase-3-3d-products` |
| 3.1 Showcase (17 Oct) | Morpho-style opening + dive, chrome-contrast lighting, bigger vessels, studio stills instead of cropped photos, two-voice headlines, Motion switch, rename to LANGLOK | `phase-3-3d-products` |

## Next

1. **Phase 2, hero film**: generate the "Sky to Seal" footage (prompts in `docs/PROMPTS_for_Claude_Code.md`, Part C), cut frames with `scripts/extract-frames.sh`, and play them in the sky stage behind the dive. Its first frame should be the pale sky the can's opening shows.
2. **Phase 4, configurator**: upload a logo and see it on the 3D can and bottle (the YOUR LOGO swap already works).
3. **Phase 5 polish**: Chatak story pins and rain, ReCan loop drawing, chapter rail ("01 / 07") from the Morpho reference.
4. Then the backend (Phase 6), real assets and performance (7), launch (8).

## Waiting on the client

- **LANGLOK label artwork.** The can and bottle artwork still prints **VERSA**, so the 3D labels show VERSA. We need the LANGLOK label files (flat, unwrapped) and the logo SVG.
- Supplier dimension drawings for the can and bottle (the shapes are traced from photos).
- Lining type before any purity claims; ReCan details; social links; full address and sales email.
- The open questions in master plan §1.3 (bird name, "Umm Lajj", etc.).

## Good to know

- **Windows "Animation effects" off = reduced motion.** On this development PC the setting is off, so browsers ask the site for reduced motion. The site then shows the 3D vessels without pins, glides or the dive. Use the **Motion** switch (bottom-right corner) to turn the full version on, or turn on *Settings → Accessibility → Visual effects → Animation effects*.
- **No WebGL**: the plates show studio stills (`client/public/img/stills/`), rendered from the same 3D scene at `/dev/studio`; re-render them after changing the models, labels or lighting.
- Not yet measured: frame rate on real phones (budget ≥ 40 fps mid-range Android).
- Bundle: initial JS 185 KB gz (budget 200), lazy 3D chunk 270 KB gz.

## How to run and check

```bash
npm run dev          # http://localhost:5173 (client) + :4000 (API)
npm run typecheck && npm run lint
```

Check 1440 × 900 and 390 × 844, with the Motion switch on and off. Dev routes: `/dev` (pin test), `/dev/studio?vessel=can|bottle&label=brand|yourlogo` (stills).

## Log

- **17 Oct 2026**:
  - **3D made visible.** The real reason was the reduced-motion setting described above. Added the Motion switch, and reduced motion now still shows the live 3D.
  - **Morpho-style opening and dive** added.
  - **Look and scale:** stronger studio lighting; vessels enlarged; whole-vessel stills replace the cropped photos (the bottle base was cut off).
  - **Brand renamed VERSA → LANGLOK** in site copy and docs. The master plan is now `docs/LANGLOK_Website_Master_Plan.md`. This file was added.
- **16–17 Oct 2026**: Phase 3, the 3D can and bottle spinning with scroll.
- **16 Oct 2026**: Phases 0 and 1; GitHub repo connected (`rifff-fin/langlok`).
