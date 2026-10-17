# LANGLOK website — current status

**Updated:** 17 Oct 2026 · **Branch:** `main` (deployed on Netlify; work continues on `phase-3-3d-products` and is fast-forwarded into `main`)
**Stage:** Phases 0 to 4 done (the hero film is drawn live; the preloader is in). **Next: Phase 5, starting with the Chatak story section.**

> Keep this file current: update it at the end of every piece of work (what changed, what's next, what's blocked).

## What you see now (home page, top to bottom)

0. **Preloader** (first load of the home page): a raindrop falls, ripples and becomes a thin line that fills as the page gets ready; then the mist parts along the line and the can rises into place.
1. **Opening screen**: the live 3D can, large and centred, headline left, serif aside right (the morphowater.com idea). It rises in with a turn, breathes and turns slightly towards the mouse.
2. **The dive** (first scroll): the can tips its lid to the camera, the tab clicks (a small knock and a puff of cold vapour), the opening shows sky ("One small click. *The sky opens.*") and the camera dives in.
3. **The living film**, drawn live in the page, one caption at a time:
   - **The wait**: a misty forest; the Chatak (drawn, animated) sits on a swaying acacia branch, breathing, looking about, crest flicking, while other birds fly past.
   - **The monsoon**: smoky clouds roll in, colours drain to a cool slate (one colour family with the river), wind and rain; he looks up.
   - **The flight**: he opens his wings and flies up into the storm as the camera tilts up.
   - **The first drop**: seen from below, beak open, he catches a raindrop, then flies on up and out of the frame.
   - **The descent** (one unbroken shot, no cut or flash): the camera lets him go and follows the rain down, under the storm, through the bright cloud base, until the valley rises into view and the drop it followed lands in the river.
   - **The river**: the rain has returned, a calm river in a misty valley (unchanged, as asked).
4. **Meet LANGLOK**: the film ends in mist, the can comes back, then glides on to the products (desktop).
5. **Products**: the can, then the bottle, each about 70% of the screen tall, a full turn as you scroll (pinned on desktop), with the spec list.
6. **Your logo here**: can and bottle side by side at true size; one more turn and both come round wearing YOUR LOGO HERE.
7. **Configurator** (05, also on `/custom-branding`): the can glides in from section 04 and stands in the stage, and your design appears on it live:
   - upload a PNG, SVG or JPG logo (checked, sanitised, plain white backgrounds taken out) or type a brand name (Modern or Classic lettering);
   - choose can, bottle or both; silver, white, navy or any colour; logo size and height;
   - drag to turn it (or arrow keys), double-click to face front;
   - **Save preview** downloads a PNG of the 3D view; **Request a quote** takes the design to the form on `/custom-branding` (preview, logo, vessel attached; product filled in).
   - Phones: the stage on top, the controls in four tabs under it. No WebGL: the label is shown flat.
8. **The Chatak story** (06, also `/story`): five chapters in the film's palette (a faint dry-season warmth, the monsoon's slate, washed-clean light). Its two pictures are drawn live with the film's pieces, no photos: he waits on the acacia branch in the misty woods (breathing, looking about, glancing up at the sky); seen from below in the rain, he catches drop after drop. The text was checked against the record and lightly edited (see Log).
9. The other sections (mission, ReCan, why aluminium, who we serve, CTA) are the static layouts with text reveals.

## Done

| Phase | What | Where |
|---|---|---|
| 0 Setup | Monorepo (client + server), Vite/React 19/TS, Tailwind v4 tokens, GSAP + Lenis, lint/format | `main` |
| 1 Skeleton | Every section and route as a static, responsive layout; all copy in `copy.ts` | `phase-1-skeleton` |
| 3 3D products | Procedural can + bottle from the photos, label textures, studio lighting, scroll spins, station router, YOUR LOGO swap | `phase-3-3d-products` |
| 3.1 Showcase | Morpho-style opening + dive, chrome-contrast lighting, bigger vessels, studio stills instead of cropped photos, two-voice headlines, Motion switch, rename to LANGLOK | `phase-3-3d-products` |
| 2 Hero film | The living film: a drawn, animated Chatak (no photos), generated misty forest, monsoon, flight and catch, one continuous descent to the river; captions from the client's story | `phase-3-3d-products` |
| 4 Configurator | Logo upload or brand name on the live 3D can and bottle, backgrounds, size and position, drag to turn, PNG preview, quote form with the design attached (react-hook-form + zod); inner pages lazy-loaded | `phase-3-3d-products` |

## Next

1. **Phase 5 polish**: Chatak story section, ReCan loop drawing, chapter rail ("01 / 07").
2. **Phase 6 backend**: the quote form starts sending (POST /api/inquiries with the logo and the preview); until then its button stays off.
3. Then real assets and performance (7), launch (8).
4. Optional, any time: real AI-generated footage of the same story can replace the drawn film (prompts in `docs/PROMPTS_for_Claude_Code.md`, Part C); the "rain-wash" label swap (plan §7.5 v2).

## Waiting on the client

