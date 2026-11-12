# Aesthetic and play critique (M20 closing, 12 November 2026)

Evidence: the contact sheets at four sizes (`../studies/screens/`), the arrival measurement
(`../evidence-tools/retrospective/arrival-words.ts`), cold rounds 9–12 (`../cold/`), and the owner's post-cutoff
review (`../review-mitigations-2026-11-12.md`). No human has played M20 (PD-14); everything below is the builder's
and agents' reading.

## What is strong (keep it)

- **The paintings and the dark stage.** At a laptop's size the resting scene is close to the cinematic intent: the
  painting edge to edge, the telling on it with a shade, the place's name light and large, a rail of quiet marks.
  The conversation page (large painting, short line, numbered questions) is the page every reviewer rates best.
- **The writing at its best.** Every round quotes lines: the drover's ruts and cairn, "water remembers", the bear
  "with a thin man for a pillow", the hobnails on a corpse. Round 12's reviewer A: "the opening story is excellent".
- **Honest odds.** "An even chance · one try", "d20 13 + 2 + 2 = 17 against 13", "In 8 minutes they will be on you"
  are praised in every round: the game says what a risk is.
- **One indicator.** The atlas's single pip and the led act's left line (gold followed, blue taught, rose companion,
  green gain, red danger) is a coherent grammar where it is applied.

## The five most significant weaknesses

1. **The scene says too much before it offers anything** (dramatic and aesthetic economy). Measured on arrival: the
   first place tells 122–247 words in 8–11 sentences; a town's heart **442–663 words in 21–28 sentences and 15–19
   paragraphs** before its four led acts (a1, kahitude, pine, wren). Against a three-sentence default that is three
   to nine times over. On a phone the telling overflows its panel (666 px in 269); on a laptop slightly (416 in 385).
   Round 12, A: "Millholm has about 22 paragraphs, with two dogs at one door, two notices by the well". The cause is
   compositional (every valid observation is told, at one weight), not the quality of any line. *Repro:*
   `bun doc/…/arrival-words.ts`; the town shots in `sheet-*.jpg` (03, 10).
2. **Signals still promise acts the surface does not show** (the promise contract). In the page: Go and Look are
   still lists in a panel beside their lens tiles; a led person's question is one tap further. In the headless
   terminal (round 12, both reviewers): the step an aim waits on was only under `all`, eight times, until fixed
   tonight (T24-14). Wherever an opportunity is two containers deep it is missed. *Repro:* review A's saves
   `s-t14.json`, `s-t27.json`; screens S1.
3. **Danger has no economy yet.** Fights are rated challenge 1–2 in rounds 5, 10, 11 and 12 (one real fight per
   session: a goblin chief, the spider mother, the ossuary at 1 HP); healing between fights is free in time and
   supply (Kindle fixed to `statMod`, E214, but Wait → Tend → cast still restores); light is a resource the page does
   not show except under Wait (R10-10). The pieces of an OSR expedition exist; they do not yet press.
4. **Pictures contradict state.** Of 2 062 places in three countries, 829 are drawn by a generic painting and the
   players' complaints are about state (a ruin painted whole and sunny, a charnel passage as a statue gallery, a
   stair "four storeys down" as a hillside). Dimming by the hour (E207) fixed time of day only. *Repro:*
   `../evidence-tools/paintings/*.tsv`; `doc/paintings/commission-list.md`.
5. **After the first jobs, nothing pulls.** Every notice job is a dungeon of two to four rooms; after each, the game
   moves to the next notice and never makes a larger adventure (the mound, the green-lit tower, thirty rumours) the
   aim (T24-18). Interest is rated 4 in every round; "wish to continue" 3.

## Silver, neutral, dim and gold

Gold is now strict (only after Follow; one next step; E183–E190) and both round-12 reviewers trusted it within a job.
Silver (a lead perceived) is the least legible: the white pips on the rail at the opening (three at once) were not
decoded by any cold player (round 10, S: "never decoded"). Dim works as opacity. Neutral vs silver is a 7 % lightness
difference (#D7DBE4 against the greys): no render check guards it (R10-03).

## The cinematic direction and the three-sentence budget, examined

- **For it:** the cinematic scene is now the only resting composition, and the contact sheet shows it is calmer and
  more painterly than the panel it replaced; lenses (Talk, Go, Look tiles) begin "attention layers".
- **Against doing it mechanically:** the telling is the game's richest material and the clue chains (hobnails, the
  offering-box) live in it. A hard three-sentence cut would hide clues. The measured problem is not length alone but
  that *standing* description, *ambient* life and *new* change are told at one weight every arrival.
- **Recommendation:** a default of three sentences for the place's standing description *on a return visit and in a
  town's heart*, with one sensory line; what changed since the last visit and anything the followed aim bears on
  always told; the rest a deliberate Look away. Measure it with `arrival-words.ts` before and after.

## A small tense expedition as an acceptance scenario

**Already supports it:** light and darkness (rooms unlit, torches and candles, "In the dark…"), time (watches,
minutes per act, warnings with minutes left), rations and being fed, burden, traps with honest odds, warned
creatures, retreat (flee odds; the way back on the scene, E206), companions who fall and can be raised for coin,
deaths that stay, kept saves.
**Most serious deficits:** (1) recovery is nearly free, so attrition never builds; (2) light's remaining time is not
shown where it matters; (3) the first-hour bands are mostly trivial for a warrior and deadly for a first-level mage
(design-opportunities §10–12); (4) consequences of a failed or abandoned expedition are rarely felt back in town; (5)
the fight's account and forecast have disagreed (E191; review-mitigations D2).
**Candidate:** the hobs' toll-house (the owner's review proposes it) or the corn-store cellar to the rats' nest
(smaller, every round has played it): one light, one ration, one companion, a warned danger, a way to retreat, and a
return that the town remembers. Acceptance: two builds play it differently and a human finds the decision to press
on or turn back tense.
