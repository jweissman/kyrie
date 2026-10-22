import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { ObservationText } from '../src/lang/observation-text';
import type { CampaignEvent } from '../src/campaign/campaign-types';
import { GeneratedWorld } from './support/generated';

// What is going on in a generated region's settlements: people with something the matter, found where they live,
// that a company can find out about and do something about, and that does not wait for it. Thorn: a drover from
// Wǽtwaeter went out on the causeway road and did not come home.
class Town {
  static async start(seed = 'thorn', towns?: number) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, towns ? { towns } : {});
    return { w, s: await PlaySession.start(w.path, seed, w.source) };
  }
  static async act(s: PlaySession, pattern: RegExp): Promise<CampaignEvent> {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern} among ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); }
    return s.perform(c.choice.id);
  }
  static said(e: CampaignEvent) { return [e.response ?? '', ...(e.perceptions ?? []).map(p => p.text)].join(' '); }
}

describe('a drover who did not come home', () => {
  it('is found on the road, mourned at the inn, and his son goes with whoever found him', async () => {
    const { w, s } = await Town.start(), placed = w.report.placements.find(p => p.scenario === 'drover')!;
    const { town, road } = placed.bindings as { town: string; road: string };
    GeneratedWorld.put(s, `${town}_green`);
    await s.perform('wait');
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('A grey dog lies by the inn door');
    GeneratedWorld.put(s, road);
    await s.perform('wait');
    expect(Town.said(await Town.act(s, /^Search/))).toContain('a cart lies on its side in the ditch');
    GeneratedWorld.put(s, `${town}_green`);
    await s.perform('wait');
    expect(Town.said(await Town.act(s, /^Tell .* what you found$/))).toContain('I am coming with you');
    await Town.act(s, /to join the company$/);
    expect(s.campaign.state.party).toHaveLength(4);
    GeneratedWorld.put(s, `${town}_taproom`);
    await s.perform('wait');
    const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    expect(Town.said(await Town.act(s, /what you found on the road$/))).toContain('The dog knew');
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(gold + 6);
  }, 60000);
  it('goes out after his father himself if nobody brings word by the second evening', async () => {
    const { w, s } = await Town.start(), town = w.report.placements.find(p => p.scenario === 'drover')!.bindings.town!;
    GeneratedWorld.put(s, `${town}_green`);
    let said = '';
    while (s.campaign.state.elapsed < 210) { said += Town.said(await s.perform('wait_hour')); }
    expect(said).toContain("has taken his father's old spear and gone out on the road alone");
  }, 60000);
});

describe('a fever on the green', () => {
  it('breaks with willow bark from the road, and the sister will come with whoever brought it', async () => {
    const { w, s } = await Town.start(), placed = w.report.placements.find(p => p.scenario === 'fever')!;
    const { town, road } = placed.bindings as { town: string; road: string };
    GeneratedWorld.put(s, road);
    await s.perform('wait');
    expect(Town.said(await Town.act(s, /^Search/))).toContain('bitter, good for a fever');
    await Town.act(s, /^Collect a bundle of willow bark/);
    GeneratedWorld.put(s, `${town}_green`);
    await s.perform('wait');
    const mother = ObservationText.label(s.campaign.world, 'fever__mother');
    expect(mother).not.toContain('fever');
    expect(Town.said(await Town.act(s, new RegExp(`^Give a bundle of willow bark to ${mother}$`))))
      .toContain('By evening the fever has broken');
    expect(Town.said(await Town.act(s, /^Speak with/))).toContain('I will come');
    expect(PlayerView.choices(s.campaign).some(c => / to join the company$/.test(c.choice.name))).toBe(true);
  }, 60000);
  it('is lost on the third morning if no one brings anything', async () => {
    const { w, s } = await Town.start(), town = w.report.placements.find(p => p.scenario === 'fever')!.bindings.town!;
    GeneratedWorld.put(s, `${town}_green`);
    let said = '';
    while (s.campaign.state.elapsed < 246) { said += Town.said(await s.perform('wait_hour')); }
    expect(said).toContain('The child on the green has died');
  }, 60000);
});

describe('a stranger who pays in old coin', () => {
  it('is taken to the old place they came to read, reads its name, and would read on with you', async () => {
    const { w, s } = await Town.start('ash', 4), placed = w.report.placements.find(p => p.scenario === 'oldcoin')!;
    const { town, ruin } = placed.bindings as { town: string; ruin: string };
    GeneratedWorld.put(s, `${town}_taproom`);
    await s.perform('wait');
    expect(Town.said(await Town.act(s, /about the old coin$/))).toContain('Ten of these when we get there');
    await Town.act(s, /to come with you$/);
    await Town.act(s, /^Take the door of/);
    const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    await GeneratedWorld.travel(s, ruin);
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(gold + 10);
    // The old place's name is cut over its door; what it was, the scholar reads.
    expect(ObservationText.label(s.campaign.world, `region__${ruin}`)).not.toMatch(/^(the|a) /);
    expect(Town.said(await Town.act(s, /to read the stones$/))).toContain('The old kingdom built this');
    expect(s.campaign.world.test(ModuleWriter.call('knows', 'party', 'oldcoin__history'))).toBe(true);
    expect(PlayerView.choices(s.campaign).some(c => / to join the company$/.test(c.choice.name))).toBe(true);
  }, 60000);
});

describe('the boundary stones', () => {
  it('are set back by whoever finds the old holes, and the inn remembers it', async () => {
    const { w, s } = await Town.start('ash'), town = w.report.placements.find(p => p.scenario === 'quarrel')!.bindings.town!;
    GeneratedWorld.put(s, `${town}_taproom`);
    await s.perform('wait');
    expect(Town.said(await Town.act(s, /about the stones$/))).toContain('A stride of my garden');
    await Town.act(s, /back door of the inn/);
    expect(Town.said(await Town.act(s, /^Search/))).toContain('The stones were moved');
    GeneratedWorld.put(s, `${town}_shop`);
    await s.perform('wait');
    expect(Town.said(await Town.act(s, /about the old holes under the grass$/))).toContain('I will set them back');
    GeneratedWorld.put(s, `${town}_taproom`);
    await s.perform('wait');
    const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    await Town.act(s, /the stones are going back$/);
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(gold + 6);
  }, 60000);
  it('cost the company the inn if it takes the merchant\'s coin', async () => {
    const { w, s } = await Town.start('ash'), town = w.report.placements.find(p => p.scenario === 'quarrel')!.bindings.town!;
    GeneratedWorld.put(s, `${town}_shop`);
    await s.perform('wait');
    await Town.act(s, /five coin and say nothing$/);
    GeneratedWorld.put(s, `${town}_taproom`);
    await s.perform('wait');
    expect(PlayerView.choices(s.campaign).some(c => /^Take a bed|^Buy/.test(c.choice.name))).toBe(false);
  }, 60000);
});

