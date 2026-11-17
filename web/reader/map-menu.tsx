import type { Screen } from '../../src/ui/screen-types';
import type { ReaderApp } from './reader-app';
import type { Choice } from '../../src/ui/choice-list';
import { MapView } from './map-view';
import { RouteCard } from './route-card';
import { ChoiceRow } from './stage/choice-row';
import { Words } from './words';
import { Typography } from '../../src/presentation/typography';
import { PageFrame } from './page-frame';

// The map's menu (the owner, 15 November: crossing roads belong to the map, not to the scene's four; the map is a focus
// whose menu is drawn as the scene's is): at most four rows, in the one grammar. The chosen place's travel, answering where
// it goes, why (the aim's road, or only what it is) and how long; the nearest roads from here, as many as make four with
// it; and Put away the map, the last row always. Choosing a cell on the map is a presentation gesture; each row commits.
export class MapMenu {
  static readonly four = 4;
  // onward: a journey stopped here, its way on, first (the hex card had drawn it as a menu of its own, beside this one's
  // road to the same place: the act twice).
  static View({ app, screen, chosen, put, enter, onward }: { app: ReaderApp; screen: Screen; chosen?: string;
    put: () => void; enter?: { c: Choice; name: string }; onward?: { c: Choice; name: string } }) {
    const land = screen.region?.land, way = chosen && land ? MapView.way(screen, chosen) : undefined, go = way?.go;
    const aimed = !!chosen && RouteCard.aimed(screen, chosen);
    const named = chosen && screen.region ? RouteCard.named(screen.region, chosen, way!).title : undefined;
    const taken = [go?.id, onward?.c.id];
    const roads = (screen.destinations ?? []).filter(d => !taken.includes(`travel:${d.id}`) && d.id !== chosen)
      .toSorted((a, b) => a.minutes - b.minutes).slice(0, MapMenu.four - 1 - (go ? 1 : 0) - (onward ? 1 : 0));
    return (
      <ol {...PageFrame.slot('menu')} className="led map-menu" aria-label="On the map">
        {onward && <li><ChoiceRow.Button className="led-act go-on" data={{ action: 'go-on' }} act={onward.c.id}
          onClick={() => app.choose(onward.c)} mark={ChoiceRow.neutral} markClass="neutral"
          label={Typography.curl(`Go on to ${onward.name}`)} /></li>}
        {enter && <li><ChoiceRow.Button className="led-act rc-enter" data={{ action: 'enter', choice: enter.c.id }} act={enter.c.id}
          onClick={() => app.choose(enter.c)} mark={ChoiceRow.neutral} markClass="neutral"
          label={Typography.curl(`Enter ${enter.name}`)} /></li>}
        {go && <li><ChoiceRow.Button className={`led-act rc-go${aimed ? ' aimed' : ''}`}
          data={{ action: 'set-out', choice: go.id }} act={go.id} onClick={() => app.choose(go)}
          mark={aimed ? 'var(--tone-gold)' : ChoiceRow.neutral} markClass={aimed ? undefined : 'neutral'}
          label={Typography.curl(`Travel to ${Words.upper(named ?? go.label)}`)}
          aside={way?.d ? `${aimed ? 'your aim · ' : ''}${Words.span(way.d.minutes)}` : 'across the country'} /></li>}
        {roads.map(d => <li key={d.id}><ChoiceRow.Button className="led-act" data={{ action: 'map-road', choice: `travel:${d.id}` }}
          act={`travel:${d.id}`} onClick={() => app.choose({ id: `travel:${d.id}`, label: d.name, tone: 'way',
            command: `travel:${d.id}`, minutes: d.minutes })}
          mark={ChoiceRow.neutral} markClass="neutral" label={Typography.curl(`To ${Words.upper(d.name)}`)}
          aside={Words.span(d.minutes)} /></li>)}
        <li><ChoiceRow.Button className="led-act put-away" data={{ action: 'put-away-map' }} onClick={put}
          mark={ChoiceRow.neutral} markClass="neutral" label="Put away the map" /></li>
      </ol>
    );
  }
}
