# LANGLOK — Prompts for Claude Code (VS Code) and AI video

> Updated 17 Oct 2026: the brand is **LANGLOK** (it was VERSA in the first draft; the label artwork still prints VERSA). The opening now follows the **morphowater.com** reference (master plan §2.5). Progress: [`STATUS.md`](STATUS.md). Phases 0, 1 and 3 are done, and the hero film is built as a **living film drawn in code** (no footage needed): the Chatak waits in a misty forest, flies into the monsoon, catches the first drop, and the rain becomes a river.

Three parts:
- **Part A** — how to set up the repo so Claude Code always has the context
- **Part B** — the master prompt, then one prompt per build phase
- **Part C** — prompts for the AI stills and video shots of the hero film

---

## Part A — Setup (once)

1. Create the project folder `langlok/` and open it in VS Code.
2. Put **`CLAUDE.md` in the root**. Claude Code loads it automatically at the start of every session, so the brand rules, stack and architecture rules are always in context.
3. Create `langlok/docs/` and put **`LANGLOK_Website_Master_Plan.md`** and this file in it.
4. Put the client assets in `langlok/client/public/img/` (can/bottle photos, logo image, bird art when you get it) and the two text files in `langlok/docs/client/`.
5. Work **one phase at a time**. Start each phase in plan mode (or ask "plan first, don't edit yet"), read the plan, then let it build. Check the result in the browser before moving on.
6. Commit after every phase (`git init` in phase 0) so you can roll back.

Tips that save time:
- Paste screenshots into the prompt when something looks wrong; it is faster than describing it.
- If a section drifts from the brand, say: *"Re-read CLAUDE.md 'Never' list and fix this section."*
- Keep sessions focused; start a fresh one per phase.

---

## Part B — Prompts

### B0. Master prompt (paste first, in a new session)

```text
You are building the website for LANGLOK, a premium natural drinking water sold in
aluminium cans (500 ml) and aluminium bottles (990 ml) by Langlok Int. Company Ltd.
of Panchagarh, Bangladesh. Read CLAUDE.md and docs/LANGLOK_Website_Master_Plan.md
fully before doing anything.

THE FEELING
Monsoon Light. The site should feel like the first cool morning after rain in the
tea gardens of Tetulia: bright, misty, quiet and expensive. Brushed aluminium,
condensation, soft daylight, navy ink, a single drop of rain blue. Editorial like a
fine magazine, not a tech demo. Light backgrounds always. Nothing dark, nothing neon,
nothing that looks like the ten other 3D sites people have already seen.

THE STORY
The Chatak, the pied cuckoo on our can, waits all summer and drinks only rain that
falls straight from the sky. That faith is our promise: pure water, a vessel that
never becomes plastic waste, and every can coming home through ReCan. Every section
should answer to that idea: Sky → Earth → Vessel → Your brand → Return.

THE EXPERIENCE
1. The first screen is the live 3D can, large and centred (the Morpho reference). Scroll
   tips its lid to the camera, the tab clicks open and the camera dives into the opening.
2. "Sky to Seal": a scroll-scrubbed film (canvas image sequence) from monsoon clouds,
   through rain, earth and a bright filtration hall, to one silver can rising from mist.
   It starts where the dive ends: pale sky seen through the can's opening.
3. The film hands off seamlessly to a live 3D can (React Three Fiber) that spins with
   scroll, followed by the 990 ml bottle.
4. Both vessels spin again and come round showing "YOUR LOGO HERE": any hotel,
   franchise, event or venue can have LANGLOK under its own brand.
5. A live configurator where a visitor uploads their logo and sees it on the can and
   bottle, then requests a quote.
6. The Chatak story told in five scroll chapters, rain that follows scroll speed.
7. Mission, the five-stage service strip, the ReCan loop, why aluminium, who we serve,
   and a calm, confident call to action.

HOW TO WORK
- Follow the architecture rules in CLAUDE.md exactly (one WebGL canvas, ScrollTrigger
  writes / useFrame reads, procedural Lathe models, copy in content/copy.ts).
- Build in the phases listed in the master plan, one phase per session.
- Mobile is not an afterthought: check every step at 390×844 and 1440×900, and with
  prefers-reduced-motion on.
- Craft over quantity: one perfectly smooth interaction beats five janky ones.
- When a brand fact is unclear, leave a TODO(client) comment; never invent numbers.

For now: confirm you have read both documents, list any conflicts or open questions
you see, then propose the Phase 0 plan. Do not write code yet.
```

