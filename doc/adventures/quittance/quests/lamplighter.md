# The Lamplighter's Round (`q_lamplighter.kyr`, prefix `ll_`)

*Glass Quarter. Purely local, intimate; the opposite of cosmic. Test: `bun test test/quittance-lamplighter.test.ts`.*

## Premise

Hob Tansy has lit the gas-lamps of Foundry Row for forty-one years. His eyes have gone. On the fifth day the Gas
Company's lease on the Row's brackets runs out and the lamps go to the mains, so the fifth night is the last Round
whether or not the Offices like cold-lamps (the Round and the Demonstration have separate clocks on purpose: Hob is
retired either way, and only what hangs on the brackets afterwards differs). He asks the company to walk it with him,
at dusk (five to nine), and to tell him where he is.

## People

| Person | Where | What they want |
|---|---|---|
| Hob Tansy | Foundry Row at dusk, the Hall otherwise | to do the last one right, and to be told where he is; he has told no one about the pilot-flames because no one asked |
| Warden Quoyle | Lamplighters' Hall | to be kind and not to break the Ordinance; she holds the Hall's founding hearth |
| Foreman Gudgeon | Gasworks yard by day (06-18) | the Company's pension (the Benevolent) which Hob has twice torn up; shares a night/day shift schedule with `q_coldlamp.kyr` |
| Mrs Oddy | Tinkers' Court | sells mantles |
| Mrs Strood, Mr Beadle | Stokers' Steps | the quarrel: a stoker's widow at the top, a pawnbroker at the foot, one lamp-arm between |
| Nan Rudge | Furnace Wharf lamp-house | she is eight, she has hidden in the lamp so that it cannot be lit, so that it is not the last |
| Master Hune | Glaziers' Passage | the lamp is out; "not that it can't be relit" |

## Places

`foundry_row` (Hob at dusk) - `lamplighters_hall` (Warden, locker, hearth) - `round_tinkers` (stop 1) - `round_steps`
(stop 2) - `round_glaziers` (stop 3) - `round_furnace` (stop 4); `gas_yard` for the foreman. The four stops are each a
Thing with states (`ll_lamp_t/s/g/f`: the problem, `ready`, `lit`, `breath`); the lamps are put out at dawn, so the
Round is something done at dusk, and may be walked on any dusk from the first to the fifth.

## The four lamps (four kinds of problem)

1. **Tinkers' Court: a thing to get.** The lamp wants a mantle. Buy one from Mrs Oddy (2 coin), or pick the lock of the
   Hall's stores locker (lockwork) and find the spare. Plain coin or a thief's tools.
2. **Stokers' Steps: a person-problem with two plausible resolutions.** Swing the lamp to the stair (Mrs Strood: her
   husband fell in the dark) or to the pawnbroker's window (Mr Beadle: twice burgled under a dark window); or pay the
   Company five coin for a second bracket (+1 `regard(gasco)`, the quarrel relocates); or talk both into sharing the
   rate (persuasion, hard, one try). Each side leaves a different line on the Steps afterwards.
3. **Furnace Wharf: a gentle physical problem.** Nan is in the lamp-house and the lamp will not be lit with a child in it.
   Coax her (performance), climb the ladder (climbing), sit with her for an hour (patience, no skill, costs the
   dusk), or have Hob tell her himself (needs his trust; moves him). Failures leave the other ways open.
4. **Glaziers' Passage: out for a reason, not explained.** The tinder-box will not light it. A flame stands on a bench in
   a shed with nothing under it; hold Hob's taper to it, and it gives itself to the taper like a cat, and the lamp
   takes it. Nothing says what it is. (It is the same kind of thing as the cold-lamp sparks, and `q_coldlamp.kyr` uses
   it as the example of a spark that stays of its own will.)

## The watched event

When all four are lit at dusk the pilot-flames of the Quarter go out in the same instant and come back in the same
instant (the lamps pass through `breath`). It happens only if the company is in the Glass Quarter to see it; a company
that walks away to Brick Lane has not seen it and `d_pilots_step` is not taught until they return. Hob will not say
what he knows until two lamps are lit ("nobody asked"); after the breath, he is moved and can be asked to say it to
the Five (`witness(hob)`).

## Retiring him (the dilemma)

All of these are offered once the Round is done (or on the last night).

- **Pension** (the Benevolent, six coin a quarter). He keeps the papers "as a thing that was offered". `regard(gasco)`
  +1; he is bitter, silent, no witness.
- **A place at the Hall** (the chair by the window, Keeper of the Tinder-boxes). He hates it and says it is a good
  title. Bitter; no witness.
- **Left to finish.** The company gives him the taper and stands back at the Steps. He lights the Steps lamp by smell,
  misses the fiftieth step and breaks his wrist; and is moved, and finished. Costs him (a wrist) and it is his.
- **Told plainly** that it is his eyes that retire him. He hands the company the taper and the Round and tells them what
  he knows; the Warden hears who said it and shuts the Hall's book; the Hall cannot be asked for a hearth.
  `ll_slighted_gasco(party)` is set (the Company will not forget a company that did that to its lamplighter).
- **The hearth.** Sweep the Hall's flue (brawn, the Company's stopper is in the throat), get Hob moved (what he saw, or
  Nan, or the Steps), ask the Warden, and he is not retired but made Keeper of the Hearth: a post in the Hall's own
  rules. `Assert keeper(glass)` and `witness(hob)`. This is the only way in which `keeper(glass)` is earned.

If the company is not there on the last night, Hob walks the Round alone and falls on the Steps (`ll_howFell`). If a
company walked with him and let the Round lapse, `ll_slighted_gasco(party)` is set and `regard(gasco)` falls (to a
floor of nothing). If the Round was done early and never decided, the Company's notice runs out with no one to receive it
and he is retired by the notice (`ll_howDrift`).

## Writes into the contract

`d_pilots_step` (only when the company has seen the breath); `witness(hob)`; `keeper(glass)`; `regard(gasco)` (+1 pension,
+1 second bracket, down by 1 or to nothing when a Round is broken); plus relations of its own: `ll_howPension`,
`ll_howPlace`, `ll_howFinish`, `ll_howPlain`, `ll_howHearth`, `ll_howFell`, `ll_howDrift`, `ll_hurt`, `ll_bitter`,
`ll_slighted_gasco(party)`.

## Build matrix

- Plain company with coin: mantle, second bracket, pension, the Wharf (wait), the shed (nothing needed).
- Thief / lockwork: the Hall's locker.
- Persuasion / bard: the share on the Steps; coaxing Nan with a story.
- Climbing / ranger: the ladder.
- Brawn / warrior: the Hall's flue (the hearth).
- Insight: none required; Hob's trust is earned by walking.

## What changed from the brief and why

- Hob is retired on the fifth day regardless of the Demonstration (the lease on the brackets, not the lamps' adoption),
  so that the two quests do not depend on each other's outcome. The cold-lamps "coming in" is what hangs on the
  brackets only if the Offices adopt them.
- "A lamp a child has hidden in" is a lamp-house; the dusk window is five to nine rather than three hours so that the
  patient way (an hour on the Wharf) stays possible.
- The Round may be walked on any dusk from day one (lamps are put out at dawn), so the company can fail and return.

## Weakest part

The retirement scene is a menu of five actions rather than a conversation: Hob is moved by the *sum* of what the
company has done (a flag, `ll_moved`, from three different causes) and the action list does not show why a given
option is closed. A company that never finds the Warden's hearth topic will never learn it exists (the Hall's
observation is its only hint). The breath is told once and not shown on the map.
