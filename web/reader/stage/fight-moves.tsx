import { useState, type ButtonHTMLAttributes } from 'react';
import type { Choice, Section } from '../../../src/ui/choice-list';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act } from './act';
import { ChoiceRow } from './choice-row';
import { Paging } from '../paging';

// What the one whose turn it is can do, as a few things to do and not every act the rules allow (the owner, 9
// November: "something like eighteen action buttons"; Attack had opened a list of names). Across the foot: Attack, and
// beside it the kinds of other thing there are (Abilities, Spells, Items) and Other (defend, wait, withdraw, another
// way of striking). Attack, or anything else done to someone, is aimed by choosing whom on the field: those it can
// reach are lit on their own cards, with how likely it is, and the rest are not; one alone is struck at once.
export interface Aiming { choice: Choice; targets: Map<string, Choice> }
export class FightMoves {
  static readonly kinds: [string, string][] = [['abilities', 'Abilities'], ['spells', 'Spells'], ['carried', 'Items'],
    ['other', 'Other']];
  // One composition for the hand (CN-06, the owner, 14 November): the menu a column that never becomes a row, and
  // beside it a details region of the same height that holds what the moment needs: the kind opened, whom to choose,
  // or what the move under the hand does. Nothing is put into a row once drawn, and nothing changes the hand's size:
  // opening a kind, aiming and changing target change what the details region holds, never its box.
  static View({ app, aiming, aim, panel, open }: { app: ReaderApp; aiming?: Aiming; aim: (a?: Aiming) => void;
    panel?: string; open: (p?: string) => void }) {
    const sections = app.menu.sections, strike = sections.find(s => s.id === 'strike')?.choices ?? [];
    const onward = sections.find(s => s.id === 'onward')?.choices[0], [under, hover] = useState<Choice>();
    if (onward) {
      return <div className="hand ended"><div className="hand-menu" role="toolbar" aria-label="What you can do">
        <ChoiceRow.Act choice={onward} draw={Act.draw(app)} className="move main"
          label={Typography.curl(onward.alone ?? Words.shown(onward.label))} /></div></div>;
    }
    const attack = strike[0], shown = FightMoves.section(sections, strike, panel);
    const pace = sections.find(s => s.id === 'pace')?.choices ?? [];
    const take = (c: Choice) => FightMoves.take(app, c, aim, open);
    const note = (c: Choice) => ({ onMouseEnter: () => hover(c), onFocus: () => hover(c), onMouseLeave: () => hover(undefined) });
    return <div className={`hand${aiming ? ' aiming' : shown ? ' opened' : ''}`}>
      <div className="hand-menu" role="toolbar" aria-label={shown ? shown.title : 'What you can do'}>
        {shown ? <FightMoves.Kind key={shown.id} section={shown} take={take} note={note} close={() => open()} /> : <>
        {attack && <ChoiceRow.Button className={`move main${aiming?.choice.id === attack.id ? ' opened' : ''}`}
          data={{ action: 'attack', choice: attack.id }} act={attack.id} onClick={() => take(attack)} mark="var(--ember)"
          label={FightMoves.attack(attack)} />}
        {FightMoves.kinds.filter(([id]) => FightMoves.section(sections, strike, id)?.choices.length).map(([id, label]) =>
          <ChoiceRow.Button key={id} className="move kind" data={{ action: 'panel', panel: id }}
            onClick={() => { aim(); open(id); }} label={label} />)}
        {/* The fight's pace, the contract's own acts (ChoiceList.pace: fight:auto, and fight:through when as good as
            won): rows of the one menu, quieter, at its foot. */}
        {pace.map(c => <ChoiceRow.Act key={c.id} choice={c} draw={Act.draw(app)} className="move quiet-row"
          label={Typography.curl(Words.shown(c.label))} {...c.id === 'fight:auto' ? { extra: <kbd className="row-key">T</kbd> } : {}} />)}
        </>}
      </div>
      <div className="hand-detail" aria-live="polite">
        {aiming ? <div className="aiming" role="status">
          <p className="hand-say">{Typography.curl(`${Words.upper(FightMoves.verb(aiming.choice))}: choose whom, on the field.`)}</p>
          <button type="button" className="move quiet" data-action="unaim" onClick={() => aim()}>Not now <kbd>Esc</kbd></button>
        </div> : null}
        {/* What the move under the hand does, in the one place it is said: never inside its row. */}
        <p className="hand-note">{under?.note ? Typography.curl(`${Words.shown(under.label)}: ${under.note}`) : ''}</p>
      </div>
    </div>;
  }
  // A kind opened (the owner's ruling 2: attending replaces the foreground, more than four are paged, never unfolded):
  // its moves in place of the hand's, those that can be done first, four at a time, a row turning the page (no act) and
  // Back to the hand; what the move under the hand does is said beside it, in the details region.
  static Kind({ section, take, note, close }: { section: Section; take: (c: Choice) => void; close: () => void;
    note: (c: Choice) => Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onMouseEnter' | 'onMouseLeave' | 'onFocus'> }) {
    const [page, turn] = useState(0), all = FightMoves.flat(section.choices);
    const paged = Paging.of([...all.filter(c => !c.disabled), ...all.filter(c => c.disabled)], 4, page);
    return <>
      {paged.shown.map(c => <ChoiceRow.Button key={c.id} className={`move${c.disabled ? ' unusable' : ''}`}
        data={{ action: 'move', choice: c.id, disabled: c.disabled ? 'true' : undefined }} act={c.disabled ? undefined : c.id}
        onClick={() => take(c)} label={Typography.curl(Words.shown(c.label))}
        {...c.disabled ? { aside: Typography.curl(c.disabled) } : {}} events={note(c)} />)}
      {paged.pages > 1 && <ChoiceRow.Button className="move quiet-row" data={{ action: 'more-moves' }}
        onClick={() => turn(paged.at + 1)} mark={ChoiceRow.neutral} markClass="neutral"
        label={`More ${section.title.toLowerCase()}…`} aside={`${paged.at + 1} of ${paged.pages}`} />}
      <ChoiceRow.Button className="move quiet-row" data={{ action: 'panel-back' }} onClick={close} label="Back" />
    </>;
  }
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
  // What cannot be done now (a spell with no slot left) is never aimed: it had opened "choose whom, on the field" with
  // no one to choose and nothing saying why (the second blind playtest, BL-02: Ander's Charm Person, its one slot
  // spent). Its row says why, and touching it does nothing more.
  static take(app: ReaderApp, c: Choice, aim: (a?: Aiming) => void, open: (p?: string) => void) {
    if (c.disabled) { return; }
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