- **The client questionnaire** (17 Oct 2026, a shared doc: "LANGLOK website: what we need from you"): approvals (the new logo, the story edits, Tetulia instead of "Umm Lajj"), labels, the water and its claims, custom orders, ReCan, contact details, photos, going live.
- **Story text edits** (17 Oct 2026, see Log): confirm them, and the place name (Tetulia instead of the original "Umm Lajj").
- **LANGLOK label artwork.** The can and bottle artwork still prints **VERSA**, so the 3D labels show VERSA. We need the LANGLOK label files (flat, unwrapped). (The logo is ours, designed 17 Oct 2026, and is on the site; the client only approves it.)
- Supplier dimension drawings for the can and bottle (the shapes are traced from photos).
- Lining type before any purity claims; ReCan details; social links; full address and sales email.
- The open questions in master plan §1.3 (bird name, "Umm Lajj", etc.).

## Good to know

- **Windows "Animation effects" off = reduced motion.** On this development PC the setting is off, so browsers ask the site for reduced motion. The site then shows a calm version: no pins or glides, the film's scenes crossfade. Use the **Motion** switch (bottom-left corner) to turn the full version on.
- **The film's bird is drawn in code** (`client/src/film/chatak.ts`), not taken from the client's pictures. Those pictures are references only. Tune its shape at `/dev/bird`.
- **No WebGL**: the plates show studio stills (`client/public/img/stills/`), rendered from the same 3D scene at `/dev/studio`; re-render them after changing the models, labels or lighting.
- Not yet measured: frame rate on real phones (budget ≥ 40 fps mid-range Android).
- Bundle: initial JS 192 KB gz (budget 200); lazy chunks: 3D 271 KB, film 8 KB (+1.1 MB of layers at idle), inquiry form 37 KB (inner pages only), upload 2 KB + DOMPurify 11 KB (only on an SVG upload).
- **Dev server:** lazily imported packages must be in `client/vite.config.ts` `optimizeDeps.include`, or Vite reloads the page the first time one is used (the configurator's design is lost on reload).
- DOMPurify is pinned to 3.4.16 (3.4.17 was five days old when added); bump it after a look at the release notes.
- The configurator's quote form validates as you type but doesn't send yet (Phase 6).

## How to run and check

```bash
npm run dev          # http://localhost:5173 (client) + :4000 (API)
npm run typecheck && npm run lint
python scripts/build-film-layers.py   # only after changing the film's generated layers
```

Check 1440 × 900 and 390 × 844, with the Motion switch on and off. Dev routes: `/dev` (pin test), `/dev/studio` (stills), `/dev/bird` (the film's Chatak).

## Log

- **17 Oct 2026, night**: **deployed on Netlify** (by the user). `netlify.toml` builds the client only (`npm run build -w client`, publish `client/dist`, Node 22), serves every route from `index.html` (also `client/public/_redirects`) and caches hashed assets for a year. `main` fast-forwarded to all the work so far.
- **17 Oct 2026, late night**: **the new LANGLOK logo** (our logo pack, Chatak direction; the client approves it) replaces the text placeholder: the mark + LANGLOK in the header, the full lockup with "INT. COMPANY LTD." in the footer, and the app icon as the favicon and phone home-screen icon. SVG sources kept in `docs/client/logo-pack/`.
- **17 Oct 2026, late night**: **the Chatak story** (start of Phase 5):
  - The client's bird photo and the can-photo crop are gone; both pictures are now drawn live with the film's pieces (`film/vignette.ts`), so the story looks like the film.
  - The section's colours follow the film: no peach, and the monsoon chapter is slate instead of violet (`--monsoon` is now #646C7C).
  - The text was checked against the record: Bengali name চাতক, a summer visitor to Bangladesh, Kalidasa's chatak, farmers reading its arrival as the sign of the monsoon and sowing. A short intro says so. Edits: a fable's opening line; the crest is black, not black and white; no puddles before the first rain; "I drink only what the sky gives"; heavy clouds instead of purple ones; the farmer's line now ends with the sowing. The hero's monsoon caption matches ("Heavy clouds gathered over the fields").
- **17 Oct 2026, late**: **the preloader** (Phase 2 done): the drop, the ripple and the line are in `index.html` (they show before any script); the line fills for the fonts, the can and the live 3D, then the mist parts and the can rises in. Home page only; 1–3 s.
- **17 Oct 2026, night**:
  - **Phase 4, the configurator**: your logo or brand name on the live 3D can and bottle, colours, size and position, drag to turn, PNG preview, and the quote form with the design attached. Edits re-upload only the logo zone of the label; logo and zone canvases stay in main memory, which keeps slider drags at full frame rate.
  - Inner pages are lazy routes now (the form's validation loads with them), so the home page stays within its JS budget.
- **17 Oct 2026, evening**:
  - **The catch → river transition is one continuous shot.** The white flash and crossfade are gone: after the catch the camera follows the rain down through the cloud base, and the followed drop lands in the river. The rain slows while the camera falls with it.
  - **Colours matched:** the monsoon and storm are a cool slate instead of lilac, so the film stays in one family from the forest to the river.
  - **Unchanged:** the river page and everything after it.
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
