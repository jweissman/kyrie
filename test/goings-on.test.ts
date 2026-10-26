import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { ObservationText } from '../src/lang/observation-text';
import type { CampaignEvent } from '../src/campaign/campaign-types';
import { GeneratedWorld } from './support/generated';
import { ActionFeedbackView } from '../src/presentation/action-feedback';

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
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('A grey dog lies by the door of');
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
  // Found playing cov11 as his own family: making much of the dog told its coat twice, what the hand finds and at
  // once the short of it that the place keeps from then on.
  it('has its dog tell once what it has been through', async () => {
    const { w, s } = await Town.start(), town = w.report.placements.find(p => p.scenario === 'drover')!.bindings.town!;
    GeneratedWorld.put(s, `${town}_green`);
    await s.perform('wait');
    const before = PlayerView.observe(s.campaign), event = await Town.act(s, /^Make much of the grey dog$/);
    const told = ActionFeedbackView.read(s.campaign, event, before).observations;
    expect(told.filter(t => /ditch-mud/.test(t))).toHaveLength(1);
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text))
      .toContain('Her coat is stiff with black ditch-mud to the belly.');
  }, 60000);
  // The follow-up review took the drover's knife, and the road still said it was in his belt.
  it('has his knife in his belt until it is taken', async () => {
    const { w, s } = await Town.start(), placed = w.report.placements.find(p => p.scenario === 'drover')!;
    GeneratedWorld.put(s, placed.bindings.road!);
    await s.perform('wait');
    await Town.act(s, /^Search/);
    const seen = () => PlayerView.observe(s.campaign).observations.map(o => o.text);
    expect(seen()).toContain('His knife is still in his belt.');
    await Town.act(s, /^Collect a drover's knife/);
    expect(seen()).not.toContain('His knife is still in his belt.');
    expect(seen().join(' ')).not.toContain('knife');
  }, 60000);
  // The follow-up review found nothing to do for him but read that he was there. What becomes of him is the
  // company's to choose and the family's to hear, and there is somewhere to stand a while, later.
  it('is covered where he lies and fetched home, or buried by the road; either way there is a grave to stand at', async () => {
    const { w, s } = await Town.start(), placed = w.report.placements.find(p => p.scenario === 'drover')!;
    const { town, road } = placed.bindings as { town: string; road: string };
    const seen = () => PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ');
    GeneratedWorld.put(s, road);
    await s.perform('wait');
    await Town.act(s, /^Search/);
    await Town.act(s, /^Cover him with the cart's sheet/);
    expect(seen()).toContain('his whip stands up in the bank');
    GeneratedWorld.put(s, `${town}_taproom`);
    await s.perform('wait');
    expect(Town.said(await Town.act(s, /what you found on the road$/))).toContain('we will go for him in the morning');
    await Town.act(s, /^Wait until dark$/);
    await Town.act(s, /^Wait until first light$/);
    GeneratedWorld.put(s, `${town}_green`);
    await s.perform('wait');
    expect(seen()).toContain('there is a new grave, with a drover\'s whip laid along it');
    expect(Town.said(await Town.act(s, /^Stand a while at the grave$/))).toContain('nothing needs saying');
    const other = await Town.start();
    GeneratedWorld.put(other.s, road);
    await other.s.perform('wait');
    await Town.act(other.s, /^Search/);
    await Town.act(other.s, /^Bury him by the road/);
    expect(PlayerView.observe(other.s.campaign).observations.map(o => o.text))
      .toEqual(expect.arrayContaining([expect.stringContaining('a cairn of ditch-stones'),
        expect.stringContaining('His knife lies on the cairn')]));
    GeneratedWorld.put(other.s, `${town}_taproom`);
    await other.s.perform('wait');
    expect(Town.said(await Town.act(other.s, /what you found on the road$/))).toContain('He would like that');
    GeneratedWorld.put(other.s, road);
    await other.s.perform('wait');
    expect(PlayerView.choices(other.s.campaign).map(c => c.choice.name)).toContain('Stand a while at the grave');
  }, 90000);
  it('goes out after his father himself if nobody brings word by the second evening', async () => {
    const { w, s } = await Town.start(), town = w.report.placements.find(p => p.scenario === 'drover')!.bindings.town!;
    GeneratedWorld.put(s, `${town}_green`);
    let said = '';
    while (s.campaign.state.elapsed < 210) { said += Town.said(await s.perform('wait_hour')); }
    expect(said).toContain("has taken his father's old spear and gone out on the road alone");
  }, 60000);
});

