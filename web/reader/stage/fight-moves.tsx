import type { Choice, Section } from '../../../src/ui/choice-list';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act } from './act';

// What the one whose turn it is can do, as a few things to do and not every act the rules allow (the owner, 9
// November: "something like eighteen action buttons"; Attack had opened a list of names). Across the foot: Attack, and
// beside it the kinds of other thing there are (Abilities, Spells, Items) and Other (defend, wait, withdraw, another
// way of striking). Attack, or anything else done to someone, is aimed by choosing whom on the field: those it can
// reach are lit on their own cards, with how likely it is, and the rest are not; one alone is struck at once.
export interface Aiming { choice: Choice; targets: Map<string, Choice> }
export class FightMoves {
  static readonly kinds: [string, string][] = [['abilities', 'Abilities'], ['spells', 'Spells'], ['carried', 'Items'],
    ['other', 'Other']];
  static View({ app, aiming, aim, panel, open }: { app: ReaderApp; aiming?: Aiming; aim: (a?: Aiming) => void;
    panel?: string; open: (p?: string) => void }) {
    const sections = app.menu.sections, strike = sections.find(s => s.id === 'strike')?.choices ?? [];
    const onward = sections.find(s => s.id === 'onward')?.choices[0];
    // Going on from a fight that has ended is the page's own choice, as anywhere (keys and taps find it by its place).
    if (onward) { return <div className="bar"><Act.View choice={onward} draw={Act.draw(app)} className="move main" /></div>; }
    const attack = strike[0], shown = FightMoves.section(sections, strike, panel);
    const take = (c: Choice) => FightMoves.take(app, c, aim, open);
    if (aiming) {
      return <p className="aiming" role="status">{Typography.curl(`${Words.upper(FightMoves.verb(aiming.choice))}: `
        + 'choose whom, on the field.')}<button type="button" className="move quiet" data-action="unaim"
        onClick={() => aim()}>Not now <kbd>Esc</kbd></button></p>;
    }
    return <>
      <div className="bar" role="toolbar" aria-label="What you can do">
        {attack && <button type="button" className="move main" data-action="attack" data-choice={attack.id}
          onClick={() => take(attack)}>{FightMoves.attack(attack)}</button>}
        {FightMoves.kinds.filter(([id]) => FightMoves.section(sections, strike, id)?.choices.length).map(([id, label]) =>
          <button key={id} type="button" className={`move${panel === id ? ' opened' : ''}`} data-action="panel"
            data-panel={id} aria-expanded={panel === id} onClick={() => open(panel === id ? undefined : id)}>{label}</button>)}
      </div>
      {shown && <ul className="panel" aria-label={FightMoves.kinds.find(k => k[0] === panel)?.[1]}>
        {FightMoves.flat(shown.choices).map(c => <li key={c.id}><button type="button" className="move" data-choice={c.id}
          onClick={() => take(c)}><span>{Typography.curl(Words.shown(c.label))}</span>
          {c.note && <small>{Typography.curl(c.note)}</small>}</button></li>)}
      </ul>}
    </>;
  }
  // Attack is the first way of striking (the blade to hand), said with the one it would strike where there is one.
  private static attack(c: Choice): string {
    return c.command && !c.children ? Words.shown(c.label).replace(/^Strike/, 'Attack') : 'Attack';
  }
  private static verb(c: Choice): string { return Words.shown(c.label).replace(/^Strike/, 'Attack').toLowerCase(); }
  // A kind's choices; Other is the other ways of striking (a bow besides the blade) and the rest (defend, withdraw).
  private static section(sections: Section[], strike: Choice[], id?: string): Section | undefined {
    if (id !== 'other') { return sections.find(s => s.id === id); }
    const rest = sections.find(s => s.id === 'other'), more = strike.slice(1);
    return rest || more.length ? { id: 'other', title: 'Other', tone: 'ability', glyph: '·',
      choices: [...more, ...rest?.choices ?? []] } : undefined;
  }
  // A fold of "other abilities" is opened in the panel, not a list in a list.
  private static flat(choices: Choice[]): Choice[] {
    return choices.flatMap(c => /^more:/.test(c.id) ? c.children ?? [] : [c]);
  }
  // Something to do: at once when it is done to nobody or to one alone; else aimed on the field.
  static take(app: ReaderApp, c: Choice, aim: (a?: Aiming) => void, open: (p?: string) => void) {
    open();
    if (c.command && !c.children) { app.choose(c); return; }
    const targets = new Map((c.children ?? []).flatMap(t => {
      const id = t.id.split('/').pop();
      return id && t.command ? [[id, t] as [string, Choice]] : [];
    }));
    if (targets.size === 1) { app.choose([...targets.values()][0]!); return; }
    aim({ choice: c, targets });
  }
}
