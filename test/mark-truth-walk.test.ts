import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { AsMeant } from './support/as-meant';
import { GoldenWalk } from './support/golden-walk';
import { Glanced } from './support/glanced';
import { MarkTruth } from './support/mark-truth';

// No mark without its witness row in every drawer, page and focus it opens, over iscoed's two routes, at every turn
// (OR-302, OR-303, the owner's playtests of 23-24 November: "the gold was interrupted … the lens was advertising"
// what was then gone). The warrior's walk down the drove road, and the weir life's (the fifth cold play's lines, an
// elf scholar at Gatesend): at each turn every marked person's drawer on each of its pages, again once turned to, and
// the gold's act done (MarkTruth). Nest at the gate-yard, gold on the first page for "Ask Nest what is wrong with the
// sea-gate", the opening's charge, had been plain the moment she was turned to: the charge had ended at the first
// thing done, though nothing it promised had been (Charge.opening).
const weir = 'doc/architecture/mission-22/cold/cold-5-lines.txt';
const routes: [string, string[], string[]][] = [
  ['the warrior\'s walk', GoldenWalk.args(), GoldenWalk.lines()],
  ['the weir life', GoldenWalk.args('elf/mage/Ilse/scholar', weir),
    readFileSync(weir, 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#'))],
];
describe('a mark, over iscoed\'s two routes', () => {
  for (const [name, args, lines] of routes) {
    it(`is borne by every drawer, page and focus it opens, at every turn of ${name}`, async () => {
      const { journey } = await PlayTool.start(PlayTool.parse(args));
      const r = new Runner(journey.session), found: string[] = [];
      for (const [turn, line] of lines.entries()) {
        found.push(...await MarkTruth.of(journey.session, String(turn)));
        await AsMeant.ask(r, line);
      }
      expect(found).toEqual([]);
    }, 600000);
  }
  // The weir life's first page and the turning to Nest, as the breach was found (the cheapest form of it).
  it('keeps the gold on Nest\'s question once she is turned to, until it is asked', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(routes[1]![1]));
    const nest = Object.entries(Glanced.of(journey.session).glance.likenesses ?? {}).find(([id]) => /nest/.test(id));
    expect(nest?.[1].continues).toBe(true);
    expect(await MarkTruth.of(journey.session, '0')).toEqual([]);
  }, 120000);
});
