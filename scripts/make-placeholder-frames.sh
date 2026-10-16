#!/usr/bin/env bash
# Numbered placeholder frames for the hero film, so the player can be built before
# the real footage exists. See docs/LANGLOK_Website_Master_Plan.md §6.6.
#
#   bash scripts/make-placeholder-frames.sh
#
# Output (overwrites):
#   client/public/frames/hero/desktop/0001.webp … 0160.webp   1600×900
#   client/public/frames/hero/mobile/0001.webp  … 0100.webp   720×1280
#   client/public/frames/hero/poster.jpg                       first desktop frame
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/client/public/frames/hero"
DESKTOP_FRAMES=160
MOBILE_FRAMES=100

command -v ffmpeg >/dev/null || { echo "ffmpeg not found on PATH" >&2; exit 1; }

# drawtext needs a font file on systems without fontconfig (e.g. Windows).
FONT="${FONT:-}"
if [[ -z "$FONT" ]]; then
  for f in /c/Windows/Fonts/arial.ttf /mnt/c/Windows/Fonts/arial.ttf \
           /System/Library/Fonts/Supplemental/Arial.ttf \
           /usr/share/fonts/truetype/dejavu/DejaVuSans.ttf; do
    [[ -f "$f" ]] && FONT="$f" && break
  done
fi
FONT_OPT=""
if [[ -n "$FONT" ]]; then
  # ffmpeg filter syntax: escape the drive colon (C:/ → C\:/)
  case "$FONT" in
    /c/*) FONT="C:/${FONT#/c/}" ;;
  esac
  FONT_OPT="fontfile='${FONT/:/\\:}':"
fi

make_set() { # name width height frames fontsize
  local name=$1 w=$2 h=$3 n=$4 fs=$5
  rm -rf "${OUT:?}/$name" && mkdir -p "$OUT/$name"
  # Frame number, a caption, and a rain-blue progress bar sliding in along the bottom.
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=0xE6EBEE:s=${w}x${h}:r=8" \
    -f lavfi -i "color=c=0x2F7FC1:s=${w}x6:r=8" \
    -filter_complex "[0]drawtext=${FONT_OPT}text='%{eif\:n+1\:d\:4}':fontsize=${fs}:fontcolor=0x16233F:x=(w-tw)/2:y=(h-th)/2,\
drawtext=${FONT_OPT}text='LANGLOK hero placeholder · ${name}':fontsize=$((fs / 8)):fontcolor=0x5B6875:x=(w-tw)/2:y=h*0.78[bg];\
[bg][1]overlay=x='-w+w*(n+1)/${n}':y=H-h:eval=frame" \
    -frames:v "$n" -c:v libwebp -quality 60 \
    -start_number 1 "$OUT/$name/%04d.webp"
  echo "  $name: $(ls "$OUT/$name" | wc -l | tr -d ' ') frames"
}

echo "Writing placeholder frames to $OUT"
make_set desktop 1600 900 "$DESKTOP_FRAMES" 220
make_set mobile 720 1280 "$MOBILE_FRAMES" 160

ffmpeg -hide_banner -loglevel error -y -i "$OUT/desktop/0001.webp" -q:v 3 "$OUT/poster.jpg"
echo "  poster.jpg"
echo "Done."
