# Westernesse opening: independent review (build 43697c8a)

> Second independent review, 17 November 2026, by an agent that saw only the frames, stills and timings of the unedited deployed recordings (r3-desktop, r3-phone in /var/tmp/kyrie/m22/base), not the code or the documents, nor the first review. Its findings are carried as register rows OR-39..OR-46 and in OR-22, OR-25, OR-30. The lead's note: its f00 "white frame" is the recorder's blank tab before navigation (the video starts about 6 s before it), not the game.

Sources: r3-desktop (1280×800, mage) and r3-phone (390×844, touch, warrior). "fNN" means frames/fNN.0.png, one per video second. The video clock runs about 6 s behind the log, so navigation lands at about f01. The phone frames are letterboxed and low-resolution, so for the phone I relied on the stills where I could.

## 1. The first fifteen seconds

- f00: a full white frame in both recordings, before anything else.
- f01–f03: the studio mark, seven gold candles and "Seventh Star". It is handsome, but it is three seconds of someone else's brand.
- f04: an almost black screen with one blurred "R" floating in it. This frame looks broken, not composed.
- f05–f06: WESTERNESSE, the hairline with its diamond, "Vol I: A History of Emprise", a field of embers, and three centred, letter-spaced ways in. It is restrained and beautiful.
- Pointer input works about 3.5 s after navigation. Keys work only after about 6.9 s (log 14.28), and a warm reload is no faster (3.5 s). The wait is choreography, not loading.
- f07–f08: New Game is held. f09: "Drawing a region…". f10: creation fades up dim, and only reaches full strength at f11.

How it feels: careful, dark and slow. By second 15 the player has seen two logos, a loading line and one question. Nothing yet tells them this is a world rather than a menu.

## 2. The first minute

**Creation, f10–f26.** There are seven pages over a blurred brown painting: why, ancestry, stars, calling, before, presenting, name.
- What works: a title at the top left, italic flavour beside it, and rows that give a quick, clear answer. The rail of glyphs at the bottom right grows as you choose (f22–f25, ending in a portrait). That is a fine idea: the character assembles itself in front of you.
- The star page is the one moment of real delight (f15). The constellation is drawn with a star burning at its eye.
- What doesn't: ancestry and calling (05-create-you.png, f18–f19) switch to a 2×2 grid of cards. That is a different control, with a different focus mark and different hold feedback.
- There are text links outside the menu: "Back", "Set out now" and "Another country". Several pages have five rows.

**Setting out.** The name page becomes a summary, "Hold to set out", with one row, "Set out into Blackcarr · hold" (f26). That hint appears twice on the one page.
- The wait that follows is long. Desktop shows "Setting out…" for about 3 s (f27–f29). The phone shows it for about 4 s (f26–f29), and its progress chips appear only in the last second.

**Prologue.** A painting, a small caps eyebrow ("THE BROTHERS' ERRAND"), centred serif prose and one Continue (13-first-scene.png).
- The writing is good, plain and concrete: "Fairfen is smaller than the brothers made it sound."
- Between beats the text drops out completely for a frame (desktop f36, phone f43). A page with only a header and a button blinks in the middle of the story.

## 3. Entering play

