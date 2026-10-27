# Stage 3 — what Kyrie can say, and the plan

*Written after reading, for this purpose: the grammar (`src/lang/Kyr.ohm`), the shared rules (`data/rules`, above all
`core`, `passages`, `people`, `belief` and `ambitions`), checks (`src/rules/checks.ts`), the clock
(`src/campaign/fictional-time.ts`), placement (`src/world/countries.ts`, `frontier.ts`, `data/adventures/countries.json`),
the catalogs (skills, classes, background families, items, species), the two most recent adventures on `main` (The
Third Night and A Parliament of Books) with their tests and support classes, and the authoring guide. Each element of
the revised design ([01-editorial.md](01-editorial.md)) is marked **direct** (Kyr says it today), **work-round**
(sayable with machinery the author builds from general parts), or **extension**.*

## 1. One module, two entrances

- Module `pellam`, in `data/adventures/liberty-of-the-ice`, in files by subject. Ids are namespaced `pellam__…`.
- **Played alone**: `data/campaigns/the-liberty-of-the-ice.campaign.json`, whose bundle includes `company.kyr`: a
  company of one coming down the North Road in the snow at eight in the morning. **Direct.**
- **Placed**: `placed.json`, the same files with `placed.kyr` (`Entity party: group "Your company".`). **Direct.**
- **Where it lies**: `countries.json` gains Pellam, **west** of a first country of **frost** or **mountain**, not among
  the independent adventures. The only other country on those marches is the Ghessil Uplands, which is independent and
  held only where the seed chooses it; so in most cold and mountain worlds the west march leads to Pellam, and where the
  seed chose Ghessil, Pellam lies further out, beyond a country drawn from the seed, as every other adventure does.
  Because Pellam is last in the list it changes no other country's place in any world (`Countries.plan` places the list
  in order). **Direct.**
