#!/usr/bin/env bash
set -euo pipefail
# The deem this project installs (package.json pins it), not whichever one the shell finds first.
PATH="$PWD/node_modules/.bin:$PATH"
fixture=$(mktemp -d /tmp/kyr-deem-choices.XXXXXX)
trap 'rm -rf "$fixture"' EXIT
bun run scripts/prove-creature-choices.ts prepare "$fixture"
deem validate --type creature > /dev/null
# Every invocation is independent, so they run concurrently: one job per line, "<output> <deem run arguments...>".
jobs="$fixture/jobs.txt"
seed_value="choice-"
for seed in $(seq 0 31); do
  echo "creature-$seed.json --type creature --seed $seed_value" >> "$jobs"
  for context in forest dragons blue_ancient animals people constructs frost bear_fixed ranger_fixed guardian_fixed; do
    echo "$context-$seed.json --type $context --seed $seed_value --templates $fixture/templates.json" >> "$jobs"
  done
  for category in dragon animal humanoid construct; do
    echo "$category-$seed.json --type $category --seed $seed_value" >> "$jobs"
  done
  seed_value+="x"
done
seed_value="choice-"
for seed in $(seq 0 127); do
  echo "extended-$seed.json --type creature --seed $seed_value --tables $fixture/extended-tables.json" >> "$jobs"
  seed_value+="x"
done
xargs -P "${DEEM_JOBS:-8}" -L 1 sh -c 'out=$1; shift; deem run "$@" > "'"$fixture"'/$out"' sh < "$jobs"
if deem run --type impossible --seed choice- --templates "$fixture/templates.json" > "$fixture/impossible.json" 2> "$fixture/impossible.err"; then
  echo 'An incompatible blue forest dragon was silently generated' >&2
  exit 1
fi
deem run --type creature --seed choice- > "$fixture/repeated.json"
cmp "$fixture/creature-0.json" "$fixture/repeated.json"
bun run scripts/prove-creature-choices.ts verify "$fixture"
