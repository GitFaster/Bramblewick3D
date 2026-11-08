# Bramblewick Full Rehaul Guidebook

**Target:** Cute, professional, Zelda-inspired mobile adventure.  
**Away from:** RuneScape density, abbreviations, chaotic HUD, dull panels.  
**Current build:** v86  
**Goal:** Mobile-first, less chaotic, actually fun, warm language, larger touch targets.

---

## 1. Core Vision

Bramblewick already has a living village, multiplayer, quests, skills, inventory, equipment, and combat. The systems work. The feeling does not.

The current interfaces read as classic RuneScape on a phone. That is the problem this guidebook solves.

**Target feeling:**  
Breath of the Wild exploration wonder + cozy village life + light MMO social presence, designed for one thumb. Cute but not childish. Professional but not sterile. Fun within the first 30 seconds.

**Non-negotiable principles:**
- Mobile-native first. Large targets (44pt+), clear hierarchy, collapsible panels.
- The world is the star. UI stays quiet until needed.
- No RuneScape visual or language DNA. No dense skill grids, no “Attack XP”, no tiny inventory cells.
- Depth exists but is never forced.
- Every system should create a small moment of delight or clear progress.
- Less chaotic. Hierarchy over density.

---

## 2. Art Direction & Graphics

Move from the current low-poly / RuneScape-adjacent look to a softer, more illustrated 3D style with stronger character readability and atmosphere.

**Visual rules:**
- Softer lighting and gentle rim lights so characters never blend into the environment.
- Cleaner grass, paths, and foliage. Less visual noise.
- Subtle character outlines or highlight rings when nearby or targeted.
- Quality presets: Low / Medium / High / **Ultra** (default Ultra where possible).
- Optional atmosphere: drifting petals, lantern glow, soft fog — all toggleable.
- Signature palette: charcoal panels, warm gold accents, moss greens, cream text, purple roofs.

**Acceptance:** A new player should say “this looks like a real mobile adventure game” within five seconds, not “this looks like RuneScape.”

---

## 3. Complete Naming Overhaul

Every current name carries RuneScape associations. Rename the entire interface language.

| Current              | New Name                  | Reason                        |
|----------------------|---------------------------|-------------------------------|
| Satchel              | Pack / Traveler’s Pack    | Warmer, less inventory-grid   |
| Outfit               | Worn Gear / Gear          | Clearer on mobile             |
| Talents              | Paths / Ways              | Avoid skill-grid association  |
| Battle arts          | Moves / Combat Style      | Less menu language            |
| Adventures           | Stories / Village Requests| More narrative                |
| XP drops / Attack XP | Sparks / Progress         | Softer language               |
| Guide’s Tasks        | Village Requests          | Helpful tone                  |
| Free Quests          | Free Stories              | Narrative framing             |

**Skill renames (examples):**
- Thick skin → Tough Hide / Sturdy
- Burst of strength → Power Surge / Strong Arm
- Prayer → Blessing / Inner Light
- Spellcraft → Arcane Craft / Spellweaving
- All other abbreviated skills → full, warmer names that fit the new Paths

Prefer full words. Prefer story language over system language.

---

## 4. New Story & Request Names

Replace the current task list with warmer names:

- Talk to the Guide → **Meet the Village Guide**
- Defeat a bramble gremlin → **Clear the Bramble Path**
- Chop some logs → **Gather Firewood for the Inn**
- Mine some ore → **Find the Glowing Stones**
- Visit the bank → **Store Your Treasures**
- Eat some food → **Share a Meal at the Inn**
- Light a fire → **Kindle the Hearth**
- Cook some food → **Prepare the Moonberry Pie**
- Meadow Mischief → **The Mischief in the Meadow**
- The Moonberry Pie → **The Missing Moonberry**

Continue this pattern for every future story. Names should invite curiosity.

---

## 5. Main HUD Redesign

Current HUD piles too many elements over the world.

