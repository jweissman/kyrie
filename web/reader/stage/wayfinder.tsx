import type { ReactNode } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { ExitRow, Screen } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { GlanceStage } from './glance';
import { PlaceStage } from './place-stage';
import { SceneSurface } from './scene-surface';

// A way: what goes by it (c), and the way's own choice where that is a group of its acts (a door to listen at); whether
// it goes where the aim followed names, or another aim held, and its place among the ways the aims name (see
// Glance.aimed: the aim followed's first).
export interface Way {
  c: Choice; way: Choice; exit?: ExitRow; whither: string; name: string; aim?: 'followed' | 'held'; rank?: number;
  group: string;
  // A quarter of the town as one way: what is in it (its places' names, and their ids), gone to by its heart.
  quarter?: string[]; holds?: string[];
}

// Go…: where you are, where you can go from here, how those places lie, and what choosing one would mean, and nothing
// else (the owner, 5 November, late: the explorer had become a catalogue of everything the place at rest left out;
// the people, things and acts of a place are the scene's and its own focused pages). The ways by how they lie (the
// doors and lanes off this place, the town's other places further off, the ways out), one chosen at a time and said
// in a few lines beside the list, and gone by its own Go. Nothing done at a way is here: a padlock on a door is
// looked at where it hangs (see AtHand).
export class Wayfinder {
  static View({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const screen = app.state.frame!.screen, ways = Wayfinder.ways(app), town = Wayfinder.town(screen);
    const chosen = Wayfinder.chosen(app, ways), led = Wayfinder.led(app, ways);
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
                + `${w.aim ? ' aimed' : ''}${w.c.id === led?.c.id ? ' led' : ''}`} data-pick={w.c.id} data-pick-index={draw.index.get(w.way.id) ?? draw.index.get(w.c.id) ?? -1}
                data-holds={w.holds?.join(' ')}
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
        {w.aim && <p className="wf-aim">{w.aim === 'followed' ? 'Your aim' : 'Another aim'}</p>}
        <h3>{Typography.curl(Words.upper(w.name))}</h3>
        {how && <p className="wf-how">{Typography.curl(Words.upper(how))}</p>}
        {w.quarter && <p className="wf-holds">{Typography.curl(Words.upper(Words.listed(w.quarter)))}</p>}
        {w.exit && <p className="wf-been">{w.exit.visited ? 'You have been there.' : 'You have not been there.'}</p>}
        {keep.map(k => <p key={k} className="wf-keeps">{Typography.curl(k)}</p>)}
        {c.disabled && <p className="wf-shut">{Typography.curl(Words.upper(c.disabled))}</p>}
        {(c.marks ?? []).map(m => <p key={m.kind} className={`wf-risk${m.danger ? ` danger-${m.danger}` : ''}`}>
          {Typography.curl(Words.upper(m.said))}</p>)}
        {Wayfinder.goings(c).map(g => <Wayfinder.Go key={g.id} app={app} draw={draw} choice={g}>
          {g === c ? Wayfinder.going(w) : Typography.curl(Words.upper(g.label))}</Wayfinder.Go>)}
      </aside>
    );
  }
  // How a way is gone by: by its own going; or, where it asks first who of the company goes first (the black water in
  // the drift to the garrison strongroom), by each of those, one button each. Its one Go had opened them out of sight,
  // and so did nothing (the fresh playtest of 7 November).
  static goings(c: Choice): Choice[] {
    return !c.command && !c.disabled && c.children?.length ? c.children : [c];
  }
  // A going: as the menu has it where it does; else done by its own command, and what it risks or cannot undo said
  // under it when it is first chosen, as on any choice (see Act.View): a way that asks again had said nothing.
  static Go({ app, draw, choice: c, children }: { app: ReaderApp; draw: Draw; choice: Choice; children: ReactNode }) {
    if (draw.index.has(c.id)) { return <Act.View choice={c} draw={draw} quiet className="wf-go">{children}</Act.View>; }
    const asks = Act.asks(c);
    return <button type="button" className="act wf-go" data-action="go" data-choice={c.id} onClick={() => app.choose(c)}>
      {children}{asks && app.state.confirming === c.id && <span className="grave-said" role="alert">
        {Typography.curl(Act.asked(asks, !!c.grave))}</span>}</button>;
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
      const rank = aimed.findIndex(id => id === c.id || id === exit?.id || id.startsWith(`${exit?.id}/`));
      const aim = rank < 0 ? undefined : !g?.following || g.following.includes(aimed[rank]!) ? 'followed' as const
        : 'held' as const;
      return { c, way, exit, whither, group, name: exit?.destination.name ?? c.label.replace(/^To /, ''),
        ...aim ? { aim, rank } : {} };
    });
    // By how they lie, and by name within each, to be found as in a gazetteer; a town with quarters by its parts.
    const parted = Wayfinder.quartered(screen, ways, { near, about });
    const order = [near, ...parted.groups, about, out];
    const key = (w: Way) => w.name.replace(/^(the|a|an) /i, '').toLowerCase();
    return parted.ways.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || key(a).localeCompare(key(b)));
  }
  // A town set out by its quarters (the owner, 6 November: a town a player can learn, not a directory of its places):
  // the places of the quarter you are in, each; every other quarter as one way, to its heart, saying what is there.
  // Its places are close by when you are there.
  static quartered(screen: Screen, ways: Way[], at: { near: string; about: string }): { ways: Way[]; groups: string[] } {
    const quarters = screen.quarters ?? [], mine = quarters.find(q => q.here);
    if (!quarters.length) { return { ways, groups: [] }; }
    const to = (w: Way) => w.exit?.destination.id ?? w.c.id.replace(/^travel:/, '');
    const town = (w: Way) => [at.near, at.about].includes(w.group);
    const of = (w: Way) => town(w) ? quarters.find(q => q.places.includes(to(w))) : undefined;
    const own = mine ? `In ${mine.name}` : at.about, out: Way[] = [];
    // A place an aim names in another quarter is listed by its own name as well, among the town's further places: the
    // churchyard, in Karir's waterside, had been folded into the quarter's one row, gone by to the waterside, and
    // nowhere on the sheet named or marked (the fresh playtest of 7 November).
    const named = new Set(ways.filter(w => w.aim && of(w) && !of(w)!.here && to(w) !== of(w)!.heart).map(w => w.c.id));
    for (const w of ways) {
      const q = of(w);
      if (!q || q.here) { out.push(q ? { ...w, group: own } : w); continue; }
      if (named.has(w.c.id)) { out.push({ ...w, group: at.about }); }
      if (out.some(o => o.quarter && o.name === q.name)) { continue; }
      // The quarter is gone to by the way to its heart, else by a way not already listed by its own name; where its one
      // way from here is that aimed place's, it is not drawn again under the quarter's name (the trapdoor up from the
      // corn-store cellar had been two rows, "Market" and "Old corn-store", one way drawn twice and both lit).
      const held = ways.filter(x => of(x) === q);
      const heart = held.find(x => to(x) === q.heart) ?? held.find(x => !named.has(x.c.id));
      if (!heart) { continue; }
      out.push({ ...heart, name: q.name, group: at.about, quarter: held.map(x => x.name), holds: held.map(to) });
    }
    return { ways: out, groups: mine ? [own] : [] };
  }
  // The way chosen: the one the keys or a touch last came to, else your aim's, else the way the page leads by (deeper
  // in, where not yet been: the owner, 6 November, found Go… in the corn-store offering the way back out), else the first.
  static chosen(app: ReaderApp, ways: Way[]): Way | undefined {
    const keyed = app.state.keyed ? app.menu.choices[app.state.cursor]?.id : undefined;
    return ways.find(w => w.c.id === keyed) ?? ways.find(w => w.c.id === app.state.hovered) ?? Wayfinder.aimed(ways)
      ?? Wayfinder.led(app, ways) ?? ways[0];
  }
  // The way your aim goes by first: the aim followed's before another's (see Glance.aimed).
  static aimed(ways: Way[]): Way | undefined {
    return ways.filter(w => w.aim).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))[0];
  }
  // The way the page leads by: the first of the glance's ways that is one of these.
  static led(app: ReaderApp, ways: Way[]): Way | undefined {
    const g = app.state.frame!.leaf.glance, ranked = g ? [...g.acts.map(a => a.choice), ...g.ways] : [];
    for (const id of ranked) {
      const w = ways.find(x => x.c.id === id || x.way.id === id || id.startsWith(`${x.way.id}/`));
      if (w) { return w; }
    }
    return undefined;
  }
  static pick(app: ReaderApp, w: Way) {
    const i = app.menu.choices.findIndex(c => c.id === w.c.id);
    app.setState({ hovered: w.c.id, keyed: false, cursor: i >= 0 ? i : app.state.cursor });
  }
}
