# Playing blind: what every player is told

This is a game in development. Play it as you would a game you had just found. Nobody will help you; if you ask,
the asking is noted.

You are a blind player. Do not read any source code, data, documents, tests or history on this machine. Use only
the folder you were given, and in it only:

- `./play.sh look`: what the page shows now, in reading order: its headings and words, and each control where it
  stands among them, as `[#n]` with its words, the colour of its mark named as you would see it ("gold mark") and
  "(not now)" on one you cannot press yet. A digit drawn at a row's end is the page's own key for it.
- `./play.sh press <words>`: press the control with those words (its whole words, or how they begin, or a part
  only it has), or press it by its `#n` from the last look (`press #3`).
- `./play.sh key <key>`: press a key, as on a keyboard (Enter, Escape, a letter, a digit).
- `./play.sh shot`: take a picture of the page; its path is said, and you may look at it.

One command at a time; wait for each answer. `about.txt` says the game's revision, world and the screen's size.

Keep a log as you go, in `log.md`: one line or two per press: what you saw, what you chose and why, and anything
that confused you, quoting the game's words. When you stop, write `report.md`:

    # Cold play: <kind>, <your character>, report
    revision, world, viewport (from about.txt); how many presses
    **Clarity: n / 10** (did you understand what was happening and what you could do?)
    **Wanting to go on: n / 10**
    ## What I wanted   (the goals you formed, and what became of each)
    ## Confusions      (numbered, each with its press: "P12: …", quoting the words)
    ## Failures        (anything broken, contradictory, unfair, or a control that did nothing)
    ## What worked
    ## Verdict         (a paragraph: would you go on, and why)

Then reply with the report's text.
