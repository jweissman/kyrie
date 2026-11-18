# Doable: one resolution from the engine's offer to rows that can be done

The first of six shared mechanisms the register's live rows come down to (the owner, 18 November: "architectural
improvements we could make that would let us address lots of open issues at once"). It extends the trust contracts'
witness: as no indicator is drawn without the engine's witness, no row is done by a client's own reading of what it
does. Register: TB-12 (this design), with TB-01, TB-09, TB-10, OR-38, OR-72, PB-02, PB-06, CL-33, CL-34 and CL-49.

## The problem: five readings of one offer

The engine's glance offers the scene (Offers.scene: the four and the rest, by page choice id). What a choice *does*
when taken is then read by each client for itself:

| Client | Where | Its reading |
|---|---|---|
| Runner | `Runner.within`, `way`, `keyed`, `opener`, `first` | an opener by the act it is led for (`inside[0]`), else an exit's first command, else a look closely within, else its first child |
| Terminal | `Terminal.led`, `way`, `drawn` | `inside[0]`, else the act's command, else the exit's first command; aspects re-read by `Emphasis.within` |
| Autoplay | `AutoplayRun.led` | a `#talk` choice sliced into `talk_to(<id>)` |
| Page | `MenuModel.lead`, `GlanceStage.choice` | the menu's own choice tree, opened on the page |

Where they part, the player is misled:

- At a1's speaking door the gold opener "Look at the speaking door" has no command; the runner did it by its first
  child, so gold read "Push and pull" ("does not shift"), then "Listen", then nothing (cold play 5, CL-34).
- The runner lists the rest flat, 60–80 rows (twelve "Set out for…", every set-down and spell swap), where the page
  keeps them in lenses (cold play 5, CL-33).
- "Talk to the factor" had sold the crown; "Talk to Wat" had asked about the weather (CL-05, fixed by hand in the
  runner); a talk's rows had stood apart from the person (CL-07, CL-49).
- The page and the terminal gave different runs of one seed (PB-06).

## The design

`Doable.of(glance, screen, campaign)` in `src/presentation/doable.ts`, cached per glance (as Attest is):

```ts
interface Row {
  id: string;            // the page's choice id: what every client sends back
  label: string;         // its words, as the engine says them (ChoiceWording, AimSaid.short)
  does?: string;         // the command it does when taken; none for an opener
  opens?: Row[];         // an opener's rows, in the engine's order: what it is led for first
  lens: Lens;            // where the page keeps it (things, people, places, time)
  led?: true;            // among the four
  witnesses: Witness[];  // its indicator's (Attest): the same the page draws by
  marks: Mark[]; minutes?: number;
}
```

- **An opener is never done by a guess.** Taken, it opens: the page draws its rows; the runner and the terminal list
  them under it. Where the engine leads with an opener *for* an act inside it (`Promoted.for`, `inside`), that act is
  first among its rows and carries the witness; a try (push, listen) is never what an opener "does".
- **The rest is grouped by lens**, as the page groups it: the runner's `Said.offer` gains `lenses`, each a short list,
  so the cold player meets the place's things and people before twenty journeys and the company's gear.
- **Every client reads `Doable`, and nothing else**, to say what a row is and what taking it does: Runner, Terminal,
  AutoplayRun and the page's menu. `Runner.within/way/keyed/opener/first`, `Terminal.led/way/drawn` and the `#talk`
  slicing are deleted.

## Contracts and pins

- **Parity**: from one state, the page's rows, the terminal's and the runner's are the same rows with the same
  commands (TB-01's test/small/one-projection, extended to openers and to the rest).
- **No guessed act**: an opener's taking opens it; no client does an opener by its first child. Counterexample: the
  speaking door's gold opener done as "Push and pull".
- **The rest by lens**: the runner's rest is grouped as the page's lenses; the four and each lens at most a page.

## Order of work

1. `Doable.of` beside the existing readings, and a parity spec that compares them (it fails where they part today).
2. The runner on it (its rest by lens; openers listed, not guessed); then the terminal; then autoplay; then the page's
   menu.
3. The old readings deleted, the parity spec kept.

After the travel work lands (it touches the runner's journeys), so the two do not collide.
