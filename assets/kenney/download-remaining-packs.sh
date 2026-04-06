#!/bin/bash
# Script to download remaining Kenney.nl asset packs that could not be
# auto-downloaded (kenney.nl was blocked by the network proxy at download time).
#
# These 9 packs need to be downloaded manually from kenney.nl:
#
# 1. Animal Pack Redux       - https://kenney.nl/assets/animal-pack-redux
# 2. Platformer Characters   - https://kenney.nl/assets/platformer-characters
# 3. Monster Builder Pack    - https://kenney.nl/assets/monster-builder-pack
# 4. UI Pack RPG Expansion   - https://kenney.nl/assets/ui-pack-rpg-expansion
# 5. Emotes Pack             - https://kenney.nl/assets/emotes-pack
# 6. Toon Characters 1       - https://kenney.nl/assets/toon-characters-1
# 7. Tiny Town               - https://kenney.nl/assets/tiny-town
# 8. Puzzle Pack 2           - https://kenney.nl/assets/puzzle-pack-2
# 9. Platformer Art Extended Enemies - https://kenney.nl/assets/platformer-art-extended-enemies
#
# Usage: Run this script from a machine with unrestricted internet access,
#        or download zip files manually and place them in this directory.
#
# The script will attempt to download from kenney.nl and extract each pack.

set -euo pipefail

DEST_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DEST_DIR"

PACKS=(
  "animal-pack-redux"
  "platformer-characters"
  "monster-builder-pack"
  "ui-pack-rpg-expansion"
  "emotes-pack"
  "toon-characters-1"
  "tiny-town"
  "puzzle-pack-2"
  "platformer-art-extended-enemies"
)

echo "Downloading remaining Kenney asset packs..."
echo "Destination: $DEST_DIR"
echo ""

SUCCESS=0
FAIL=0

for pack in "${PACKS[@]}"; do
  if [ -d "$pack" ] && [ "$(find "$pack" -type f | wc -l)" -gt 0 ]; then
    echo "[SKIP] $pack already exists with content"
    ((SUCCESS++))
    continue
  fi

  echo "[DOWNLOADING] $pack..."

  # Step 1: Fetch the asset page to find the download link
  PAGE_URL="https://kenney.nl/assets/${pack}"
  ZIP_URL=$(curl -sL "$PAGE_URL" 2>/dev/null | grep -oP "href='(https://kenney\.nl/media/pages/assets/[^']+\.zip)'" | head -1 | grep -oP "https://[^']+")

  if [ -z "$ZIP_URL" ]; then
    # Fallback: try common URL patterns
    ZIP_URL="https://kenney.nl/media/pages/assets/${pack}/download/${pack}.zip"
  fi

  # Step 2: Download the zip
  curl -sL -o "${pack}.zip" "$ZIP_URL" 2>/dev/null

  if [ -f "${pack}.zip" ] && file "${pack}.zip" | grep -q "Zip"; then
    mkdir -p "$pack"
    unzip -q -o "${pack}.zip" -d "$pack" 2>/dev/null
    rm -f "${pack}.zip"
    echo "[OK] $pack extracted successfully"
    ((SUCCESS++))
  else
    rm -f "${pack}.zip"
    echo "[FAIL] $pack - could not download. Please download manually from:"
    echo "       $PAGE_URL"
    echo "       Extract into: $DEST_DIR/$pack/"
    ((FAIL++))
  fi
done

echo ""
echo "Done. Success: $SUCCESS, Failed: $FAIL"
