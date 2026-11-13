import type { Choice } from '../../../src/ui/choice-list';
import type { Compass, Route } from '../../../src/presentation/glance-types';
import { Typography } from '../../../src/presentation/typography';
import { Signs } from '../../../src/presentation/signs';
import type { ReaderApp } from '../reader-app';
import type { Draw } from './act';
import { ChoiceRow } from './choice-row';
import { GlanceStage } from './glance';

// The compass inside an enclosed place (CN-02, CN-03; the owner, 14 November: inside a building the world map had
// opened, with a confusing Back and no way to the other places about). The engine's (Glance.compass): the way out,
// the next known place worth going inside, and whether nothing known is left. Drawn as two rows in the scene's own
// column, where the way back had been: Out (its arrow, back the way out), and On (its arrow, further in); under each the
// route as its ways in order and its time, a route line in the rows' own quiet ink, no colour of its own. What bars the
// way out says so, and nothing is done by it. The rail's map gives way to it (see SceneRail.Books).
export class CompassStage {
  static of(app: ReaderApp): Compass | undefined {
    const g = app.state.frame?.leaf.glance;
    return g?.enclosed ? g.compass ?? { exhausted: false } : undefined;
  }
  // The choice a route is followed by: the menu's own where it has it (the one way on, leg by leg), else the route's
  // command as the map's travel is (travel:<place>).
  static choice(app: ReaderApp, r: Route, label: string): Choice | undefined {
    if (!r.command) { return undefined; }
    return GlanceStage.choice(app, r.command) ?? { id: r.command, label, tone: 'way', command: r.command };
  }
  // The route's line: each way, a chevron between, and how long.
  static line(r: Route): string {
    const ways = r.ways.map(w => Typography.curl(w)).join(' › ');
    return r.minutes ? `${ways} · ${CompassStage.minutes(r.minutes)}` : ways;
  }
  static minutes(m: number): string {
    return m < 60 ? `${m} minute${m === 1 ? '' : 's'}` : `${Math.round(m / 6) / 10} hours`.replace(/^1 hours/, 'an hour');
  }
  static Row({ app, draw, route, kind }: { app: ReaderApp; draw: Draw; route: Route; kind: 'out' | 'on' }) {
    const words = `${kind === 'out' ? 'Out to' : 'On to'} ${route.name}`;
    // Its sign the shared table's (Signs): out, or further in; shut where something bars it.
    const sign = Signs.way(kind === 'out' ? 'Out' : 'Into', !!route.barred);
    const label = <><span className="compass-arrow" aria-hidden="true">{sign}</span>
      {Typography.curl(words)}</>;
    const c = CompassStage.choice(app, route, words), line = <span className="route-line">{CompassStage.line(route)}</span>;
    const className = `quiet-row compass-${kind}`;
    if (route.barred || !c) {
      return <ChoiceRow.Button className={`${className} shut`} data={{ action: `compass-${kind}`, to: route.to }}
        onClick={() => undefined} label={label} aside={<>{line}{route.barred && <span className="barred">
          {Typography.curl(route.barred)}</span>}</>} />;
    }
    if (draw.index.has(c.id)) {
      return <ChoiceRow.Act choice={c} draw={draw} className={className} label={label} aside={line} />;
    }
    return <ChoiceRow.Button className={className} data={{ action: `compass-${kind}`, choice: c.id, to: route.to }}
      act={c.id} onClick={() => app.choose(c)} label={label} aside={line} />;
  }
  // Both rows, as the column draws them: the way on left out where the scene leads with it already.
  static View({ app, draw, drawn }: { app: ReaderApp; draw: Draw; drawn: (string | undefined)[] }) {
    const compass = CompassStage.of(app);
    if (!compass) { return null; }
    const on = compass.next && !drawn.includes(compass.next.command) ? compass.next : undefined;
    return <span className="compass-rows" data-region="compass">
      {on && <CompassStage.Row app={app} draw={draw} route={on} kind="on" />}
      {compass.out && <CompassStage.Row app={app} draw={draw} route={compass.out} kind="out" />}
      {compass.exhausted && <span className="compass-done">Nothing more is known in here.</span>}
    </span>;
  }
}
