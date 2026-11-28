import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Stakes } from '../../src/ui/stakes';
import { Outmatched } from '../../src/presentation/outmatched';
import { CompanyLight } from '../../src/presentation/company-light';
import { CompanyRecall } from '../../src/presentation/company-recall';
import { Means } from '../../src/presentation/means';
import { AimWords } from '../../src/presentation/aim-words';
import { AimLeading } from '../../src/presentation/aim-lead';
import { ModuleWriter } from '../../src/lang';

// The gold's other parts read where the company knows someone to be, never where the world has them (OR-881, after
// OR-880's main path; knowledge belongs to characters, truth to the world): an aim written toward a person, whoever
// would go along, who sells a light, the seller of what a barred way needs, and the words an aim introduces a stranger
// by. Hythe: the green the company stands on, the lane a step off where Osric the eel-man and Hob the hired hand stand,
// Mabel's shop off the lane, and a dark cellar under the green. Seen on the lane and left, Osric goes into the shop
// unseen.
const hamlet = (more = '') => `
  Place hythe "Hythe" is settlement.
  Place green "the green" is room within hythe at 0, 0 outdoors.
  Place lane "the lane" is room within hythe at 1, 0 outdoors.
  Place shop "Mabel's shop" is room within hythe at 2, 0 indoors.
  Place cellar "the cellar" is room within hythe at 1, 1 underground.
  Passage g_l "the lane gate" is path between green and lane.
  Passage shop_door "the shop door" is door between lane and shop.
  Passage stair "the cellar stair" is passage between green and cellar.
  Initially Assert unlit(cellar).
  Person osric "Osric" at lane { Role "an eel-man". Ancestry human. Peaceable. Pronouns he. }
  Person mabel "Mabel" at shop { Role "a chandler". Ancestry human. Peaceable. Pronouns she.
    Sells torch for 1 coin from 4. }
  Relation metOsric(group).
  Rule osric_met when at(party, lane) and at(osric, lane) { Assert metOsric(party). }
  Rule osric_goes when at(party, green) and metOsric(party) and at(osric, lane) {
    Retract at(osric, lane). Assert at(osric, shop). }
  Company party "You" of 1 at green.
  ${more}
  Goal false.`;
const gold = (t: Tiny) => t.gold.map(a => a.label);

describe('an aim written toward someone', () => {
  it('leads to where the company last saw them: never seen, nowhere; moved unseen, where they were', async () => {
    const t = await Tiny.start(hamlet('Objective seek when true toward osric "Find {osric}.".'));
    t.follow('seek');
    const seek = t.campaign.module.objectives!.find(o => o.id === 't__seek')!;
    const known = (id: string) => CompanyRecall.whereabouts(t.campaign, t.screen, id);
    // Never seen: his address is nowhere the company knows, and nothing is gold (before: the lane, where he stood).
    expect(Stakes.addresses(t.campaign, seek, known)).toEqual(new Set());
    expect(gold(t)).toEqual([]);
    // Seen on the lane, and gone into the shop while the company crossed back to the green: the lane, not the shop.
    await t.play('To the lane', 'To the green');
    expect(t.where('t__osric')).toBe('t__shop');
    expect(Stakes.addresses(t.campaign, seek, known)).toEqual(new Set(['t__lane', 't__hythe']));
    expect(gold(t)).toEqual(['To the lane']);
    // On the lane he is not there: the company is where it knows him to be, and the gold does not go on into the shop
    // where he is (before: the shop's door).
    await t.play('To the lane');
    expect(AimLeading.of(t.campaign, t.screen)?.source).toBe('here');
    expect(gold(t)).toEqual([]);
  }, 60000);
});

