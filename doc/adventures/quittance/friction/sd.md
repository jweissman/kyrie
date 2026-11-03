# Authoring friction: The Surveyor's Daughter (sd_)

Met while writing `q_surveyor.kyr` and its test. Evidence is a command or a line.

1. **A Pursuit does nothing for a person who does not `Uses go`, and says nothing.** `Pursuit sd_probe for ianthe … seeks
   at(ianthe, guild_hall)` was accepted by the parser and the linter; Ianthe stayed in the study (`bin/kyrie play … --probe
   "at quittance__ianthe quittance__guild_hall" "=day 2 12:00"` → `no`). `Uses go. Plans 14 steps.` can only be written in
   the Person's own declaration, and Ianthe and Tobias are declared in `people.kyr`, which I may not touch. So the two
   lovers' *schedules* (the whole puzzle of timing and places) are teleporting rules (`sd_i_to_guild`, `sd_t_to_belvedere`
   …), and the company never meets either on the road. **Request to the lead:** add `Uses go. Plans 14 steps.` to `ianthe`
   and `tobias`; then the rules become Pursuits. Better, the language could accept `Uses go` as a statement
   about a person declared elsewhere (`Person ianthe += { Uses go. }`), and lint a Pursuit for a person who cannot go.
2. **When a higher Pursuit's aim is already true, a lower one takes over.** The Pargeters' "go up the Hill for the drill"
   (priority 20) was satisfied the moment they arrived, so "go home to dinner" (priority 10, `when true`) walked them away
   at 9:20. The lower pursuit's condition has to be the negation of the higher's window. Not documented; found by probe.
3. **A recruited companion is nowhere.** `data/rules/people.kyr` `recruit` does `Retract at(recruit, site)` and asserts
   `travelsWith`. So `at(tobias, belvedere)` is false for a Tobias who has joined, and every beat that asks where he is has
   to be written twice: `Query sd_tobias_at(p) means at(tobias, p) or (travelsWith(tobias, party) and at(party, p))`.
   I could not play the companion case: his recruitment belongs to another author and `willing(tobias, party)` is not
   assertable from a Journey. A test that could set a fact (`j.assert('willing …')`) would let me prove it.
4. **Anchored beats double.** Four lint advices (`anchor: … what it does to the company happens wherever the company is`)
   forced each beat into an unanchored effect rule and an anchored `once … says` rule with an empty `{ }`. Eight rules for
   four beats; and the told half cannot know that the effect has "just" happened, so it is windowed by the hour.
5. **The engine's day is 1-based; the kernel's comment says 0.** (See wk.md 1.) The drill is "the third day at ten":
   `day(clock) == 3` and `=day 3 10:00` agree, but the contract's "Appointed Nights … day 3" depends on which you mean.
6. **No take verb for a room's Item.** The Guild's ladder had to be `Give`n by the clerk's action, not lent. See wk.md 8.
7. **`Change … needing climbing` is offered to a party that can climb, with no ladder, and a ladder is needed for a party
   that cannot.** That worked as hoped (`Go up the drainpipe…` for the monk, `Set the Guild's ladder…` for anyone holding
   the kind). But a Change cannot be `needing X or Y` in one line, so each door is a Change of its own; the page shows
   them as separate verbs on one Thing, which is good, and the Examine row is a dead end.
8. **A Thing changed by an NPC.** I wanted Ianthe to haul the ladder up behind her at dusk (`sd_rungs`) and had to move
   her with a rule and reset the Thing in another rule at 19:00. Her pursuit would have been `Uses change_thing`, which is
   again the Person declaration.
9. **Check difficulties are a fixed ladder** (10/13/16/19); a persuasion against a clerk who "has no feelings" wants a
   modifier from what the company knows (a licence, a name), not a DC. I used separate actions with separate DCs, and
   one per approach, which is honest but multiplies the labels. A `Resolve check(actor, persuasion, dc_fair - 3 if knows(...))`
   form would let one choice carry its advantages.
10. **Test seeds again.** Every check has a seed that makes it pass or fail; tests search by hand (`b` forges, `a` is caught).
11. **`Observe` told once** hides afterglow text from a second visit (the study's "pressed flower" after the Rider). I put
    the lasting change in the Thing's State (`sd_survey`), which was the only thing that persisted on the page.
