import data from '../../data/career/career.json';
import type { BundleRequest } from '../campaign/module-bundle';
import type { Region, Site } from './region-writer';
import { Countries } from './countries';
import { Draw } from './land/draw';
import { RegionEcology } from './region-ecology';
import { RegionUndertown } from './region-undertown';
import { Vantage } from './vantage';
import { WorldGrid } from './world-grid';
import { WorldShape } from './world-shape';
import { RegionGeography } from './region-geography';
import { RegionBorders } from './region-borders';
import { Borders, type Side } from './land/borders';

export interface Dragon { at: [number, number]; name: string; bearing: string }
type Files = Record<string, string>;

// The hunter's career in a generated world (CR-01; doc/architecture/mission-22/career-phase1.md, phase 2), by three
// modules and no framework:
// - the Rì's commission, found by searching beneath the first town's notice after its own jobs (career);
// - the world's one named dragon, laired in the nearest mountain country beyond the first, written into that country
//   when it is drawn (career_lair);
// - the royal game-warden, written into the canon's Dun Rìerdan when its country is drawn (career_warden).
// The dragon's death is recorded only by the fight that did it (felled, see Aftermath.felled), which teaches the
// commission's own fact; the warden pays on that fact, once, and the company is a knight of the Rì's after.
export class Career {
  static readonly id = 'career';
  static readonly habitats = new Set(['cave', 'fells', 'heights']);
  // The world's dragon, by the seed alone: the nearest country beyond the first, ring by ring and in a fixed order
  // within each ring, whose land is mountain, and which no sea, no authored country and no city of the canon holds.
  static dragon(seed: string, first: string): Dragon | undefined {
    const authored = Countries.plan(seed, first);
    for (let ring = 1; ring <= 4; ring++) {
      for (let y = -ring; y <= ring; y++) {
        for (let x = -ring; x <= ring; x++) {
          if (Math.max(Math.abs(x), Math.abs(y)) !== ring || WorldShape.at(x, y) || WorldShape.seated(x, y)
            || authored.has(WorldGrid.id(x, y)) || WorldGrid.land(seed, [x, y]).terrain !== 'mountain') { continue; }
          const name = new Draw(`${seed}:career:dragon`).pick(data.names);
          return { at: [x, y], name, bearing: Vantage.bearing(x, y) };
        }
      }
    }
    return undefined;
  }
  // Where it lairs in its country: at the mouth of the first of its old places that is a den of the heights, the fells
  // or a cave (a mine, a tower on the fell), not a great work.
  static den(region: Region): Site | undefined {
    return region.sites.find(s => !s.work?.great && this.habitats.has(RegionEcology.habitat(region, s)));
  }
  private static q(s: string): string { return JSON.stringify(s); }
  private static module(files: Files, dir: string, source: string, manifest: object) {
    files[`${dir}/module.json`] = JSON.stringify({ version: 1, source: 'career.kyr', rules: ['world'], globals: ['party'],
      ...manifest });
    files[`${dir}/career.kyr`] = source;
  }
  private static roles(names: string[], types: Record<string, string>) {
    return { imports: ['party', ...names], roles: Object.fromEntries([['party', { type: 'group' }],
      ...names.map(n => [n, { type: types[n] ?? 'fact' }])]) };
  }
  // The commission in the first world, beneath the notice of the town the company begins in.
  static first(seed: string, region: Region, at: { root: string; files: Files; start?: { place?: string;
    approach?: { settlement: string } } }): BundleRequest[] {
    const dragon = this.dragon(seed, region.terrain), s = at.start;
    const home = s?.approach?.settlement ?? /^(s\d+)_/.exec(s?.place ?? '')?.[1] ?? region.settlements[0]?.id ?? '';
    const posting = dragon && this.posting(region, dragon, { ...at, home });
    return posting ? [posting] : [];
  }
  // What a country beyond the first is given of the career, as it is drawn: the dragon, in its own country; the warden,
  // in the city's.
  static beyond(seed: string, region: Region, at: { x: number; y: number; first: string; rid: string; root: string;
    files: Files }): BundleRequest[] {
    const dragon = this.dragon(seed, at.first), here = dragon && dragon.at[0] === at.x && dragon.at[1] === at.y;
    return [...here ? [this.lair(region, dragon, at)] : [], this.warden(region, at)]
      .filter((r): r is BundleRequest => !!r);
  }
  // Where the proclamation is posted in a town: its green, under the town's notices (the First Aims lead there).
  static posted(town: string): string { return `${town}_green`; }
  // The commission, in the first world: searched for beneath the town's own notice, never its first word, and an aim
  // from then on.
  static posting(region: Region, dragon: Dragon, at: { root: string; files: Files; home: string }): BundleRequest
    | undefined {
    const home = region.settlements.find(s => s.id === at.home) ?? region.settlements[0];
    if (!home || !RegionUndertown.noticed(region, home)) { return undefined; }
    const q = this.q, d = dragon, price = data.rewards.dragon, dir = `${at.root}/career`;
    const hunt = this.way(region, d.at), seat = WorldShape.seat('dun_ri'), city = seat && this.way(region, seat);
    const ways: Record<string, string> = { ...hunt ? { hunt } : {}, ...city ? { city } : {} };
    const said = `By the Rì's hand: whoever slays ${d.name}, the dragon of the high country ${d.bearing} of here, and `
      + `brings word of it to the royal game-warden at Dun Rìerdan, shall be knighted and paid ${price} crowns.`;
    this.module(at.files, dir, [`Module career "The Rì's commission" {`, '  Entity party: group "You".',
      '  Place green "the green" is room.', '  Entity notice: fact "The town\'s notice".',
      ...Object.keys(ways).map(w => `  Place ${w} "the march" is room.`),
      `  Entity commission: fact ${q(said)}.`,
      `  Entity slain: fact ${q(`${d.name}, the dragon of the high country, slain by your company in a fight.`)}.`,
      `  Entity knighted: fact ${q(`You are a knight of the Rì's, dubbed at the Llys of Dun Rìerdan for slaying ${d.name}.`)}.`,
      `  Entity paid: fact ${q(`The royal game-warden has paid the Rì's price for ${d.name}.`)}.`,
      // Seen under the notices when the company is next on the green after reading them: never what reading the
      // town's own jobs opens, which leads with them (test/decision-frame).
      '  Relation passed(group).',
      '  Rule passed_by when knows(party, notice) and not at(party, green) and not passed(party) { Assert passed(party). }',
      '  Action read_commission(actor: group, site: place) "Search under the notices for the Rì\'s commission" {',
      '    Requires able(actor) and at(actor, site) and at(actor, green) and knows(actor, notice) and passed(actor)'
        + ' and not knows(actor, commission).',
      `    Time 1. Resolve rummage(actor). On success { Assert knows(actor, commission). }`,
      `    Result ${q(`Under the town's notices, a sheet `
        + `under the Rì's seal. ${said}`)}.`,
      `    Otherwise ${q(`You search beneath the town's notices, but find only the papers already posted.`)}.`,
      '  }',
      ...this.aims(d, price, ways), '  Goal false.', '}', ''].join('\n'),
    { ...this.roles(['green', 'notice', ...Object.keys(ways)], { green: 'place', hunt: 'place', city: 'place' }),
      exports: { commission: 'commission', slain: 'slain', knighted: 'knighted', paid: 'paid' } });
    return { id: this.id, bundle: `${dir}/module.json`, imports: { party: 'region.party',
      green: `region.${this.posted(home.id)}`,
      notice: `region.${home.id}_u_notice`,
      ...Object.fromEntries(Object.entries(ways).map(([n, w]) => [n, `region.${w}`])) } };
  }
  // The aim, toward the first step the company knows of each half of it (MT-12: it had led nowhere, about the
  // commission alone): the march of the first country on the dragon's side until it is slain, then the march toward Dun
  // Rìerdan; the lair and the warden are in countries not yet drawn, so nothing nearer is known from here.
  private static aims(d: Dragon, price: number, ways: Record<string, string>): string[] {
    const q = this.q, [hunt, city] = ['hunt', 'city'].map(w => ways[w] ? ` toward ${w}` : '');
    return [`  Objective dragon when knows(party, commission) and not knows(party, slain) and not knows(party, paid)`
      + `${hunt} ${q(`Slay ${d.name}, the dragon of the high country ${d.bearing} of here, and bring word of it `
      + `to the royal game-warden at Dun Rìerdan: knighthood and ${price} crowns.`)}.`,
    `  Objective dragon_told when knows(party, slain) and not knows(party, paid)${city} ${q(`${d.name} is `
      + `dead. Bring word of it to the royal game-warden at Dun Rìerdan: knighthood and ${price} crowns.`)}.`];
  }
  // The room at the end of the first country's road out on the side toward a country of the grid (the side it lies
  // furthest toward first, then the other), if a road goes out that side and not down to a sea.
  static way(region: Region, [x, y]: [number, number]): string | undefined {
    const borders = RegionGeography.atlas(region).borders ?? [];
    const sides = (Object.keys(Borders.steps) as Side[])
      .map(side => ({ side, steps: x * Borders.steps[side][0] + y * Borders.steps[side][1] }))
      .filter(s => s.steps > 0).sort((a, b) => b.steps - a.steps).map(s => s.side);
    const b = sides.map(side => borders.find(o => o.side === side)).find(o => o && !region.beyond?.[o.side]?.sea);
    return b && RegionBorders.room(b);
  }
  // The dragon, written into its country when that is drawn: at its den, taking from the country about it once a day
  // while it lives, whatever the company does; and its death in a fight the company won taught as the commission's.
  static lair(region: Region, dragon: Dragon, at: { rid: string; root: string; files: Files }): BundleRequest
    | undefined {
    const den = this.den(region);
    if (!den) { return undefined; }
    const q = this.q, habitat = RegionEcology.habitat(region, den), dir = `${at.root}/career_lair`;
    const raid = (data.raids as Record<string, string>)[habitat] ?? data.raids.fells;
    this.module(at.files, dir, [`Module career_lair "The Rì's dragon" {`, '  Entity party: group "You".',
      '  Place den "the den" is room.', '  Entity slain: fact "The dragon slain".',
      '  Relation felled(group, group). Measure taken(group). Measure lastRaid(group).',
      `  Person dragon ${q(dragon.name)} at den { Role "the dragon the Rì has put a price on". Species dragon.`
        + ' Temperament territorial. Lair den. }',
      '  Rule raids when able(dragon) and day(clock) > lastRaid(dragon) {',
      '    Increase taken(dragon) by 1. Set lastRaid(dragon) to day(clock).', '  }',
      `  Observe raided at den as feature when taken(dragon) > 0 and able(dragon) ${q(raid)}.`,
      `  Rule slain_told when felled(party, dragon) and not knows(party, slain) says ${q(`${dragon.name} lies dead `
        + 'across the den, and does not move again.')} teaches slain { }`, '  Goal false.', '}', ''].join('\n'),
    this.roles(['den', 'slain'], { den: 'place' }));
    return { id: 'careerlair', bundle: `${dir}/module.json`, imports: { party: 'region.party',
      den: `${at.rid}.${den.id}`, slain: `${this.id}.slain` } };
  }
  // The royal game-warden, written into the canon's Dun Rìerdan when its country is drawn: an office off the city's
  // heart, its keeper the register of quarry, who pays the Rì's price on the commission's fact of the deed, once,
  // and knights the company; and for a knight, the register opened.
  static warden(region: Region, at: { rid: string; root: string; files: Files }): BundleRequest | undefined {
    const city = region.settlements.find(s => s.seat === 'dun_ri');
    if (!city) { return undefined; }
    const q = this.q, price = data.rewards.dragon, dir = `${at.root}/career_warden`;
    this.module(at.files, dir, [`Module career_warden "The royal game-warden" {`, '  Entity party: group "You".',
      '  Place city "the city" is settlement. Place heart "the heart of the city" is room.',
      '  Place office "the royal game-warden\'s office, under the Tower of the Teulu" is room within city at 9, 9 indoors.',
      '  Passage office_door "the game-warden\'s door" is door between heart and office.',
      '  Entity commission: fact "The commission". Entity slain: fact "The dragon slain".',
      '  Entity knighted: fact "Knighted". Entity paid: fact "Paid".',
      '  Person warden "Master Cadell" at office { Role "the royal game-warden, keeper of the register of quarry".'
        + ' Ancestry human. Peaceable. Pronouns he. }',
      '  Topic commission_asked with warden "Ask Master Cadell about the Rì\'s commission" when knows(actor, commission)'
        + ' and not knows(actor, slain) {',
      `    Says ${q(`'The register has it,' says Cadell, and turns it to face you. 'Bring me word the beast is dead by `
        + `your hand, and the Rì keeps the price: knighthood, and ${price} crowns.'`)}.`, '  }',
      '  Topic commission_claimed with warden "Tell Master Cadell the dragon is dead" when knows(actor, slain)'
        + ' and not knows(actor, paid) once {',
      `    Says ${q(`Cadell finds the entry, and reads what the world has of it, and writes under it a long time. `
        + `At the Llys the next morning you kneel, and stand up a knight of the Rì's, with ${price} crowns.`)}.`,
      `    On discuss { Increase quantity(actor, gold) by ${price}. Assert knows(actor, paid).`
        + ' Assert knows(actor, knighted). }', '  }',
      '  Topic register with warden "Ask Master Cadell what else the register holds" when knows(actor, knighted) {',
      `    Says ${q(`'For a knight of the Rì's,' says Cadell, and opens the register at a ribbon. 'What troubles the `
        + `roads and the folds, and what the Crown will pay for it.'`)}.`, '  }', '  Goal false.', '}', ''].join('\n'),
    this.roles(['city', 'heart', 'commission', 'slain', 'knighted', 'paid'], { city: 'place', heart: 'place' }));
    return { id: 'careerwarden', bundle: `${dir}/module.json`, imports: { party: 'region.party',
      city: `${at.rid}.${city.id}`, heart: `${at.rid}.${city.id}_green`, commission: `${this.id}.commission`,
      slain: `${this.id}.slain`, knighted: `${this.id}.knighted`, paid: `${this.id}.paid` } };
  }
}
