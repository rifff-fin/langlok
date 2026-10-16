#!/usr/bin/env bash
# Cut the graded hero master into WebP frame sequences + poster.
# See docs/LANGLOK_Website_Master_Plan.md §6.5.
#
#   bash scripts/extract-frames.sh hero_master.mov [desktopFrames=160] [mobileFrames=100]
#
# Budgets: desktop ≤ 12 MB total, mobile ≤ 5 MB total. The script prints the totals.
set -euo pipefail

MASTER="${1:?usage: extract-frames.sh <master.mov> [desktopFrames] [mobileFrames]}"
DESKTOP_FRAMES="${2:-160}"
MOBILE_FRAMES="${3:-100}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/client/public/frames/hero"

command -v ffmpeg >/dev/null || { echo "ffmpeg not found on PATH" >&2; exit 1; }
command -v ffprobe >/dev/null || { echo "ffprobe not found on PATH" >&2; exit 1; }
[[ -f "$MASTER" ]] || { echo "No such file: $MASTER" >&2; exit 1; }

SECONDS_LEN=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$MASTER")
fps() { awk -v n="$1" -v s="$SECONDS_LEN" 'BEGIN { printf "%.4f", n / s }'; }
DESKTOP_FPS=$(fps "$DESKTOP_FRAMES")
MOBILE_FPS=$(fps "$MOBILE_FRAMES")
echo "Master: ${SECONDS_LEN}s → desktop ${DESKTOP_FPS} fps, mobile ${MOBILE_FPS} fps"

rm -rf "${OUT:?}/desktop" "${OUT:?}/mobile"
mkdir -p "$OUT/desktop" "$OUT/mobile"

# Desktop 16:9 → 1600 px wide
ffmpeg -hide_banner -loglevel error -y -i "$MASTER" \
  -vf "fps=${DESKTOP_FPS},scale=1600:-2:flags=lanczos" \
  -c:v libwebp -quality 70 -compression_level 6 \
  -start_number 1 "$OUT/desktop/%04d.webp"

# Mobile 9:16 → centre crop, 720 px wide
ffmpeg -hide_banner -loglevel error -y -i "$MASTER" \
  -vf "fps=${MOBILE_FPS},crop=ih*9/16:ih,scale=720:-2:flags=lanczos" \
  -c:v libwebp -quality 65 -compression_level 6 \
  -start_number 1 "$OUT/mobile/%04d.webp"

# Poster (first frame) for LCP
ffmpeg -hide_banner -loglevel error -y -i "$MASTER" -frames:v 1 \
  -vf "scale=1600:-2" -q:v 3 "$OUT/poster.jpg"

report() {
  local dir=$1 budget=$2
  local count size
  count=$(ls "$dir" | wc -l | tr -d ' ')
  size=$(du -sm "$dir" | cut -f1)
  echo "  $(basename "$dir"): $count frames, ${size} MB (budget ${budget} MB)"
  if (( size > budget )); then echo "  ⚠ over budget — lower -quality or frame count" >&2; fi
}
report "$OUT/desktop" 12
report "$OUT/mobile" 5
echo "Done."
