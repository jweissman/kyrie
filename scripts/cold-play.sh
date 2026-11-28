#!/usr/bin/env bash
# A cold play, set up and run (mission-22/current-sprint.md's player protocol, S0-5; the blind robot player of cold plays
# 4 to 6): a worktree at the revision played, the runner started on it and fed one move at a time from lines.txt, the
# player's tools (send.sh, show.py) and the protocol's prompt written to a play directory, and the player started:
# none (the prompt printed, for a person or another agent), claude (`claude -p`, its tools held to the two helpers and
# the log and report: blind by what it can do, not only by what it is asked), or codex (`codex exec`, blind by the
# prompt alone). What it leaves: lines.txt (the replayable record: commit it as cold-N-lines.txt), log.md, report.md.
#   scripts/cold-play.sh --n 7 --world iscoed --as human/warrior/Wenna [--rev origin/main] [--agent none|claude|codex]
#     [--turns 120] [--dir /var/tmp/kyrie/cold/7]
#   scripts/cold-play.sh --stop /var/tmp/kyrie/cold/7
# --kind '<disposition>': the player's kind as doc/cold-play/regimen.md names them (default the careful reader).
# --page <url> [--query '?world=iscoed']: on the deployed page in one headless Chromium (scripts/cold-play/page-runner.ts,
#   OB-05), not the runner on a revision built here; the browser's libraries as the host needs them (LD_LIBRARY_PATH).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"; repo="$(cd "$here/.." && pwd)"; kit="$here/cold-play"
n=""; world=""; as=""; rev="origin/main"; agent="none"; turns=120; dir=""; stop=""; page=""; query=""; kind="a careful reader: you read everything, and follow what the world suggests"
while [ $# -gt 0 ]; do
  case "$1" in
    --n) n="$2"; shift 2 ;; --world) world="$2"; shift 2 ;; --as) as="$2"; shift 2 ;; --rev) rev="$2"; shift 2 ;;
    --agent) agent="$2"; shift 2 ;; --turns) turns="$2"; shift 2 ;; --dir) dir="$2"; shift 2 ;;
    --stop) stop="$2"; shift 2 ;; --page) page="$2"; shift 2 ;; --query) query="$2"; shift 2 ;;
    --kind) kind="$2"; shift 2 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done
# Stopping: the runner's whole process group (the tail and the game), by the id it was started under.
if [ -n "$stop" ]; then
  if [ -f "$stop/runner.pgid" ]; then kill -- "-$(cat "$stop/runner.pgid")" 2>/dev/null || true; rm -f "$stop/runner.pgid"; fi
  echo "stopped: $stop"; exit 0
fi
[ -n "$n" ] && { [ -n "$page" ] || { [ -n "$world" ] && [ -n "$as" ]; }; } || { sed -n '2,14p' "$0"; exit 2; }
dir="${dir:-/var/tmp/kyrie/cold/$n}"; tree="/var/tmp/kyrie/cold/$n-tree"
mkdir -p "$dir"
if [ -n "$page" ]; then
  # The deployed page, played where it is served: what it says it was built from (version.json) is what was played.
  cp "$kit/send.sh" "$kit/show.py" "$dir/"; chmod +x "$dir/send.sh"
  : > "$dir/lines.txt"; : > "$dir/out.jsonl"; : > "$dir/err.txt"
  sed -e "s#{DIR}#$dir#g" -e "s#{N}#$n#g" -e "s#{TURNS}#$turns#g" -e "s#{KIND}#$kind#g" "$kit/prompt.md" > "$dir/prompt.md"
  built=$(curl -s "${page%/*}/version.json" || echo '?')
  printf 'the deployed page %s%s, built %s\n' "$page" "$query" "$built" > "$dir/played.txt"
  setsid bash -c "cd '$repo' && tail -n +1 -f '$dir/lines.txt' | bun scripts/cold-play/page-runner.ts '$page' '$query' \
    > '$dir/out.jsonl' 2> '$dir/err.txt'" < /dev/null > /dev/null 2>&1 &
  echo $! > "$dir/runner.pgid"
