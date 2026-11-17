import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { GeneratedWorld } from './support/generated';
import type { CreatureStore } from '../src/creature-store';

// Phase A §8's tiny proof: a protagonist generated into a household that was there before them, kite's drover's
// family (a mother, a brother, a father three days gone), named by one tradition, with a past they share (the letter,
// the father's going) and relations that are the world's: kin, home, what each is called to them, and the brother
// come along. Kept and opened again (PlaySession.resume of the checkpoint), the family is the same family.
class Household {
  static async come() {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: 'Harbek', raceId: 'dwarf', classId: 'warrior', pronouns: 'he' }] });
    return { w, s: await PlaySession.start(w.path, 'kite', w.source), town: Household.town(w) };
  }
  static town(w: Awaited<ReturnType<typeof WorldAssembler.assemble>>): string {
    return w.report.placements.find(p => p.scenario === 'drover')!.bindings.town!;
  }
  // Everything the world holds of the family: their names, the company's, and every relation among them.
  static read(s: PlaySession) {
    const w = s.campaign.world, ids = ['drover__wife', 'drover__son'];
    const name = (id: string) => s.campaign.module.entities.find(e => e.id === id)!.name.split(', ')[0]!;
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures;
    const company = (s.campaign.readout.inhabitants.party ?? []).map(id => store.get(id).name);
    const held = ['kin', 'kinship', 'homeOf', 'knows'].flatMap(r => w.related(r)
      .filter(x => r === 'knows' ? x.args[0] === 'party' && x.args[1] === 'drover__missing'
        : x.args[0] === 'party' || ids.includes(x.args[0]!))
      .map(x => `${r}(${x.args.join(', ')})`)).sort();
    return { mother: name('drover__wife'), brother: name('drover__son'), company, held };
  }
  static async act(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name) || pattern.test(x.choice.id));
    if (!c) { throw new Error(`No ${pattern}: ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); }
    return s.leg(c.choice.id);
  }
}

describe('a protagonist born into a household', () => {
  it('is of one family with it, by one tradition, and the family is kept', async () => {
    const { s, town } = await Household.come();
    const before = Household.read(s);
    // One tradition: the dwarves' family name, the protagonist's too; three given names.
    const line = (n: string) => n.split(' ').slice(1).join(' ');
    expect(before.company).toEqual([expect.stringMatching(/^Harbek \S+$/)]);
    const own = before.company[0]!;
    expect([line(before.mother), line(before.brother)]).toEqual([line(own), line(own)]);
    expect(new Set([own, before.mother, before.brother].map(n => n.split(' ')[0])).size).toBe(3);
    // The world's relations: kin to both, what each is to them, the town their home, the father's going known.
    expect(before.held).toEqual(['homeOf(party, region__s2)', 'kin(party, drover__son)', 'kin(party, drover__wife)',
      'kinship(drover__son, origin__called_brother)', 'kinship(drover__wife, origin__called_mother)',
      'knows(party, drover__missing)']);
    // The brother comes along: a relation made in play, not declared.
    GeneratedWorld.put(s, `${town}_green`);
    await s.leg('wait');
    await Household.act(s, /^talk_to\(drover__son\)$/);
    await Household.act(s, /what he means to do$/);
    await Household.act(s, /to join the company$/);
    const joined = Household.read(s);
    expect(joined.company).toEqual([own, before.brother]);
    // Kept, and opened again.
    const again = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())));
    expect(Household.read(again)).toEqual(joined);
    expect(again.canonical()).toBe(s.canonical());
  }, 120000);
});
