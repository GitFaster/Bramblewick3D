# Bramblewick 3D — CODEX GUIDE (v42, 2026-11-01 PDT)

Live URL: **https://104-207-83-247.sslip.io/3d/** (OSRS-cache build, v38 badge bottom-left).
Classic v36 build: `/3d/v36.html` (also `/3d/index.classic-v36.html`). `classic.html` = untouched reference, never edit.
Previous guide (classic/merged architecture, v35) kept at `CODEX_GUIDE.v35.md`.

## 0. Ground rules
- Never print secrets/passwords. Never run `sync-game.sh`. Do NOT touch Tarnish services (reading the cache is fine).
- Don't modify the 5051 app. Keep `classic.html` unchanged. Local assets only (no CDNs).
- Edit `om/om.js` **directly**. The `p*.js` part files are OUT OF SYNC with the deployed om.js — do not run `build.sh`.
- Always stage as `/3d/omNN.html`, test after a real login, then `cp omNN.html index.html` (VPS + Mac mirror).

## 1. Architecture (OSRS build)
| Path (web root `/opt/bramblewick-link/public/3d/`) | Role |
|---|---|
| `index.html` (= `om38.html`) | page shell: HUD DOM, mobile CSS (m38 block), badge `#mbadge`, shop touch fallback (m37) |
| `om/login.js?v=N` | login gate; imports `./om.js?v=N` (N taken from its own script `v=` param — bump both together) |
| `om/om.js` | whole game: renderer (three.module.min.js), world, entities, combat, skills, UI panels, saves |
| `om/om.css` | OSRS stone/parchment UI |
| `om/w/models.bin, terrain.bin, texatlas.png, world.json` | world extracted from the Tarnish OSRS cache (Lumbridge region) |
| `om/sprites/`, `om/icons/` (76) | cache sprites (tabs, orbs, spell icons) |
| `chars.js`, `assets/three.module.min.js` | character models, three.js |

Server API: nginx `/api/` → `127.0.0.1:5090` (`bramblewick-link.service`). Login, register and save go through `/api/*`.
Box source: `/workspace/osrsm/` (Mac mirror `~/Desktop/Projects/Bramblewick3D/WebGame/3d/`).

### login.js
- `api()` tries 3× with a 15 s timeout, backing off 900·n ms on network errors or 5xx. Final error: "Can't reach the server (tried 3 times)…".
- No guest button. Username is prefilled from `m.lastUser`/`bwl.user`. Shows "Logging in… (try n of 3)". 401 explains that Bramblewick accounts are separate from the OSRS client.

### om.js key pieces
- **State `ST`** (saved per account): `inv[28]` `{id,q}`, `eq{weapon,body,head,legs,shield,…}`, skills, `pp`, `kit37`, `kit38`, `bank{}`, `style`, tasks.
- **Items `IT[id]`**: `{n,i(icon html),v(value),st(stackable),eq slot,req,f(css filter)}`. Icons are rendered from cache item models (`IC[id]`→`WD.obj`). Mithril and rune items (v37 block right after IT) are steel clones tinted via `f`; real models need a cache-pipeline re-run.
- **Starter kit `KIT37`**: mithril full helm, platebody, platelegs and kiteshield; rune scimitar; air 300, mind 150, water/earth/fire 100; shrimps ×3, bread ×2, beef; axe, pickaxe, net, tinderbox; 10,000 coins. Existing saves get a one-time `kit37` grant plus a `kit38` coins top-up to 10k.
- **Combat**:
  - `hit()` has a .55 hit-chance floor.
  - `playerAttack` faces the target, swings, and the monster turns to face the player.
  - Monsters `MON[]` (`m.d.n`, `hp`, `dead`, `aggro`, `respawn`) retaliate, respawn and drop bones and coins.
  - Styles (`.sty`, `ST.style`) are in the combat tab (Accurate/Aggressive/Defensive, plus the Slash label for scimitars).
- **Magic**: `landSpell` has an 85% accuracy floor; `__OMcast(m,'wind')`.
- **Skills**:
  - chop `TREES` (Tree = level 1, Oak = 15);
  - mine `ROCKS`;
  - fish `FISH`;
  - firemaking (`useOn` logs+tinder → `lightFire`, `__FIRES`);
  - cook on fire or range;
  - prayer (bury bones).
