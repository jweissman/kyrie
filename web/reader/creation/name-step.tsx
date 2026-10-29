import type { ChangeEvent } from 'react';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { CreationRules } from '../creation-rules';
import { Words } from '../words';

// Last, your name, and the life chosen said back as a few sentences: who you are, why you have come, what you were,
// what you carry into a fight. Then setting out, or another country.
export class NameStep {
  static View({ app }: { app: ReaderApp }) {
    const m = app.state.party[0]!;
    return (
      <div className="naming">
        <label className="name-field"><span className="sr">Your name</span>
          <input value={m.name ?? ''} data-field="name" data-nav autoComplete="off" spellCheck={false}
            onChange={(e: ChangeEvent<HTMLInputElement>) => app.opening.edit(0, 'name', e.currentTarget.value)} /></label>
        <p className="life">{Typography.curl(NameStep.life(app).join(' '))}</p>
        <p className="out">
          <button type="button" className="option go" data-nav data-action="start" onClick={app.opening.begin}>Set out</button>
          <button type="button" className="option" data-nav data-action="another" onClick={app.opening.anew}>
            Another country</button>
        </p>
      </div>
    );
  }
  // The life chosen, in sentences: "Wenna, a human warrior. The brothers' errand. Once a novice of the order. A
  // battleaxe in hand."
  static life(app: ReaderApp): string[] {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    const people = catalog.ancestries.find(a => a.id === m.raceId), calling = catalog.callings.find(c => c.id === m.classId);
    const special = calling?.specializations.find(t => t.id === m.traits?.[0]);
    const weapon = calling?.weapons.find(w => w.id === (m.weapon ?? CreationRules.best(calling.weapons, m, catalog)?.id));
    const origin = s.setting?.origins?.find(o => o.id === s.origin), was = catalog.backgrounds.find(b => b.id === m.backgroundId);
    const who = [people?.name.toLowerCase(), calling?.name.toLowerCase()].filter(Boolean).join(' ');
    return [`${m.name ?? 'You'}, ${who ? Words.article(who) : 'someone'}${special ? ` (${special.name})` : ''}.`,
      ...origin ? [`${Words.upper(origin.title.replace(/\.$/, ''))}.`] : [],
      ...was ? [`Once ${Words.article(was.name.toLowerCase())}.`] : [],
      weapon ? `${Words.upper(Words.article(weapon.name.toLowerCase()))} in hand.` : 'Bare hands.'];
  }
}
