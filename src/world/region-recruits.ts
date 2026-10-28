import { Canon } from '../canon/canon';
import { GenerationSetting } from '../generation-setting';
import { Draw } from './land/draw';
import type { Contact, Region, Settlement } from './region-writer';

// Who in a generated region would go along with a company: the traveller at each inn, whose calling is a class (a
// drover can fight, a pilgrim pray, a tinker open locks). Asked whether they would come along, they say what brings
// them there, and that they would travel with a company for a few coins and their keep; then they can be asked to
// join (the hire had been asked for as small talk, "what brings them", and was passed by: the play-structure
// investigation's PT-12). The first settlement's is the
// cheapest, so a company of one is never long alone.
export class RegionRecruits {
  static readonly classes: Record<string, string> = { drover: 'warrior', tinker: 'thief', pilgrim: 'cleric',
    pedlar: 'bard', 'charcoal-burner': 'ranger', 'eel-catcher': 'ranger', trapper: 'ranger', minstrel: 'bard',
    scholar: 'mage', soldier: 'warrior', mason: 'warrior' };
  static readonly near: Record<string, string[]> = { mage: ['bard', 'cleric', 'thief'], cleric: ['bard', 'mage', 'monk'],
    bard: ['thief', 'mage', 'cleric'], thief: ['ranger', 'bard'], ranger: ['thief', 'warrior'], warrior: ['ranger', 'monk'] };
  static readonly brings: Record<string, string> = {
    drover: 'Took a drove over the hills and came back with nothing but blisters and the price of a bed.',
    tinker: 'Mending pots. There are more locks than pots in this country, and they pay better.',
    pilgrim: 'I walk from shrine to shrine. The gods have not said where to stop.',
    pedlar: 'Ribbons, pins and news. The news sells best.',
    'charcoal-burner': 'The burn is done and the charcoal sold. I have a month before the next.',
    'eel-catcher': 'The eels are not running. Nothing is, this season.',
    trapper: 'The furs are sold, and the snow is late.',
    minstrel: 'Playing for my supper. The suppers have been thin, this side of the hills.',
    scholar: 'Copying the old inscriptions, for a library that may not want them. It is the copying I like.',
    soldier: 'My company was paid off at midsummer. I have a sword, a bad knee and no reason to be anywhere.',
    mason: 'Walls. There is always somebody whose wall has fallen down, and they always want it by market day.' };
  // Each settlement's traveller follows a different calling, where the country has callings enough: two pilgrims in
  // one country would have the same things to say.
  static distinct(region: Region, seed: string): Region {
    const tables = GenerationSetting.tables as unknown as { travellerCalling: { groups: Record<string, string[]> } };
    const pool = tables.travellerCalling.groups[region.terrain] ?? [];
    if (!pool.length) { return region; }
    const order = new Draw(`${seed}:${region.name}:callings`).shuffle(pool);
    return { ...region, settlements: region.settlements.map((s, i) => ({ ...s, calling: order[i % order.length]! })) };
  }
  // Why the company has come, said as it arrives, as a module of its own so it stands apart from the town: each
  // member an old acquaintance sent word to, and what of; a company of one is told who at the first town's inn is
  // looking for work, by name. Nothing is a task: it is what they came for. It is said where the company begins
  // (said on the town's green, it was never heard by one who began at its shrine: play 7; PT-11, a lone mage, thief
  // or bard does not get far alone), and only there: said all over the town, it was told at the forge the company
  // began at, again in the square, and a third time at the inn (play 8).
  static arrival(region: Region, company: { size: number; contacts: Contact[]; start?: string }) {
    const town = region.settlements[0]!, start = company.start ?? `${town.id}_green`;
    const imports: Record<string, string> = { party: 'region.party', start: `region.${start}` };
    const said = company.contacts.map((c, i) => {
      const s = region.settlements.find(x => c.carrier.startsWith(`${x.id}_`));
      imports[`c${i + 1}`] = `region.${c.carrier}`;
      const who = `{c${i + 1}}, the ${c.carrier.replace(/^s\d+_/, '')} at ${s?.name ?? town.name}`;
      return c.concern ? `${c.member} came because ${who}, sent word of ${c.concern}.`
        : `${c.member} came to see ${who}, an old friend.`;
    });
    if (company.size === 1) {
      const one = town.traveller && town.calling ? `${town.traveller}, ${/^[aeiou]/i.test(town.calling) ? 'an' : 'a'} ${town.calling},`
        : 'a traveller';
      said.push(`You have come alone. At the inn at ${town.name}, ${one} is looking for work, and would come with you for`
        + ` a few coins and their keep; the inns of ${region.name}'s other towns have others.`);
    }
    if (!said.length) { return undefined; }
    const names = Object.keys(imports), source = ['Module arrival "Why the company came" {', '  Entity party: group "Your company".',
      '  Place start "Where they begin" is room.', ...names.filter(n => /^c\d+$/.test(n)).map(n => `  Entity ${n}: group "Someone".`),
      `  Observe arrival at start when watch(clock) < 1 ${JSON.stringify(said.join(' '))}.`, '  Goal false.', '}'].join('\n');
    return { source, imports, manifest: { version: 1, source: 'arrival.kyr', rules: ['world'], globals: ['party'],
      imports: names, roles: Object.fromEntries(names.map(n => [n, { type: n === 'start' ? 'place' : 'group' }])) } };
  }
  static traveller(s: Settlement, i: number, region: Region, at = `${s.id}_taproom`): string[] {
    const q = JSON.stringify, id = `${s.id}_traveller`, ancestry = s.people?.traveller ?? s.folk ?? region.ancestry;
    const allowed = Canon.ancestries[ancestry]?.classes ?? ['commoner'];
    // One whose people cannot take the calling's class takes one near it: a halfling scholar a bard, not a warrior
    // (the play-structure investigation's PT-13).
    const wanted = this.classes[s.calling], calling = wanted && allowed.includes(wanted) ? wanted
      : (wanted ? this.near[wanted] ?? [] : []).find(c => allowed.includes(c))
        ?? allowed.find(c => Canon.classes[c]?.adventuring !== false) ?? 'commoner';
    const hire = 3 + i, brings = this.brings[s.calling] ?? 'Passing through, like everyone.';
    const pronoun = s.pronouns?.traveller, they = { he: 'he', she: 'she' }[pronoun ?? ''] ?? 'they';
    return [`  Person ${id} ${q(s.traveller)} at ${at} { Role ${q(s.calling)}. Ancestry ${ancestry}. Calling ${calling}. Peaceable.`
      + `${pronoun ? ` Pronouns ${pronoun}.` : ''} }`,
      `  Initially Set hire(${id}) to ${hire}.`,
      `  Topic ${id}_brings with ${id} ${q(`Ask {${id}} whether ${they} would come along`)} when true once {`,
      `    Says ${q(`'${brings}' {${id}} looks you over. 'If you are going anywhere, I would come along. ${hire} coin, and my keep.'`)}.`,
      `    On discuss { Assert willing(${id}, actor). }`, '  }'];
  }
}
