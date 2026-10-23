import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { RegionMarvels } from '../src/world/region-marvels';
import { GeneratedWorld } from './support/generated';
import world from '../data/generation/scenes/orsino-world.json';
import met from '../data/generation/scenes/wonders.json';
import snares from '../data/generation/scenes/snares.json';

// Orsino's wonders and traps in a generated country. Deep in the wild country, and past the inner ways of some of the
// makers' works, are things that do what Orsino says they do to whoever meets them, once. On a work's inner way a
// mechanism waits: anyone can see it, looking closely tells how it works, and knowing that opens ways to deal with
// it; risking it hurts, and says what hurt. Thorn: a fen country with a wanderer who carries a pole and a torch.
class Marvels {
  static async start() {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return PlaySession.start(w.path, 'thorn', w.source);
  }
  static things(s: PlaySession, pattern: RegExp): string[] {
    return s.campaign.module.entities.map(e => e.id).filter(id => pattern.test(id));
  }
  static async act(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name) || pattern.test(x.choice.id));
    if (!c) { throw new Error(`No ${pattern} among ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); }
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const after = PlayerView.observe(s.campaign), feedback = ActionFeedbackView.read(s.campaign, event, before);
    return Narrator.leaf(s.campaign, ScreenModel.build(s.campaign),
      { event, feedback, said: c.choice.name, moved: before.location?.id !== after.location?.id });
  }
  static body(s: PlaySession) {
    return s.campaign.readout.creatures.find(c => s.campaign.readout.partyIds.includes(c.id))!;
  }
  static told(leaf: ReturnType<typeof Narrator.leaf>): string[] { return leaf.exchange?.lines.map(l => l.text) ?? []; }
}

describe('wonders and traps', () => {
  it('draws only what Kyr can run, each met as it is written to be, and no trap that would kill outright', () => {
    const runnable = Object.entries(world.wonders).filter(([, w]) => 'effect' in w).map(([k]) => k).sort();
    expect(Object.keys(met.wonders).sort()).toEqual(runnable);
    expect(RegionMarvels.wonders.length).toBe(runnable.length);
    for (const [, t] of RegionMarvels.traps) {
      expect(RegionMarvels.harm(t.effect!)).toBeLessThanOrEqual(10.5);
      expect(Object.keys(snares.mechanisms)).toContain(t.mechanism);
    }
    // An hour of agony is six watches of it: more than a trap in a work may do.
    expect(RegionMarvels.harm('Apply agony to ally for 1 hour.')).toBeGreaterThan(10.5);
  });

  it('keeps a wonder deep in the wild that gives what it has once, and tells the moment before the after', async () => {
    const s = await Marvels.start(), wonder = Marvels.things(s, /^region__wonder_[a-z_]+$/)
      .find(id => /_(deep|heart)$/.test(s.campaign.world.one('at', id) ?? ''))!;
    const key = wonder.replace('region__wonder_', '') as keyof typeof met.wonders, how = met.wonders[key];
    expect(how.where).toBe('wild');
    GeneratedWorld.put(s, s.campaign.world.one('at', wonder)!.replace('region__', ''));
    await s.perform('wait');
    const before = JSON.stringify(Marvels.body(s).state);
    const told = Marvels.told(await Marvels.act(s, new RegExp(`^${how.verb} ${how.name}$`)));
    expect(told[0]).toBe(how.taken);
    expect(told).toContain(how.after);
    // What it gave is on the one it was given to, as Orsino has it (a condition for hours, or hurts closed).
    if (/Apply/.test(world.wonders[key].effect!)) { expect(JSON.stringify(Marvels.body(s).state)).not.toBe(before); }
    expect(PlayerView.choices(s.campaign).some(c => c.choice.name.startsWith(how.verb))).toBe(false);
  }, 60000);

  it('puts a wonder within a work past its inner way', async () => {
    const s = await Marvels.start(), within = Marvels.things(s, /^region__wonder_[a-z_]+$/)
      .filter(id => met.wonders[id.replace('region__wonder_', '') as keyof typeof met.wonders]?.where === 'within');
    expect(within.length).toBeGreaterThan(0);
    for (const id of within) {
      const room = s.campaign.world.one('at', id)!, inner = s.campaign.world.related('connects')
        .filter(r => r.args[2] === room).map(r => r.args[0]!.replace('region__', ''));
      expect(inner.some(way => Object.values(RegionMarvels.inner).some(suffix => way.endsWith(`_${suffix}`)))).toBe(true);
    }
  }, 60000);

  it('lets a trap be understood by looking closely, then sprung from a pole\'s length off, harming no one', async () => {
    const s = await Marvels.start(), snare = Marvels.things(s, /_snare$/)[0]!;
    const way = s.campaign.world.one('on', snare)!, from = s.campaign.world.related('connects', way)[0]!.args[1]!;
    const name = s.campaign.module.entities.find(e => e.id === snare)!.name.replace(/^the /, '');
    const how = snares.mechanisms[name as keyof typeof snares.mechanisms];
    GeneratedWorld.put(s, from.replace('region__', ''));
    await s.perform('wait');
    const hp = Marvels.body(s).state.hp;
    expect(PlayerView.choices(s.campaign).some(c => c.choice.name === how.ways[0]!.label)).toBe(false);
    expect(Marvels.told(await Marvels.act(s, /^Look closely at the /))).toContain(how.seen);
    const pole = how.ways.find(w => w.needing === 'pole')!;
    const sprung = Marvels.told(await Marvels.act(s, new RegExp(`^${pole.label.replace(/[()]/g, '.')}$`)));
    expect(sprung.join(' ')).toContain('has gone off, and is spent');
    expect(Marvels.body(s).state.hp).toBe(hp);
    expect(PlayerView.choices(s.campaign).some(c => c.choice.id.startsWith(`go(${way},`))).toBe(true);
  }, 60000);

  it('says what hurt whoever risks a trap: what it did, and the wound', async () => {
    const s = await Marvels.start(), snare = Marvels.things(s, /_snare$/)[0]!;
    const way = s.campaign.world.one('on', snare)!, from = s.campaign.world.related('connects', way)[0]!.args[1]!;
    GeneratedWorld.put(s, from.replace('region__', ''));
    await s.perform('wait');
    const hp = Marvels.body(s).state.hp, told = Marvels.told(await Marvels.act(s, /^Risk the /));
    const trap = Object.values(world.traps).find(t => told.includes(`${t.text}.`));
    expect(trap).toBeDefined();
    if (Marvels.body(s).state.hp < hp) { expect(told.some(l => /takes \d+ \w+ damage/.test(l))).toBe(true); }
  }, 60000);
});
