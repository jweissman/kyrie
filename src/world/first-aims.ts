import type { BundleRequest } from '../campaign/module-bundle';
import type { Region, Settlement } from './region-writer';
import { RegionUndertown } from './region-undertown';

type Files = Record<string, string>;

// The First Aims (the owner's direction of 24 November, §9; OR-443): one optional, nested undertaking a new life may
// take up or never, written as a module of its own in the first world, as the Rì's commission is (Career). Three
// levels: the horizon, a chapter of the country's book (its installation, "First aims"); the undertaking within it,
// an aim (finding your feet in the country); and what it is made of, each a milestone recognised from the world's facts
// as it comes, whether or not the aim was ever followed: the workings under the first town found and gone down into,
// and explored to their second level; someone found who would go with you; Dun Rìerdan, the Rì's city, learnt of.
// Available, followed and achieved are apart: the aim is available once two of its parts are done (what was done
// before counts), followed only if the player chooses it, and achieved when all of it is, by its own milestone. Each
// is given its worth once (Milestones), and the end of it is told once.
export class FirstAims {
  static readonly id = 'aims';
  // The rooms of the workings under the town a company comes to first, and those two levels down (the undertown's
  // template: data/generation/town/undertown.kyrt), as the town has them.
  static readonly found = ['cellar', 'crypt', 'adit'];
  static readonly explored = ['nest', 'drain', 'undercroft', 'charnel', 'face', 'brood'];
  // The workings' rooms the town has, as the region writes and exports them (RegionWriter), by their own names.
  static rooms(region: Region, home: Settlement | undefined): { found: string[]; explored: string[] } {
    if (!home || !RegionUndertown.noticed(region, home)) { return { found: [], explored: [] }; }
    const lines = RegionUndertown.lines(region, home).join('\n');
    return { found: this.found.filter(r => lines.includes(`Place ${home.id}_u_${r} `)),
      explored: this.explored.filter(r => lines.includes(`Place ${home.id}_u_${r} `)) };
  }
  // The town the life begins in, as the commission finds it.
  static home(region: Region, start?: { place?: string; approach?: { settlement: string } }): Settlement | undefined {
    const id = start?.approach?.settlement ?? /^(s\d+)_/.exec(start?.place ?? '')?.[1];
    return region.settlements.find(s => s.id === id) ?? region.settlements[0];
  }
  static write(region: Region, home: Settlement | undefined, at: { root: string; files: Files; career: boolean })
    : BundleRequest | undefined {
    const { found, explored } = this.rooms(region, home);
    if (!home || !found.length || !explored.length) { return undefined; }
    const q = JSON.stringify, dir = `${at.root}/${this.id}`, rooms = [...found, ...explored];
    const parts = ['dungeon_explored', 'help_gained', ...at.career ? ['far_learnt'] : []];
    // Two of its first three things done, and the undertaking is there to take up (what was done before counts): not
    // on the first of them, which a companion met on the road is, so that the first day keeps its few aims.
    const first = ['dungeon_found', 'help_gained', ...at.career ? ['far_learnt'] : []];
    const any = first.flatMap((a, i) => first.slice(i + 1).map(b => `(achieved(${a}) and achieved(${b}))`)).join(' or ');
    const source = [`Module first_aims "First aims" {`, '  Entity party: group "You".',
      ...rooms.map(r => `  Place ${r} "the workings" is room.`),
      ...at.career ? ['  Entity far: fact "The Rì\'s commission".'] : [],
      `  Milestone dungeon_found ${q(`found the old workings under ${home.name} and went down into them`)} worth 25 `
        + `when ${this.been(found)}.`,
      `  Milestone dungeon_explored ${q(`went down into the workings under ${home.name} as far as their second level`)}`
        + ` worth 50 when ${this.been(explored)}.`,
      '  Milestone help_gained "found someone who would go with you" worth 25 when travelsWith(?helper, party).',
      ...at.career ? ['  Milestone far_learnt "learnt of Dun Rìerdan, the Rì\'s city, far off" worth 25 when '
        + 'knows(party, far).'] : [],
      `  Milestone oriented ${q(`found your feet in ${region.name}`)} worth 100 when `
        + `${parts.map(p => `achieved(${p})`).join(' and ')}.`,
      // The undertaking; honest about where it leads: the town's way down.
      `  Objective orient when (${any}) and not achieved(oriented) toward ${found[0]} `
        + `${q(`Find your feet in ${region.name}: go down into the workings under ${home.name}, find someone who will `
        + `go with you${at.career ? ', and learn where Dun Rìerdan lies' : ''}.`)}.`,
      `  Event oriented_told when achieved(oriented) ${q(`You have found your feet in ${region.name}: its workings, `
        + 'a friend on the road, and the way the world goes on beyond it.')}.`,
      '  Goal false.', '}', ''].join('\n');
    at.files[`${dir}/module.json`] = JSON.stringify({ version: 1, source: `${this.id}.kyr`, rules: ['world'],
      globals: ['party'], imports: ['party', ...rooms, ...at.career ? ['far'] : []],
      roles: Object.fromEntries([['party', { type: 'group' }], ...rooms.map(r => [r, { type: 'place' }]),
        ...at.career ? [['far', { type: 'fact' }]] : []]) });
    at.files[`${dir}/${this.id}.kyr`] = source;
    return { id: this.id, bundle: `${dir}/module.json`, chapter: true, imports: { party: 'region.party',
      ...Object.fromEntries(rooms.map(r => [r, `region.${home.id}_u_${r}`])),
      ...at.career ? { far: 'career.commission' } : {} } };
  }
  // Having been in any of these rooms.
  private static been(rooms: string[]): string { return rooms.map(n => `been(party, ${n})`).join(' or '); }
}