describe('whoever would go along', () => {
  it('is someone the company knows where to find', async () => {
    const t = await Tiny.start(hamlet(`Person hob "Hob" at lane { Role "a hired hand". Ancestry human. Calling warrior.
      Peaceable. Pronouns he. }
      Initially Assert willing(hob, party). Initially Set hire(hob) to 0.`));
    // Willing, and never seen: the help to be had is no one the company could go to (before: Hob, at the lane).
    expect(Outmatched.help(t.campaign)).toBe('t__hob');
    expect(Outmatched.helper(t.campaign)).toBeUndefined();
    await t.play('To the lane', 'To the green');
    expect(Outmatched.helper(t.campaign)).toEqual({ who: 't__hob', at: 't__lane' });
  }, 60000);
});

describe('who sells what the company wants', () => {
  it('sells it at the shop the company knows they keep, never where they stand unseen', async () => {
    // Mabel gone out to the lane unseen, as the company comes to Hythe: her shop is known by its sign, she is not.
    const t = await Tiny.start(hamlet(), { party: [{ name: 'Ilse', raceId: 'elf', classId: 'mage', outfit: 'own' }] });
    t.campaign.commitWorld(t.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 't__mabel', 't__shop') },
      { kind: 'assert', call: ModuleWriter.call('at', 't__mabel', 't__lane') }]));
    t.look();
    // The dark ahead down the cellar stair, nothing to see by: Mabel sells a light, at her shop (before: the lane).
    const light = CompanyLight.of(t.campaign, t.screen);
    expect([light.sellers, light.shops]).toEqual([new Set(['t__mabel']), new Set(['t__shop'])]);
    expect(Means.sources(t.campaign, ['torch'])).toEqual([{ seller: 't__mabel', kind: 'torch', at: 't__shop' }]);
  }, 60000);
  it('is no one in a town the company has never been in', async () => {
    const t = await Tiny.start(hamlet(`Place ashby "Ashby" is settlement.
      Place stall "the oil stall" is room within ashby at 6, 0 indoors.
      Person orm "Orm" at stall { Role "an oilman". Ancestry human. Peaceable. Pronouns he. Sells rope for 1 coin from 2. }`));
    expect(Means.sources(t.campaign, ['rope'])).toEqual([{ seller: 't__orm', kind: 'rope' }]);
  }, 60000);
});

// Kellen keeps the shrine at Ramrehes; an aim that leads to him, never met, says who he is and where he is found. Gone
// down to Millholm's mill unseen, the words still say where he keeps, as whoever gave the aim would.
describe('an aim\'s words of a stranger', () => {
  it('say where they keep, never where they have gone unseen', async () => {
    const t = await Tiny.start(`
      Place ramrehes "Ramrehes" is settlement.
      Place shrine "the shrine" is room within ramrehes at 0, 0 indoors.
      Place millholm "Millholm" is settlement.
      Place mill "the mill" is room within millholm at 3, 0 indoors.
      Place hythe "Hythe" is settlement.
      Place green "the green" is room within hythe at 6, 0 outdoors.
      Company party "You" of 1 at green.
      Person kellen "Kellen" at shrine { Role "a priest". Ancestry human. Peaceable. Pronouns he. }
      Entity stilled: fact "The dead are still.".
      Objective tell when true "The dead are still. {kellen} will want to know.".
      Goal false.`);
    const tell = t.campaign.module.objectives!.find(o => o.id === 't__tell')!;
    // By name and where he is found, never what he is (OR-1690): the description is his own, not the aim's.
    expect(AimWords.render(t.world, tell)).toBe('The dead are still. Kellen at Ramrehes will want to know.');
    t.campaign.commitWorld(t.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 't__kellen', 't__shrine') },
      { kind: 'assert', call: ModuleWriter.call('at', 't__kellen', 't__mill') }]));
    expect(t.where('t__kellen')).toBe('t__mill');
    expect(AimWords.render(t.world, tell)).toContain('at Ramrehes');
    expect(AimWords.whereabouts(t.world, 't__kellen')).toEqual(['t__shrine', 't__ramrehes']);
  }, 60000);
});
