import type { ReactNode } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { ExitRow, Screen } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { GlanceStage } from './glance';
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
// doors and lanes off this place, the town's other places further off, the ways out), and the one under the pointer
// or the keys said in a few lines beside the list. Nothing done at a way is here: a padlock on a door is looked at
// where it hangs (see AtHand).
// One click goes (the owner's play of 7 November: choosing a destination selected it, and then wanted "Go there" as
// well): a touch or a click on a way goes by it, as Enter does on the one the keys are on; the pointer over it or the
// keys on it say it beside the list first. A way that cannot be gone by says why, and one that asks first (who goes
// first through the black water, what cannot be undone) asks it there. Nothing is chosen for the player: the page had
// led with a way of its own choosing, deeper in, not yet been, and so pointed from the taproom to the bridge-foot and
// back again, and off from the aim the company was following (the evidence sessions of 7 November); only the aim
// followed's way is said unasked, and only it is marked.
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
          <GlanceStage.Aim app={app} />
        </header>
        <nav className="wf-list" aria-label="Where you can go">
          {groups.map(g => <section key={g} className="wf-group">
            <h3>{Typography.curl(g)}</h3>
            <ul>{ways.filter(w => w.group === g).map(w => <li key={w.c.id}>
              <Wayfinder.Row app={app} draw={draw} way={w} chosen={w.c.id === chosen?.c.id} /></li>)}</ul>
          </section>)}
        </nav>
        {chosen && <Wayfinder.Preview app={app} draw={draw} way={chosen} />}
      </div>
    );
  }
  // A way in the list: its glyph, its name, how long; marked only where the aim followed goes by it.
  static Row({ app, draw, way: w, chosen }: { app: ReaderApp; draw: Draw; way: Way; chosen: boolean }) {
    return <button type="button" className={`wf-row${chosen ? ' chosen' : ''}${w.c.disabled ? ' shut' : ''}`
      + `${w.aim === 'followed' ? ' aimed' : ''}`} data-pick={w.c.id}
      data-pick-index={draw.index.get(w.way.id) ?? draw.index.get(w.c.id) ?? -1} data-holds={w.holds?.join(' ')}
      onMouseEnter={() => Wayfinder.pick(app, w)} onFocus={() => Wayfinder.pick(app, w)}
      onClick={() => Wayfinder.go(app, w)}>
      <span className={`glyph whither-${w.whither.toLowerCase()}`} aria-hidden="true">
        {w.c.disabled ? '⊘' : SceneSurface.glyph(w.whither)}</span>
      <span className="n">{GlanceStage.short(w.name)}</span>
      {(w.c.minutes ?? 0) > 5 && <span className="t">{Words.span(w.c.minutes!)}</span>}
    </button>;
  }
  // A way touched: gone by, unless it is shut (its reason is said) or asks first who goes (each is a button beside it).
  static go(app: ReaderApp, w: Way) {
    Wayfinder.pick(app, w);
    if (!w.c.disabled && Wayfinder.goings(w.c).length === 1) { app.choose(w.c); }
  }
  // The way chosen, said: where it goes and how, how long, whether you have been, who keeps shop there, whether it is
  // shut and why, what it risks, your aim's if it is; and going.
  static Preview({ app, draw, way: w }: { app: ReaderApp; draw: Draw; way: Way }) {
    const screen = app.state.frame!.screen, c = w.c, to = Wayfinder.to(w);
    const how = [Wayfinder.how[w.whither] ?? '', w.exit?.way ? `by ${w.exit.way}` : '',
      (c.minutes ?? 0) > 5 ? Words.span(c.minutes!) : ''].filter(Boolean).join(' · ');
    const keep = Wayfinder.keepers(screen, to);
    return (
      <aside className="wf-preview" aria-live="polite" data-way={c.id}>
        {w.aim && <p className={`wf-aim ${w.aim}`}>{w.aim === 'followed' ? 'Your aim' : 'Another aim'}</p>}
        <h3>{Typography.curl(Words.upper(w.name))}</h3>
        {how && <p className="wf-how">{Typography.curl(Words.upper(how))}</p>}
        {w.quarter && <p className="wf-holds">{Typography.curl(Words.upper(Words.listed(w.quarter)))}</p>}
        {Wayfinder.been(screen, w) !== undefined && <p className="wf-been">
          {Wayfinder.been(screen, w) ? 'You have been there.' : 'You have not been there.'}</p>}
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
  // Every way from here: the doors and lanes off this place, the town's further places, and the ways out of it; never
  // a way to where the company stands (Go… had marked the place the player stood in as the one place to go).
  static ways(app: ReaderApp): Way[] {
    const frame = app.state.frame!, screen = frame.screen, g = frame.leaf.glance, aimed = g?.aimed ?? [];
    const town = Wayfinder.town(screen), ranked = g ? [...g.acts.map(a => a.choice), ...g.ways] : [];
    const near = town ? 'Close by' : 'From here', about = town ? `About ${town}` : 'Further', out = town ? `Out of ${town}` : 'Out';
    const ways = SceneSurface.open(screen, SceneSurface.choices(app), ranked).map(({ c: way, exit }) => {
      // A way with acts of its own (a door to listen at) is gone by the one of them that moves the company.
      const c = !way.command && !way.disabled ? way.children?.find(k => k.moves) ?? way : way;
      const whither = SceneSurface.whither(exit);
      const group = ['Out', 'Away'].includes(whither) && !exit?.local ? out : exit ? near : about;
      const rank = aimed.findIndex(id => id === c.id || id === exit?.id || id.startsWith(`${exit?.id}/`));
      // Gold for the aim followed's ways alone: with none of its own from here (an aim out of the country, gone to by
      // the map), every way of every other aim held had been gilded as followed (the owner, 7 November).
      const aim = rank < 0 ? undefined : g?.following?.includes(aimed[rank]!) ? 'followed' as const : 'held' as const;
      return { c, way, exit, whither, group, name: exit?.destination.name ?? c.label.replace(/^To /, ''),
        ...aim ? { aim, rank } : {} };
    }).filter(w => Wayfinder.to(w) !== screen.place.id);
    // By how they lie, and by name within each, to be found as in a gazetteer; a town with quarters by its parts.
    const parted = Wayfinder.quartered(screen, Wayfinder.distinct(ways), { near, about });
    const order = [near, ...parted.groups, about, out];
    return parted.ways.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group)
      || Wayfinder.key(a).localeCompare(Wayfinder.key(b)));
  }
  private static key(w: Way): string { return w.name.replace(/^(the|a|an) /i, '').toLowerCase(); }
  // Where a way goes: its exit's place, or the place a walk about the town goes to.
  static to(w: Pick<Way, 'c' | 'exit'>): string { return w.exit?.destination.id ?? w.c.id.replace(/^travel:/, ''); }
  // Whether the company has been where a way goes, as the map of what it knows has it; unknown, not said.
  static been(screen: Screen, w: Way): boolean | undefined {
    return w.exit?.visited ?? screen.map.find(p => p.id === Wayfinder.to(w))?.visited;
  }
  // Ways of one name told apart by which way each goes (three ways out to the Woods of Draugtaure, from a bridge in the
  // open country, had been three rows alike: the evidence sessions of 7 November), else by the way each is.
  static distinct(ways: Way[]): Way[] {
    const count = new Map<string, number>();
    for (const w of ways) { count.set(w.name, (count.get(w.name) ?? 0) + 1); }
    return ways.map(w => {
      if ((count.get(w.name) ?? 0) < 2) { return w; }
      const by = w.exit?.bearing ?? (w.exit?.way ? `by ${w.exit.way}` : undefined);
      return by ? { ...w, name: `${w.name}, ${by}` } : w;
    });
  }
  // A town set out by its quarters (the owner, 6 November: a town a player can learn, not a directory of its places):
  // the places of the quarter you are in, each; every other quarter as one way, to its heart, saying what is there.
  // Its places are close by when you are there.
  static quartered(screen: Screen, ways: Way[], at: { near: string; about: string }): { ways: Way[]; groups: string[] } {
    const quarters = screen.quarters ?? [], mine = quarters.find(q => q.here);
    if (!quarters.length) { return { ways, groups: [] }; }
    const to = Wayfinder.to;
    const town = (w: Way) => [at.near, at.about].includes(w.group);
    const of = (w: Way) => town(w) ? quarters.find(q => q.places.includes(to(w))) : undefined;
    const own = mine ? `In ${mine.name}` : at.about, out: Way[] = [];
    // A place an aim names in another quarter is listed by its own name as well, among the town's further places: the
    // churchyard, in Karir's waterside, had been folded into the quarter's one row, gone by to the waterside, and
    // nowhere on the sheet named or marked (the fresh playtest of 7 November).
    const named = new Set(ways.filter(w => w.aim && of(w) && !of(w)!.here && to(w) !== of(w)!.heart).map(w => w.c.id));
    const done = new Set<string>();
    for (const w of ways) {
      const q = of(w);
      if (!q || q.here) { out.push(q ? { ...w, group: own } : w); continue; }
      if (named.has(w.c.id)) { out.push({ ...w, group: at.about }); }
      if (done.has(q.id)) { continue; }
      done.add(q.id);
      // The quarter is gone to by the way to its heart, its own open place, and by nothing else (the owner's play of 7
      // November: "the market" had been gone to by the first of its places, a shop's door). Where no way here goes to
      // its heart, its places are listed by their own names. A way that is an aimed place's is not drawn again under
      // the quarter's name (the trapdoor up from the corn-store cellar had been two rows, one way drawn twice).
      const held = ways.filter(x => of(x) === q), heart = held.find(x => to(x) === q.heart);
      if (!heart) { out.push(...held.filter(x => !named.has(x.c.id)).map(x => ({ ...x, group: at.about }))); continue; }
      out.push({ ...heart, name: q.name, group: at.about, quarter: held.map(x => x.name), holds: held.map(to) });
    }
    return { ways: out, groups: mine ? [own] : [] };
  }
  // The way said beside the list: the one the keys or the pointer last came to, else the aim followed's, else none.
  static chosen(app: ReaderApp, ways: Way[]): Way | undefined {
    const keyed = app.state.keyed ? app.menu.choices[app.state.cursor]?.id : undefined;
    return ways.find(w => w.c.id === keyed) ?? ways.find(w => w.c.id === app.state.hovered) ?? Wayfinder.aimed(ways);
  }
  // The way the aim followed goes by first, where one does (see Glance.aimed); another aim's is not offered unasked.
  static aimed(ways: Way[]): Way | undefined {
    return ways.filter(w => w.aim === 'followed').sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))[0];
  }
  static pick(app: ReaderApp, w: Way) {
    const i = app.menu.choices.findIndex(c => c.id === w.c.id);
    app.setState({ hovered: w.c.id, keyed: false, cursor: i >= 0 ? i : app.state.cursor });
  }
}
