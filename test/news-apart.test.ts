import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';

// News is told in each teller's own words: no two who tell news of a country's places give the same line, but for the
// names (NAR-04: two travellers come from one place told the same news word for word, and two places had the same
// rumour but for the name). Measured over eight countries, twenty lines alike before; none after. One who tells of a
// place twice (on the road, and rested at the other end) tells the same news of it.
class News {
  static async alike(seed: string): Promise<string[]> {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const c = (await PlaySession.start(w.path, seed, w.source)).campaign, by = new Map<string, Set<string>>();
    for (const a of c.module.actions.filter(x => /^Ask .+ for news of /.test(x.name))) {
      const [, who, where] = /^Ask (.+) for news of (.+)$/.exec(a.name)!;
      const said = (a.report ?? '').replaceAll(who!, 'NAME').replaceAll(where!, 'PLACE').replace(/^.*?says NAME[.,]? ?/, '');
      (by.get(said) ?? by.set(said, new Set()).get(said)!).add(a.speaker ?? '');
    }
    return [...by.entries()].filter(([, tellers]) => tellers.size > 1).map(([said]) => said);
  }
}

describe('the news', () => {
  it('is told in each teller\'s own words', async () => {
    const alike = await Promise.all(['kite', 'larch', 'brine', 'ash'].map(seed => News.alike(seed)));
    expect(alike).toEqual([[], [], [], []]);
  }, 120000);
});
