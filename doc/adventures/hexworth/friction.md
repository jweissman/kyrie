# A Voice for Hexworth: friction report

Branch `adventure/hexworth`. Module `hexworth`, campaign `data/campaigns/hexworth.campaign.json`, spec
`test/hexworth.test.ts` (15 journeys), fiction notes in `story.md` beside this file.

## What I meant to make

An adventure about making one thing, not finding out one thing. A peat town's moor-bell has cracked three days before
its cutters come home through autumn fog. A bell is cast from what the town gives it, so the middle of the book is
asking people for metal, and every gift is a small decision about someone. The case is built on real founding
(copper to tin about four to one; iron and lead ruin a pour; a bell hung hot cracks) so that a careful player
can reason their way to a good bell and a careless one is told, by the founder's face and then by the bell, what
they did.

Nobody is a villain. There is no ledger, no inherited duty and no conspiracy. The dramatic engine is Gundred Ludlam,
who hears only the hum of a bell and whose hands have begun to shake, and who cast the old bell with her dead
husband's iron key in the pot. The player finds the key by breaking Margery up. The pour then asks a human
question: who holds the ladle.

## What works

- **The pour.** Three honest ways to hold the ladle (alone and spill, together with Gundred, Piers with Gundred saying
  when), and the ways to earn each: trust (she lets you be her ears at the tin, or you hear out the key) and
  practice (water with Piers). Nothing is a dialogue tree; each is something the player did.
- **Gifts as characters.** Dilly's soldier, Piers's whistle, the censer, the bedwarmer. Each is used in the ringing
  scene, which says what is audible in the note. The first ringing is the best thing in the book.
- **Traps that are not traps.** The heap of iron under the frame, the chapel's pewter, Marlin's tin (true on some
  seeds, pewter on others by a Deem roll at install, which Gundred diagnoses by the way you bend it). All of them
  are offered, honestly labelled, and ruin the bell if the player ignores what Gundred told them.
- **Margery's pieces.** Dirty or cleaned. A player who breaks her up is shown the key in the very text of the
  break, which makes ignoring it a decision.
- **The letters.** The refinement of pass three. What goes round the bell's shoulder is chosen before the pour;
  Ebba and Culver have each been promised the name for their copper, and the letters can honour one promise,
  neither, or neither plus THERE IS A BELL, which answers the tablet in the chapel (THERE WAS NO BELL) and is only
  offered to a company that has heard Gundred out. The epilogue says what each broken promise cost.
- **Time.** The furnace cools if the bellows are left for three hours; the mould is dry on the afternoon of day three;
  a bell wants twelve hours; the fog comes between three and six on day four (a Deem roll). A bell broken out early
  cracks. A late pour leaves the fog to the lamps and the handbell.
- **Endings that are not a civic ruling.** One boy's fate (four tiers), plus four independent fate chains (Gundred,
  Piers, the name, the promises). A player can lose Kit Hasket.

## What I could not make work, or did not finish

- **Not a province.** I did not touch `data/adventures/countries.json`. For the shared world it wants an entry; my
  proposal is `id hexworth`, entry `approach`, marker `bell_frame` (a marker is not yet declared), terrain
  `marsh` or `mountain` and rumour: *"Over the moor-edge there is Hexworth, where the bell has cracked and they are
  casting another. They want metal, and they say not to give them iron."* The `placed.json` is written and
  imports the party; it has not been run in a generated world.
- **Human play: none.** I wrote the journeys, I did not play it as a cold player would. The preview built and served
  with no findings, but there is no browser in this sandbox, so I did not see the page.
- **Slack in days one and two.** Everything but the pour can be done on day one. The days between are free for
  conversation, which is meant, but a player who has the metal on day one is waiting. Marlin leaving at noon on day two
  and the furnace's cooling push a little against that; a real second pressure (a gift that goes bad, a rival
  buyer for the town's copper) would be better. I did not write one.
