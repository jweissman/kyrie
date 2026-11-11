import type { Choice } from '../../../src/ui/choice-list';
import type { ReaderApp } from '../reader-app';
import { SceneModel, type SceneSubject } from '../../../src/ui/scene';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { GlanceStage } from './glance';
import { PlaceStage } from './place-stage';
import { SceneSurface } from './scene-surface';
import { ThingStage } from './thing-stage';
import { Told } from './told';

// One thing at hand: what it is, what is said of it, and what can be done with it (opened from the groups that hold
// those acts in the menu).
export interface Held { id: string; name: string; note?: string; seen: string[]; choices: Choice[]; opens: string[] }

// Look…: the things at hand here, each looked at in its own pane, one at a time: a notice, a bill on a wall, a padlock
// on a door off this place, what the place itself offers to do (the owner, 5 November, late: an object's acts are
// that object's focused presentation, never a way's in a wayfinder, nor a list on the place at rest). What came of
// what was done to one is told in its pane, which stays until put away.
export class AtHand {
  static View({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const s = app.state, held = AtHand.of(app);
    // What was done may have used up the thing it was done to (a notice read, a bill taken down, a padlock picked):
    // what came of it is told in a pane of its own, not under the next thing's name (the padlock's result had been
    // told under "The dandelion": M19-142).
    const gone = !!s.kept && !!s.hovered && !held.some(h => h.id === s.hovered);
    const chosen = gone ? undefined : held.find(h => h.id === s.hovered) ?? AtHand.led(app, held) ?? held[0];
    const done = { id: 'gone', name: s.frame!.screen.place.name, seen: [], choices: [], opens: [] };
    if (!chosen && !held.length) { return <div className="at-hand"><AtHand.Pane app={app} draw={draw} held={done} /></div>; }
    return (
      <div className="at-hand" data-region="at-hand">
        <nav className="ah-list" aria-label="What is at hand">
          <ul>{held.map(h => <li key={h.id}>
            <button type="button" className={`ah-row${h === chosen ? ' chosen' : ''}`} data-pick={h.id}
              aria-pressed={h === chosen} onClick={() => AtHand.pick(app, h)}>
              {Typography.curl(Words.upper(h.name))}</button></li>)}</ul>
        </nav>
        <AtHand.Pane app={app} draw={draw} held={chosen ?? done} />
      </div>
    );
  }
  static Pane({ app, draw, held: h }: { app: ReaderApp; draw: Draw; held: Held }) {
    const s = app.state, exchange = s.frame!.leaf.exchange, told = s.kept && !s.pending && exchange
      && (exchange.lines.length || exchange.notes.length) ? exchange : undefined;
    const shown = h.choices.filter(c => draw.index.has(c.id));
    return (
      <section className="ah-pane" aria-live="polite" data-held={h.id}>
        <h3>{Typography.curl(Words.upper(h.name))}</h3>
        {h.note && <p className="ah-note">{Typography.curl(h.note)}</p>}
        {h.seen.map((p, i) => <p key={i} className="ah-seen">{Typography.curl(p)}</p>)}
        {s.pending ? <Told.Working pending={s.pending} /> : told && <Told.Happened exchange={told} said app={app} />}
        {shown.length > 0 && <ul className="acts column">{shown.map(c => <li key={c.id}>
          <Act.View choice={c} draw={draw} marked>{Typography.curl(c.alone ?? Words.upper(PlaceStage.also(c.label)))}</Act.View>
          <PlaceStage.Opened choice={c} draw={draw} />
        </li>)}</ul>}
      </section>
    );
  }
  // Everything at hand: the things here, what is done at a way off this place (the lock on its door), and what the
  // place itself offers.
  static of(app: ReaderApp): Held[] {
    const frame = app.state.frame!, scene = app.menu.scene, leaf = frame.leaf, situation = leaf.situation;
    if (!scene) { return []; }
    // What the place tells already, and what came of what was just done (the cart out of the ditch, "square on the
    // road again"): a thing's words that are only these show nothing more.
    const told = [...situation, ...leaf.presence, ...(leaf.exchange?.lines ?? []).map(l => l.text)].join(' ');
    // A thing stays at hand when nothing is left to do with it but there is still something of it to read (a notice
    // read); one with nothing to do and nothing to show that the place has not told is not offered (see AtHand.real).
    const kept = [...scene.subjects, ...scene.still ?? []].filter(x => x.kind === 'thing' && !x.danger);
    const things = kept.filter(x => AtHand.real(x, told)).map(x => {
      const opener = x.choices.find(c => /#look$/.test(c.id));
      return { id: x.id, name: x.name, ...x.note ? { note: x.note } : {}, seen: ThingStage.seen(situation, x.name, x.about),
        choices: opener?.children ?? x.choices, opens: opener ? [opener.id] : [] };
    });
    const ways = PlaceStage.ways(frame.screen, SceneSurface.choices(app)).filter(w => w.choices.length > 1).map(w => {
      const acts = w.choices.slice(1), thing = acts.find(c => c.children?.length);
      return { id: w.exit.id, name: PlaceStage.thing(thing?.label ?? w.exit.way ?? w.exit.destination.name),
        note: Words.upper(`${w.exit.way ?? 'the way'} to ${w.exit.destination.name}`),
        seen: w.exit.blocked ? [w.exit.blocked] : w.exit.keyed ? ['It is locked, and you have the key: the way through it is open to you.'] : [],
        choices: acts.flatMap(c => c.children?.length ? c.children : [c]),
        opens: acts.filter(c => c.children?.length).map(c => c.id) };
    });
    // What the place itself offers, each by what it is (the notice on the well-post, read).
    // An unread notice is on the scene itself (GlanceStage.posted), not here as well.
    const posted = GlanceStage.posted(app);
    const own = scene.you.filter(c => SceneModel.own(c) && c !== posted).map(c => ({ id: c.id, name: Words.upper(c.label), seen: [], choices: [c],
      opens: [] }));
    // What the story turns on first: what the glance leads with or an aim is about (the fresh ruts), then the rest as
    // the place has them (Look… on a road through meadow had listed twenty-three plants before the ruts: M19-144).
    const leads = new Set((app.menu.leads ?? leaf.glance?.acts ?? []).flatMap(a => [a.choice, a.subject ?? '']));
    const first = (t: Held) => leads.has(t.id) || t.opens.some(id => leads.has(id))
      || t.choices.some(c => leads.has(c.id)) || !!kept.find(x => x.id === t.id)?.stake;
    // What the place at rest leaves untold (Told.surplus), first, to be read as the rest of the place.
    const more = Told.surplus(app), about = more.length
      ? [{ id: 'about', name: 'About the place', seen: more, choices: [], opens: [] }] : [];
    return [...about, ...own, ...AtHand.grown(things.filter(first)), ...AtHand.grown(things.filter(t => !first(t))),
      ...ways];
  }
  // What only grows here, and can only be gathered, is one thing to look at, not a list of every flower: the edge of a
  // wood had offered ten plants, each its own pane, before anything else (the owner's play of 10 November). Named
  // together; what each gives, gathered from the one pane.
  static grown(held: Held[]): Held[] {
    const plants = held.filter(h => h.choices.length > 0 && h.choices.every(c => c.does === 'gather'));
    if (plants.length < 3) { return held; }
    const names = plants.map(p => p.name.replace(/^the /i, ''));
    const group: Held = { id: 'grown', name: 'What grows here', seen: [`${Words.upper(Words.listed(names))}.`],
      choices: plants.flatMap(p => p.choices), opens: plants.flatMap(p => p.opens) };
    const at = held.indexOf(plants[0]!);
    return [...held.slice(0, at).filter(h => !plants.includes(h)), group, ...held.slice(at).filter(h => !plants.includes(h))];
  }
  // Whether a thing has something real to show or do (the owner's own play, 7 November: Look… "has never shown anything
  // but 'it is what it seems'", a cart, a lockup door and a bill each offered for a close look that found nothing): an
  // act, or words of its own the place does not tell already (a bill's lettering). One that is only what the place
  // says of it, or what was just told of it, is not offered.
  static real(x: SceneSubject, told: string): boolean {
    return x.choices.some(c => !/#look$/.test(c.id) || !!c.children?.length) || (!!x.about && !told.includes(x.about));
  }
  // The one the glance leads with, where it leads with something at hand.
  static led(app: ReaderApp, held: Held[]): Held | undefined {
    const g = app.state.frame?.leaf.glance, leads = new Set((app.menu.leads ?? g?.acts ?? [])
      .flatMap(a => GlanceStage.choice(app, a.choice)?.id ?? []));
    return held.find(h => h.choices.some(c => leads.has(c.id)) || h.opens.some(id => leads.has(id)));
  }
  // A thing chosen: its acts opened, so that they are the menu's (the keys and a touch find them).
  static pick(app: ReaderApp, h: Held) {
    app.setState({ hovered: h.id, open: h.opens, kept: false, keyed: false });
  }
}
