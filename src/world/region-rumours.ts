import { RegionGeography, type Seat } from './region-geography';
import { RegionSites } from './region-sites';
import { Terrain } from './land/terrain';
import type { Region } from './region-writer';

// What is out in the country round a town, as whoever keeps travellers there would tell it: the old places nearest
// it, each by its name, how it looks and where it stands, and how to find it. A fresh company could find no dungeon to
// go to (the owner's own session, 7 November: "It seems galling I can't find anything or start quests or just find a
// dungeon and fight things"): a country's sites were heard of only by asking after each by a name nobody had said,
// and the map of a company come into it held one cave not made out. One question at the inn now tells the nearest
// few, and they are on the map, heard of, with the way to each; what lies in them is for the company to find.
export class RegionRumours {
  static readonly most = 3;
  static lines(region: Region): string[] {
    const q = JSON.stringify, seats = RegionRumours.told(region);
    return region.settlements.flatMap(town => {
      const near = RegionRumours.nearest(region, town, seats);
      // That it has been told, for an aim to go on from (the debt: asked at the inn, out to what was told of).
      const told = [`  Entity ${town.id}_country_told: fact ${q(`What is out in the country round ${town.name}`)}.`];
      if (!near.length) { return told; }
      const keeper = `${town.id}_innkeeper`;
      const named = near.map(s => `${s.site.name}: ${RegionSites.look(s.site, region)} in ${RegionSites.where(s, region)}`);
      return [...told, `  Topic ${town.id}_country_asked with ${keeper} ${q(`Ask {${keeper}} what is out in the country round`)}`
        + ' when true once {',
      `    Says ${q(`{${keeper}} counts them off on a hand. '${named.join('. ')}. Nobody goes to them that has any sense,'`
        + ` and {${keeper}} tells you how each is come to.`)}.`,
      `    On discuss { ${near.map(s => `Assert knows(actor, ${s.site.id}_named). Assert knows(actor, ${s.site.id}_found).`)
        .join(' ')} Assert knows(actor, ${town.id}_country_told). }`, '  }'];
    });
  }
  // What an innkeeper tells a newcomer of: not the makers' great works, nor their deep ones, whose halls go down to
  // what kills a company new to the road (the debt's first errand, sent to the nearest, had come to Lapisrecs' long
  // gallery and a mummy that killed a lone first-level warrior at its door: register M19-233). Those are found later,
  // by the way down under a town or by word of them.
  static told(region: Region): Seat[] {
    return RegionGeography.seats(region).filter(s => !s.site.work?.great && !s.site.work?.deep);
  }
  // The sites nearest a town, by the land between.
  static nearest(region: Region, town: Region['settlements'][number], seats: Seat[]): Seat[] {
    const land = RegionGeography.atlas(region).land;
    if (town.cell === undefined) { return []; }
    return seats.filter(s => s.site.cell !== undefined)
      .map(s => [Terrain.distance(land, town.cell!, s.site.cell!), s] as const)
      .sort((a, b) => a[0] - b[0]).slice(0, RegionRumours.most).map(([, s]) => s);
  }
}
