# Bramblewick3D graphics task

Improve the graphics in the existing Bramblewick3D game. Preserve its identity,
world, gameplay rules, saved progress, networking, control capabilities, and
existing user edits. Improve the interaction design and mobile controls.

The iOS app is a SwiftUI/WKWebView wrapper. Its game visuals come from the
bundled JavaScript/WebGL game in `WebGame/3d/`. Inspect `Sources/App.swift`,
`Sources/GameSource.swift`, `WebGame/3d/index.html`, and the actual renderer imports
before editing. Find the code that currently draws the scene; do not add an
unused second renderer. Keep the game app entry point loading `RootView()`.

First identify three visible weaknesses in the current graphics. Implement the
highest-impact improvements that fit the existing style, prioritizing:

1. Better lighting and depth: balanced sun and ambient light, readable shadows,
   consistent colors, and restrained fog. Keep important objects visible.
2. Richer terrain and scenery: reduce flat-looking surfaces, improve material
   variation, water, vegetation, and the sky, while preserving collision and map
   coordinates.
3. Clearer characters and effects: improve silhouettes, material contrast,
   animation, and restrained particles without changing combat or game rules.

Monster interaction: make enemies easier to select on a phone. Show a clear
selected-target marker, name and health bar, readable attack/hit feedback, and
out-of-range feedback. Provide an obvious way to switch or clear the target.
Keep existing combat rules, enemy stats, loot and server validation intact.

Mobile controls: use comfortable touch targets, readable labels and safe-area
spacing. Prevent taps on menus or attack controls from also moving the camera
or selecting enemies behind them. Support portrait and landscape layouts,
including small screens. Preserve existing movement and camera capabilities.

Terrain: improve ground material variation, shorelines, water, vegetation and
landmarks. Keep height rendering consistent with the existing collision and
navigation systems; do not move spawns, break paths or change world coordinates.

Map: make the player marker and existing useful locations readable, provide a
clear legend, and improve touch-friendly pan, zoom and recenter controls. Keep
markers aligned to actual world coordinates. Do not add autoplay or auto-travel.

Make focused improvements to the real scene instead of replacing the whole game.
Use existing assets and dependencies first. Limit shadow resolution, particles,
draw calls, and device pixel ratio for mobile hardware. Keep a simpler quality
setting available. Do not claim a frame rate without measuring it.

Work in the project copy on the M1. Do not run Xcode, builds, tests, or the game
on the M1. The bridge returns changes with backups and builds on the Air. Do not
deploy or alter live servers, auto-sync, signing, bundle ID, or networking URLs.
Preserve the app's current bundled/live loading and fallback behavior.

The result must still be Bramblewick3D. Do not replace its opening screen with
a notes app, demo, or unrelated app. Do not delete files or rewrite unrelated
systems. No gameplay automation or bots.

Finish with the changed files, three visible improvements, and any limitations.
The Air build result is reported separately by the bridge. A successful build
does not prove visual quality: request a screenshot from the Air or iPhone for
visual review if no actual rendered screenshot is available. Never claim a
visual comparison or successful build that was not performed.
