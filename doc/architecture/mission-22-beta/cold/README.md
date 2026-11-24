# Cold play with blind agents (beta)

BRIEF §2's rung 4 and §11.7: blind agents of stated kinds play the rendered page as a player does; their
success is never reported as human acceptance. The lead launches them; this folder holds the kit's briefs and their
results. The method of M22's cold plays is in ../../mission-22/cold/.

## Starting a session (the lead)

    bun scripts/cold-play/blind-page.ts /var/tmp/kyrie-cold/<date>-<kind>-<n> \
      --world iscoed --size 1280x800 --brief doc/architecture/mission-22-beta/cold/briefs/<kind>.md

It builds the current page, serves it over http as Pages does, opens it in one headless Chromium at the given size
(390x844 is a phone, by touch) and waits. The session folder gets `play.sh`, `brief.md`, `about.txt` (revision,
world, viewport, when) and `shots/`; give the agent that folder only, with `briefs/common.md` and its kind's brief.
`echo quit >> <folder>/in.txt` ends it. Run with `KYRIE_BROWSER=1` and, on this machine, the nss libraries
(`LD_LIBRARY_PATH=$HOME/.cache/kyrie-nss/root/usr/lib/x86_64-linux-gnu`).

What the agent is given is the page's own words: its heading and text, each control by its visible words with the
colour of its mark named, and the drawers as they are drawn; and pictures on request. Never an id, a selector, the
engine's state, or the source. A control is pressed as a player presses it (a click, or a tap at a phone's size).

## Kinds

- briefs/careful-reader.md, briefs/impatient-presser.md, briefs/wanderer.md, briefs/gold-follower.md,
  briefs/gold-ignorer.md; and briefs/common.md for all.

## Results

Each session's log.md, report.md, turns.txt, about.txt and any pictures worth keeping go in
`results/<date>-<kind>-<n>/`; findings go to the register through the usual triage (checked against main,
deduplicated, given a priority and a verification), not straight from a report.