**Desktop, f41: the shrine of Cernunnos.** This is the best page in either recording.
- It has a rich painting, a place title, a paragraph of prose, a vignette (the acolyte copying sums), four rows and a rail. It looks like a place.
- But the date line under the title cannot be read against the painting: "MORN… FAIR, 11 LEAFFALL".
- "More of the place…" is tiny, faint and looks like a link.
- The first row is cut off: "Follow: The brothers want the old writing at Rainwatch read and …".
- Choosing Follow (230 ms) produces no prose at all (the log's text is empty). The rows just reshuffle and one turns gold (f43). The first act of play reads as nothing happening.

**Talk to Fox (591 ms).** At f45 the left half is black and only "Fox" sits at the bottom. The portrait arrives a second later (f46).
- The page has a different layout: the name at the bottom left, a sharp-edged panel, and only two rail icons.
- His first line is fine. But the "You know now" box beneath it is a non-sequitur about the spring and the fire, and it has no full stop.
- Then the key moment, giving the letter (f49). Fox's long reply is pushed off the top of the screen, and only its last two lines survive under a fade. Below it are "You take the shrine's coil of rope", "YOU KNOW NOW" and "A NEW AIM", which repeats the goal the prologue gave word for word.
- f52 is the same: Fox's answer is cut off, and the bookkeeping is shown in full.

**Phone, f50 onward.** The phone never shows its first scene's menu (wagoner, cart, timber-yard).
- The beat-3 Continue sat exactly where the rail's hourglass appears on the next page (f49 → f50). Play opens straight onto the Wait lens: "A while / An hour / And watch… / Until dark", with the hourglass lit.
- The run then spends three acts on "You wait a while. Time passes.", and nothing changes (f51–f68).
- The header says "MORNING, SNOWY, 12 DEEPWINTER" over a green summer landscape, after a prologue full of sheep in leaf.

## 4. The act of choosing

There is a dominant way to choose, a left-ticked row, but it is not used everywhere.

- **Five different controls:**
  - centred rows with the tick pinned far left (title, Continue);
  - left-aligned rows with number hints (creation, scene);
  - 2×2 cards (ancestry, calling);
  - icon pills (the rail);
  - plain text links (Back, Set out now, Another country, More of the place…, Something else…).
- **More than four rows:** "why" (4 + More), name (5), Fox (5).
- **Things that look pressable but are not rows:** the creation glyph rail, Back, Set out now, Another country, More of the place…, the map icon with its gold dot.
- **Tick colours are unexplained:** gold, blue, grey or none (f46: rows 3 and 4 have no tick).
- **Number hints are inconsistent:** Follow, the exit row and "Something else" have none.
- **Row spacing jumps:** 50 px between rows, then a 72 px gap before "Take your leave".
- **Holds look different on each control.** Held rows get a static outline (f08, f23, f35). The held Human card gets a dash on top (f14). The held Mage card gets a half-disc in its corner (f19). Only the set-out row says "hold". Nothing in the sampled frames shows a hold filling up.

## 5. Findings

1. **High.** The phone opens play on the Wait lens instead of the scene (phone f49→f50, 18-act-2.png). The Continue press appears to land on the hourglass that renders in the same spot. Swallow pointer release across page swaps, and keep the rail clear of where the last row was.
2. **High.** Act results are scrolled off the top: Fox's speech is cut while the knowledge boxes show in full (desktop f49, f52). Anchor the newest prose at the top, and fold "You know now", "A new aim" and "Noted" into one quiet line or into the book.
3. **High.** The first act, Follow, produces no visible consequence beyond a reshuffle (f41→f43). Give it a sentence of fiction, or make it implicit.
4. **Medium.** Weather and season contradict the painting: SNOWY, DEEPWINTER over summer foliage (phone f50). Choose the painting by season, or drop the weather until the art agrees.
5. **Medium.** Four control idioms in creation, and text links outside the menu (05-create-you.png, 04-create-why.png). Make ancestry and calling rows with glyphs, move Back and Set out now into the menu or the rail, and cap the menu at four rows.
6. **Medium.** Three different hold marks, and only one row labelled "hold" (f08, f14, f19, f26). Use one visible ring or fill everywhere.
7. **Medium.** The portrait arrives a second after its page (f45). Preload it, or cross-fade from the scene.
8. **Medium.** The wrong painting flashes before the prologue (phone f30), and the text blanks between beats (f36, phone f43). Hold the old content until the new content is ready.
9. **Medium.** The header date is illegible against the painting, and "More of the place…" is 10 px grey (f41). Add a scrim or more weight, or remove them.
10. **Medium.** It is slow to reach the game: keys only after about 6.9 s, a studio splash, a loose "R" frame (f04), the white f00, and 3–4 s of "Setting out…" (f27–f29). Cut the splash on repeat visits and start the title by f02.
11. **Low.** The first row's label is cut off with an ellipsis (f41). Shorten Follow labels.
12. **Low.** The phone "why" narrative is cut off under the first row ("time in three years.", phone 04-create-why.png).
13. **Low.** The "before" page opens describing Brawn, which is not on the page (desktop f20).
14. **Low.** The goal is restated three or four times (why page, prologue, Follow row, "A new aim").
15. **Low.** The wagoner is shown with the elf leaf glyph (phone f42). The phone wait rows wrap needlessly in a narrow column (18-act-2.png).

## 6. Scores

- **Coherence as one game: 5/10.** Title, creation, prologue, scene and conversation each have their own layout and controls, and the phone's season contradicts its own painting.
- **Legibility: 5/10.** The prose is set well, but the key replies are scrolled away and the header metadata sits illegibly on the art.
- **Beauty at rest: 7/10.** The paintings, the type and the star page are genuinely lovely, and the shrine page at f41 is a real image of a place.
- **Restraint (a quiet foreground): 5/10.** Knowledge boxes, coloured ticks, number hints, the rail, "Noted:" lines and text links crowd the foreground at exactly the moments of consequence.
- **Responsiveness: 6/10.** Input is acknowledged within a frame (pointerdown at most 10 ms), but acts take 230–681 ms, portraits are late, and the opening's waits are long and choreographed.

## 7. Desktop vs phone

- **What happens on entering play.** The phone run lost its first scene to what looks like a tap that fell through onto the rail and then idled. Desktop reached a real scene and a conversation. This is the difference that matters most.
- **Setting out** takes about twice as long on the phone (3.6 s against 1.7 s), and the phone shows a wrong-painting flash.
- **Rows at rest.** Desktop rows carry a focus band and number keys. Phone rows at rest are a bare tick with a centred label (Continue, 13-first-scene.png), which is a weaker affordance.
- **Layout.** The phone stacks the constellation under the rows, crushed against the rail (06-create-sign.png). It also clips the narrative on the first creation page.
- **Defaults differ:** human on desktop, elf on the phone.
