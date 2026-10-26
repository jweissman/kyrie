import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { CreatureSchema } from '../src/creature';
import { Creation } from '../src/rules/creation';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';
import { ModuleWriter } from '../src/lang/module-writer';
import type { CreatureStore } from '../src/creature-store';

// A protagonist's qualities are six rolls of three dice, placed by the player on the creation page, with what their
// people and calling add: the cold playtest saw its rolled qualities and could not place them (CMB-03).
describe('qualities placed at creation', () => {
  const rolled = { strength: 8, dexterity: 17, constitution: 12, intelligence: 9, wisdom: 14, charisma: 11 };
  it('are the rolls as placed, with what the people and the calling add', () => {
    const wenna = new Content('placed').createCreature('wenna', { raceId: 'human', classId: 'warrior', rolled });
    const adds = Creation.chassis('human', 'warrior').attributes;
    expect(CreatureSchema.attributes.map(q => wenna.base[q]))
      .toEqual(CreatureSchema.attributes.map(q => rolled[q] + (adds[q] ?? 0)));
  });
  it('are rolled for a drawn country\'s protagonist, the same for the same country', () => {
    const once = Content.rolls('wren'), again = Content.rolls('wren');
    expect(once).toEqual(again);
    expect(Object.keys(once).sort()).toEqual([...CreatureSchema.attributes].sort());
    expect(Object.values(once).every(v => v >= 3 && v <= 18)).toBe(true);
  });
  it('set out with the company, as they were placed', async () => {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior', rolled }] });
    const s = await PlaySession.start(w.path, 'wren', w.source);
    const wenna = s.campaign.readout.creatures.find(c => c.id === s.campaign.state.partyIds[0])!;
    const adds = Creation.chassis('human', 'warrior').attributes;
    expect([wenna.base.strength, wenna.base.dexterity]).toEqual([rolled.strength + (adds.strength ?? 0),
      rolled.dexterity + (adds.dexterity ?? 0)]);
  }, 120000);
  it('are six rolls of three dice, one on each quality, or none', async () => {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior', rolled: { ...rolled, strength: 19 } }] });
    await expect(PlaySession.start(w.path, 'wren', w.source)).rejects.toThrow('Place one roll of three dice');
  }, 120000);
});

// Someone who would join the company is seen as they would come, before they are asked: what they are and ask, how
// they fight, and what they can do (CMB-07). mere's traveller at Faennsīe's inn, once asked what brings them.
describe('a recruit seen before hiring', () => {
  it('shows what they are, what they ask, how they fight and what they can do', async () => {
    const w = await WorldAssembler.assemble('mere', NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'mere', w.source), c = s.campaign;
    GeneratedWorld.put(s, c.world.one('at', 'region__s1_traveller')!.replace(/^region__/, ''));
    await s.perform('wait');
    const brings = PlayerView.choices(c).find(x => /^Ask .* what brings/.test(x.choice.name))!;
    await s.perform(brings.choice.id);
    const row = ScreenModel.build(c).people.find(p => p.id === 'region__s1_traveller')!;
    expect(row.recruit).toMatchObject({ level: 1, hire: 3 });
    expect(row.recruit!.sheet.fighting.map(b => b.label)).toContain('Hit points');
    expect(row.recruit!.techniques.length).toBeGreaterThan(0);
    expect(row.recruit!.line).toMatch(/^[a-z]+ [a-z]+$/);
    // Hired, they cost their hire, and no more or less: what they had of their own stays theirs (RD-B6: the company's
    // silver went from 60 to 66 on hiring Teshen for 2).
    const store = (c as unknown as { creatures: CreatureStore }).creatures;
    const lease = store.acquire(c.readout.inhabitants['region__s1_traveller']!);
    try {
      lease.creatures.forEach(x => { x.state.gold = 9; });
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    const coin = () => c.world.number(ModuleWriter.call('quantity', 'party', 'gold')), before = coin();
    await s.perform(PlayerView.choices(c).find(x => /^recruit\(.*s1_traveller/.test(x.choice.id))!.choice.id);
    expect([c.state.partyIds.length, coin()]).toEqual([2, before - 3]);
  }, 120000);
});
