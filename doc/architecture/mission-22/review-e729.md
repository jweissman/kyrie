> Independent review, 16 November 2026, by an agent that saw only the frames and timings of the unedited deployed recording (e729cf93), not the code or the documents. A review of stills, not of a person playing. Its findings are carried as register rows OR-22..OR-33.

# Westernesse: the opening (recording rec-e729), independent review

I looked only at the material: the desktop strip (f000–f080), the step screenshots of all four runs, the two contact sheets, and the listed `measures.json` fields. File names are relative to `/var/tmp/kyrie/m22/rec-e729/`. Stills can't show me how the fades and blurs move, how the hold ring fills, any sound, or how long a hold feels in the hand, so I haven't judged those.

## 1. The first fifteen seconds

The opening sets a tone and looks confident about it. `strip/f002`–`f004`: seven lit candles under a four-point star, with SEVENTH STAR spaced out underneath. It's quiet, warm and well made. `f006`: WESTERNESSE fades up out of a blur. `f008`: a thin, widely spaced title, a rule with a diamond, the italic *Vol I: A History of Emprise*, three spaced-capital menu items and a slow field of gold motes. It reads as a book and not as an app, which seems to be the aim.

What I'd cut or change:
- **`f000` is a plain white frame** before the dark mark. On a dark game that flash is the first thing a player sees. Give the document a dark background before anything loads.
- **The studio mark costs about 4 s on every load.** `warmReload.titleReadyMs` is about 4.5 s against about 5.1–5.5 s cold, so a returning player sits through the whole mark again. Play it once per session, or let any key skip it.
- **`f010` shows a developer stamp**, "build e729cf93", in the corner of the title. Hide it outside dev builds.
- **NEW GAME's left pip** is an orange-to-blue gradient (`f008`, `03-title.png`). Nothing else on screen uses those colours, so it reads as a stray. On the title, NEW GAME also shows a small pie in its row (`f010`), as if the menu needs a hold. If it does, that's a heavy first gesture. If it doesn't, the pie is noise.
- **The first question already assumes knowledge** (`04-create-why.png`): "Why have you come to Acornweald?", with Oldborough and Marblegate in the aside, so three place names before the player knows any of them. The rows are good ("The brothers' errand · Once a scribe"). "Another country" in the bottom-left corner is cryptic. As far as I can tell it rerolls the world, and nothing on screen says so.

## 2. The first minute: one game, or a series of pages?

It's mostly one game. The strongest evidence is that **the same row instrument is used everywhere**: a left bar, a bold label, a muted aside and a small numeral on the right. Creation (`04`, `09`, `10`), the place (`16-act-1`) and the conversation (`17-act-2`) all speak that grammar. The emblem tray filling in along the bottom of creation, ending with a portrait at the name step (`10-create-name`), carries identity forward as well.

The frames where it slips into "web pages":
- **`f030` (setting out).** "Setting out…" with a step list ("✓ Drawing the world · Placing its people · Telling where you are") is a loading screen with a progress checklist. Then `f032` is a nearly black empty frame. Then a fourth kind of screen arrives (`f034`, centred prose on a painting). That's three different surfaces in about 4 seconds.
- **`f034`–`f042` (opening prose).** These pages have no control, no hint and no mark to press, so the player waits or guesses. `f038` shows the page caught between beats: the heading has moved up and the body has gone, like a page re-render rather than a turn.
- **`f044` (first scene arrives unsettled).** The prose column opens with leftover loader copy ("Telling where you are."). A header line reads "Follow: The brothers want the old writing at Marblegate read and set down …", and the same text appears again as the lit first row. The other rows are faded, and "To the market-place…" floats apart from them. By `f046` it has reflowed into a different layout: the Follow row is gone, Talk to Vance is now gold and first, and the weather line has dropped out of the header. This is the moment the player arrives in the world, and it looks like a page still loading.
- **Creation's empty left half** (`05`, `07`, `08`, `09`, `10`, `11`). The left 45% of the screen holds only the question, over a blur too strong to read as a painting. Only the sign step (`06`) uses that space, with its constellation, and it's the best creation screen as a result.

## 3. The act of choosing

