# Foundations

One room from the title to the fight. The owner, 7 November: *a unified design system / foundations approach so that
the UX doesn't seem to switch too sharply when moving through phases.* Every phase — the studio's mark, the title,
creation, the opening on the road, play, the fight, the map — takes its faces, colours, type, surfaces and shared
controls from one sheet, `web/reader/foundations.css`, read before every other. A composition (`frame.css`,
`stage.css`, `glance.css`, …) adds only its own arrangement.

## Tokens

| Group | Tokens | Use |
|---|---|---|
| Ground | `--ground` `--surface` `--raised` `--lift` `--deep` | the room, the stage, a control, one under the hand |
| Ink | `--ivory` `--dim` `--faint` `--edge` `--edge-strong` | words, quieter words, rules |
| Gold | `--gold` `--gold-glow` `--gold-line` `--gold-bright` `--gold-deep` | attention: your choice, your aim, the way on |
| Meaning | `--ember` `--verdigris` `--azure` `--violet` `--rose` `--life` | harm; learned; water/heard; magic; kin; health |
| Faces | `--do` (Jost) `--told` (Newsreader) | naming what can be done / telling and speaking |
| Type | `--type-mark` `--type-heading` `--type-ask` `--type-prose` `--type-body` `--type-lead` `--type-control` `--type-note` `--type-kicker` `--type-word` | font shorthands, largest first |
| Tracking | `--track-kicker` `--track-control` `--track-word` | capitals' letter-spacing |
| Surfaces | `--card-ground` `--card-chosen` `--card-quiet` `--veil` `--radius` | cards over a painting; a sheet's veil |
| Depth | `--shadow-lift` `--shadow-stage` `--glow-chosen` `--glow-go` | lifted, the stage, chosen, the way on |
| Plates | `--plate-far` `--plate-near` `--plate-scene` | a painting behind play; behind title and creation; the opening's |
| Frames | `--corner` `--corner-w` `--ring` `--ring-chosen` | gold corners; a portrait's ring |
| Motion | `--quick` `--settle` `--slow` `--ease` | answer a touch; arrive; a painting comes up (all 0 for reduced motion) |

## Components

- **`.option`** — a key pressed. **`.option.go`** is the way on, solid gold, in every phase: Continue and Set out in
  creation, Go on at the end of the opening, Enter on the map.
- **`.act`** (reader.css) — a choice in the world, with its diamond. The meeting on the road answers with the same
  `.act` play uses, numbered by the same keys.
- **`.quiet-word`** — Back, Details, Set out now, Close: never an instruction.
- **`.kicker`** — small gold capitals saying what kind of thing follows: a chapter, *Why you came*, *Your first goal*,
  *You are at*.
- **`.ask`** — the question a page asks, in the telling voice.
- **`.card`** — a choice held up (creation's decks).
- **`.cornered`** — gold corners marking bounds, as the play stage's frame does.
- **`.portrait-ring`** — a round, gold-edged likeness: creation's corner, the one met on the road, a scene.

## Rules

1. No hex or rgba literal for a colour the tokens name; no font shorthand for a size the scale has.
2. Gold means attention, never decoration; meaning colours always have words beside them.
3. The way on is `.option.go`; there is one per page.
4. No interface commentary: nothing under a button saying what it does.
5. Motion respects `prefers-reduced-motion` (the motion tokens go to 0; decorative motion is removed).
