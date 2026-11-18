// What a region's draws are seeded by: the name it was drawn under, kept when it is called otherwise (a heartland
// country is drawn under its Westron name and called by its Common one: see PlaceNames), so naming it moves nothing.
export class RegionKey {
  static of(region: { name: string; key?: string }): string { return region.key ?? region.name; }
}
