# The opportunity indicator: a normative appendix to the colour atlas (M22 Phase 2)

Written for authors, generation, the page, the terminal and the specs. It extends
[../mission-21/colour-atlas.md](../mission-21/colour-atlas.md) (the owner, 15 November); it does not replace it.

**The rule.** An indicator has two dimensions:
- **Kind** is drawn by hue: what sort of opportunity the character perceives.
- **Condition** is drawn by value and shape: how that opportunity stands.

A condition never takes another hue. Both dimensions are derived from what the engine knows and the company perceives,
never from the page's guesses. **An indicator the character could not have is a simulation error, however beautiful.**

The code is `src/presentation/indicator.ts`:
- `Indicator.of` gives the kind;
- `Indicator.condition` gives the condition.

The rule is pinned by `test/small/indicator-condition`, `test/small/indicator-page`, `test/small/terminal-colour` and
`test/small/terminal-awkward`.

## 1. Kind: five hues, three icons

| Hue | Aspect | Means | Comes from |
|---|---|---|---|
| gold | undertaking | the followed aim's known, viable next step, and only that | `Promotion.continued`, after an explicit Follow |
| red | danger | a fight or a trap perceived; being warned | a band seen, a trap seen, a warning |
| green | payoff | a real material or practical gain | spoils, means, a sale the company can make |
| blue | knowledge | something to learn or investigate | a sign, a thing not yet looked at, a question to ask |
| violet | wonder | something genuinely uncanny or wondrous | a marvel the company perceives |

The icons are **companion** (someone who could join), **worth a look** (a way not taken, further in) and **crossing**
(into the next country). Three further marks are icons too: **hold** (done by holding), **idle** (nothing new for now)
and **sensed** (perceived off along a way).

- Several aspects at once give one hue, by precedence: gold, red, green, blue, violet. The others become icons, two at
  most, and the rest are said in words on asking. Never a prism.
- Ordinary controls carry no hue: pagers, Back, the map's Put away, a row that is nothing in particular. Nothing outside
  the opportunity grammar may take these hues for decoration (`test/small/terminal-colour` fails on a stray tone).

## 2. Condition: how it stands

| Condition | What the engine gives | Page | Terminal | State |
|---|---|---|---|---|
| **present** | the default: here and perceived | the row's mark at rest value; full and grown where the keys are (row.css) | the colour pip `▌` | built |
| **afar** | `Promoted.afar` (perceived where a way goes, not here); `Glance.sensed` (along a way, with how many places off) | the mark at .45 (`.afar`); a likeness's pip faint and smaller | the pip dimmed | built |
| **heard** | a map mark known only by word (`state: heard`, or `unknown`) | on the map, its label over the mist and no model placed | the words "heard of" | **partly**: the map only; rows to such a place draw it as afar, not as heard (next) |
| **idle** | `Glance.idle` (left twice with nothing done, and nothing new since) | the way or the rail's pip dim; still choosable | the line dim; the idle sign where there is no colour | built |
| **spent** | a question already put (`asked`); a try spent (`_again`) | the words dim, under "Ask again…" | (talk is page-only) | built in talk |
| *fresh* (adds) | `TalkFocus.opened`: new since the last answer | marked `fresh` | — | partly: talk only; no visual distinction chosen yet |

Precedence (`Indicator.condition`): spent, then idle, then heard, then afar, then present. Something spent or depleted
withdraws whatever its kind. Novelty only ever adds to what is present. It never revives what is spent, or makes what is
far seem near.

## 3. The six cases

| Case | Kind | Condition | Where it is held |
|---|---|---|---|
| A followed debt | gold on its one next step only after Follow; none before | present at the creditor's door; afar on the road toward it | small/gold, small/gold-thread, small/debt-purse |
| A dangerous opponent | red, with the forecast in words beside it ("Could be lost: …") | present when seen; afar when told of along a way | small/forecast-honest, small/indicator-page |
| A hidden clue | **nothing** until something perceptible points to it; then blue on the act that investigates it | present | small/gold-at-the-place (search where nothing is hidden promises nothing) |
| A recruitable companion | the companion icon, never a hue | present; afar (an icon said as sensed) | small/terminal-awkward, small/indicator-page |
| A distant wonder | violet | afar | small/wonder-violet; indicator-condition |
| A depleted location | its kind kept | idle: dim, still choosable, lit again when anything changes | small/signs-shared (the terminal dims it and signs it idle); small/idle-aim |

## 4. Hypotheses, not yet decided

The owner asked that these be tested before any is adopted:
- **Novelty's look.** One candidate is a fresh row's mark at full value for its first appearance only, with no motion.
  It must not read as focus (the keys' focus is the grown mark).
- **Uncertainty's shape.** A hollow mark (an outline in the hue) for what is heard of and not seen, on rows and map marks
  alike.
- **Urgency or intensity.** Nothing yet. A pressing danger (`Promoted.advances`) is ordered first in the four. It is
  drawn no differently, and any pulse or motion is ruled out by the doctrine's restraint.
- **Prismatic overlap** stays retired (TP-02). The current contract is one hue and icons.

Each would be tested as the row treatments were (mission-22/row-study.md): recorded on real scenes, judged by what the
player knows, then adopted or dropped.

## 5. Not yet

- `heard` on rows. A way toward a place known only by word is drawn as afar. The engine knows the difference (the map
  does). It needs a field on `Promoted`, then the hollow mark.
- One drawing of the condition across all surfaces. Afar, idle and spent are drawn by four separate rules (`.afar`,
  `.pip.faint`, the wayfinder's dim, talk's `.asked`). They should all be `data-condition` from `Indicator.condition`,
  with one value token each. The function exists; the surfaces are not yet moved to it.
- A census spec. On the first scenes, every coloured pip's tone should be one of the five and agree with its condition
  (colour-atlas.md's "Next" 2).
