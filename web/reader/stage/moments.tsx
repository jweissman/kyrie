import type { Exchange } from '../../../src/presentation/narrator';
import type { Frame } from '../../../src/creation/protocol';
import type { Ended, Levelled } from '../../../src/presentation/line-moments';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../../../src/presentation/words';
import { Panorama } from './panorama';

// The moments the page sets apart from the run of what happened (Mission 16's brief: vary the rhythm and intensity
// for exceptional events). Something seen through (the Long Man, the fever) is the end of a chapter; a level gained
// is a moment of the person who gains it, lighter, where the free play read it as one more line after a night's rest.
export class Moments {
  // An exchange's lines as they are told, and the moments among them, set apart from them, by what the engine says
  // each is (AR-05); what is seen from up high is set where it was told (after the view from the top, before the way
  // down), as a panorama.
  static of(lines: Exchange['lines']) {
    const { sights, told } = Panorama.read(lines), first = Math.min(...told);
    const kept = lines.map((l, i) => ({ l, i })).filter(({ l, i }) => !told.has(i) && !l.ended && !l.levelled);
    return { plain: kept.filter(x => !sights.length || x.i < first).map(x => x.l), sights,
      rest: sights.length ? kept.filter(x => x.i > first).map(x => x.l) : [],
      ended: lines.find(l => l.ended)?.ended, levels: lines.flatMap(l => l.levelled ? [l.levelled] : []) };
  }
  // What was seen through, large; what it was worth; and, where it is enough for a level, when that is taken up.
  static SeenThrough({ ended, ready }: { ended: Ended; ready?: string }) {
    const { who, gain, amount, what } = ended;
    return (
      <div className="seen-through" role="note" data-id="seen-through">
        <p className="kicker">Seen through</p>
        <p className="what">{Typography.curl(Words.upper(what))}</p>
        <p className="gain">{Typography.curl(`${who} ${gain} ${amount} experience.`)}</p>
        {ready && <p className="next">{Typography.curl(ready)}.</p>}
      </div>
    );
  }
  // Who in the company has enough for their next level, and how it is taken up.
  static ready(screen: Frame['screen']): string | undefined {
    const m = screen.party.find(x => x.toward?.ready), brings = m?.next?.length ? `, which brings ${m.next.join(', ')}` : '';
    return m && `${screen.party.length > 1 ? `${m.name}: ` : ''}Enough for level ${m.toward!.level}${brings}, taken up after a`
      + ' night under a roof';
  }
  // Who and the level, what it gave, and the development it brings to be spent; several at once, as one moment.
  static Levelled({ levels }: { levels: Levelled[] }) {
    const { who, hp } = levels[0]!, one = levels.length === 1;
    return (
      <div className="seen-through levelled" role="note" data-id="levelled">
        <p className="kicker">{one ? 'A level gained' : 'Levels gained'}</p>
        <p className="what">{levels.map(l => `${l.who}, level ${l.level}`).join('; ')}</p>
        <p className="gain">{Typography.curl(one ? `${hp} more hit points, and a development to spend on ${who}’s page.`
          : 'More hit points for each, and a development each to spend on their pages.')}</p>
      </div>
    );
  }
}
