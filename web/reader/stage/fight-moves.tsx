import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { Choice, Section } from '../../../src/ui/choice-list';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../../../src/presentation/words';
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
          label={Typography.curl(onward.alone || Words.shown(onward.label))} /></div></div>;
    }
    const attack = strike[0], shown = FightMoves.section(sections, strike, panel);
    const pace = sections.find(s => s.id === 'pace')?.choices ?? [];
    // Words (a call to yield: ChoiceList's words), a row of the hand's own beside the blow, never in a kind.
    // And the way out where the fight is reckoned grave or deadly (OR-1391), a row of the hand's own beside the blow.
    const words = ['away', 'words'].flatMap(id => sections.find(s => s.id === id)?.choices ?? []);
    const take = (c: Choice) => FightMoves.take(app, c, aim, open);
    const note = (c: Choice) => ({ onMouseEnter: () => hover(c), onFocus: () => hover(c), onMouseLeave: () => hover(undefined) });
    const kinds = FightMoves.kinds.filter(([id]) => FightMoves.section(sections, strike, id)?.choices.length);
    const said = <p className="hand-note">{under?.note ? Typography.curl(`${Words.shown(under.label)}: ${under.note}`) : ''}</p>;
    if (shown) {
      return <div className="hand opened"><FightMoves.Kind key={shown.id} section={shown} take={take} note={note}
        close={() => open()} room={(attack ? 1 : 0) + words.length + kinds.length + pace.length} said={said} /></div>;
    }
    // Whom, asked in place of the hand's rows (the owner's playtest, 26 November, OR-1296: the targets had extended a
    // copy of the menu beneath it): the rows come back once one is chosen, or the aim put aside.
    if (aiming) { return <div className="hand aiming"><FightMoves.Whom aiming={aiming} app={app} aim={aim} /></div>; }
    return <div className="hand">
      <div className="hand-menu" role="toolbar" aria-label="What you can do">
        {attack && <ChoiceRow.Button className="move main"
          data={{ action: 'attack', choice: attack.id }} act={attack.id} onClick={() => take(attack)} plain="blow"
          label={FightMoves.attack(attack)} />}
        {words.map(c => <ChoiceRow.Button key={c.id} className="move" data={{ action: 'words', choice: c.id }} act={c.id}
          onClick={() => take(c)} events={note(c)} label={Typography.curl(Words.shown(c.label))} />)}
        {kinds.map(([id, label]) =>
          <ChoiceRow.Button key={id} className="move kind" data={{ action: 'panel', panel: id }}
            onClick={() => { aim(); open(id); }} label={label} />)}
        {/* The fight's pace, the contract's own acts (ChoiceList.pace: fight:auto, and fight:through when as good as
            won): rows of the one menu, quieter, at its foot. */}
        {pace.map(c => <ChoiceRow.Act key={c.id} choice={c} draw={Act.draw(app)} className="move quiet-row"
          label={Typography.curl(Words.shown(c.label))} {...c.id === 'fight:auto' ? { extra: <kbd className="row-key">T</kbd> } : {}} />)}
      </div>
      <div className="hand-detail" aria-live="polite">
        {/* What the move under the hand does, in the one place it is said: never inside its row. */}
        {said}
      </div>
    </div>;
  }
  // Whom to aim at, asked in place of the hand's rows (OR-1296; OR-116's targets beside the act had become a second
  // menu under the first): each the act's own target, with how likely it is, as well as the reticle on its card.
  static Whom({ aiming, app, aim }: { aiming: Aiming; app: ReaderApp; aim: (a?: Aiming) => void }) {
    return <div className="aiming" role="status">
      <p className="hand-say">{Typography.curl(`${Words.upper(FightMoves.verb(aiming.choice))}: whom?`)}</p>
      <div className="whom" role="toolbar" aria-label="Whom">
        {[...aiming.targets].map(([id, t]) => <ChoiceRow.Button key={id} className="move whom-row"
          data={{ action: 'whom', choice: t.id }} act={t.id} onClick={() => app.choose(t)}
          label={Typography.curl(Words.upper(FightMoves.whom(t)))} aside={Typography.curl(t.note?.split(' · ')[0] ?? '')} />)}
      </div>
      <FightMoves.Quiet action="unaim" go={() => aim()} label="Not now" />
    </div>;
  }
  // A target's name, from its own label ("Strike the first rat" → "the first rat").
  private static whom(t: Choice): string { return t.alone || Words.shown(t.label); }
  // A kind opened (the owner's ruling 2: attending replaces the foreground, more than four are paged, never unfolded):
  // its moves in place of the hand's, in their order (what cannot be done now among them, saying why), as many at a
  // time as the hand has rows, so that the hand holds still (CN-06); turning the page (no act) and Back are beside them,
  // where aiming's Not now is, with what the move under the hand does.
  static Kind({ section, take, note, close, room, said }: { section: Section; take: (c: Choice) => void; close: () => void;
    note: (c: Choice) => Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onMouseEnter' | 'onMouseLeave' | 'onFocus'>;
    room: number; said: ReactNode }) {
    const [page, turn] = useState(0), paged = Paging.of(FightMoves.flat(section.choices), Math.min(4, room), page, true);
    return <>
      <div className="hand-menu" role="toolbar" aria-label={section.title}>
        {paged.shown.map(c => <ChoiceRow.Button key={c.id} className={`move${c.disabled ? ' unusable' : ''}`}
          data={{ action: 'move', choice: c.id, disabled: c.disabled ? 'true' : undefined }} act={c.disabled ? undefined : c.id}
          onClick={() => take(c)} label={Typography.curl(Words.shown(c.label))} glyph={c.emblem}
          {...c.disabled ? { aside: Typography.curl(c.disabled) } : {}} events={note(c)} />)}
      </div>
      <div className="hand-detail" aria-live="polite">
        <div className="aiming kind-ways">
          {paged.pages > 1 && <ChoiceRow.Button className="move quiet" data={{ action: 'more-moves' }}
            onClick={() => turn(paged.at + 1)} plain="neutral" label={`More ${section.title.toLowerCase()}…`}
            aside={`${paged.at + 1} of ${paged.pages}`} />}
          <FightMoves.Quiet action="panel-back" go={close} label="Back" />
        </div>
        {said}
      </div>
    </>;
  }
  // Out of aiming, or of a kind opened, a level at a time (Escape does the same): a row of the one menu, quiet beside
  // the moves (OR-05), never a button of the page's own (OR-94).
  static Quiet({ action, go, label }: { action: string; go: () => void; label: string }) {
    return <ChoiceRow.Button className="move quiet" data={{ action }} onClick={go} plain="neutral" label={label}
      extra={<kbd className="row-key">Esc</kbd>} />;
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
