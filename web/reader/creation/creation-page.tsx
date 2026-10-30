import { useEffect, useState, type ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { PeopleStep } from './people-step';
import { CallingStep } from './calling-step';
import { SpecialtyStep } from './specialty-step';
import { OriginStep } from './origin-step';
import { NameStep } from './name-step';

type Step = { id: string; ask: string; View: (p: { app: ReaderApp; onward?: ReactNode }) => ReactNode };

// Before a country: the choice of a life, the cards and almost nothing else (OWN-14). One question to a page, centred
// on the country's ground as the title is: why you have come, your people, your calling and its way where it has one,
// and last your name. Each page its cards, the chosen card's sentence, Details (its rules, over the page) and
// Continue; Back and Set out now are quiet words in the corners. What creation does not ask (the weapon, the
// qualities, a trade of your own) stands as it is until changed, behind Details on the last page. You are imagined,
// not painted: no likeness is chosen for you. Setting out at any page sets out as you stand.
export class CreationPage {
  static steps(app: ReaderApp): Step[] {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!, country = s.setting?.title ?? 'this country';
    const calling = catalog.callings.find(c => c.id === m.classId);
    return [{ id: 'why', ask: `Why have you come to ${country}?`, View: OriginStep.View },
      { id: 'you', ask: 'Choose your ancestry', View: PeopleStep.View },
      { id: 'calling', ask: 'Choose your calling', View: CallingStep.View },
      ...calling?.specializations.length ? [{ id: 'specialty', ask: SpecialtyStep.ask(calling), View: SpecialtyStep.View }] : [],
      { id: 'name', ask: 'Choose your name', View: NameStep.View }];
  }
  static View({ app }: { app: ReaderApp }) {
    const [at, go] = useState('why'), s = app.state;
    useEffect(() => { document.querySelector('.creation-body')?.scrollTo({ top: 0 }); }, [at]);
    if (!s.setting || !s.catalog || !s.party[0]) { return null; }
    const steps = CreationPage.steps(app), i = Math.max(0, steps.findIndex(x => x.id === at)), step = steps[i]!;
    const back = steps[i - 1], next = steps[i + 1];
    const onward = next && <button type="button" className="option go" data-nav data-action="next"
      onClick={() => go(next.id)}>Continue</button>;
    // The corners come after the page, so that the keys' digits are its cards.
    return (
      <div className="creation" data-mode="create">
        <div className="creation-body" data-page={step.id}>
          <div className="creation-inner">
            <h1 className="ask">{Typography.curl(step.ask)}</h1>
            <step.View app={app} onward={onward} />
          </div>
        </div>
        <nav className="creation-edge" aria-label="The choice of a life">
          {back ? <button type="button" className="quiet-word back" data-nav onClick={() => go(back.id)}>Back</button>
            : <button type="button" className="quiet-word another" data-nav data-action="another" onClick={app.opening.anew}>
              Another country</button>}
          {next && <button type="button" className="quiet-word set-out-now" data-action="start" onClick={app.opening.begin}>
            Set out now</button>}
        </nav>
      </div>
    );
  }
}
