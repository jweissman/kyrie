#!/bin/bash
# Replays the Rededge journey in the built Mono client and saves named captures (png + screen text).
# Start the control server first: bun control-server.ts <capture-dir>   (needs Playwright Chromium; see README)
P=127.0.0.1:7358
D=$(cd "$(dirname "$0")" && pwd)
OUT=$D
d() { curl -s "$P/do?row=$1&act=$2&wait=${3:-1200}" > /dev/null; }
k() { curl -s "$P/key?k=$1&wait=${2:-500}" > /dev/null; }
js() { curl -s -X POST "$P/eval" --data-binary "$1" | tr -d '"'; }
cap() { local r; r=$(curl -s "$P/x?wait=400&shot=1"); cp "$(echo "$r" | head -1)" "$OUT/$1.png"; echo "$r" | tail -n +3 > "$OUT/$1.txt"; echo "captured $1"; }
# Talk to someone about the topic whose label starts with $2, then leave the conversation.
talk() {
  curl -s "$P/do?row=$1&wait=300" > /dev/null
  local m; m=$(js "String((window.kyrieMono.inspect().menu ?? []).findIndex(a => a.label === 'Talk') + 1)")
  if [ "$m" != 0 ]; then k "$m" 500; else k Enter 500; fi
  local i; i=$(js "String(window.kyrieMono.inspect().rows.findIndex(r => r.label.startsWith('$2')) + 1)")
  [ "$i" = 0 ] && { echo "NO TOPIC $2"; js "JSON.stringify(window.kyrieMono.inspect().rows.map(r=>r.label))"; return; }
  k "$i" 400; k Enter 1500; [ -n "$3" ] && cap "$3"; k Escape 500
}
curl -s "$P/goto?q=%3Fworld%3Dthorn%26terrain%3Dmountain&wait=3500" > /dev/null; cap 01-create
k Enter 4500; cap 02-coldhill
d Enter Go; d Iamond "Ask%20about%20the%20ewes"; cap 03-iamond
d Out Go; d "Stone%20Delf" Go; talk Garth "Ask Garth what" 04-garth
d "Enter%20Silkholme" Go; d "The%20frame" Go; talk Odile "Ask Odile" 05-odile
d "The%20lip" Go; d "Out%20to%20Stone" Go; talk Garth "Ask Garth for the ewe"
d "Enter%20Silkholme" Go; d "Enter%20The%20caves" Go; d "The%20nest" Hack; d "The%20nest" Go 1500
curl -s "$P/do?row=the%20brood-mother&wait=300" > /dev/null; cap 06-brood-mother
k 1 2500; cap 07-fed
d "The%20lower" Go; d "Out%20to%20the%20frame" Go; talk Odile "Speak with Odile" 08-odile-thanks
d "The%20lip" Go; d "Out%20to%20Stone" Go; d Coldhill Go
d Warren Go; d "Warren," "Ask%20about%20the%20old"; d "Coldhill%20green" Go
d "The%20shrine" Go; d Cillian "Ask%20about%20the%20opened"; d "Coldhill%20green" Go
d Enter Go; d Iamond "Ask%20about%20the%20light"; k j 500; cap 09-journal; k e 300
d Iamond Take 3000; d "Wait%20until" Wait; d Out Go; d "Red%20Watch" Go 2000
curl -s "$P/do?row=Enter%20The%20tower:%20the%20crypt&wait=300" > /dev/null; cap 10-red-watch
k Escape 300; d "Enter%20The%20tower:%20the%20crypt" "Go%20by%20a%20barred" 1500; d "The%20study" Go 1500
curl -s "$P/do?row=Burke&wait=300" > /dev/null; cap 11-study; k Escape 300
d "a%20daybook" Examine 1500; curl -s "$P/do?row=the%20bone&wait=300" > /dev/null; k 1 2500; cap 12-lantern
talk Burke "Ask Burke who" 13-burke; talk Burke "Tell Burke to leave"
d "The%20tower%20hall" Go; d "Out%20to%20Red" Go; d Coldhill Go; d "The%20shrine" Go
talk Cillian "Tell Cillian" 14-cillian
d "Coldhill%20green" Go; d Enter Go; d Iamond Take 3000; cap 15-level-two
k c 500; curl -s "$P/do?row=Dori&wait=300" > /dev/null; k Escape 300; cap 16-dori-sheet; k e 300
d Out Go; d "Wait%20until" Wait; d Peakview Go; d Enter Go; cap 17-contact
d Baldrus "Ask%20about%20trouble"; d Xander Take 3000; d "Wait%20until" Wait; d Out Go; d "Peak%20Delf" Go 1500
curl -s "$P/do?row=the%20pack&wait=300" > /dev/null; cap 18-the-pack
k 1 2500; cap 19-fight
for i in $(seq 1 40); do
  r=$(js "$(cat $D/policy.js)"); [ "$r" = done ] && break; [ "$r" = wait ] && { curl -s "$P/x?wait=800" > /dev/null; continue; }
  IFS='|' read a who say <<< "$r"; echo "  $say"; k "$a" 300
  t=$(js "$(cat $D/target.js)('$who')"); [ "$t" != nomenu ] && k "$t" 2200
done
cap 20-after-fight
