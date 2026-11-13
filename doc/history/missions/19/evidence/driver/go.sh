#!/bin/bash
# Steps on the running play server: k:<keys> t:<text to click> s:<css selector> w:<ms> p (print page) shot:<name>
S=http://127.0.0.1:7359
enc() { python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$1"; }
for step in "$@"; do
  case "$step" in
    k:*) curl -s "$S/key?k=$(enc "${step#k:}")&wait=2200" >/dev/null;;
    t:*) curl -s "$S/text?t=$(enc "${step#t:}")&wait=2200" | grep -v '^$' | head -2;;
    s:*) curl -s "$S/click?s=$(enc "${step#s:}")&wait=2200" | grep -v '^$' | head -2;;
    w:*) curl -s "$S/x?wait=${step#w:}" >/dev/null;;
    shot:*) curl -s "$S/x?wait=100&shot=${step#shot:}" >/dev/null;;
    p) curl -s "$S/x?wait=50";;
  esac
done
