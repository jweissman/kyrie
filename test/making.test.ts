import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { PlaySession } from '../src/session/play-session';
import type { CreatureStore } from '../src/creature-store';

// What a company can make of what it carries (data/rules/making.kyr): willow bark and meadowsweet gathered on a bank
// steeped into a minor potion of healing, a mender's work that can spoil; a rag in a flask of lamp oil, plain work.
// What is made is the company's like anything else, to use or to sell: the herb-wife buys the potion
// (test/fixtures/probes/making). A thing given the company had been in no action's domain, and could not be sold.
class Making {
  static async start(seed: string) {
    const j = await Journey.start('test/fixtures/probes/making/probe.campaign.json', seed);
    for (const k of ['bark,willow_bark', 'sweet,herbs', 'oil,lamp_oil', 'rag,bandages']) {
      const [item, kind] = k.split(',');
      await j.session.perform(`take_item(party,p__${item},${kind},p__member_party_1,p__bank)`);
    }
    return j.session;
  }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  static kinds(s: PlaySession) {
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures;
    return (store.get('p__party_1').state.inventory ?? []).map(i => i.definition);
  }
  static gold(s: PlaySession, who = 'party') { return s.campaign.world.number(ModuleWriter.call('quantity', who, 'gold')); }
  static readonly remedy = 'make_remedy(party,p__member_party_1,steeped_willow,p__bark,willow_bark,p__sweet,herbs,'
    + 'minor_healing_potion)';
}

describe('making a thing of two', () => {
  it('is offered of what the company carries, a remedy with its odds', async () => {
    const s = await Making.start('m');
    expect(Making.names(s)).toEqual(expect.arrayContaining([
      expect.stringMatching(/^Ama: make Minor Potion of Healing of some willow bark and a twist of meadowsweet · /),
      'Ama: make Fire flask of a flask of lamp oil and a strip of linen']));
  }, 60000);
  it('makes a remedy to use or sell, or spoils the first of what it takes', async () => {
    const outcomes = new Map<string, PlaySession>();
    for (const seed of ['m', 'n', 'o', 'p', 'q']) {
      const s = await Making.start(seed), done = await s.perform(Making.remedy);
      outcomes.set(done.result, s);
    }
    const made = outcomes.get('success')!, spoiled = outcomes.get('failure')!;
    expect(Making.kinds(made)).toContain('minor_healing_potion');
    expect(Making.kinds(made)).not.toEqual(expect.arrayContaining(['willow_bark']));
    expect(Making.kinds(made)).not.toContain('herbs');
    expect(Making.kinds(spoiled)).toContain('herbs');
    expect(Making.kinds(spoiled)).not.toContain('willow_bark');
    expect(Making.kinds(spoiled)).not.toContain('minor_healing_potion');
    // Made, it is the company's: the herb-wife buys it.
    await made.perform('go(party,p__lane,p__bank,p__green)');
    const sale = PlayerView.choices(made.campaign).find(c => /^Sell .*Healing to Nan Aske/i.test(c.choice.name));
    expect(sale).toBeDefined();
    await made.perform(sale!.choice.id);
    expect(Making.gold(made)).toBe(8);
  }, 120000);
  it('of plain work, anyone does at once', async () => {
    const s = await Making.start('m');
    const done = await s.perform('make_plain(party,p__member_party_1,oil_and_rag,p__oil,lamp_oil,p__rag,bandages,fire_flask)');
    expect([done.result, Making.kinds(s).includes('fire_flask'), Making.kinds(s).includes('lamp_oil')])
      .toEqual(['success', true, false]);
  }, 60000);
});
