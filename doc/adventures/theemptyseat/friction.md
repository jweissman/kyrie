# The Empty Seat: friction

27 November 2026. Findings from writing, revising and proving the succession
drama, Guild, mathematical expedition and corpus vignettes.

Companion assessment: [literary and authoring review](review.md).

## How to read this log

Local IDs identify observations, not a second planning queue. Status is open,
closed, deferred or reference. Kind distinguishes a broken claimed contract
from a wanted capability or an editorial direction. "Closed" means the
specific repair has a proving test, not that the whole experience is accepted.

Existing engine requests are deduplicated against the
[open register](../../architecture/open-register.md). In particular, this log
does not reopen BX-02 or OR-407: main now has rule packages and declared
fragment horizons. It also does not confuse OR-418's repaired naming
determinism with preserving one person's identity across a metropolitan reunion.
New literary suggestions are recommendations, not commissioned features.

## ES-F01: the city cannot be integrated by placing a second city

**Kind:** integration defect. **Status:** closed (27 November, on integration;
register OR-1782). **Existing dependency:** WM-06 / M19-107 for the broader
metropolis direction, which stays deferred.

The standalone chapter declared the court, towers and gate in a Dun Rìerdan of
its own. Adding it as an ordinary province would have created another Dun Rì
rather than layering the adventure onto the canonical city. Leaving it
standalone failed [every-adventure-placed](../../../test/small/every-adventure-placed.test.ts).

**Repair:** the chapter is laid over the canon's city in every world. The seat
of `dun_ri` in [the world's shape](../../../data/imbar/shape.json) says what
goes on in it (`goings`), and the country that seat makes the city of places
[the scenario](../../../data/scenarios/empty-seat.scenario.json) as a
country's own goings-on are, by the settlement need `seat:dun_ri`: the
chapter's `ward` is the city itself and its `square` the city's heart. The
material moved to `data/goings-on/theemptyseat`, since it is no longer a
province; it builds the seven towers inside the city and declares no city.
Its standalone proof campaign binds the same modules to a stand-in
(`proof/city.kyr`). No allowlist was widened.

**Proof:** [placement](../../../test/small/empty-seat-placed.test.ts) and the
installed city in [Dun Rìerdan](../../../test/dun-rierdan.test.ts).

**Remaining:** in the atlas's worlds the Rì's country's own Tower of the
Scales going-on and this chapter's tower are two places (OR-1784, blocked by
WM-06). Reunions with the actual provincial people are ES-F02 (OR-1783).

## ES-F02: a returning name is not a returning person

**Kind:** integration requirement. **Status:** open.
**Existing dependency:** the metropolis work above.

Deem can draw a coherent Gosse, Tallis, Bet or Agnes appearance for the proof.
That does not reuse the person's installed state from their original adventure.
Death, employment, carried objects and an estrangement must survive convergence.

**What was done:** called these seeded standalone appearances, not imports.
The provincial `seat_witness` records remain future reunion hooks.

**Needed:** one reunion using the actual instance, proved with a dead witness,
a hired witness and a witness whose local outcome was adverse. Naming
determinism is necessary but insufficient.

## ES-F03: one gesture becomes several acts or rules

**Kind:** language requirement. **Status:** open.
**Existing request:** OR-1333; the conditional-effects ask AU-57.

Different state-dependent effects need separate guarded acts or follow-up
rules. The court's arrivals and consequences are expressible, but their
mutually exclusive conditions require repeated maintenance. Pitchpass's
crossing and follower rules show the same obligation.

**What was done:** explicit guarded declarations, not an out-of-band story
interpreter. Conditional Result text was not mistaken for conditional effects.

**Needed:** the owner's effect-sentence spike's first slice, `If` in act
consequences. Compare it with the equivalent rule ladder, preserve all old
parses, and prove that Outcome shows both contingencies. This would remove
boilerplate, not generate dramaturgy.

## ES-F04: clocks are causal, but arithmetic is easy to misread

**Kind:** language requirement. **Status:** open.
**Existing request:** OR-1331.

Invitations, supper, council, news delivery and counterweight construction
need separate measures and latches. Authors must know when effects read the
clock relative to the act's duration. A deadline must start from its event,
not from the player's eventual conversation about it.