- **Tasks** `TASKS` + `task(k)` give 50 coins each (including 'fire' and 'cook').
- **Height**: `yAt(x,z)` raycasts bridge decks on water-overlay tiles so feet sit on bridges. `animEnt` uses it.
- **UI**: `openTab(name)`, `openMode('store'|'bank')`, `renderPanel()`, and `bindPanel(B)` (binds `.inv .slot`, `.bk`, `.buy`, `.sty`, prayers `[data-p]:not(.buy)`). Shop slots also carry `data-p` (price); the v38 fix stops the prayer handler from stealing them.
- **Debug hooks**:
  - `window.__OM={ST,me,MON,FISH,OBJ,TREES,ROCKS,GI,NPCS,act,pick,CAM,invCount,lv,screenOf,tapAt,menuAt,openTab,tick}`
  - `__OMd={IT,IC,DOORS,toggleDoor,invAction,refreshGear,COL,SZ,stepOK,useOn,openMode}`
  - `__OMsave`, `__B3ready`

## 2. OSRS Mobile layout (target = Gary's reference video)
| Element | OSRS Mobile | Bramblewick v38 |
|---|---|---|
| Right toolbar (vertical) | combat, skills, quests, inventory, equipment, prayer, magic | done: `#ltabs` pinned right on phones (pointer:coarse), 44px |
| Left toolbar | chat, friends, account, settings | done: `#lstrip` (others hidden `.mhide`) |
| Minimap top-right with HP / prayer / run orbs + compass | yes | done (XP button, compass N, world orb) |
| Yellow X on ground tap | yes | done |
| Parchment NPC dialogue, top centre, portrait, "Tap here to continue" | yes | parchment present; **portrait TODO** |
| Inventory 4×7 (28) with cache icons and stack numbers | yes | done |
| Bank: parchment window + inventory docked, tap deposit/withdraw, Deposit inventory | yes | functional; visual polish TODO |
| Doors open on tap | yes | done (`toggleDoor`) |
| Long-press = context menu | yes | done (`longable`) |
| Chatbox with tabs (All/Game/Public…) | yes | basic chatlog; garbled-text bug **not diagnosed** |

## 3. Known gaps / next work (with rough cost)
1. **Full map**: only the Lumbridge region was extracted into `om/w/*`. Needs re-running the cache pipeline (`/workspace/cachex/pipe`) for more regions, plus chunked streaming (load/unload 64×64 regions by distance) to stay fast. About 2–3 h.
2. **River**: per-tile sunk water looks jagged and untextured. Replace it with one smoothed water mesh using cache water texture 1 and animated UV scrolling. About 1 h.
3. **Real mithril/rune models**: extract from the cache item models (same pipeline as `IC`). About 45 min.
4. **Slash animation**: the current swing is a generic arm rotation. Add per-style animation (slash arc for scimitars and swords, stab for daggers) using cache seq/frames, or keyframed bone rotations. About 1 h.
5. **Dialogue portrait, chat tabs, garbled chat, launch/login screen art**: about 1 h together.
6. **"Interact with almost everything"**: add `examine` to every OBJ, plus default actions for chairs, ladders and stairs (plane change), range, altar, anvil, spinning wheel. About 1–2 h.

## 4. Editor (`/3d/editor.html`), admin only. Status: NOT BUILT YET (spec and plan)
Goal: Gary edits the world without code.

### 4.1 UX
- Opens the same renderer as the game. An admin-only top bar has a **Play ↔ Editor** switch, shown only when `user===ADMIN_USER` (server-confirmed, never trust the client).
- Left palette tabs: NPCs/monsters, Objects (trees, rocks, fishing spots, booths, ranges, doors), Spawns, Items, Shops, Drops.
- Map tools:
  - Place: tap a palette entry, then tap a tile.
  - Select: tap an entity to open a property sheet (name, combat level, hp, max hit, aggro, respawn seconds, wander radius, examine text, dialogue lines).
  - Move: drag, snapping to tiles.
  - Rotate, Delete.
  - Undo/redo stack, kept locally until saved.
- Data editors (forms, not code):
  - Items: id, name, value, stackable, equip slot, bonuses, requirements, icon tint.
  - Shops: stock list with price and restock.
  - Drops: per-monster table with item, qty range and chance.
- **Save** sends a single JSON document. A toast confirms, and a "View backups / restore" list is available.

### 4.2 Data model: `world-edits.json`
```json
{ "version": 3, "updated": "ISO", "by": "gary",
  "npcs":  [{"uid":"n1","kind":"goblin","x":3222,"z":3218,"plane":0,"wander":4,"respawn":30,"dir":0}],
  "objects":[{"uid":"o1","type":"tree","name":"Tree","x":..,"z":..,"rot":0}],
  "remove": ["cacheObj:12345@3200,3200"],
  "items": {"rune_scim":{"n":"Rune scimitar","v":25600,"eq":"weapon","bon":{"slash":45,"str":44}}},
  "shops": {"lumbridge_general":[["bread",12],["axe",16]]},
  "drops": {"goblin":[["bones",1,1,1.0],["coins",1,15,0.4]]} }
```
The game loads it after `world.json` and applies overrides (merge items, replace shops and drops, add or remove entities).

