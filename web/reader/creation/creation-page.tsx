import { useEffect, useState } from 'react';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { PeopleStep } from './people-step';
import { CallingStep } from './calling-step';
import { SpecialtyStep } from './specialty-step';
import { TradeStep } from './trade-step';
import { QualitiesStep } from './qualities-step';
import { WeaponStep } from './weapon-step';
import { OriginStep } from './origin-step';
import { NameStep } from './name-step';

type Step = { id: string; ask: string; View: (p: { app: ReaderApp }) => React.ReactNode };

// Before a country: the choice of a life, one question at a time, each answered from a few large cards. It begins
// from why you have come (a debt, an errand, a child's fever, a father who did not come home), then asks your people,
// your calling and its way, what you were before if your reason leaves that open, the weapon you favour, what you are
// made of, and last your name, with the life said back. What a card means by the rules is said beneath the cards for
// the one chosen; everything chosen so far is a sentence at the foot. You are imagined, not painted: no likeness is
// chosen for you. Setting out at any page sets out as you stand; a game whose choices are all made sets out from the
// last.
export class CreationPage {
  static steps(app: ReaderApp): Step[] {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!, country = s.setting?.title ?? 'this country';
    const calling = catalog.callings.find(c => c.id === m.classId);
    const origin = s.setting?.origins?.find(o => o.id === s.origin);
    return [{ id: 'why', ask: `Why have you come to ${country}?`, View: OriginStep.View },
      { id: 'you', ask: 'Of what people are you?', View: PeopleStep.View },
      { id: 'calling', ask: 'What is your calling?', View: CallingStep.View },
      ...calling?.specializations.length ? [{ id: 'specialty', ask: SpecialtyStep.ask(calling), View: SpecialtyStep.View }] : [],
      ...origin && !origin.background ? [{ id: 'trade', ask: 'What were you, before?', View: TradeStep.View }] : [],
      ...calling?.weapons.length ? [{ id: 'weapon', ask: 'What do you carry into a fight?', View: WeaponStep.View }] : [],
      { id: 'qualities', ask: 'What are you made of?', View: QualitiesStep.View },
      { id: 'name', ask: 'And what are you called?', View: NameStep.View }];
  }
  static View({ app }: { app: ReaderApp }) {
    const [at, go] = useState('why'), s = app.state, setting = s.setting;
    useEffect(() => { document.querySelector('.creation-body')?.scrollTo({ top: 0 }); }, [at]);
    if (!setting || !s.catalog || !s.party[0]) { return null; }
    const steps = CreationPage.steps(app), i = Math.max(0, steps.findIndex(x => x.id === at)), step = steps[i]!;
    const back = steps[i - 1], next = steps[i + 1];
    return (
      <div className="creation" data-mode="create">
        <header className="creation-head">
          <p className="kicker">{Typography.curl(setting.title)}<span>{Typography.curl(setting.pitch.heading)}</span></p>
          <nav aria-label="The choice of a life"><ol className="steps">{steps.map((x, n) => <li key={x.id}>
            <button type="button" className="step" data-step={x.id} aria-label={x.ask}
              aria-current={n === i ? 'step' : undefined} data-done={n < i || undefined} onClick={() => go(x.id)} /></li>)}</ol></nav>
          <button type="button" className="set-out-now" data-action="start" onClick={app.opening.begin}>Set out now</button>
        </header>
        <div className="creation-body" data-page={step.id}>
          <h1 className="ask">{Typography.curl(step.ask)}</h1>
          {i === 0 && <p className="pitch">{Typography.curl(setting.pitch.text)}</p>}
          <step.View app={app} />
        </div>
        <footer className="creation-foot">
          {back ? <button type="button" className="option back" data-nav onClick={() => go(back.id)}>Back</button> : <span />}
          <p className="so-far" aria-label="You so far">{Typography.curl(NameStep.life(app).join(' '))}</p>
          {next ? <button type="button" className="option go" data-nav data-action="next" onClick={() => go(next.id)}>
            Continue</button> : <span />}
        </footer>
      </div>
    );
  }
}
