import type { Choice } from '../../../src/ui/choice-list';
import type { ReaderApp } from '../reader-app';
import { SceneModel } from '../../../src/ui/scene';
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
    const held = AtHand.of(app), chosen = held.find(h => h.id === app.state.hovered) ?? AtHand.led(app, held) ?? held[0];
    // What was done may have used up the thing it was done to (a notice read, a bill taken down): what came of it is
    // still told here.
    if (!chosen) { return <div className="at-hand"><AtHand.Pane app={app} draw={draw}
      held={{ id: 'gone', name: app.state.frame!.screen.place.name, seen: [], choices: [], opens: [] }} /></div>; }
    return (
      <div className="at-hand" data-region="at-hand">
        <nav className="ah-list" aria-label="What is at hand">
          <ul>{held.map(h => <li key={h.id}>
            <button type="button" className={`ah-row${h === chosen ? ' chosen' : ''}`} data-pick={h.id}
              aria-pressed={h === chosen} onClick={() => AtHand.pick(app, h)}>
              {Typography.curl(Words.upper(h.name))}</button></li>)}</ul>
        </nav>
        <AtHand.Pane app={app} draw={draw} held={chosen} />
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
          <Act.View choice={c} draw={draw} marked>{Typography.curl(Words.upper(PlaceStage.also(c.label)))}</Act.View>
          <PlaceStage.Opened choice={c} draw={draw} />
        </li>)}</ul>}
      </section>
    );
  }
  // Everything at hand: the things here, what is done at a way off this place (the lock on its door), and what the
  // place itself offers.
  static of(app: ReaderApp): Held[] {
    const frame = app.state.frame!, scene = app.menu.scene, situation = frame.leaf.situation;
    if (!scene) { return []; }
    // A thing stays at hand when nothing is left to do with it (a notice read): it is still there to be looked at.
    const things = scene.subjects.filter(x => x.kind === 'thing' && !x.danger).map(x => {
      const opener = x.choices.find(c => /#look$/.test(c.id));
      return { id: x.id, name: x.name, ...x.note ? { note: x.note } : {}, seen: ThingStage.seen(situation, x.name, x.about),
        choices: opener?.children ?? x.choices, opens: opener ? [opener.id] : [] };
    });
    const ways = PlaceStage.ways(frame.screen, SceneSurface.choices(app)).filter(w => w.choices.length > 1).map(w => {
      const acts = w.choices.slice(1), thing = acts.find(c => c.children?.length);
      return { id: w.exit.id, name: PlaceStage.thing(thing?.label ?? w.exit.way ?? w.exit.destination.name),
        note: Words.upper(`${w.exit.way ?? 'the way'} to ${w.exit.destination.name}`),
        seen: w.exit.blocked ? [w.exit.blocked] : [], choices: acts.flatMap(c => c.children?.length ? c.children : [c]),
        opens: acts.filter(c => c.children?.length).map(c => c.id) };
    });
    // What the place itself offers, each by what it is (the notice on the well-post, read).
    const own = scene.you.filter(SceneModel.own).map(c => ({ id: c.id, name: Words.upper(c.label), seen: [], choices: [c],
      opens: [] }));
    return [...own, ...things, ...ways];
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
