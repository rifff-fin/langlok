# VERSA hero video: script for a scroll-driven film

**For:** whoever makes the video (Claude in the browser, working in an AI video tool, with the site's designer).
**Version:** 19 Oct 2026, second draft (built for scroll; it opens on why a can), for the client's approval.
**Website:** ______________________ (paste the link; the film plays on the home page right after the can opens)

---

## 0. Start here

You will be given:

1. **This file.**
2. **The Chatak reference photo(s):** the pied cuckoo. Use them as references for the bird's plumage only, never as frames.
3. **The VERSA can and bottle photos**, plus the site's studio renders `/img/stills/can-brand.webp` and `/img/stills/bottle-brand.webp` (open them on the website). They are the true shape and colour: a matte white body with a bare aluminium rim, lid and cap.
4. **The website link.** Open the home page and scroll slowly through the top. The live 3D can tips its lid and the camera dives into the opening. This film starts at that moment and ends where "Meet VERSA" brings the can back. Note the colours: the page is a pale cool grey.

Your job:

- Make the **keyframe stills K1–K13**, then animate between them as **clips S1–S12**, in the tool the user has open.
- Use the style block, the shot prompts and the negative prompt below exactly.
- Check every result against the checks in §6, and redo what fails.
- Download the takes you pick, named as in §9.
- Tell the user what is done and what still needs a retake.

**Three rules matter more than anything else:**

1. **It becomes frames.** The finished video is cut into about 240 still frames, and scrolling moves through them, forwards and backwards. Every frame must be a good still, and everything must move slowly and smoothly (§2).
2. **One unbroken camera move.** No cuts, no flashes, no dissolves. Each act hands over to the next through a physical move (§1).
3. **No text, letters, logos or label lettering anywhere.** AI mangles lettering. The website shows the real VERSA label on its live 3D can as soon as the film ends.

> **A message the user can paste with the attachments:**
> "I'm making the hero film for our website. Attached: the production script (VERSA_Hero_Video_Script.md), reference photos of the Chatak (pied cuckoo), and the VERSA can and bottle. The website is [link]: the film plays after the can opens at the top of the home page, and it will be cut into frames that play as you scroll. Please read the whole script first. Then, in [tool], generate the keyframe stills K1 to K13 in order and show me each one. Once I approve them, generate clips S1 to S12 with first and last frames as described. Follow the style block, the negative prompt, the scroll rules and the checks exactly. Never put text, logos or label lettering in anything you generate."

---

## 1. The story: one thread, five acts

> **Look closer at bottled water: tiny plastic particles. Plastic never really goes away; aluminium comes back as a new can. That can holds the sky's water: the rain the Chatak drinks, which sinks into the earth of the north, is drawn from the source with care, and is sealed in a white aluminium can. Then the live VERSA can on the website takes over.**

**Why this order:**

- **The client** asked (19 Oct 2026) to begin with the microplastic problem: why a can is better, for health and for the environment.
- **The designer's** idea follows: the Chatak drinking the rain, and that same water being sourced, managed and packed as VERSA.

**The thread:** the camera always follows the water or the vessel. Every act ends exactly where the next begins, so the film is one journey. It opens and closes on a can.

| Act | What it says | What we see | How it hands over |
|---|---|---|---|
| **I. Why a can** (S1–S5) | Plastic bottles leave tiny plastic particles in the water, and plastic never really goes away. Aluminium is recycled again and again. | Particles drifting in water inside a plastic bottle. The bottle beside a white can. The bottle crumbles into particles while the can stays clean. The can's metal melts into liquid silver and becomes a new can. | Down into the new can's open mouth, where clear water mirrors the sky. |
| **II. The sky's water** (S6–S8) | The best water starts as rain: the Chatak drinks only what the sky gives. | Through the reflection into the monsoon sky, down with the rain to the Chatak, beak open. He drinks. | A drop slips from his beak and the camera follows it to the forest floor. |
| **III. The source** (S9) | The rain sinks into the earth of the north and comes out clear. | The drop soaks into the soil. A glass-like cross-section shows soil, sand, gravel and stone, with the water gathering clear in a stone channel. | Along the channel. |
| **IV. The care** (S10) | It is drawn and handled with care. | The stone becomes polished steel; a spotless plant, clear water in a glass pipe. | Along the pipe to the filler. |
| **V. The seal** (S11–S12) | Sealed in aluminium. | White cans on the filling line; one is filled and sealed. The camera rises into mist. | The website's live 3D VERSA can rises in ("Meet VERSA"). |

---

## 2. Made for scroll: the film becomes frames

### 2.1 How the website plays it

1. **The opening screen** is the live 3D can. Scrolling makes it tip its lid and open; the camera dives into its opening.
2. **The film starts**, on soft, bright light (K1). From here **scroll position = frame number**. The finished master is sliced into still frames:
   - desktop: about **240 frames**, 1600 px wide;
   - phones: about **160 frames**, 720 px wide.
3. A visitor can **stop on any frame**, scroll fast, or scroll **backwards**.
4. The website writes the **words over the frames** as live text (§7). Desktop puts them in the right third, phones in the lower third.
5. **The film ends** on a flat pale grey (`#DFE4E8`, the page colour). The live 3D VERSA can then rises in with its real label: "Meet VERSA. Sealed in aluminium. Never plastic."

### 2.2 Rules for footage that will be scrubbed

1. **Every frame is a still someone may stop on.** It must be crisp and well composed, with almost no motion blur: a fast-shutter look. Only rain streaks may blur.
2. **Slow change from frame to frame.** The 42 s master is sampled at about 6 frames per second for desktop and 4 for phones, so neighbouring frames must still overlap almost completely. Use slow camera moves only: no fast pans, no whip moves, no quick zooms or rack focus.
3. **Slow motion for anything fast** in real life (falling drops, splashes, the drink, pouring water). It should look like high-speed footage played slowly.
4. **Nothing that flickers or repeats quickly.** Fast repeats turn into jitter when sampled, so avoid:
   - wingbeats (the Chatak stays perched);
   - lightning;
   - flashing highlights;
   - fluttering leaves;
   - strobing rain.
5. **Holds.** Each act's key image settles and holds almost still for about a second: the two vessels, the new can with the sky, the Chatak, the clear channel, the plant, the mist. The website lays its words on these holds.
6. **Joins that match to the pixel.** Each clip starts and ends on its keyframes, so neighbouring clips share an identical frame. Any mismatch shows as a jump when scrubbed. **Don't use dissolves**: scrubbed back and forth, they look like ghosting.
7. **Steady exposure and colour.** No brightness pumping, no colour shifts at the joins.
8. **Framing for both screens.**
   - Phones show the **centre third** of the 16:9 frame (a 9:16 crop), so every subject must sit inside it.
   - Keep the **right third** (desktop words) and the **lower third** (phone words) calm: sky, mist, soft background.
   - The main subject sits in the centre, in the upper two-thirds of the height.

### 2.3 Frame map

The master runs 42 s at 24 fps. The frame numbers are for 240 desktop and 160 phone frames. The website uses "progress" (0 = the first frame, 1 = the last) to time the words.

| Clip | Act | Master time | Desktop frames | Phone frames | Progress | Hold at the end |
|---|---|---|---|---|---|---|
| S1 | I | 0:00–0:03 | 1–17 | 1–11 | 0.00–0.07 | |
| S2 | I | 0:03–0:07 | 18–40 | 12–27 | 0.07–0.17 | the two vessels |
| S3 | I | 0:07–0:10 | 41–57 | 28–38 | 0.17–0.24 | |
| S4 | I | 0:10–0:13 | 58–74 | 39–50 | 0.24–0.31 | |
| S5 | I | 0:13–0:16 | 75–91 | 51–61 | 0.31–0.38 | the new can and the sky |
| S6 | II | 0:16–0:19 | 92–108 | 62–72 | 0.38–0.45 | |
| S7 | II | 0:19–0:24 | 109–137 | 73–91 | 0.45–0.57 | the Chatak |
| S8 | II | 0:24–0:28 | 138–160 | 92–107 | 0.57–0.67 | |
| S9 | III | 0:28–0:32 | 161–183 | 108–122 | 0.67–0.76 | the clear channel |
| S10 | IV | 0:32–0:36 | 184–206 | 123–137 | 0.76–0.86 | the plant |
| S11 | V | 0:36–0:40 | 207–229 | 138–152 | 0.86–0.95 | |
| S12 | V | 0:40–0:42 | 230–240 | 153–160 | 0.95–1.00 | the mist (flat grey) |

---

## 3. Look and feel

### 3.1 Premium and realistic means

- **Photoreal.** Real light, real water physics, real feathers and metal. Nothing that looks like CGI, illustration or a stock ad.
- **Restraint.** Few elements, lots of air and negative space, slow moves. A luxury nature documentary meets a high-end product film.
- **High-key and luminous.** Soft, diffused daylight and gentle mist. Shadows are lifted, never crushed to black (except the Chatak's black plumage, which keeps its detail). Highlights stay soft and never clip.
- **One colour family from start to end:** cool silver, mist grey, silver-green woods, slate storm (cool, never purple or violet), clear pale-blue water.
  - Even the problem scenes stay in it: clinical and cool, never dirty, brown or dark.
- **Cinematic optics.** Large-format cinema camera, shallow depth of field. A 100 mm macro for the small worlds (particles, metal, drops, filling), long lenses for the bird, wide only for the sky.
- **Water and metal are the hero textures:** slow-motion drops, crowns of splash, clear streams, liquid silver, condensation.

### 3.2 Palette (from the website)

| Use | Colour | Hex |
|---|---|---|
| The page, the studio, the last frame | mist grey | `#DFE4E8` |
| Soft bright light, the first frame | sky light | `#D6E6F2` → `#F4F7F9` → `#E6EDF2` |
| Metal, rims, steel, liquid aluminium | aluminium silver | `#BEC5CB` and white highlights |
| The storm | cool slate | `#7F8797`, `#A5ACB8`, `#C8CED5` |
| The woods | muted leaf green | `#6E8B5E` (and paler, misty versions) |
| Water, drops | clear pale blue | `#8FC3EA`, deepening to `#2F7FC1` |
| The darkest shadows | navy ink | `#16233F` |

### 3.3 Subjects: what each must look like

- **The plastic bottle** is a plain, **unbranded** clear PET water bottle: thin and crinkled, with moulded ridges, a white cap, **no label and no writing**. It must not look like any real brand's bottle shape.
- **The VERSA can** is **matte white** with a bare-aluminium rim and lid and a pull tab, slim (500 ml), exactly as in the photos and the site's stills.
  - The printed artwork (a navy bird, a blue water swash and the VERSA wordmark) may appear **only turned away or softly out of focus, never readable**.
  - The VERSA bottle (white aluminium, silver cap) appears only in the optional social version (§10).
- **Liquid aluminium** is mirror-bright molten silver with soft white reflections, **never orange or red-hot**.
- **The Chatak (চাতক)** is a **pied cuckoo**, also called the Jacobin cuckoo (*Clamator jacobinus*), about 33 cm long including its tail.
  - Glossy **black upperparts** with a **tall, pointed, swept-back black crest**.
  - **Clean white throat, breast and belly**, and a **small white patch on the folded black wing**.
  - A **long, graduated black tail with white tips**.
  - Dark eye, slender slightly curved black beak, grey legs.
  - It must not turn into a magpie, a magpie-robin (doyel), a bulbul, a crow or a kingfisher.
  - It perches on a **thin bare acacia branch with small feathery leaflets** and never flies in this film.
- **The land** is northern Bangladesh in the monsoon (Panchagarh, near Tetulia): **flat** green tea gardens and paddy fields, misty woods of tall thin trees, soft rain. There are no mountains in view; the Himalayas are hidden by monsoon cloud.
- **The plant** is spotless and bright: brushed and polished stainless steel, clear glass pipe sections, white walls, pale grey floor and daylight from tall windows. There are **no people, no signs, no screens and no writing**.

### 3.4 Style block (start every prompt with this)

```text
Photoreal, premium cinematic film for a natural drinking-water brand. Shot on an ARRI Alexa 35
with high-end cinema primes, 24 fps, crisp frames with very little motion blur, very fine
film grain. High-key and luminous: soft, diffused daylight, gentle mist, airy and calm. Cool
silver-green palette: pale mist grey, silver, soft slate, muted leaf green, deep navy only in
the darkest shadows, clear pale-blue water. Lifted shadows, no crushed blacks, soft highlights
that never clip, no oversaturation. Real physics for water, light, metal and feathers. Slow,
steady, continuous camera movement, as smooth as a motion-control rig. Restrained and elegant,
like a luxury nature documentary.
```

### 3.5 Negative prompt (paste it where the tool has a field for one)

If the tool has no negative field, end each prompt with: *"No text, no logos, no people."*

```text
text, letters, numbers, words, subtitles, captions, logos, brand names, labels with writing,
watermarks, signatures, people, faces, hands, cartoon, illustration, 3D render look, CGI look,
plastic-looking feathers, deformed bird, extra legs, extra wings, two heads, flying bird,
flapping wings, wrong bird (magpie, magpie-robin, bulbul, crow, kingfisher), morphing faces,
melting objects, flicker, strobing, lightning, jump cut, dissolve, white flash, fast camera,
shaky camera, whip pan, crash zoom, heavy motion blur, heavy lens flare, night, dark or
gloomy scene, neon, purple or violet tones, orange or red-hot metal, oversaturated green,
litter heaps, garbage, dirty or muddy water
```

---

## 4. The shot list at a glance

Thirteen keyframes (K) and twelve clips (S). Each clip runs from one keyframe (its first frame) to the next (its last frame).

| Clip | Frames | Beat | Length |
|---|---|---|---|
| **S1** | K1 → K2 | Out of the can's light, the specks come into focus: plastic particles in bottled water | 3 s |
| **S2** | K2 → K3 | Pull back out through the plastic: the bottle stands beside a white aluminium can (hold) | 4 s |
| **S3** | K3 → K4 | Time passes for the plastic only: it clouds, cracks and crumbles into drifting particles; the can stays clean | 3 s |
| **S4** | K4 → K5 | Glide to the can and into its metal: it turns to liquid silver | 3 s |
| **S5** | K5 → K6 | The liquid silver forms a new white can; look down into its mouth, where clear water mirrors the sky (hold) | 3 s |
| **S6** | K6 → K7 | Push into the reflection and out into the real monsoon sky; the first raindrops | 3 s |
| **S7** | K7 → K8 | Down with the rain through mist to the Chatak, beak open to the sky (hold) | 5 s |
| **S8** | K8 → K9 | He drinks; a drop slips from his beak; follow it to the forest floor, where it lands on a leaflet | 4 s |
| **S9** | K9 → K10 | Into the earth: the water sinks through soil, sand and stone and gathers clear (hold) | 4 s |
| **S10** | K10 → K11 | The stone channel becomes polished steel and a glass pipe in the plant (hold) | 4 s |
| **S11** | K11 → K12 | Along the pipe to the filler: white cans glide in, one fills | 4 s |
| **S12** | K12 → K13 | The lid is sealed; the camera rises into mist; the frame turns flat pale grey and holds | 2 s (the last second flat grey) |

Generate clips at the tool's nearest length (for example 4, 6 or 8 s). The edit trims and retimes them to §2.3.

---

## 5. Keyframe stills (make these first)

Make them all in one session with the same style block, so light and colour match.

- **Light** comes softly from the upper left in every shot.
- **Size:** 16:9, at the highest resolution the image model offers (4K if possible, at least 1920 × 1080).
- **Composition:** keep the subject inside the centre third, with the right and lower thirds calm (§2.2).
- **References:** use the VERSA can photo or still as a reference image for K3–K6 and K12, and the bird photos for K8.

### K1: the light of the can's opening (the first frame)

This one is better made in an image editor than with AI: an exact gradient (`#D6E6F2` at the top, `#F4F7F9` at 60%, `#E6EDF2` at the bottom) with a few blurred specks in the centre. If you use AI:

```text
[STYLE BLOCK] Abstract, completely out-of-focus view into soft, bright, cool daylight, as if
looking through a small round opening into the sky. A smooth vertical gradient: pale sky blue
at the top, soft luminous white in the middle, pale grey-blue at the bottom. A few tiny, faint
specks float in the light near the centre, barely visible. No objects, no horizon, no edges.
```

### K2: particles in bottled water

```text
[STYLE BLOCK] Extreme macro inside the still, clear water of a plastic bottle, lit by one soft
shaft of cool daylight from the upper left; the curved, ridged plastic wall is just visible as
a soft edge at the far left of the frame. Hundreds of microscopic plastic particles hang
suspended at different depths: tiny translucent shards, thin curled fibres and small round
beads, some with a faint rainbow edge where the light catches them. Only a few particles near
the centre are pin-sharp; the rest melt into soft bokeh. Pale silver-grey background, cool
and clinical yet quietly beautiful. The densest cluster sits in the centre. 100 mm macro, f/2.8.
```

Check: it reads as particles in water, not dust in air and not snow. Nothing is coloured, and nothing looks like rubbish.

### K3: two ways to hold water

```text
[STYLE BLOCK] A pale, seamless studio in soft mist grey. Two drinking-water vessels stand side
by side on a pale stone surface, a hand's width apart, both inside the centre third of the
frame: on the left, a plain, unbranded clear plastic water bottle (thin crinkled PET with
moulded ridges, a white cap, no label, no writing), half full, tiny particles faintly glinting
in its water; on the right, a matte white aluminium drink can (slim 500 ml, silver rim and
lid, pull tab), cold condensation beading on it, its printed artwork turned away from the
camera. Soft, high, diffused light from the upper left; gentle reflections on the stone. Eye
level, 85 mm lens, f/4.
```

Check:

- no letters anywhere (zoom in on the cap, the ridges and the can);
- the can is **white**, not silver, and shaped like the photo;
- the bottle is not a real brand's shape;
- the right and lower thirds are clear studio.

### K4: plastic never goes away

```text
[STYLE BLOCK] The same pale studio, the same two vessels, the same framing. The plastic bottle
on the left has aged and is falling apart: its walls have gone cloudy and brittle, cracked
into flakes, and the flakes crumble into fine glittering particles that drift away to the
upper left, like dust in a beam of light. The matte white aluminium can on the right stands
untouched, clean and bright, with fresh condensation. 85 mm lens, f/4.
```

Check: the can is unchanged from K3; the particles drift away from the right and lower thirds; it is beautiful, not dirty.

### K5: liquid silver

```text
[STYLE BLOCK] Extreme macro of molten aluminium: a slow, glossy river of liquid silver metal
flowing and folding over itself, mirror-bright, reflecting soft white light, with fine ripples
on its surface. Cool silver and white tones only, no orange or red glow, no sparks. It fills
the frame; the brightest fold runs through the centre. 100 mm macro.
```

### K6: the new can holds the sky

```text
[STYLE BLOCK] Close above a brand-new matte white aluminium can (silver rim and lid) standing
on the pale stone surface, looking down at an angle at its top: the pull tab is lifted and the
small mouth is open; through the mouth, clear water inside catches a reflection of a pale,
cloudy monsoon sky. Fine condensation on the rim. The mouth sits in the centre of the frame.
100 mm lens, f/4.
```

Check: it is clearly the same can as in K3 (white, silver lid); the sky reflection is bright and clean.

### K7: the monsoon sky

```text
[STYLE BLOCK] Looking up at a vast, pale monsoon sky over the flat green tea gardens and paddy
fields of Panchagarh in northern Bangladesh. Soft, layered silver-grey clouds roll in; the
light is cool, bright and diffused. The first large raindrops fall towards the camera, a few
close to the lens catching the light. The horizon sits low with a band of mist over the flat
fields; the brightest part of the sky is in the centre. 24 mm lens.
```

Check: the land is flat with no mountains; the clouds are silver-grey and slate, not purple; it is bright, not gloomy.

### K8: the Chatak (the heart of the film)

Give the tool the **bird reference photo(s) as a reference image** (Flow "ingredients", Kling "elements"), not as a frame.

```text
[STYLE BLOCK] Close-up of a pied cuckoo (Jacobin cuckoo, Clamator jacobinus), the chatak of
Bengal, perched on a thin bare acacia branch with a few small feathery leaflets, in a misty
forest during gentle monsoon rain. Exact plumage: glossy black upperparts and a tall, pointed,
swept-back black crest; clean white throat, breast and belly; a small white patch on the
folded black wing; a long, graduated black tail with neat white tips. Dark eye, slender
slightly curved black beak, grey legs. Its head is tilted up to the sky and its beak is open;
one clear, round raindrop hangs in the air just above the beak, lit from behind. Raindrops
fall around it, softly blurred. Background: pale, misty forest of tall thin trees in cool
silver-green. The bird sharp and centred, its head in the upper half of the frame. 135 mm
lens, f/2.8.
```

Check, closely:

- one head, two folded wings, two feet gripping the branch;
- the crest, the white underparts and the white-tipped tail are all there;
- the eye and the beak are sharp;
- it is not a magpie-robin, bulbul or crow.

This moment echoes the bird on the VERSA label (the Chatak catching a drop), so it should feel iconic.

### K9: the drop reaches the earth

```text
[STYLE BLOCK] Extreme macro close to the forest floor in the rain: a single clear raindrop has
just struck a small green acacia leaflet, throwing a delicate crown of droplets, frozen in
slow motion; behind it, dark wet soil and fallen leaves, softly out of focus. Cool soft light.
The impact in the centre of the frame. 100 mm macro, f/4.
```

### K10: the earth filters it (sourcing)

```text
[STYLE BLOCK] A clean cinematic cross-section of the ground, as if seen through a sheet of
glass: a thin top layer of dark forest soil and fine roots, then pale sand, then gravel, then
smooth grey stone. Bright threads of clear water seep slowly down through the layers, growing
clearer as they sink, and gather at the bottom into crystal-clear water flowing gently along
a narrow channel of smooth stone in the centre of the frame. Soft cool side light; every
grain sharp; tidy and luminous, no mud.
```

Check: it is beautiful and believable (like a museum cutaway filmed for real), not a diagram. The water is crystal clear.

### K11: with care (managing)

If the client sends photos of their plant in Panchagarh, use them as references, so this looks like the real place.

```text
[STYLE BLOCK] Inside a spotless, bright water plant: brushed and polished stainless-steel pipes
and tanks; in the centre of the frame, a clear glass section of pipe through which
crystal-clear water flows with a few tiny bubbles. White walls, pale grey floor, soft daylight
from tall windows, gentle reflections on the steel. Minimal, calm, premium. No people, no
signs, no screens, no gauges, no writing. 50 mm lens, f/2.8.
```

### K12: filled

```text
[STYLE BLOCK] Close-up on an aluminium-can filling line in the same bright, clean plant: a row
of matte white aluminium drink cans (slim 500 ml, silver rims) glides under a polished
stainless-steel filling nozzle; the can in the centre is being filled with a smooth, clear
stream of water, frozen in slow motion; cold condensation beads on its surface. The cans'
printed artwork faces away from the camera or is softly out of focus, never readable. Soft
daylight, pale grey and silver. 100 mm lens, f/2.8.
```

Check: the cans are **white** and shaped like the photo, with **no readable text**.

### K13: the mist (the last frame)

Not AI. Make a flat colour frame, `#DFE4E8` (RGB 223, 228, 232), the same size as the others.

### Spare keyframes, only if a clip morphs (see the fallbacks in §6)

- **K4b, the can's rim:** a macro of the white can's silver rim and lid with condensation, the same studio light.
- **K5b, the sheet:** a gleaming sheet of aluminium curling up into the shape of a can.
- **K7b, into the canopy:** from just above the treetops of the misty forest in gentle rain, looking down; in the centre, small but clear, the pied cuckoo on its bare acacia branch.
- **K8b, he has drunk:** the same close-up as K8, the beak closing, a single drop at its tip.

---

## 6. Video clips (image-to-video, first frame + last frame)

**Settings:**

- 16:9, 1080p or 4K, 24 fps;
- low motion strength or "smooth" if the tool offers it;
- **no audio**;
- 3–4 takes per clip; keep the best.

Write the camera move exactly as given: one slow, continuous move that **eases out and settles** on the last keyframe.

### S1 (K1 → K2), 3 s

```text
[STYLE BLOCK] The camera drifts slowly forward into the soft light as the focus gently pulls
in: the faint specks sharpen into microscopic plastic particles suspended in the clear water
of a plastic bottle, glinting in a cool shaft of light. Very slow and smooth.
```

### S2 (K2 → K3), 4 s

```text
[STYLE BLOCK] The camera pulls back slowly through the water, past the drifting particles,
and out through the thin wall of the plastic bottle, revealing it standing in a pale studio
beside a matte white aluminium can with condensation. One continuous backward move that eases
out and holds almost still for the last second.
```

### S3 (K3 → K4), 3 s

```text
[STYLE BLOCK] Time passes for the plastic bottle only: its walls cloud and grow brittle, crack
into flakes, and the flakes crumble into fine glittering particles that drift slowly away to
the upper left. The white aluminium can beside it stays exactly the same, clean and bright.
The camera barely moves, a very slow push in.
```

### S4 (K4 → K5), 3 s

```text
[STYLE BLOCK] The camera glides slowly right, past the drifting particles, to the white
aluminium can and pushes in towards its silver rim; the metal softens and turns into flowing
liquid silver that fills the frame. One smooth, continuous move.
```

Fallback if the can morphs badly: split the clip into K4 → K4b (the glide and push) and K4b → K5 (the metal liquefies).

### S5 (K5 → K6), 3 s

```text
[STYLE BLOCK] The liquid silver flows and smooths into a gleaming sheet that curls and rises
into a new can, which takes on a matte white finish with a silver rim and lid; the camera
rises to look down into its open mouth, where clear water mirrors a pale cloudy sky. One
continuous move that eases out and holds almost still for the last second.
```

Fallback: split the clip into K5 → K5b and K5b → K6.

### S6 (K6 → K7), 3 s

```text
[STYLE BLOCK] The camera pushes slowly down into the can's open mouth, into the sky mirrored on
the water, and passes through the reflection into the real sky: a vast pale monsoon sky above
flat green tea gardens, clouds rolling in, the first large raindrops falling towards the lens.
One continuous move.
```

### S7 (K7 → K8), 5 s

Give the bird reference image again.

```text
[STYLE BLOCK] The camera turns down and descends with the falling rain through a soft layer of
mist into the tops of a misty forest, then glides in towards a pied cuckoo perched on a bare
acacia branch, its head tilted up to the sky, beak open, a raindrop falling towards it. One
continuous descending move that eases out and holds almost still for the last second. The
bird never flies; its plumage stays exactly the same throughout: black above, white below,
black crest, long white-tipped tail.
```

Fallback if the bird morphs or the move jumps: split the clip into K7 → K7b and K7b → K8.

### S8 (K8 → K9), 4 s

```text
[STYLE BLOCK] In slow motion the raindrop falls into the pied cuckoo's open beak and he
swallows, his crest lifting slightly. A single clear drop slips from the tip of his beak; the
camera follows that same drop down past the branch to the forest floor, where it strikes a
small green leaflet in extreme close-up and splashes. Smooth and continuous.
```

Fallback: split the clip into K8 → K8b (the drink) and K8b → K9 (the fall).

### S9 (K9 → K10), 4 s

```text
[STYLE BLOCK] The water from the splash soaks into the dark soil and the camera sinks with it
into the ground, as if the earth were glass: layers of soil, sand, gravel and smooth grey
stone rise past the camera while bright threads of clear water seep down through them and
gather into crystal-clear water flowing along a narrow stone channel. A slow downward move
that eases out and holds almost still for the last second.
```

### S10 (K10 → K11), 4 s

```text
[STYLE BLOCK] The camera travels with the clear water along the stone channel; the stone walls
turn seamlessly into polished stainless steel and the channel becomes a pipe; the camera
emerges beside a clear glass section of the pipe inside a bright, spotless plant,
crystal-clear water flowing through it. One forward move that eases out and holds almost
still for the last second.
```

### S11 (K11 → K12), 4 s

```text
[STYLE BLOCK] The camera follows the water through the steel pipe to a stainless-steel filling
nozzle; a row of matte white aluminium cans with silver rims glides slowly into place below
it and the centre can fills with a smooth, clear stream, in slow motion; condensation forms
on its surface. The cans' printed artwork stays turned away or out of focus. Smooth,
continuous move.
```

### S12 (K12 → K13), 2 s, the last second flat grey

```text
[STYLE BLOCK] A silver lid is pressed and sealed onto the white can; the camera rises slowly
above it into soft, bright mist until the whole frame is an even, pale cool grey, and holds.
Gentle and calm.
```

### Check every clip before keeping it

- [ ] **The joins.** The first and last frames match their keyframes exactly, so nothing jumps where clips meet.
- [ ] **No writing.** No text, letter-like marks or logos anywhere. Step through the cans, pipes and backgrounds frame by frame.
- [ ] **The bird.** Correct anatomy and plumage in every frame: one head, the crest, white below, the white-tipped tail. It never flies.
- [ ] **As frames.** Step through the clip about 6 frames per second of footage, the way the website will sample it. Is every frame crisp? Does nothing jump, flicker or strobe?
- [ ] **Speed.** The move is slow and steady and settles where a hold is planned. Scrubbed backwards, it still looks natural.
- [ ] **Colour.** It stays in the palette; the storm is slate, not purple; the metal is silver, not orange; the water is clear.
- [ ] **Framing.** The main subject stays in the centre third; the right and lower thirds stay calm.

---

## 7. Words over the frames (the website adds them; the client approves them first)

The website writes these as live text in its two-voice style; the `*accent*` part is set in serif italic. The progress windows follow §2.3. They are drafts.

| Progress | Over | Title | Line under it |
|---|---|---|---|
| 0.03–0.16 | S1–S2 | Look closer at *bottled water.* | In a 2024 study, a litre of bottled water held about 240,000 tiny plastic particles on average.¹ |
| 0.18–0.23 | S3 | Plastic never really *goes away.* | It breaks down into smaller and smaller pieces.² |
| 0.25–0.37 | S4–S5 | Aluminium *comes back.* | It can be recycled again and again without losing quality.³ |
| 0.39–0.44 | S6 | So we keep the sky's water *in a can.* | — |
| 0.47–0.66 | S7–S8 | The Chatak drinks only *what the sky gives.* | In Bengali folklore, he waits all summer for the first monsoon rain. |
| 0.68–0.75 | S9 | The rain *sinks into the earth.* | Over the north of Bangladesh it seeps down through soil, sand and stone.⁴ |
| 0.78–0.85 | S10 | From the source, *with care.* | Drawn and handled at our own plant in Panchagarh.⁴ |
| 0.87–0.97 | S11–S12 | Sealed in aluminium, *not plastic.* | — |
| after | the 3D can | (the existing beat) Meet VERSA. | Sealed in aluminium. Never plastic. |

The dive caption just before the film ("One small click. *The sky opens.*") should change to fit the new opening, for example: "One small click. *Look closer.*"

**Sources:**

- ¹ Qian et al., *PNAS*, January 2024 (Columbia University and Rutgers University): three bottled-water brands, five samples each, about 90% of the particles nanoplastics; the researchers suggested much of it comes from the bottle itself. Health effects are not established: the WHO (2019) judged the risk from microplastics in drinking-water low on current evidence and asked for more research.
- ² UNEP, *Biodegradable Plastics and Marine Litter* (2015): plastic does not go away; it breaks down into microplastic particles.
- ³ International Aluminium Institute: aluminium can be recycled indefinitely, provided it is collected and kept pure. LANGLOK's ReCan programme does the collecting.
- ⁴ Only once the client confirms the source and the process (§8).

---

## 8. Health and environment: show it, say it carefully

The opening has to make the case that **a can is better than a plastic bottle, for health and for the environment**. Here is how to make that case without a claim we can't defend.

**Environment: say it plainly.** Both points are well sourced:

- plastic breaks down into ever smaller particles instead of going away (UNEP);
- aluminium can be recycled again and again (International Aluminium Institute), and ReCan brings the cans back.

**Health: show it, don't claim it.**

- **The film shows** the published finding (particles in bottled water, much of it likely from the bottle) and then water that never touches a plastic bottle. Viewers draw the conclusion.
- **The words stay factual.** No "healthier", "safe" or "pure"; no "zero microplastics" or "plastic-free".
  - Cans and bottles usually have a thin inner coating.
  - Microplastics can also be in water before it is packed.
- **A health line needs evidence first.** For one, the client needs the coating type (for example BPA-NI) and test results for the water.

**It must not say or imply:**

- any **health claim** ("microplastics cause…", "healthier", "detox");
- that rain or VERSA is "100% pure";
- any **specific treatment step** (reverse osmosis, UV, minerals, depth of a well, number of filtration stages) until the client confirms it;
- **another brand**, by name, logo or recognisable bottle shape;
- **people** (AI faces and hands look wrong, and real people need releases).

**Questions for the client** (before approving S9–S11):

1. **The source.** Where does VERSA water come from: a deep well (aquifer), a spring, or something else, and where exactly? S9 shows rain sinking through the earth, which suits groundwater.
2. **The process.** Which treatment steps does the plant use? S10–S11 stay generic until we know.
3. **The study.** Are they happy to cite the 2024 microplastics study (§7, note ¹)?
4. **The inner coating.** What lines the can and the bottle? This decides how far the words in §7 can go.
5. **Photos of the plant**, to use as references, so S10–S12 look like their own factory.
6. **The place.** Is it Tetulia in Panchagarh? (Their original story said "Umm Lajj".)

---

## 9. Tools, editing, slicing into frames, delivery

### Tools (October 2026; check the current options inside the tool)

- **Google Veo 3.1** (in Flow or Gemini). The most realistic option, with first and last frame, up to three reference images, 4, 6 or 8 s clips, 24 fps, 16:9 and 9:16, up to 4K. First choice for the bird (S7, S8) and the water and metal macros.
- **Kling 3.0.** Start and end frames, element references, clips of about 3–15 s, strong liquid motion. A good alternative or second opinion.
- **Runway Gen-4.5.** The most precise camera and keyframe control; useful if a move needs exact steering.
- Use a **paid plan** so commercial use is allowed.

### Editing (DaVinci Resolve, free, or CapCut)

1. **Assemble.** Put S1…S12 in order on one track. Joins share a keyframe, so cut on that frame. No dissolves; if a join jumps, regenerate the clip.
2. **Retime for scroll.** Retime each clip to the durations in §2.3 (optical flow where you slow it).
   - Ease each move into its hold, then hold the settled frame for the rest of the clip.
   - Nothing may move faster than in the generated clip.
3. **Stabilise** only where there is jitter.
4. **Grade** every clip to the keyframes:
   - lift the shadows and keep the whites soft;
   - cool the highlights slightly;
   - keep the storm slate, the metal silver and the water clear;
   - make the last second a flat `#DFE4E8` (check 223, 228, 232 with the colour picker).
5. **Remove all audio.**
6. **Preview it as the website will.** Make a copy sampled the way the site samples it, and play it:

   ```bash
   ffmpeg -i hero_master_16x9.mov -vf fps=6 -r 6 scroll_preview.mp4
   ```

   If anything jumps, flickers or strobes in that preview, fix that clip.

### Slicing into frames (the developer, or anyone with ffmpeg)

```bash
bash scripts/extract-frames.sh hero_master_16x9.mov 240 160
```

This writes the frames to `client/public/frames/hero/`:

- `desktop/0001.webp`… (1600 px, about 12 MB in all);
- `mobile/0001.webp`… (a 720 px centre crop, about 5 MB);
- `poster.jpg`.

The script prints the totals and warns if a set is over budget. If phone scrubbing looks steppy, raise the phone count and lower its quality.

Because the website works with frames, **single frames can be fixed**: retouch a stray artefact, or regrade a frame that pumps. Keep the numbering. The website can also hold a frame longer or blend two neighbours, so holds can be adjusted in code.

### Delivery

| File | Spec |
|---|---|
| `hero_master_16x9.mov` | **Required.** 3840 × 2160 (or 1920 × 1080), 24 fps, ProRes 422 HQ (or H.264 MP4 at 40 Mbps or more), Rec.709, silent, 42 s (±2). First frame = K1; the last 24 frames = flat `#DFE4E8`. |
| `hero_master_9x16.mov` | Optional. 1080 × 1920 or larger, the same timings, made from 9:16 versions of the keyframes, with subjects re-framed for portrait. With it, phones get a full frame instead of the centre crop; the developer adjusts the script. |
| `keyframes/K01_light.png` … `K13_mist.png` | The approved stills. |
| `clips/S01_light-particles.mp4` … `S12_sealed-mist.mp4` | The chosen takes. |
| `social/versa_film_16x9.mp4`, `versa_film_9x16.mp4` | Optional (§10). |

### On the website (for the developer)

- The frame player replaces the hero's drawn film in the same sky layer (master plan §6.7). It draws the nearest loaded frame for the scroll position and loads progressively: the poster, every 8th frame, then every 4th, every 2nd, and the rest.
- Lengthen the hero's scroll for 42 s of film (`HERO_SCROLL_VH`, now 500; try about 700). Each act then gets more than a screen of scroll.
- The words from §7 go into `copy.ts`, with their windows in `film/timeline.ts`, once the client approves them.
- The drawn film stays on the site as the story in section 06.

---

## 10. Optional: the standalone version (social media, presentations)

The website version ends in mist, and the site's 3D can shows VERSA. For a version that plays on its own, add at the end:

- **S13, the product (from the real photos, never invented).**
  - Put the official VERSA can and bottle photos (label to camera) on the mist backdrop `#DFE4E8`.
  - Animate with **camera-only motion**: a slow 5% push-in, a soft light sweep across the white bodies, a few condensation beads.
  - The products must not rotate or change. If even one letter of the label shifts, don't use AI for this shot: animate the still photo in the editor (a slow zoom plus a light-sweep overlay).
- **The end card:** the LANGLOK logo from the logo pack (`/brand/langlok-logo.svg` on the website), placed in the editor. **Never let AI draw the logo or the label.**
- **Sound (social only):** soft rain, the water stream, the liquid metal, the can's seam, a quiet ambient bed. No lyrics, licensed music only. The website version stays silent.
- **Captions** may be burned in for social, using the approved words only (§7), with the sources.

---

## 11. Before you hand it over

- [ ] K1–K13 are approved by the user.
- [ ] All twelve clips pass the checks in §6, including the 6-frames-per-second preview.
- [ ] The story reads in order: the particles, the bottle beside the can, the plastic crumbles, the metal returns as a new can, the sky, the Chatak drinks, the drop to the earth, the source, the plant, the sealed can, the mist.
- [ ] The master starts on the soft light (K1) and ends on 1 s of flat `#DFE4E8`.
- [ ] There is no text, no logo and no readable label anywhere in the website master.
- [ ] The bird is a correct pied cuckoo in every frame, and it never flies.
- [ ] The colour runs in one family; there are no cuts, dissolves or flashes; the holds are where §2.3 puts them.
- [ ] The phone crop (the centre third) still shows every subject.
- [ ] The files are named as in §9.
- [ ] The client has answered the questions in §8, or S9–S11 are marked "pending the client".
