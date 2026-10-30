# Wapshott's Peregrine Circus — what has been verified, and how

*An honest account, as the project contract asks: what was played, by whom, and what was not verified. Nothing here
was played by an independent human. "Independent" below means an AI agent that played the built game without reading
the circus's sources, with no part in writing it; that is closer to a player than the author is, and it is still not
a person.*

## By whom

| Who | How | What |
|---|---|---|
| The author (this session) | the command line (`bin/kyrie play`), scripts driving a session, and the journey tests | every thread of Phase I and Phase II at least once; the Phase II clock played unattended to day 24 in all three reckonings |
| An independent agent, in the browser | the built browser client, driven by keys and screenshots, for about four in-game days | finding the circus, following it, a show, the troupe's stories, the menagerie, the first lesson |
| An independent agent, at the command line | `bin/kyrie play --world`, for as long as it could in its time | the whole Phase I arc as a curious player, the Fair, after the Fair, a companion |
| The test suite | `test/circus.test.ts` (27), `test/circus-phase2.test.ts` (14), and the whole suite | outcomes and continuity, by the labels a player sees; some outcomes with the world staged |

## Phase I: the eight questions about ordinary play

**Can an ordinary player find the travelling circus?** Yes, after fixes. The browser playtest found the circus from a
bill, two innkeepers and a cobbler. It also found that a player starting in the fair town on day 1 found an empty
ground ("a ring of yellowed grass… deep ruts going out at the gate"), walked the whole circuit behind the wagons for
fifteen hours, and came back to find it had arrived. *Fixed:* the circus is now pitched in the fair town on the first
morning; bills say COMING! TOMORROW, BY TWO O'CLOCK and GONE ON TO … BACK ROUND IN SIX DAYS; the field the circus is
coming to has marking-stakes in it; any of the three innkeepers says where it is now. *Not re-verified in the browser
after the fix.*

**Can they understand where it is going next?** The circuit was clear to the playtester; where it was *now* was not.
Fixed as above; verified at the command line, not in the browser.

**Can they arrive in time to see a performance?** Yes, but by luck: the interface has no clock except while moving and
no "wait until seven" (an M18 interface matter, recorded in [friction.md](friction.md)). The ticket now tells the
player when doors are and how long the show runs.

**Can they discover the troupe's personal stories?** Yes. The playtester found six in two evenings without help, and
called the writing the strongest part of the content.

**Can they take part in menagerie expeditions?** Partly, before fixes: the basilisk and the snake were done; the hob was
a dead end (an engine quirk made a hidden hob greet the player with nobody there) and the owlbear had no visible way
in. *Fixed:* the hob is truly absent until the cream; Billie now says where the net, the iron and the honey come from;
the bee-wife gives honey on the Colonel's list alone; the List of Wonders can be read. *Not re-verified independently.*

**Can they learn the foundations of martial clowning?** The first lesson, yes, unaided. The second was not found in
three days: the hint (watch from the wing during Mumchance's entrée) was nowhere. *Fixed:* Mumchance says so after
the Fall, and a topic repeats it. *Not re-verified independently.*

**Can they experience the Goose Fair's major events without privileged knowledge?** See the command-line playtest
below. Verified by the author: the note is served by a man on the Colonel's steps, Ada explains it, the Fair is
heralded by geese on every road and opens with a chapter heading, the Flyting is called on the town's heart at three
on the second day, the raiders come at eleven on the first night, the verdict is given aloud at nine, the reckoning
at ten. A player at the inn sees none of the raid (the canvas is down in the morning, and the jury mentions it).

**Can they keep encountering the company after the reckoning?** Verified by the author at the command line and in the
Phase II tests: the circus keeps its round in every outcome (to day 33 in the longest test), changed by the outcome.
After the Revels the Long Court becomes its stand on that round if the Warrant was won.

## The command-line playtest

An independent agent played seed `wren` as a human bard at the command line for nine and a half in-game days, to the
first afternoon of the Goose Fair, where its time ran out (the command line replays from the start each step, and a
replay had grown to two minutes by day nine). It did not reach the Flyting, the raiders, the verdict, the reckoning or
anything after the Fair, and it played a copy of the circus taken partway through this session's Phase I fixes.

Without inside knowledge it: met all fifteen of the troupe on the first day and watched a show ("very good"); passed
an audition and went on four times (one success, with the band); learned the Fall, the Look and the Feint; did the
basilisk, the hob, the tortoise and the glimmer-fox; mended the Quinceys; walked the Sylph's mother round; recruited
Pip and took her into a fight; found two pieces of the sabotage. It judged the debt and the rival "clearly
discoverable without inside knowledge" (Ada, Nance, the grey hat, the pasted bills, the clues, the Clerk of the Fair
spelling out the contest). It found no one to take the sabotage evidence to, and no one who told the Fair's date.

