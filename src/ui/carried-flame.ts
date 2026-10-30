import { FictionalTime } from '../campaign/fictional-time';
import type { PlayerSnapshot } from '../presentation/player-view';
import type { Screen } from './screen-types';

// The flame the company goes by somewhere unlit, for the stage's own glow (Friday's surprise, the flame you carry):
// the brightest that burns, a lantern before a torch, a torch before a candle, a flame before a light conjured, and of
// those the one with most left. None where nothing burns, nor in the light of day, where a flame is put out (see
// ScreenModel.light, which says the same light in words).
export class CarriedFlame {
  static readonly kinds: Record<string, NonNullable<Screen['expedition']['flame']>['kind']> = { lamplit: 'lantern',
    torchlit: 'torch', candlelit: 'candle', lit: 'conjured' };
  static of(view: PlayerSnapshot, unlit: boolean): Pick<Screen['expedition'], 'flame'> {
    const order = Object.keys(this.kinds), burning = unlit ? view.party.flatMap(m => m.conditions
      .filter(c => this.kinds[c]).map(c => ({ c, who: m.name, left: m.lasting?.[c] }))) : [];
    const best = burning.toSorted((a, b) => order.indexOf(a.c) - order.indexOf(b.c)
      || (b.left ?? Number.MAX_SAFE_INTEGER) - (a.left ?? Number.MAX_SAFE_INTEGER))[0];
    return best ? { flame: { kind: this.kinds[best.c]!, who: best.who,
      ...best.left === undefined ? {} : { left: best.left * FictionalTime.minutesPerTick } } } : {};
  }
}
