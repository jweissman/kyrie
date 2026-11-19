#!/usr/bin/env bash
# One move to the running game: append it to lines.txt and print the turn that answers it (show.py; `full` as a
# second argument shows every row). Waits for the runner's answer, at most three minutes.
dir="$(cd "$(dirname "$0")" && pwd)"
n=$(wc -l < "$dir/out.jsonl")
echo "$1" >> "$dir/lines.txt"
for _ in $(seq 1 900); do
  m=$(wc -l < "$dir/out.jsonl")
  if [ "$m" -gt "$n" ]; then sleep 0.1; tail -n +$((n + 1)) "$dir/out.jsonl" | python3 "$dir/show.py" $2; exit 0; fi
  sleep 0.2
done
echo TIMEOUT
