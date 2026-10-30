import type { Screen } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';

// The flame the company carries somewhere unlit, as the stage's own light: a warm glow rising from its foot once a
// torch is lit, wider and steadier for a lantern, small for a candle, cool and still for a light conjured; drawn in,
// and quicker to flicker, when it has ten minutes or less; and fading when it gutters out (Friday's surprise: the
// review's torch expiring at the casket, felt and not only read in the footer). Always there in play, so that a light
// going out can fade rather than vanish; behind everything, so the words keep their colour.
export class Flame {
  static readonly low = 10;
  static View({ app }: { app: ReaderApp }) {
    if (app.state.phase !== 'play') { return null; }
    return <Flame.Glow flame={app.state.frame?.screen.expedition.flame} />;
  }
  static Glow({ flame }: { flame?: Screen['expedition']['flame'] }) {
    return <div className={Flame.classes(flame)} aria-hidden="true" data-id="flame" />;
  }
  static classes(flame?: Screen['expedition']['flame']): string {
    if (!flame) { return 'flame'; }
    return ['flame', 'on', `flame-${flame.kind}`, ...flame.left !== undefined && flame.left <= Flame.low ? ['low'] : []]
      .join(' ');
  }
}
