import { useState } from 'react';
import type { Screen } from '../../../src/ui/screen-types';
import { Typography } from '../../../src/presentation/typography';
import { Scenery } from '../../../src/ui/scenery';
import type { ReaderApp } from '../reader-app';
import { BoardField } from '../board-field';
import { MapView } from '../map-view';
import { Words } from '../words';
import { Act } from './act';
import { GlanceStage } from './glance';
import { LookAbout } from './look-about';
import { MorePane } from './more-pane';
import { PlaceStage } from './place-stage';
import { SceneSurface } from './scene-surface';
import { Raised } from './raised';
import { Told } from './told';
import { WaysPane } from './ways-pane';

// Where the company is, as a world it moves through (the owner, 4 November, evening; spatial-play.md). Across the
// stage the place bar (where, how deep, the hour); under it the surface and, beside it, the focus.
// Out in the wild the surface is the world map, the whole stage, for exploring and finding: a hex chosen is described
// (what it is, what is known of it, the way there) and set out for, a town entered; the hex the company stands in is
// described too, and entered by its own button. Nothing is done in a hex from the map (the owner: "the world map is for
// exploration and discovery, not conversation and interaction").
// Entered, and in a town, a building, a site or under the ground, the surface is the place as it is seen (its
// painting, never anything over it) and the focus beside it all that can be done there: what just happened, the few
// things worth doing, who and what is here, the ways from here, and what the company can do of itself.
export class WorldStage {
  static View({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, screen = frame.screen, draw = Act.draw(app), up = Raised.up(app);
    const here = screen.place.id;
    // What is chosen on the map, and whether the company has gone into the hex it stands in: both belong to this place.
    const [chosen, choose] = useState<{ at: string; id?: string }>({ at: here });
    const [entered, enter] = useState<string>();
    const pick = (id?: string) => choose({ at: here, id });
    const overworld = WorldStage.wild(screen) && entered !== here, focus = chosen.at === here ? chosen.id : undefined;
    const view = screen.dark ? undefined : Scenery.of(screen) ?? Scenery.inside(screen);
    return (
      <article className={`world-page scale-${overworld ? 'board' : 'scene'} kind-${PlaceStage.kind(screen)}`
        + `${view ? '' : ' unpainted'}${screen.dark ? ' dark' : ''}${up ? ` raised-${up}` : ''}`} id="page">
        <header className="world-bar"><div className="title-block"><Told.Heading frame={frame} /></div></header>
        <div className="world-body">
          <section className="surface" aria-label="Where you are">
            {overworld ? <WorldStage.Board app={app} screen={screen} chosen={focus} choose={pick} />
              : <SceneSurface.View screen={screen} />}
          </section>
          <aside className="focus" aria-label={overworld ? 'On the map' : 'What you are attending to'}>
            {overworld ? <WorldStage.Hex app={app} screen={screen} id={focus} clear={() => pick()}
              enter={() => enter(here)} />
              : <>{WorldStage.wild(screen) && <button type="button" className="option quiet back-to-map"
                data-action="back-to-map" onClick={() => enter(undefined)}>Back out to the map</button>}
                {frame.leaf.glance ? <GlanceStage.View app={app} draw={draw} />
                  : <div className="telling"><Told.Place app={app} headed={false}
                    here={<PlaceStage.Here app={app} draw={draw} />} /></div>}</>}
          </aside>
        </div>
        {up === 'look' && <LookAbout.Sheet app={app} draw={draw} />}
        {up === 'ways' && <WaysPane.Sheet app={app} draw={draw} />}
        {up === 'more' && <MorePane.Sheet app={app} draw={draw} />}
      </article>
    );
  }
  // Whether the company stands in the open country, where the world map is the surface.
  static wild(screen: Screen): boolean {
    return PlaceStage.kind(screen) === 'wild' && !!screen.region?.land;
  }
  // The world map, the whole stage: a hex chosen is described beside it, chosen again set out for.
  static Board({ app, screen, chosen, choose }: { app: ReaderApp; screen: Screen; chosen?: string;
    choose: (id?: string) => void }) {
    const pick = (id: string) => {
      if (chosen === id) { const go = MapView.way(screen, id).go; if (go && !Act.asks(go)) { app.choose(go); return; } }
      choose(id);
    };
    return <div className="board-surface"><BoardField.View region={screen.region!} chosen={chosen} choose={pick}
      face={screen.party[0]?.face?.src} /></div>;
  }
  // What the map says of a hex: the one the company stands in (what it is, whether anyone is about, and entering it);
  // a town (entered from here); or anywhere else, as the map's own card says it (what is known of it, the way there).
  static Hex({ app, screen, id, clear, enter }: { app: ReaderApp; screen: Screen; id?: string; clear: () => void;
    enter: () => void }) {
    if (id) {
      const town = screen.region?.areas.find(a => a.id === id && a.kind === 'settlement');
      return town ? <WorldStage.Town app={app} screen={screen} town={town} clear={clear} />
        : <MapView.Plan app={app} screen={screen} chosen={id} clear={clear} />;
    }
    const g = app.state.frame!.leaf.glance, land = screen.region!.land!;
    const people = (app.menu.scene?.subjects ?? []).filter(x => x.kind === 'person').length;
    const danger = (app.menu.scene?.subjects ?? []).some(x => x.danger);
    return (
      <section className="hex-card" data-id={screen.place.id} aria-live="polite">
        <p className="label">Where you are</p>
        <h2 className="to">{Typography.curl(Words.upper(screen.place.name))}</h2>
        {land.here !== undefined && <p className="how">{Typography.curl(Words.upper(MapView.ground(land, land.here,
          screen.region)))}</p>}
        {g?.sight && <p className="sight">{Typography.curl(g.sight.text)}</p>}
        {danger && <p className="about danger">Something here is dangerous.</p>}
        {people > 0 && <p className="about">{people === 1 ? 'Someone is here.' : 'There are people here.'}</p>}
        <button type="button" className="enter" data-action="enter-hex" onClick={enter}>
          Enter {Typography.curl(screen.place.name.replace(/^the /, ''))}</button>
        <p className="how">Choose a hex on the map to see what is known of it, and the way there.</p>
      </section>
    );
  }
  // A town chosen on the map: seen whole, how far and by what way, and entered by one large button (the owner,
  // 4 November evening: from the world map a town is entered, from a card over it).
  static Town({ app, screen, town, clear }: { app: ReaderApp; screen: Screen;
    town: NonNullable<Screen['region']>['areas'][number]; clear: () => void }) {
    const { d, here, go } = MapView.way(screen, town.id), views = Scenery.views.settlement ?? [];
    const view = views.length ? views[Scenery.hash(town.id) % views.length] : undefined;
    return (
      <section className="enter-card" data-id={town.id} aria-live="polite">
        {view && <div className="enter-view"><PlaceStage.Country view={view} /></div>}
        <p className="label">{town.visited ? 'A town you know' : 'A town'}</p>
        <h2 className="to">{Typography.curl(town.name)}</h2>
        <p className="how">{here ? 'You are here.' : d ? `${Words.upper(Words.span(d.minutes))} by the ways you know. `
          + MapView.arrival(screen, d.minutes) : go ? 'Across the country you can see.' : 'You know no way there yet.'}</p>
        {go && !here && <button type="button" className="enter" data-action="enter" onClick={() => app.choose(go)}>
          Enter {Typography.curl(town.name)}</button>}
        <button type="button" className="option quiet" data-action="unchoose" onClick={clear}>Back</button>
      </section>
    );
  }
}
