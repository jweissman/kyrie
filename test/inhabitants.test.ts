import { describe, expect, it } from 'bun:test';
import { Campaign } from '../src/campaign/campaign';
import { MemoryBundleSource } from '../src/campaign/memory-bundle-source';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { ModuleWriter } from '../src/lang/module-writer';
import type { CampaignEvent } from '../src/campaign/campaign-types';

// Creatures that live somewhere answer those who come in by their temperament, through one shared rules module: a
// defensive bear warns and fights for its den; wary wolves slip away and fight only when cornered; a proud drake names
// a price; glooms fear sunlight. The words are the place's; the behaviour is the rules'. Rats the place gives no
// words speak in the plain words of their temperament.
const site = `Module den_site "A cave on the fell" {
  Place fell "The fell" is region.
  Place cave "The cave" is wilderness within fell.
  Place mouth "the cave mouth" is room within cave.
  Place den "the bear's den" is room within cave.
  Place ledge "the high ledge" is room within cave.
  Place hoard "the drake's shelf" is room within cave.
  Passage way_in "the way in" is passage between mouth and den.
  Passage scramble "a scramble" is passage between den and ledge.
  Passage shelf_way "a crack in the rock" is passage between mouth and hoard.
  Place warren "the rat-warren" is room within cave.
  Passage burrow "a low burrow" is passage between mouth and warren.
  Company party "Party" of 3 at mouth.
  Initially Set quantity(party, gold) to 30.
  Person bear "the cave bear" at den { Role "a great bear". Species bear. }
  Entity bear_growl: fact "The bear rears up and roars: this is its den, and you are in it.".
  Entity bear_charge: fact "The bear drops to all fours and comes at you.".
  Initially Assert lair(bear, den). Initially Assert warning(bear, bear_growl). Initially Assert onslaught(bear, bear_charge).
  Person wolves "the wolves" at mouth { Species wolf. Numbers 2. }
  Entity wolves_slink: fact "The wolves look at you, and at each other, and slip away up into the rocks.".
  Entity wolves_turn: fact "Backed against the rock with nowhere left to go, the wolves turn on you.".
  Initially Assert refuge(wolves, ledge). Initially Assert flinch(wolves, wolves_slink). Initially Assert onslaught(wolves, wolves_turn).
  Person drake "the drake" at hoard { Role "a young drake on its gold". Species dragon. }
  Entity drake_price: fact "'Ten coin,' says the drake, 'or I eat you. I am not particular which.'".
  Entity drake_eats: fact "The drake has waited long enough.".
  Initially Assert lair(drake, hoard). Initially Assert warning(drake, drake_price). Initially Assert onslaught(drake, drake_eats).
  Initially Set tribute(drake) to 10.
  Person rats "the rats" at warren { Species rat. Numbers 3. Temperament territorial. }
  Goal false.
}`;
class Den {
  static async load() {
    const rules = await Promise.all(ModuleBundle.world.map(async name => [
      `data/rules/${name}.kyr`, await Bun.file(`data/rules/${name}.kyr`).text()]));
    return Campaign.load('campaign.json', 'den', new MemoryBundleSource({ ...Object.fromEntries(rules),
      'campaign.json': JSON.stringify({ version: 1, name: 'Den', modules: [{ id: 'cave', bundle: 'module.json' }] }),
      'module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'] }),
      'site.kyr': site }));
  }
  static act(c: Campaign, pick: (label: string) => boolean): CampaignEvent {
    const action = c.available().find(a => pick(a.name));
    expect(action).toBeDefined();
    return c.execute(action!.id);
  }
  static said(e: CampaignEvent): string[] {
    return [...e.perceptions ?? [], ...e.prelude?.perceptions ?? []].filter(p => p.kind === 'event').map(p => p.text);
  }
  static holds(c: Campaign, name: string, ...args: string[]) { return c.world.test(ModuleWriter.call(name, ...args)); }
}

describe('inhabitants', () => {
  it('reads a species\' temperament as a fact about the group', async () => {
    const c = await Den.load();
    expect(Den.holds(c, 'temperament', 'cave__bear', 'temper_defensive')).toBe(true);
    expect(Den.holds(c, 'temperament', 'cave__wolves', 'temper_wary')).toBe(true);
    expect(Den.holds(c, 'temperament', 'cave__drake', 'temper_proud')).toBe(true);
  }, 60000);
  it('sends wary wolves away from a company, and makes them fight when cornered', async () => {
    const c = await Den.load();
    const first = Den.act(c, l => l.startsWith('Wait a while'));
    expect(Den.said(first)).toContain('The wolves look at you, and at each other, and slip away up into the rocks.');
    expect(Den.holds(c, 'at', 'cave__wolves', 'cave__ledge')).toBe(true);
  }, 60000);
  it('lets a defensive bear warn first, then fall on whoever stays in its den', async () => {
    const c = await Den.load();
    const enter = Den.act(c, l => l.includes('way in'));
    expect(Den.said(enter).join(' ')).toContain('this is its den');
    const stay = Den.act(c, l => l.startsWith('Wait a while'));
    const next = Den.said(stay).length ? stay : Den.act(c, l => l.startsWith('Wait a while'));
    expect([...Den.said(stay), ...Den.said(next)].join(' ')).toContain('comes at you');
  }, 60000);
  it('lets a proud drake name a price and keep its word once paid', async () => {
    const c = await Den.load();
    const enter = Den.act(c, l => l.includes('crack in the rock'));
    expect(Den.said(enter).join(' ')).toContain('Ten coin');
    Den.act(c, l => l.startsWith('Pay') && l.includes('drake'));
    expect(Den.holds(c, 'tolerates', 'cave__drake', 'party')).toBe(true);
    const later = Den.act(c, l => l.startsWith('Wait a while'));
    expect(later.combat.length).toBe(0);
  }, 60000);
  it('speaks of a band the place gives no words of its own as many', async () => {
    const c = await Den.load();
    const enter = Den.act(c, l => l.includes('low burrow'));
    expect(Den.said(enter)).toContain('The rats stand their ground and watch you. They will not have you here for long.');
  }, 60000);
});
