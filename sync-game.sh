#!/bin/bash
# Pull newest live Bramblewick 3D game + server source into the Xcode project,
# bump build number, build, install and launch on the iPhone.
# Usage: ./sync-game.sh            (full)
#        ./sync-game.sh --no-build (only sync files)
#        ./sync-game.sh --from-xcode (used by the optional Xcode build phase: sync only)
set -euo pipefail
P="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
DEV=00008120-000145DC02040032
VPS=vps; R=/opt/bramblewick-link
cd "$P"
SSH="ssh -o BatchMode=yes -o ConnectTimeout=10"
EXC=(--exclude='*.bak*' --exclude='*.db' --exclude='*.sqlite*' --exclude='*.env' --exclude='.env*'
     --exclude='*.pem' --exclude='*.key' --exclude='*.crt' --exclude='secret_key' --exclude='*htpasswd*'
     --exclude='*.log' --exclude='__pycache__' --exclude='backups' --exclude='data' --exclude='.DS_Store')
echo "== 1/5 Pulling newest live web game (read-only from VPS)"
mkdir -p WebGame Server/app Server/deploy/nginx
rsync -a --delete -i "${EXC[@]}" -e "$SSH" $VPS:$R/public/3d/ WebGame/3d/ | sed 's/^/  /'
rsync -a --delete -i "${EXC[@]}" -e "$SSH" $VPS:$R/public/mods/ WebGame/mods/ | sed 's/^/  /'
echo "== 2/5 Pulling server source (no data/secrets)"
rsync -a --delete -i "${EXC[@]}" --include='*/' --include='*.py' --include='*.html' --exclude='*' \
  -e "$SSH" $VPS:$R/app/ Server/app/ | sed 's/^/  /'
$SSH $VPS "$R/.venv/bin/pip freeze" > Server/requirements.txt
$SSH $VPS 'cat /etc/systemd/system/bramblewick-link.service' > Server/deploy/bramblewick-link.service
for s in bramblewick-https bramblewick-play-5091 bramblewick-play-5092; do
  $SSH $VPS "cat /etc/nginx/sites-available/$s" > Server/deploy/nginx/$s.conf || true; done
# Redact anything that looks like a secret value
HITS=$(grep -rIlE '(password|passwd|secret|token|api[_-]?key)[[:space:]]*[=:][[:space:]]*["'"'"'][^"'"'"']{8,}' Server WebGame || true)
[ -n "$HITS" ] && { echo "  !! possible secrets found, redacting in: $HITS"; for f in $HITS; do
  perl -pi -e 's/((password|passwd|secret|token|api[_-]?key)\s*[=:]\s*["\x27])[^"\x27]{8,}(["\x27])/$1REDACTED$3/gi' "$f"; done; }
find Server WebGame \( -name '*.db' -o -name '*.sqlite*' -o -name '.env*' -o -name '*.pem' -o -name '*.key' -o -name 'secret_key' \) -print -delete
[ "${1:-}" = "--from-xcode" ] && exit 0
echo "== 3/5 Changes vs last sync"; git -C "$P" status --short 2>/dev/null | head -40 || true
[ "${1:-}" = "--no-build" ] && exit 0
echo "== 4/5 Bump build number + regenerate project"
CUR=$(awk '/CURRENT_PROJECT_VERSION:/{gsub(/"/,"",$2);print $2}' project.yml); NEW=$(( CUR < 3 ? 4 : CUR + 1 ))
perl -pi -e "s/CURRENT_PROJECT_VERSION: \"?\d+\"?/CURRENT_PROJECT_VERSION: \"$NEW\"/" project.yml
echo "  CFBundleVersion $CUR -> $NEW"
xcodegen generate --quiet
echo "== 5/5 Build, install, launch on every connected device"
DEVS=$(xcrun devicectl list devices 2>/dev/null | awk '/connected|paired/ && /iPhone|iPad/ {for(i=1;i<=NF;i++) if($i ~ /^[0-9A-F]{8}-[0-9A-F]{16}$/) print $i}')
[ -z "$DEVS" ] && DEVS=$DEV
DARGS=(); for d in $DEVS; do DARGS+=(-destination "id=$d"); done
echo "  devices: $DEVS"
launchctl asuser $(id -u) xcodebuild -project Bramblewick3D.xcodeproj -scheme Bramblewick3D -configuration Debug \
  "${DARGS[@]}" -derivedDataPath "$HOME/Library/Developer/Xcode/DerivedData" -allowProvisioningUpdates build 2>&1 | grep -E "SUCCEEDED|FAILED|error:" | head -20
APP="$HOME/Library/Developer/Xcode/DerivedData/Build/Products/Debug-iphoneos/Bramblewick3D.app"
for d in $DEVS; do
  echo "  -- $d"
  xcrun devicectl device install app --device $d "$APP" 2>&1 | grep -E "installed|ERROR" | head -3
  xcrun devicectl device process launch --terminate-existing --device $d com.gary.Bramblewick 2>&1 | tail -1 || true
done
echo "Done $(date '+%-I:%M %p'). (Launch error 10004 is usually harmless.)"
