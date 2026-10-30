import type { CSSProperties, ReactNode } from 'react';
import type { ExchangeLine } from '../../../src/presentation/narrator';
import { Typography } from '../../../src/presentation/typography';

// A roll made outside a fight, as it fell: the twenty faces of the die in a row, those that would have done it lit,
// and where the die came down. The "likely" offered before the choice is seen after it, how near it came, with no sum
// to do (Friday's surprise, the die on the table). The sentence it is read from stays its accessible name and its
// title, and anything not read as a roll is told as it always was.
export interface Throw {
  who: string; what: string; kind: 'check' | 'save';
  // The face that came up, when the die was rolled; the least face that would have done it (2 to 20 for a roll; 1
  // when nothing was needed of luck, 21 when no luck could have done it); and whether it was done.
  die?: number; need: number; made: boolean;
  // Unrolled: true when it could not fail, false when it could not succeed.
  sure?: boolean;
}
export class Check {
  // CombatPresenter.check and CombatPresenter.save, read back: made or failed, and what the die and the rest added.
  static readonly rolled = /^(.+?) (makes|fails) the (.+?) check \(d20 (\d+) \+ .+ = (-?\d+) against (\d+)\)\.$/;
  static readonly unrolled =
    /^(.+?) (needs no luck for it|has no chance of it) \((.+?): at (?:worst|best) (-?\d+) against (\d+)\)\.$/;
  static readonly saved =
    /^(.+?) (passes|fails) the (.*?) save \(d20 (\d+) \+ .+ = (-?\d+) against (\d+)(?:; [^)]+)?\)\.$/;
  static read(text: string): Throw | undefined {
    const plain = Check.unrolled.exec(text);
    if (plain) {
      const [, who, said, what] = plain, sure = said === 'needs no luck for it';
      return { who: who!, what: Check.named(what!), kind: 'check', need: sure ? 1 : 21, made: sure, sure };
    }
    const check = Check.rolled.exec(text), save = check ? undefined : Check.saved.exec(text), m = check ?? save;
    if (!m) { return undefined; }
    const [, who, said, what, die, total, against] = m, face = Number(die);
    const need = Math.min(20, Math.max(2, Number(against) - (Number(total) - face)));
    return { who: who!, what: Check.named(what!), kind: check ? 'check' : 'save', die: face, need,
      made: said === 'makes' || said === 'passes' };
  }
  // A skill as the page says it ("sleight_of_hand" is "sleight of hand").
  static named(skill: string): string { return skill.replace(/_/g, ' ').trim(); }
  // A line of what happened, as a roll where it reads as one; otherwise nothing, and the line is told as it was.
  static of(line: ExchangeLine, key: number | string): ReactNode {
    const t = line.kind === 'roll' ? Check.read(line.text) : undefined;
    return t ? <Check.View key={key} sentence={line.text} roll={t} /> : undefined;
  }
  static View({ sentence, roll }: { sentence: string; roll: Throw }) {
    const said = Typography.curl(sentence), state = roll.die === undefined ? roll.sure ? 'sure' : 'beyond'
      : roll.made ? 'made' : 'missed';
    const at = roll.die === undefined ? undefined : { left: `${(roll.die - 0.5) * 5}%` } as CSSProperties;
    return (
      <p className={`roll throw ${state}`} aria-label={said} title={said}>
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
