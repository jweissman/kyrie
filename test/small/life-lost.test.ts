import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';
import { Obituary } from '../../src/narrative/obituary';
import type { CreatureStore } from '../../src/creature-store';

// The one who plays dies, and the story ends (OR-683, cold play 2 of 25 November): Brokk was down after a fight, the
// four led with "Rest six hours", and at the rest he did not come round ("they have died where they fell"); then no
// ending, his ranger offered his axe. Now a rest is never led with while one of the company lies senseless (it is the
// roll that kills them; the way back is led), and the one who plays, dead, ends the life with the ending's words,
// unless one of the company can raise them where they lie.
const glade = `
  Place glade "the glade" is room at 0, 0 outdoors.
  Initially Assert restful(glade).
  Company party "You" of 2 at glade.
  Initially Set quantity(party, rations) to 4.
  Goal false.`;
const two = (cleric: boolean) => [{ name: 'Brokk', raceId: 'dwarf' as const, classId: 'warrior' as const },
  cleric ? { name: 'Aud', raceId: 'human' as const, classId: 'cleric' as const, level: 7, traits: ['vitalist'] }
    : { name: 'Warren', raceId: 'human' as const, classId: 'warrior' as const }];
// Brokk down (senseless) or dead; Aud, where she comes, with Raise Dead prepared.
const fallen = async (o: { slain?: boolean; cleric?: boolean; seed?: string }) => {
  const t = await Tiny.start(glade, { party: two(!!o.cleric), ...o.seed ? { seed: o.seed } : {} });
  const store = (t.campaign as unknown as { creatures: CreatureStore }).creatures;
  const ids = t.campaign.readout.partyIds, lease = store.acquire([...ids]);
  try {
    const [b, a] = lease.creatures as [typeof lease.creatures[0], typeof lease.creatures[0]];
    b.state.hp = 0;
    if (o.slain) { b.state.conditions.push({ id: 'slain', remaining: 1, clock: 'until-removed' }); }
    if (o.cleric) {
      a.state.learnedAbilities.push('raise_dead'); a.state.ready![3] = ['raise_dead']; a.state.prepared![3] = ['raise_dead'];
    }
    lease.commit(lease.creatures);
  } finally { lease.release(); }
  t.campaign.refreshProjection();
  return t.look();
};
const rest = (t: Tiny) => PlayerView.choices(t.campaign).find(r => /^Rest/.test(r.choice.name))!;

describe('the one who plays, fallen', () => {
  it('is never led to a rest while they lie senseless, though one is offered', async () => {
    const t = await fallen({});
    expect(t.campaign.running).toBe(true);
    expect(rest(t)).toBeDefined();
    expect(t.glance.acts.filter(a => /^Rest/.test(a.label))).toEqual([]);
  });
  it('dead, ends the life, unless one of the company can raise them there', async () => {
    const dead = await fallen({ slain: true });
    expect(dead.campaign.running).toBe(false);
    expect(Obituary.ending(dead.campaign).title).toBe('Brokk is dead');
    expect((await fallen({ slain: true, cleric: true })).campaign.running).toBe(true);
  });
  it('not come round at a rest, ends it, and the ending says so', async () => {
    // A seed whose d20 for Brokk's system shock fails (FieldUse.shock), found by trying them in turn.
    for (let n = 0; n < 40; n++) {
      const t = await fallen({ seed: `shock${n}` });
      await t.perform(rest(t).choice.id);
      if (t.campaign.readout.creatures.find(c => c.name === 'Brokk')!.state.hp > 0) { continue; }
      const ending = Obituary.ending(t.campaign);
      expect([t.campaign.running, ending.title]).toEqual([false, 'Brokk is dead']);
      expect(ending.lines.join(' ')).toMatch(/Brokk did not come round, at the glade, .*, and has died of their wounds\./);
      return;
    }
    throw new Error('no seed failed the system shock');
  });
});
