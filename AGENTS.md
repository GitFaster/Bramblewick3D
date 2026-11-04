# Bramblewick3D project instructions

This is the Bramblewick3D game, not a blank project. Preserve the existing game
entry point, world, player progress, networking, control capabilities, and unrelated edits.
Do not replace the game with a notes app or unrelated demo. For a request that
clearly belongs to a separate app, explain the mismatch instead of overwriting
Bramblewick3D.

The SwiftUI/WKWebView wrapper lives in Sources/. Game rendering lives in the
JavaScript/WebGL code in WebGame/3d/. Trace the actual renderer imports before
editing. Graphics requests should improve the existing game renderer. Keep
RootView as the main app content and preserve bundled/live source loading.

Make focused changes. Use existing assets first, control mobile rendering cost,
and preserve collision, map coordinates, game rules, and saved data. Do not
remove files, change app identity, signing, server URLs, deployment scripts, or
auto-sync settings as part of graphics work.

On the M1 worker, do not build, test, launch the game, or operate other machines.
The bridge copies edits back with timestamped backups and builds Xcode on the
Air. State visual verification limits honestly. No gameplay automation or bots.
