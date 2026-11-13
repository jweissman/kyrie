import { useEffect, useState, type ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { PeopleStep } from './people-step';
import { CallingStep } from './calling-step';
import { OriginStep } from './origin-step';
import { NameStep } from './name-step';
import { BeforeStep } from './before-step';
import { Signature } from './signature';

import type { CreationStep, CreationStepId } from '../../engine/creation-flow';

type StepView = (p: { app: ReaderApp; step: CreationStep; onward?: ReactNode }) => ReactNode;

// Before a country: the choice of a life, the cards and almost nothing else (OWN-14). One question to a page, centred
// on the country's ground as the title is: why you have come, your people, your calling and its way where it has one,
// and last your name. Each page its cards, the chosen card's sentence, Details (its rules, over the page) and
// Continue; Back and Set out now are quiet words in the corners. What creation does not ask (the weapon, the
// qualities, a trade of your own) stands as it is until changed, behind Details on the last page. You are imagined,
// not painted: no likeness is chosen for you. Setting out at any page sets out as you stand.
export class CreationPage {
  // Each page of the flow by its step (the engine's CreationFlow: its question, its cards, which is chosen); how you
  // present is asked on the name's page, above it, as the three words the world will speak of you in (OWN-16).
  static readonly views: Partial<Record<CreationStepId, StepView>> = { why: OriginStep.View, you: PeopleStep.View,
    calling: CallingStep.View, before: BeforeStep.View, name: NameStep.View };
  static steps(app: ReaderApp): (CreationStep & { View: StepView })[] {
    return (app.opening.flow()?.steps() ?? []).flatMap(step => {
      const View = CreationPage.views[step.id];
      return View ? [{ ...step, View }] : [];
    });
  }
  static View({ app }: { app: ReaderApp }) {
    const [at, go] = useState('why'), s = app.state, [named, name] = useState(false);
    useEffect(() => { if (at === 'name') { name(true); } }, [at]);
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
          <div className="creation-inner" key={step.id}>
            <h1 className="ask">{Typography.curl(step.ask)}</h1>
            <step.View app={app} step={step} onward={onward} />
          </div>
        </div>
        <nav className="creation-edge" aria-label="The choice of a life">
          {back ? <button type="button" className="quiet-word back" data-nav onClick={() => go(back.id)}>Back</button>
            : <button type="button" className="quiet-word another" data-nav data-action="another" onClick={app.opening.anew}>
              Another country</button>}
          {next && <button type="button" className="quiet-word set-out-now" data-action="start" onClick={app.opening.begin}>
            Set out now</button>}
        </nav>
        <Signature.View app={app} likeness={named} />
      </div>
    );
  }
}
