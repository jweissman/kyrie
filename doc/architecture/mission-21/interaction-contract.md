# The player-page / action-menu contract

From the owner, 15 November: a stray "Follow this" button sent the player to the roadmap, where nothing said what to do
next; the only gold was an invitation, and "something may have flashed". The cause was a second action grammar.

## The contract

1. **One grammar for acts.** Anything that changes the game is an act offered by the glance (`Glance.held`, `Offers`)
   and drawn as a row by the page, chosen by the same press, focus and hold as every row. Inline buttons in prose are
   not acts. References (a name that opens the Encyclopedia, a place "on the map", the Notes list of what is held) may
   stay inline, but never do what an act does without being one.
2. **Follow is an act.** An aim held with none followed is offered as `follow:<aim>` among the glance's acts ("Follow:
   Clear the rats' nest"). It is zero-time, and every client that draws the glance may do it (`HeldActs`, the host's
   request `follow`). `Told.Follow` and the button in `NextPull` are gone. The Notes keeps its list of aims, with its
   own Follow, as a reference.
3. **Gold persists with the opportunity.** Gold is the followed aim's one next step. On the map the Set out of the
   aim's own destination is gold (`RouteCard.aimed`), so the road continues in one colour from the scene's gold row to
   the map to the road.
4. **Nothing blinks.** An opportunity's colour is steady for as long as the opportunity is known: the drifting prism
   gradient on rows and place marks is stilled.

## Pinned by

- test/follow-offered-browser (a real page: no `.follow-aim`, Follow among the acts, chosen it is gone and the next step
  is gold, and the map's Set out is gold).

## Not yet

- A census ratchet of controls outside the shared menu (the map still has about sixteen: its own zoom, here, close).
- Honest copy where the aim's route is unknown or blocked (the route card says "No way known", without the aim).
- Terminal and headless runner offer no `follow:` act (they keep their text command); the page's four lead with it.
- A cold deployed playtest of the whole chain.