**New portrait layout:**
- Top-left: tiny avatar + name + compact stacked bars (numbers only on tap).
- Top-right: small minimap that expands on tap. Never a permanent large map.
- Bottom-left: small translucent movement stick (can hide when idle).
- Bottom-right: maximum 3–4 large primary action buttons (Attack, Interact, Specials).
- Bottom edge: thin collapsible quick bar (Pack, Stories, Gear, Paths).
- Online count and story tracker become small badges that expand on tap.
- No oversized white touch-effect overlay.
- Floating chat bubble only during active conversation.

The world remains the star.

---

## 6. Pack (Inventory) Redesign

Replace the dense Satchel grid.

- Larger item cards or 4-column grid with bigger icons and clear quantity badges.
- Long-press or drag for options (Use, Drop, Examine, Equip).
- Clear sections or tabs: Gear, Consumables, Materials, Story items.
- Coins shown as a prominent total at the top.
- Empty slots soft and minimal.
- Quick “Use last item” or favorite slots for common consumables.
- Smooth open/close animation.

---

## 7. Worn Gear Redesign

Replace the dense Outfit slot grid.

- Character silhouette in the center with clear slot positions around it.
- Equipped items appear as larger icons on the silhouette.
- Bonuses shown as clean icons with numbers, not a text list at the bottom.
- One tap opens the Pack filtered to that slot.
- Visual preview updates immediately when gear changes.
- Slot names are full words or clear icons.
- Empty slots are gentle outlines.

---

## 8. Paths (Skills) Redesign

**Highest-impact visual change.** Completely replace the Talents abbreviated grid.

- Group into 4–5 clear Paths: **Combat**, **Gathering**, **Crafting**, **Support**, **Exploration**.
- Each path is a vertical progress track or card list, not a 3-column grid of abbreviations.
- Full names, icons, and a short flavor line (“The Way of the Blade”, “Listening to the forest”).
- Current level and next threshold shown clearly.
- Tapping a path opens a dedicated page with related activities.
- Small visual celebration on level-up.
- No abbreviations. Full words only.
- Rename every underlying skill to fit the new Paths (see section 3).

---

## 9. Moves (Combat) Redesign

Replace Battle arts.

- Primary attack always available on the main button.
- Style (Accurate / Aggressive / Defensive) becomes a quick toggle or swipe, not a full menu.
- Auto-retaliate becomes a clear, labeled toggle: **“Fight back automatically”**.
- Light animation feedback and hit sparks so combat feels alive.
- Optional “Combat in 3D” becomes a practice dummy mode or is removed.
- Depth (styles, bonuses) hidden behind one tap instead of always shown.
- Clear feedback on hit, miss, or block.

---

## 10. Stories (Quests) Interface

Replace the Adventures list with a journal.

- Collapsible sections: Village Requests, Free Stories, Completed.
- Each entry shows a short one-line description and clear progress indicator.
- Completed stories get a soft check and collapse by default.
- Active story can pin a small tracker to the HUD that expands on tap.
- “Show on map” or “Start nearby” button for each active story.
- Use the warmer names from section 4.
- Journal-like visual treatment (soft paper or panel texture).

---

## 11. Settings Redesign

- Group into clear sections: **Controls**, **Display**, **Audio**, **Gameplay**.
- Use proper toggles and sliders with short explanations.
- Graphics preset selector (Low / Medium / High / **Ultra**) with a short performance note. Default Ultra where possible.
- **Remove Reset progress entirely.**
- Camera zoom and Player highlights remain easy to find.
- Settings should never feel like a debug menu.

---

## 12. Mobile Controls Overhaul

**Highest priority.**

- Smaller, more translucent movement stick that can be hidden when not in use.
- Larger primary action buttons with clear icons and optional short labels.
- Customizable button layout (player can move or hide secondary buttons).
- Smart auto-attack when an enemy is targeted.
- Remove or drastically shrink any oversized white touch-effect overlay.
- Support both portrait (primary) and landscape with intentional layouts.
- Respect iPhone safe areas (notch, home indicator, dynamic island).
- One primary action always reachable with the thumb without stretching.

---

## 13. Minimap & Navigation

