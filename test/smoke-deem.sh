#!/usr/bin/env bash
set -euo pipefail
fixture=$(mktemp -d /tmp/kyr-deem-smoke.XXXXXX)
trap 'rm -rf "$fixture"' EXIT
bun run scripts/prove-creature-composition.ts prepare "$fixture"
deem validate --type creature > /dev/null
deem run --seed public-cli --type creature > "$fixture/creature.json"
for example in blue_young red_ancient frost_wolf frost_ranger frost_construct bear copper_dragon frost_bear stone_guardian; do
  deem run --seed public-cli --type "$example" --templates "$fixture/templates.json" > "$fixture/$example.json"
done
bun run scripts/prove-creature-composition.ts verify "$fixture"