### B1. Phase 0 — Setup

```text
Phase 0: project setup. Follow docs/LANGLOK_Website_Master_Plan.md §5.

1. Create an npm workspaces monorepo: client/ (Vite + React 19 + TypeScript) and
   server/ (Express 5 + TypeScript), root scripts dev/build/lint/typecheck, running
   client and server together in dev.
2. Install client deps: three, @react-three/fiber, @react-three/drei, gsap, @gsap/react,
   lenis, zustand, maath, react-router, react-helmet-async, react-hook-form, zod,
   and Tailwind v4 (tokens defined as CSS variables in styles/tokens.css).
3. Create styles/tokens.css with the exact tokens from CLAUDE.md, fonts.css loading
   Bodoni Moda, Jost and Noto Serif Bengali (display=swap, preconnect), globals.css
   with a mist background and ink text.
4. lib/gsap.ts registers ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin
   once. lib/lenis provider wires Lenis to the GSAP ticker as described in CLAUDE.md.
5. Create content/copy.ts with every heading and paragraph from master plan §4.3,
   plus the client's mission and story text from docs/client/.
6. Create scripts/make-placeholder-frames.sh and scripts/extract-frames.sh from plan
   §6.5–6.6 (desktop + mobile + poster). Run the placeholder script.
7. Add a /dev route with one pinned test section to prove Lenis + ScrollTrigger pinning
   works on desktop and on a touch device emulator.
8. git init, .gitignore, .editorconfig, ESLint + Prettier, README with commands.

Done when: npm run dev serves the client; /dev pins smoothly; typecheck and lint pass.
```

### B2. Phase 1 — Static skeleton

```text
Phase 1: build every home section as a static, responsive layout. No scroll
animation, no 3D yet. Follow master plan §3 (design system) and §4.3 (section specs).

- One file per section in client/src/sections/, composed in order in Home.tsx.
- UI primitives in components/ui/: Eyebrow (tracked uppercase Jost), Hairline (1px
  aluminium rule), ChapterNumber, Button (primary ink, secondary outline), Container.
- 12-column grid, max width 1440, fluid margins, fluid type scale with clamp().
- Pinned sections get their final heights now (use svh/lvh) so later phases don't
  reflow the page.
- Use the product mockup photos from public/img as temporary stand-ins where 3D will go.
- All text comes from content/copy.ts.
- Footer with "Manufactured in Panchagarh, Bangladesh by Langlok Int. Company Ltd."

Design bar: it should already look like a premium print magazine with zero motion.
Check 390×844, 768×1024, 1440×900. Show me screenshots of the hero, products and
story sections at 390 and 1440.
```

### B3. Phase 2 — Hero: the living film (built) and the preloader

Built on 17 Oct 2026, differently from the original plan: there is no video. The film is drawn
live in a 2D canvas (`client/src/film/`). The world comes from generated layers
(`scripts/build-film-layers.py`). The Chatak is an animated silhouette drawn in code
(`film/chatak.ts`), referenced from the client's two bird pictures, as the client asked: no
photos in the film. See master plan §4.3 for the scenes and captions. Still to do here:

```text
Phase 2 remainder: the preloader. A drop falls and becomes a thin progress line; it waits
for fonts, the hero still of the can and the film's layers; min 600 ms, max 3 s. Keep the
opening screen (the live 3D can) the first thing people see.
```

### B4. Phase 3 — 3D can and bottle (done)

