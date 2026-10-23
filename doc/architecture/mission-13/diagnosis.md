# Mission 13: diagnosis

Played fresh, as a player, at `5a71bf6`/`25c8095` (world `hollin`, the order's errand; then `thorn`), without using
ids, routes or the generator's knowledge.

## What a player meets

- **The shrine, the first place, describes its altar as "a slab of the old stone" and then "cut from the first tree
  felled".** Two templates were joined without checking each other.
- **Every exchange reprints the whole place.** Giving the letter, then asking about the graves, each shows the altar
  paragraph again under one line of speech. The speech is a line; the furniture is a page.
- **A green is a register.** Six sentences of the form "Beatrix is sorting spars… Wilkin is spreading a net…
  Letice is grinding…". Each is fine; together they are a census.
- **The right column is a control panel.** Here, Go, Further, You: four lists of underlined links, a 64-pixel
  painting beside each name. The paintings are wrong as often as right: Beatrix the thatcher is a gentleman in a
  frock coat; Wulfstan the tinker is a woman.
- **Conversation is not a change of attention.** "YOU ASK WILKIN ABOUT HIS WORK." and one quoted sentence sit above
  the same scene; the next click is as likely to be a road as a reply.
- **Two ways out read "To the road through Beorcbearwas".** Telling choices apart by command was fixed; telling
  them apart by name was not.
- **A road is a room.** "To the road between Fearnlac and Borddaenu" takes you onto the road, which is a place with a
  description, a goat and some moss; from there you go on. Travel is two clicks and a stopping place in the middle
  of nowhere, told as a room.
- **What is learned is filed, not felt.** "Noted: The way to a timbered adit in Zinholm."

## Causes, by layer

| Layer | Cause |
|---|---|
| Presentation | One invariant page for every activity; the place's whole description as the default content; every affordance a link in a categorised list; paintings as thumbnails; a fixed two-column split. |
| World generation | Every settlement is the same five rooms (green, inn, shrine, shop, houses) with residents distributed over them; roads are rooms; the wild has landmarks and stands, and little that moves. |
| Narrative composition | The narrator chooses what to say of a place, but the reader shows all of it every time; resident activity is one stock sentence each; speech has one register; shrine and settlement prose are assembled from parts that do not know each other. |
| Authoring semantics | No "talking to someone" in the world: a topic is an action like any other, so the reader cannot know a conversation is going on; nothing is created during play; everyone present is seen by everyone. |
| Gameplay | Nothing travels the roads with a purpose; little is learned by wandering; the first hour asks the player to ask everyone everything. |

## Keep, replace, reconsider

**Keep.** The engine, Kyr and the world model; happenings and voice tables; communities (residents, households,
rounds, animals); the willow-style grounding of troubles in the land; the Orsino inventory and catalogs; the
painting registry; the walk, audit and review tools; the frontier and placed countries.

**Replace.** The reader's presentation: the page/side-panel layout, the lists, the thumbnails, the always-on
description, the place-as-the-only-subject model. It becomes a composition that changes with what the player is
doing: looking about a place, talking to someone, travelling, examining something, fighting.

**Reconsider.** Settlements as a fixed set of rooms (they should arise from why the place exists); roads as rooms
(a journey should be a passage through country, interrupted only where something happens); paintings chosen by a
word (they should be chosen by what they show); conversation as an unmarked series of actions (the world should know
when someone is being spoken to).
