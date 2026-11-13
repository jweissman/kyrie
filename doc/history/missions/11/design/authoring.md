# Authoring Kyr, before and after Mission 11

Mission 11 asked whether Kyr pushes authors toward room lists, topic dispensers, state-flag wrappers and chains of
authorised actions, and to change what makes it do so without turning it into a general programming language or an
improvising engine. What follows is each change as an author meets it: what had to be written before, what is written
now, and what the change does in play. Everything here is deterministic world state; a replay replays it.

## 1. Where a place is sheltered, what an observation tells of, and who notices it

**Before.** A place said nothing about whether it was under a roof, and an observation said nothing about what kind
of thing it told. A weather line written for a green was told on the green, and a narrator choosing among lines had
nothing to choose by; so a cold-weather line ("The cold gets in at every gap") was told under the open sky, and the
same passing life ("A woodpecker is at work somewhere close") was told on every visit.

```kyr
Place s1_taproom "the taproom of the Lucky Phoenix" is room within s1_inn at 1, 0.
Observe s1_sky at s1_green when state(region, rain) "Rain blows across the green.".
Observe z3_edge_2_life at z3_edge_2 when not dark() "A woodpecker is at work somewhere close.".
```

**After.** A place may say it is `outdoors`, `indoors` or `underground`; an observation may say what it tells of
(`as fixture`, `feature`, `sign`, `weather`, `ambience`, `event`, `revelation`) and that only someone who brings a
capability notices it (`noticed by woodcraft`).

```kyr
Place z3_edge_2 "the charcoal-burners' clearing" is room within z3 at 5, 4 outdoors.
Observe s1_sky at s1_green as weather when state(region, rain) "Rain blows across the green.".
Observe z3_edge_2_life at z3_edge_2 as ambience when not dark() "A woodpecker is at work somewhere close.".
Observe {w}_wolfsign at {w} as sign noticed by woodcraft when able({w}_wolves) "Wolf-sign all round the gate: scats…".
```

**In play.** The narrator tells weather when the company comes out under the sky, not on every step under it and
never under a roof; ambience the first time; a sign only to a company that would see it, and credited to the companion
who brings the eye for it ("Wynd sees it first. Wolf-sign all round the gate…" at a keep with wolves in it). The
compiler rejects an unknown aspect, and `noticed by` anything that is not a capability.

## 2. Someone travelling with the company

**Before.** A topic was a choice put to someone standing in the same place. Whoever joined the company stopped
standing anywhere, and so stopped having anything to say: companions were silent from the moment they were hired.
The only way round it was to invent a place they "were" and move it with the company, which no author did.

**After.** A topic can be put to someone `travelling` with the company, wherever it is; whoever is taken on by the
shared `recruit` action is recorded as travelling with it.

```kyr
Topic s1_traveller_home with s1_traveller travelling "Ask Cyril about home" when awake(member_s1_traveller_person) once {
  Says "'Meóswaeter. My cousin keeps the Peaceful Stag there: Osborn. If we pass that way, we will eat.'".
}
Topic s1_traveller_night1 with s1_traveller travelling "Sit up late with Cyril"
    when awake(member_s1_traveller_person) and dark() and not hushed(s1_traveller) and confided(s1_traveller) == 0 once {
  Says "'I carry what people forget they need…'".
  On discuss { Increase confided(s1_traveller) by 1. Assert hushed(s1_traveller). }
}
Event s1_traveller_welcomed at s4_taproom when travelsWith(s1_traveller, party) and awake(member_s1_traveller_person)
    and at(party, s4_taproom) "'Cyril!' Osborn comes round the end of the counter…" then { Increase quantity(party, rations) by 2. }
```

**In play.** Companions are listed with the people to speak with, wherever the company is; they have homes and kin
elsewhere in the country, knowledge that changes what the company knows (a wood's paths, a holy place, how the makers
ended), a story told a part a night, and words of their own at places that touch their calling. All of it is
generated from a table (`data/generation/scenes/fellows.json`) into ordinary Kyr, and is said only while they travel
with the company and are awake.

## 3. One plan, several works

**Before.** A work template had one base: every barrow in every country had the same passage and the same three
chambers, in the same words, and the only variation was what later peoples had done to it.

```
--- base
  Place {w}_passage "the stone passage" is room within {w}_site at 0, 0.
  Place {w}_left "the north chamber" is room within {w}_site at 0, 1.
  …
--- successors robbed 2
```

**After.** The base keeps what every barrow has (its dead, its flute, its goods); the shape is a group of its own,
and of several works of one plan in a country each takes the next shape, so no two are alike. A sign, written only
where the country's greatest work is of the same makers, shows the way to it in the makers' own manner.

```
--- base
  Thing {w}_flute_bone "the bone flute" at {w}_passage { … Change play "Play the bone flute" from laid to played. }
  Rule {w}_hushed when state({w}_flute_bone, played) and not tolerates({w}_dead, party) says "…" { Assert tolerates({w}_dead, party). }
--- shape long 1 if shape0
  Place {w}_left "the north chamber" …
--- shape grave 1 if shape1
  Place {w}_end "the round chamber" …
--- shape cairn 1 if shape2
  Passage {w}_south "the drop into the lower chamber" is shaft between {w}_end and {w}_right needing rope or climbing.
--- sign flute 1 if greatart
  Observe {w}_answered at {w}_passage when state({w}_flute_bone, played) "…another flute answers: from {greatwhere}…" teaches {greatfound}.
```

**In play.** f6's three barrows are a long barrow, a passage grave and a cairn on two levels. The great howe is
found by reading the makers' whole story, as before, or by playing the flute at a lesser barrow and hearing it
answered; the cistern's still pool, the tower's ring at night, the Delvers' vein and the Stone-Singers' figures do
the same for their makers. The flute also lets a company pass the barrow's dead without a fight, because the
Barrow-Kin played it so their dead would know them for kin.

## 4. Who the protagonist is to the world

**Before.** A company arrived as strangers, and a scenario's people said the same thing to everyone.

**After.** An origin is a module bound to the country's own people and places; the facts it asserts (`kin`,
`expects`, a debt) are what scenario text is written against.

```kyr
Observe son_kin near son when kin(party, son) and not told(son) "Your brother is sitting on the rail of the green…".
Topic son_plan with son "Ask {son} what he means to do" when kin(actor, son) and not told(son) once { … }
Topic son_father with son "Ask {son} about his father" when not kin(actor, son) once { … }
```

**In play.** The same drover's family is a stranger's errand or the protagonist's own, from the same module.

## What was not done

Kyr did not gain loops, functions or arbitrary computation: each change is a declaration the compiler checks and the
runtime evaluates against world state. No text is generated at run time by anything but templates filled from that
state, and there is no model in the loop. The work-template shapes are chosen at assembly, from the seed, so a replay
of a saved game is the same game.
