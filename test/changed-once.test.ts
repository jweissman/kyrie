import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { Typography } from '../src/presentation/typography';
import { GoldenWalk } from './support/golden-walk';
import { BeforeRooms } from './support/before-rooms';
import { AsMeant } from './support/as-meant';

// A change told once on a page (OR-245, the first blind cold play's P116): come back into the Wardens' gatehouse with
// the pawl from the gate-well (the cold plays' eleventh line), "the stub of its pin is bright and square: sawn through"
// was told in the place, and again under Since you were last here. What has changed is said where the page says it
// first, and nowhere twice: none of its lines is among the place's, who is here or what came of the act.
const weir = 'doc/architecture/mission-22/cold/cold-5-lines.txt';
describe('what has changed since the company was last here', () => {
  it('is not told again under Since you were last here when the place tells it', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args('elf/mage/Ilse/scholar', weir)));
    const r = new Runner(BeforeRooms.set(journey.session));
    for (const line of readFileSync(weir, 'utf8').split('\n').filter(Boolean).slice(0, 11)) { await AsMeant.ask(r, line); }
    const leaf = r.leaf!, g = leaf.glance!;
    expect(g.arrival).toBe('return');
    const place = [...leaf.glanced?.situation ?? [], ...leaf.glanced?.presence ?? [],
      ...(leaf.exchange?.lines ?? []).map(l => l.text)].map(t => Typography.curl(t));
    expect(place.join(' ')).toContain('sawn through');
    expect(g.changed.filter(c => place.includes(Typography.curl(c)))).toEqual([]);
  }, 240000);
});
