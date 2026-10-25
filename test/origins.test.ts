import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { Origins } from '../src/world/origins';

// One person comes into a generated country with a reason of their own, and the country knows them by it. a1 holds
// the drover who did not come home, so a protagonist may be his child: his wife is their mother, his son their brother,
// and they say other things to one of their own. A protagonist may instead owe a merchant thirty coin by market day,
// and be refused when the day passes; or carry a letter to a priest.
class Opening {
  static readonly wenna = { name: 'Wenna', raceId: 'human' as const, classId: 'warrior' as const };
  static async start(origin: string, seed = 'a1') {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin, party: [this.wenna] });
    return PlaySession.start(w.path, seed, w.source);
  }
  static async world(origin: string, backgroundId: string): Promise<[string, string, NodeBundleSource]> {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { origin, party: [{ ...this.wenna, backgroundId }] });
    return [w.path, 'a1', w.source as NodeBundleSource];
  }
  // A choice by its words or its command (the way into a settlement is go(…, …_green) whatever its heart is called).
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name) || pattern.test(x.choice.id));
    if (!c) { throw new Error(`No choice like ${pattern}`); }
    return s.perform(c.choice.id);
  }
}

describe('an origin', () => {
  it('is offered only where the country holds what it needs', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared);
    const offered = Origins.choices(await Origins.load(NodeBundleSource.shared), w.report.region, w.report.placements);
    expect(offered.map(o => o.id)).toEqual(['kin', 'order', 'debt', 'wanderer']);
    // The drover's family lives where the drover's story is set: a settlement with an inn to mourn him in.
    const home = w.report.region.settlements.find(t => t.id === w.report.placements.find(p => p.scenario === 'drover')!.bindings.town)!;
    expect(offered[0]!.choice).toContain(`Your father, a drover of ${home.name}`);
  }, 60000);
  it('makes the protagonist what its story says they are; one over the hills keeps the trade they chose', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared);
    const offered = Origins.choices(await Origins.load(NodeBundleSource.shared), w.report.region, w.report.placements);
    expect(Object.fromEntries(offered.map(o => [o.id, o.background]))).toEqual(
      { kin: 'herdsman', order: 'scribe', debt: 'trader', wanderer: undefined });
    const as = async (origin: string) => {
      const s = await PlaySession.start(...await Opening.world(origin, 'mercenary'));
      return s.campaign.readout.creatures.find(c => s.campaign.readout.partyIds.includes(c.id))!.backgroundId;
    };
    expect([await as('order'), await as('wanderer')]).toEqual(['scribe', 'mercenary']);
  }, 60000);
  it('over the hills, arrives as the town\'s own trouble is happening, and so knows of it', async () => {
    const s = await Opening.start('wanderer', 'wren'), first = PlayerView.observe(s.campaign).observations.map(o => o.text);
    expect(first.some(t => /has anyone on the road herbs\? The child has had a fever/.test(t))).toBe(true);
    expect(s.campaign.world.test(ModuleWriter.call('knows', 'party', 'fever__sick'))).toBe(true);
    // It is the arrival, and is not there once the company is about its business.
    await Opening.take(s, /^Wait a while$/);
    expect(PlayerView.observe(s.campaign).observations.some(o => /anyone on the road herbs/.test(o.text))).toBe(false);
  }, 60000);
  it('begins with one person, on the way in, told who they are and why they came', async () => {
    const s = await Opening.start('kin'), screen = ScreenModel.build(s.campaign);
    expect(screen.party.map(m => m.name)).toEqual(['Wenna']);
    expect(screen.place.name).toMatch(/^the causeway into /);
    expect(Narrator.leaf(s.campaign, screen).situation.join(' ')).toContain('Your father went out on the road with the cart');
  }, 60000);
  it('makes the drover\'s family the protagonist\'s own', async () => {
    const s = await Opening.start('kin');
    await Opening.take(s, /_green\)$/);
    const screen = ScreenModel.build(s.campaign);
    const son = screen.people.find(p => p.id === 'drover__son')!, name = son.name.split(',')[0]!;
    expect(son.says?.join(' ')).toContain('Your brother is sitting on a rail');
    expect(PlayerView.choices(s.campaign).some(c => new RegExp(`^Ask ${name} about his father`).test(c.choice.name))).toBe(false);
    const told = await Opening.take(s, new RegExp(`^Ask ${name} what he means to do`));
    expect(told.response).toContain('If you are going, I am coming with you');
    expect(s.campaign.world.test(ModuleWriter.call('willing', 'drover__son', 'party'))).toBe(true);
  }, 60000);
  // Found playing cov11 as the drover's child: telling the mother was "Ian does not sit down", by the name the
  // company was never told her by, and what it was worth was named twice over.
  it('has the protagonist tell their mother as their mother, and says once what was seen through', async () => {
    const s = await Opening.start('kin');
    await Opening.take(s, /_green\)$/);
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'drover__found_cart') }]));
    await Opening.take(s, /_taproom\)$/);
    const told = await Opening.take(s, /^Tell your mother what you found on the road$/);
    expect(told.response).toStartWith('Your mother does not sit down.');
    expect(told.combat.filter(e => e.type === 'gain').map(e => e.type === 'gain' && e.detail))
      .toContain('experience: the drover who did not come home, seen through');
  }, 60000);
  // The follow-up review: the brother knelt by the cart, and then was to be told what was found there.
  it('does not have the brother told what he knelt beside', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { origin: 'kin', party: [Opening.wenna] });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    const road = w.report.placements.find(p => p.scenario === 'drover')!.bindings.road!;
    await Opening.take(s, /_green\)$/);
    const name = ScreenModel.build(s.campaign).people.find(p => p.id === 'drover__son')!.name.split(',')[0]!;
    await Opening.take(s, new RegExp(`^Ask ${name} what he means to do`));
    await Opening.take(s, new RegExp(`^Ask ${name} to join`));
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', `region__${road}`) }]));
    await s.perform('wait');
    await Opening.take(s, /^Search/);
    expect(s.campaign.world.test(ModuleWriter.call('knows', 'party', 'drover__son_knelt'))).toBe(true);
    expect(PlayerView.choices(s.campaign).some(x => /what you found/.test(x.choice.name))).toBe(false);
  }, 60000);
  // The follow-up review: the brother's portrait became an initial as he joined the company.
  it('keeps the brother\'s face when he joins the company', async () => {
    const w = await WorldAssembler.assemble('cov11', NodeBundleSource.shared, { origin: 'kin', party: [Opening.wenna] });
    const s = await PlaySession.start(w.path, 'cov11', w.source);
    await Opening.take(s, /^Take the road to the landing/);
    const brother = () => ScreenModel.build(s.campaign).people.find(p => p.id === 'drover__son')!;
    const met = brother(), name = met.name.split(',')[0]!;
    expect(met.portrait).toBeDefined();
    await Opening.take(s, new RegExp(`^Ask ${name} what he means to do`));
    await Opening.take(s, new RegExp(`^Ask ${name} to join`));
    expect(brother().companion).toBe(true);
    expect(brother().portrait?.src).toBe(met.portrait!.src);
  }, 60000);
  // The follow-up review asked for more time and found it owed five coin more: the terms are said, then taken or not.
  it('says the terms of more time before they are taken', async () => {
    const s = await Opening.start('debt');
    const owed = () => s.campaign.world.number(ModuleWriter.call('origin__owed', 'origin__loan'));
    const before = owed();
    const asked = await Opening.take(s, /^Ask .* for five days more$/);
    expect(asked.response ?? '').toContain('five coin more');
    expect(owed()).toBe(before);
    await Opening.take(s, /^Take the five days, for five coin more$/);
    expect(owed()).toBe(before + 5);
  }, 60000);
  it('holds a debt that comes due', async () => {
    const s = await Opening.start('debt');
    expect(ScreenModel.build(s.campaign).objectives.join(' ')).toContain('You owe Mik at Murkstede 30 coin, by market day');
    for (let n = 0; n < 30 && !s.campaign.world.test(ModuleWriter.call('origin__called', 'party')); n++) {
      const until = PlayerView.choices(s.campaign).find(c => ['wait_for_dark', 'wait_for_light'].includes(c.choice.id));
      await s.perform(until?.choice.id ?? 'wait_hour');
    }
    expect(s.campaign.world.test(ModuleWriter.call('refusesService', 'region__s1_merchant', 'party'))).toBe(true);
  }, 120000);
});
