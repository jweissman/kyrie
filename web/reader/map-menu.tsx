import type { Screen } from '../../src/ui/screen-types';
import type { ReaderApp } from './reader-app';
import type { Choice } from '../../src/ui/choice-list';
import { MapView } from './map-view';
import { RouteCard } from './route-card';
import { ChoiceRow, type RowParts } from './stage/choice-row';
import { Words } from './words';
import { Typography } from '../../src/presentation/typography';
import { PageFrame } from './page-frame';
import { BoardField } from './board-field';
import { PlaceFacets } from '../../src/presentation/place-facets';
import { Guidance } from './guidance';
import { Attest } from '../../src/presentation/attest';
import { Fold, type Leaf } from '../../src/presentation/fold';
import { Doable } from '../../src/presentation/doable';
import { SceneRail } from './stage/scene-rail';
import { Glyphs } from './creation/glyphs';
import { Hold } from './instrument/hold';

// The map's menu (the owner, 15 November: crossing roads belong to the map, not to the scene's four; the map is a focus
// whose menu is drawn as the scene's is): at most four rows, in the one grammar. The chosen place's travel, answering where
// it goes, why (the aim's road, or only what it is) and how long; the nearest roads from here, as many as make four with
// it; and Put away the map, the last row always. Choosing a cell on the map is a presentation gesture; each row commits.
export class MapMenu {
  static readonly four = 4;
  // A journey's mark: the aim's gold where it goes to a place of the followed aim (its leaf: the journey itself, as the
  // glance's following has it, or a step toward that place that the followed aim's route goes by first), else the
  // neutral line.
  static gold(app: ReaderApp, screen: Screen, act: string): Pick<RowParts, 'indicator' | 'plain'> {
    const g = app.state.frame?.leaf?.glance, place = act.replace(/^travel:/, ''), own = Attest.witness(g, act);
    // The journey's own, and the place's aim's step beside it: since a row past the four has its witness, a journey's
    // own (what it is for) had hidden the aim's gold its place carries (follow-offered, 19 November).
    const leaves = [...own ? [Fold.step(act, [own])] : [], ...(PlaceFacets.of(screen, g).get(place) ?? [])
      .filter(l => l.witnesses.some(w => w.aspects.includes('undertaking')))];
    const indicator = Fold.mark(leaves, Guidance.shown(app));
    return indicator?.tone === 'gold' ? { indicator } : { plain: 'neutral' };
  }
  // Put away the map: the tone of what the place it returns to leads with (SceneRail.local), never its own colour.
  static away(app: ReaderApp): Pick<RowParts, 'indicator' | 'plain'> {
    const indicator = SceneRail.local(app);
    return indicator ? { indicator } : { plain: 'neutral' };
  }
  // A road's row as the engine's one row for it makes it (Doable.choice: a journey it offers), or none where refused.
  static made<T extends { c: Choice }>(app: ReaderApp, screen: Screen, r: T): T[] {
    const g = app.state.frame?.leaf?.glance;
    const c = g ? Doable.choice(g, screen, r.c.id, { label: r.c.label, command: r.c.command }) : r.c;
    return c ? [{ ...r, c: { ...r.c, ...c, tone: r.c.tone } }] : [];
  }
  // A place as the map's board knows it (its mark, its town, its hex: BoardField.whither).
  static whither(screen: Screen, id: string): string {
    return screen.region?.land ? BoardField.whither(screen.region, id) ?? id : id;
  }
  // A row's mark: the one colour of what the place is, the fold of its leaves (see PlaceFacets), the aim's gold only
  // where the way is shown.
  static marked(leaves: readonly Leaf[] | undefined, gilded: boolean): Pick<RowParts, 'indicator' | 'plain'> {
    const indicator = Fold.mark(leaves ?? [], gilded);
    return indicator?.tone ? { indicator } : { plain: 'neutral' };
  }
  // The places to set out for from the map, by what they are to the company first (the aim's gold, then the rest by the
  // one precedence, someone who might join, somewhere worth going), then the nearest (the owner, 17 November: a town
  // with gold in it had to be found by touching it on the map). A place that is something and has no road the page
  // knows is set out for as the map would set out for it (MapView.way), where it can be.
  static roads(screen: Screen, facets: Map<string, Leaf[]>, at: { taken: (string | undefined)[]; chosen?: string }) {
    const rank = (id: string) => {
      const i = PlaceFacets.order.findIndex(a => PlaceFacets.aspects(facets.get(id)).includes(a));
      return i < 0 ? PlaceFacets.order.length : i;
    };
    const known = (screen.destinations ?? []).map(d => ({ id: d.id, name: d.name, minutes: d.minutes,
      c: { id: `travel:${d.id}`, label: d.name, tone: 'way' as const, command: `travel:${d.id}`, minutes: d.minutes } }));
    // Only what the map draws over the country (a town, a place on the land by itself), never a room of the town the
    // company is in: the map is for going across the country, the town's own ways are the scene's.
    const region = screen.region, land = region?.land, here = new Set(screen.path.map(p => p.id));
    const cell = (id: string) => land?.marks.find(m => m.id === id)?.cell
      ?? region?.areas.filter(a => a.id === id).map(a => a.y * land!.width + a.x)[0];
    const drawn = (id: string) => !!land && !here.has(region!.within[id] ?? id)
      && (land.marks.some(m => m.id === id) || region!.areas.some(a => a.id === id && a.kind === 'settlement'));
    const more = [...facets.keys()].filter(id => !known.some(k => k.id === id) && !here.has(id) && drawn(id))
      .flatMap(id => {
        const way = MapView.way(screen, id);
        return way.go && !way.here ? [{ id, name: way.name, minutes: way.d?.minutes ?? 0, c: way.go }] : [];
      });
    // What stands on the company's own hex is entered from here, never viewed (a town's country: into the town).
    const close = (id: string) => !!land && land.here !== undefined && cell(region!.within[id] ?? id) === land.here;
    return [...known, ...more].filter(r => !at.taken.includes(r.c.id) && r.id !== at.chosen)
      .map(r => ({ ...r, close: close(r.id) }))
      .toSorted((a, b) => Number(b.close) - Number(a.close) || rank(a.id) - rank(b.id) || a.minutes - b.minutes);
  }
  // onward: a journey stopped here, its way on, first (the hex card had drawn it as a menu of its own, beside this one's
  // road to the same place: the act twice).
  // view: a place chosen on the map (a presentation gesture), where the map can: then each other place is a row that
  // views it, and only the place viewed is travelled to (the owner, 17 November: "View [city]" for a place not focused,
  // "Travel to" the one that is).
  static View({ app, screen, chosen, put, enter, onward, view }: { app: ReaderApp; screen: Screen; chosen?: string;
    put: () => void; enter?: { c: Choice; name: string }; onward?: { c: Choice; name: string };
    view?: (id: string) => void }) {
    // Stopped on the way by something here (a band on the road, a toll, someone met), the map is put away first: its
    // one row says so, red where it means harm (the owner, 17 November: you must put away the map to deal with what
    // has stopped you; red if a violent encounter waits).
    const scene = app.menu?.scene, danger = (scene?.subjects ?? []).some(x => x.danger);
    // Only what means harm holds the map: a beast that might join, met on the way, is gone on from as before.
    const travel = app.state.frame?.travel, held = !!travel && !travel.arrived && !chosen && danger;
    if (held) {
      return <ol {...PageFrame.slot('menu')} className="led map-menu" aria-label="On the map">
        <li><ChoiceRow.Button className="led-act put-away held" data={{ action: 'put-away-map' }} onClick={put}
          {...MapMenu.away(app)} label="Something is here: put away the map" /></li></ol>;
    }
    const land = screen.region?.land, way = chosen && land ? MapView.way(screen, chosen) : undefined, go = way?.go;
    const aimed = !!go && MapMenu.gold(app, screen, go.id).indicator?.tone === 'gold';
    const named = chosen && screen.region ? RouteCard.named(screen.region, chosen, way!).title : undefined;
    const taken = [go?.id, onward?.c.id];
    const facets = PlaceFacets.of(screen, app.state.frame?.leaf?.glance), gilded = Guidance.shown(app);
    const roads = MapMenu.roads(screen, facets, { taken, chosen }).flatMap(r => MapMenu.made(app, screen, r))
      .slice(0, MapMenu.four - 1 - (go ? 1 : 0) - (onward ? 1 : 0));
    return (
      <ol {...PageFrame.slot('menu')} className="led map-menu" aria-label="On the map">
        {/* The way on in the aim's gold where the journey is the followed aim's (PB-14: it had stayed grey). */}
        {onward && <li><ChoiceRow.Button className="led-act go-on" data={{ action: 'go-on' }} act={onward.c.id}
          {...Hold.row(app, onward.c)} {...MapMenu.gold(app, screen, onward.c.id)}
          label={Typography.curl(`Go on to ${onward.name}`)} /></li>}
        {enter && <li><ChoiceRow.Button className="led-act rc-enter" data={{ action: 'enter', choice: enter.c.id }} act={enter.c.id}
          onClick={() => app.choose(enter.c)} plain="neutral"
          label={Typography.curl(`Enter ${enter.name}`)} /></li>}
        {go && <li><ChoiceRow.Button className={`led-act rc-go${aimed ? ' aimed' : ''}`}
          data={{ action: 'set-out', choice: go.id }} act={go.id} {...Hold.row(app, go)}
          {...go ? MapMenu.gold(app, screen, go.id) : { plain: 'neutral' as const }}
          label={Typography.curl(`Travel to ${Words.upper(named ?? go.label)}`)}
          aside={way?.d ? `${aimed ? 'your aim · ' : ''}${Words.span(way.d.minutes)}` : 'across the country'} /></li>}
        {roads.map(r => <li key={r.id}><ChoiceRow.Button className="led-act"
          data={{ action: view && !r.close ? 'map-view' : 'map-road', choice: r.c.id }}
          {...view && !r.close ? {} : { act: r.c.id }}
          onClick={() => (view && !r.close ? view(MapMenu.whither(screen, r.id)) : app.choose(r.c))}
          {...MapMenu.marked(facets.get(r.id), gilded)}
          label={<>{Typography.curl(`${r.close ? 'Enter' : view ? 'View' : 'To'} ${Words.upper(r.name)}`)}{PlaceFacets.aspects(facets.get(r.id)).includes('companionship')
            && <Glyphs.View id="companion" className="led-icon" label="someone who might join you" />}</>}
          {...r.minutes ? { aside: Words.span(r.minutes) } : {}} /></li>)}
        <li><ChoiceRow.Button className="led-act put-away" data={{ action: 'put-away-map' }} onClick={put}
          {...MapMenu.away(app)} label="Put away the map" /></li>
      </ol>
    );
  }
}