**What was done:** the death bell starts the court; Nerys decides after the
unanswered window; an event starts news delivery; the enemy fixes its support
independently. Saved state retains those clocks.

**Proof:** [pressure](../../../test/small/theemptyseat-pressure.test.ts),
[news](../../../test/small/theemptyseat-news.test.ts) and
[expedition](../../../test/small/theemptyseat-expedition.test.ts).

**Needed:** one duration notion across world and fight, with explicit start/end
semantics. A clock abstraction must not turn the independent world into a
sequence waiting for the player.

## ES-F05: a confidence flag can falsely stand in for a witness

**Kind:** defect. **Status:** closed for the standalone claim.

A remembered `guestConfided` value was insufficient: an absent or unable guest
could otherwise supply testimony. Companion hiring also makes an independent
`at` fact an unreliable account of presence.

**Repair:** require heard confidence and a present, able witness. Presence
reads party membership and wakefulness; the court does not move a paid
companion out of employment. Admitted refugees occupy the palace kitchen
inside the ward, not the safehouse outside it.

**Proof:** [court conversations](../../../test/small/theemptyseat-conversations.test.ts)
and [pressure](../../../test/small/theemptyseat-pressure.test.ts).

**Remaining boundary:** this repair does not solve ES-F02's full-cast identity.

## ES-F06: the conversation census discarded meaningful questions

**Kind:** measurement defect. **Status:** closed.

The census discarded `said_` and `tried_` latches even when a different reply,
act or rule consumed them. It therefore flagged an invitation opening a
petition, or a failed attempt opening another approach, as words only.

**Repair:** distinguish a latch read by another operator from self-closing
or recall-only wording.

**Proof:** [conversation consequence](../../../test/small/conversation-consequence.test.ts).
The earlier census's 107 fewer flags included 103 measurement corrections
and four content repairs. It was not 107 rewritten conversations.

**Caution:** a newly learned journal fact is still not proof of a causal payoff.
The provincial witness facts must not be presented as forty completed reunions.

## ES-F07: social change is often reduced to proof or trust points

**Kind:** editorial direction. **Status:** reference.
**Related programme:** OR-149 / OR-165.

Kyr can encode a change of mind, but the author must supply the motive and
every later reader. A repeated pattern of "learn fact, gain confidence, unlock
reply" risks treating people as records.

**What helped:** Cadi judges conduct without surrendering her own route.
Mab accepts care without losing the scar. Mrs Brabant accepts quiet help
without confessing. Those changes have different emotional causes.

**Next experiment:** one character initiates a costly refusal through affection,
pride or exhaustion. Prove the changed action; assess the dialogue separately.
Do not add a universal relationship score merely to give every conversation
an effect.

## ES-F08: resolving a threat must retire every form of it

**Kind:** content defect. **Status:** closed for the publication route.

Making Tom's verse public undermined the lads' seizure motive, but old pursuit,
payment or surrender controls could remain. The act would then promise a
stand-down while the interface continued bargaining with the same threat.

**Repair:** publication satisfies `ladsDealt`, stops the relevant pursuits and
removes the payment and explicit surrender choices. Public return has a
different aftermath from private return.

**Proof:** [corpus aftercare](../../../test/small/corpus-aftercare.test.ts).

**Editorial correction:** write the actual four-line verse. Let a child's
question expose Bess's privacy rather than append an explanatory verdict.
That correction is literary judgment, not a mechanical test result.

## ES-F09: a proof must not reveal the unexamined world

**Kind:** content trust requirement. **Status:** reference, enforced within
the bounded expedition.

An impressive instrument invites overclaiming: knowing how one exchange works
could become knowledge of occupancy, safety, all destinations or the war's
outcome.

**What was done:** move an actual bowl, then visit Earth. Discover the resident
or empty desk there. Keep physical measurement as an alternative. The military
exchange moves one support before a deadline; a missed deadline leaves rescue
and retreat.

**Proof:** [expedition](../../../test/small/theemptyseat-expedition.test.ts).

**Not implemented:** general load simulation, arbitrary planar exchanges or
the lower door. Those are future capabilities, not defects in a claimed
physical simulator.

## ES-F10: ordinary mathematics accidentally promises a wonder

