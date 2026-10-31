# LANGLOK website — current status

**Updated:** 19 Oct 2026 · **Branch:** `main` (deployed on Netlify; work continues on `phase-3-3d-products` and is fast-forwarded into `main`)
**Stage:** Phases 0 to 4 done (the hero film is drawn live; the preloader is in); the Chatak story is one short section. **Next: Phase 5 polish, and the hero video when it arrives.**

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
4. **Meet VERSA**: the film ends in mist, the can comes back, then glides on to the products (desktop).
5. **Products**: the white VERSA can, then the white VERSA bottle, each about 70% of the screen tall, a full turn as you scroll (pinned on desktop), with the spec list.
6. **Your logo here**: can and bottle side by side at true size; one more turn and both come round wearing YOUR LOGO HERE.
7. **Configurator** (05, also on `/custom-branding`): the can glides in from section 04 and stands in the stage, and your design appears on it live:
   - upload a PNG, SVG or JPG logo (checked, sanitised, plain white backgrounds taken out) or type a brand name (Modern or Classic lettering);
   - choose can, bottle or both; silver, white, navy or any colour; logo size and height;
   - drag to turn it (or arrow keys), double-click to face front;
   - **Save preview** downloads a PNG of the 3D view; **Request a quote** takes the design to the form on `/custom-branding` (preview, logo, vessel attached; product filled in).
   - Phones: the stage on top, the controls in four tabs under it. No WebGL: the label is shown flat.
