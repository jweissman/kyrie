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

## The governing rule, and how it is held (15 November, late)

*One current focus. One authoritative set of actions. One consistent way to consider and commit an action. One
authoritative resolution.* Focus → Consider → Press/Hold → Commit → Resolve → Continue.

| Rule | Held by |
|---|---|
| Every gameplay control names an action in the observation now | `ReaderApp.observed()` (exposed in `kyrieMono.inspect().observed`) and test/interaction-contract-browser: every `[data-act]` must be observed, and every other executable control must be in the presentation list; a bypass fails the test (it is mutation-checked, a control and a stale act injected). `Census.known` is the ratchet and is empty. |
| Follow and abandoning are actions | `follow:<aim>` / `follow:` are session commands (PlaySession.perform); the observation offers them (`Screen.aims[].follow`, the glance's act); the worker protocol has no `follow` request; Notes, the page's rows, the terminal and the runner all send the same command. |
| A stale or absent action is refused | the session refuses a command it does not offer and an aim not held (test/action-identity, page host and session alike). |
| Focus replaces the foreground | test/riddle-door-browser: attending to the door makes its four words the foreground, once each, by distinct observed identities; the surroundings' acts are gone; nothing is committed; Escape returns attention and the surroundings come back. |
| The title's rows are concise and exact | test/title-geometry-browser (desk, iPad both ways, with and without a saved game): equal widths, left edges, heights and gaps, centred, no text in the rows beyond the label; the save is a line apart. |
| The map is an attention; going is the menu's | the map's ENTER is "Put away the map" (`put-away-map`, presentation); the town's entry is its own observed act; roads and journeys are acts of the menu; test/follow-offered-browser covers a journey with gold and one without. |

Still independently implemented: the page's `travel:` and `unbind` requests (one door each, parity-pinned), the map's own
zoom and selection controls (presentation), and attention itself (map, lens, talk) is client state, not an observation:
the engine does not yet know the character is looking at the map (PB-17's remaining part).
