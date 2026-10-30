import { useState, type ChangeEvent, type CSSProperties } from 'react';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { CreationRules } from '../creation-rules';
import { CreationDefaults } from '../creation-defaults';
import { Words } from '../words';
import { CreationSheet } from './creation-sheet';
import { KitSheet } from './kit-sheet';

// Last, your name: how you present (a woman, a man, neither: the words the world will speak of you in, and the
// portrait on your card in a fight), in three quiet words above it; the name itself, one your people give their own
// (OWN-16: everyone had been Wenna), large, to be written over in place; and beneath it a table of names to roll on,
// up to six of your people's for how you present, in rows of three (emptied, the first of them waits in the name, its
// place in the table edged, and is the one set out with). A name written stays as it is; one drawn or taken from the
// table follows a new way of presenting or a new people, as the table does (a man's name taken from his table had
// stayed on a woman). Beneath, the life chosen in a line. Behind Details, everything else you set out with, as it
// stands until changed (the weapon, the qualities, a trade of your own); then setting out.
export class NameStep {
  static readonly presenting = [['she', 'Woman'], ['he', 'Man'], ['they', 'Neither']] as const;
  static View({ app }: { app: ReaderApp }) {
    const [open, show] = useState(false), m = app.state.party[0]!, setting = app.state.setting;
    // The table is rolled again for how you present and your people as they are: changed, it starts again at the top.
    const key = `${m.raceId ?? ''}:${m.pronouns ?? ''}`, [rolled, roll] = useState({ key, n: 0 });
    // Changed, the roll is forgotten, not kept for the next time you come back to presenting so.
    if (rolled.key !== key) { roll({ key, n: 0 }); }
    const n = rolled.key === key ? rolled.n : 0, names = CreationDefaults.names(m, setting);
    const table = CreationDefaults.table(m, setting, n), waiting = m.name?.trim() ? undefined : names[0];
    return (
      <div className="naming">
        <p className="presenting" role="group" aria-label="How you present">
          {NameStep.presenting.map(([id, word]) => <button key={id} type="button" aria-pressed={m.pronouns === id}
            data-nav data-action="presenting" data-id={id} onClick={() => app.opening.edit(0, 'pronouns', id)}>
            {word}</button>)}</p>
        <label className="name-field"><span className="sr">Your name</span>
          <input value={m.name ?? ''} placeholder={names[0]} data-field="name" data-nav maxLength={40} autoComplete="off"
            spellCheck={false}
            onChange={(e: ChangeEvent<HTMLInputElement>) => app.opening.edit(0, 'name', e.currentTarget.value)} /></label>
        {table.length > 0 && <p className="name-table" role="group" aria-label="Names your people give"
          style={{ '--cols': table.length === 4 ? 2 : Math.min(3, table.length) } as CSSProperties}>
          {table.map(name => <button key={name} type="button" className={`name-option${name === waiting ? ' waiting' : ''}`}
            aria-pressed={name === m.name} data-nav data-action="name-option" data-name={name}
            onClick={() => NameStep.take(app, name)}>{Typography.curl(name)}</button>)}</p>}
        {names.length > table.length && <button type="button" className="quiet-word roll-names" data-nav
          data-action="roll-names" onClick={() => roll({ key, n: n + 1 })}>Roll again</button>}
        <p className="life">{Typography.curl(NameStep.life(app).join(' '))}</p>
        <p className="creation-go">
          <button type="button" className="quiet-word details" data-nav data-action="details" onClick={() => show(true)}>
            Details</button>
          <button type="button" className="option go" data-nav data-action="start" onClick={app.opening.begin}>Set out</button>
        </p>
        {open && <CreationSheet.View title="What you set out with" onClose={() => show(false)}>
          <KitSheet.View app={app} /></CreationSheet.View>}
      </div>
    );
  }
  // A name taken from the table is the player's to bear but still the table's: it is set as written is, and counted as
  // drawn (named: false), so a new way of presenting or a new people draws again (see ReaderOpening.edit).
  static take(app: ReaderApp, name: string) {
    app.opening.edit(0, 'name', name);
    app.setState({ named: false });
  }
  // The life chosen, in a few sentences, its way in its noun: "An elf abjurer. The brothers' errand. Once a novice
  // of the order. A battleaxe in hand." ("A dwarf warrior, tough as old boots"; "A human cleric of Life".)
  static life(app: ReaderApp): string[] {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    const people = catalog.ancestries.find(a => a.id === m.raceId), calling = catalog.callings.find(c => c.id === m.classId);
    const special = calling?.specializations.find(t => t.id === m.traits?.[0]);
    const weapon = calling?.weapons.find(w => w.id === (m.weapon ?? CreationRules.best(calling.weapons, m, catalog)?.id));
    const origin = s.setting?.origins?.find(o => o.id === s.origin), was = catalog.backgrounds.find(b => b.id === m.backgroundId);
    const who = [people?.name.toLowerCase(), special?.who ?? calling?.name.toLowerCase()].filter(Boolean).join(' ');
    return [`${Words.upper(who ? Words.article(who) : 'someone')}.`,
      ...origin ? [`${Words.upper(origin.title.replace(/\.$/, ''))}.`] : [],
      ...was ? [`Once ${Words.article(was.name.toLowerCase())}.`] : [],
      weapon ? `${Words.upper(Words.article(weapon.name.toLowerCase()))} in hand.` : 'Bare hands.'];
  }
}