What to pick and what was picked are **not reliably clear in creation**.
- `09-create-presenting` and `f024` show **"A man" lit, but the run chose "she"**: the log says "presenting → she", and the names (`10`) and portrait are female. Either the lit row isn't the choice, or the default sits on a row the player never chose. I can't tell which from a still, and a player can't tell either.
- On `08-create-before` **no row is lit**, yet the aside explains "Brawn … Intimidation", which isn't any of the four visible rows (Locks and mechanisms, The shadows, Stone and earth, Healing).
- **The summary uses words the player was never shown** (`11-setting-out`): "A human **abjurer** … Once an **artificer**. A **sling** in hand." The player picked Mage and "Locks and mechanisms", and the errand row had said "Once a **scribe**". The shield emblem that means abjurer appears in the tray unasked (`08`).
- **The emblem tray shows provisional picks as if they were made.** On `07-create-calling` the tray holds a sword because the cursor is on Warrior. On `08` that slot is a mage staff. On `09` a key is inserted before it, so the order changes between screens.
- **Cards vs rows.** Ancestry and calling use a 2×2 card grid with a cream outline (`05`, `07`). Every other step uses rows with a filled band. The two "lit" treatments don't match, and neither shows a separate "already chosen" state.
- The hold is announced three times on `11-setting-out`: the italic "Hold to set out.", the "hold" aside, and the pie in the row.
- **Conversation.** Pressing reads well: the chosen row lights, the others dim and the act echoes as "◆ Talk round…" (`f056`). At rest, though, no row is lit (`17-act-2`, `18-act-3`), so keyboard focus is invisible. In the numbering, "Something else… 1 of 3" has no number and "Take your leave" is 4, so the sequence reads 1, 2, 3, (blank), 4. "1 of 3" and "More… 1 of 2" look like counts, not pages.
- **Cramped or clipped rows.** `f054`'s first row runs to "…an even chance ·…" and pushes its numeral "1" out of the column. On phone the aside is cut to "ask br…" (`phone-touch/16-act-1`). On desktop the aside is all lowercase, "ask brother anselm what he is counting", which loses the capitals on a proper name.

## 4. Ten defects, worst first

1. **The first success is cut off.** In `desktop-mage/20-act-5.png`, `strip/f058` and `zoom-talk.png`, "SEEN THROUGH / The boundary stones" is sliced in half by the edge of the options area. From `f060` onward, "Nest gains 300 experience." sits in a box whose top has been cut away. `desktop-reduced/20-act-5` cuts "You know now" mid-line. `phone-touch/19-act-4` cuts Adrian's speech mid-line ("nothing of the Empire at all. The"). The payoff of the first check is never seen whole. Fix: the newest beat should always fit in full, so pin it to the top of the transcript or let the rows give up space. Never clip inside a beat.
2. **The first scene arrives half-built and then rearranges** (`strip/f044` → `f046`): loader copy is left in the prose, the Follow text appears twice, one of them truncated with "…", rows are faded and spacing is uneven. Fix: hold the scene back until it's composed, and keep Follow either as a row or as a header, not both.
3. **The lit row is not the choice, and the summary contradicts it** (`09-create-presenting`, `08-create-before`, `11-setting-out`, `04-create-why`). Fix: the aside always describes the lit row. Mark chosen and considered distinctly. Use one name per concept everywhere (Mage, not "abjurer"; one past, not both scribe and artificer).
4. **Phone and tablet layout breaks.**
   - The × overlaps the location line, on the "F" of MERSCFAENN (`phone-touch/17-act-2`, `19`, `21`).
   - "Set out now" wraps onto three lines (`phone-touch/04`–`10`).
   - The phone sign step loses its question and its constellation is clipped at the left edge (`phone-touch/06`). The tablet constellation is also cut at x≈13 (`tablet-touch/06`).
   - The errand aside is cut mid-line on phone ("which no one has ever copied", `phone-touch/04`) and on tablet ("first time in three years.", `tablet-touch/04`).
   - Fix: reserve a gutter for the ×, keep "Set out now" on one line, and give the constellation a safe frame.
5. **Contrast over paintings.** The "More of the place" label disappears into bright sky (`16-act-1`, `desktop-reduced/16-act-1`). The thin white title sits on a bright temple (`phone-touch/16-act-1`). Grey dice text and teal "Noted" sit on pale mist (`tablet-touch/16-act-1`). "Nest gains 300 experience." is dim teal on near-black (`f060`). Fix: a local scrim behind every text block, and no thin weights over bright paint.
6. **The rules leak into prose.** "Nest makes the persuasion check (d20 17 + charisma 0 = 17 against 13)" sits between dialogue and result (`20-act-5`). "Ebba fails the deception check (d20 10 …)" appears on an opening prose page (`tablet-touch/16-act-1`). Odds are typed into row labels ("· an even chance ·", "· unlikely · one try · 30m"). Fix: tell the outcome, put the dice behind a small disclosure, and show odds as a quiet glyph.
7. **The text and the pictures disagree.**
   - Vance is "the priest of Lugh" in `13-first-scene`, "priestess" in `15-beat-2` and the header, and "The priest knows…" in `f054`.
   - "A well-head with a carved lip" is shown under a church spire (`desktop-reduced/16-act-1`). The same spire painting stands in for the shrine of Lugh.
   - The brother who is "taller by a head than when you went away" is a grey-bearded man in a ruff (`tablet-touch/20-act-4`).
   - "Brother Anselm Tarr" and the acolyte line are identical across two generated worlds (`16-act-1` and the reduced run).
   - `desktop-reduced/20-act-5` repeats a sentence word for word in its "You know now" block.
   - The shrine painting is visibly upscaled and soft (`16-act-1`).