### 4.3 Server API (in the 5090 bramblewick-link app; NOT the 5051 app)
- `GET  /api/world-edits` (public, cached 30 s): returns the current JSON.
- `PUT  /api/world-edits` (Bearer session token): server checks `session.user === ADMIN_USER` (env var), validates schema and size (< 2 MB), copies the old file to `data/backups/world-edits-YYYYMMDD-HHMMSS.json` (keeps the last 50), writes atomically (tmp + rename), and returns `{ok,version}`.
- `GET  /api/world-edits/backups` (admin) and `POST /api/world-edits/restore {name}` (admin).
- `GET  /api/me`: returns `{user, admin:true|false}` so the client can show the Play ↔ Editor switch.

### 4.4 Implementation steps
1. Server: add the routes above and the `ADMIN_USER=gary-account` env, then restart `bramblewick-link`. Back up the service code first.
2. `om.js`:
   - `loadEdits()` before spawning;
   - `applyEdits(E)` hooks into `NPCS/MON/OBJ/TREES/ROCKS/FISH`, `IT`, `STOCK`, drops;
   - expose `__OMe={applyEdits, exportEdits}`.
3. `editor.html` = `index.html` plus `om/editor.js` (palette, pick via `__OM.pick`, property sheet, drag, undo, PUT save).
4. Test: non-admin gets 403 on PUT and has no switch; admin place → save → reload `/3d/` → entity present; backup file created.

## 5. Deploy
```
# box
cd /workspace/osrsm && tar czf /workspace/omNN.tgz omNN.html om/login.js om/om.js
# CopyFromBox -> Mac ~/.grokbot_tmp/omNN.tgz ; verify md5 -q matches box md5sum
scp ~/.grokbot_tmp/omNN.tgz vps:/tmp/ && ssh vps 'cd /opt/bramblewick-link/public/3d && cp om/om.js /tmp/om.js.prev && tar xzf /tmp/omNN.tgz'
# test https://104-207-83-247.sslip.io/3d/omNN.html after real login, then:
ssh vps 'cd /opt/bramblewick-link/public/3d && cp omNN.html index.html'   # + same in Mac mirror
```
Note: `om/om.js` is shared by staging and live, so untarring updates live JS immediately. Test quickly or use a versioned filename.
Rollback: `/tmp/om.js.v37`, `/tmp/login.js.v37` on the VPS (and `om37.html`).

## 6. Tests (box, Playwright Chrome, 844×390 touch)
- `/tmp/om.py`: login gate, forced-failure retry, prefill, badge.
- `/tmp/omp.py`: full playability (walk tap, touch attack, drops, retaliation, wind strike, eat/bury/wield, chop, fire, shop buy/sell, respawn).
- `/tmp/omq.py`: kit/equip/inventory screenshot, touch buy, chop a level-1 Tree.
- Run: `URL=https://104-207-83-247.sslip.io/3d/om38.html timeout 330 python3 /tmp/omp.py`. Test account creds are in `/tmp/qa_user`, `/tmp/qa_pass` (never print).

## 7. iOS app
`Bramblewick3D.xcodeproj`, scheme Bramblewick3D, bundle `com.gary.Bramblewick`, v1.1 (30). It loads the live `/3d/` URL, so web changes need no rebuild.
```
xcodebuild -project Bramblewick3D.xcodeproj -scheme Bramblewick3D -configuration Debug -destination 'generic/platform=iOS' -derivedDataPath ~/Library/Developer/Xcode/DerivedData -allowProvisioningUpdates build
xcrun devicectl device install app --device 00008120-000145DC02040032 ~/Library/Developer/Xcode/DerivedData/Build/Products/Debug-iphoneos/Bramblewick3D.app
xcrun devicectl device process launch --device 00008120-000145DC02040032 com.gary.Bramblewick
```

## 8. Backup
iCloud: `~/Library/Mobile Documents/com~apple~CloudDocs/Backups/Bramblewick3D-2026-11-01/` via `rsync -a --delete --exclude /build/`, then compare file counts.

