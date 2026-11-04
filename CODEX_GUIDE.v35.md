# Bramblewick 3D — CODEX GUIDE (as of v35, 2026-11-01 PDT)

## Architecture
- **Base game ("classic")**: ES modules served from `/3d/` on the VPS (`/opt/bramblewick-link/public/3d/`).
  `classic.html` is the untouched reference build — **never edit it**.
  - `main.js` — renderer, camera, input (`pointerup` -> `entries(x,y)[0].fn()`), NPC/obj entities. Exposes `window.B3 = {proj, ents, GM, G, THREE, S, TR, F, Pl, npcs, C, M, walk, astar, hAt, cam, tap, doors}`.
  - `game3d.js` — UI panels, inventory/menu (`#menu`, `pmenu()`), loads `game/*.json`, builds `G` via `R.createState`, sets `G.opts.wander=true`, delivers rule events to `window.__B3fx(G.events)`.
  - `game/rules.js` — pure game logic (combat, skills, firemaking `startLighting`, `bury`, `attack`, `walkTo`, drops). `game/{npcs,items,drops,nodes,shops}.json` — data.
  - `terrain.js`/`world.js` — procedural height field + canvas textures + shader water. Tiles come from `assets/map.json` (`W,H,t,wk,objs,npcs,ND,pl`). Tile codes: 0 grass, 1 path, 2 water, 3 sand, 8 bridge (others are walls/floors/dirt).
  - `online.js` — accounts (`/api/*` -> port 5090). Keys: `bwl.token`, `bwl.user`, `bw.guest`. State `window.__B3online` (`.user`).
  - `b2.js` — magic (localStorage `b3d.magic.v1`, panel `#b2p`, Cast buttons `[data-c]`).
- **Overlay ("m")**: `/3d/m/m.js` + `/3d/m/m.css` + `m/icons`, `m/sprites`. Loaded only by `/3d/index.html` (= merged build).
  - OSRS stone UI, shop, icons, kit, welcome/login, v34 combat helpers (NPC facing, combat-over-gather, gather ring, fire mesh via `__B3fx` chain, item primary taps, tinderbox->logs, ⚡ quick spell `#mqs`, fenced arena decor), v35 login gate + placeholder monster colours.
- **Head patch in `/3d/index.html`** (inline, runs before modules): wraps `window.fetch` to patch
  - `assets/map.json`: adds the pond/stream (tiles->2, wk->0) and 9 arena NPCs (cows, goblins, `aspider`=small spider with `look:'spider'`).
  - `game/npcs.json`: generates combat defs for every attackable map kind missing from the data (cow, spider, skeleton, giants, …, goblin, aspider). **This is why cows were un-attackable before v34.**
  - `game/drops.json`: bones + coins for those kinds.
  - Loader `#mload` with progress (`window.__mlp`), removed when `window.B3 && window.__M`.
- **Site**: `/` -> `/opt/bramblewick-link/public/home.html` (landing), `/client/` -> `public/client/index.html` (Gary OSRS client page; downloads hosted by the 5051 app, which is NOT modified). 5051's "Play in Browser" (`/play`) already 302s to `/3d/`.
- **iOS app**: `~/Desktop/Projects/Bramblewick3D/Bramblewick3D.xcodeproj`, bundle `com.gary.Bramblewick`, v1.1 (30), live-only (`GameSource.current = .live` -> `/3d/`).

## File map
| Where | What |
|---|---|
| box `/workspace/merge/index.html` | merged build source (classic.html + head patch + m overlay tags) |
| box `/workspace/merge/m/` | overlay (m.js, m.css, icons, sprites) |
| box `/workspace/site/` | landing `home.html`, `client/index.html` |
| box `/workspace/classic/` | read-only copy of classic sources (for grepping) |
| VPS `/opt/bramblewick-link/public/3d/` | live game; `index.html` (merged), `merged.html` (staging), `classic.html` (untouched) |
| VPS `/etc/nginx/sites-available/bramblewick-https` | routes (`/`, `/2d`→/3d/, no-cache for /3d html/js/css) |
| Mac `~/.grokbot_tmp/mgdep.sh`, `mgpromote.sh` | stage / promote scripts |
| Mac `~/Desktop/Projects/Bramblewick3D/WebGame/3d/` | mirror of the live /3d/ |