8. **Rows and their numbers.** The 1–2–3–(blank)–4 numbering, the unexplained gold, blue and grey bars (gold "Talk to Vance" vs blue "Talk to Brother Anselm Tarr", `16-act-1`), the lowercase asides and the numeral overflow in `f054`. Fix: number every row or none, and add a legend or tooltip for the bar colours on first sight.
9. **Empty or redundant space.**
   - Creation's empty left column (`05`, `07`–`11`).
   - `tablet-touch/18-act-2` has a "More of the place" heading with nothing under it, plus "Wait" and "Wait an hour" as neighbouring rows.
   - `tablet-touch/19-act-3` has a band about 170 px tall with no painting at all, and a bookkeeping stack ("Noted / 2 things further off, in your notes. / You know now … / And 5 things more, in the Book.").
   - Fix: put the portrait, the sign or the chosen card into creation's left column, merge the two Wait rows, and fold the bookkeeping into one line.
10. **Small tells.**
    - The white first frame (`f000`) and the build stamp (`f010`).
    - The orange-to-blue pip on NEW GAME.
    - The cryptic "Another country" (`04`).
    - No advance hint on the prose pages (`13`–`15`).
    - "YOU KNOW NOW" fires on the greeting, before Vance has said anything about it (`17-act-2`).
    - The "1 of 2/3/4" pager on creation steps, which doesn't say how many options there are or where they are.

## 5. What works

- **The mark and the title.** The candles and the star, the thin capitals, the diamond rule and the gold motes are restrained and literary. They promise the right game.
- **The sign step** (`06`, `f016`→`f018`): stars join into the Hearth while you look. It's the best idea in creation and the one place where the left half carries the choice.
- **The calling and ancestry cards** have a consistent family of line icons (sword, staff, key, sun; spears, leaf, mountain, cat) and short italic taglines ("Slow to anger, slower to die").
- **The writing.** "'A drover went out … and did not come home,' says Vance. 'His dog did.'" "Iaric hears it out red to the ears." Short, concrete and dry. Tablet's "Coming home" errand, with a brother waiting on a rail holding your father's spear, is an emotionally strong first scene.
- **The conversation layout** (`17-act-2`): a full-height portrait on the left, a large thin name, small capitals for role and place, serif speech and sans rows. "YOU KNOW NOW" and "A NEW AIM" sit on coloured rules, and a gold dot appears on the map icon when an aim arrives (`18-act-3`). This is the most "game" the build feels.
- **Press feedback**: the chosen row lights, the others dim, and the act is echoed as a ◆ line (`f056`).
- **The opening prose plates** (`f034`, `f040`): an old landscape, a centred serif column and a gold "YOUR FIRST GOAL". At rest, they're beautiful.
- **Reduced motion** reaches the same states with no visible loss (`desktop-reduced/*`).

## 6. Scores

- **Coherence as one game: 6/10.** The row grammar unifies creation, place and talk, but the loader checklist, the black gap, the control-less prose pages and the first scene reflowing (`f030`–`f046`) make the entrance feel like a sequence of pages.
- **Legibility: 5/10.** Body text is fine, but clipped results, labels lost over bright paint, the overlapping × on phone and the lit-row-vs-choice ambiguity all cost the player information at important moments.
- **Beauty at rest: 7/10.** The title, the sign step, the prose plates and the conversation are lovely. The blurred creation backdrops, the empty half-screens and the soft upscaled shrine painting pull it down.
- **Restraint (quiet foreground): 6/10.** It is mostly quiet, but dice arithmetic, odds inside labels, the "hold" said three times and the bookkeeping stacks are machinery in the foreground.
- **Responsiveness: 7/10.** Presses are acknowledged in about 5–60 ms, and most results are drawn in 250–600 ms. But one check took 1,149 ms (desktop) and 956 ms (phone), the world takes 2.6–3.0 s, and a warm reload still waits about 4.5 s for the mark.
