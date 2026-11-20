import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Canon } from '../../src/canon/canon';
import { Content, type CreatureGenerationContext } from '../../src/content';
import { PlayerView } from '../../src/presentation/player-view';
import type { CombatEvent } from '../../src/model';
import type { CreatureStore } from '../../src/creature-store';
import { Items } from '../../src/campaign/items';
import { FieldUse } from '../../src/campaign/field-use';

// The planes in play (GT-01..03; mission-22 brief Phase 4A: "Plane Shift and genuine planar laws, with persistent
// location and consequences"). An inner plane's law does what its element does, through the ordinary damage pipeline:
// at the end of each turn in a fight, and each watch out of one (PlaneLaws); a ward against its kind of harm stops it.
// Plane Shift is the kernel's typed travel effect, cast outside a fight by the canon's act, and the engine sets the
// company down on the named plane's threshold (Campaign.carry). A tiny world with the canon (data/imbar) installed.
const world = (start: string, extra = '') => `
  Place vale "the probe vale" is region within imbar.
  Place hamlet "the hamlet" is settlement within vale at 0, 0.
  Place hall "the hall of doors" is room within hamlet at 0, 0.
  Company party "You" of 1 at ${start}.
  ${extra}`;
const inner = ['fire', 'air', 'earth', 'water', 'positive', 'negative'];
const canon = ['imbar', ...inner.map(p => `inner_${p}_threshold`)];
const ama: CreatureGenerationContext = { name: 'Ama', raceId: 'human', classId: 'warrior', level: 3 };
// A conjurer of the thirteenth level, who can cast a seventh-level spell and knows Plane Shift.
const ysabel: CreatureGenerationContext = { name: 'Ysabel', raceId: 'human', classId: 'mage', level: 13,
  traits: ['conjurer'] };
const start = (at: string, party = [ama], extra = '') => Tiny.start(world(at, extra), { party, canon });
const hp = (t: Tiny, i = 1) => t.campaign.readout.creatures.find(c => c.id === `t__party_${i}`)!.state.hp;
const hurt = (t: Tiny, i: number, hp: number) => {
  const lease = (t.campaign as unknown as { creatures: CreatureStore }).creatures.acquire([`t__party_${i}`]);
  try { lease.creatures[0]!.state.hp = hp; lease.commit(lease.creatures); } finally { lease.release(); }
};
const lay = (t: Tiny, status: string) => {
  const lease = (t.campaign as unknown as { creatures: CreatureStore }).creatures.acquire(['t__party_1']);
  try {
    lease.creatures[0]!.state.conditions.push({ id: status, remaining: 12, clock: 'world-time' });
    lease.commit(lease.creatures);
  } finally { lease.release(); }
};
// Plane Shift learned and in her seventh-level slot, as a conjurer of her level prepares it (see raise-afield).
// One of the eleventh level knows it and has no slot to cast it from.
const prepared = (t: Tiny, slot = true) => {
  const lease = (t.campaign as unknown as { creatures: CreatureStore }).creatures.acquire(['t__party_1']);
  try {
    const s = lease.creatures[0]!.state;
    s.learnedAbilities.push('plane_shift');
    if (slot) { s.ready![6] = ['plane_shift']; s.prepared![6] = ['plane_shift']; }
    lease.commit(lease.creatures);
  } finally { lease.release(); }
  return t.play('Wait a while');
};
const told = (t: Tiny): CombatEvent[] => t.campaign.events.at(-1)!.combat;
const names = (t: Tiny) => PlayerView.choices(t.campaign).map(r => r.choice.name);

