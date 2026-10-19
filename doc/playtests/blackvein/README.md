# Blackvein browser evidence

Actual headless Chromium, clicking the static `site/index.html` UI. Seed `bells`; default Blackvein
configuration. No Inspect, debug injection, or world mutation was used in these walkthroughs.

- [Square](square.png): player-facing geography, community circumstances and missing-miner lead.
- [Bell silenced](bell.png): the investigator's final observation and recent-first journal.
- [Closure](closure.png): telling Ada the pump evidence makes her close the physical bulkhead.
- [Abandoned square](abandoned.png): an unattended history changes the town while the party is away.

Investigator, 15 watches:

```
travel(vale__square)
travel(vale__guild)
examine(vale__ledger)
travel(vale__square)
travel(vale__toll)
tell(vale__vey,vale__charter)
travel(vale__square)
travel(vale__ridge)
travel(vale__hollow)
ask(vale__len,vale__escape_route)
examine(vale__bark)
tell(vale__len,vale__charter)
travel(vale__ridge)
passage(vale__vault)
disable(vale__bell)
```

The page showed the accepted charter boundary and silenced striker. Reloading at watch 15 yielded an
identical visible play grid, including chronicle and party state.

Safety-first: square → ridge → hollow → examine bark → ridge → mine → tell Ada. The closure observation
appeared immediately at watch 7. Traveling ridge → square → inn reached the displaced miners at watch 10.

Unattended: wait 43 times on the south road, then enter the square and shrine. The square was deserted;
the shrine described the oily film and retained contamination. Commands remained available.

Automated verification:

```
bun run check
# 119 pass, 1 optional Chromium test skipped, 0 fail; lint and both typechecks passed

KYRIE_CHROMIUM=/path/to/chromium bun test test/browser-parity.test.ts -t 'real headless browser'
# 1 pass, 0 fail; six transcript comparisons, including Blackvein
```

The optional test executes the static browser-targeted harness in Chromium and compares canonical saves,
events, player views and chronicles. The main suite separately compares in-process, browser-targeted-bundle
and CLI execution. The click walkthroughs above check the actual Play UI, not only that harness.

A local timing/size sample after static-precondition grounding: 1,989 grounded actions; 94,634 bytes for a
fresh compact save; roughly 1.2 seconds to load under concurrent test load. These are measurements of this
configuration, not performance guarantees.

These are automated playtests and source review, not independent evidence that new human players find
Blackvein compelling. See [campaign status and remaining gaps](../../blackvein-campaign.md).