- **The clock** runs from when the company comes. The module counts its own dawns (Wrayford's `dayN`). **Work-round**,
  established.

## 2. The city and the ice

| Element | Mechanism | Status |
|---|---|---|
| Six districts | Settlements and wildernesses on the region map: the City, the Bridge, the Ice (a `wilderness`: you can stand on it but not camp on it in a booth), Bankside, the Reach, the Flashes | direct |
| Freezeland Street, booths as rooms | Rooms within the Ice; booths are `building`s on it so they are indoors | direct |
| Steps onto the ice | `steps` passages from the banks; the Watermen's Stairs has a toll by Tredgold's men (a `Thing` that bars until paid or shaken on) | direct |
| The hours of the Fair | Rules on `hour(clock)` that move people and open booths | direct |
| Winter dusk at four | The engine's dark is nine to six whatever the season; observations say "lanterns lit" by the hour. Recorded as friction | work-round |
| Thin ice by night | The Black Reach's passage `opening when` not at the dead of night, or a `Hazard` on it at night (`dexterity save`) for whoever crosses without woodcraft | direct |
| The ice going out | Rules at the thaw move everyone off the ice; whoever is on the Reach is struck | direct |

## 3. The law of the ice

| Element | Mechanism | Status |
|---|---|---|
| A handshake binds | A local `Kind bargain`; each handshake is an **Action** with `Grave` ("a hand shaken on the ice binds: the Court will hold you to it") that asserts `shook(party, b)`. The page asks once before it is done | direct — `Grave` is exactly the construct |
| Kept and broken | `kept(b)`, `broken(b)`; the Court reads them at its sessions | direct |
| Lies are free | Nothing to build: lying is a topic or an action with no consequence in law. Its consequences are social | direct |
| The Court sits at four | A window of watches when Broom is at the Court tent, and actions there that read `shook`, `owed` | direct |
| The Landing | The Court's last session, at two on the third day, in **cases**: each a window of watches, with its own actions; then a rule that cries what was proved. Built by hand, as the Hearing, the Board and the Remonstrance were | work-round (survey G10) |
| An unlanded bargain melts | At the thaw, every bargain not landed is retracted with the ice | direct |

## 4. Lies, props and collisions

| Element | Mechanism | Status |
|---|---|---|
| A person brought to believe something false | The shared `believes(group, claim)` and `conviction(group, claim)` (`data/rules/belief.kyr`). A claim is an entity of `Kind claim`; nothing requires it to be true | direct — the disputation's machinery, used for the first time for a lie |
| A prop that makes a lie stand | Items of local kinds (a forged tally, fell wool, the Squire's coat); actions that show them raise `conviction` | direct |
| A prop made better or worse | Two kinds of tally (Ursel's own and Noll's printed one); a scholar's correction (`check lore`) | direct |
| Collision | Rules: `believes(harker, squire_claim) and together(harker, abel) and not inOnIt(abel)` → the lie falls | direct |
| Compounding | A rule: a squire believed is invited to the wedding; at the wedding, a squire is expected to give | direct |
| Suspicion in the journal | The journal shows what the company *knows*. What Harker believes is never shown as a number; it shows in what he says and does | direct (and the right restraint) |

## 5. Who tells whom: the leak

| Element | Mechanism | Status |
|---|---|---|
| The hiding places | Discoveries (`hidden_hulk`, `hidden_starling`) | direct |
| Telling a person where they are | Topics that assert `toldOf(person, fact)` | direct |
| Who carries it to Harker | `tattles(person)` facts; a rule each evening: `tattles(?p) and toldOf(?p, ?f)` → `harkerKnows(?f)` | direct |
| Leading the searchers | The searchers are out on the Reach at night; a company seen going to the hulk (`perceives(searchers, party)`) leads them there, unless it goes by stealth | direct |
| Selling the drowned | An action with `Grave`: five coin a head from Harker's clerk | direct |

## 6. People and talk

| Element | Mechanism | Status |
|---|---|---|
| Ursel as a partner who comes along | `willing` + the standard `recruit`; `travelling` topics; her `Joins`/`Leaves` | direct |
| What she has seen you do | Facts (`keptSecret`, `wentIn`, `skated`, `cardPrinted`, `liedToUrsel`), read by her topics and by a rule at the Ice Chapel | direct |
| A question put to the player | A topic that asserts `asked(…)`, and answer topics gated on it (The Third Night's captain) | work-round (G1) |
| Callow's custody | `acceptsEscort` + the standard `lead`; a rule at night: if not watched (the company asleep or elsewhere) and not `persuadedToStay`, he slips | direct |
| Positions the protagonist takes | Facts (`saidPromiseBinds`, `saidSelfChanges`), read by Callow later and at the Landing | direct |
| Who someone is now | `Role "…" when …` (a bride becomes a wife; the drowned become a living man) | direct |

## 7. What I will build in the engine, and what I will not

Nothing, at first. Every need above is sayable. The commission warns against narrow special cases, and the
general things this work would most like (belief that spreads by itself from person to person; an occasion with an
audience whose temper moves; a seasonal dusk) are large, and two of them are already on the survey's list for a
deliberate design. I will say them by hand and record what it cost in [friction.md](friction.md). If play shows a
general gap that a small general change would close, it will be made then and recorded.

## 8. Tests planned

- `test/liberty-of-the-ice.test.ts`: lint, played alone and placed; the default (nothing done: Landed); the Score;
  the Long Con; the Unswearing; the Flight; the Pillory; Ursel's double-cross.
- `test/liberty-of-the-ice-small.test.ts`: each small adventure by more than one approach.
- `test/liberty-of-the-ice-builds.test.ts`: a bard, a thief, a warrior, a ranger, a cleric, a mage, and a commoner with
  no charm, each through one principal approach.
- `test/liberty-of-the-ice-wander.test.ts`: seeded offered-action play with invariants.
- `test/liberty-of-the-ice-placed.test.ts`: a company of a generated cold country hears of Pellam, walks over the west
  march and in, and the city's days run from its coming; kept and resumed.
