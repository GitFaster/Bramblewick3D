# Bramblewick 3D data schema (confirmed against 2D source)
- map.json: W=96,H=84. `t[y*W+x]` = tile type (2D `idx=(x,y)=>y*W+x`). Types: G0 grass,P1 path,WA2 water,S3 sand,WL4 stone wall,F5 floor,ST6 stone,R7 rock ground,BR8 bridge,FE9 fence,FL10 flowers,WW12 wood wall,CW13 castle wall. Blocking types (2D BLOCKT): 2,4,9,12,13.
- `wk[y*W+x]` = 1 if 2D `walk(x,y)` was true at dump time (includes object blocking; doors were closed -> 0; open doors become walkable at runtime).
- Tile (x,y) covers world [x,x+1]x[y,y+1]; centre is (x+.5,y+.5) (2D lerpTrail adds .5). 3D: world X = x, world Z = y (south = +Z), Y = height.
- objs: {type,x,y,open}; npcs: {x,y,name,lvl,ops,hp,kind}; ND: object defs {name,ops,ex}; pl: spawn [x,y].
- chunks/cN.bin (16x16 tiles, id = cy*6+cx): u32 nVerts,u32 nIdx, f32 pos[nVerts*3] (corner grid, x,h,y), f32 col[nVerts*3], u16 idx[nIdx]. cN.json: {id,x0,y0,walls:[[x,y,type]],water:[[x,y]],inst:{type:[[x,y,h,rot]]}}.

## Characters (chars.js)
Dispatched on explicit `npc.kind` via the KINDS table (no name regexes). Shared humanoid rig with joint pivots (neck, shoulder, elbow, hip, knee, hand) and outfit params; geometry/material pooled.
Done: player, pip (kid), fen (miner), banker, shopkeep, guide, rook, foreman, guard, warden, bknight, darkwiz, fanatic, skeleton, zombie, wight, hillgiant, mossgiant, ogre, demon, ashlord; animals: cow, wolf, boar, rat, mudhen (bird), spider, bat, toad.
New (v4): thornling (bramble body, branch limbs, thorns, leaves, root feet), drake + gdragon (reptile body, 5-segment tail, membrane wings, snout, horns), fireel (glowing stacked flame body, floats), lavaking (crowned molten-rock golem). No placeholders remain for current map kinds. three.js import is versioned (?v=4) in main.js and chars.js.
Animation: stride phase from distance travelled (walk stride 1.15, run 1.7), blends to idle, phase resets at rest.
