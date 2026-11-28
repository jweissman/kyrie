import type { Campaign } from '../../src/campaign/campaign';
import type { Dungeon } from './dungeon';
import { QuantityPlaces } from './places';

// Truthful foreboding in the first dungeon (OR-1854; the owner, 27 November: an unwarned fight is only very
// occasionally lethal, and the place itself gives warning). Its bands that fall on whoever comes in, or are among its
// worst (drawable: what can be heard, and drawn out, from the next room: DeepSounds), and of the ways to each, those
// at whose far end fewer than two signs of it are told (its sound, its spoor, the sign of what lies in wait): read
// from the module's own observations, as the world was made, before anyone goes down.
export interface Foreboded { bands: string[]; unsigned: string[] }
export class QuantityForebode {
  static readonly signs = 2;
  static read(c: Campaign, dungeon: Dungeon): Foreboded {
    const w = c.world, site = QuantityPlaces.place(c, dungeon.entry), observations = c.module.observations ?? [];
    const drawable = w.relates('drawable') ? w.related('drawable').map(r => r.args[0]!) : [];
    const bands = drawable.filter(b => { const at = w.one('at', b); return !!at && QuantityPlaces.place(c, at) === site; });
    const ways = w.related('connects');
    const unsigned = bands.filter(band => {
      const room = w.one('at', band)!;
      const next = ways.flatMap(r => r.args[1] === room ? [r.args[2]!] : r.args[2] === room ? [r.args[1]!] : []);
      return next.some(n => observations.filter(o => o.place === n && o.id.startsWith(`${band}_`)).length < this.signs);
    });
    return { bands, unsigned };
  }
}
