import { useRef, type ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import { WeaponStep } from './weapon-step';
import { QualitiesStep } from './qualities-step';
import { TradeStep } from './trade-step';

type Part = [string, string, (p: { app: ReaderApp }) => ReactNode];

// Everything a protagonist sets out with that creation does not ask (OWN-14: fewer pages), behind Details on the last
// page, each as it stands until changed: the weapon in hand, the qualities as rolled and placed, and, for one who
// brings their own trade, the trade. A part at a time, from the words at the head, or all of it, scrolling down.
export class KitSheet {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, origin = s.setting?.origins?.find(o => o.id === s.origin), body = useRef<HTMLDivElement>(null);
    const parts: Part[] = [['weapon', 'In hand', WeaponStep.View], ['qualities', 'Qualities', QualitiesStep.View],
      ...origin && !origin.background ? [['trade', 'Trade', TradeStep.View] as Part] : []];
    return (
      <div className="kit" ref={body}>
        <nav className="kit-jump" aria-label="Parts">{parts.map(([id, title]) => <button key={id} type="button"
          className="quiet-word" data-nav data-step={id} onClick={() => body.current?.querySelector(`[data-part="${id}"]`)
            ?.scrollIntoView({ block: 'start', behavior: 'smooth' })}>{title}</button>)}</nav>
        {parts.map(([id, title, View]) => <section key={id} className="kit-part" data-part={id} aria-label={title}>
          <h3>{title}</h3><View app={app} /></section>)}
      </div>
    );
  }
}
