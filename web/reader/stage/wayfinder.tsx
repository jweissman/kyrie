import type { Choice } from '../../../src/ui/choice-list';
import type { ExitRow, Screen } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { GlanceStage } from './glance';
import { PlaceStage } from './place-stage';
import { SceneSurface } from './scene-surface';

export interface Way { c: Choice; exit?: ExitRow; whither: string; name: string; aim: boolean; group: string }

// Go…: where you are, where you can go from here, how those places lie, and what choosing one would mean, and nothing
// else (the owner, 5 November, late: the explorer had become a catalogue of everything the place at rest left out;
// the people, things and acts of a place are the scene's and its own focused pages). The ways by how they lie (the
// doors and lanes off this place, the town's other places further off, the ways out), one chosen at a time and said
// in a few lines beside the list, and gone by its own Go. Nothing done at a way is here: a padlock on a door is
// looked at where it hangs (see AtHand).
export class Wayfinder {
  static View({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const screen = app.state.frame!.screen, ways = Wayfinder.ways(app), town = Wayfinder.town(screen);
    const chosen = Wayfinder.chosen(app, ways);
    const groups = [...new Set(ways.map(w => w.group))];
    return (
      <div className="wayfinder" data-region="wayfinder">
        <header className="wf-where">
          <p className="kicker">You are at</p>
          <h2>{Typography.curl(Words.upper(screen.place.name))}</h2>
          {town && town !== screen.place.name && <p className="in">{Typography.curl(`in ${town}`)}</p>}
          <GlanceStage.Aim app={app} said={app.state.frame!.leaf.glance?.aim} />
        </header>
        <nav className="wf-list" aria-label="Where you can go">
          {groups.map(g => <section key={g} className="wf-group">
            <h3>{Typography.curl(g)}</h3>
            <ul>{ways.filter(w => w.group === g).map(w => <li key={w.c.id}>
              <button type="button" className={`wf-row${w.c.id === chosen?.c.id ? ' chosen' : ''}${w.c.disabled ? ' shut' : ''}`
                + `${w.aim ? ' aimed' : ''}`} data-pick={w.c.id} data-pick-index={draw.index.get(w.c.id) ?? -1}
                aria-pressed={w.c.id === chosen?.c.id} onClick={() => Wayfinder.pick(app, w)}
                onDoubleClick={() => { if (!w.c.disabled) { app.choose(w.c); } }}>
                <span className={`glyph whither-${w.whither.toLowerCase()}`} aria-hidden="true">
                  {w.c.disabled ? '⊘' : SceneSurface.glyph(w.whither)}</span>
                <span className="n">{GlanceStage.short(w.name)}</span>
                {(w.c.minutes ?? 0) > 5 && <span className="t">{Words.span(w.c.minutes!)}</span>}
              </button></li>)}</ul>
          </section>)}
        </nav>
        {chosen && <Wayfinder.Preview app={app} draw={draw} way={chosen} />}
      </div>
    );
  }
  // The way chosen, said: where it goes and how, how long, whether you have been, who keeps shop there, whether it is
  // shut and why, what it risks, your aim's if it is; and going.
  static Preview({ app, draw, way: w }: { app: ReaderApp; draw: Draw; way: Way }) {
    const screen = app.state.frame!.screen, c = w.c, to = w.exit?.destination.id;
    const how = [Wayfinder.how[w.whither] ?? '', w.exit?.way ? `by ${w.exit.way}` : '',
      (c.minutes ?? 0) > 5 ? Words.span(c.minutes!) : ''].filter(Boolean).join(' · ');
    const keep = Wayfinder.keepers(screen, to);
    return (
      <aside className="wf-preview" aria-live="polite" data-way={c.id}>
        {w.aim && <p className="wf-aim">Your aim</p>}
        <h3>{Typography.curl(Words.upper(w.name))}</h3>
        {how && <p className="wf-how">{Typography.curl(Words.upper(how))}</p>}
        {w.exit && <p className="wf-been">{w.exit.visited ? 'You have been there.' : 'You have not been there.'}</p>}
        {keep.map(k => <p key={k} className="wf-keeps">{Typography.curl(k)}</p>)}
        {c.disabled && <p className="wf-shut">{Typography.curl(Words.upper(c.disabled))}</p>}
        {(c.marks ?? []).map(m => <p key={m.kind} className={`wf-risk${m.danger ? ` danger-${m.danger}` : ''}`}>
          {Typography.curl(Words.upper(m.said))}</p>)}
        {draw.index.has(c.id) ? <Act.View choice={c} draw={draw} quiet className="wf-go">{Wayfinder.going(w)}</Act.View>
          : <button type="button" className="act wf-go" data-action="go" data-choice={c.id}
            onClick={() => app.choose(c)}>{Wayfinder.going(w)}</button>}
      </aside>
    );
  }
  static readonly how: Record<string, string> = { Up: 'up', Down: 'down', Into: 'in', Out: 'out', Away: 'away from here',
    On: 'on', To: '' };
  // What going is called, by which way it goes.
  private static going(w: Way): string {
    if (!w.exit) { return 'Walk there'; }
    return { Up: 'Go up', Down: 'Go down', Into: 'Go in', Out: 'Go out', Away: 'Set out', On: 'Go on' }[w.whither]
      ?? 'Go there';
  }
  // Who keeps shop at a place, and for what (the town's services, as the engine finds them: see Services).
  private static keepers(screen: Screen, place?: string): string[] {
    const at = (screen.services ?? []).filter(s => s.place.id === place), who = [...new Set(at.map(s => s.who))];
    return who.map(name => `${name}: ${Words.listed(at.filter(s => s.who === name).map(s => s.need.toLowerCase()))}`);
  }
  static town(screen: Screen): string | undefined {
    return screen.path.find(p => ['settlement', 'site'].includes(p.kind))?.name;
  }
  // Every way from here: the doors and lanes off this place, the town's further places, and the ways out of it.
  static ways(app: ReaderApp): Way[] {
    const frame = app.state.frame!, screen = frame.screen, g = frame.leaf.glance, aimed = PlaceStage.aimed(app);
    const town = Wayfinder.town(screen), ranked = g ? [...g.acts.map(a => a.choice), ...g.ways] : [];
    const near = town ? 'Close by' : 'From here', about = town ? `About ${town}` : 'Further', out = town ? `Out of ${town}` : 'Out';
    const ways = SceneSurface.open(screen, SceneSurface.choices(app), ranked).map(({ c: way, exit }) => {
      // A way with acts of its own (a door to listen at) is gone by the one of them that moves the company.
      const c = !way.command && !way.disabled ? way.children?.find(k => k.moves) ?? way : way;
      const whither = SceneSurface.whither(exit);
      const group = ['Out', 'Away'].includes(whither) && !exit?.local ? out : exit ? near : about;
      return { c, exit, whither, group, name: exit?.destination.name ?? c.label.replace(/^To /, ''),
        aim: aimed.some(id => id === c.id || id.startsWith(`${exit?.id}/`)) };
    });
    // By how they lie, and by name within each, to be found as in a gazetteer.
    const order = [near, about, out], key = (w: Way) => w.name.replace(/^(the|a|an) /i, '').toLowerCase();
    return ways.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || key(a).localeCompare(key(b)));
  }
  // The way chosen: the one the keys or a touch last came to, else your aim's, else the first.
  static chosen(app: ReaderApp, ways: Way[]): Way | undefined {
    const keyed = app.state.keyed ? app.menu.choices[app.state.cursor]?.id : undefined;
    return ways.find(w => w.c.id === keyed) ?? ways.find(w => w.c.id === app.state.hovered) ?? ways.find(w => w.aim)
      ?? ways[0];
  }
  static pick(app: ReaderApp, w: Way) {
    const i = app.menu.choices.findIndex(c => c.id === w.c.id);
    app.setState({ hovered: w.c.id, keyed: false, cursor: i >= 0 ? i : app.state.cursor });
  }
}
