# VERSA — langlok.com

Website for **VERSA** natural drinking water (500 ml can · 990 ml aluminium bottle) by
Langlok Int. Company Ltd., Panchagarh, Bangladesh.

- Brief and rules: [CLAUDE.md](CLAUDE.md)
- Full spec: [docs/VERSA_Website_Master_Plan.md](docs/VERSA_Website_Master_Plan.md)
- Phase prompts and AI video prompts: [docs/PROMPTS_for_Claude_Code.md](docs/PROMPTS_for_Claude_Code.md)
- Client's original text: [docs/client/](docs/client/)

## Requirements

- Node.js 22+ (developed on Node 26), npm 10+
- ffmpeg on `PATH` (frame scripts)
- Git Bash or any POSIX shell for `scripts/*.sh` on Windows
- Python 3.10+ with Pillow, numpy and scipy (only to rebuild the 3D label textures)

## Commands

```bash
npm install            # once, at the root (npm workspaces: client + server)
npm run dev            # client http://localhost:5173 + API http://localhost:4000
npm run dev -w client  # client only
npm run dev -w server  # API only
npm run build          # server (tsc) then client (tsc + vite)
npm run typecheck
npm run lint
npm run format

bash scripts/make-placeholder-frames.sh          # placeholder hero frames + poster
bash scripts/extract-frames.sh hero_master.mov   # real hero frames from the graded master
python scripts/build-label-textures.py           # 3D label textures from the mockup photos
```

The Vite dev server proxies `/api` to the API on port 4000. Copy `server/.env.example`
to `server/.env` to override defaults.

## Dev routes

- `/` — home: the full scroll experience (3D vessels from Phase 3)
- `/custom-branding`, `/recan`, `/story`, `/contact` — inner pages
- `/dev` — Lenis + ScrollTrigger pin test (dev builds only)

## Layout

```
client/   Vite + React 19 + TS, Tailwind v4, three / R3F, GSAP, Lenis
  public/frames/hero/{desktop,mobile}/NNNN.webp, poster.jpg
  public/img/mockups/   client product photos (temporary stand-ins)
  public/textures/      3D label colour + ORM maps (generated)
  src/app/ components/ content/ hooks/ lib/ pages/ sections/ store/ styles/ three/
server/   Express 5 + TS (Mongo, uploads, email arrive in Phase 6)
scripts/  hero frame tools, label texture builder
docs/     master plan, prompts, client text
```

`main product info/` is the client's original handoff folder; it is git-ignored and its
contents are copied into `docs/` and `client/public/img/`.
