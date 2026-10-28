// The place your aim names, among the places you know beyond the nearest: offered to set out for however far it is
// (the cisterns of Lunastagn, the aim, were only "on the map" while three nearer places were offered: play 7).
export class Aims {
  static named<T extends { name: string }>(places: T[], aim: string | undefined, near: number): T | undefined {
    return aim ? places.slice(near).find(d => d.name.length > 3
      && new RegExp(`(^|[^\\p{L}])${d.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}])`, 'iu').test(aim)) : undefined;
  }
}
