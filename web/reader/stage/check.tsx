import type { CSSProperties, ReactNode } from 'react';
import type { ExchangeLine } from '../../../src/presentation/narrator';
import type { Throw } from '../../../src/presentation/line-moments';
import { Typography } from '../../../src/presentation/typography';

// A roll made outside a fight, as it fell: the twenty faces of the die in a row, those that would have done it lit,
// and where the die came down. The "likely" offered before the choice is seen after it, how near it came, with no sum
// to do (Friday's surprise, the die on the table). The sentence it is read from stays its accessible name and its
// title, and anything the engine does not say is a roll (ExchangeLine.roll: AR-05) is told as it always was.
export class Check {
  // A line of what happened, as a roll where it reads as one; otherwise nothing, and the line is told as it was.
  static of(line: ExchangeLine, key: number | string): ReactNode {
    const t = line.kind === 'roll' ? line.roll : undefined;
    return t ? <Check.View key={key} sentence={line.text} roll={t} /> : undefined;
  }
  static View({ sentence, roll }: { sentence: string; roll: Throw }) {
    const said = Typography.curl(sentence), state = roll.die === undefined ? roll.sure ? 'sure' : 'beyond'
      : roll.made ? 'made' : 'missed';
    const at = roll.die === undefined ? undefined : { left: `${(roll.die - 0.5) * 5}%` } as CSSProperties;
    return (
      <p className={`roll throw ${state}`} aria-label={said}>
        <span className="who">{Typography.curl(`${roll.who} · ${[roll.what, roll.kind === 'save' ? 'save' : '']
          .filter(Boolean).join(' ')}`)}</span>
        <span className="track" aria-hidden="true">
          {Array.from({ length: 20 }, (_, i) => <i key={i} className={i + 1 >= roll.need ? 'lit' : undefined} />)}
          {at && <b className="die" style={at} />}
        </span>
        <span className="words">{Check.words(roll)}</span>
      </p>
    );
  }
  static words(roll: Throw): string {
    if (roll.die === undefined) { return roll.sure ? 'needs no luck for it' : 'has no chance of it'; }
    return `${roll.die} on the die, needing ${roll.need}`;
  }
}
