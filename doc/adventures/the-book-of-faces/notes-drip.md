# The Book of Faces: notes on `drip.kyr` and `commoner.kyr` (author A1)

*The Drip's four threads and the commoner's three trades. What was built, what other files may read, where Kyr, Deem and
the engine resisted, and what is thin.*

## What was built

### Rill's Ferry (Round 1, `r_ferry`)

**Beats.** Ask (the Gull, in the open, by day: the Patience takes a bucket an hour; or bare, by night, and bail with her);
find out (the strakes are green timber laid last March by the Guild's surveyor, a cousin of Lacke's, and will fail his
survey on the seventh day; the White Lady's courier and the purse thrown in the Cuff); act (five ways, below); and the act's
second face (what Rill makes of it: custom, a job, a debt, a due, or an insult).

**Approaches, and what each leaves.**

| Way | Cost | Leaves |
|---|---|---|
| Mend her as a Gull, by day, in the open (`dr_mend_gull`; oak at Mistress Crumb's, mending) | oak, a day | custom; `goodwill(face_gull)` |
| Ask leave (bail with her through a night, brawn; read the tin, insight; ask her *what she would let anyone do*, as a question and not a telling), then mend by night for a Gull's penny (`dr_mend_night`) | a night, oak | a job, a coin in the hand, no goodwill (done bare) |
| The Guild's loan: persuade Rill to put her mark to it (persuasion, hard), then the steward (persuasion) | a farthing in the penny, for Rill | a debt she can respect |
| The Articles against the surveyor (lore to construe them; mending or woodcraft to find the green wood) laid before the steward; or lift his mask and Name him aloud | heat 5 if Named; nothing if lawful | restitution: a due, not a gift. Ley is struck from the roll (`dr_ley_struck`) |
| Buy her (40 coin; she says "Master" at both ends of every sentence) and sell her back for a penny | forty coin | she is her own again; `dr_boat_how_bought` |
| Mend her unasked, in the dark | oak | the best work you have done in Ombra, and charity: `dr_rill_insulted`, no word from Rill until a coin is laid on the thwart (`dr_pay_penny`, which the steward teaches to any masked face) |

The satire in procedure: a Gull may not be *given* a thing and may be *sold* it for a penny. Rill's mind moves when she is
asked and not told (the Ferrymen's Guild fed her nine years after the Sluice and she paid back every candle). A company
with no charm can do it by bailing and by mending. If left alone: condemned on the seventh day (`dr_berth_sold`), the berth let.

**Later effects.** Rill's talk is warm and varies with how it was done (three topics); her crossing is faster
(`travelTime(ferry_row_drip)`: three watches sinking, four on a hired oar, two sound, one once the Round is done); she will
bring the Row bakers' leavings across for the Saint's pot; `roundDone(party, r_ferry)` is asserted by a rule when the boat is
sound and Rill is neither insulted nor hired.

### The Anonymous Saint (Round 4, `r_soup`)

Sister Nobody (a Spent Physician-General, a young surgeon in the Sluice year) feeds three hundred; the donor's bag was not
at the back door on the first of the Novena; bread for four days. A gift put in her box *bare* is taken (thirty coin;
or rations; or a sack lifted from the brokers' stack by night; or a benefit played in the Moth; or the Rain-Wives' washing
penny; or Mistress Crumb's sack at cost; or Rill's bakers' leavings); a gift in a mask is refused. Each adds *supply* points
(`dr_supply`; eight secure the pot). **The conversation:** she is moved by neither evidence nor argument but by a hot supper eaten
sitting down (no check) or by being made to laugh once (performance, hard; the Assessor who must be called the Pound), and
then tells the flood year (`sluice_known`) and what she suspects of the Urn (`dr_urn_hand`: the Registrar never put her hand
in it). Insight finds that she counts a pulse at every wrist; lore (hard) finds who she was (`dr_nobody_spent`, which lets the
company Name her, with a real consequence: she leaves the kitchen for the Hospice, bare, and the pot is not her care).
Lifting her mask is a cost too (she says only "Next" thereafter). Left alone: dry on day 4, shut at noon on day 6.

### The Rain-Wives' Petition

Goody Pallet and the Tally-cloth (thirty-one feet; a colour for each Office). Read it by lore, by insight (watch her stitch
the pink knot last), or by counting with Tansy Ruddock, six hours, no skill (`lie_tally`, and `dr_hesper_known`). By night,
bare, she says the thing she cannot say by day (Hesper Wain, a dyer's girl drawn Assessor, honest; a jar, or a hand that
knew her?) and puts the question to the company, who answers (three `answering` topics). What the company then tells the
Wives is the game: the truth, a kind lie, or "ask at the Hearing". Outcomes read by the integrator are below. Left alone: they march on day 6.

### The Lamp-Trimmers' Strike

Sixty coin of arrears; a wage-box carried off by Hal Dunne, the steward's half-brother (twenty-two of it on an eel). Jory
Wickham decides by hands: a stranger's money is a bribe until the company has lit the round in order, or brought a box back,
or stood a day in the yard. Pay (once he trusts you); find Hal's cask (insight to read him, persuasion to coax him, or
lockwork to open the cask) and return it unnamed (or tell Jory it was his brother); break the strike with the Hospice's Bare
lodgers in the Owl's domino (Mother Tibb lends them; deception; the Owls take the domino back); or stand the walk (the Owls
make you one; dark on the ninth night). Left alone: strike on day 8, `dr_dark` on day 9.

### A Trade of One's Own (`commoner.kyr`)

Ferry (Rill: learn the Cuff by wayfinding, row it by brawn, a copyist who cannot pay: charge him, carry him free, or take his
penny as a fare), Lamp (Jory: light the round by climbing, mend the pump by mending, a gill of oil the Owls would keep:
refuse, comply, or pay for the lamp-boys' gill), Chandler (Crumb: tally by lore, a thief by insight and brawn, a short weight:
refuse, comply, or make up the ounce). Each ends in the guild's offer: the mask (an earned face; the guild's tool; eight or
ten coin) or the wage and the tool and no mask. Three trades earn `endow` constitution by one. Two trades and a settled
strike make `handReady(party, hand_procession)`; the Procession walks into the Urn Hall on `drawingNight()`.

## What other files may read

- `dr_marchers(party)` (the Rain-Wives march on the Chapel), `dr_wives_chance(party)` (they march for a real draw: the Honest
  Urn), `dr_wives_keep(party)` (they keep the secret: the Quiet Hand), `dr_wives_lied(party)`, `dr_wives_waiting(party)`,
  `dr_deferred(party)`, `dr_march_day(party)` (6, or 8 if put off), `dr_petition_answered(party)`.
- `dr_dark(party)` (no lamps on the ninth night), `dr_strike_on(party)`, `dr_strike_settled(party)`, `dr_strike_broken(party)`,
  `dr_strike_joined(party)`, `dr_jory_trusts(party)`.
- `dr_boat_sound(party)`, `dr_berth_sold(party)`, `dr_ley_struck(party)` (Lacke's cousin the surveyor; counting.kyr may want it),
  `dr_rill_insulted(party)`, `dr_rill_hired(party)`; `dr_pot_secured(party)`, `dr_pot_dry(party)`, `dr_kitchen_shut(party)`.
- Facts: `dr_nobody_spent` (the Saint was the Physician-General), `dr_urn_hand` (a sixth hint at the Lie; **not** counted by
  `lieClues`: the integrator may count it), `dr_hesper_known`, `dr_green_planks`, `dr_gulls_penny`.
- `cm_in(party, cm_t_ferry|cm_t_lamp|cm_t_chandler)`, `cm_trades(party)`, `cm_kept_bare(party, trade)`.
- Items: `dr_pestle` (granting insight; given by the Saint), `cm_hook`, `cm_snuffer`, `cm_scale`; kinds `dr_oak_kind`,
  `dr_supper_kind`.
- Persons: `dr_brine`, `dr_ley`, `dr_hal`, `dr_tansy`, `dr_gammon`, `cm_crumb`, `cm_dill`, `cm_teale`.
- Written to by others: `dr_supply(party)` (a measure; `Increase dr_supply(party) by N` helps the pot).
- **Persons I reference and do not declare:** `tibb` (two topics: the lodgers for the strike; the notice of a trade's face).
  Both will not load until `gate.kyr` declares `tibb`.
- **Faces:** an earned trade face is `Assert holdsFace`, `fitted` and a retracted `rented`. I did not assert `faceTaken(party)` (that
  is the Warrant's own offered face). The Owls take their face back (`holdsFace` retracted) from a company that breaks their strike.

## Friction

1. **`Known as` does not reach a person's name in labels, or in the generic ones.** With `Known as "a ferrywoman in the
   gull-domino" when not knows(party, dr_rill_name)` the scene line was right, but `Talk to Rill Ketch`, `{rill}` in a topic's
   label and Says, and the generic `Lift {who}'s mask` and `Name {who} aloud` all gave the name away. *Did:* kept `Known as` only
   for the surveyor (whom the company may lift and Name) and wrote the rest of the Drip's people by name (the least masked
   quarter). *Remedy:* every expansion of a person should use the Known-as while it holds.
2. **A lint that loads cleanly can still offer an ambiguous action.** `Action cm_worker_body(actor, reader: member, site: place)` whose
   body says `at(actor, bread_market)` never constrains `site`, so it was offered once per place; the lint was clean, the play said
   "an action label hides a parameter that distinguishes choices". *Remedy:* lint a parameter nothing constrains.
3. **The company's purse is a projection from its members' purses.** `Set quantity(party, gold)` from a test does nothing; coin goes
   in through `store.acquire(...)` and `refreshProjection()`. Neither is in the guide's test support.
4. **A campaign's company is of one.** The brief wants checks tried by the best of a party, and the party override insists on the
   campaign's size, so a test needs a different one-person company for each calling's skill, and a retry loop on the die.
5. **`travelTime` is in watches** (`taking 15 minutes` is 2): a rule that sets it to make a ferry quicker makes it slower
   if written in minutes. The guide gives an example without the unit.
6. **An anchored rule happens wherever the company is** (the lint's advice, rightly): a default that should happen by day 7 whether
   or not anybody is at the landing, and be *told* if somebody is, is two rules and a latch relation each (`dr_survey_fails` /
   `dr_survey_told_at`; `dr_pot_runs_dry` / `dr_pot_dry_told`; `dr_march_goes` / `dr_march_told_at`). *Remedy:* `Rule … tells at
   place` (anchor the telling, not the firing), which the Grand Tour's friction 22 also asked for.
7. **Prose is one line.** A string cannot hold a newline or a double quote, so a turn of speech is a single line of two hundred
   characters, and every quotation is a single quote inside a double. It reads badly in the source and diffs worse. *Remedy:* a
   multi-line string with a continuation.
8. **`teaches` is after the string in an `Observe` and before the braces in a `Rule`.** I lost two lints to it.
9. **Names are unique across the repository's adventures** (the legacy `names` lint): Nance, Orr, Kell, Mott, Pask and Quill were
   all somebody's in another adventure. The check is by surname; it cost five renames. *Remedy:* scope it to the module.
10. **A rented face is one measure.** `rentEnds(party)` is a single measure for all rented faces; renting a second face on another
    day moves the first's end. Not a bug in this file; a company that rents the Gull in the morning and the Owl at noon keeps both
    until the later Ninth Bell.
11. **A varied outcome of one action needs a latch and a rule.** `Result` cannot vary, so the Rain-Wives' truth is one action and
    a rule (`dr_truth_kept`) that says a different thing if the company chose the hand, and `dr_lie_unravels` fires on the
    eighth day. Works; costs a relation each.

## What is thin or unfinished

- **The real campaign.** `drip.kyr` and `commoner.kyr` each carry a topic `with tibb`; until `gate.kyr` declares `tibb`, the real
  campaign does not load them. Everything was linted and played with a scratch stub for `tibb` (0 errors).
- **Tests point at the real campaign by default** (`OMBRA_CAMPAIGN` overrides); here they were run against the scratch one, and
  will pass in the merged module if nothing else changes the walk from the road to the Annex and the Drip.
- **Dill, Teale, Hal, Tansy, Gammon and Brine are small.** They carry a beat each, not a thread. Gammon's pound is a hook for
  counting.kyr's Short Pound (she weighs by the market's brass pound); she does not yet have a topic of its own about it.
- **The Owl's strike-break:** the lodgers are a topic and a flag; they do not appear in the lamp-yard. The company lights the
  lamps with them "in the telling".
- **The Procession** asserts `handPlayed` and `handWay` (the number of trades) and a text; drawing.kyr says what the room does.
- **The Rain-Wives' march** is told at the Chapel steps on its day (a rule, and an observation at the steps from noon to the Ninth Bell) and is a relation; the Wives are not persons, and are not there on the other days.
- **The Heron and Lamplight** (local.kyr) will write topics `with rill` about the letters; Rill's lantern is described and her
  night register is open to it, but nothing here refers to it.
- **No fate for Hal, Brine or Ley** except in Rill's and Jory's lines (and `named(dr_ley)` in Rill's).
- **Plain sound:** the Drip has no `as sound` observations; at night the dark hides nothing in the engine's eyes, so the
  scenes are all written for the lantern.
