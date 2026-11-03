# Authoring friction: Mark Street, the Bakery, the Mark-Forger (`ms_`, `bk_`, `fg_`)

1. **`day(clock)` counts from 1, not 0.** The kernel, the Slate and the brief all say day 0 is the first morning
   (`slate.kyr` `slate_day0 … when day(clock) == 0`; `kernel.kyr` `take_coal_from_hearth … day(clock) >= 6`). A probe
   that waits to watches 0, 12, 96, 144, 240, 312, 384 and prints `day` gives 1, 1, 2, 2, 3, 3, 4: the first 16 hours are
   day 1, and each day turns at midnight (watch 96 + 144 n). `slate_day0` never fires and the Slate is a day early; coals
   open on what the design calls day 5. I wrote my own times in watches (312 for "day 2 noon") and recommend the lead
   decide; every `day(clock) == n` in `slate.kyr` is off by one against `01-design.md`. Evidence:
   `Journey.measure('day','clock')` after `=96`.
2. **`City.start(seed, party)` takes the wrong thing.** `test/support/quittance.ts` types its second parameter as
   `Parameters<typeof Journey.start>[2]`, which is the *options object* (`{ party: [...] }`), but reads like a party array.
   An array is silently ignored (every class had every capability until I printed `capable`). A party must be passed as
   `{ party }`.
3. **`Grave` cannot be conditional.** The brief wants the cost of fixing the flue hidden until the line is read, so each
   fix is two actions (`bk_fix_trap`, `bk_fix_trap_k`; `bk_fix_brawn`, `bk_fix_brawn_k`), identical but for a `Grave` and a
   label. A `Grave … when knows(…)` would be one action. A journey also does not enforce the ask-twice: `Journey.perform`
   records `taken.grave` and executes at once, so a test can only assert the warning exists.
4. **A conditional `Observe` cannot supersede the base scene.** `scenes.kyr` says the oven is "banked and breathing"; once
   the coal is dead my observations add "the red light under the ash is gone" below it. Nothing replaces the line. I wrote
   around it. A `Observe … replaces bakehouse_scene` (or `Observe` precedence) would have fixed it.
5. **`page` and `told` disagree about revisits.** `Journey.taken[i].page` leaves out sentences the narrator has already
   given the player; `told` keeps every observation. Tests that check what a room says on re-entry (`City.page(j)`) fail
   silently on conditional observations and pass on first visits; I had to use `taken.at(-1).told` for those.
6. **The names lint collides on the very name the brief gives.** `Ma Gedge` (surname Gedge) collides with Mopsa Gedge of
   *Hessel*; `Ruddle`, `Sallow`, `Quennell` also collided. The error names the other adventure but not whether the room
   names in `city.kyr` ("Ma Gedge's back-shop") agree with the person; they now do not.
7. **Timed actions apply their effects before their time passes.** `ms_pull_plate` has `Time 6 minutes` and
   `Set ms_pulled_at(ms_nine) to watch(clock)`: the value stored was 12, and the watch was 13 when the action ended. A rule
   keyed on "pulled + 3" is thus a watch early. There is no way to say "after".
8. **Talk is free.** A Topic takes no time, so a fire whose clock is the point (`ms_burns`) never punishes a long
   conversation; I had to hang the cost on physical actions and on `Time` of the actions after the ask. A `Time` on a
   Topic would have made "argue with Garrity" cost a quarter-hour.
9. **Checks cannot be steered; tests hunt for seeds.** Every failure branch (`ms_pull_plate`, `ms_swap_plate`,
   `bk_fix_trap`, `fg_extort`, `fg_read_dabney`) is tested by trying ten seeds with a scratch script and fixing the one that
   fails. A `Journey` option such as `rolls: 'fail'` would be better than the seeds written in the test files.
10. **`Journey.holds('holding', 'party', kind)` is false for a kind the company holds.** `holding(actor, kind)` works in
    `Requires`, but not from the test driver, so tests check "the next action is offered" instead.
11. **Role advice for moved persons is wrong for craftspeople.** `advice role: fg_gedge is "die-sinker, retired by the
    Phoenix" wherever they are, and fg_raid_full moves them: say where it is true`: a trade is true wherever the person is
    taken. No way to quiet it.
12. **Lint takes 45 s, `play` loads in 2 s.** The only quick syntax check is `bin/kyrie play … --choices`. A `kyrie check`
    that loads and compiles without the whole lint would have saved an hour.
13. **The guide shows no action pinned to one named room.** Examples either take a `site: place` parameter or (arch.kyr)
    write `at(actor, towpath)`; I wrote `site == nine_yard` by habit, found no example of it, and used the second form
    without finding out whether the first compiles. A line in section 5 would have settled it.
14. **A shared scratchpad.** Not Kyr: three of us wrote `seeds.ts` and `play.ts` into the same scratchpad and one
    overwrote another's. Tools that print their directory would have helped; I renamed mine `mst_*`.
15. **Write-only advice on purpose.** `ms_rule`, `bk_exempt`, `fg_network`, `fg_doors` and a dozen more are written for the
    Hearing and the endings to read; until the spine lands the lint says "a thread not yet taken up?" for each. Expected,
    but the same message for a forgotten relation and a promised one makes it hard to find the former.
