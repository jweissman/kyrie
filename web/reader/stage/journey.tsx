import type { Frame } from '../../engine/protocol';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';

// The way here, on arriving by known ways (see Told.Travelled).
export class Journey {
  // A journey along known ways: each leg as it went, under the time it came there; and, if it did not arrive, what
  // stopped it, said plainly where the eye goes next. What came of the last leg is the page's own telling, so the leg
  // keeps only how the way went (a companion's word on coming to a tower was said twice on its page: play 8).
  static View({ travel }: { travel: NonNullable<Frame['travel']> }) {
    const last = travel.legs.length - 1;
    return (
      <section className="travelled" aria-label={`On the way to ${travel.to}`}>
        <ol>{travel.legs.map((l, i) => <li key={i}><p className="leg"><span className="at">{l.at.replace(/^Day \d+, /, '')}</span>
          {' '}{Typography.curl(Words.upper(l.place))}</p>
          {[...l.journey, ...i < last ? l.lines : []].map((t, j) => <p key={j}>{Typography.curl(t)}</p>)}</li>)}</ol>
        {!travel.arrived && <p className="stopped">{Typography.curl(travel.stopped ?? 'The journey stops here')}.</p>}
      </section>
    );
  }
}