8. **The Chatak story** (06, also `/story`): one screen instead of five. The drawn film fills the window: the hero film's story played by time, from the wait through the monsoon, the flight and the first drop to the river, once it is well in view; then it stays on the river. The client's story, in about a hundred words (the quote "I drink only what the sky gives" set apart), lies over it down the right side on a veil of mist, with five moments to jump to and a pause button. Phones: the film is the first screen with the title at its foot, and the words follow. Reduced motion: one still (the catch); the moments show their stills.
9. **Leadership** (11): AKM Jobaed Nahid, CEO, and S M Khairul Islam, Managing Director, by name and role, in colour on olive cards in a cream band (the user's palette), beside the offices (Dhaka, Riyadh) and the factory (Panchagarh).
10. The other sections (mission, ReCan, why aluminium, who we serve, CTA) are the static layouts with text reveals. The footer and the contact page list both offices and the factory.

The page colour is a light cool grey (`#DFE4E8`), so the white can and bottle stand out instead of disappearing into a white page.

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

1. **Phase 5 polish**: ReCan loop drawing, chapter rail ("01 / 07").
2. **The hero video** (the user makes it): the script and production brief are in [`VERSA_Hero_Video_Script.md`](VERSA_Hero_Video_Script.md), built for scroll (the master is sliced into ~240 desktop and ~160 phone frames). It opens on why a can, as the client asked (plastic particles in bottled water; plastic never goes away, aluminium comes back as a new can), then the Chatak drinking rain, the source, the plant and the sealed white can. Keyframes, prompts, a frame map, checks and delivery are all in it. There is no paid video plan, so §13 sets out the free route: keyframes from Google AI Studio, clips from the open-source Wan 2.2 first + last frame model (Hugging Face Space or Kaggle), upscaling on the designer's PC. The film should grow from 3 to 5 screens of scroll. It replaces the drawn film after the can opens, in the hero's sky layer; the drawn film stays on in the story section (`film/StoryReel.tsx` uses `film/film.ts`).
3. **Phase 6 backend**: the quote form starts sending (POST /api/inquiries with the logo and the preview); until then its button stays off.
4. Then real assets and performance (7), launch (8).
5. Optional, any time: real AI-generated footage of the same story can replace the drawn film (prompts in `docs/PROMPTS_for_Claude_Code.md`, Part C); the "rain-wash" label swap (plan §7.5 v2).

## Waiting on the client

- **The client questionnaire** (17 Oct 2026, a shared doc: "LANGLOK website: what we need from you"): approvals (the new logo, the story edits, Tetulia instead of "Umm Lajj"), labels, the water and its claims, custom orders, ReCan, contact details, photos, going live.
- **The story text** (about 100 words since 19 Oct 2026, see Log): confirm it, and the place name (Tetulia instead of the original "Umm Lajj").
- **The CEO's initials**: written "AKM Jobaed Nahid" (sent as "Akm"); confirm if he writes A.K.M. or A K M.
- **VERSA label print files** (flat, unwrapped) for a sharper 3D label; the labels are built from photos for now. VERSA is the right name on them (19 Oct 2026). (The LANGLOK logo is ours, designed 17 Oct 2026; the client only approves it.)
- Street addresses, a sales email and social links; confirm the Riyadh number (+966 50 583 4757, given as +966 0505834757).
- The neck and shoulder profiles of the can and bottle (optional): the sizes are now the supplier's, the shapes still traced from photos.
- Lining type before any purity claims; ReCan details; social links; full address and sales email.
- The open questions in master plan §1.3 (bird name, "Umm Lajj", etc.).

## Good to know

- **Windows "Animation effects" off = reduced motion.** On this development PC the setting is off, so browsers ask the site for reduced motion. The site then shows a calm version: no pins or glides, the film's scenes crossfade. Use the **Motion** switch (bottom-left corner) to turn the full version on.
- **The film's bird is drawn in code** (`client/src/film/chatak.ts`), not taken from the client's pictures. Those pictures are references only. Tune its shape at `/dev/bird`.
- **No WebGL**: the plates show studio stills (`client/public/img/stills/`), rendered from the same 3D scene at `/dev/studio`; re-render them after changing the models, labels or lighting.
- Not yet measured: frame rate on real phones (budget ≥ 40 fps mid-range Android).
- Bundle: initial JS 191 KB gz (budget 200; react-helmet-async was dropped for a small `PageMeta`); lazy chunks: 3D 271 KB, film 7 KB (+1.1 MB of layers at idle, shared by the hero and the story's reel), inquiry form 37 KB (inner pages only), upload 2 KB + DOMPurify 11 KB (only on an SVG upload).
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

- **31 Oct 2026**: **"Meet VERSA" shows both vessels.** The scroll graphics tried there (halo, orbit, floor rings, rain) were removed at the user's word. The bottle now stands beside the can at their true sizes (a new `hero-bottle` anchor; plate heights in the frames' ratio). The can glides on to its Products panel as before; the bottle scrolls away with the section and comes back at its own panel (a cut while unseen). The film's controls (Play / Sound) now fade with the film as the beat arrives; before, they hung over "Meet VERSA". Typecheck and lint clean; checked at 1440 and 390, motion on and off; no console errors. **Not pushed.**
- **30 Oct 2026, can edges**: the partner cans' sides looked pixelated (the cut-out's matte is ragged). `build-partners.py` now redraws each upright can's edges: every row's left/right and every column's top/bottom are traced, smoothed and drawn back anti-aliased, pulled in 1.5 px off the backdrop's light fringe; the photo turns with the backdrop colour in its corners (no dark fringe). **Not pushed.**
- **30 Oct 2026, partners redesign**: **Who we serve redesigned.** Hotels and Food franchises are now large panels: the partner's can standing on a soft shadow on the left; number, title, line and "Already working with" + the partner's logo on a white tile on the right. Events and Venues follow as slim cards with a plain can; the separate logo row is folded into the panels. Both cans now stand upright (`build-partners.py` finds each can's long axis from its outline and turns it vertical: Six Seasons was 10.4° off) with a cleaned edge. Checked at 1440 and 390. **Not pushed.**
- **30 Oct 2026, partners**: **Who we serve shows real work.** The Hotels card shows the Six Seasons Hotel can and the Food franchises card the Gulf Toledo Restaurant can ("For …" in the corner); under the cards, "Already working with" and both logos on white tiles. Pictures from the user in `docs/client/partners/`, prepared by `scripts/build-partners.py`; names and alt text in `copy.ts`. TODO(client): confirm both partners are happy to be shown. Checked at 1440 and 390. **Not pushed.**
- **30 Oct 2026, last**: **Depth pass** (the user: "it looks bad in my eye"). The olive was one flat mid-tone everywhere, the lime looked acid on green, the hero had too many layers, and the pale story film sat like a foreign block.
  - **The page is lit:** #556B2F where a light falls from above, deepening to #33431B at the edges and foot, with a fine film grain (no lattice). Bands are translucent shades over it.
  - **Champagne** (#E6D3A3) replaces lime for the big numerals, accents and links; deeper cards and footer.
  - **Hero:** a studio sweep (dark above, a lit pool behind the can, a dark floor), three faint rings at the base, VERSA as a faint filled emboss; text measured at 7.2:1 or more. Larger header logo.
  - **Story film** toned olive with a multiply layer.
  - Typecheck and lint clean; checked at 1440 and 390, motion on and off; no console errors. **Not pushed.**
- **30 Oct 2026, late night**: **New logo, and the hero refined.**
  - **The LK logo pack** (from the user, based on the client's reference) replaces the Chatak logo: copied to `docs/client/logo-pack-lk/`; the header and footer use its white lockups (`client/public/brand/langlok-lk-*.svg`; the header one without the small "INT. COMPANY LTD." line); the favicon is the teal LK mark, the touch icon the white mark on olive. The old Chatak files are gone from `public/brand/` (the pack stays in `docs/client/logo-pack/`).
  - **Hero, from the user's review:** the outlined VERSA is fainter (half the opacity) and moved low and to the left, off the can and the words; the ground darkens to the darker olive where the words sit (cream on it 7:1 or more; phones darken at the top); a soft light behind the can and faint rain rings on the floor round its base; the left and right copy sit further out; secondary text is brighter site-wide (`--slate` #F2F3E4, 5.3:1 on the page).
  - **Header:** quieter links; "Request samples" is a solid cream pill (all buttons are pills now).
  - **Ground shadow** under the can and bottle: darker and softer, olive-black instead of navy.
  - Typecheck and lint clean; checked at 1440 and 390, motion on and off; no console errors. **Not pushed.**
- **30 Oct 2026, night**: **Olive, and a shorter film stretch.** The light green made the white can look washed out; the user gave an olive palette (#556B2F page, #6B8E23 accent, #3B4D20 depth) and a list of things to aim for.
  - **The whole site in olive** (`tokens.css`): cream text, lime accents, the darker olive for cards, bands, the leadership band and the footer. The loading screen, theme colour, film mist and saved preview match. Every text colour is 4.5:1 or more on its ground.
  - **Texture:** a faint diamond lattice (the cap's knurl) over the page.
  - **The opening screen, layered:** an olive light behind the can, a stronger lattice, VERSA huge in outline behind the can, and the headline in Bodoni (high-contrast serif) lying over its edge.
  - **Header:** the pack's white lockup (`langlok-logo-header-white.svg`, cut like the header logo); links draw a fine underline on hover and under the current one; "Request samples" is a solid cream button.
  - **Film stretch:** `HERO_SCROLL_VH` 400 → 280, so the video holds the screen for about one scroll, not two.
  - **Open:** the Chatak story's drawn film is still pale misty grey, a bright block on olive; it could be tinted to match.
  - Typecheck and lint clean; checked at 1440 and 390, motion on and off; no console errors. **Not pushed.**
- **30 Oct 2026, evening**: **The client's green theme**. The client sent the theme gradient **#A8C970 → #378201**; the user chose a light page with full green bands.
  - **Page:** a light tint of the green (`--mist #DAE7C3`), green-black text, deep green accents (`tokens.css`; new `--grass-*` tokens and `bg-grass-*` colours). The loading screen, theme colour, film mist and saved preview match.
  - **Green bands:** the opening screen's backdrop (the can in a soft white light; its words now in ink), the CTA band (light green at the words, deepening downwards) running on into the footer, which is deep green with the logo pack's white lockup (`Logo variant="light"`) and white text (4.8:1; cream would be 4.5:1).
  - The footer has room under its last line for the Motion switch. Leadership keeps its olive band.
  - Typecheck and lint clean; checked at 1440 and 390, motion on and off; no console errors. **Not pushed.**
- **30 Oct 2026, later**:
  - **The hero video.** The user's film (`main product info/final english2.0.mp4`, 75.6 s, 180 MB; not the final cut) replaces the drawn film after the can opens.
    - **Web versions** in `client/public/video/`: 24.8 MB at 1080p, 10.5 MB at 720p for phones, both with sound, plus a poster. Made with `ffmpeg -i master.mp4 -c:v libx264 -preset slow -crf 26 -vf scale=1920:-2 -c:a aac -b:a 128k -movflags +faststart hero-1080.mp4` (720p: `crf 28`, `scale=1280:-2`, `96k`).
    - **How it plays.** It opens out of the can's mouth, plays muted while on screen, pauses when you scroll away, and has a sound switch, a progress line and "watch again". The wait / monsoon / first drop / river captions are gone. The hero is shorter (`HERO_SCROLL_VH` 500 → 400: about two screens of film), then "Meet VERSA".
    - **For the next cut:** its end card shows a "K" LANGLOK logo, not the logo pack; a vertical (9:16) version would stop phones cropping the on-screen text.
  - **The whole site in the user's green palette**: sage-mist page `#DCDDC5`, cream cards, olive-black text, deep olive accents, lime highlights. The loading screen, the theme colour, the film's mist and the saved preview match; the configurator's swatches keep the label's real colours.
  - Initial JS 192 KB gz. Checked at 1440 and 390, motion on and off. **Not pushed.**
- **30 Oct 2026**: **Leadership in colour, on the user's palette**:
  - **Portraits.** Colour cut-outs on a transparent background, with a new, sharper CEO photo, brightness matched (`scripts/build-portraits.py`).
  - **Cards.** They stand on olive with a soft lime light and rain rings, in a cream band with large sage ripples.
  - **Colours.** New tokens: cream, sage, olive, deep olive, lime. Text is deep olive (8.9:1 on cream); olive and sage are for graphics only (too pale for small text).
  - **Not pushed.**
- **21 Oct 2026, later**: **full site check** on the production build: every route at 1440 and 390, with motion on and off.
  - **Clean:** no console errors, no failed requests or broken images; the accessibility audit (axe) is clean; the dev pages show "not found" in production. Layout shift is 0.003 on desktop and 0.02 on phones; the largest paint is 0.6 s on desktop.
  - **Fixed:**
    - Every page carried the same old LANGLOK description first (a second, correct one was added below it). Now there is one description per page plus link-preview tags, and `index.html` has the VERSA wording.
    - The footer's Facebook, X and Instagram placeholders went nowhere; the column waits for real links.
    - The mission stages' sideways row on phones is reachable by keyboard.
    - The home page fetches the can's still with the scripts.
  - **Open:**
    - On a slow phone (4× CPU, ~2 Mbit/s) the largest paint is ~2.7 s against 2.5: React builds all 11 home sections at once. Fix: build the sections below the first screen a moment later.
    - The 2.7 MB of placeholder hero frames (`client/public/frames/`) ship with every deploy unused.
  - **Not pushed** (the user's call).
- **21 Oct 2026**: **the navbar, smarter and working properly**:
  - **Behaviour.** It is clear over the opening can, slides away while you scroll down (the films and pinned sections get the whole window) and comes back the moment you scroll up. It lights the section you are in (Products, Your brand, The Chatak, ReCan), on phones too.
  - **Fixed.** Products from another page landed short; Products clicked again did nothing; the logo didn't go back to the top; a fresh `/#products` landed in the wrong place; pages opened partway down if a scroll was still gliding, or where you last left them. Back now returns where you were.
  - **Also fixed.** A crash ("reading 'end'") when the home page was built already scrolled down: the reveal animations no longer remove themselves mid-refresh.
  - **Checked** at 1440 and 390, with motion on and off.
- **20 Oct 2026, night**:
  - **True sizes**: the can is now the supplier's standard 500 ml can, Ø 66 × 168 mm (it was traced 64 × 181 mm), and the bottle Ø 80 × 265 mm with its cap. The labels were rebuilt with the artwork scaled evenly (it keeps its shape, slightly narrower around the can), the studio stills re-rendered, and the spec lists show the sizes.
  - **New Managing Director portrait**: S M Khairul Islam's studio photo replaces the street photo, built the same way as the CEO's (`scripts/build-portraits.py`), so the two now match.
- **20 Oct 2026, evening**: **a free way to make the hero video** (the designer has no paid video plan). The laptop (RTX 3050, 4 GB) can't run video models; Higgsfield has 0 credits; the free tiers of Kling, PixVerse, Hailuo and Vidu are watermarked. Recommended: Wan 2.2 first + last frame (open source, no watermark) on Hugging Face's free GPU (2–3 clips a day) or Kaggle (~30 h a week), keyframes from Google AI Studio, frames upscaled with Upscayl. Timing checked in `Hero.tsx`: the film now spans 3 screens (0.9 → 3.9); a five-act film wants 5 (`HERO_SCROLL_VH` 700). Script §13.
- **20 Oct 2026, later**: the video script gets a quick version (§12): one prompt for Google AI Studio (Veo 3.1) with the three reference pictures, run as an 8 s part plus three 7 s extensions (about 29 s, one unbroken take).
- **20 Oct 2026**: **the hero video script, second draft**, made for scroll: every frame must work as a still, slow moves and slow motion so ~6 sampled frames a second still scrub smoothly, holds where the words sit, no dissolves, and a frame map (240 desktop / 160 phone frames, progress windows for the words). It opens on why a can, for health and the environment: particles in bottled water (2024 PNAS study), plastic that never goes away (UNEP), aluminium recycled into a new can (International Aluminium Institute). The new can's water mirrors the sky, and the story flows on: the Chatak drinks, a drop from his beak falls to the earth, the source, the plant, the sealed can. Health is shown, not claimed.
- **19 Oct 2026, late night**: **the hero video script** (`docs/VERSA_Hero_Video_Script.md`), for the user to make the video with Claude in the browser and an AI video tool. The story: plastic particles in bottled water (the client's request: the microplastic problem first) → up to the monsoon sky → the Chatak drinks the rain → it sinks into the earth (sourcing) → the plant (managing) → a white aluminium can is filled and sealed → mist, where the website's live VERSA can takes over. Ten keyframes and nine clips with ready prompts, the look, the checks, draft captions with the 2024 PNAS study cited, the claims to avoid and the questions for the client (source, process, can lining).
- **19 Oct 2026, night**: **the story's film fills the window** (asked): the words lie over it down the right side on a veil of mist, and its top and bottom fade into the page. Still one screen at 1440 × 900. Phones: the film is the first screen with the title and the controls at its foot (clear of the Motion switch), then the words. The `/story` page opens on it.
- **19 Oct 2026, evening**: **Leadership names** shown under the portraits: AKM Jobaed Nahid (Chief Executive Officer) and S M Khairul Islam (Managing Director).
- **19 Oct 2026, later**:
  - **The Chatak story is one short section** (it was five full screens, too long a scroll): the client's story in about a hundred words in one place, the quote set apart, beside the drawn film of it. The film is the hero's (which will become a video): played by time in a frame, from the wait to the river, with five moments to jump to and a pause button. The old drawn pictures (`film/vignette.ts`) are gone.
  - **Darker page**: the page is a light cool grey (`#DFE4E8`, was near-white `#F3F5F6`) so the white can and bottle stand out. Secondary text, hairlines and the footer/ReCan band deepened with it to keep their contrast; the film's ending, the preloader and the saved configurator preview match. Sections 01–05 are otherwise unchanged.
- **19 Oct 2026**:
  - **Names corrected**: LANGLOK is the company, **VERSA** its premium water. The product is called VERSA across the site ("Meet VERSA", "VERSA Can", "Bring VERSA to your venue"); the 3D labels already printed VERSA.
  - **White can and bottle**, like the client's photo: the VERSA artwork on a matte white basecoat, rims and lid bare aluminium. The configurator and YOUR LOGO HERE start from white. Studio stills re-rendered.
  - **Offices**: Dhaka (Uttara, +880 1712-726628, WhatsApp Business) and Riyadh (Al Olaya, +966 50 583 4757); factory in Panchagarh, Rangpur. On the contact page and in the footer.
  - **Leadership** section (11): the CEO and the Managing Director, roles only, as matching black-and-white portraits (`scripts/build-portraits.py`).
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