**Fixed after its report:** the clown turn's flop line no longer genders the player; the Colonel's introduction names
no wrong town and, after the first turn, introduces a returning face; Pip and the Quinceys' quarrel no longer appear
in shared show and rehearsal text after Pip has left or the brothers have made up; the wing is open from the Ox's act,
before Mumchance goes on, and Mumchance says to get a ticket and stand there; Ada now says to take the evidence to
Madame Sallow, and where she is; labels and text no longer name the owlbear's claws before the orchard, the Colonel's
nightly fall before a show has been seen, or "Ada says later"; the hob's persuasion is withdrawn once it succeeds;
arm-wrestling and fencing are offered only at the cookhouse fire; the after-show backyard text ends with the night;
the menagerie tent is not described on the road; coin, not shillings; Mrs Pruett's coming round is told as after the
show; the sleeping child wakes during the wire, not before it; Nell can be answered.

**Pip in a fight:** she joined in her own words and took over climbing and mending checks out of combat; in the one
fight (two spiders) she had no voice and no visible behaviour, and her trained techniques were not seen used. That is
the engine's companion behaviour, not the circus's; it is recorded as unverified for the Gentle Art.

## Phase II: what was played

By the author, at the command line and through the journey tests:

- the letter on the first day of the stand after the Fair, in all three reckonings;
- continuity: a tortoise, the Fall, the Answer and a mended Quincey feud carried from Phase I into Phase II;
- the united company: Cordelia refuses Sir Gervase's contract, cancels the coach, pays the wages, and her white horses
  are in the show; the paid company: the Colonel signs unless the first clause is struck, and Billie gives up the
  beasts if it is not; the torn note: Madame Sallow comes to the Revels as a rival and may lend the lion;
- the Revels round: the last stand pitched in the King's Rest, and back to the second town's field after; unattended,
  Pell's Comedians are given the office; with the Rest made fit and the Triumph played, Wapshott's is; with the first
  clause signed, the Keepership goes to Sir Gervase;
- the Keepers' Book, the Bishop identified, given back and walking home; the seal got back from the raven with
  spangles; the marl-pit drained with Honoria's arm, the diggers' stone, the claw, and the Colonel seeing it; the
  wedding in the chapel of the Rest; Kit Darrow coming over from Pell's.

Several of these outcomes were reached with parts of the world **staged** (facts set directly) to keep a test inside
its time: the Rest's restoration in the winning Revels, Fenwick's clause struck, the skills learned before the
Riposte. The scoring of the Revels was checked by playing it, not only by staging.

**Not verified in Phase II:** any of it by an independent player; any of it in the browser; the Riposte, Echo and
Reversal used in an actual fight; the turn of voices in the ring; the mishap answered by each of its four ways (one,
the raven left alone, was seen); Hench leaving for court; Pip going indoors with Pell's; the hob staying in the
Rest's kitchen; the salamander in a cold menagerie setting the straw alight; a world with fewer than three
settlements; the Revels with the company taking part from first bow to verdict in one unstaged play.

## The whole suite

The full suite (1,596 tests) was run on the state before the command-line playtest's fixes: 1,524 pass, 70 skipped,
and two fail that fail on the base branch already (`engine-names`, `lint-outside`). The circus's own tests and the
prose-fit test were run again after those fixes (47 pass); the whole suite was run once more at the end. The circus changed the world every generated test plays
in, and so: one kept transcript's digests were re-recorded (the place, the watch and the told text are unchanged);
one test that waited on an empty green until dark now waits again when the parade interrupts it; one test of
claimed places now counts sites only, since a circuit's towns and roads are shared by design; and two real
collisions were found and fixed in the circus (a local item kind named like one of What Tessary Owes', and a person
whose id was the marker by which the world recognises Pentrice).
