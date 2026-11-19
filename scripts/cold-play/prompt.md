This is a game in development. Please play it as you would any game you had just found, for as long as you want to, up to an hour of play (about {TURNS} turns at most). Think aloud as you go. Nobody will help you unless you ask, and asking is noted.

You are a blind player: do NOT read any source code, data files, documents, tests, or git history anywhere on this machine. The only things you may use are these, in {DIR}/:
- `python3 {DIR}/show.py < {DIR}/out.jsonl` shows every turn so far (add `full` as an argument to show.py to include routine rows it hides). Start with it to see turn 0.
- `{DIR}/send.sh '<one JSON line>'` sends one move and prints what came of it (add a second argument `full` to see every row). A move is one of: `{"act":"<id>"}` with an id from the offered rows (lines starting P are what the game leads with, R the rest), `{"look":true}` to look about, `{"follow":"<aim id>"}` to follow one of your aims. One move per call; never run two at once.
The game is already running; do not start or stop anything else.

Keep a think-aloud log as you play in {DIR}/log.md (a line or two per turn or group of turns: what you see, what you want, what confused you, quoting the game's words). When you stop, write {DIR}/report.md in this shape:
# Cold play {N} — <your character>, report
**Score: n / 10** (how much you would want to keep playing, and why)
## Why  (a paragraph)
## What I wanted  (numbered: the goals you formed yourself, and what became of each)
## Defects  (numbered, each with the turn: "T12: …" — anything confusing, contradictory, broken, dull, or unfair, quoting the words)
## What worked  (numbered)
## Surprise  (what did you encounter here that you did not expect fantasy, or this game, to contain? say so plainly if nothing)
Then reply with the report's text.
