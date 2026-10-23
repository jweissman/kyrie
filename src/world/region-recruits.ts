import { Canon } from '../canon/canon';
import { GenerationSetting } from '../generation-setting';
import { Draw } from './land/draw';
import type { Contact, Region, Settlement } from './region-writer';

// Who in a generated region would go along with a company: the traveller at each inn, whose calling is a class (a
// drover can fight, a pilgrim pray, a tinker open locks). Asked what brings them there, they say, and that they would
// travel with a company for a few coins and their keep; then they can be asked to join. The first settlement's is the
// cheapest, so a company of one is never long alone.
export class RegionRecruits {
  static readonly classes: Record<string, string> = { drover: 'warrior', tinker: 'thief', pilgrim: 'cleric',
    pedlar: 'bard', 'charcoal-burner': 'ranger', 'eel-catcher': 'ranger', trapper: 'ranger', minstrel: 'bard',
    scholar: 'mage', soldier: 'warrior', mason: 'warrior' };
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
  // member an old acquaintance sent word to, and what of; a company of one is told that the travellers at the inns are
  // looking for work. Nothing is a task: it is what they came for.
  static arrival(region: Region, company: { size: number; contacts: Contact[] }) {
    const town = region.settlements[0]!, imports: Record<string, string> = { party: 'region.party', green: `region.${town.id}_green` };
    const said = company.contacts.map((c, i) => {
      const s = region.settlements.find(x => c.carrier.startsWith(`${x.id}_`));
      imports[`c${i + 1}`] = `region.${c.carrier}`;
      const who = `{c${i + 1}}, the ${c.carrier.replace(/^s\d+_/, '')} at ${s?.name ?? town.name}`;
      return c.concern ? `${c.member} came because ${who}, sent word of ${c.concern}.`
        : `${c.member} came to see ${who}, an old friend.`;
    });
    if (company.size === 1) {
      said.push(`You have come alone. The travellers at the inns of ${region.name} are looking for work, and one of them might come with you.`);
    }
    if (!said.length) { return undefined; }
    const names = Object.keys(imports), source = ['Module arrival "Why the company came" {', '  Entity party: group "Your company".',
      '  Place green "Where they arrive" is room.', ...names.filter(n => /^c\d+$/.test(n)).map(n => `  Entity ${n}: group "Someone".`),
      `  Observe arrival at green when watch(clock) < 1 ${JSON.stringify(said.join(' '))}.`, '  Goal false.', '}'].join('\n');
    return { source, imports, manifest: { version: 1, source: 'arrival.kyr', rules: ['world'], globals: ['party'],
      imports: names, roles: Object.fromEntries(names.map(n => [n, { type: n === 'green' ? 'place' : 'group' }])) } };
  }
  static traveller(s: Settlement, i: number, region: Region): string[] {
    const q = JSON.stringify, id = `${s.id}_traveller`, ancestry = s.people?.traveller ?? s.folk ?? region.ancestry;
    const allowed = Canon.ancestries[ancestry]?.classes ?? ['commoner'];
    const wanted = this.classes[s.calling], calling = wanted && allowed.includes(wanted) ? wanted
      : allowed.find(c => Canon.classes[c]?.adventuring !== false) ?? 'commoner';
    const hire = 3 + i, brings = this.brings[s.calling] ?? 'Passing through, like everyone.';
    return [`  Person ${id} ${q(s.traveller)} at ${s.id}_taproom { Role ${q(s.calling)}. Ancestry ${ancestry}. Calling ${calling}. Peaceable. }`,
      `  Initially Set hire(${id}) to ${hire}.`,
      `  Topic ${id}_brings with ${id} ${q(`Ask {${id}} what brings them to ${s.name}`)} when true once {`,
      `    Says ${q(`'${brings}' {${id}} looks you over. 'If you are going anywhere, I would come along. ${hire} coin, and my keep.'`)}.`,
      `    On discuss { Assert willing(${id}, actor). }`, '  }'];
  }
}
