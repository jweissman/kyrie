# Where the page reads meaning from text

This record answers the owner's request of 11 November: keep a list of the places where the page or the presentation
layer decides what something *is* by reading generated or narrated text, apart from harmless formatting of text it
already knows the meaning of.

The rule going forward: game meaning (what a choice does, whether a fight ended, which aim is which) comes from typed
state. New code must not add semantic dependence on generated sentences.

## Removed in Mission 20

| Was | Now |
|---|---|
| Buy, sell and gather were recognised by the words of a choice (AtHand, GlanceStage) | The choice's typed effects, `does` (E123) |
| The scene after a fight dropped "The fight is won." by matching the sentence (`Narration.ends` in Told.Happened, added and removed 11 November) | The end line carries kind `fight`, set by the narrator from the fight's end event (`feedback.ended`) |
| "Follow this" found its aim by comparing note text with aim text (`Followed.id`); talk, AimNear and the Book's aim cards did the same | The exchange carries the aims it took up, typed as `{ id, text, now? }` (`Exchange.aims`, from `ActionFeedback.taken`). Following is by id (`ReaderApp.follow(id)`); the Book's cards are built from `screen.aims` |
| The way into a town was recognised by its label | A typed reason (`entry`) and a flag on the led act (`Promoted.enters`) |

## Still semantic: meaning read from text (to replace)

| Where | What it reads | Typed replacement |
|---|---|---|
| `web/reader/talk-focus.ts` | `^(Tell|Pay) `, "would come along", "what is out in the country round" in a reply's label decide its role | A display role on topics (the headless report's suggestion) |
| `web/reader/stage/glance.tsx` (`/^Read /`) | An authored "Read the notice" act is found by its first word | A marked act kind for reading |
| `web/reader/stage/talk-stage.tsx` (`dear`) | Whether a ware is too dear, from the disabled reason's sentence | A typed reason on the disabled choice |
| `web/reader/stage/moments.tsx` (`ending`, `levelled`, "Ready for level") | Something seen through and a level gained, from the experience sentence | Typed events in the feedback (seen-through, level) |
| `web/reader/stage/panorama.tsx` | The sights from a height, from the shape of the telling's lines | A typed list of sights in the exchange |
| `web/reader/stage/told.tsx` (`Told.roll`), `Told.harm` / `Narration.harm` | A line that only names who is here; hurt on the way in, from "takes N damage" | Presence as typed subjects; a typed harm flag |
| `web/reader/stage/told.tsx` (`Told.ranked`) | Which of a place's lines bear on an aim, by capitalised names shared with the aim's words | The aim's typed `places` and `who` |
| `src/presentation/narration.ts` (`tidy`) | A fight told by its turning points, picked out of its formatted sentences | The fight's events, before they are formatted |
| `web/reader/sheet.tsx` (`Aims.named`) | The place an aim's words name, for "on the map" | The aim's typed `places` |
| `web/reader/character-page.tsx` | "Against X (quality)" parsed out of a label | The typed defence |
| Notes' labels `Noted:`, `Aim:`, `Borne out:` (`Words.noted`, `Words.aimed`) | The kind of a note, from the label the narrator wrote on it | Semi-typed: the narrator writes these labels, never the world. Aims no longer depend on them (above); learned notes and tallies still do |

## Formatting only (harmless)

These read text the page already knows the meaning of, to say it better:

- "The" lowered inside a sentence.
- "To " taken off a way's label where its destination's name is shown.
- A full stop added.
- "a"/"an".
- The day read back from the page's own clock format.
- An aim's first words as a short title (`Told.title`): it chooses what to show, never what the aim is.
- `Narrator.gist`.
- Labels for ways that begin with a direction word (`PlaceStage`).
