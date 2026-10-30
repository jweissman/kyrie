import { useState, type ChangeEvent } from 'react';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { CreationRules } from '../creation-rules';
import { Words } from '../words';
import { CreationSheet } from './creation-sheet';
import { KitSheet } from './kit-sheet';

// Last, your name: one your people give their own, drawn for you (OWN-16: everyone had been Wenna), large, to be
// written over in place or drawn again (emptied, the drawn name waits in it, and is the one set out with); and beneath
// it the life chosen in a line. Behind Details, everything else you set out with, as it stands until changed (the
// weapon, the qualities, a trade of your own); then setting out.
export class NameStep {
  static View({ app }: { app: ReaderApp }) {
    const [open, show] = useState(false), m = app.state.party[0]!, drawn = app.state.setting?.names?.[m.raceId ?? ''];
    return (
      <div className="naming">
        <label className="name-field"><span className="sr">Your name</span>
          <input value={m.name ?? ''} placeholder={drawn?.[0]} data-field="name" data-nav maxLength={40} autoComplete="off"
            spellCheck={false}
            onChange={(e: ChangeEvent<HTMLInputElement>) => app.opening.edit(0, 'name', e.currentTarget.value)} /></label>
        {!!drawn?.length && <button type="button" className="quiet-word another-name"
          data-nav data-action="another-name" onClick={app.opening.rename}>Another name</button>}
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