describe('a fever on the green', () => {
  it('breaks with willow bark from the road by the water, and the sister will come with whoever brought it', async () => {
    const { w, s } = await Town.start(), placed = w.report.placements.find(p => p.scenario === 'fever')!;
    const { town, road } = placed.bindings as { town: string; road: string };
    // The road the mother remembers runs by water, and willows grow there as she said, for anyone to gather.
    GeneratedWorld.put(s, road);
    expect(Town.said(await s.perform('wait'))).toContain('Willows lean out over the water');
    await Town.act(s, /^Gather some willow bark/);
    GeneratedWorld.put(s, `${town}_green`);
    await s.perform('wait');
    const mother = ObservationText.label(s.campaign.world, 'fever__mother');
    expect(mother).not.toContain('fever');
    expect(Town.said(await Town.act(s, new RegExp(`^Give some willow bark to ${mother}$`))))
      .toContain('By evening the fever has broken');
    expect(Town.said(await Town.act(s, /^Speak with/))).toContain('I will come');
    expect(PlayerView.choices(s.campaign).some(c => / to join the company$/.test(c.choice.name))).toBe(true);
  }, 60000);
  it('is lost on the third morning if no one brings anything', async () => {
    const { w, s } = await Town.start(), town = w.report.placements.find(p => p.scenario === 'fever')!.bindings.town!;
    GeneratedWorld.put(s, `${town}_green`);
    let said = '';
    // The third morning: first light on day 3 is the 276th watch.
    while (s.campaign.state.elapsed < 280) { said += Town.said(await s.perform('wait_hour')); }
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
    await GeneratedWorld.travel(s, `${town}_green`);
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
    // Offered first, when the stones are asked about; then taken.
    expect(PlayerView.choices(s.campaign).some(c => /five coin and say nothing$/.test(c.choice.name))).toBe(false);
    await Town.act(s, /about the stones$/);
    await Town.act(s, /five coin and say nothing$/);
    GeneratedWorld.put(s, `${town}_taproom`);
    await s.perform('wait');
    expect(PlayerView.choices(s.campaign).some(c => /^Take a bed|^Buy/.test(c.choice.name))).toBe(false);
  }, 60000);
});


// The drover's son as a companion of his own (M16's deepening: one companion with a perspective, a memory and people of
// his own): come home to mere as his brother or sister, he remembers home, and says what he makes of the dark places
// you take him, of another who joins you, and of what comes after the cart.
describe('your brother on the road', () => {
  it('remembers home, and has something of his own to say of the dark and of a fellow', async () => {
    const w = await WorldAssembler.assemble('mere', NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'mere', w.source), placed = w.report.placements.find(p => p.scenario === 'drover')!;
    GeneratedWorld.put(s, `${placed.bindings.town}_green`);
    await s.perform('wait');
    await Town.act(s, /^Ask .* what he means to do$/);
    await Town.act(s, /to join the company$/);
    expect(Town.said(await Town.act(s, /^Ask .* about home$/))).toContain('eels in it the size of oxen');
    // Somewhere unlit, with a light, he keeps to it.
    const dark = s.campaign.world.related('unlit')[0]!.args[0]!.replace(/^region__/, '');
    GeneratedWorld.put(s, dark);
    const light = PlayerView.choices(s.campaign).find(x => /^light_item\(/.test(x.choice.id));
    const lit = await s.perform(light ? light.choice.id : 'wait');
    expect(Town.said(lit)).toContain('keeps to the middle of the light');
    // Asked what he will do, once the cart is found.
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'drover__found_cart') }]));
    expect(Town.said(await Town.act(s, /^Ask .* what he will do now$/))).toContain('Take Father\'s road to market');
  }, 120000);
});
