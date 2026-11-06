# 16. Adversarial review of the broad pass

*Reviewer's note. Read-only except this file. Judged at working tree on top of `860a8f5` (HEAD moved from `2bf8f23` while I read; `the-dorothea/ship.kyr` and `test/the-slack.test.ts` changed under me, and line numbers in the new-text files shifted by about seven between my first diff and my final grep. Line numbers below were re-grepped at the end). Method: `git diff fb24f94 -- data/adventures` (about 4,000 added lines), every ledger in `doc/imbar/adventures/`, the tests the ledgers cite, `bin/kyrie lint` on eight campaigns. I did not run the suite. I did not play the games; "verdict" means "what the Kyr and the test say", not "what a player saw".*

## 0. The short version

1. **The headline content of at least five adventures cannot be reached by the party the campaign ships with.** Seventeen of the 24 shipped campaigns are a company of one. The bible's chief device (calling-keyed voices and a "calling-unique way through") is therefore, for most shipped campaigns, one voice and a locked door. The ledgers confess it in their last bullets; their headline tables do not.
2. **The motif is a tic.** "Eleven strokes and a blank" appears in 12 of the revised adventures (about 75 added lines); a kept light in 14; the fish-and-flame in 6 (the bible says at most 5), and it is *explained* twice, which the bible forbids. Worse, the gloss leaks into dialogue verbatim ("THE TWELFTH IS NOT LOST", "a lamp for no one living").
3. **Tests are mostly honest plays (good), but the payoffs are the places they cheat.** Thrume's Mouth payoffs, Quittance's unique solutions, Winter in Carth's Ash Day lantern, the whole Slack, are tested with hand-asserted preconditions. Three Dorothea routes the third-pass doc lists as built (the Kestrel's hands: fight / eight coin / Rune; Jago's bribe) are not played by any test.
4. **The prose has one author.** Twenty-odd speeches in different mouths in different centuries end the same way: a dry quoted line that explains the joke or the mystery.

## 1. Overclaiming: claims checked against Kyr and tests

Verdict key: **true** = Kyr and test both bear it out; **partly** = true in Kyr, thinner in test or reach; **false** = contradicted.

