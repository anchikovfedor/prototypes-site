#!/usr/bin/env bash
set -euo pipefail

# node не в PATH — подгружаем nvm
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

NAME="${1:-}"
TARGET="${2:-mobile-app}"

if [ -z "$NAME" ]; then
  echo "usage: scaffold.sh <kebab-name> [mobile-app|desktop-web|adaptive]" >&2
  exit 1
fi
if ! printf '%s' "$NAME" | grep -Eq '^[a-z][a-z0-9-]*$'; then
  echo "error: name must be kebab-case (^[a-z][a-z0-9-]*$): $NAME" >&2
  exit 1
fi
case "$TARGET" in
  mobile-app | desktop-web | adaptive) ;;
  *) echo "error: invalid target: $TARGET" >&2; exit 1 ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/../../.." && pwd)"
SRC="$REPO/apps/_template"
DST="$REPO/apps/$NAME"

[ -d "$SRC" ] || { echo "error: template not found: $SRC" >&2; exit 1; }
[ -e "$DST" ] && { echo "error: already exists: $DST" >&2; exit 1; }

# копия шаблона без артефактов
rsync -a --exclude node_modules --exclude dist "$SRC/" "$DST/"

# переименование и таргет (BSD sed, macOS)
sed -i '' "s#@proto/app-template#@proto/app-$NAME#" "$DST/package.json"
sed -i '' "s#target=\"mobile-app\"#target=\"$TARGET\"#" "$DST/src/App.tsx"
sed -i '' "s#Prototype — Template#Prototype — $NAME#" "$DST/index.html"
sed -i '' "s#<Название прототипа>#$NAME#" "$DST/HANDOFF.md"

# привязать workspace
( cd "$REPO" && npm install >/dev/null 2>&1 )

echo "created apps/$NAME (target=$TARGET)"
echo "next: register it in apps/index/src/prototypes.ts, then: npm run dev -w apps/$NAME"
