#!/bin/bash
# Fresh game in seed $1 (default a1), default creation, straight through to the first page.
S=http://127.0.0.1:7359
curl -s "$S/goto?q=%3Fworld%3D${1:-a1}&wait=3000" >/dev/null
for i in 1 2 3 4 5; do curl -s "$S/text?t=CONTINUE&wait=500" >/dev/null; done
curl -s "$S/click?s=%5Bdata-action%3Dstart%5D&wait=12000" >/dev/null
curl -s "$S/x?wait=50"
