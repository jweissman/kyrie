import type { Exchange } from '../../../src/presentation/narrator';
import type { Frame } from '../../engine/protocol';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';

// The moments the page sets apart from the run of what happened (Mission 16's brief: vary the rhythm and intensity
// for exceptional events). Something seen through (the Long Man, the fever) is the end of a chapter; a level gained
// is a moment of the person who gains it, lighter, where the free play read it as one more line after a night's rest.
export class Moments {
  static readonly ending = /^(.+?) (each gain|gains) (\d+) experience: (.+), seen through\.$/;
  static readonly levelled = /^(.+) reaches level (\d+) \(\+(\d+) HP\)\.$/;
  // An exchange's lines as they are told, and the moments among them, set apart from them.
  static of(lines: Exchange['lines']) {
    return { plain: lines.filter(l => !this.ending.test(l.text) && !this.levelled.test(l.text)),
      ended: lines.map(l => this.ending.exec(l.text)).find(m => m !== null) ?? undefined,
      levels: lines.map(l => this.levelled.exec(l.text)).filter((m): m is RegExpExecArray => m !== null) };
  }
  // What was seen through, large; what it was worth; and, where it is enough for a level, when that is taken up.
  static SeenThrough({ ended, ready }: { ended: RegExpExecArray; ready?: string }) {
    const [, who, gain, amount, what] = ended;
    return (
      <div className="seen-through" role="note" data-id="seen-through">
        <p className="kicker">Seen through</p>
        <p className="what">{Typography.curl(Words.upper(what!))}</p>
        <p className="gain">{Typography.curl(`${who} ${gain} ${amount} experience.`)}</p>
        {ready && <p className="next">{Typography.curl(ready)}.</p>}
      </div>
    );
  }
  // Who in the company has enough for their next level, and how it is taken up.
  static ready(screen: Frame['screen']): string | undefined {
    const m = screen.party.find(x => /^Ready for level/.test(x.progress ?? ''));
    return m && `${screen.party.length > 1 ? `${m.name}: ` : ''}${m.progress!.replace(/^Ready/, 'Enough')
      .replace(/: a night under a roof$/, ', taken up after a night under a roof')}`;
  }
  // Who and the level, what it gave, and the development it brings to be spent; several at once, as one moment.
  static Levelled({ levels }: { levels: RegExpExecArray[] }) {
    const [, who, , hp] = levels[0]!, one = levels.length === 1;
    return (
      <div className="seen-through levelled" role="note" data-id="levelled">
        <p className="kicker">{one ? 'A level gained' : 'Levels gained'}</p>
        <p className="what">{levels.map(([, name, level]) => `${name}, level ${level}`).join('; ')}</p>
        <p className="gain">{Typography.curl(one ? `${hp} more hit points, and a development to spend on ${who}’s page.`
          : 'More hit points for each, and a development each to spend on their pages.')}</p>
      </div>
    );
  }
}