**Kind:** content/projection defect. **Status:** closed for the added traces.

Treating every proof or ancient diagram as a marvel would make purple promise
more than the player finds.

**Repair:** ordinary traces yield actual portable rubbings without declaring
Marvel. Antique books point to real destinations without requiring proof for
the itinerary. True instruments earn saved capabilities.

**Proof:** [mathematical proof](../../../test/small/mathematical-proof.test.ts),
[antique books](../../../test/small/antique-books.test.ts),
[counting glass](../../../test/small/counting-glass.test.ts) and
[instruments](../../../test/small/instruments.test.ts).

The implemented trained/untrained comprehension floor is DC 30/35.
Mathematician settles encountered mathematics by proof; other readers retain
a natural-twenty breakthrough. Neither mode awards unseen truth.

## ES-F11: renewable quests are not infinite content

**Kind:** unimplemented requirement. **Status:** open.
**Related institution request:** MT-22; that row does not by itself promise
the category-specific content below.

The Guild queries actual unknown finds. Reports can be exhausted; new
installations supply new candidates. A moved find invalidates its report.
The requested worldwide halls, category-specific commissions, particular-item
requests and funny-story repertoire exceed that implementation.

**What was done:** no fixed quest pool, no fabricated destination, no selling
the same known report again. Exhaustion is stated honestly.

**Proof:** [Venturing surveys](../../../test/small/venturing-surveys.test.ts).

**Needed:** integrate real halls and regeneration first. A comic request should
have a generated situation and payoff, not just a funny item name.

## ES-F12: generated prose is easier than generated plot

**Kind:** editorial/generation direction. **Status:** reference.

The occupancy profile coheres with the visible resident. Replays keep the
same profile. But swapping delivery text does not change most dependencies,
available solutions or dramatic reversals.

**Measurement:** 33/38 procedural deliveries in Act IV; the denominator counts
whole narrative delivery slots, not unique stories, words or plot nodes.
See the [storyboard](../../../data/goings-on/theemptyseat/ACT-IV.md).

**Next experiment:** two table-selected situations with distinct principal
needs and solutions, each declared as ordinary Kyr. Test agreement between
profile, actions and consequences. Only then claim structural variation.

## ES-F13: the working wrapper shapes the fiction

**Kind:** authoring/tooling friction. **Status:** reference.

- `turned` collided with an existing status; the orrery uses `reckoned`.
- A carried book needed `carries`; visibility was not a substitute for carrying.
- A test's negative room coordinate did not fit the grammar; the fixture moved
  to a valid coordinate.
- The quiet campaign's file is `the-quiet-in-the-sky.campaign.json`.
- The document row is `Tom's private wedding verse: Read`, not an invented
  verb-first label.

These were errors or discoverability costs, not evidence that Kyr cannot
express the scenes. Prefer exact diagnostics, examples and symbol-aware
authoring support over adding concepts to accommodate each mistaken spelling.

## ES-F14: publication exposes obligations the fragment did not pay for

**Kind:** verification evidence/risk. **Status:** reference.

The first rebased small suite ran 1,421 tests across 529 files and reported three
failures:

1. ES-F01's canonical-city placement failure.
2. The horizon ratchet: 238 whole-rule fragment files against a limit of 234.
   Four added files need declared horizons. BX-02 and OR-407 are now closed;
   this is porting work, not a reason to widen the ratchet.
3. An aim-successor test recorded a world composition cost where none was
   expected. The reading came from a shared-process suite; its root cause is
   unverified. Reproduce in isolation before changing engine code or the test.

The new rule package for Venturing declares its dependency on belongings and
uses main's StandardRules mechanism. Main's naming and parse-store changes
were preserved during the rebase.

Earlier publication checks also found a locale-dependent destination sort,
one overly heavy book sentence, stale browser data and two obsolete inert
topic entries. Those were repaired: stable comparison, shorter prose,
regeneration, and shrink-only removals. The targeted pre-rebase run passed
17 tests with typechecks and lint; it is not a green post-rebase publication
gate.

**Follow-through:** all four files now declare their horizons; the kernel
conversation cases need no additional packages, mathematical cases explicitly
include the fantasy domain and canon, and the container survey also requires
probing. The horizon census is 27/234, with the stronger lower bound recorded.
A missing implicit `looking` verb was correctly diagnosed as outside the
container fixture's horizon, not patched into the kernel.

