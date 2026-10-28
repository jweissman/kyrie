import type { BundleRequest } from '../campaign/module-bundle';
import type { BundleSource } from '../campaign/bundle-source';
import { OverlayBundleSource } from '../campaign/overlay-bundle-source';
import { Expressions } from '../expressions';
import { RandomStreams } from '../random-streams';
import { Countries } from './countries';
import { RegionWriter } from './region-writer';
import { ScenarioWord } from './scenario-word';
import { WorldAssembler, type Entry, type Placement } from './world-assembler';
import type { DeemValue } from 'deem';

// A country goes on after its first troubles: what goes on in its towns that it did not draw at the start (a fever, a
// drover missing, players stuck at the inn) begins on the third morning, and another every other morning after, while
// there are any, its word put about at the inns: "the talk here is all of …". A company that stayed a week at the first
// inn of six countries had been offered one new thing in all (the play-structure investigation's PT-29). Drawn again
// from the world's seed when it falls due, as the country beyond a march is (see Frontier), so a game replays the same.
export class Renewal {
  // Six in the morning of the third day (from eight on the first); every other morning after; at most three.
  static readonly first = 276;
  static readonly pace = 288;
  static readonly most = 3;
  // How many have fallen due by this watch.
  static due(elapsed: number): number {
    return elapsed < this.first ? 0 : Math.min(this.most, 1 + Math.floor((elapsed - this.first) / this.pace));
  }
  static id(n: number): string { return `renewal${n}`; }
  // The n-th held back (from 1): its modules, and its word, as one installation each; none, if the country has no more,
  // or if the country drawn again is not the one in play (a world drawn with what the frontier was not told).
  static async draw(seed: string, base: BundleSource, options: { region?: Record<string, DeemValue>; name?: string },
    n: number): Promise<{ requests: BundleRequest[]; source: BundleSource } | undefined> {
    const region = WorldAssembler.region(seed, [0, 0], options.region);
    if (options.name && region.name !== options.name) { return undefined; }
    region.further = Countries.further(region, seed);
    const days = new Expressions(RandomStreams.key(seed, 'world', 'calendar'));
    region.calendar = { year: 1290 + days.number('1d40'), month: days.number('1d12'), day: days.number('1d30') };
    const library = await WorldAssembler.library(base, 'data/scenarios/library.json');
    const heralds = await WorldAssembler.heralds(base, region, seed);
    const settled = WorldAssembler.settle(region, library,
      { seed, rid: RegionWriter.id, rounds: [3, 2], exclude: [], heralds });
    const held = this.held(region, library, { ...settled, seed, n });
    if (!held) { return undefined; }
    const { entry, placement } = held, files: Record<string, string> = {}, root = `renewal-${placement.instance}`;
    const requests = WorldAssembler.requests(entry, placement, base, { context: { ...settled.context,
      ...WorldAssembler.wild(placement, region), ...WorldAssembler.folk(placement, region) }, region });
    const word = ScenarioWord.of(entry.manifest, placement, { region, contacts: [] });
    if (word) {
      // Talked of where travellers are kept, until it is heard.
      const talk = (entry.manifest.hooks ?? []).flatMap((hook, i) => Object.keys(word.imports)
        .filter(k => /_taproom$/.test(k)).map(room => `  Observe h${i + 1}_talk_${room} at ${room} as sign when not`
          + ` knows(party, h${i + 1}) ${JSON.stringify(`The talk here is all of ${ScenarioWord.plainly(hook.topic,
            placement, region)}.`)}.`));
      files[`${root}/module.json`] = JSON.stringify(word.manifest);
      files[`${root}/word.kyr`] = word.source.replace(/\}$/, `${talk.join('\n')}\n}`);
      requests.push({ id: this.id(n), bundle: `${root}/module.json`, imports: word.imports });
    }
    return { requests: this.own(requests, n), source: new OverlayBundleSource(base, files) };
  }
  // Its modules named as its own ("renewal1fever"), and what refers to them so named: a country drawn after is not
  // kept from drawing what this one began later (the world's other countries draw what is not placed anywhere).
  private static own(requests: BundleRequest[], n: number): BundleRequest[] {
    const named = new Map(requests.filter(r => r.id !== this.id(n)).map(r => [r.id, `${this.id(n)}${r.id}`]));
    return requests.map(r => ({ ...r, id: named.get(r.id) ?? r.id, ...r.imports ? { imports: Object.fromEntries(
      Object.entries(r.imports).map(([k, v]) => [k, named.has(v.split('.')[0]!) ? `${named.get(v.split('.')[0]!)}.${v
        .split('.').slice(1).join('.')}` : v])) } : {} }));
  }
  // The goings-on of the towns not drawn at the start, chosen one after another as the country's own draw chose (a
  // stream of their own), each where the others were placed: those that need no site of their own, which would have
  // had to stand in the land from the start.
  private static held(region: Parameters<typeof WorldAssembler.settle>[0], library: Entry[],
    at: { context: Record<string, string>; placements: Placement[]; seed: string; n: number }) {
    const placed = new Set(at.placements.map(p => p.scenario)), placements = [...at.placements];
    const claimed = new Set(at.placements.flatMap(p => Object.values(p.bindings)));
    for (let k = 1; k <= at.n; k++) {
      const open = library.filter(e => e.manifest.kind === 'town' && !placed.has(e.manifest.id)
        && Object.values(e.manifest.places).every(p => !p.site)
        && WorldAssembler.fits(e.manifest, at.context, region).fits);
      const entry = WorldAssembler.choose(open, at.context, RandomStreams.key(at.seed, 'world', 'renewal', k));
      if (!entry) { return undefined; }
      placed.add(entry.manifest.id);
      const placement = WorldAssembler.place(entry.manifest,
        { n: 1, region, claimed, seed: at.seed, rid: RegionWriter.id, placements });
      if (!placement) { return undefined; }
      placements.push(placement);
      if (k === at.n) { return { entry, placement }; }
    }
    return undefined;
  }
}
