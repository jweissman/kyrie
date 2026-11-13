#!/bin/bash
# a1 default creation: the rats job taken from Bask, down to the rat-runs, the rats fought out (T), back at the rat-runs.
G=/var/tmp/kyrie/m19/go.sh; S=http://127.0.0.1:7359
at() { curl -s "$S/x?wait=50" | grep -v '^$' | sed -n 4p; }
/var/tmp/kyrie/m19/start.sh >/dev/null; $G k:1 w:2000 >/dev/null; at
$G "s:[data-subject=region__s2_merchant] button" w:2500 >/dev/null
$G "t:Ask about the rats in the corn-store" w:2000 >/dev/null; $G "t:Take your leave" w:2000 >/dev/null; at
for t in "To the old corn-store" "Down to the corn-store cellar"; do $G "t:$t" w:2000 >/dev/null; at; done
$G k:1 w:2000 >/dev/null; $G "t:To the rat-runs" w:2000 >/dev/null; at
$G "t:Attack the rats" w:3000 >/dev/null
for i in $(seq 1 12); do $G k:t w:2500 >/dev/null; curl -s "$S/x?wait=50" | grep -q "The fight is over" && break; done
$G "t:Go on" w:2500 >/dev/null; at
