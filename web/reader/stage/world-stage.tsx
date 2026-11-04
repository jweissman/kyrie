import { useState } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { Screen } from '../../../src/ui/screen-types';
import { Typography } from '../../../src/presentation/typography';
import { Scenery } from '../../../src/ui/scenery';
import type { ReaderApp } from '../reader-app';
import { BoardField } from '../board-field';
import { MapView } from '../map-view';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { GlanceStage } from './glance';
import { LookAbout } from './look-about';
import { MorePane } from './more-pane';
import { PlaceStage } from './place-stage';
import { SceneSurface } from './scene-surface';
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
    // Come into a town from the country, it is first seen whole, before it is walked into.
    const [walked, walk] = useState<string>();
    const town = WorldStage.arrived(app), overview = town && walked !== screen.place.id ? town : undefined;
    return (
      <article className={`world-page scale-${surface} kind-${PlaceStage.kind(screen)}`
        + `${surface === 'scene' && (screen.dark || !Scenery.of(screen)) ? ' unpainted' : ''}`
        + `${screen.dark ? ' dark' : ''}${up ? ` raised-${up}` : ''}`} id="page">
        <header className="world-bar"><div className="title-block"><Told.Heading frame={frame} /></div></header>
        <div className="world-body">
          <section className="surface" aria-label="Where you are">
            {surface === 'board' ? <WorldStage.Board app={app} screen={screen} chosen={focus} choose={pick} />
              : <SceneSurface.View app={app} screen={screen} ways={WorldStage.ways(app)} chosen={focus} choose={pick} />}
          </section>
          <aside className="focus" aria-label="What you are attending to">
            {overview ? <WorldStage.Overview app={app} town={overview} walk={() => walk(screen.place.id)} />
              : focus ? <WorldStage.Chosen app={app} screen={screen} id={focus} draw={draw} clear={() => pick()} />
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
  static last: { here?: string; from?: string } = {};
  // The town just come into from the country, if that is how the company came.
  static arrived(app: ReaderApp): string | undefined {
    const frame = app.state.frame!, here = frame.screen.place.id;
    const town = frame.screen.path.filter(p => p.kind === 'settlement').at(-1);
    // Where the company was before here, kept across pages (and the map over them).
    if (WorldStage.last.here !== here) { WorldStage.last = { here, from: WorldStage.last.here }; }
    // From outside it: the place before was not one of the town's plan, nor in the town.
    const inside = new Set(frame.screen.plan?.cells.filter(c => !c.door).map(c => c.id) ?? []);
    const from = WorldStage.last.from;
    return town && from && !inside.has(from) && frame.travel ? town.name : undefined;
  }
  // A town come to, seen whole: its name, how it looks, how many are about and how many places it has that the
  // company knows of, and walking in (the owner, 4 November: approaching a town, a composed overview and Enter).
  static Overview({ app, town, walk }: { app: ReaderApp; town: string; walk: () => void }) {
    const frame = app.state.frame!, g = frame.leaf.glance, screen = frame.screen;
    const people = (app.menu.scene?.subjects ?? []).filter(x => x.kind === 'person').length;
    const places = screen.plan?.cells.filter(c => !c.door).length ?? 0;
    const view = screen.dark ? undefined : Scenery.of(screen);
    return (
      <section className="overview" data-region="overview" aria-live="polite">
        {view && <div className="overview-view"><PlaceStage.Country view={view} /></div>}
        <p className="label">You come to</p>
        <h2 className="to">{Typography.curl(Words.upper(town))}</h2>
        {g?.sight && <p className="sight">{Typography.curl(g.sight.text)}</p>}
        <p className="how">{[people ? `${people === 1 ? 'one person' : Words.many(people, 'person').replace(/persons$/, 'people')} about` : '',
          places > 1 ? `${places} places you can see from here` : ''].filter(Boolean).join(' · ')}</p>
        <button type="button" className="act led-act first walk-in" data-action="walk-in" onClick={walk}>
          <span className="n">Walk in</span></button>
      </section>
    );
  }
  // What the surface is: the hex board out in the wild; elsewhere the scene, the place as it is seen (its painting,
  // or the dark its light opens), its ways along it (the owner, 4 November evening: the painting is the place).
  static surface(screen: Screen): 'board' | 'scene' {
    return !screen.dark && PlaceStage.kind(screen) === 'wild' && screen.region?.land ? 'board' : 'scene';
  }
  // The choices that take the company somewhere from here: its ways, and the walks about its town.
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
  // What can be done at a way, besides going by it (the owner, 4 November evening: a door chosen, the door's own
  // acts): the acts drawn on the way, a lock picked, a padlock looked at.
  static atWay(app: ReaderApp, way: string, going: string): Choice[] {
    return WorldStage.ways(app).filter(c => c.id.startsWith(`${way}/`) && c.id !== going);
  }
  // A way chosen on the surface: where it goes and whether the company has been there, whom it last spoke with there,
  // the way's own acts, and going; or, on the board, what is known of the hex (the map's own card).
  static Chosen({ app, screen, id, draw, clear }: { app: ReaderApp; screen: Screen; id: string; draw: Draw;
    clear: () => void }) {
    if (WorldStage.surface(screen) === 'board') { return <MapView.Plan app={app} screen={screen} chosen={id} clear={clear} />; }
    const go = WorldStage.ways(app).find(c => c.id === id);
    if (!go) { return null; }
    const exit = screen.exits.find(e => e.id === id || id.startsWith(`${e.id}/`));
    const to = exit?.destination.id ?? id.replace(/^travel:/, ''), name = exit?.destination.name ?? go.label.replace(/^(To|Into) /, '');
    const cell = screen.plan?.cells.find(c => c.id === to), acts = exit ? WorldStage.atWay(app, exit.id, go.id) : [];
    return (
      <section className="chosen-place" data-id={id} aria-live="polite">
        <p className="label">{SceneSurface.whither(exit)}{exit?.visited || cell?.been ? ', where you have been'
          : ', not yet been to'}</p>
        <h2 className="to">{Typography.curl(Words.upper(name))}</h2>
        {cell?.met && <p className="met">{Typography.curl(`Where you spoke with ${Words.listed(cell.met)}.`)}</p>}
        {!go.disabled && <Act.View choice={go} draw={draw} className="led-act first go-there">
          <span className="n">{Typography.curl(go.label)}</span>
          {(go.minutes ?? 0) > 5 && <span className="why-said">{Words.span(go.minutes!)}</span>}
        </Act.View>}
        {go.disabled && <p className="shut">{Typography.curl(go.disabled)}</p>}
        {acts.length > 0 && <div className="at-way">
          <p className="label">At the way there</p>
          <ul className="acts column">{acts.map(c => <li key={c.id}>
            <Act.View choice={c} draw={draw}><span className="n">{Typography.curl(Words.upper(c.label.split(' — ')
              .slice(1).join(' — ') || c.label))}</span>
              {c.disabled && <span className="note">{Typography.curl(c.disabled)}</span>}</Act.View></li>)}</ul></div>}
        <button type="button" className="option quiet" data-action="unchoose" onClick={clear}>Back to where you are</button>
      </section>
    );
  }
}