- Live player arrow that rotates with facing.
- Distinct markers for other players, NPCs, and story objectives.
- Pinch or button zoom with sensible limits.
- Tap-to-set destination (auto-walk or path highlight).
- Starts compact; expands to a larger but still non-fullscreen view.
- Never covers more than ~25% of the screen when open.
- Works cleanly in both portrait and landscape.

---

## 14. Multiplayer & Social Polish

- Clear visual distinction between real players and NPCs (subtle outline or nameplate style).
- Online count as a small badge, not a large permanent panel.
- Tap another player for a simple interaction menu (wave, inspect, later trade).
- Lightweight chat that can be fully collapsed.
- Nameplates that stay readable without overlapping the world.
- Player highlights option remains easy to toggle.

---

## 15. Fun Things to Do

Add light, delightful loops so the game is not just a checklist:

- Village festivals that change lighting and add temporary activities.
- Simple gathering with satisfying feedback (chop, mine, pick with clear progress and sound).
- Cooking and crafting that produce visible results.
- Light exploration rewards (hidden spots, short environmental puzzles).
- Daily or weekly “village requests” that feel helpful rather than grindy.
- A practice dummy or friendly sparring area.
- Small social moments: sitting at the inn, sharing food, waving at other players.
- Short, self-contained stories that can be finished in one session.

---

## 16. Suggested Implementation Order

Work in this sequence. Test on a real iPhone after each phase.

1. **Phase 1** — HUD cleanup + better mobile proportions + safe areas + collapsible panels  
2. **Phase 2** — Controls overhaul (smaller stick, larger targets, remove white overlay)  
3. **Phase 3** — Pack + Worn Gear redesign (visual, less grid-like, larger icons)  
4. **Phase 4** — Paths (skills) redesign — remove the RuneScape-style grid entirely  
5. **Phase 5** — Stories interface + new naming across the board  
6. **Phase 6** — Minimap interactivity + navigation  
7. **Phase 7** — Combat feedback + Moves panel simplification  
8. **Phase 8** — Graphics presets + atmosphere polish + character visibility  
9. **Phase 9** — Multiplayer cues + light social touches  
10. **Phase 10** — New fun activities and village life loops  

---

## 17. How to Use This Guide with ChatGPT

Upload this markdown (or paste a single phase) and say:

> Implement Phase X of the Bramblewick Full Rehaul Guidebook. Current version is v86. Keep existing multiplayer, combat, quests, and map data. Focus only on the items in this phase. Show code changes and a short test checklist. Make it mobile-first, less chaotic, and free of RuneScape visual language. Use the cute redesign images as visual reference. Graphics Ultra where possible. Test on iPhone portrait.

Always request device testing notes and screenshots after each phase. Prefer small, testable changes over large rewrites.

---

## 18. Master Checklists

**Before calling any screen “done”:**
- [ ] Can it be used comfortably with one thumb?
- [ ] Does the world remain visible and readable underneath?
- [ ] Are touch targets at least 44 points?
- [ ] Is the language free of RuneScape-style abbreviations and dense grids?
- [ ] Does it feel cute and professional rather than dense or chaotic?
- [ ] Does it work in portrait and respect iPhone safe areas?
- [ ] Can a new player understand what to do without a tutorial overlay?
- [ ] Does opening and closing the panel feel smooth and intentional?

**Before calling the rehaul “successful”:**
- [ ] A new player says it looks like a real mobile adventure game within five seconds.
- [ ] No interface feels like a spreadsheet or classic RuneScape panel.
- [ ] Combat and movement feel thumb-friendly.
- [ ] There is at least one delightful village activity that is not a quest checklist item.
- [ ] Graphics presets exist and Ultra mode looks good.
- [ ] The village feels alive even when few players are online.
- [ ] A player can walk around for five minutes without opening a menu and still enjoy it.

---

## 19. Closing Note

Bramblewick already has a world, systems, multiplayer presence, and a village that people can walk around in. The rehaul is about presentation, clarity, language, and joy.

Make every interface feel intentional. Make the village feel alive. Make the phone feel like the natural home of the game. When a new player opens it, they should smile and want to walk around — not open a spreadsheet of skills.

Start with Phase 1. Keep the existing systems. Change how they feel.

---

*End of Full Rehaul Guidebook*