## 9. v39–v40 changes (2026-11-01 23:00–23:25 PDT)
- **v39 equip visuals:** `wornDef(id)` picks the worn model from `IC[id]`, then `IT[id].tid`, then the base bronze model (`IC[suffix]`) recoloured by `TINT39[tier]` (OSRS HSL, luminance kept). `playerParts` only hides base body kits when a worn model exists, so the player is never partly invisible. `refreshGear()` swaps the whole rig (`me.r`) and keeps position and rotation. The axe and pickaxe are wieldable (`hasTool` checks equipped items too).
- **v40 attack:**
  - Cache rig (`cr`) player: lunges 0.32 toward the target, with a slash body sweep (`r.b.rotation.y` .7→-.7) for swords and scimitars, or a forward jab for daggers and staves.
  - Hit reaction for every non-`h` entity: knocked back 0.18, leans back, damped wobble over 320 ms (`hitT`).
- **Login with an OSRS client (5051/Tarnish) account:** a 401 from `/api/login` shows the **Use my OSRS client login** button. It calls `/api/register` with the same username and password, then starts the game. If the name is already a Bramblewick account, it says the password differs.
  - Real cross-checking is not done: 5051 stores `{username,password}` JSON in the Tarnish player files, and the game server Argon2-hashes the password on first login. Verifying it would need a read-only Argon2 check of the Tarnish profile inside the 5090 server, which is a server change plus restart (about 45 min).
  - Plan: add `POST /api/login` fallback → read `/opt/garyosrs/.../profiles/<user>.json` read-only → argon2 verify (or plain compare if `webRegistered`, not yet hashed) → create the linked Bramblewick account.
- **Tarnish client, `/client/`:**
  - Big button **Play the real OSRS client in your browser** → `http://104.207.83.247:5051/play-classic`. This is the existing 5051 noVNC launcher: `play_manager` gives each IP a slot and streams the real client. It is http only, so it opens in a new tab.
  - Run guide for `GaryOSRS-Client.zip`, which bundles the JRE for mac-aarch64, mac-x64 and win-x64: Mac, right-click `Gary OSRS.app` → Open; Windows, `Play Gary OSRS.bat`.
  - Game server port 4048 is up, and `/status` reports Lumbridge, world 31.
- Rollback files on the VPS: `/tmp/om.js.v39`, `/tmp/login.js.v39`, `/tmp/client.index.pre40`, `/tmp/index.v38.html`.

## 10. v41 (2026-11-01 ~23:25 PDT): OSRS client switch + play-classic fix
- **Why play-classic didn't load:** `/play-classic` (5051, `play_manager.py`) returns an iframe to `http://104.207.83.247:<6081..6083>/gary.html`, a noVNC/websockify per slot (Xvfb + client + x11vnc). ufw only allowed 5051, so the iframe hung. **Fix (no 5051 code change):** `ufw allow 6081:6083/tcp` (comment "Gary OSRS play-classic noVNC").
- Limits: 3 slots (`GOSRS_PLAY_SLOTS`), freed after 600 s idle (`GOSRS_PLAY_IDLE`). Each request from a new IP holds a slot, so curl/headless tests also use slots; check `GET :5051/play/status`. It runs over http only (mixed content), so it is always opened in a new tab, never iframed from https.
- **/3d Settings and Account tabs:** "Switch to OSRS client ▶" button (new tab → play-classic). The `/client/` page has "← Back to Bramblewick" (`/3d/`) plus the run guide.
- **Bigger map: NOT done** (usage cap). Plan:
  1. Re-run the cache pipeline (`/workspace/cachex/pipe`) for regions around Lumbridge (12850): swamp 12849, east bank/farms 12851/13106, Draynor 12338/12594. Emit one `om/w/r<id>.{bin,json}` per region.
  2. In om.js, stream by player distance: load regions within 1 of the current one, dispose the rest, and offset the world coordinates.
  3. Filter Tarnish `npc_spawns.json` by region bounds and spawn on load.
  4. Extend `walkable`/collision per region.
  About 3 h.
- **v42:** `showTool()` (called from `animEnt` for `me`) rebuilds the rig with the correct tool in hand while `me.act.t` is mine (pick), chop (axe) or fish (net), then restores `ST.eq` afterwards. `refreshGear(eqOverride)` skips the panel re-render for overrides.
- **Next (not done, usage cap): port the Tarnish server logic.** Read the read-only source under `/Volumes/THAWSPACE/Thawspace/Tarnish/` (server combat: `CombatFormula`/max-hit and accuracy rolls; skilling success chance per level and tool; NPC drop tables; `npc_spawns.json`; NPC combat defs). Then replace `hit()`, the skilling success rolls, `MS{}` and the drops in om.js with data tables generated from it, and use the cache seq ids per weapon (sword/scim slash 390, pick 625, axe 879) via cache frames. About 3–4 h.
