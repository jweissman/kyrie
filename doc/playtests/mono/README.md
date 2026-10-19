# Mono: a compact game screen for Kyr

> **Revised in the Caught Below increment.** The explore screen now has an always-visible map (SVG from authored
> grid positions and known passages), a full-width activity strip at the bottom (<kbd>H</kbd> for bounded
> history), and the objective under the place name. The Map and Party modes and the Lately pane are gone (Company
> is <kbd>C</kbd>). The Serewater screenshots below predate this change; see
> [doc/playtests/caught-below](../caught-below/) for current ones.

Mono is a monospace, menu-driven player client for the real Kyr simulation. It targets Serewater, so it can be compared
directly with the previous Folio player (`site/serewater.html`), which is unchanged.

```sh
bun install
bun run web:build                 # writes site/; open site/mono.html (no server needed)
bun run web:dev                   # or preview at http://localhost:8080/mono.html
```

`?campaign=data/greenhollow/campaign.json` loads another bundled campaign. The independent review that motivated this
client is [doc/design/independent-review.md](../../design/independent-review.md).

## Rendering approach

**DOM and CSS Grid, not Canvas.** The screen is one fixed `100dvh` grid with named regions. The page never scrolls;
only bounded panes do (long prose, long lists). DOM was chosen because:

- Every selectable element carries a stable semantic id (`data-row="exit:march__quay"`, `data-command="…"`), so
  browser tests drive and assert gameplay without coordinates or prose matching.
- Text wrapping, selection, focus and screen-reader semantics come free. A Canvas client would need its own text
  layout and an accessibility shadow tree.
- The visual system stays deliberately constrained: one monospace stack, five ink colors, box panes with title bars,
  inverse-amber selection, and text meters (`HP ████████░░ 12/14`). There are no cards, icons, images or decorative
  chrome.

Layouts are purpose-built per mode (explore, conversation, combat, pack, party, map, journal, creation), with deliberate
changes at three widths. At 1100 px and wider there are three columns. Between 720 and 1099 px, the party becomes a
strip above two columns. Below 720 px everything stacks into one column and the action menu becomes a bottom sheet.

## Architecture

| Layer | File | Responsibility |
|---|---|---|
| Screen model | [src/ui/screen-model.ts](../../../src/ui/screen-model.ts) | Pure projection of `Campaign`: place and hierarchy, exits, people, things, party, items, camp actions |
| Passages | [src/ui/passages.ts](../../../src/ui/passages.ts) | Exit orientation (walk / enter / leave / level / travel) from declared containment; honest reasons for blocked known ways |
| Grouping | [src/ui/choice-grouping.ts](../../../src/ui/choice-grouping.ts) | Puts every legal `PlayerView` command under the target and intention it concerns. Never adds or drops a command |
| Combat model | [src/ui/combat-model.ts](../../../src/ui/combat-model.ts) | Abilities and targets from `Battle.legalCommands()` only |
| Client | [web/mono-*.ts](../../../web/mono-app.ts), [web/mono.css](../../../web/mono.css) | Selection, menus, mode switching, keyboard and pointer dispatch, autosave |

The canonical simulation stays authoritative. Every executable leaf is a `PlayerView` command id, executed through
`PlaySession.perform`. A UI-model test asserts that the set of offered commands *equals* the set of legal commands, in
Serewater and in the typed-exit Greenhollow.

**Controls.** <kbd>↑</kbd>/<kbd>↓</kbd> select; <kbd>Enter</kbd>/<kbd>→</kbd> act or open a submenu;
<kbd>Esc</kbd>/<kbd>←</kbd> go back; <kbd>1</kbd>–<kbd>9</kbd> jump to a row; <kbd>E</kbd> <kbd>I</kbd> <kbd>P</kbd>
<kbd>M</kbd> <kbd>J</kbd> switch modes; in combat, <kbd>T</kbd> lets tactics choose. A row with a single action (most
exits) acts immediately; a person or object opens a menu by intention (Talk, Buy › item › for whom, Give, Attack).
Choosing Talk opens a dedicated conversation layout.

## The reference journey (actual browser runs)

[bin/record-mono.ts](../../../bin/record-mono.ts) plays the journey through real input events and writes these
screenshots, [results.json](results.json) and the exported [journey.transcript.json](journey.transcript.json). The
transcript is the canonical record: it replays in Node to the same world state. The journey:

1. Create the Fellowship and enter Reedwake ([desktop](desktop-01-quay.png)).
2. Enter Nera's outfitter; talk; buy a healing draught for Bran in the conversation layout ([desktop](desktop-02-conversation.png), [phone](phone-02-conversation.png)).
3. Travel to the causeway, forage, take the ridge to Censer Hill ([desktop](desktop-03-wilderness.png)).
4. Enter level I; talk to and free Pell; read his survey board ([desktop](desktop-04-pell-freed.png)).
5. Take the line in the dry stores and equip it from the Pack ([desktop](desktop-05-pack.png)).
6. Fight the cave hound turn by turn ([gallery](desktop-06-gallery.png), [combat](desktop-07-combat.png), [after](desktop-08-after-combat.png), [phone](phone-06-gallery.png)).
7. Read the counterweight warning, brace it with the line, descend to level II ([desktop](desktop-09-level-two.png)).
8. Risk the kitchen vapour with Elen leading; use the draught on her ([desktop](desktop-10-trap.png), [laptop](laptop-10-trap.png)).
9. Climb back to level I and escort Pell home ([vestibule](desktop-11-pell-waiting.png), [quay](desktop-12-home.png)).
10. Speak with Pell at the quay; review the journal and map ([journal](desktop-13-journal.png), [map](desktop-14-map.png)).

