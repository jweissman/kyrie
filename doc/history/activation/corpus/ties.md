# Ties: one structure, three dramatic forms

*Editorial track P4. File: `data/generation/town/ties.kyrt`. No TypeScript, rules data or first-hour text was changed.*

## What was wrong

The dramatic assessment (§2.4, §3 G4, §5.1) found that kin, debt and custom were one sequence in three coats: someone asks, you go, you come back, you are paid a flat sum, and a line appears on the green. Nothing ran if the player did nothing; nobody but the asker had anything at stake; and the three differed only in the noun (a pouch, a measure, a cairn).

## The shared structure (`--- base`, `--- shape`)

Every shape now has the same skeleton, so the draw stays coherent and the three can be compared:

- **A named town person asks** (the generated innkeeper, merchant or priest, by reference). The asking asserts `{t}_tie_asked` and stamps `{t}_tie_at` with the watch it happened, by one shared rule in the base.
- **A trace at the site** the company can bring back (or, for custom, mend), with a sign for a calling to read.
- **A third party, not the asker, who is standing in the town** where the company can see them (`{t}_tie_nan`, `{t}_tie_heir`, `{t}_tie_boy`), written in the same section as the asker and the trace. No shape borrows another's people, so a draw can never produce an incoherent combination; the asker told from both ends is still the one generated person.
- **A clock, `{t}_tie_lost`**, that falls whether or not the company is watching, and a visible change on the green when it does.
- **Choices that differ in what they cost the third party**, and a closing observation for each.

Item kinds, persons, relations and entities are all prefixed `{t}_tie_`. `{t}_tie_done` and `{t}_tie_cairn` and the labels used by `test/ties.test.ts` are unchanged; shape weights and order are unchanged, so no seed's draw moved.

## The three forms

| | **kin: the clock** | **debt: the rival** | **custom: the enforced obligation** |
|---|---|---|---|
| Third party | the innkeeper's dying mother in the doorway | the surveyor's son, who says it was a gift | a drover's boy the town will blame |
| Voices | innkeeper: short, ashamed of the lie; mother: crisp, practical | merchant: dry, in thimbles and weights; son: smooth, plausible | priest: gentle and unhappy to be right; boy: sullen, quick |
| If nothing is done | at watch 288 (or 144 after the ask) the lamp is covered with a grey cloth and the chair is empty | at watch 60 the son rides out and takes the measure from the site; at 130 he comes back and sets the market's weights by it; at 260 the merchant's stall is shuttered | at watch 216 the bell is rung and the boy is set on the well-curb with a loaf tied to his wrist |
| Choices | pouch to the mother first, or to the innkeeper (14 gold and a hurt mother-and-son pause); a ranger-type reads the heel-prints and may tell her he walked away alive, which gives her a road instead of peace; or too late, for 4 | buy it off the son (12, or 24 once the market has gone his way); or with insight shame him into giving it up free; or let him keep it | mend the cairn (10); or a woodcrafter reads the cattle's hooves and clears the boy by naming the drover (6) |
| Calling or lore | woodcraft (the heel-prints) | insight (the lie in "gift") | woodcraft (hooves) |
| Visible afterwards | in time: the lamp, the stool on the green, the old woman telling carters (or, if the mother was first, the innkeeper not speaking to you; or, if hope was given, "Not yet, mother"); late: a pouch nailed to the lintel | the merchant's counter and a young man leaving by the east road; or late, customers weighing twice | a clay bird chalked on the curb; or, if cleared, the drover walking behind his own herd with a sack of loaves |

## Retired

- The flat payments tied to nothing (`Give 14 / 12 / 10 gold` for any return at any time). Payment is now graded by when and how.
- The three single "after" lines that always appeared, whatever happened. Each shape has its own after-lines for the paths above.
- The lamp-as-metaphor and "which nobody has seen in years" are kept only where they still land (in-time kin).

## Deliberately not done

No bespoke mechanics, no movement of persons (a hamlet may lack a taproom or a shrine, so every third party stands on `{t}_green` and is hidden or shown with `Seen when`), and no new relation shared across shapes beyond the base. A generic request that would have made the forms cheaper to write is in `kyr-deem-requests.md` (R110).

## Specs

`test/ties.test.ts` (unchanged) and `test/ties-forms.test.ts`.

## Re-recording

The first-town digest and kept traces name the generated ties only where a seed's settlement draws them; any kept trace that visits a tie settlement's green, or that passes through the sites named here, will differ in `Observe` text. The integrator re-records `test/fixtures/traces` and regenerates `web/bundles.generated.json`.
