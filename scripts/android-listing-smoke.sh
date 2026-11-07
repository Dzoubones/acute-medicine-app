#!/usr/bin/env bash
set -euo pipefail

artifact_dir="$(pwd)/artifacts/android-listing"
package_id=org.acutemedicaltake.app
mkdir -p "$artifact_dir"
adb shell wm size 1080x1920
adb shell wm density 420
adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global animator_duration_scale 0
adb install -r artifacts/app-debug.apk
adb logcat -c
adb shell am start -W -n "$package_id/.MainActivity"

dump_screen() {
  adb shell uiautomator dump /sdcard/amt-listing.xml >/dev/null 2>&1
  adb pull /sdcard/amt-listing.xml "$artifact_dir/current.xml" >/dev/null 2>&1
}

has_screen_text() {
  python3 - "$artifact_dir/current.xml" "$1" <<'PY'
import sys
from xml.etree import ElementTree

root = ElementTree.parse(sys.argv[1]).getroot()
text = ' '.join(node.get('text', '') + ' ' + node.get('content-desc', '') for node in root.iter())
raise SystemExit(0 if sys.argv[2] in text else 1)
PY
}

ready=0
for attempt in $(seq 1 45); do
  if dump_screen && has_screen_text 'Acute medicine, organised for the take.'; then
    ready=1
    break
  fi
  sleep 2
done
test "$ready" = 1
adb shell pidof "$package_id"
adb exec-out screencap -p > "$artifact_dir/01-home.png"

tap_label() {
  dump_screen
  coordinates=$(python3 - "$artifact_dir/current.xml" "$1" <<'PY'
import re
import sys
from xml.etree import ElementTree

root = ElementTree.parse(sys.argv[1]).getroot()
matches = [node for node in root.iter() if sys.argv[2] in (node.get('text'), node.get('content-desc'))]
assert matches, f'Visible control missing: {sys.argv[2]}'
node = next((item for item in matches if item.get('clickable') == 'true'), matches[-1])
x1, y1, x2, y2 = map(int, re.findall(r'\d+', node.get('bounds', '')))
print((x1 + x2) // 2, (y1 + y2) // 2)
PY
  )
  read -r tap_x tap_y <<< "$coordinates"
  adb shell input tap "$tap_x" "$tap_y"
  sleep 2
}

tap_label '⚡ Offline'
dump_screen
has_screen_text 'Offline emergencies'
adb exec-out screencap -p > "$artifact_dir/02-offline.png"
tap_label '⌕ Search'
dump_screen
has_screen_text 'Find a pathway'
adb exec-out screencap -p > "$artifact_dir/03-search.png"
tap_label '••• More'
dump_screen
has_screen_text 'Privacy policy'
adb logcat -d -s AndroidRuntime:E chromium:E > "$artifact_dir/launch.log"
if rg -i 'FATAL EXCEPTION|Fatal signal|Uncaught (TypeError|ReferenceError|SyntaxError)' "$artifact_dir/launch.log"; then
  exit 1
fi
adb shell am force-stop "$package_id"