The shared-process targeted run passes 68 tests and 799 assertions across
16 files, including all added story/Guild/mathematical small specs, the horizon
ratchet and aim-successor. The cost case also passed in isolation. That does
not explain the original broader-suite reading: no quarantine, wider bound or
claimed engine fix hides it. The whole small suite was not rerun after the port.
The newer main rebase preserves its wagoner horizon improvement; the combined
census is now 28 horizon files and 233 whole-rule files.

**Integration (27 November):** the whole small suite, rebased on main, passed
but for ES-F01 (1,421 of 1,422), aim-successor's cost case included: the
reading was not reproduced, in a shared process or alone. Timed one at a time
against main, the world-drawing specs nearest the push lane's ten seconds are
within noise (a region's Kyr is about 1% larger with the books and traces, its
writing no slower). The lane's growth is the fifteen new spec files, about
38 s locally, none over ten seconds. Laying the chapter over the city costs the
first crossing north about 1.3 s: three more modules, each install about
430 ms whatever its size (the per-install recheck of AX-03 and T24-11).

## ES-F15: the verification method has an artistic ceiling

**Kind:** acceptance limitation. **Status:** reference.

Native journeys can prove that a bandage is spent, a promise breaks, a route
opens and an old paper stays old. Extracted source fragments can miss assembly
wiring; source censuses can miss unreachable payoffs. Full campaign assembly
was separately checked for the two revised vignettes.

Neither method proves timing, humour, beauty, legibility or emotional
satisfaction on the page. No browser tour, contact sheet or fresh human
acceptance is claimed here. The
[scoring rubric](review.md#final-scoring-rubric) is an editorial assessment
with explicit limits, not an automated quality score.

## ES-F16: a permanent sense is not yet an instrument portfolio

**Kind:** unimplemented requirement/design direction. **Status:** open.

The counting glass earns structural sense and the ordinary orrery earns
Astronomy. A second counting glass does not supply a second distinct faculty.
Recurrent arcologies are therefore ahead of the diversity of their instruments.
They should not promise seven different permanent upgrades yet.

The stellar data are twelve two-dimensional constellation drawings, not an
orbital model. A genuine three-dimensional Mathematical Orrery and a prediction
of the next eclipse cannot honestly be derived from them.

**What was done:** kept those capabilities in the
[instrument portfolio direction](../../../data/goings-on/theemptyseat/MATHEMATICAL-WORLD.md),
not as decorative widgets or invented forecasts. Actual earned senses have
save/restore proofs; the larger portfolio remains designed, not implemented.

**Needed:** one distinct second instrument with a real new perception and a
reason to revisit an old place. Forecasting needs an appropriate world model
before a display.

## ES-F17: the chosen mathematician could lose the defining capability

**Kind:** defect. **Status:** closed for the proved creation/check path.

The chosen perk was dropped while constructing the campaign's character
context. Provider selection also had to distinguish best bonus from best
effective check: mathematical training changes the DC, a living Mathematician
settles encountered evidence by proof, and a dead or stunned provider cannot
supply that guarantee.

**Repair:** retain the selected perk, reject invalid perk choices, select the
appropriate enabled provider and report automatic proof as proof rather than
an ordinary lucky roll. Trained and untrained attempts keep their different
difficulties; unrelated skills do not acquire the mathematical breakthrough.

**Proof:** [mathematical proof](../../../test/small/mathematical-proof.test.ts).
This is a pipeline correction, not evidence that the wonder's unknown rooms
have become known.

## What to do first

1. Done on integration: the chapter is laid over the canonical city (ES-F01)
   and the cost reading was measured (ES-F14).
2. Advance conditional act effects as the bounded OR-1333 slice, not a wholesale
   grammar rewrite.
3. Integrate one actual reunion; prove identity, absence and changed allegiance.
4. Deepen Mared's and Tarian's choices and write a real quiet return.
5. Try structural Deem variation on one station situation.

The first two reduce repeated engineering obligations. The next three test
whether that freedom actually produces a better story. More cast, rooms,
houses or generated percentages are not substitutes.
