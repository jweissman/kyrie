# The colour atlas (the owner, 15 November): five colours, everything else an icon

Gold is the quest or the current commitment path; blue is information or investigation; red is combat; violet is a
wonder; green is a payoff or reward. **Nothing else is a semantic colour.** Meta markers (the way out of a place, a clue
about an age, somewhere worth a look, someone who could join) are icons. Colour is never the only cue: every aspect has
its word and its icon.

## The grammar, where it stands (one table: `Emphasis`)

| Colour | Aspect | Comes from (`Aspects.by`) | Say |
|---|---|---|---|
| gold | undertaking | the followed aim's next step only (advance, named, toward, about, bound, kin) | your aim |
| blue | knowledge | a sign, something not yet looked at, a question to ask | to learn |
| red | danger | a fight or a trap seen, being warned | danger |
| violet | wonder | the uncanny | uncanny |
| green | payoff | spoils, means | to gain |
| *icon* | exploration | a way not taken, further in, the place's own doings, an aim heard of | worth a look |
| *icon* | companionship | someone who could join | a companion |
| *icon* | crossing, hold, sensed | going over into the next country; done by holding; perceived off along a way | |

## Changed today

- `Tone` is `gold | green | blue | red | violet`. **Silver** (exploration) and **rose/coral** (companionship) are retired
  as tones: removed from `Emphasis.tones`, `rgb`, the precedence, the CSS (`.tone-silver`, `.tone-rose`, `--tone-*`,
  `--coral`, `--rose`), and the recruit card's coral edge. Exploration and companionship are drawn by their icon
  (`Indicator.of`: both are icons before any other), neutral row, with their words said on asking.
- The terminal paints no tone for an aspect without one (what is perceived off along a way that is somewhere worth a look
  or a companion is its icon, as on the page).
- Pinned: test/small/terminal-colour holds the page's tokens to the terminal's, tone by tone, and fails if the stylesheet
  gains a coral, a rose or a silver tone; test/small/terminal-awkward holds the indicator (one colour, at most two icons;
  exploration and companions never a colour); test/aim-continuation, test/foreground.

## Found, not changed (red is combat; these are not)

Red (`--ember`) still marks things that are not a fight: the "cannot be undone" line of a grave act (`.grave-said`), the
`.mark-tag` word, a route's warning (`.rc-warn`), a barred trail on the route plan (`.plan-drawn .trail.blocked`) and a
barred cell on the town plan (`.town-drawn .cell.barred`), the low flame of the light (`light.css`), `.hex-card .about.danger`.
Under the rule they are a warning icon and neutral words. Gold is also used for the map's "you are here" accent and the
route-card's Set out where the aim's destination is the chosen way (that one is correct: the aim's next step).

The map board itself uses glyphs, not colour, for its marks (board-glyphs.ts): consistent with the rule.

## Next

1. Retire the red of warnings (above) in favour of an icon and neutral text; the fight stays red.
2. A browser census of computed colours: on the first scenes, every coloured pip's tone is one of the five and has an
   aspect word in its label (a cheap spec over `[style*="--pip"]`).
3. Audit which `Why` reasons give blue: the owner reads blue as *information or investigation*; today it includes a plain
   question asked (`asked`), which is information, and an unlooked thing, which is investigation: both fit.