else
# The revision played, in a tree of its own (never the owner's checkout), built as the page would be.
git -C "$repo" fetch -q origin || true
if [ -d "$tree" ]; then git -C "$tree" checkout -q --detach "$rev"; else git -C "$repo" worktree add -q --detach "$tree" "$rev"; fi
if [ ! -e "$tree/node_modules" ]; then ln -s "$repo/node_modules" "$tree/node_modules"; fi
( cd "$tree" && bun run web:build > /dev/null 2>&1 )
played="$(git -C "$tree" rev-parse --short HEAD)"
cp "$kit/send.sh" "$kit/show.py" "$dir/"; chmod +x "$dir/send.sh"
: > "$dir/lines.txt"; : > "$dir/out.jsonl"; : > "$dir/err.txt"
sed -e "s#{DIR}#$dir#g" -e "s#{N}#$n#g" -e "s#{TURNS}#$turns#g" -e "s#{KIND}#$kind#g" "$kit/prompt.md" > "$dir/prompt.md"
printf 'world %s, as %s, at %s (%s)\n' "$world" "$as" "$played" "$rev" > "$dir/played.txt"
# The runner, fed from lines.txt one line at a time, in a process group of its own so that --stop ends it whole.
setsid bash -c "cd '$tree' && tail -n +1 -f '$dir/lines.txt' | bin/kyrie run --world '$world' --as '$as' \
  > '$dir/out.jsonl' 2> '$dir/err.txt'" < /dev/null > /dev/null 2>&1 &
echo $! > "$dir/runner.pgid"
fi
for _ in $(seq 1 300); do [ -s "$dir/out.jsonl" ] && break; sleep 0.5; done
[ -s "$dir/out.jsonl" ] || { echo "the runner did not answer: $dir/err.txt" >&2; "$0" --stop "$dir"; exit 1; }
echo "cold play $n: $(cat "$dir/played.txt"); play directory $dir"
case "$agent" in
  none)
    cat "$dir/prompt.md"; echo; echo "When it is done: $0 --stop $dir" ;;
  claude)
    # CLAUDE_BIN, else the editor's current native binary, else claude on the path. Never ~/.claude/local's old
    # install alone: a July 2025 CLI there waited silently for an hour and made no move (round A1, 28 November).
    native=$(ls -d "$HOME"/.vscode-server/extensions/anthropic.claude-code-*/resources/native-binary/claude 2>/dev/null \
      | sort -V | tail -1)
    cl=${CLAUDE_BIN:-${native:-$(command -v claude)}}
    [ -x "$cl" ] || { echo "no claude to play with (set CLAUDE_BIN)" >&2; "$0" --stop "$dir"; exit 2; }
    # A model named, an older install's own default being retired (COLD_MODEL to play another). A file is allowed by
    # an Edit rule, which covers writing it (a Write rule is not matched by file permission checks).
    "$cl" -p "$(cat "$dir/prompt.md")" --model "${COLD_MODEL:-claude-sonnet-5-5}" --output-format text \
      --allowedTools "Bash($dir/send.sh:*)" "Bash(python3 $dir/show.py:*)" \
      "Edit($dir/log.md)" "Edit($dir/report.md)" < /dev/null > "$dir/agent.txt" 2>&1 || true
    "$0" --stop "$dir"; echo "report: $dir/report.md" ;;
  codex)
    ( cd "$dir" && codex exec "$(cat "$dir/prompt.md")" > "$dir/agent.txt" 2>&1 ) || true
    "$0" --stop "$dir"; echo "report: $dir/report.md" ;;
  *) echo "unknown agent: $agent" >&2; "$0" --stop "$dir"; exit 2 ;;
esac
