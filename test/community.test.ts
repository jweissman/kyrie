import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { SceneModel } from '../src/ui/scene';
import { Communities } from '../src/world/community/community';
import { RegionGrowth } from '../src/world/region-growth';
import { GeneratedWorld } from './support/generated';
import type { Region } from '../src/world/region-writer';

// A settlement is the people who live in it: at their work by day, at the inn or at home of an evening, indoors at
// night; with animals about the place that can be made much of; and a small trouble a stranger could help with. What
// grows wild grows where the land lets it. Thorn: Merscheald, a town that lives by eels, by the Sealtbrōc.
class Settled {
  static async start(origin = 'wanderer') {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared,
      { origin, party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return { w, s: await PlaySession.start(w.path, 'thorn', w.source) };
  }
  // A choice by its words, or by its command (the way to a settlement's heart is go(…, …_green), whatever the heart is
  // called: a green, a ford, a gate-yard).
  static async act(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name) || pattern.test(x.choice.id));
    if (!c) { throw new Error(`No ${pattern} among ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); }
    return s.perform(c.choice.id);
  }
  static at(s: PlaySession, id: string) { return s.campaign.world.one('at', `region__${id}`); }
  // Goes to each of some people where they are until one offers a choice like the pattern.
  static async find(s: PlaySession, people: { id: string }[], pattern: RegExp) {
    for (const r of people) {
      GeneratedWorld.put(s, this.at(s, r.id)!.replace(/^region__/, ''));
      await s.perform('wait');
      const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
      if (c) { return c; }
    }
    return undefined;
  }
  static async until(s: PlaySession, hour: number) {
    while (Math.floor((8 * 60 + s.campaign.state.elapsed * 10) / 60) % 24 !== hour) { await s.perform('wait'); }
  }
  static region(w: Awaited<ReturnType<typeof WorldAssembler.assemble>>): Region { return w.report.region as Region; }
}

describe('a settlement is the people who live in it', () => {
  it('lives by its trade: its people work at it, each where the work is done', async () => {
    const { w } = await Settled.start(), region = Settled.region(w), s = region.settlements[0]!;
    const c = Communities.plan(region, s);
    expect(c.residents.length).toBe(Communities.sizes[s.size]!);
    expect(c.residents.some(r => r.work.trades?.includes(s.trade))).toBe(true);
    expect(new Set(c.residents.map(r => r.name)).size).toBe(c.residents.length);
    for (const r of c.residents.filter(x => x.workplace)) {
      expect(c.workplaces.map(x => x.id)).toContain(r.workplace!);
    }
    // The same country has the same people.
    expect(Communities.plan(region, s).residents.map(r => r.name)).toEqual(c.residents.map(r => r.name));
  }, 60000);

  it('keeps a day: at work by day, at the inn or home of an evening, indoors at night', async () => {
    const { w, s } = await Settled.start(), region = Settled.region(w), town = region.settlements[0]!;
    const c = Communities.plan(region, town), worker = c.residents.find(r => r.workplace)!;
    const drinker = c.residents.find(r => r.evening === 'inn');
    await s.perform('wait');
    expect(Settled.at(s, worker.id)).toBe(`region__${worker.workplace}`);
    await Settled.until(s, 19);
    if (drinker) { expect(Settled.at(s, drinker.id)).toBe(`region__${town.id}_taproom`); }
    await Settled.until(s, 23);
    expect(Settled.at(s, worker.id)).toBe(`region__${town.id}_houses`);
  }, 120000);

  it('has animals about the place, real ones, that can be made much of', async () => {
    const { s } = await Settled.start();
    await Settled.act(s, /_green\)$/);
    const scene = SceneModel.build(ScreenModel.build(s.campaign));
    const dog = scene.subjects.find(x => x.kind === 'animal' && x.id.endsWith('_inndog'))!;
    expect(dog.choices.map(c => c.label)).toEqual(['Make much of']);
    const e = await Settled.act(s, new RegExp(`^Make much of ${dog.name}$`));
    expect(e.voiced?.[0]?.id).toMatch(/^pet\.dog\./);
  }, 60000);

  it('has a small trouble a stranger can help with, and is glad of it', async () => {
    const { w, s } = await Settled.start(), region = Settled.region(w);
    const town = region.settlements.find(x => Communities.plan(region, x).concern?.kind === 'strayed')!;
    const c = Communities.plan(region, town), owner = c.residents.find(r => r.id === c.concern!.resident)!;
    const goat = c.animals.find(a => a.id === c.concern!.animal)!;
    GeneratedWorld.put(s, Settled.at(s, goat.id)!.replace(/^region__/, ''));
    await s.perform('wait');
    await Settled.act(s, new RegExp(`^Ask ${goat.name} to come with you$`));
    const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    while (Settled.at(s, goat.id) !== `region__${town.id}_green`) {
      const home = PlayerView.choices(s.campaign).find(x => x.choice.id.endsWith(`region__${town.id}_green)`));
      if (!home) { break; }
      await s.perform(home.choice.id);
    }
    await s.perform('wait');
    expect(s.campaign.world.test(ModuleWriter.call('grateful', `region__${owner.id}`, 'party'))).toBe(true);
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(gold + 1);
  }, 120000);
});

describe('names', () => {
  // Found in a1, where an Avice kept geese at Murkstede and cut wood at Wǽttún, and in wren, where Gothgiba had two
  // Rangrims. Nobody in a country shares a name: townsfolk, the people of each settlement, its shopkeepers and the
  // travellers on its roads; when a people's names have all been given, a name given again comes with a family's.
  it('are not shared by two people in one country', async () => {
    for (const seed of ['a1', 'wren', 'b2']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
        { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
      const s = await PlaySession.start(w.path, seed, w.source);
      const named = s.campaign.module.entities.filter(e => e.type === 'group' && /^region__(s\d+_|.*_way_t$)/.test(e.id)
        && /^[A-Z]/.test(e.name) && !/(dog|cat|goat|cow|hen)$/.test(e.id)).map(e => e.name.split(', ')[0]!);
      expect(named.filter((n, i) => named.indexOf(n) !== i).map(n => `${seed} ${n}`)).toEqual([]);
    }
  }, 120000);
});

describe('what grows wild', () => {
  it('grows where the land lets it: willows only by water', async () => {
    const { w } = await Settled.start(), region = Settled.region(w);
    for (const place of RegionGrowth.places(region)) {
      const habitats = RegionGrowth.habitats(region, place.cells);
      const willow = RegionGrowth.lines(region).some(l => l.includes(`Thing ${place.id}_willow `));
      if (willow) { expect(habitats.has('riverbank')).toBe(true); }
    }
    expect(RegionGrowth.lines(region).some(l => /_willow "the willow"/.test(l))).toBe(true);
  }, 60000);
  // Playing cov13, the barrow's switch wanted a ten-foot pole, and no town near sold one; the willows by the road
  // give one to whoever cuts it.
  it('gives a long pole from the willows, as well as their bark', async () => {
    const { w } = await Settled.start(), lines = RegionGrowth.lines(Settled.region(w));
    expect(lines.some(l => /_willow_cut1 "a long willow pole" is pole in /.test(l))).toBe(true);
  }, 60000);
});

describe('family', () => {
  it('is named as family', async () => {
    const { s } = await Settled.start('kin');
    await Settled.act(s, /_green\)$/);
    const names = ScreenModel.build(s.campaign).people.map(p => p.name);
    expect(names).toContainEqual(expect.stringMatching(/, your brother$/));
  }, 60000);
});

describe('what people know by their work', () => {
  it('someone who works by the water says where the willow grows, and it does', async () => {
    const { w, s } = await Settled.start('herbs'), region = Settled.region(w);
    // Sought among the country's people, not assumed on the first green: it returned early there, having tested nothing
    // (the review of 483e3af).
    const ask = await Settled.find(s, region.settlements.flatMap(t => Communities.plan(region, t).residents),
      / where willow grows$/);
    expect(ask).toBeDefined();
    const told = await s.perform(ask!.choice.id);
    const said = told.response ?? '';
    const named = RegionGrowth.places(region).filter(p => said.includes(p.name));
    expect(named.length).toBeGreaterThan(0);
    for (const p of named) { expect(RegionGrowth.habitats(region, p.cells).has('riverbank')).toBe(true); }
  }, 60000);
  it('someone who has done the same kind of work knows the company for it', async () => {
    // Somewhere in the country someone does the herbalist's work, and knows one of their own.
    const { w, s } = await Settled.start('herbs'), region = Settled.region(w);
    const shop = await Settled.find(s, region.settlements.flatMap(t => Communities.plan(region, t).residents),
      /^Talk shop with /);
    expect(shop).toBeDefined();
    const rations = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'rations'));
    await s.perform(shop!.choice.id);
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'rations'))).toBe(rations + 1);
  }, 60000);
});