Built on branch `phase-3-3d-products`; see CLAUDE.md "3D vessels" for how it works as built
(profiles from the photos, label on the lathe body, station router, studio stills, Motion
switch). The prompt below is kept for reference.

```text
Phase 3: the products in 3D. Follow master plan §7.1–7.5 and §7.7.

1. three/Scene.tsx: the single fixed, transparent R3F Canvas behind the DOM,
   dpr [1, 1.75], PerformanceMonitor, AgX or ACES tone mapping, frameloop paused when
   no 3D section is on screen (driven by the store).
2. three/profiles.ts: parametric canProfile() and bottleProfile() (start from plan
   §7.2; constants in one place, TODO(client) for supplier dimensions).
3. Can.tsx and Bottle.tsx: Lathe body + open-cylinder label band (thetaStart Math.PI,
   radius × 1.002) + lid/pull-tab or ribbed cap. 1 unit = 1 cm.
4. materials.ts: brushed aluminium (MeshPhysicalMaterial, metalness 1, roughness ~0.3,
   brushed roughness map, light clearcoat); label ink material (metalness 0.15,
   roughness 0.45, transparent). Droplet normal map on both, slowly sliding on idle.
5. Lighting.tsx: drei Environment built from Lightformers (two tall soft strips, one
   top), ContactShadows on a paper-coloured floor. No real-time shadows.
6. labelTexture.ts: load the four label PNGs (use generated placeholders with the LANGLOK
   layout until client files arrive), sRGB, anisotropy, created once.
7. Products section: ScrollTrigger writes progress to the store; the can spins 0→2π
   with maath easing.damp; callouts animate in; then the camera eases and the bottle
   enters and spins. Idle ±6° sway.
8. Handoff: at hero progress 0.97–1 the frame canvas fades out and the 3D can fades in
   at the same position/scale/angle. Add a dev-only "capture handoff pose" button that
   saves a PNG so the final video frame can be matched. A drop falls into the can.
9. Fallbacks: no WebGL → mockup images; low tier → 64 segments, DPR 1.25.

Done when: the can looks printed and metallic (not a pasted sticker), spins at 60fps on
desktop, and the handoff is invisible at normal scroll speed.
```

### B5. Phase 4 — "Your logo here" and the configurator (built)

