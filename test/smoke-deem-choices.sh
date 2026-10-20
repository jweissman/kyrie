#!/usr/bin/env bash
set -euo pipefail
fixture=$(mktemp -d /tmp/kyr-deem-choices.XXXXXX)
trap 'rm -rf "$fixture"' EXIT
bun run bin/prove-creature-choices.ts prepare "$fixture"
deem validate --type creature > /dev/null
seed_value="choice-"
for seed in $(seq 0 31); do
  deem run --type creature --seed "$seed_value" > "$fixture/creature-$seed.json"
  for context in forest dragons blue_ancient animals people constructs frost bear_fixed ranger_fixed guardian_fixed; do
    deem run --type "$context" --seed "$seed_value" --templates "$fixture/templates.json" > "$fixture/$context-$seed.json"
  done
  for category in dragon animal humanoid construct; do
    deem run --type "$category" --seed "$seed_value" > "$fixture/$category-$seed.json"
  done
  seed_value+="x"
done
seed_value="choice-"
for seed in $(seq 0 127); do
  deem run --type creature --seed "$seed_value" --tables "$fixture/extended-tables.json" > "$fixture/extended-$seed.json"
  seed_value+="x"
done
if deem run --type impossible --seed choice- --templates "$fixture/templates.json" > "$fixture/impossible.json" 2> "$fixture/impossible.err"; then
  echo 'An incompatible blue forest dragon was silently generated' >&2
  exit 1
fi
deem run --type creature --seed choice- > "$fixture/repeated.json"
cmp "$fixture/creature-0.json" "$fixture/repeated.json"
bun run bin/prove-creature-choices.ts verify "$fixture"