## Deploy
1. Edit on box. Bump **only** these: `m.css?v=N`, `m.js?v=N`, `__MBUILD="vN"` (never a global `v=` sed — it breaks `controls.js?v=21` etc.).
2. `cd /workspace/merge && cp index.html merged.html && tar czf /workspace/mg_dep.tgz merged.html m`
3. Copy to Mac `~/.grokbot_tmp/mg_dep.tgz`, check md5, `bash ~/.grokbot_tmp/mgdep.sh` (stages `/3d/merged.html`).
4. Touch-test `https://104-207-83-247.sslip.io/3d/merged.html` at 390x844 (Playwright, `has_touch`, `touchscreen.tap` at bbox centres; run long tests in background).
5. `bash ~/.grokbot_tmp/mgpromote.sh` (copies merged.html -> index.html on VPS + Mac mirror).
6. **Never run `sync-game.sh`. Never touch Tarnish services or the 5051 app.**

## Testing tips
- Gate: v35 requires login. In tests set `window.__B3online.user='qa'` and remove `#bwacct` to play without an account.
- Project NPC to screen: `v=new B3.THREE.Vector3(); e.g.getWorldPosition(v); v.project(B3.cam)`; check `B3.ents(x,y)[0].label` starts with "Attack" before tapping (portrait camera puts many NPCs off-screen).

## Known issues and exact fixes
1. **Smoother movement** — player/NPC positions step tile-to-tile per game tick. Fix in `main.js` render loop: keep `e.px,e.py` (prev tile) and `e.t0` (tick time); each frame `k=min(1,(now-e.t0)/TICK_MS)`, render at `lerp(prev,cur,k)` with `hAt` on the lerped point; set `prev=cur, t0=now` when the logic position changes. Same for `Pl`. Camera follow should target the lerped player position with `cam.position.lerp(target, 1-exp(-dt*8))`. Can be done from m.js by overriding `e.g.position` after main's update in a later rAF (store last logic tile on the entity).
2. **Goblin model** — goblins use chars.js placeholder humanoid tinted green (m.js v35 `PC` table). Proper fix: add `goblin:()=>H({skin:0x5f8f2f,shirt:0x6b4a2a,legs:0x3a2a1a,hair:null,ears:true})` to `KINDS` in `chars.js` (pointy-ear cones on the head group), scale 0.8. Do it in a copy loaded only by merged index (don't edit classic files) or via `look:` pointing at a new kind registered in the overlay.
3. **Respawn tests** — untested end to end. Rules: `n.dead=true; n.respAt=s.tick+d.resp` (generated defs use `resp:18` ticks; bosses 100). Test: kill a cow (`G.npcs[i].hp=1` then attack), record `G.tick`, wait until `G.tick>=respAt`, assert `!dead`, hp reset and entity visible. Player death: set `G.player.hp=1`, let a cow hit, assert respawn at `M.pl` with full hp.
4. **Duplicated "Charging a spell…"** — click fired twice on touch. v35 adds an 800 ms guard (`qbT`) on `#mqs`; verify on a real phone.
5. **Player keeps fighting / dies near spawn** — NPCs only retaliate when attacked (rules.js), but classic AUTO-fight (button "AUTO ON", default on) chains to the next monster. Fix: default AUTO off for new players (set its localStorage flag in the head patch) or stop auto-chaining when `P.hp < 40%`.
6. **Placeholder monsters** — skeleton, zombie, darkwiz, bknight, giants, demon, ashlord also use placeholders (now tinted + scaled). Real models: add `KINDS` entries as in (2).
7. **Map** — v35 only adds a pond/stream and arena decor via data patch. Bigger redo: edit `assets/map.json` tiles (paths=1, water=2 with `wk=0`, bridges=8) in the head patch; keep objs/NPCs off water tiles; textures are procedural in `terrain.js` (`makeTextures`), tweak colours there (copy, don't edit classic).
8. **Landscape touch test** — only screenshot-verified; run the same tests at 844x390.
9. **iCloud backup** excludes the top-level `build/` (DerivedData, regenerable).
