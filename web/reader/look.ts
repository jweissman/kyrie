// Mission 21's composition experiments (doc/architecture/mission-21/aesthetic/proposal.md), one address away and
// never the default: ?look=veil (the painting whole, one floating panel), ?look=attend (lenses that promote, not
// pages), ?look=plate (the painting as a plate, the words in a band beneath). Each is the root's data-look, which
// look.css reads; the few components that compose differently ask Look.is. Set again at runtime by captures
// (kyrieMono.relook), so one walk through a game can be drawn every way.
export type LookName = 'veil' | 'attend' | 'plate';
export class Look {
  static readonly names: readonly LookName[] = ['veil', 'attend', 'plate'];
  static current(): LookName | undefined {
    const at = typeof document === 'undefined' ? undefined : document.documentElement.dataset.look;
    return Look.names.find(n => n === at);
  }
  static is(...names: LookName[]): boolean { const at = Look.current(); return !!at && names.includes(at); }
  // From the address, at start; or by a capture, between shots ('' is the game as it is).
  static set(name: string | null | undefined) {
    const root = document.documentElement, at = Look.names.find(n => n === name);
    if (at) { root.dataset.look = at; } else { delete root.dataset.look; }
  }
}
