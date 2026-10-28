import { useState } from 'react';
import type { ReaderApp } from '../reader-app';
import { Toast } from '../toast';
import { Typography } from '../../../src/presentation/typography';
import { CreationRules } from '../creation-rules';
import { Words } from '../words';
import { PeopleStep } from './people-step';
import { CallingStep } from './calling-step';
import { QualitiesStep } from './qualities-step';
import { WeaponStep } from './weapon-step';
import { OriginStep } from './origin-step';

type Step = { id: string; title: string; View: (p: { app: ReaderApp }) => React.ReactNode };

// Before a country: who comes into it, chosen as a book is opened, a page at a time: who you are and your people;
// your calling; your qualities; the weapon you set out with; and why you have come. Each page's choices are cards,
// each saying what it is and what it does by the rules; what you are so far is beside them, with setting out. You are
// imagined, not painted: no likeness is chosen for you (the owner's interim report, M17).
export class CreationPage {
  static readonly steps: Step[] = [{ id: 'you', title: 'You', View: PeopleStep.View },
    { id: 'calling', title: 'Your calling', View: CallingStep.View },
    { id: 'qualities', title: 'Your qualities', View: QualitiesStep.View },
    { id: 'weapon', title: 'Your weapon', View: WeaponStep.View },
    { id: 'why', title: 'Why you have come', View: OriginStep.View }];
  static View({ app }: { app: ReaderApp }) {
    const [at, go] = useState(0), s = app.state, setting = s.setting;
    if (!setting || !s.catalog || !s.party[0]) { return null; }
    const step = CreationPage.steps[at]!, next = CreationPage.steps[at + 1];
    return (
      <div className="creation" data-mode="create">
        <header className="creation-head">
          <p className="label">{Typography.curl(setting.title)}</p>
          <h1>{Typography.curl(setting.pitch.heading)}</h1>
          <p className="pitch">{Typography.curl(setting.pitch.text)}</p>
          <nav aria-label="Making you"><ol className="steps">{CreationPage.steps.map((x, i) => <li key={x.id}>
            <button type="button" className="step" data-step={x.id} aria-current={i === at ? 'step' : undefined}
              onClick={() => go(i)}><i>{i + 1}</i>{x.title}</button></li>)}</ol></nav>
        </header>
        <main className="creation-page" aria-label={step.title} data-page={step.id}>
          <step.View app={app} />
          <p className="turn">
            {at > 0 && <button type="button" className="option back" onClick={() => go(at - 1)}>Back</button>}
            {next ? <button type="button" className="option on" data-action="next" onClick={() => go(at + 1)}>
              {`On to ${next.title.toLowerCase()}`}</button>
              : <button type="button" className="option go" data-nav data-action="start" onClick={app.opening.begin}>
                Set out</button>}
          </p>
        </main>
        <CreationPage.SoFar app={app} go={go} />
        <Toast.View app={app} />
      </div>
    );
  }
  // What you are so far, each line going back to the page it was chosen on; and setting out, at any page.
  static SoFar({ app, go }: { app: ReaderApp; go: (i: number) => void }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    const people = catalog.ancestries.find(a => a.id === m.raceId), calling = catalog.callings.find(c => c.id === m.classId);
    const special = calling?.specializations.find(t => t.id === m.traits?.[0]);
    const weapon = calling?.weapons.find(w => w.id === (m.weapon ?? CreationRules.best(calling.weapons, m, catalog)?.id));
    const origin = s.setting?.origins?.find(o => o.id === s.origin);
    const scores = catalog.qualities.map(q => `${q.name.slice(0, 3)} ${CreationRules.score(m, catalog, q.id)}`);
    const lines: [number, string][] = [[0, `${m.name ?? 'You'}, ${people?.name.toLowerCase() ?? ''}`],
      [1, [calling?.name, special?.name].filter(Boolean).join(', ')], [2, scores.join(' · ')],
      [3, weapon ? Words.upper(Words.article(weapon.name)) : 'Bare hands'], [4, origin?.title ?? 'For no reason yet']];
    return (
      <aside className="so-far" aria-label="You so far">
        <p className="label">You so far</p>
        <ul>{lines.map(([i, text]) => <li key={i}><button type="button" className="line" onClick={() => go(i)}>
          {Typography.curl(text)}</button></li>)}</ul>
        <p className="out">
          <button type="button" className="option go" data-nav data-action="start" onClick={app.opening.begin}>Set out</button>
          <button type="button" className="option" data-nav data-action="another" onClick={app.opening.anew}>
            Another country</button>
        </p>
      </aside>
    );
  }
}