Built 17 Oct 2026 (master plan §4.3-05, §7.6 "as built"). Two departures from the prompt below: the preview turns by dragging the stage (drei `PresentationControls` can't receive events, as the one canvas sits behind the DOM), and the quote is not sent until the API exists (Phase 6). The v2 rain-wash swap is still open.


```text
Phase 4: the B2B moment. Follow master plan §4.3 (04–05), §7.5 and §7.6.

1. YourLogo section: both vessels side by side; one more full spin with scroll; swap the
   label map to the YOUR LOGO HERE texture when progress crosses 0.5 (front facing away),
   swap back when crossing back. Headline and CTA from copy.ts.
2. Configurator (section + /custom-branding route):
   - Upload PNG/SVG/JPG ≤5MB (validate type by content, sanitize SVG with DOMPurify) or
     type a brand name.
   - Offscreen canvas composes the YOUR LOGO template + uploaded logo (fit-contain,
     scale and vertical offset sliders) + background (silver/white/navy/custom hex).
   - That canvas is a CanvasTexture shared by can and bottle; debounce redraws and set
     needsUpdate only after a redraw.
   - Vessel toggle: can / bottle / both. drei PresentationControls with limited polar
     angle; double-click resets. Keyboard: arrows rotate, +/- scale the logo.
   - "Save preview" exports a PNG of the 3D view.
   - "Request a quote" opens the inquiry form (react-hook-form + zod schema in a shared
     file) prefilled with vessel and attaching logo + preview.
3. v2 stretch (only if everything above is solid): rain-wash shader swap from plan §7.5.

Done when: a transparent PNG logo and an SVG logo both appear crisp and correctly
positioned on both vessels, on desktop and mobile.
```

### B6. Phase 5 — Chatak story, Mission, ReCan, Why aluminium, Who we serve

```text
Phase 5: the narrative sections. Follow master plan §4.3 (06–11).

1. ChatakStory: five pinned chapters from copy.ts; background gradient from pale sky to
   --monsoon and back to washed light; bird illustration layers (placeholder silhouettes
   until client art arrives, TODO(client)); "চাতক" in Noto Serif Bengali beside "Chatak".
   Rain particles in the shared R3F canvas (instanced streaks) whose density and streak
   length follow Lenis velocity, damped. Final chapter: the bird lifts and one drop falls
   into its beak.
2. Mission: large Bodoni statement, mission paragraph, then a horizontal-scroll strip of
   five stages (Design, Production, Delivery, Storage, Recycling) with line icons.
3. ReCanLoop: SVG circle that draws on scroll (DrawSVG), a can icon travelling it
   (MotionPath), four labelled stages, partner CTA to /recan. Counters only render if
   /api/stats returns non-zero values.
4. WhyAluminium: three cards with footnoted, careful claims (no absolute health claims).
5. WhoWeServe: four tall cards (hotels, food franchises, events, venues), hover tilt,
   each showing a branded can with a placeholder partner logo.
6. Water-level clip-path transition between Mission and ReCan.
7. Reduced-motion versions of all of the above.

Done when: every section reads well as plain text with motion off, and feels alive
(not busy) with motion on.
```

### B7. Phase 6 — Backend

```text
Phase 6: the MERN backend. Follow master plan §8.

1. server/: Express 5 + TypeScript, helmet, CORS allowlist from CLIENT_ORIGIN,
   express-rate-limit on POST routes, JSON size limits, central error handler, /api/health.
2. Mongoose models: Inquiry (fields from plan §8.2), Subscriber, Stat.
3. POST /api/inquiries: multer memory storage; detect real file type; rasterize SVG to
   PNG with sharp; upload logo and preview to Cloudinary or R2; validate with the shared
   zod schema; honeypot + Turnstile check; save; email sales inbox + auto-reply.
4. POST /api/recan/partners, POST /api/newsletter (double opt-in), GET /api/stats.
5. Admin: login with hashed password → JWT in httpOnly cookie; GET/PATCH
   /api/admin/inquiries with filters and pagination; a simple /admin page in the client.
6. .env.example with every variable from plan §8.3; README section on deployment.
7. Wire the client forms to the API with optimistic UI, clear success and error states.

Done when: submitting the configurator with a logo creates a Mongo document, stores both
images, sends the email, and shows in /admin.
```

### B8. Phase 7 — Real assets, performance, accessibility, SEO

```text
Phase 7: polish and ship-readiness. Follow master plan §9 and §11.

1. Swap in real hero frames (run scripts/extract-frames.sh on the master), real label
   files and bird art; verify the handoff pose against the final frame.
2. Compress textures to KTX2; lazy-load the 3D chunk after the first hero frames; check
   bundle sizes against the budgets.
3. Test on a mid-range Android and an iPhone (real devices or BrowserStack): 3D ≥40fps,
   no address-bar jumps in pinned sections, fog works with touch.
4. Accessibility: focus states, skip link, keyboard configurator, aria-hidden canvases
   with text alternatives, contrast check, reduced motion everywhere.
5. SEO: per-route titles/meta, OG image, Organization + Product JSON-LD, sitemap, robots;
   prerender the marketing routes.
6. Error boundaries around the 3D scene with static fallbacks.

Report a before/after table of Lighthouse scores (mobile) and bundle sizes.
```

---

## Part C — AI stills and video for the hero film (optional upgrade)

The hero film is drawn live (Part B3), so none of this is needed for launch. Use these prompts only if real footage is wanted later. Keep the film's story, so the captions still fit:
- the forest and the waiting Chatak;
- smoky monsoon clouds;
- the flight and the first drop;
- the river in mist.

Never let the tool draw the logo or the label. You can give it the client's bird pictures as **style references**, but don't use them as frames.

Use the **same style block** at the start of every prompt so the shots match. Generate the **key stills** first, then animate between them with **image-to-video, first-frame + last-frame** mode (shot N: first frame = still N, last frame = still N+1).

### C1. Style block (prefix every prompt)

```text
Cinematic, photoreal, natural daylight in the monsoon in northern Bangladesh. Bright, airy,
high-key, soft mist, cool silver-green palette, no crushed blacks, no harsh contrast. Clean
and calm, a premium nature film. Shot on a large-format cinema camera, shallow depth of
field, slow steady camera movement. Subject kept in the centre third of the frame
(vertical-crop safe).
```

### C2. Negative prompt (where the tool supports it)

```text
text, letters, logos, labels, watermarks, people, dark scenes, night, neon, fast camera
moves, shaky camera, flicker, cuts, morphing animals, extra limbs, plastic, cartoon,
oversaturated colours, lens dirt
```

### C3. Key stills (image model)

| # | Prompt (after the style block) |
|---|---|
| 1 | Soft white cloud seen from inside, glowing, pale blue above. |
| 2 | A misty forest of tall thin trees at dawn, warm light shafts from the upper right; on a bare acacia branch with small pinnate leaves sits a pied cuckoo (Jacobin cuckoo): black upperparts, white throat and breast, tall swept-back black crest, long graduated tail with white tips, in profile facing right. |
| 3 | The same forest and bird, the light gone cool and purple-grey as dark smoky monsoon clouds roll in over the canopy; the cuckoo looks up, crest raised. |
| 4 | Looking up into grey-violet storm clouds, rain falling towards the camera; the pied cuckoo flying straight up, seen from below: white body, black wings with a white crescent near the tips, long dark tail with white tips. |
| 5 | The same bird from below, beak open, a single clear raindrop just above its beak. |
| 6 | A calm river in a wide misty valley, layered treelines on the far bank reflected in still water, gentle rain rings on the surface. |

### C4. Video shots (image-to-video)

Settings: 16:9, 1080p or 4K, 24 or 30 fps, ~4–5 s each, low motion strength, camera movement described explicitly.

| Shot | First → last still | Motion prompt (after the style block) |
|---|---|---|
| 1 Cloud | 1 → 2 | Slow descent through soft cloud that thins to reveal the misty forest and the cuckoo on its branch. |
| 2 Wait | 2 → 3 | Very slow push in on the bird; it turns its head, breathes; mist drifts; the light cools as clouds arrive. |
| 3 Flight | 3 → 4 | The cuckoo opens its wings and lifts off; the camera tilts up to follow it into the storm. |
| 4 Drop | 4 → 5 | The bird climbs, beak opening; one raindrop falls into its beak. |
| 5 River | 5 → 6 | The camera follows the rain down through mist to the river in the valley. |

Tool notes (October 2026): Google Veo 3.1 (via Flow) for the most realistic result; Kling 3.0 for value, native 4K and liquid motion; Runway Gen-4.5 when you need precise camera or keyframe control. Sora is shut down. Use a paid plan for commercial rights.

### C5. After generation

1. Join the clips in DaVinci Resolve or CapCut, trim morphing frames at the joins, stabilize, grade to the Monsoon Light palette (lifted shadows, cool soft highlights), remove audio.
2. Export `hero_master.mov` (ProRes 422 or H.264 ≥ 40 Mbps).
3. In the repo: `bash scripts/extract-frames.sh hero_master.mov`, then swap the drawn film for a frame player in the same sky layer (`[data-hero-sky]`), keeping the captions' timing (`film/timeline.ts`).

### C6. Note for the label designer

Ask for two label variants per vessel at the exact wrap size (width = circumference, height = printable band), PNG with transparent background at 4096 px wide:
- **LANGLOK** (flat and unwrapped; the current artwork prints the old VERSA wordmark, so it needs the new name)
- **YOUR LOGO HERE** (same layout; the bird + wordmark zone replaced by a refined dashed frame and the words YOUR LOGO HERE in the brand typography)
