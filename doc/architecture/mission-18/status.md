# Mission 18: where things stand, 30 October 2026

Written at the weekly usage limit, to close out threads and say plainly where the mission is. The audit
([audit.md](audit.md)) holds the requirement-by-requirement account. This note brings it up to date. The work that
is not on main sits in worktrees, and the table below says what each holds.

## The verdict

Ordinary play is still awkward, as the owner found this morning. Nothing that would change that has reached main yet.

The causes are now known precisely and recorded:
- [diagnosis.md](diagnosis.md) (OWN-28): one ordinary expedition traced end to end;
- the navigation review (register NVR-01 to NVR-22);
- the cold review's section H (REV-01 to REV-05; [loops.md](loops.md)).

The repairs for each are designed, and most are half built in worktrees. None is finished, reviewed and gated. The next
session should finish and land them, in the order below, before starting anything new.

## On main since the morning of 29 October

| Commit | What |
|---|---|
| 49c4338 | Quiet creation as centred cards, with each school's real spells (OWN-14, OWN-15). Drawn default names; Common place names in the human heartland (OWN-16, OWN-30). Portraits on the company's fight cards (OWN-29) |
| 4f55697 | Wapshott's Peregrine Circus merged (adventure/big-tent, Phases I and II) |
| 525b336, 1c539c7 | The adventures' friction in the register (69 GTR-/WPC- rows; [friction.md](friction.md)) |
| 0a51b40 | The one-universe design ([one-universe.md](one-universe.md), OWN-31 to OWN-38) |
| 97e63e6 | The M18 audit and its plan, W0 to W8 |
| 225c317 | The navigation review's findings (NVR-01 to NVR-22) |
| 4ba1b8e | The OWN-28 diagnosis, with the player's journal and screens |
| 0d834d4 | The cold review, its section H as REV-01 to REV-05, and the loops design |
| (this commit) | Inherited rows: M17-93, M17-65, CMB-02, PT-33, M17-67 and NAV-04 fixed; PT-38 partly fixed |

## What the next session should finish first

Each line names its worktree under `.claude/worktrees/`. Every worktree's state is partial and uncommitted. Read its
`git diff` before continuing. The workflow scripts that built them are in the session's workflows folder; resuming one
replays its finished steps.

1. **The map, in a new country and in the first (OWN-43, NVR-01 to NVR-14). Worktree `travel`, partial.**
   - **The fault:** the map's set-out goes to the hex beside a place, over only the ways already walked, so in a newly
     entered country it "knows no way" even to the next cell.
   - **The fix:** set out by the engine's own plan to the place itself, by road where known, across country otherwise.
     Test it in a second country.
   - **The worktree `interiors`** (partial) draws each level's plan inside a site (NVR-15 to NVR-22).
2. **The expedition repair (OWN-28). Worktree `expedition`, partial.** This is the bell and the hobs from Brightbridge:
   - a lead becomes an aim;
   - dens get an inside;
   - gates have two keys;
   - truce and road are told before commitment;
   - kit sites get a place on the map;
   - hooks go stale on return and the town thanks the company.
3. **The technique cooldown (diagnosis change 4). Worktree `novice`.** This is a one-line import fix: Orsino's default
   cooldown of 3 for techniques (`src/canon/canon-runtime.ts`). It makes every danger forecast and viability measure
   honest. The novice baseline (`doc/architecture/mission-18/novice-viability.md` in that worktree) was measured
   before the fix.
   - **A danger-reading bug was also found there:** the warning at a fight's opening re-fights the battle without the
     company's equipment.
   - The targeting repair (foes not always striking the frailest) is partial.
4. **The glance (OWN-18, OWN-19, REV-05). Worktree `glance`.**
   - **Done:** the engine half (one observation, one sign of life, at most three promoted acts, marks before
     commitment).
   - **Partial:** the page half.
5. **One country (B1, B4). Worktree `universe`.** Every authored adventure on the one principal country, with no
   marches between them, which the owner reminded us was the point of Gate B.
   - **Built:** the canon (`data/imbar`, canon binding, the six adventures on one Imbar).
   - **Begun:** the one-country design and build.
   - The Grand Tour waits on it (worktree `grandtour`, an unintegrated merge).

## Built, critiqued and waiting for their fixes

These are smaller and nearly done. Each needs its critic's faults fixed, then a gate.

| Worktree | What | Still to fix |
|---|---|---|
| `opening` | The quiet opening after creation (OWN-17) | The first place repeats the second beat; a beat can be skipped before it is read |
| `faces` | Portraits fill the card's left side; the presentation chosen at creation; a rolled table of names (OWN-39, OWN-40) | The third fight card is cut off at 1180×820; "Roll again" for elves and dwarves |
| `intro` | The studio's stab with words; the game's name in one constant (OWN-42) | The critic's faults; the owner's choice of names (`.claude/names-report.md`: LANTHORN, HOLLOWAY or CRESSET for the game; Seven Lamps for the studio) |
| `friction` | GTR-02 (a rule's line told as a witness would hear it) and GTR-23 (an inference on what was just read fires at once), both done with probes | GTR-04, GTR-05 and GTR-03 not begun; a review |
| `map3` | The map's knowledge model: heard of is a marker only; "?" for nearby unknowns; discovery adds up | The board's look (terrain, fog, tilt) not begun |
| `surprises` | Three Friday surprises built: the sky's weather over the painting, the hour turning, the flame carried underground | Critique and fixes |

## The owner's decisions waiting

1. The game's name and the studio's (OWN-42).
2. One-universe decision 1: the House of Doors stands at Sennet, and the college's seat is at Dun Rì. Decision 3: a world
   that never visits Sennet records nothing of the Tour.
3. An "Adventures" way in from the title, or authored adventures reached only through the one country.
4. The audit's remaining decisions (audit.md, section 4).

## Lessons for the next session

- **Run fewer workflows at once.** Ten at a time reached the five-hour limit overnight, and the weekly limit this
  morning. Land one workstream before starting the next.
- **Wait for quiet with `.claude/wait-quiet.sh`, never an inline `pgrep -f` loop.** An inline loop matches its own
  shell, and `chrom` matches the editor's own `--no-chrome`.
- **Test navigation in a second country, not only the first.** The owner met the failure in a country entered over a
  march.
- **Freeze the build while a player is playing.** Merging rebuilds `site/`, and the diagnosis's player saw the game
  change under them.