describe('the planes\' laws and Plane Shift', () => {
  it('gives every inner plane a law, every harmful one an element, and says which elements an ability wards', () => {
    const law = (plane: string) => Canon.conditions[`plane_${plane}`]!;
    expect(inner.every(p => law(p)?.law)).toBe(true);
    const harms = inner.flatMap(p => (law(p).modifiers.onTurnEnd ?? []).filter(x => x.kind === 'damage')
      .map(x => [p, x.damageType!] as const));
    expect(harms).toEqual([['fire', 'fire'], ['water', 'cold'], ['negative', 'necrotic']]);
    // A ward: a condition halving that harm (which stops a law's one point), laid by an ability the catalogue has.
    const wards = (type: string) => Object.entries(Canon.conditions)
      .filter(([, c]) => (c.modifiers.resistances?.[type] ?? 0) >= 0.5).map(([id]) => id)
      .filter(id => Content.abilities.some(a => a.effects.some(e => e.kind === 'apply' && e.status === id)));
    // The Water's cold has its ward too: the cold ward a sealskin focus grants (GT-01; it had none before).
    expect(harms.map(([, type]) => wards(type).length > 0)).toEqual([true, true, true]);
    expect((law('positive').modifiers.onTurnEnd ?? []).map(x => x.kind)).toEqual(['heal']);
  });

  // The canon's three planes beyond Orsino's nine (GT-03) are under laws of their own, as the nine are: each is a
  // spell DC held by whoever fights there.
  it('puts every outer plane under a law, the Abyss, Nirvana and the Mount of the Exalted among them', async () => {
    const outer = ['arcadia', 'cthell', 'gehenna', 'hades', 'limbo', 'mechanus', 'pandemonium', 'ysgard', 'zephyrus',
      'abyss', 'nirvana', 'exalted'];
    const t = await Tiny.start(world('hall'), { party: [ama], canon: ['imbar', ...outer.map(p => `outer_${p}`)] });
    const laws = outer.map(p => t.world.one('law', `outer_${p}`));
    expect(laws.every(l => !!l && Canon.conditions[l]?.law)).toBe(true);
    expect(laws.slice(-3).map(l => Canon.conditions[l!]!.modifiers.bonusSpellDC)).toEqual([-1, 1, 1]);
  });

  it('burns the company a little each watch it stands in the Fire, and not in Imbar', async () => {
    const fire = await start('inner_fire_threshold'), vale = await start('hall'), before = hp(fire);
    await fire.play('Wait an hour');
    await vale.play('Wait an hour');
    const burns = told(fire).filter(e => e.type === 'damage' && e.damageType === 'fire');
    expect(burns.length).toBeGreaterThan(1);
    expect(hp(fire)).toBe(before - burns.reduce((n, e) => n + (e.type === 'damage' ? e.amount : 0), 0));
    expect(hp(vale)).toBe(before);
    // It is the ordinary harm, told as the law's.
    expect(burns.every(e => e.type === 'damage' && e.actor === 'plane_fire')).toBe(true);
    // Told once for the hour, in all: it had been "You take 1 fire damage" a line for each watch.
    const page = fire.journey.taken.at(-1)!.page;
    expect(page).toContain(`You take ${burns.length} fire damage in all, a watch at a time`);
    expect(page.match(/fire damage/g)).toHaveLength(1);
  });

  it('does on each inner plane what its element does: an hour on each threshold, and an hour warded', async () => {
    const hour = async (plane: string, ward?: string) => {
      const t = await start(`inner_${plane}_threshold`), whole = hp(t);
      hurt(t, 1, whole - 3);
      if (ward) { lay(t, ward); }
      await t.play('Wait an hour');
      return hp(t) - (whole - 3);
    };
    const changed = await Promise.all(inner.map(p => hour(p)));
    expect(Object.fromEntries(inner.map((p, i) => [p, Math.sign(changed[i]!)])))
      .toEqual({ fire: -1, air: 0, earth: 0, water: -1, positive: 1, negative: -1 });
    expect(await hour('negative', 'protected')).toBe(0);
    // Death Ward, as the SRD's: the Negative's dark does not touch the warded (case 8).
    expect(await hour('negative', 'death_ward')).toBe(0);
    expect(await hour('water', 'waterproof')).toBe(0);
  });

  it('is stopped by a ward against its kind of harm, and mends in the Positive', async () => {
    // Fireproof, as a fire ward lays it, on the world's clock for two hours.
    const warded = await start('inner_fire_threshold'), before = hp(warded);
    lay(warded, 'fireproof');
    await warded.play('Wait an hour');
    expect(told(warded).filter(e => e.type === 'damage' && e.amount > 0)).toEqual([]);
    expect(hp(warded)).toBe(before);
    const positive = await start('inner_positive_threshold'), whole = hp(positive);
    hurt(positive, 1, whole - 3);
    await positive.play('Wait an hour');
    expect(hp(positive)).toBe(whole);
    const earth = await start('inner_earth_threshold');
    await earth.play('Wait an hour');
    expect(hp(earth)).toBe(whole);
  });

  // A ward a company can carry against the Water: the sealskin focus held, its cold ward raised, an hour on the
  // threshold of Water costs nothing; the focus put down, the ward cannot be raised again.
  it('is stopped in the Water by the cold ward a sealskin focus grants', async () => {
    const t = await start('inner_water_threshold'), whole = hp(t), id = 't__party_1';
    hurt(t, 1, whole - 3);
    const store = (t.campaign as unknown as { creatures: CreatureStore }).creatures;
    Items.take(store, id, { id: 'sealskin', definition: 'cold_ward_focus' }); Items.equip(store, id, 'sealskin');
    FieldUse.perform(store, [id], { ability: 'cold_ward', caster: id, target: id, seed: 'water' });
    expect(store.get(id).state.conditions.find(c => c.id === 'waterproof')).toMatchObject({ clock: 'world-time' });
    await t.play('Wait an hour');
    expect(hp(t)).toBe(whole - 3);
    Items.drop(store, id, 'sealskin');
    expect(() => FieldUse.perform(store, [id], { ability: 'cold_ward', caster: id, target: id, seed: 'again' }))
      .toThrow('Caster cannot');
  });

  it('burns everyone at the end of each turn of a fight fought in the Fire', async () => {
    const rats = 'Person band "the rats" at inner_fire_threshold { Role "what burns". Species rat. Numbers 2. }';
    const t = await start('inner_fire_threshold', [ama], rats);
    await t.play('Attack');
    const burned = new Set(told(t).flatMap(e => e.type === 'damage' && e.actor === 'plane_fire' ? [e.target] : []));
    expect(burned.has('t__party_1')).toBe(true);
    expect([...burned].some(id => /^t__band/.test(id))).toBe(true);
  });

  it('carries the company by Plane Shift to the named plane\'s threshold, for the slot, and the Fire then burns it', async () => {
    const t = await prepared(await start('hall', [ysabel]));
    expect(names(t)).toContain('Have Ysabel cast Plane Shift to the Plane of Fire');
    const ready = JSON.stringify(t.campaign.readout.creatures[0]!.state.ready);
    await t.play('Have Ysabel cast Plane Shift to the Plane of Fire');
    expect(t.where()).toBe('inner_fire_threshold');
    expect(told(t).some(e => e.type === 'travel' && e.detail === 'inner_fire_threshold')).toBe(true);
    expect(JSON.stringify(t.campaign.readout.creatures[0]!.state.ready)).not.toBe(ready);
    // Not offered again to where the company already is; offered to another plane.
    expect(names(t)).not.toContain('Have Ysabel cast Plane Shift to the Plane of Fire');
    const before = hp(t);
    await t.play('Wait an hour');
    expect(hp(t)).toBeLessThan(before);
  });

  it('is offered to no one who cannot cast it', async () => {
    expect(names(await start('hall')).filter(n => /Plane Shift/.test(n))).toEqual([]);
    const low = await prepared(await start('hall', [{ ...ysabel, level: 11 }]), false);
    expect(names(low).filter(n => /Plane Shift/.test(n))).toEqual([]);
  });
});
