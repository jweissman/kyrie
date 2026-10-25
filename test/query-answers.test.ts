import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ModuleWriter } from '../src/lang/module-writer';
import { CampaignTick } from '../src/campaign/campaign-tick';
import { Candidates } from '../src/lang/candidates';
import { World } from '../src/lang/world';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import type { Module } from '../src/lang/module';

// A question asked of what is not yet known has the answers asking it of each thing in turn would give: a negation
// is not asked of nothing at all before what it reads is bound, and a variable asked of twice is one variable. Found
// by Mission 15's independent audit (F2), whose minimal cases these are.
const call = ModuleWriter.call;
const parsed = (source: string) => new ModuleCompiler().instantiate(ModuleParser.parse(source), 'q').module;
const marked = parsed(`Module probe "Probe" {
  Kind thing. Entity a: thing "A". Entity b: thing "B".
  Relation marked(thing). Relation candidate(thing). Relation awarded(thing).
  Query clear(t: thing) means not marked(t) and candidate(t).
  Query unmarked(t: thing) means not marked(t).
  Initially Assert marked(b). Initially Assert candidate(a). Initially Assert candidate(b).
  Rule award when clear(?t) { Assert awarded(?t). }
  Goal false.
}`);
const paired = parsed(`Module probe2 "Probe 2" { Kind thing. Entity a: thing "A". Entity b: thing "B".
  Relation pair(thing, thing). Query diagonal(x: thing, y: thing) means pair(x, y).
  Initially Assert pair(a, b). Goal false. }`);
const answers = (world: World, name: string, ...args: string[]) =>
  [...world.solve(call(name, ...args), {})].map(b => args.filter(a => a.startsWith('?')).map(a => b[a]).join(',')).sort();

describe('a question asked of what is not yet known', () => {
  const world = new World(marked).apply(marked.initial);
  it('waits on what binds it before asking its negation', () => {
    expect(world.test(call('clear', 'a'))).toBe(true);
    expect(answers(world, 'clear', '?t')).toEqual(['a']);
    expect(CampaignTick.instances(marked.rules![0]!, world).map(([, b]) => b['?t'])).toEqual(['a']);
  });
  it('ranges what nothing in it can bind over the things of its type', () => {
    expect(answers(world, 'unmarked', '?t')).toEqual(['a']);
  });
  it('takes a variable asked of twice for one variable', () => {
    const pairs = new World(paired).apply(paired.initial);
    expect(answers(pairs, 'diagonal', '?t', '?t')).toEqual([]);
    expect(answers(pairs, 'diagonal', '?x', '?y')).toEqual(['a,b']);
  });
  it('answers every query of the shared rules as asking it of each thing would, in a generated world', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'thorn', w.source), live = s.campaign.world, module = live.module;
    let asked = 0;
    for (const query of module.queries.filter(q => q.parameters.length)) {
      // Each parameter left open in turn, the others the party's own or the first thing of their type.
      for (const [i, open] of query.parameters.entries()) {
        const args = query.parameters.map((p, j) => j === i ? '?x' : Probe.some(module, p.type));
        if (args.some(a => a === undefined)) { continue; }
        const domain = Probe.domain(module, open.type), expected = domain.filter(id =>
          live.test(call(query.name, ...args.map(a => a === '?x' ? id : a!)))).sort();
        const within = new Set(domain), told = [...new Set(answers(live, query.name, ...args as string[]))];
        expect(`${query.name}: ${told.filter(id => within.has(id)).join(' ')}`).toBe(`${query.name}: ${expected.join(' ')}`);
        // What grounding is proposed by a query holds every true answer (see Candidates).
        const proposed = new Set([...Candidates.of(live, call(query.name, ...args as string[]), {})].map(b => b['?x']));
        expect(expected.filter(id => !proposed.has(id) && !proposed.has(undefined))).toEqual([]);
        asked++;
      }
    }
    expect(asked).toBeGreaterThan(20);
  }, 120000);
});

class Probe {
  // A plausible argument of a type: the party, for a group; otherwise the first entity of the type.
  static some(module: Module, type: string): string | undefined {
    if (type === 'group' || type === 'entity') { return 'party'; }
    return module.entities.find(e => e.type === type)?.id;
  }
  // The things of a type a question could be asked of (bounded, so the check is quick).
  static domain(module: Module, type: string): string[] {
    return module.entities.filter(e => type === 'entity' || e.type === type).slice(0, 400).map(e => e.id);
  }
}