| # | Claim (source) | Verdict | Evidence |
|---|---|---|---|
| 1 | "six calling-keyed voices" (book-of-faces.md, Calling row) | **partly** | Kyr: true, 7 rules, 6 callings, thief twice (`book-of-faces/revision.kyr:189-213`). Test asserts four (cleric, thief, warrior, ranger) and the *absence* of the mage line; the bard's Wet Stage voice is never asserted (`test/the-book-of-faces-revision.test.ts`, "the company in the city"). The fixture company is four members; the shipped campaign is a lone warrior (`data/campaigns/the-book-of-faces.campaign.json`), who hears **one** of the six (the Stair). |
| 2 | "Calling-unique: only a thief of the company can find the case's second lock" (book-of-faces.md) | **partly** | True in Kyr (`revision.kyr:127`, `hasCalling(who, calling_thief)`) and in the fixture test. But the leaf, the thief/cleric quarrel, Thole's mask, Hart's refusal and the Bursar's fee-for-news payoff all hang from it. The ledger's own shortfall: "A party with no thief cannot get the leaf (deliberate)". The shipped party is a warrior. The adventure's *first page* is unreachable in the shipped game. |
| 3 | "Six of these are heard by the presets, across all five acts" (thrume.md, Companion arc) | **false** | Preset voices (ranger/warrior/cleric) are seven, not six, at `thrume/voices.kyr:13,17,23,29,33,37,47`: Acts I, II, III, V. **Act IV (Hush and the Tomb) has none**; the ledger's own shortfall says "The Hush is unchanged". |
| 4 | "Neither [rhyme nor names] appears in the finale for a company that did not hear them (tested)" and foreshadow "pays off at the Mouth" (thrume.md) | **partly** | The negative case is a real play. The positive case is not: `test/thrume-depth.test.ts:224-225` asserts `knows(party, smith_names)` and `knows(party, wenna_rhyme)` into the world by hand and then sings. Wenna's rhyme *is* obtainable by play (`thrume/faces.kyr:72`) and the names by the office (`wages.kyr:79`, tested at line 163), but the chain "heard in the hold, finished at the Mouth" is nowhere played. |
| 5 | Paid fight "is won, one of the three is down and the others on a hit point or two" (thrume.md) | **partly** | Test asserts only `fallen >= 1` and `stirring == 3` (`thrume-depth.test.ts:168-179`). "Others on a hit point or two" is not asserted. The "costly" is one measure bump and one casualty. |
| 6 | "ranger alone can calm the wolves" (thrume.md) | **partly** | The same ledger says "or Skarn's bone whistle", and the whistle is `Give`n by Skarn when pressed (`thrume/faces.kyr`, `skarn_pressed`). Not "alone". Honest in shortfalls ("only ranger-unique solution"). |
| 7 | "Gate (new): three ways in … knock / pick / stare it open (monk only)" (house-that-grows.md) | **partly** | Kyr has all three (`house-that-grows/slope.kyr:~113-132`). Test plays the knock and the stare against the shipped campaign (good: it walks from Kezu's kitchen, no teleport) and **never plays "Pick the brass lock"** (`grep Pick test/house-that-grows-slope.test.ts` is empty), so the "Neme is hurt, `gateForced`" branch is untested. |
| 8 | "Every action reachable in `test/quittance-voices.test.ts`"; "the one `j.give` is the Watch's tally" (quittance.md, row 9) | **partly / misleading** | The unique-solution preconditions are set by hand, not reached: `Ds.put … knows d_gasket_next` (lines 38, 49, 56, 71), `tithePrepared` and the burners' location (102-103, 110-111), `fireTermKeeper` (133), `burned candlewick` (166), plus `j.give` and `j.assert(befell)` (174, 182). Ten shortcuts, one admitted. |
| 9 | "New actions reachable and tested; … no `j.give`" (winter-in-carth.md, row 9) | **partly** | Literally no `give`, but `test/winter-in-carth-callings.test.ts` teleports with `j.put('party', …)` six times (lines 11, 52, 58, 70, 80, 92), grants knowledge with `learn()` (line 17), forces dice with `g.j.roll('pass')` (line 138), and the Ash Day lantern foreshadow is tested by **asserting `courseSet(joby)` and `pellowGone(pellow)`** (line 130) rather than causing them. And all but one test builds a non-shipped company (`build('cleric')` etc.). |
| 10 | "a calling-unique reading (the cleric alone reads the leaf)" (winter-in-carth.md); same shape in Gosse's (cleric requiem), Liberty (Lisk Wife's office), Half the Hive (cleric carrying office and capping Merrit) | **true in Kyr; unreachable shipped** | Shipped parties: Winter in Carth, Gosse's, Liberty = lone **bard**; Half the Hive = lone **ranger**. Each ledger's last bullets admit it (winter-in-carth.md:49; liberty-of-the-ice.md "company is `of 1`"; half-the-hive.md "still Wren alone"). The *consequential choice* (which wax caps Merrit) and the fate line "whichever wax" therefore never print in the shipped campaign. |
| 11 | "Companion arc … a choice with consequences … the Kestrel's hands boarding on a failed unloading (fight, bribe eight coin, or Rune who drank with them)" (13-critique §13.7) and "the new boarding party has a test for the bribe route only through the Skerrow suite" (friction.md) | **false** | `grep -rn 'Jago\|Pendry\|Kestrel\|Make Rune\|pay_the_hands\|unload_casks\|rune_speaks' test/` finds nothing in any Dorothea test. The report/shame routes are played (`test/the-dorothea.test.ts:112-134`); "take Jago's eight coin" (`crew.kyr:77`), the unloading roll, and all three boarding answers (`crew.kyr:91-122`) are untested, and the friction note's claim that the Skerrow suite covers the bribe is wrong. |
| 12 | "The company can leave him, report him, buy his silence, or shame him into carrying the casks back" (13 §13.2) | **partly** | Report and shame played; "buy his silence" (`take_cut`, `crew.kyr:77`) unplayed. Also `Decrease cargo by …` lint advice stands. |
| 13 | Fish-and-flame "found in at most five adventures and explained in none" (14-bible §14.2) | **false** | Present in six: liberty-of-the-ice (`deeper.kyr`), winter-in-carth (`voices.kyr`), house-that-grows (`slope.kyr:30`), the-dorothea (`night.kyr`), the-grand-tour (`remainder.kyr:196`), skeel (`keeper.kyr`; also pre-existing in `holm.kyr:75`). **Explained** in `the-dorothea/night.kyr:9-11` (a receipt: a Prefect's steward Lucanus lent one lamp to the keepers) and again in `remainder.kyr:200` ("a steward named Lucanus took it ashore to be mended … a lending"). `13-critique` §13.3.3 itself warns this "lends the ship an Aenean history". |
| 14 | "Eleven strokes and a blank … use sparingly" (bible §14.2); liberty ledger "kept light motif" | **false** | 12 adventures, about 75 added lines. Table in section 3. |
| 15 | "Every province installing in one world" / gifts work (13 §13.2.5) and `gifts.test.ts` | **true** (not re-run) | `gifts.test.ts` asks each giver; all new items I traced are `Give`n (`halm_letter`, `bench_rubbing`, `thrume_whistle`, `wage_roll`, `rag_paper` sold at `skerrow.kyr:7`). No `Assert lends` in the new text (grep empty). |
| 16 | "The Slack … 8 tests" and "ordinary-world-slack" (13 §13.1) | **partly** | 13 states "give and put are test aids"; confirmed: 18 `put/give/assert` in `test/the-slack.test.ts` (e.g. lines 30, 53-60: `j.give('pskeel__bench_rubbing'); j.give('ptolleth__rubbing'); j.give('plongman__rod'); j.give('plongman__writ_copy')`). Honest, but it means the claim "three keys, each a gift to a person in its own adventure" is tested by item shortcut; the "costly" route test also starts from `j.put('party', 'psennet__nexus')` and the Remainder tests give six items by hand (lines 69-72). The 30-coin scribes route (`hours.kyr`) is the one way that needs no item from another adventure, which is why it should be the one a test plays from a walked arrival. |
| 17 | "voices … hasCalling did not fire in a standalone campaign" (friction.md #17, "not checked in other campaigns") | **stale** | Voices demonstrably fire for preset callings in Hessel, Hollins, Parliament, Dorothea, House That Grows tests. The note should be closed or reproduced; today a reader cannot tell whether the bug exists. |
| 18 | BoF ledger "Tests (10 …)" | minor | The file has 12 `it()`s. Harmless, but the ledgers' counts are unaudited. |

**Credit.** Hessel (`test/hessel-season.test.ts`), Hollins (`hollins-winders.test.ts`), Parliament's chant (`parliament-of-books-post.test.ts`), House That Grows and Let One Remember play their claimed paths with labels a player sees (the `>place` step in `Journey` walks real passages, it is not a teleport: `src/session/journey.ts:348`). Their calling-unique solutions match the shipped parties (bard, warrior, bard, monk, ranger). These are the template; the rest should be brought to them.

## 2. The shipped-party problem, quantified

Presets: 17 lone, 7 multi. Calling-unique new content versus the shipped party:

| Adventure | Shipped party | Headline calling-unique content | Reachable shipped? |
|---|---|---|---|
| Book of Faces | warrior | thief: leaf, quarrel, Hart, Thole, Bursar report | No |
| Winter in Carth | bard | cleric: first leaf of the Register, whose title is the adventure's *first page* | No |
| Gosse's Company | bard | cleric: requiem, Eighth Ordinance, lamplighter's seal | No |
| Liberty of the Ice | bard | cleric: Lisk Wife's office; thief vs widow choice | No / choice half |
| Half the Hive | ranger | cleric: carrying office; capping Merrit; the fate line | No |
| The Lull | warrior | cleric: Office for the Easing (`the-lull-revised.test.ts:33`) | No |
| Quiet in the Sky | warrior | cleric side `side_down` "not played to the grave" | No |
| Patient Star | thief | mage, cleric, warrior voices | Thief only |
| Hessel / Parliament / Hollins / House That Grows | bard / bard / warrior / monk | matched | **Yes** |
| Thrume / Quittance / Dorothea / Let One Remember / Long Man | ranger+warrior+cleric (+thief in Dorothea) | matched | Yes |

Eight of 24 shipped games lock their *new* flagship beat. The ledgers' own advice ("the content shows in a drawn world's company") is true only for the generated-world path; the standalone campaigns are what people click on. Cheapest fix: make the preset multi-member (S per campaign, but breaks every recorded trace), or add a **non-calling route** for each locked beat (M), e.g. a lone bard can *hum* the burial office badly and get a half-result.

## 3. Motif audit (new text only; line numbers at current tree)

**Eleven strokes and a blank / twelfth missing** (bible says "sparingly"; the Long Man originated it). Instances:

| Adventure | Where | Verdict |
|---|---|---|
| Book of Faces | twelve hooks, eleven tagged (`revision.kyr:18,23`); lintel of eleven names (`:24,143`); eleven Assayers (`:61`) | **cut lintel and hooks to one**; the Bursar-as-twelfth is the idea, the lintel repeats it |
| Hessel | pumper's slate (`season.kyr:9,14`); candle-ends "in bunches of eleven" (`:22`); minuet's twelfth bar (`:28`); Ede's twelfth stroke (`:86`) | **keep the bar and Ede; cut slate and candle-ends**. A comic book that gets a numerological foreshadow in its first room is parodying nothing |
| Hollins | eleven notches (`winders.kyr:15,100`); clock-hands rows of twelve, first eleven black (`:11`) | keep notches, cut the hands row |
| House That Grows | eleven knocks (`slope.kyr:18,42`); wall Reckoning (`:68,72,73`); Neme asks why eleven (`:163`); ending (`:266`) | **keep**: the knock is load-bearing (`knock_count`), but cut the Reckoning wall (it re-explains the knock) and Neme's "the twelfth is yours" (the action already says it) |
| Parliament | eleven stages (`post.kyr:4,40,80,111`) | change to nine or thirteen; the number is arbitrary here |
| Patient Star | twelve-word prayer, eleven-word clerk, tally-board, shore post (`kept_season.kyr:5,40,45,46,112,113`) | keep the twelfth *word* (structural: `say_the_twelfth`); **cut the shore post**, which says the motif aloud in capitals |
| Quiet in the Sky | eleven Whitlock notches (`fellowship.kyr:75,76`) | cut |
| Quittance | cellar-stair strokes, Fire's twelfth place, tally-stick (`depth.kyr:16,17,19,92,100`) | keep one (the Fire's "I have been keeping the place"); cut the tally-stick action |
| The Dorothea | receipt row / eleven stones (`night.kyr:10,11,26`); fever office "eleven lines and a blank" (`weather.kyr:76`) | keep stones, **cut the fever office**: a sickbed prayer in the motif's cadence |
| Grand Tour | square (`hours.kyr:24,106`); chart pin and rem. bell (`remainder.kyr:69,97,151,158,162,207,252,257`) | keep: it is the meta-adventure's own lock. Eight uses in one file is still too many |
| Thrume | Gauge dial (`faces.kyr:93`) | cut |
| Let One Remember | `witness.kyr:100` | cut |

Result if followed: 12 adventures to 6, about 75 lines to about 30.

**Kept lights** (a lamp lit for no one now living). Fourteen: Book of Faces (`revision.kyr:22,24`), House That Grows (`slope.kyr:252`), Let One Remember (`witness.kyr:57`), Patient Star (cairn lamp, `kept_season.kyr:95`), Quiet in the Sky (`fellowship.kyr:81`), Quittance (`voices.kyr:30`, "lit for ninety-four years"), Dorothea (the Pharos; `port.kyr:2`), Grand Tour (masthead lamp, `remainder.kyr:200,203`), Thrume (`faces.kyr:26`), Winter in Carth (`seam.kyr:13`), Wrayford (`voices.kyr:2`: "a lamp kept for no one living"), Liberty (the second light, `deeper.kyr`), Half the Hive (the kept lantern, ledger), Hollins/Parliament (a lamp lit for a mail that does not come). Three of them (Thrume `faces.kyr:26`, House That Grows `slope.kyr:252`, Dorothea's rumour in `countries.json:554-555`) are **the same lamp gossiped about by an old woman** ("a lamp on a rock beyond the Combs", "a tower where one is kept in a window", "a lamp has burned since before the roads"). The bible said "a different small instance per adventure, never explained"; the author instead strung them into a rumour-chain explained by the Dorothea's receipt. **Recommend cut:** Book of Faces (an unexplained self-lit lamp is the *one* supernatural note in a satire), Quiet in the Sky, Winter in Carth's second lantern, Thrume's fire (keep Agathe's *fire*, cut the "same kind as the Combs" pilgrims line), Hollins/Parliament lamp, Wrayford. Keep: Dorothea/Pharos (source), Patient Star cairn (structural), Quittance coal, Grand Tour mast bracket.

**Fish and flame:** six adventures where the bible allows five, and "explained in none" is false (row 13). **Cut** Winter in Carth's (`voices.kyr` first_leaf) or Liberty's (`deeper.kyr`; Liberty also invents the verger who says "keep" against "owe"), and delete the Lucanus receipt gloss from the Remainder's Tamsin speech so that the Dorothea alone supplies it. Better: delete the receipt's *translation* in `night.kyr:10` (leave the framed paper unreadable, which the bible, and 13 §13.3.3, wanted).

## 4. Prose

### 4.1 House-voice tics (counts over about 4,000 added lines)

- A speech or Result ends on a quoted, dry, self-aware line: about 210 lines (about 60% of `Says`/`Result` lines). Samples: `book-of-faces/revision.kyr:62` ("It is not a lie not to say a thing. It is only a very long habit."), `quittance/depth.kyr:93` ("It is not an answer. It is the exact size of a question."), `the-dorothea/crew.kyr:82` ("…and that is the worst of it."), `hollins/winders.kyr`, `thrume/wages.kyr:58` ("as a man says a day is short").
- "Nobody / no one says why": 15 (`hollins/winders.kyr:11` "Nobody says why", `the-dorothea/night.kyr:14` "Nobody's ever been able to read it", `hessel/season.kyr` "Nobody looks. Everybody, going out, touches the frame", `winter-in-carth/seam.kyr:13` "nobody has said whose it is"). The bible's item 5 ("a thing everyone does and no one can explain") has been satisfied by the same sentence in every adventure: Hessel's pillar quarter-turn, Hessel's left-hand gloves, Hollins' quiet minute, the Lull's right-edge curtains (`the-lull/fellowship.kyr:68`), Quittance's saucers, Thrume's pinch of salt. Each is a fine bit; as a set they are a formula.
- "to nobody" (10), "does not look up / without looking up" (8), "for the first time" (16), "plainly/absurdly/very low/quite softly" (31), "as if / like a(n)" (about 120), "two hundred / two thousand years/winters" (19: the Pharos "two thousand winters", Neme "fourteen for two and a half thousand years", the cheese suit "two hundred and eleven years", the scale pivot "two hundred years of hands", Corin's niche "two hundred and twenty-five years"). All of the world's grievances are the same age.
- The bible's gloss leaks verbatim into dialogue: "missing and not lost" is `house-that-grows/slope.kyr:73` and, in bell-capitals, `patient-star/kept_season.kyr:115` ("THE TWELFTH IS NOT LOST. THE TWELFTH IS NOT YET. WE KEEP THE PLACE… IT IS THE STROKE YOU ARE STANDING IN."); "a lamp for no one living" is `thrume/faces.kyr:26`.
- The same joke twice: "a ship in a cellar" is the rumour joke in `wrayford/voices.kyr:54` and `gosses-company/voices.kyr:75` (Pudding), and Hessel's Mrs Scrope has "a stair under a college". Each is fine alone; cross-links are supposed to be rumours with different shapes.
- Recurring names: Tamsin (Quarrow in Thrume, Quaye in the Remainder, plus the preset in four campaigns), Sabe (Sabe in House That Grows, Orrel Sabe in the Tour), Ysolt (three), Wenna (Lull, Thrume), Hester (Liberty, Lull, Dorothea). Lint allows it; a reader will not.
- Purple/telling: `the-grand-tour/hours.kyr:82` ("you know that you are standing in the presence of two parts of the same kind of thing, and that one of them has been taken from something that is now lying quite still in a niche under a hill"): tells the player what to understand.
- Jokes that land (so the record is fair): the cheese suit and the midwinter card (`revision.kyr` Bursar), Mr Twiss: "I shall remember that you did not do it aloud", Pudding's "Neither is the ship", Rune's "Davy. Pike. Hobb." Hessel and Gosse's are the only adventures whose new prose is *not* in the voice.

### 4.2 The five worst, with rewrites

**1. `the-grand-tour/remainder.kyr:200` (Tamsin on the lamp: exposition dump, explains the mystery, double aphorism).**
> "…a ship with a light is a ship that has a place. The second roll says a steward named Lucanus took it ashore to be mended. It is not a mending. It is a lending.' Her voice is perfectly even. 'There is a name on the roll that is not struck. His. Everyone else is a line. He has a question mark.'"

Rewrite: "'The masthead lamp,' says Tamsin, not looking up from the rods. 'It was taken ashore to be mended. That's what the roll says, in the second hand.' She sets a bead. 'One name on it isn't struck through. It has a question mark.'" (Drops "mending/lending" and "a ship with a light has a place"; leaves Lucanus unglossed.)

**2. `book-of-faces/revision.kyr:181` (vigil: authorial summary, ends on a verdict).**
> "…and you are, for an hour, the only ones keeping anything. At the end of it the lamp has not changed. You feel, absurdly, thanked."

Rewrite: "…The Counterpoise comes in from the landing, stands by the door and sets its pebble down in the dust, which it has not done before. At the end of the hour the lamp is as it was. On the way up it holds the door." (Keep the concrete act; cut the "only ones keeping" and the feeling.)

**3. `patient-star/kept_season.kyr:115` (the shore post: the motif announces itself in capitals).**
> "'ELEVEN,' says the Remembrancer, in bells. 'THE TWELFTH IS NOT LOST. THE TWELFTH IS NOT YET. WE KEEP THE PLACE.' … 'IT IS THE STROKE YOU ARE STANDING IN. WHEN IT IS CUT YOU WILL NOT SEE IT BEING CUT.'"

Rewrite: delete the topic. Let the post stand as an Observe ("a post of black wood with eleven notches and a smooth place under the eleventh"). If a line is wanted: "'We keep the place,' says the Remembrancer, and will say no more." The reader who has played the clerk will supply the rest; one who hasn't should not be told.

**4. `the-dorothea/crew.kyr:82` (a good scene weakened by a gloss).**
> "'Don't,' says Bascom, gently, and that is the worst of it."

Rewrite: "'Don't,' says Bascom, gently." (Stop. The scene before it, "In the spring I made it fourteen. I told myself I'd counted wrong", is the best line in the voyage and needs no help.)

**5. `book-of-faces/revision.kyr:223` (Vail: explains her own joke).**
> "'You may tell no one,' she says, 'which is, you will note, the whole of the Concord's law in a sentence.'"

Rewrite: "'You may tell no one,' she says." (The Concord's law is already the premise of the city. "You will note" is the author nudging.) Sixth, for the same reason: `book-of-faces/revision.kyr:62` ("It is not a lie not to say a thing. It is only a very long habit") should end at "There."

### 4.3 Mysteries explained that should stay open

- The fish-and-flame (receipt translation, `night.kyr:10`; Remainder `:200`). Cut the translation.
- The Slack as "a ship at the pause in the count": still explained by two paragraphs from Sabe and Tamsin (13 §13.3.2 admits this and §13.6 item 1 proposes the fix; not done).
- `thrume/faces.kyr:26`: the fire "nobody lit" is then tied to the Combs lamp by pilgrims. Leave the fire alone.
- `house-that-grows/slope.kyr:73` and `patient-star:115`: what the twelfth is.
- `half-the-hive` ledger: "the ranger's road says the east was *laid*" with no mechanical consequence; fine as a mystery, but the ledger lists it as a payoff.

## 5. Structure: six adventures, is the shape visible in play?

1. **Thrume.** Five real acts and real faces. But the new material is in a pay-hall behind a torch and four rooms of Delving; the test file concedes "a full play to each is five hundred steps" and starts fixtures at the gate; only two of fourteen tests start from the shipped campaign. The Mouth payoffs depend on two `knows` that nobody is told to look for. Act IV is untouched. *Shape visible: yes (Acts I-III); reached by a typical player: probably not (Paymasters' hall is off the critical path by design).*
2. **Winter in Carth.** Four acts exist from before. New content: ten voices, one hears (bard, only at the Fat Lamb on Fastens' Eve, watch 360). The cleric leaf is unreachable shipped, the Ash Day lantern needs the course set *and* Pellow gone, which the test fakes. *Visible: no; the new scenes are optional garnish over a lone bard.*
3. **Hessel.** The best shape, because it is a clock: third morning peal (6-11), the ball after 23:00, Ede's night 02:00-05:00 on day 4 (`season.kyr`, `ede_dies`). Risk: all three windows are unsignposted, and the bard needs to be at the Abbey Yard in a five-hour window to understand the peal and at the Ball at 23:00 to use it; a player who sleeps through the third morning loses the unique action silently. The test jumps the clock (`=` steps), which proves the mechanism, not discoverability.
4. **Parliament of Books.** Clear: mudbank, hatch, post-house, Undelivered. The post-house opens at dead low water only. The shipped party is a lone bard with six hit points; the ledger's own test "can be fought, and a lone bard is not likely to come out of it". Ways round are real (chant, dead letter, talk). Acceptable. The two final tests teleport the party by `world.apply(retract at…)` (lines 113-127).
5. **The Dorothea.** Quay, sea, isle, night, return: a real five-beat shape with a clock. The main tests run with the sea table switched off (`j.assert(seaQuiet)` at `the-dorothea.test.ts:18,198`; `skerrow-night.test.ts:10`), so the sea events are only exercised in `dorothea-sea.test.ts`. The boarding answers are unplayed (row 11). The "Orsett reckoning on return" is, per friction.md, unwritten, so the voyage's last act has nothing at the destination.
6. **Half the Hive / Book of Faces (shipped).** Structure old and good; the revision adds a cellar and a Bursar to a lone warrior who can open the Bursar's fee-chit and cannot take the leaf. The player meets the Bursar at the hooks, hears her "I am the twelfth", pays three coin, descends, and finds a lock he cannot feel. *The new act ends in a locked drawer.*

Also worth noting: the Slack/Remainder (not in the six). Reachable shipped via the 30-coin scribes. The act shape is good (square, stair, quay, bell, Divider); the Remainder is still the long-speech scene 13 §13.3.4 already condemned.

## 6. Playability and lint

- `bin/kyrie lint` on eight campaigns (winter-in-carth, book-of-faces, dorothea, grand-tour, liberty, thrume, quittance, hessel): **0 errors everywhere**. New warnings that are *this branch's*: **one**, `quittance`: `action quittance__qv_t_slack has no possible target in this world` (the Fire's far-door topic; ledger-admitted; reachable only in the all-in-one world). Pre-existing warnings (not in the diff): BoF three `unbound` (`lc_jam_grating`, `lc_swap_eels`, `bd_shape`), Quittance nine `unbound` (`slip_the_stair`, `mourn_in`, `pick_wicket`, …), Liberty `bar_man` role, Thrume `dream_abbess` role. Advice-level: Dorothea three `lowered` (cargo, `take_cut`, `pay_the_hands`, `light_the_ship`) which friction.md #4 knowingly leaves; **`pay_the_hands` is one of the unplayed boarding answers, and `Decrease cargo(hull) by 4` without a floor is exactly the case that hides the action** (`crew.kyr:115`: it asserts `Decrease cargo(hull) by 4` on a hull whose cargo may be below four).
- The lint "advice anchor" noise on every `Rule` voice (friction.md #6) is a real cost: Dorothea has four of them and Winter in Carth five; a reviewer cannot distinguish a true unanchored rule from the benign.
- Write-only relations in new content (Dorothea `departedAt`, `leftAt`, `quiet`; Lull `weeksAsleep`, `wennaWants`; Patient Star `fed`, `thanked`, `accused`) are rules that can never matter. They are dead state, not bugs, but several name a consequence the prose promises ("Wenna wants …").
- Items: no `Assert lends`; traced items (`collegium_letter` from Halm, `tally_rubbing` from Hosken, `pharos_rubbing`, `post_dead_letter`, `thrume_whistle`, `thrume_starbar`) are all `Give`n or sold. `watch_tally` is defined in `the-grand-tour/remainder.kyr`, not the Dorothea as `gosses-company.md` ("the Dorothea's `watch_tally`") and `13` §13.7 seem to say: a cross-reference error in the ledger.
- Time-windowed actions with no signposting: Hessel (above), Hollins' quiet minute (`hour(clock)==16`), Parliament's dead low water, House That Grows' sill wind (`untilLight == 3`). Each is defensible; there are no hints in the shipped campaigns' pitches.
- Hand-asserted payoffs make "can this ever fire?" unanswerable for: Thrume `smiths_sung` / `rhyme_sung`, Winter in Carth `lantern_hung`, Quittance `qv_keeper_stays` (needs `fireTermKeeper`, a state reached by "terms made" in descent.kyr: reachable, but the test sets it by hand).

## 7. Prioritised to-do (15)

| # | Fix | Files | Effort | Why |
|---|---|---|---|---|
| 1 | Give each locked-by-calling flagship beat a **lone-company route** (a weak, partial, costly version) for the shipped party: BoF thief lock (warrior forces it: breaks the Pound's mould), Carth leaf (a bard recites the lines from memory, imperfect), Gosse's requiem, Liberty's office, Half the Hive's capping, Lull's Office | `book-of-faces/revision.kyr`, `winter-in-carth/voices.kyr`, `gosses-company/voices.kyr`, `liberty-of-the-ice/callings.kyr`, `half-the-hive/wake.kyr`, `the-lull/fellowship.kyr` | L | Eight of 24 shipped games hide their new first page behind a calling the preset lacks. This is the largest value fix. |
| 2 | Cut the motif per section 3: eleven-and-blank from 12 to 6 adventures, delete the shore post, the Reckoning wall, the fever office, the Hessel slate/candle-ends, Quiet, Thrume, Let One Remember | those files; plus matching ledger lines | M | Cheap, high effect: a tic is the first thing a reader notices. |
| 3 | Remove the Aenean-roll / receipt **translation** and Tamsin's Lucanus speech; cut the fish-and-flame to five adventures | `the-dorothea/night.kyr:9-11`, `the-grand-tour/remainder.kyr:186-200`, `winter-in-carth/voices.kyr` or `liberty-of-the-ice/deeper.kyr` | S | Returns the bible's "explained in none"; and 13 §13.3.3 and §13.3.4 already asked. |
| 4 | Write tests for the **unplayed Dorothea boarding**: `take_cut`, `unload_casks` (pass/fail), `pay_the_hands`, `rune_speaks`, fight; fix `pay_the_hands`'s cargo floor | `test/the-dorothea.test.ts` (or new), `the-dorothea/crew.kyr` | M | Doc claims it built; no test, and one route may hide itself. |
| 5 | Replace hand-asserted payoff preconditions with plays in Thrume (`wenna_rhyme`, `smith_names`), Quittance (`d_gasket_next`, tithe, `fireTermKeeper`), Winter in Carth (`courseSet`, `pellowGone`) | `thrume-depth`, `quittance-voices`, `winter-in-carth-callings` tests | M | The bible says "do not use shortcuts"; these are the foreshadow/payoff claims. |
| 6 | Rewrite the five worst passages (4.2) and the Bursar "very long habit" line | files in 4.2 | S | Fast, visible. |
| 7 | Add a play-the-shipped-campaign test for each of: Winter in Carth (bard path), BoF (warrior path), Half the Hive (ranger path), Liberty (bard path), asserting what such a player *does* meet | new tests | M | Guard against ledger drift; today no test says what the shipped player gets. |
| 8 | Reduce the kept-light chain to Dorothea (source), Patient Star, Quittance, Grand Tour; delete 8 others | `book-of-faces/revision.kyr:22,24`, `quiet-in-the-sky/fellowship.kyr:81`, `thrume/faces.kyr:26`, `wrayford/voices.kyr`, `hollins`, `parliament` | S | Same tic family. |
| 9 | Add Act IV voices (Hush/Tomb) to Thrume, or correct the ledger's "all five acts" | `thrume/voices.kyr`, `doc/imbar/adventures/thrume.md` | S | Ledger is false as written. |
| 10 | Test the `pick` route and `gateForced` consequence at House That Grows' gate | `test/house-that-grows-slope.test.ts` | S | "Three ways" claim has two plays. |
| 11 | Give the Remainder a scene with no one to ask (13 §13.6 item 1), replacing one of the long Sabe/Tamsin speeches | `the-grand-tour/remainder.kyr` | M | Four documents ask for it; none has done it. |
| 12 | Break the formula "a thing everyone does and no one can explain": vary the forms (one is explained by a child, one is a wrong explanation, one is simply omitted) | Hessel, Hollins, Lull, Quittance, Thrume files | M | Tic reduction beyond motifs. |
| 13 | Rename duplicates: Quaye/Quarrow, Sabe/Orrel Sabe, the three Hesters | the files above | S | Readers conflate. |
| 14 | Reconcile ledgers: BoF test count (10 vs 12), `watch_tally` owner, friction #17 stale, `13-critique` §13.7 "17 pass" without the third-pass route claims; remove "(tested)" from claims that are asserted | `doc/imbar/adventures/*.md`, `13-critique-and-status.md`, `friction.md` | S | The docs are the contract. |
| 15 | Signpost the time-windowed unique actions (Hessel peal and ball, Hollins quiet minute) with one early Observe each | `hessel/season.kyr`, `hollins/winders.kyr` | S | Otherwise the bard-unique beat is silent for most plays. |

## 8. What I did not do

I did not run any suite; I did not play the shipped campaigns end to end; I did not review `the-dorothea/ship.kyr`'s late edit, the `data/goings-on/factors` Deem module (read only the diffstat) or `the-long-man` and `low-water` revisions beyond grepping. Counts of motif lines are on the `git diff` of `data/adventures` (some are restatements: a Discovery and its Observe count twice), so treat "about 75" as ±15.
