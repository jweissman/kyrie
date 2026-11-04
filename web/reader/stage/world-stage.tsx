import { useState } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { Screen } from '../../../src/ui/screen-types';
import { Typography } from '../../../src/presentation/typography';
import type { ReaderApp } from '../reader-app';
import { BoardField } from '../board-field';
import { MapView } from '../map-view';
import { TownPlanView } from '../town-plan-view';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { GlanceStage } from './glance';
import { LookAbout } from './look-about';
import { MorePane } from './more-pane';
import { PlaceStage } from './place-stage';
import { PlanSurface } from './plan-surface';
import { Raised } from './raised';
import { Told } from './told';
import { WaysPane } from './ways-pane';

// Where the company is, as a world it moves through (the owner, 4 November, evening; spatial-play.md): across the
// stage the place bar (where, how deep, the hour); under it the surface, the place itself as it is laid out (a town's
// plan, a building's or a cellar's rooms, the hex board in the wild), and beside it the focus, what the company is
// attending to: here (what just happened, who and what is here, the few things worth doing), or a place chosen on
// the surface (what it is, and going there). Choosing on the surface focuses; choosing again goes. The whole legal
// set is a deliberate touch away (Other possibilities, Every way); talk and fights keep their own stages.
export class WorldStage {
  static View({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, screen = frame.screen, draw = Act.draw(app), up = Raised.up(app);
    // What is chosen on the surface belongs to this place: a new place starts from here.
    const [chosen, choose] = useState<{ at: string; id?: string }>({ at: screen.place.id });
    const pick = (id?: string) => choose({ at: screen.place.id, id });
    const focus = chosen.at === screen.place.id ? chosen.id : undefined, surface = WorldStage.surface(screen);
    return (
      <article className={`world-page scale-${surface ?? 'none'} kind-${PlaceStage.kind(screen)}`
        + `${screen.dark ? ' dark' : ''}${up ? ` raised-${up}` : ''}`} id="page">
        <header className="world-bar"><div className="title-block"><Told.Heading frame={frame} /></div></header>
        <div className="world-body">
          <section className="surface" aria-label="Where you are">
            {surface === 'plan' && <PlanSurface.View app={app} screen={screen} choices={WorldStage.ways(app)}
              chosen={focus} choose={pick} />}
            {surface === 'board' && <WorldStage.Board app={app} screen={screen} chosen={focus} choose={pick} />}
            {!surface && <WorldStage.Bare app={app} />}
          </section>
          <aside className="focus" aria-label="What you are attending to">
            {focus ? <WorldStage.Chosen app={app} screen={screen} id={focus} draw={draw} clear={() => pick()} />
              : frame.leaf.glance ? <GlanceStage.View app={app} draw={draw} />
                : <div className="telling"><Told.Place app={app} headed={false} here={<PlaceStage.Here app={app} draw={draw} />} /></div>}
          </aside>
        </div>
        {up === 'look' && <LookAbout.Sheet app={app} draw={draw} />}
        {up === 'ways' && <WaysPane.Sheet app={app} draw={draw} />}
        {up === 'more' && <MorePane.Sheet app={app} draw={draw} />}
      </article>
    );
  }
  // What the surface is: the place's plan (a town, a building, a site, below ground), else the hex board in the wild,
  // else nothing drawn (a room on its own, the dark).
  static surface(screen: Screen): 'plan' | 'board' | undefined {
    if (screen.plan && screen.plan.cells.length > 1) { return 'plan'; }
    if (!screen.dark && PlaceStage.kind(screen) === 'wild' && screen.region?.land) { return 'board'; }
    return undefined;
  }
  // The choices that take the company to a place on the plan (see TownPlanView.way).
  static ways(app: ReaderApp): Choice[] {
    const scene = app.menu.scene!;
    return [...scene.near, ...scene.far, ...app.menu.around ?? []];
  }
  // The hex board, where the company stands in the wild: a hex chosen shows what is known of it, chosen again sets out.
  static Board({ app, screen, chosen, choose }: { app: ReaderApp; screen: Screen; chosen?: string;
    choose: (id?: string) => void }) {
    const pick = (id: string) => {
      if (chosen === id) { const go = MapView.way(screen, id).go; if (go && !Act.asks(go)) { app.choose(go); return; } }
      choose(id);
    };
    return <div className="board-surface"><BoardField.View region={screen.region!} chosen={chosen} choose={pick}
      face={screen.party[0]?.face?.src} /></div>;
  }
  // Nothing to lay out (one room, the dark): the place's painting, or the dark.
  static Bare({ app }: { app: ReaderApp }) {
    const screen = app.state.frame!.screen;
    return <div className="bare-surface"><p className="bare-name">{Typography.curl(Words.upper(screen.place.name))}</p>
      {screen.dark && <p className="bare-dark">It is dark.</p>}</div>;
  }
  // A place chosen on the surface: what it is, whether the company has been there, and the way to it; or, on the
  // board, what is known of the hex (the map's own card).
  static Chosen({ app, screen, id, draw, clear }: { app: ReaderApp; screen: Screen; id: string; draw: Draw;
    clear: () => void }) {
    if (WorldStage.surface(screen) === 'board') { return <MapView.Plan app={app} screen={screen} chosen={id} clear={clear} />; }
    const cell = screen.plan?.cells.find(c => c.id === id);
    if (!cell) { return null; }
    const go = TownPlanView.way(screen, WorldStage.ways(app), cell);
    const what = cell.door ? 'The way out' : cell.building ? 'A building' : cell.indoors ? 'A room' : 'A place';
    return (
      <section className="chosen-place" data-id={id} aria-live="polite">
        <p className="label">{what}{cell.been ? ', where you have been' : ', not yet been to'}</p>
        <h2 className="to">{Typography.curl(Words.upper(cell.name))}</h2>
        {go ? <Act.View choice={go} draw={draw} className="led-act first go-there">
          <span className="n">{Typography.curl(go.label)}</span>
          {go.disabled && <span className="why-said">{Typography.curl(go.disabled)}</span>}
          {(go.minutes ?? 0) > 5 && <span className="why-said">{Words.span(go.minutes!)}</span>}
        </Act.View> : <p className="how">No way there from here that you know.</p>}
        <p className="how">Choose it again on the plan to go there.</p>
        <button type="button" className="option quiet" data-action="unchoose" onClick={clear}>Back to where you are</button>
      </section>
    );
  }
}
