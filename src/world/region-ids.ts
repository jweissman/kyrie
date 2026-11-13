// The ids a generated country gives what it writes, apart from the writers, so that what only needs to recognise them
// (an itinerary, a journey by a province's name) does not import the generators and their tables (the owner, 14
// November: a session had drawn in 77 files of world generation, 0.9 MB of tables, for these few lines).
export class RegionIds {
  // The drawn country's own module.
  static readonly region = 'region';
  // The room a province is entered by, in its country; the module installed for it.
  static room(id: string): string { return `gate_${id}`; }
  static install(id: string): string { return `p${id}`; }
}
