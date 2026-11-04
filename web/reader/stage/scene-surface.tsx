import type { Choice } from '../../../src/ui/choice-list';
import type { ExitRow, Screen } from '../../../src/ui/screen-types';
import { Typography } from '../../../src/presentation/typography';
import { Scenery } from '../../../src/ui/scenery';
import type { ReaderApp } from '../reader-app';
import { Words } from '../words';
import { PlaceStage } from './place-stage';
import { Act } from './act';

// A place as it is seen, the play's surface wherever the company is not out in the wild (the owner, 4 November,
// evening: the painting is the place; a graph of rooms is not a map). Painted where a painting fits (a town, a site
// above ground), the ways out of it laid along its foot; indoors and under the ground, where nothing is painted, the
// dark the company's light opens, the place's name in it, and the ways as openings: up, down, on through. A way is
// chosen, and shown beside; chosen again, gone by.
export class SceneSurface {
  static View({ app, screen, ways, chosen, choose }: { app: ReaderApp; screen: Screen; ways: Choice[];
    chosen?: string; choose: (id?: string) => void }) {
    const g = app.state.frame?.leaf.glance, ranked = [...g?.acts.map(a => a.choice) ?? [], ...g?.ways ?? []];
    const view = screen.dark ? undefined : Scenery.of(screen), open = SceneSurface.open(screen, ways, ranked);
    // Unpainted, the place's own words are what is seen of it, in the light the company carries.
    const sight = app.state.frame?.leaf.glance?.sight?.text;
    // Chosen again, gone by; but a way that asks first (no coming back, a trap risked) is taken only from its card,
    // where what it risks is said and asked.
    const pick = (c: Choice) => {
      if (chosen === c.id && !c.disabled && !Act.asks(c)) { app.choose(c); return; }
      choose(c.id);
    };
    return (
      <div className={`scene-surface ${view ? 'painted' : 'unpainted'}${screen.place.underground ? ' under' : ''}`}
        data-region="scene-surface">
        {view ? <div className="scene-view"><PlaceStage.Country view={view} /></div>
          : <div className="scene-dark" aria-hidden="true"><p className="scene-words">
            {Typography.curl(sight ?? (screen.dark ? 'It is dark.' : Words.upper(screen.place.name)))}</p></div>}
        {(['up', 'level'] as const).map(side => {
          const these = open.filter(x => SceneSurface.side(x.exit) === side);
          return these.length > 0 && <nav key={side} className={`openings ${side}`} aria-label={side === 'up'
            ? 'The ways up' : 'The ways from here'}>{these.map(x => SceneSurface.opening(x, chosen, pick))}</nav>;
        })}
        {open.some(x => SceneSurface.side(x.exit) === 'down') && <nav className="openings down" aria-label="The ways down">
          {open.filter(x => SceneSurface.side(x.exit) === 'down').map(x => SceneSurface.opening(x, chosen, pick))}</nav>}
      </div>
    );
  }
  private static opening({ c, exit }: { c: Choice; exit?: ExitRow }, chosen: string | undefined,
    pick: (c: Choice) => void) {
    return <button key={c.id} type="button" className={`opening${chosen === c.id ? ' chosen' : ''}`
      + `${c.disabled ? ' barred' : ''}`} data-way={c.id} aria-pressed={chosen === c.id} onClick={() => pick(c)}>
      {SceneSurface.whither(exit) !== 'To' && <span className="whither">{SceneSurface.whither(exit)}</span>}
      <span className="to">{Typography.curl(Words.upper(exit?.destination.name ?? c.label.replace(/^To /, '')))}</span>
      {(c.minutes ?? 0) > 5 && <span className="t">{Words.span(c.minutes!)}</span>}
      {(Act.asks(c) || Act.tags(c).length > 0) && <span className="risk">{Typography.curl(Act.tags(c)
        .map(m => Act.marks[m.kind]).join(' · ') || 'it asks first')}</span>}
    </button>;
  }
  // Where an opening stands on the surface: a way up or out at the top, a way down at the foot, the rest beside.
  static side(exit?: ExitRow): 'up' | 'down' | 'level' {
    const t = exit?.transition;
    return t === 'ascend' ? 'up' : t === 'descend' ? 'down' : 'level';
  }
  // The ways from here as openings, each its way's own choice (not an act on it): the few nearest, as the glance rows
  // them; the rest under Every way.
  static open(screen: Screen, ways: Choice[], ranked: string[]): { c: Choice; exit?: ExitRow }[] {
    const rank = (c: Choice) => { const i = ranked.findIndex(r => r === c.id || r.startsWith(`${c.id}/`)); return i < 0 ? 99 : i; };
    // Each way's own going: its choice, or the first of its acts where it has several (a locked door's "Go").
    const byExit = screen.exits.flatMap(exit => {
      const c = SceneSurface.going(ways, exit.id);
      return c ? [{ c, exit }] : [];
    });
    const walks = ways.filter(c => c.id.startsWith('travel:')).map(c => ({ c, exit: undefined }));
    return [...byExit, ...walks].map((x, i) => ({ ...x, i })).sort((a, b) => rank(a.c) - rank(b.c) || a.i - b.i)
      .slice(0, 5);
  }
  static going(ways: Choice[], exit: string): Choice | undefined {
    return ways.find(w => w.id === exit || w.id.startsWith(`${exit}/`));
  }
  // Which way it goes, from here, by what the world says of it (its transition), never by its words.
  static whither(exit?: ExitRow): string {
    const t = exit?.transition;
    return t === 'ascend' ? 'Up' : t === 'descend' ? 'Down' : t === 'enter' ? 'Into' : t === 'leave' ? 'Out'
      : t === 'travel' ? 'Away' : t === 'level' ? 'On' : 'To';
  }
}
