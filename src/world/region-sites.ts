import { RegionEcology } from './region-ecology';
import { RegionGeography, type Seat } from './region-geography';
import type { Region } from './region-writer';

// The sites of a generated region as a stranger meets them. A site is seen for what it looks like (a lone tower, a
// grassed mound) until the company learns its name: from the people of the settlement it is reached from, who know
// what it is called and what is said of it, or, at the old sites, from the name cut over the door in the old script.
// Its track and anything said of it name it as the company knows it.
export class RegionSites {
  static readonly seen: Record<string, string> = { cave: 'a cave in the hillside', barrow: 'a grassed mound',
    ruin: 'the fallen walls', tower: 'a lone tower', grove: 'an old grove', bog: 'a black bog', mine: 'the old workings',
    sinkhole: 'a pit in the ground' };
  // What the people nearby say of each kind of site.
  static readonly said: Record<string, string> = { cave: 'There is always something living in it.',
    barrow: 'Old dead. Leave them be.', ruin: 'Older than the town. Folk take stone from it, when they dare.',
    tower: 'Nobody has lived there since my grandmother\'s day.', grove: 'We do not cut there.',
    bog: 'Keep to the stakes, if you go.', mine: 'Worked out, my father said, and he would know.',
    sinkhole: 'Sheep go in. They do not come out.' };
  // Where an old site carries its name.
  static readonly cut: Record<string, string> = { tower: 'Over the door, cut in the old script',
    barrow: 'On the stone across the entrance, in the old script', ruin: 'On a fallen lintel, in the old script' };
  static lines(region: Region): string[] {
    return RegionGeography.seats(region).flatMap(seat => this.seat(seat, region));
  }
  private static seat(seat: Seat, region: Region): string[] {
    const q = JSON.stringify, { site, town, land, spot: [x, y], form } = seat, id = site.id;
    const where = form ? form.name : `the ${RegionGeography.country[region.terrain] ?? 'country'} `
      + `${RegionGeography.compass(RegionGeography.town(region.settlements.indexOf(town)), seat.spot)} of ${town.name}`;
    const seen = this.seen[site.kind] ?? 'a place', keeper = `${town.id}_innkeeper`;
    const lines = [`  Place ${land} ${q(where)} is wilderness within region at ${x}, ${y}.`,
      `  Place ${id} ${q(site.name)} is room within ${land} at 1, 1 seen as ${q(seen)} until ${id}_named.`,
      `  Discovery ${id}_named ${q(`${site.name}: ${seen} in ${where}.${RegionGeography.meaning(site)}`)}.`,
      `  Passage ${id}_track ${q(`the track to {${id}}`)} is track between ${town.id}_green and ${id} taking ${site.hours} hour${site.hours === 1 ? '' : 's'}.`,
      `  Observe ${id}_scene at ${id} when true ${q(this.scene(seat, region))}.`,
      `  Observe ${id}_known at ${id} when knows(party, ${id}_named) ${q(`This is ${site.name}.${RegionGeography.meaning(site)}`)}.`,
      `  Topic ${id}_asked with ${keeper} ${q(`Ask {${keeper}} about {${id}}`)} when not knows(actor, ${id}_named) once {`,
      `    Says ${q(`'${site.name},' says {${keeper}}.${this.gloss(site)} '${this.said[site.kind] ?? ''}'`)}.`,
      `    On discuss { Assert knows(actor, ${id}_named). }`, '  }'];
    if (this.cut[site.kind]) {
      lines.push(`  Observe ${id}_letters at ${id} when true ${q(`${this.cut[site.kind]}: ${site.name.toUpperCase()}.`)} teaches ${id}_named.`);
    }
    if (form) { lines.push(`  Initially Assert landform(${land}, land_lake).`); }
    return lines;
  }
  // How a site looks, before or after its name is known: what it is, by the water if it is, and its animals.
  private static scene(seat: Seat, region: Region): string {
    const { site, form } = seat, fen = region.terrain === 'marsh' ? ' Reeds hiss in the wind.' : '';
    const shore = form ? ` It stands on the shore of ${form.name}, and the water laps at its foot.` : '';
    const sign = RegionEcology.sign(RegionEcology.habitat(region, site, form?.form), site.id);
    return `${RegionGeography.looks[site.kind] ?? ''}${shore}${fen} ${sign}`.trim();
  }
  // What a name means, as the people who say it would put it.
  private static gloss(site: { gloss?: string; tongue?: string }): string {
    if (!site.gloss) { return ''; }
    return site.tongue === 'Aenean' ? ` 'The old tongue: ${site.gloss}.'` : ` 'It means ${site.gloss}.'`;
  }
}