Screenshots exist for desktop 1440×900, laptop 1024×768 and phone 390×844 (prefixes `desktop-`, `laptop-`,
`phone-`). The phone run uses taps, not keys.

## Tests

| Kind | File | What it checks |
|---|---|---|
| Simulation | [test/serewater.test.ts](../../../test/serewater.test.ts) | Golden histories unchanged by the spatial declarations; a traveler at home cannot be escorted away |
| UI model | [test/screen-model.test.ts](../../../test/screen-model.test.ts) | Hierarchy and transitions; offered commands equal legal commands; shop grouping; blocked-way reasons; hazard grouping and level changes; save/restore purity; combat projection; typed-exit modules |
| Browser | [test/mono-browser.test.ts](../../../test/mono-browser.test.ts) | Full journey by keyboard at 1440×900 and by pointer at 390×844 with no page scroll at any checkpoint, no page errors, and the exported transcript replaying to the expected world (Pell home, hound dead, counterweight disarmed, vapour triggered, line equipped); mode switching and reload at 1024×768 |

The browser tests are opt-in: `KYRIE_BROWSER=1 bun test test/mono-browser.test.ts`. They need Playwright's Chromium
(`bunx playwright-core install chromium`). On hosts without NSS, extract `libnss3`/`libnspr4` and set
`LD_LIBRARY_PATH`.

## Comparison with the previous player

[bin/compare-clients.ts](../../../bin/compare-clients.ts) clicks the journey's **identical 39 commands** (3 player
combat turns) through Folio, then plays the same journey in Mono by pointer ([comparison.json](comparison.json)).

| | Folio (previous) | Mono |
|---|---|---|
| Pointer inputs for the journey (desktop) | 85 | 76 |
| Screens where the page itself scrolls | 39 of 39 (the frame is 930 px tall in a 900 px window) | 0 of 14 sampled |
| Party condition visible without scrolling | 21 of 39 screens | always in explore, pack, map, talk, and combat (as allies) |
| Spatial context | Room name; district label | Region › settlement or wilderness › site › level › room, plus a transition type on every exit |
| Known but blocked ways | Absent from the list (the map lists "blocked from here") | Listed, with reason ("Reedbank boar … bars the way.", "Needs a climbing line…") |
| Shop with 3 items, 3 companions | 9 flat "Buy X for Y" buttons in one tab | Nera › Buy › item › companion |
| Consequence feedback | Receipt text plus a "Resolution" disclosure with dice | "Lately" pane: result, resource changes, discoveries, compacted combat lines |

The input saving is modest. The larger differences are orientation, information visible at once, and actions
organized by target. Samples were taken at every command for Folio and at the 14 journey checkpoints for Mono, so the
per-screen means are indicative, not exact.

## Limitations and missing information

The client does not invent anything Kyr cannot tell it. These are gaps the interface needed but the simulation could
not provide:

- **Vertical direction.** Route-based modules give no up/down, so level changes are shown as "⇅ Level II: …". Typed
  exits supply ascend/descend.
- **NPC intention or activity.** None exists to display. A person's row shows only their verbs.
- **Physical aftermath.** Nothing about the shifted rack, a spent trap's state beyond `(spent)`, or the moved Pell is
  modeled beyond flags and authored prose.
- **Applicability.** Mono must still offer "Give one coin" to a boar and "Attack" to anyone, because those commands are
  legal.
- **No unequip action** exists in the item rules, so the Pack offers none.
- **Blocked-way reasons** come from known ruleset relations (`route`, `gate`, `hazardPassage`, `climbingPassage`,
  `informedPassage`, typed exits). An unfamiliar obstacle relation shows "Not possible from here right now."
- Combat log lines omit dice arithmetic; the Journal chronicle and the developer workbench keep it.
- Name entry uses text inputs on the creation screen only; play itself needs no text entry.

**Not established:** no unfamiliar human has played Mono. The automated runs show that it works, fits the screen and
replays faithfully. They do not show that it is learnable or enjoyable. The most useful next step is a short moderated
session with two or three new players on this same journey, recording where they hesitate.

## Next steps

1. Moderated first-time-player sessions on Folio and Mono with the same task list.
2. A "since you left" digest on returning to town, once Kyr can report observed off-screen events (requires declared
   observability, review recommendation 3).
3. Show NPC activity and destination when the agency model provides it (review recommendation 2).
4. Make Mono the default index once human sessions confirm it; keep Folio and Wayfarer as references.