- **Seam of the ringing.** The first ring shows at most four "what is in her" lines, but the telling limit of three lines
  a command may cut one. I did not check which.
- **The company is one.** The campaign's tester is alone; the weight of the gifts slows them (a rule of the
  world, not mine) so I cut each kind's weight to 1 or 2. A company of three could split the stile from the square on
  the last evening, which is where the design most wants more hands. Untested.
- **Reach is shallow here.** Automatic play reaches 34 of 39 topics and 12 of 32 acts; the rest (the key, the pour,
  the ringing) want journeys, which the spec supplies. `reach` cannot tell a player's craft from a wait.

## Authoring difficulties

- **No parameterised acts.** Eleven gifts are eleven near-identical `put_*` actions. An act over `(actor, kind)`
  with a `Spend` of the kind would have been one.
- **A Query cannot be a number.** I wanted `potW()` for the weight of the pot and had to write
  `potAtLeast(n)` and repeat the sums in each rule; the guide says a Query may take a number as an argument, which
  I used, but not return one.
- **A Kind's display name is load-bearing.** `Kind marlin_tin "a tin tray and spoons"` failed with
  `Duplicate entity marlin_tin` when a person `Sells` it, and the same kind named `"Marlin's tin tray and
  spoons"` loaded. "A tray of tin" failed too. I do not understand which names collide, and the error names the id,
  not the clash. The shop line is therefore lower-cased (`marlin's tin tray and spoons`).
- **Names of kinds read badly in the pack.** "A tin whistle" is any whistle; the page cannot say *whose*. Possessives in
  kind names are ungrammatical ("A piers's tin whistle") because the page adds the article, so I stripped them.
- **`burn` and `fuel` are reserved.** Both hit the shared rules and the canon (`burn` as a probe name, `fuel`
  as a canonical). Lint said so clearly; a prefix convention would have saved me the rename.
- **Walk-time effects of wait.** `=+N` is watches, `=N` an absolute watch; a journey that wants "wait to 4 a.m. on
  day 4" is `=day 4 04:00`, and waiting past a deadline silently ends the book. I lost a test to that. A journey
  step `=until fogged()` was what I wanted, and it needed parentheses that the error did not suggest.
- **Chapters and rules are told as wait text.** "The mould is baking. The town has brought iron." appears under
  "Wait an hour". That is fine, but a long wait is a column of "An hour passes."; collapsed waits would read better.
- **Bed and supper** appeared for free when I wrote `Profession innkeeper` on the brewer. Good, and unexpected.

## Proposed improvements

- **Kyr:** a typed item parameter on Action, so one `put_in` serves every gift; an arithmetic Query returning a
  number; a clearer error for kind-name collisions; a way to say a kind's *owner* for display ("Piers's whistle").
- **Deem:** the roll at install is excellent for one fact per seed (the tin; the fog hour). A weighted choice among
  named results (a table in the module) would let the *ringing* choose its imagery, so that a second playing of the same
  gifts does not reread the same four lines.
- **Journey/verify:** a way to pass a seed to `verify` so that the seeded branches (leaded tin) are reached; a summary
  of which Deem rolls a game rolled.

## Verification

- `bin/kyrie lint data/campaigns/hexworth.campaign.json`: 0 errors, 0 warnings.
- `bin/kyrie verify hexworth`: every check holds; 15 journeys pass; names: first names Jonas and Piers are shared
  (advisory); repeats: only the three phrases of the pour's judging and "a long time", each kept deliberately and
  reduced.
- `reach`: rooms 8/8, people 8/8, topics 34/39, 12/32 acts, no endings (reach is greedy and never pours).
- Journeys (all passing) reach all four endings (home, lamps, kit_alive, nothing_called), the early crack, the dirty
  Margery, pewter, brittle, spill, Gundred's shared pour, Piers's pour, and the four lettering choices (three played).
- **Satisfying?** The ringing, the pour and Gundred over the key are good in the journeys' transcripts. I have not seen it
  played by anyone who did not write it, and the first two days may still feel like errands.
