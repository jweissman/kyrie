import { Canon } from '../canon/canon';
import { GenerationSetting } from '../generation-setting';
import { Draw } from './land/draw';
import { Foundings } from './founding';
import type { Contact, Region, Settlement } from './region-writer';
import travellers from '../../data/generation/scenes/travellers.json';

// Who in a generated region would go along with a company: the traveller at each inn, whose calling is a class (a
// drover can fight, a pilgrim pray, a tinker open locks). Asked whether they would come along, they say what brings
// them there, and that they would travel with a company for a few coins and their keep; then they can be asked to
// join (the hire had been asked for as small talk, "what brings them", and was passed by: the play-structure
// investigation's PT-12). The first settlement's is the cheapest, so a company of one is never long alone.
export class RegionRecruits {
  // The callings, their classes and what each says brings them, and the rest of what is said of the inn's traveller:
  // the author's (data/generation/scenes/travellers.json).
  static readonly table = travellers as { callings: Record<string, { class: string; brings: string }>;
    near: Record<string, string[]>; passing: string; hire: string; hiring: string };
  static readonly classes: Record<string, string> = Object.fromEntries(Object.entries(this.table.callings)
    .map(([k, v]) => [k, v.class]));
  static readonly near = this.table.near;
  static readonly brings: Record<string, string> = Object.fromEntries(Object.entries(this.table.callings)
    .map(([k, v]) => [k, v.brings]));
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
  // member an old acquaintance sent word to, and what of. Nothing is a task: it is what they came for. It is said
  // where the company begins, and only there: said all over the town, it was told at the forge the company began at,
  // again in the square, and a third time at the inn (play 8).
  static arrival(region: Region, company: { size: number; contacts: Contact[]; start?: string }) {
    const first = region.settlements[0]!, start = company.start ?? `${first.id}_green`;
    // The town the company begins in, by the place it begins at (a drover's child comes home to a town ten hours from
    // the first, and was told of the first one's inn: the opening's critique).
    const town = region.settlements.find(s => start.startsWith(`${s.id}_`)) ?? first;
    const imports: Record<string, string> = { party: 'region.party', start: `region.${start}` };
    const said = company.contacts.map((c, i) => {
      const s = region.settlements.find(x => c.carrier.startsWith(`${x.id}_`));
      imports[`c${i + 1}`] = `region.${c.carrier}`;
      const who = `{c${i + 1}}, the ${c.carrier.replace(/^s\d+_/, '')} at ${s?.name ?? town.name}`;
      return c.concern ? `${c.member} came because ${who}, sent word of ${c.concern}.`
        : `${c.member} came to see ${who}, an old friend.`;
    });
    const alone = company.size === 1 ? this.alone(region, town, imports) : [];
    if (!said.length && !alone.length) { return undefined; }
    const names = Object.keys(imports), places = ['start', 'inn'];
    const source = ['Module arrival "Why the company came" {', '  Entity party: group "Your company".',
      '  Place start "Where they begin" is room.', ...names.filter(n => n !== 'party' && !places.includes(n))
        .map(n => `  Entity ${n}: group "Someone".`),
      ...said.length ? [`  Observe arrival at start when watch(clock) < 1 ${JSON.stringify(said.join(' '))}.`] : [],
      ...alone, '  Goal false.', '}'].join('\n');
    return { source, imports, manifest: { version: 1, source: 'arrival.kyr', rules: ['world'], globals: ['party'],
      imports: names, roles: Object.fromEntries(names.map(n => [n, { type: places.includes(n) ? 'place' : 'group' }])) } };
  }
  // One who comes alone knows before they set out who at the inn of the town they begin in is looking for work, by
  // name, and its keeper says so there, in the telling of the room, until that one has been asked: a lone mage, thief
  // or bard does not get far alone (PT-11), and wherever in the town they begin it is in their notes (said on the
  // town's green, it was never heard by one who began at its shrine: play 7). Said on the first page, it had stood
  // between the way in and why they came (OWN-17); said as the keeper's own doing, it was on no card a desktop shows
  // (the opening's critique).
  private static alone(region: Region, town: Settlement, imports: Record<string, string>): string[] {
    const q = JSON.stringify, a = /^[aeiou]/i.test(town.calling ?? '') ? 'an' : 'a';
    const one = town.traveller && town.calling ? `${town.traveller}, ${a} ${town.calling},` : 'a traveller';
    const known = [`  Entity hire: fact ${q(Foundings.fill(this.table.hire, { town: town.name, one, country: region.name }))}.`,
    '  Initially Assert established(hire). Initially Assert knows(party, hire).'];
    if (!town.traveller) { return known; }
    // Where the keeper stands: the taproom, or the heart of a place that keeps no inn (see SettlementWriter.standing).
    const inn = Foundings.of(region, region.settlements.indexOf(town)).keeping !== 'none' ? 'taproom' : 'green';
    Object.assign(imports, { keeper: `region.${town.id}_innkeeper`, traveller: `region.${town.id}_traveller`,
      inn: `region.${town.id}_${inn}` });
    return [...known, '  Place inn "The inn" is room.', '  Observe hiring at inn as feature when not willing(traveller, party)'
      + ` and not travelsWith(traveller, party) ${q(this.table.hiring)}.`];
  }
  static traveller(s: Settlement, i: number, region: Region, at = `${s.id}_taproom`): string[] {
    const q = JSON.stringify, id = `${s.id}_traveller`, ancestry = s.people?.traveller ?? s.folk ?? region.ancestry;
    const allowed = Canon.ancestries[ancestry]?.classes ?? ['commoner'];
    // One whose people cannot take the calling's class takes one near it: a halfling scholar a bard, not a warrior
    // (the play-structure investigation's PT-13).
    const wanted = this.classes[s.calling], calling = wanted && allowed.includes(wanted) ? wanted
      : (wanted ? this.near[wanted] ?? [] : []).find(c => allowed.includes(c))
        ?? allowed.find(c => Canon.classes[c]?.adventuring !== false) ?? 'commoner';
    const hire = 3 + i, brings = this.brings[s.calling] ?? this.table.passing;
    const pronoun = s.pronouns?.traveller, they = { he: 'he', she: 'she' }[pronoun ?? ''] ?? 'they';
    return [`  Person ${id} ${q(s.traveller)} at ${at} { Role ${q(s.calling)}. Ancestry ${ancestry}. Calling ${calling}. Peaceable.`
      + `${pronoun ? ` Pronouns ${pronoun}.` : ''} }`,
      `  Initially Set hire(${id}) to ${hire}.`,
      `  Topic ${id}_brings with ${id} ${q(`Ask {${id}} whether ${they} would come along`)} when true once {`,
      `    Says ${q(`'${brings}' {${id}} looks you over. 'If you are going anywhere, I would come along. ${hire} coin, and my keep.'`)}.`,
      `    On discuss { Assert willing(${id}, actor). }`, '  }'];
  }
}
