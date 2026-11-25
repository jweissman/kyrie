#!/usr/bin/env bun
import { isDeepStrictEqual } from 'node:util';
import { PlayTool } from '../../src/cli/play-tool';
import { Runner } from '../../src/cli/runner';
import { Operators } from '../../src/campaign/operators';
import { AsMeant } from '../../test/support/as-meant';
import { GoldenWalk } from '../../test/support/golden-walk';
import { LegalQueryPrototype } from './legal-query-prototype';

class LegalWalk {
  static time<T>(run: () => T): [T, number] {
    const start = performance.now(), result = run();
    return [result, performance.now() - start];
  }
  static stats(xs: number[]) {
    return { totalMs: xs.reduce((a, b) => a + b, 0),
      medianMs: [...xs].sort((a, b) => a - b)[Math.floor((xs.length - 1) / 2)], samples: xs.length };
  }

  static async main() {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const campaign = journey.session.campaign, runner = new Runner(journey.session);
    let module = campaign.module, actors = campaign.actors;
    let query = new LegalQueryPrototype(module, actors), production = new Operators(module, actors);
    let hits = 0, misses = 0, resets = 0;
    const fresh: number[] = [], construction: number[] = [], existing: number[] = [];
    const tracked: number[] = [], repeated: number[] = [];
    for (const [index, line] of GoldenWalk.lines().entries()) {
      const result = await AsMeant.ask(runner, line);
      if ('error' in result) { throw new Error(`Walk line ${index + 1}: ${result.error}`); }
      if (module !== campaign.module || actors !== campaign.actors) {
        hits += query.hits; misses += query.misses; resets++;
        module = campaign.module; actors = campaign.actors;
        query = new LegalQueryPrototype(module, actors); production = new Operators(module, actors);
      }
      const world = campaign.world, actor = campaign.playerActor;
      const [oracle, createMs] = this.time(() => new Operators(module, actors));
      const [wanted, freshMs] = this.time(() => oracle.applicable(world, actor));
      const [current, existingMs] = this.time(() => production.applicable(world, actor));
      const [answer, queryMs] = this.time(() => query.ask(world, actor));
      const [again, repeatMs] = this.time(() => query.ask(world, actor));
      if (!isDeepStrictEqual(wanted, answer) || !isDeepStrictEqual(wanted, again)
        || !isDeepStrictEqual(wanted, current)) {
        throw new Error(`Grounding mismatch at walk line ${index + 1}`);
      }
      construction.push(createMs); fresh.push(freshMs); existing.push(existingMs);
      tracked.push(queryMs); repeated.push(repeatMs);
    }
    hits += query.hits; misses += query.misses;
    console.log(JSON.stringify({ bun: Bun.version, platform: process.platform, arch: process.arch, resets, hits, misses,
      construction: this.stats(construction), fresh: this.stats(fresh), existing: this.stats(existing),
      tracked: this.stats(tracked), repeated: this.stats(repeated) }, null, 2));
  }
}

await LegalWalk.main();
