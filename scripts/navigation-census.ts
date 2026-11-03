// What a player has to find their way by, place by place (the owner, 3 November: navigation is very puzzling, and it
// is not known whether the authored places, the page, or something else is the blocker; OWN-81). For each place of a
// campaign the company is stood there and the page's ways are read as the page would say them: how many there are,
// which two say the same thing, which place has only the way back, which is entered and never left, which places share
// a name, and how many places the start reaches by the ways at all. Said per campaign, worst first, so the authored
// places' share in the puzzle can be told from the page's.
//   bun scripts/navigation-census.ts [campaign.json | world:<seed> ...] [--top 8]
import { readdirSync } from 'node:fs';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList } from '../src/ui/choice-list';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Campaign } from '../src/campaign/campaign';
import { DrawnWorld } from '../src/world/drawn-world';

interface PlaceCount { id: string; name: string; ways: number; alike: string[]; back: boolean; stuck: boolean }
interface Census { campaign: string; places: number; reached: number; crowded: PlaceCount[]; alike: PlaceCount[];
  ends: PlaceCount[]; traps: PlaceCount[]; twins: string[] }

class NavigationCensus {
  static readonly crowded = 8;
  static async run(args: string[]) {
    const top = Number(args[args.indexOf('--top') + 1] || 8);
    const paths = args.filter(a => a.endsWith('.json') || a.startsWith('world:'));
    const campaigns = paths.length ? paths : readdirSync('data/campaigns').filter(f => f.endsWith('.campaign.json'))
      .map(f => `data/campaigns/${f}`);
    for (const path of campaigns) {
      try { this.print(await this.of(path), top); } catch (error) { console.log(`${path}: ${(error as Error).message}`); }
    }
  }
  static async of(path: string): Promise<Census> {
    const s = path.startsWith('world:') ? await this.world(path.slice(6))
      : await PlaySession.start(path, 'census', NodeBundleSource.shared);
    const c = s.campaign;
    // The campaign's own rooms, not the canon's planes every campaign holds (reached by the House of Doors).
    const own = new Set(c.installed.filter(id => !/^(imbar|canon|planes?|house)/.test(id)).map(id => `${id}__`));
    // (Not a room no way leads to: the houses its people live in, the room one is lost in, which rules move one to.)
    const linked = new Set(c.world.related('connects').flatMap(r => [r.args[1]!, r.args[2]!]));
    const places = c.module.entities.filter(e => e.type === 'place' && e.space?.kind === 'room' && linked.has(e.id)
      && (!own.size || [...own].some(p => e.id.startsWith(p))));
    const counts = places.map(p => this.count(c, p.id, p.name));
    const names = new Map<string, string[]>();
    for (const p of places) { names.set(p.name.toLowerCase(), [...names.get(p.name.toLowerCase()) ?? [], p.id]); }
    return { campaign: path, places: places.length, reached: this.reached(c).size,
      crowded: counts.filter(x => x.ways >= this.crowded).sort((a, b) => b.ways - a.ways),
      alike: counts.filter(x => x.alike.length), ends: counts.filter(x => x.back), traps: counts.filter(x => x.stuck),
      twins: [...names].filter(([, ids]) => ids.length > 1).map(([n, ids]) => `${n} (${ids.length})`) };
  }
  // A generated world, as the owner plays it: the first country, its towns, roads and sites.
  private static async world(seed: string): Promise<PlaySession> {
    return DrawnWorld.start(seed, { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] },
      NodeBundleSource.shared);
  }
  // The page's ways at a place, as it would say them, with the company stood there.
  private static count(c: Campaign, id: string, name: string): PlaceCount {
    const party = c.playerActor ?? 'party', was = c.world.one('at', party);
    c.commitWorld(c.world.apply([...was ? [{ kind: 'retract' as const, call: ModuleWriter.call('at', party, was) }] : [],
      { kind: 'assert', call: ModuleWriter.call('at', party, id) }]));
    const exits = ScreenModel.build(c).exits.filter(e => !e.blocked), labels = exits.map(e => ChoiceList.wayLabel(e));
    const alike = [...new Set(labels.filter((l, i) => labels.indexOf(l) !== i))];
    return { id, name, ways: exits.length, alike, back: exits.length === 1, stuck: exits.length === 0 };
  }
  // The rooms the start reaches by any way (shut or not: a way can be opened), as the world audit reckons it.
  private static reached(c: Campaign): Set<string> {
    const links = c.world.related('connects'), start = c.world.one('at', c.playerActor ?? 'party');
    const seen = new Set<string>(start ? [start] : []);
    for (const queue = [...seen]; queue.length;) {
      const here = queue.shift()!;
      for (const l of links.filter(r => r.args[1] === here || r.args[2] === here)) {
        const there = l.args[1] === here ? l.args[2]! : l.args[1]!;
        if (!seen.has(there)) { seen.add(there); queue.push(there); }
      }
    }
    return seen;
  }
  private static list(rows: PlaceCount[], top: number, say: (r: PlaceCount) => string): string {
    return rows.slice(0, top).map(say).join('; ');
  }
  private static print(x: Census, top: number) {
    console.log(`\n${x.campaign}: ${x.places} rooms, ${x.reached} reached from the start by the ways`);
    console.log(`  crowded (${x.crowded.length}): ${this.list(x.crowded, top, r => `${r.name} ${r.ways}`)}`);
    console.log(`  ways alike (${x.alike.length}): ${this.list(x.alike, top, r => `${r.name}: ${r.alike.join(' / ')}`)}`);
    console.log(`  only the way back (${x.ends.length}); entered and never left (${x.traps.length}): `
      + this.list(x.traps, top, r => r.name));
    console.log(`  names shared (${x.twins.length}): ${x.twins.slice(0, top).join('; ')}`);
  }
}
await NavigationCensus.run(process.argv.slice(2));
