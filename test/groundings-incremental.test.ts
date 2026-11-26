import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { KeptGroundings } from '../src/campaign/kept-groundings';
import type { Operator } from '../src/lang/module';
import type { World } from '../src/lang/world';
import { AsMeant } from './support/as-meant';
import { HonestPlayer } from './support/honest-player';
import { ContinuityCensus } from '../scripts/continuity-census';

// Incremental equals full (OR-183, mission-22-beta/execution-plan.md task 2): what the kept groundings give an actor
// for every world they are asked in, on every turn of the census's three walks (the warrior's golden walk, the cold
// mage's, eighty steps of the gold-follower), is what grounding every schema afresh in that world gives, in order.
// Each answer is taken as it is given and checked after the turn, when no reading is under way, so that grounding
// afresh reads nothing into what the engine keeps.
interface Asked { world: World; actor?: string; schemas: readonly Operator[]; ground: (s: Operator) => Operator[];
  out: string[] }
const asked: Asked[] = [];
const all = KeptGroundings.prototype.all;
KeptGroundings.prototype.all = function (this: KeptGroundings, ...args: Parameters<KeptGroundings['all']>) {
  const out = all.apply(this, args), [world, actor, schemas, ask] = args;
  asked.push({ world, actor, schemas, ground: ask.ground.bind(ask), out: out.map(o => o.id) });
  return out;
};
// The first difference between the kept answer and the fresh one, if any.
const differs = (a: Asked): string | undefined => {
  const fresh = a.schemas.flatMap(s => a.ground(s)).map(o => o.id);
  const at = fresh.findIndex((id, i) => a.out[i] !== id);
  if (at < 0 && fresh.length === a.out.length) { return undefined; }
  const i = at < 0 ? fresh.length : at;
  return `${a.actor ?? '(anyone)'}: kept ${a.out[i] ?? '(end)'}, fresh ${fresh[i] ?? '(end)'} at ${i}`;
};

describe('the kept groundings equal the full on every turn of the census walks', () => {
  for (const w of ContinuityCensus.walks) {
    it(`${w.name}`, async () => {
      const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', w.as]));
      const s = journey.session, r = new Runner(s), honest = new HonestPlayer(s), wrong: string[] = [];
      const turns = w.lines ? ContinuityCensus.lines(w.lines) : Array.from({ length: w.steps ?? 0 }, () => '');
      let checked = 0, played = 0;
      for (const [turn, line] of turns.entries()) {
        asked.length = 0;
        if (w.lines) { await AsMeant.ask(r, line); } else if (!await honest.step()) { break; }
        played++;
        for (const a of asked) {
          checked++;
          const d = differs(a);
          if (d) { wrong.push(`t${turn} ${line}: ${d}`); }
        }
      }
      expect(wrong).toEqual([]);
      expect(checked).toBeGreaterThan(played / 2);
    }, 900000);
  }
});
