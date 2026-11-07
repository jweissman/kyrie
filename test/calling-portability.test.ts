import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ProvincePlay } from './support/province-play';
import type { CreatureGenerationContext } from '../src/content';

// Which form of calling-keyed voice is portable (doc/imbar/calling-portability.md). A module's rules
// name its own installation's `<module>__calling_cleric`, but a party's `hasCalling` facts name the LAST installed
// module's. So `hasCalling(?m, calling_x)` fires in a one-module campaign and never in a drawn world or a campaign of
// several modules; `brings(?m, <capability>)` (capabilities are canonical) fires in all, and keeps the member's name.
const six: CreatureGenerationContext[] = [
  { name: 'Dori', raceId: 'dwarf', classId: 'cleric', backgroundId: 'medic' },
  { name: 'Elen', raceId: 'elf', classId: 'ranger', backgroundId: 'hunter' },
  { name: 'Bran', raceId: 'human', classId: 'warrior', backgroundId: 'laborer' },
  { name: 'Nell', raceId: 'human', classId: 'thief', backgroundId: 'burglar' },
  { name: 'Tamsin', raceId: 'human', classId: 'bard', backgroundId: 'fabulist' },
  { name: 'Ivo', raceId: 'human', classId: 'mage', backgroundId: 'scholar' },
] as CreatureGenerationContext[];
const told = (j: Journey) => j.taken.map(x => `${x.page} ${x.told}`).join('\n');
const longman = 'data/campaigns/the-long-man.campaign.json', pellam = 'data/campaigns/the-liberty-of-the-ice.campaign.json';
const visit = async (j: Journey, place: string) => { j.put('party', place); await j.play('=+1'); };

describe('calling voices: the Long Man', () => {
  it('(a) fires in the shipped standalone campaign, by name', async () => {
    const j = await Journey.start(longman, 'port-a');
    await visit(j, 'longman__nave');
    expect(told(j)).toMatch(/Dori lays a hand flat on the font/);
    await visit(j, 'longman__crest');
    expect(told(j)).toMatch(/Elen goes down on one knee by a stump/);
  }, 240000);

  it('(b) fires in a campaign whose company has other callings (two companies of three, six callings between them)', async () => {
    const first = await Journey.start(longman, 'port-b1', { party: [six[0]!, six[3]!, six[5]!] });
    for (const [place, voice] of [['nave', 'heardFont'], ['cellar', 'heardDoor'], ['sluice', 'heardWheel']] as const) {
      await visit(first, `longman__${place}`);
      expect([place, first.holds(`longman__${voice}`, 'party')]).toEqual([place, true]);
    }
    expect(told(first)).toMatch(/Nell runs a thumb round the hinge/);
    expect(told(first)).toMatch(/Ivo stands with a palm held an inch/);
    const second = await Journey.start(longman, 'port-b2', { party: [six[1]!, six[2]!, six[4]!] });
    for (const [place, voice] of [['crest', 'heardCrest'], ['taproom', 'heardOx']] as const) {
      await visit(second, `longman__${place}`);
      expect([place, second.holds(`longman__${voice}`, 'party')]).toEqual([place, true]);
    }
    expect(told(second)).toMatch(/Tamsin sits a while with an ear turned to the room/);
    // And with no cleric, nobody lays a hand on the font.
    await visit(second, 'longman__nave');
    expect(second.holds('longman__heardFont', 'party')).toBe(false);
  }, 240000);

  it('(c) fires in a drawn world, where the province is installed as plongman', async () => {
    const { s, rid } = await ProvincePlay.enter('kite', 'longman', { party: six });
    const j = Journey.of(s);
    await visit(j, `${rid}__nave`);
    expect(told(j)).toMatch(/Dori lays a hand flat on the font/);
    await visit(j, `${rid}__taproom`);
    expect(told(j)).toMatch(/Tamsin sits a while with an ear turned to the room/);
  }, 600000);
});

describe('calling voices: the Liberty of the Ice', () => {
  it('(a) fires in the shipped standalone campaign (a bard at the Lamb)', async () => {
    const j = await Journey.start(pellam, 'port-a');
    await visit(j, 'pellam__lamb');
    expect(told(j)).toMatch(/Tamsin sits with an ear turned to the room/);
  }, 240000);

  it('(b) fires for other callings (a mage at the Glove, a thief at the rope-walk), and not for a calling that is not there', async () => {
    const mage = await Journey.start(pellam, 'port-b1', { party: [six[5]!] });
    await visit(mage, 'pellam__freezeland');
    expect(told(mage)).toMatch(/Ivo walks once round the foot of the mast/);
    await visit(mage, 'pellam__saffery_shop');
    expect(mage.holds('pellam__heardHatch', 'party')).toBe(false);
    const thief = await Journey.start(pellam, 'port-b2', { party: [six[3]!] });
    await visit(thief, 'pellam__saffery_shop');
    expect(told(thief)).toMatch(/Nell walks the length of the rope-walk/);
  }, 240000);

  it('(c) fires in a drawn world (a province, installed as ppellam)', async () => {
    const { s, rid } = await ProvincePlay.enter('rime', 'pellam', { region: { terrain: 'frost' }, party: six });
    const j = Journey.of(s);
    await visit(j, `${rid}__freezeland`);
    // (a bard brings lore too, so in a company with both it is the bard who is first to speak the mage's line)
    expect(told(j)).toMatch(/(Ivo|Tamsin) walks once round the foot of the mast/);
    await visit(j, `${rid}__lamb`);
    expect(told(j)).toMatch(/Tamsin sits with an ear turned to the room/);
  }, 600000);
});

// The mechanism, for every adventure whose rules ask `hasCalling`: standalone, the one module's calling entities are
// the only ones there are, so its rules and the party's facts agree; in a drawn world the party's facts name the last
// module installed, and the province's own `calling_cleric` is an entity no member is given.
const standalone: [string, string][] = [
  ['the-liberty-of-the-ice', 'pellam'], ['the-grand-tour', 'sennet'], ['what-tessary-owes', 'tessary'], ['hollins', 'hollins'],
  ['half-the-hive', 'hume'], ['quittance', 'quittance'], ['a-winter-in-carth', 'gaunt'], ['the-patient-star', 'season'],
  ['low-water', 'lowwater'], ['the-house-that-grows', 'hhg'], ['parliament-of-books', 'calamy'], ['let-one-remember', 'corrow'],
  ['the-lull', 'lull'], ['hessel', 'hessel'], ['the-dorothea', 'dorothea'], ['thrume', 'thrume'], ['the-long-man', 'longman'],
  ['skeel', 'skeel'], ['the-quiet-in-the-sky', 'larum'], ['the-book-of-faces', 'ombra'],
];
describe('hasCalling, by mechanism', () => {
  for (const [file, id] of standalone) {
    it(`${file}: in its shipped campaign every hasCalling fact names ${id}__calling_*`, async () => {
      const j = await Journey.start(`data/campaigns/${file}.campaign.json`, 'port-m');
      const facts = j.campaign.world.related('hasCalling');
      expect(facts.length).toBeGreaterThan(0);
      expect(facts.filter(f => !f.args[1]!.startsWith(`${id}__calling_`))).toEqual([]);
    }, 240000);
  }
  for (const [province, label] of [['longman', 'the Long Man'], ['pellam', 'the Liberty of the Ice'], ['skeel', 'Fair Weather']] as const) {
    it(`${label}: in a drawn world no member of the company is given its own ${province}__calling_*`, async () => {
      const { s, rid } = await ProvincePlay.enter('kite', province, province === 'pellam' ? { region: { terrain: 'frost' }, party: six } : { party: six });
      const facts = s.campaign.world.related('hasCalling').filter(f => /member_party_/.test(f.args[0]!));
      expect(facts.length).toBe(6);
      expect(facts.filter(f => f.args[1]!.startsWith(`${rid}__calling_`))).toEqual([]);
      expect(s.campaign.module.entities.some(e => e.id === `${rid}__calling_cleric`)).toBe(true);
    }, 600000);
  }
});
