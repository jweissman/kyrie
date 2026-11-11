import { useRef } from 'react';
import { Glyphs } from '../creation/glyphs';
import type { Glance, Promoted } from '../../../src/presentation/glance-types';
import type { Choice } from '../../../src/ui/choice-list';
import type { SceneSubject } from '../../../src/ui/scene';
import type { ReaderApp } from '../reader-app';
import { Attending } from '../../../src/ui/attention';
import { Typography } from '../../../src/presentation/typography';
import { MenuModel } from '../menu-model';
import { Followed } from '../followed';
import { Aims } from '../aims';
import { Words } from '../words';
import { Emphasis } from '../emphasis';
import { Act, type Draw } from './act';
import { Journey } from './journey';
import { Moments } from './moments';
import { PlaceStage } from './place-stage';
import { Told } from './told';
import { SceneSurface } from './scene-surface';
import { SceneModel } from '../../../src/ui/scene';
import { AtHand } from './at-hand';
import { Explorer } from './explorer';
import { Pastime } from './pastime';
import { Wayfinder } from './wayfinder';
import { Scrolled } from './scrolled';

// A place at a glance (OWN-18, OWN-19), as the engine decides it (see Glance), under the place's head: what is told in
// one column, and what can be done held in view beside it (under it on a screen held upright), never a scroll away.
// What was just done, when it was done here; how the company came, in a line; the place's own line; a sign of life now (a
// danger, as what it is and how a fight would go); on a return, what has changed; the aim, when it wants saying; the
// few things worth doing now, each with why and what it risks, the first edged in gold (the keys' 1, 2 and 3); a quiet
// row of the nearest ways; how the company is, only when something is wrong; and Every way, Look about and More, each
// a sheet over the page. Everything else is one deliberate touch away, and nothing is guessed here.
export class GlanceStage {
  // apart: the ways are drawn by the stage, in a bar of their own across it (see WorldStage), not in this column.
  static View({ app, draw, apart }: { app: ReaderApp; draw: Draw; apart?: boolean }) {
    const s = app.state, frame = s.frame!, leaf = frame.leaf, g = leaf.glance!, screen = frame.screen;
    const exchange = leaf.exchange, told = exchange && (exchange.lines.length || exchange.notes.length) ? exchange : undefined;
    // Hurt on the way in (a trap's blade), what happened comes before the place (see Told.Place).
    const stayed = !leaf.moved && !!told, struck = !stayed && !!told && told.lines.some(l => Told.harm.test(l.text));
    const ready = Moments.ready(screen);
    // Someone here is talked to by their own plate, not by a lead above it as well (the owner, 4 November: "Talk to
    // Lambert" over a plate of Lambert that did nothing): the menu leaves the lead out and the plate is edged.
    // Opening the map is the rail's MAP, not a lead beside what is here (the owner, 4 November evening).
    // Opening the map is the rail's MAP, and going by a way is the ways' below: the leads are what else is worth doing
    // (the owner, 4 November evening: the ways had been said twice).
    const going = new Set(SceneSurface.open(screen, SceneSurface.choices(app), []).map(x => x.c.id));
    const acts = (app.menu.leads ?? g.acts).filter(a => {
      const c = GlanceStage.choice(app, a.choice);
      return c?.id !== MenuModel.country.id && !going.has(c?.id ?? '');
    });
    const leading = new Set<string | undefined>(app.menu.leading ?? []);
    // What the glance ranks first is marked first, a lead or someone's plate (the owner, 4 November: lead 1 had been
    // marked though talking to Theren, on her plate, was what the aim followed asked).
    const top = GlanceStage.first(app);
    return (
      <div className={`glance arrival-${g.arrival}${GlanceStage.sparse(app, acts, g) ? ' sparse' : ''}`} data-region="glance"
        data-arrival={g.arrival}>
        {apart ? <GlanceStage.Rest app={app} glance={g} /> : <div className="told-col" data-region="told">
          {s.pending ? <Told.Working pending={{ ...s.pending, stage: s.stage }} />
            : (stayed || struck) && <Told.Happened exchange={told!} said={stayed} ready={ready} app={app} />}
          {g.came && <GlanceStage.Came app={app} came={g.came} />}
          {screen.dark && !g.sight && <p className="dark-note">It is dark here. You have no light to see by.</p>}
          {g.sight && <p className="sight" data-id={g.sight.id}>{Typography.curl(g.sight.text)}</p>}
          <GlanceStage.Life app={app} glance={g} />
          {g.changed.length > 0 && <div className="changed">
            <p className="label">Since you were last here</p>
            {g.changed.map((l, i) => <p key={i}>{Typography.curl(l)}</p>)}
          </div>}
          {/* What came of coming here (the grey dog comes over to push her nose into your hand). */}
          {!s.pending && told && !stayed && !struck && <Told.Happened exchange={told} ready={ready} app={app} />}
          {/* What the act opened that the glance does not lead with (asking Alfric along, once he has said he will
              go), said in a line under what came of it: the button stays where it is drawn (REV-05). */}
          {/* Not on a place at rest, which names no act (the owner, 5 November): what it opened is in the explorer. */}
          {!apart && !s.pending && told && g.after?.next && !g.after.next.choice && <p className="opened-now" data-id="next">
            <span className="label">Now open</span>{` ${Typography.curl(g.after.next.label)}`}</p>}
        </div>}
        {/* What can be done here, held in view beside what is told (the owner, 4 November: never a scroll away). */}
        <div className="do-col" data-region="do">
          <div className="do-list">
            {!apart && <GlanceStage.Aim app={app} said={g.aim} />}
            {g.need && <p className="need" data-id="need">{g.need.map(n => <span key={n}>{Typography.curl(n)}</span>)}</p>}
            {apart ? <GlanceStage.Resting app={app} draw={draw} top={top}
              acts={(app.menu.leads ?? g.acts).filter(a => GlanceStage.choice(app, a.choice)?.id !== MenuModel.country.id)} />
              : <><GlanceStage.Acts app={app} draw={draw} acts={acts} top={top} />
                <GlanceStage.People app={app} draw={draw} led={new Set(acts.map(a => GlanceStage.choice(app, a.choice)?.id))}
                  leading={leading} top={top} why={g.acts[0]?.note} />
                <GlanceStage.Around app={app} draw={draw} led={new Set(acts.map(a => GlanceStage.choice(app, a.choice)?.id))} />
              </>}
          </div>
          {/* The ways from here at the foot, always in view: where the company can go, and how to leave. */}
          {!apart && <GlanceStage.Row app={app} draw={draw} glance={g} />}
        </div>
      </div>
    );
  }
  // Who is here, in sight without Look about (the owner, 3 November: whoever keeps a shop, and the people of a place,
  // had been a deliberate look away): those the company has a stake in, then whoever sells, then whoever has something
  // to be asked, the rest after; a few at most, the others under Look about, which is for a crowd.
  // A choice the glance leads with already (Talk to Falkor) is not drawn again on their plate: one choice is one
  // button on the page, and the keys and a browser's driver find it once.
  static People({ app, draw, led, leading, top, why }: { app: ReaderApp; draw: Draw; led: Set<string | undefined>;
    leading: Set<string | undefined>; top?: string; why?: string }) {
    const all = GlanceStage.people(app);
    if (!all.length) { return null; }
    const shown = GlanceStage.cast(app).map(x => ({ ...x, choices: x.choices.filter(c => !led.has(c.id)) }));
    const more = all.length - shown.length;
    return (
      <div className="cast glance-cast" data-line="People here">
        <p className="label">{all.length === 1 ? 'Someone here' : 'People here'}</p>
        <ul className="plates">{shown.map(x => <li key={x.id} data-subject={x.id} className="brief">
          <PlaceStage.Plate subject={x} draw={draw} brief led={x.choices.some(c => leading.has(c.id))}
            first={x.choices.some(c => c.id === top) ? why ?? '' : undefined} /></li>)}</ul>
        {more > 0 && <p className="more-here">{`And ${more} more about the place.`}</p>}
      </div>
    );
  }
  // At rest in a place (the owner, 4 November, late, and 5 November: a settled contract), what is told: the place
  // whole, always (5 November, late: never folded away), how the company came, and what came of what was last done
  // here, under it; a danger in its own block. On the game's first page, the first goal the company's own errand
  // gives it, said once in so many words (the owner's play of 7 November: the opening told the story of the father's
  // cart, and nothing said that it was something to do).
  // The column says when more of it lies below (see Scrolled), and what was just done here is brought into view in it
  // (see Told.Happened).
  static Rest({ app, glance: g }: { app: ReaderApp; glance: Glance }) {
    const s = app.state, leaf = s.frame!.leaf, exchange = leaf.exchange, screen = s.frame!.screen;
    const told = exchange && (exchange.lines.length || exchange.notes.length) && !s.kept ? exchange : undefined;
    const struck = !leaf.moved ? false : !!told && told.lines.some(l => Told.harm.test(l.text)), col = useRef(null);
    Scrolled.useCue(col, s.frame);
    return <div className="told-col" data-region="told" ref={col}>
      {s.pending && !s.exploring && <Told.Working pending={{ ...s.pending, stage: s.stage }} />}
      {struck && told && <Told.Happened exchange={told} ready={Moments.ready(screen)} app={app} />}
      {g.came && <GlanceStage.Came app={app} came={g.came} />}
      {screen.dark && <p className="dark-note">It is dark here. You have no light to see by.</p>}
      {/* A danger before the place's telling: under it, its words had been below the fold (round 4, E 61). */}
      {g.life?.danger && <GlanceStage.Life app={app} glance={g} />}
      <Told.Setting app={app} />
      {!g.life?.danger && <GlanceStage.Life app={app} glance={g} />}
      {g.goal && !s.opened && <p className="first-goal" data-id="goal"><span className="label">Your first goal</span>
        {Typography.curl(Words.upper(g.goal))}</p>}
      {g.changed.length > 0 && <div className="changed">
        <p className="label">Since you were last here</p>
        {g.changed.map((l, i) => <p key={i}>{Typography.curl(l)}</p>)}
      </div>}
      {!s.pending && told && !struck && <Told.Happened exchange={told} said={!leaf.moved} ready={Moments.ready(screen)}
        app={app} />}
    </div>;
  }
  // And what can be done from it: only what will not wait (a danger, an answer owed, a warning, the dark), each one
  // line, never a way; then a few quiet touches, each opening one thing for one purpose (see Explorer): Go… (where to
  // go), Look… (the things at hand, where there are any), Wait… and Search. Who is here is on the picture.
  // A touch is marked (its dot) only where what it opens serves the aim the company follows: Go… where a way goes
  // where that aim does, Look… where a thing at hand is what it is about (the owner's play of 7 November: "Go…" in
  // gold on every page, and a dot beside "Look…", while the notes said nothing was asked of the company yet).
  static Resting({ app, draw, acts, top }: { app: ReaderApp; draw: Draw; acts: Promoted[]; top?: string }) {
    const search = Pastime.search(app), hand = AtHand.of(app), posted = GlanceStage.posted(app);
    // What a touch of its own draws (a notice, the one way on) is not drawn again among what is led with.
    const ways = Wayfinder.ways(app), only = GlanceStage.only(app), touched = [posted?.id, only?.c.id, search?.id];
    const shown = GlanceStage.foreground(app, acts).filter(a => !touched.includes(GlanceStage.choice(app, a.choice)?.id));
    const drawn = shown.map(a => GlanceStage.choice(app, a.choice));
    const found = GlanceStage.found(app, hand), yours = GlanceStage.yours(app, acts, [posted, search, ...drawn]);
    return <>
      {shown.length > 0 && <GlanceStage.Acts app={app} draw={draw} acts={shown} top={top} />}
      <p className="openers">
        {posted && <Act.View choice={posted} draw={draw} quiet className="opener opens-posted">
          {Typography.curl(posted.label)}</Act.View>}
        {yours && <Act.View choice={yours} draw={draw} quiet className="opener opens-yours led">
          {Typography.curl(yours.label)}</Act.View>}
        {only ? <Act.View choice={only.c} draw={draw} quiet
          className={`opener opens-go${only.aim === 'followed' ? ' led' : ''}`}>
          {Typography.curl(`To ${only.name}…`)}</Act.View>
          : <Explorer.Opener app={app} part="go" label="Go…" led={!!Wayfinder.aimed(ways)} />}
        {found && <Explorer.Opener app={app} part="look" label={`${found.name}…`} led={GlanceStage.serves(app, [found])} />}
        {hand.length > 0 && <Explorer.Opener app={app} part="look" label="Look…" led={GlanceStage.serves(app, hand)} />}
        {Pastime.wait(app) && <Explorer.Opener app={app} part="wait" label="Wait…" glyph="wait" />}
        {search && <Act.View choice={search} draw={draw} quiet className="opener search by-glyph">
          <Glyphs.View id="search" className="opener-glyph" label="Search" /></Act.View>}
      </p>
    </>;
  }
  // A notice put up here and not yet read, met on the scene itself (M19-86: the notice that sets a town's jobs had been
  // under Look…, one thing among others): the place's own offer to read it. Read, it is at hand like the rest.
  static posted(app: ReaderApp): Choice | undefined {
    return (app.menu.scene?.you ?? []).find(c => SceneModel.own(c) && /^Read /.test(c.label) && !c.disabled);
  }
  // What the company itself can do that the place leads with first (ring the bell it carries, among the hobs), as a
  // touch of its own, as an unread notice is: led with and drawn nowhere but Look…, the reference tour had stopped at
  // it (Mission 20).
  static yours(app: ReaderApp, acts: Promoted[], drawn: (Choice | undefined)[]): Choice | undefined {
    const lead = acts.find(a => a.tier > 0 && !a.exit && !a.choice.startsWith('travel:') && !a.subject);
    const c = lead && (app.menu.scene?.you ?? []).find(x => x.id === lead.choice);
    return c && !c.disabled && !drawn.some(d => d?.id === c.id) ? c : undefined;
  }
  // A find the place leads with (the stolen bell in the hobs' plunder, a treasure in a vault), named on the scene with
  // its own touch, as an unread notice is: it had been only under Look…, undotted for another aim's, and nothing on the
  // page said it was there (the reference tour of Mission 20 stopped at it). Look… opens on it (see Explorer.open).
  static found(app: ReaderApp, hand: ReturnType<typeof AtHand.of>): ReturnType<typeof AtHand.of>[number] | undefined {
    const h = AtHand.led(app, hand), subject = h && app.menu.scene?.subjects.find(x => x.id === h.id);
    return subject?.kind === 'thing' ? h : undefined;
  }
  // Whether a thing at hand is led with for the aim followed: what that aim names, or is about (see Affordances).
  static serves(app: ReaderApp, hand: ReturnType<typeof AtHand.of>): boolean {
    const g = app.state.frame?.leaf.glance, ids = new Set((app.menu.leads ?? g?.acts ?? [])
      .filter(a => GlanceStage.aiming.has(a.why)).flatMap(a => GlanceStage.choice(app, a.choice)?.id ?? []));
    return hand.some(h => h.choices.some(c => ids.has(c.id)) || h.opens.some(id => ids.has(id)));
  }
  // The reasons a lead is the aim followed's: what it names, a way toward it, what it is about here.
  static readonly aiming = new Set(['named', 'toward', 'about']);
  // The one way on, where there is only one and it can be taken: offered as itself, not behind Go… (the owner, 6
  // November: two clicks for no choice).
  static only(app: ReaderApp): ReturnType<typeof Wayfinder.ways>[number] | undefined {
    const ways = Wayfinder.ways(app);
    return ways.length === 1 && !ways[0]!.c.disabled && ways[0]!.c.command ? ways[0] : undefined;
  }
  // What will not wait (a danger, an answer owed, a warning, the dark), as a situation, never a way: a place at rest
  // shows its name, its picture, a few words of it, who is here and Explore…, and nothing of where to go or what is
  // ranked next (the owner, 5 November: a settled contract; the ways, the aim's next step and the rest are in the
  // explorer).
  // In the dark, a light the company can light comes first and is never one too many: two dangers had left it off the
  // page under "No light", and a player with a candle in the pack met the bats blind (round 5).
  static pressing(acts: Promoted[]): Promoted[] {
    const urgent = acts.filter(a => a.tier === 0 && !a.exit && !a.choice.startsWith('travel:'));
    const light = urgent.find(a => a.why === 'dark');
    return [...light ? [light] : [], ...urgent.filter(a => a !== light).slice(0, 2)];
  }
  // What a place offers, at rest: what will not wait, then the few other things the glance finds worth doing here,
  // four at most (amendment 6, B: two to four genuinely different opportunities, never filler). Whoever is here is on
  // the picture, a journey on the map, and what the place's own touches open (a notice, a find) is drawn by them.
  static foreground(app: ReaderApp, acts: Promoted[]): Promoted[] {
    const pressing = GlanceStage.pressing(acts), person = (a: Promoted) => !!a.subject
      && (app.menu.scene?.subjects ?? []).some(x => x.id === a.subject && ['person', 'companion'].includes(x.kind));
    const rest = acts.filter(a => !pressing.includes(a) && !a.choice.startsWith('travel:') && !person(a));
    return [...pressing, ...rest].slice(0, 4);
  }
  // What a place at rest draws that can be chosen: whoever is here, on the picture, and what is pressing.
  static atRest(app: ReaderApp): Set<string> {
    const g = app.state.frame?.leaf.glance, subjects = app.menu.scene?.subjects ?? [];
    const pressing = g ? GlanceStage.foreground(app, app.menu.leads ?? g.acts)
      .flatMap(a => GlanceStage.choice(app, a.choice)?.id ?? []) : [];
    return new Set([...pressing, ...Pastime.search(app)?.id ?? [], ...GlanceStage.only(app)?.c.id ?? [], ...GlanceStage.posted(app)?.id ?? [], ...subjects.filter(x => ['companion', 'person'].includes(x.kind))
      .flatMap(x => PlaceStage.into(x)?.id ?? [])]);
  }
  // Four: two rows of the rail, so that the ways under them are in view too.
  static readonly most = 10;
  static people(app: ReaderApp): SceneSubject[] {
    return (app.menu.scene?.subjects ?? []).filter(x => x.kind === 'person' && !x.danger);
  }
  // Those shown by their plates: whom the company has a stake in, then whoever sells, then whoever has something to be
  // asked, the rest after, a few at most.
  static cast(app: ReaderApp): SceneSubject[] {
    const rank = (x: SceneSubject) => (x.stake ? 0 : GlanceStage.sells(x.choices) ? 1 : x.asked ? 2 : 3);
    return [...GlanceStage.people(app)].sort((a, b) => rank(a) - rank(b)).slice(0, GlanceStage.most);
  }
  private static sells(choices: Choice[]): boolean {
    return choices.some(c => /^Buy\b/.test(c.label) || GlanceStage.sells(c.children ?? []));
  }
  // The aim followed, on every page, with the way to it where the way is known (the owner, 3 November: a clearer
  // quest followed); with none followed, the aim this place is about, when it wants saying.
  static Aim({ app, said }: { app: ReaderApp; said?: string }) {
    // Not on the first page, before anything is done: the opening has just told it.
    const screen = app.state.frame!.screen, followed = screen.elapsed ? Followed.of(screen) : undefined;
    const aim = followed ?? said, recap = app.state.frame!.leaf.recap?.aim;
    // Nor again under "Where you left off", which has just said it.
    if (aim && recap === aim) { return null; }
    // Followed, it opens the map on itself (see MapView.aim).
    if (!aim) { return null; }
    const place = followed && Aims.named(screen, screen.destinations ?? [], followed);
    return (
      <p className={`aim${followed ? ' followed' : ''}`} data-id="aim"><span className="label">
        {followed ? 'Following' : 'An aim'}</span>{Typography.curl(Words.upper(aim))}
        {place && <button type="button" className="act set-out" data-action="aim-map" data-id={place.id}
          onClick={() => app.choose(MenuModel.country)}>{`${place.name}, on the map`}</button>}</p>
    );
  }
  // How the company came, in a line; a journey's legs, each as it went, opened from it (they are under Look about too).
  static Came({ app, came }: { app: ReaderApp; came: string }) {
    const travel = app.state.frame!.travel, stopped = travel && !travel.arrived ? ' stopped' : '';
    if (!travel || travel.legs.length < 2) { return <p className={`came${stopped}`}>{Typography.curl(came)}</p>; }
    return (
      <details className={`came${stopped}`} data-region="journey">
        <summary data-action="journey">{Typography.curl(came)}</summary>
        <Journey.View travel={travel} />
      </details>
    );
  }
  // A sign of life now: a danger, as what it is, what it is doing and how a fight would go (what can be done about it
  // is what the glance leads with, and every way of meeting it is under Look about); or someone's words or doings; or
  // the place's passing life. In words alone: whoever it is about is on the picture by their likeness, and no
  // likeness stands in the telling (the owner's own play, 7 November: a brother's portrait had been set into the
  // market-place's prose).
  static Life({ app, glance: g }: { app: ReaderApp; glance: Glance }) {
    const life = g.life, subject = life?.subject ? app.menu.scene?.subjects.find(x => x.id === life.subject) : undefined;
    if (!life) { return null; }
    // Not a line the place has told already (the Stormy Horn's hiring line, told with the place and again here).
    const told = (app.state.frame?.leaf.situation ?? []).map(t => Typography.curl(t));
    if (!life.danger && told.includes(Typography.curl(life.text))) { return null; }
    // How a fight would go is said once, on the attack led with when it is (see Marks), and here when it is not.
    const reckoned = g.acts.some(a => a.marks.some(m => m.kind === 'fight'));
    if (life.danger && subject) { return <GlanceStage.Danger subject={subject} text={life.text} reckoned={reckoned} />; }
    return (
      <p className="life" data-subject={life.subject} data-id={life.id}>
        <span className="said">{Typography.curl(life.text)}</span>
      </p>
    );
  }
  static Danger({ subject: c, text, reckoned }: { subject: SceneSubject; text: string; reckoned: boolean }) {
    return (
      <section className="threat" data-subject={c.id} aria-label={`Danger: ${c.name}`}>
        <p className="label">Danger</p>
        <p className="n">{Typography.curl(Words.upper(c.name))}{c.note && <span className="r"> · {Typography.curl(c.note)}</span>}</p>
        <p className="d">{Typography.curl(text)}</p>
        {c.danger && !reckoned && <p className="reckoning">{Typography.curl(c.danger)}</p>}
      </section>
    );
  }
  // What the glance leads with, best first: each as the player would say it, why beside it (your brother, your aim,
  // the way you came), and under it what it risks, in words; whatever it opens, open under it.
  static Acts({ app, draw, acts, top }: { app: ReaderApp; draw: Draw; acts: Promoted[]; top?: string }) {
    const shown = acts.flatMap(a => { const c = GlanceStage.choice(app, a.choice); return c ? [{ a, c }] : []; })
      .filter((x, i, all) => all.findIndex(y => y.c.id === x.c.id) === i);
    if (!shown.length) { return null; }
    return (
      <ol className="led" aria-label="What you could do now">{shown.map(({ a, c }, i) => {
        // What it is to the company, drawn by the page's one table of tones (see Emphasis), and said in words.
        const label = GlanceStage.label(app, a, c), note = GlanceStage.note(a, c, label) ?? Emphasis.said(a.aspects);
        const { tone, also } = Emphasis.of(a.aspects);
        return <li key={a.choice} data-promoted={i + 1} data-why={a.why} data-aspects={a.aspects?.join(' ') || undefined}
          data-next={app.state.frame?.leaf.glance?.after?.next?.choice === a.choice || undefined}>
          <Act.View choice={c} draw={draw}
            className={`led-act${c.id === top ? ' first' : ''}${tone ? ` tone-${tone}` : ''}`}>
            <span className="n">{Typography.curl(label)}</span>
            {note && <span className="why-said">{Typography.curl(note)}
              {also.map(t => <i key={t} className={`also tone-${t}`} aria-hidden="true" />)}</span>}
            <kbd className="key" aria-hidden="true">{i + 1}</kbd>
            {a.marks.map(m => <span key={m.kind} className={`led-mark mark-${m.kind}${m.danger ? ` danger-${m.danger}` : ''}`}>{Typography.curl(Words.upper(m.said))}</span>)}
          </Act.View>
          <PlaceStage.Opened choice={c} draw={draw} />
        </li>;
      })}</ol>
    );
  }
  // As the player would say it: "Make much of the grey dog", "Look at the fresh ruts".
  static label(app: ReaderApp, a: Promoted, c: Choice): string {
    const subject = a.subject && app.menu.scene?.subjects.find(x => x.id === a.subject);
    if (subject && /#look$/.test(c.id)) { return `Look at ${subject.name.replace(/^(The|A|An|Some) /, m => m.toLowerCase())}`; }
    // Something done to what bars a way, as the act ("Pick the corn-store padlock"), not the way it is on.
    const tried = /^exit:[^/]+\/\d+:/.test(c.id) ? / — (.+)$/.exec(c.label)?.[1] : undefined;
    return tried ? Words.upper(tried) : MenuModel.said(app.menu, c);
  }
  // Why, unless it is said already ("Talk to your brother" is not "your brother" again, nor a fight's reckoning that its
  // mark says whole); for what is found by turning to someone or something, what it is (the ruts, to follow).
  static note(a: Promoted, c: Choice, label: string): string | undefined {
    const inside = a.command && a.command !== c.command
      ? Attending.all(c.children ?? []).find(k => k.command === a.command)?.label : undefined;
    const note = a.note ?? inside?.toLowerCase(), said = [label, ...a.marks.map(m => m.said)].join(' ').toLowerCase();
    return note && !said.includes(note.toLowerCase()) ? note : undefined;
  }
  // The quiet row: the nearest ways the glance rows (across the open country, the compass).
  static Row({ app, draw, glance: g }: { app: ReaderApp; draw: Draw; glance: Glance }) {
    // Every way from here, once, in the panel beside the picture, never over it (the owner, 4 November evening): which
    // way it goes, where, how long; the aim's marked. Ranked as the glance ranks them.
    // Each a short label, its kind by its mark (into, out, up, down); what more there is to say of one (how long, what
    // it risks, why it is shut) in one line under them, for the way under the finger or the keys, or the aim's (the
    // owner, 4 November, late: a way's reasons had swollen its button to half the panel). Those within the town and
    // those out of it apart, so how to leave is plain.
    const screen = app.state.frame!.screen, aimed = PlaceStage.aimed(app);
    const open = SceneSurface.open(screen, SceneSurface.choices(app), [...g.acts.map(a => a.choice), ...g.ways]);
    if (!open.length) { return null; }
    const ways = open.map(({ c, exit }) => ({ c, exit, whither: SceneSurface.whither(exit),
      name: exit?.destination.name ?? c.label.replace(/^To /, ''),
      aim: aimed.some(id => id === c.id || id.startsWith(`${exit?.id}/`)) }));
    const leaving = (w: (typeof ways)[number]) => ['Out', 'Away'].includes(w.whither);
    const shown = ways.find(w => w.c.id === app.state.hovered) ?? ways.find(w => w.aim);
    const town = screen.path.find(p => ['settlement', 'site'].includes(p.kind))?.name;
    const group = (list: typeof ways, label: string) => list.length > 0 && <div className="way-group">
      <p className="label">{label}</p>
      <ul>{list.map(w => <li key={w.c.id} onMouseEnter={() => app.hover(w.c.id)} onFocus={() => app.hover(w.c.id)}
        onClickCapture={() => { if (w.c.disabled) { app.hover(w.c.id); } }}>
        <Act.View choice={w.c} draw={draw} quiet className={`way-tile${w.aim ? ' aimed' : ''}`}>
          <span className={`glyph whither-${w.whither.toLowerCase()}`} aria-hidden="true">
            {w.c.disabled ? '⊘' : SceneSurface.glyph(w.whither)}</span>
          <span className="n">{GlanceStage.short(w.exit?.destination.name ?? w.c.label.replace(/^To /, ''))}</span>
        </Act.View></li>)}</ul></div>;
    return (
      <nav className="ways-here" aria-label="The ways from here">
        {group(ways.filter(w => !leaving(w)), town ? `In ${Typography.curl(town.replace(/^the /i, 'the '))}` : 'Ways')}
        {group(ways.filter(leaving), town ? `Out of ${Typography.curl(town)}` : 'Out')}
        <p className="way-detail" aria-live="polite">{shown ? GlanceStage.detail(shown) : ''}</p>
      </nav>
    );
  }
  // A way's label: its place's name without the article it is said with ("The byre" is Byre), the whole name in the
  // way's detail line.
  static short(name: string): string { return Typography.curl(Words.upper(name.replace(/^(the|a|an) /i, ''))); }
  // What more there is to say of a way than its name: which way it goes and how long, the aim's, what it risks, and
  // why it is shut if it is.
  static detail(w: { c: Choice; whither: string; aim: boolean; name: string }): string {
    const c = w.c, time = (c.minutes ?? 0) > 5 ? Words.span(c.minutes!) : '';
    return Typography.curl([w.name, c.disabled ? `shut: ${c.disabled}` : '', w.aim ? 'your aim' : '',
      w.whither !== 'To' ? w.whither.toLowerCase() : '', time, ...(c.marks ?? []).map(m => m.said)]
      .filter(Boolean).map((x, i) => i ? x : Words.upper(x)).join(' · '));
  }
  // What else is here and what the company can do of itself, at once, not a sheet away (the owner, 4 November
  // evening: Every way, Look about and More had been crutches): the animals and things here, each with what can be
  // done with it; what the place offers to do; and the company's own acts (wait, search, rest, light).
  static Around({ app, draw, led, apart }: { app: ReaderApp; draw: Draw; led: Set<string | undefined>; apart?: boolean }) {
    const scene = app.menu.scene;
    if (!scene) { return null; }
    const doing = scene.you.filter(c => SceneModel.own(c) && !led.has(c.id));
    // Not again what a lead above is about (the charcoal stack, led with and a chip both).
    const small = scene.subjects.filter(x => (x.kind === 'animal' || x.kind === 'thing') && !x.danger
      && !x.choices.some(c => led.has(c.id) || (c.children ?? []).some(k => led.has(k.id))));
    const yours = scene.you.filter(c => !SceneModel.own(c));
    return <>
      {small.length > 0 && <div className="also-here" data-line="To look at">
        <p className="label">{small.some(x => x.kind === 'thing') ? 'Here too' : 'Animals'}</p>
        <ul className="chips">{small.map(x => <li key={x.id} data-subject={x.id}>
          <PlaceStage.Chip subject={x} draw={draw} /></li>)}</ul></div>}
      {doing.length > 0 && <div className="doing" data-line="To do here"><p className="label">To do here</p>
        <Act.List choices={doing} draw={draw} className="small" marked /></div>}
      {yours.length > 0 && !apart && <GlanceStage.Yours app={app} draw={draw} />}
    </>;
  }
  // What the company can do of itself wherever it is (wait, search, rest, light a candle).
  static Yours({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const yours = (app.menu.scene?.you ?? []).filter(c => !SceneModel.own(c));
    return yours.length > 0 && <div className="yours-here" data-line="Yourself">
      <p className="label">Yourself</p>
      <Act.List choices={yours} draw={draw} className="small" marked /></div>;
  }
  // A place with no one in it and little to do (a cellar, a stair) is drawn as one column, what to do under what is
  // told, not two panes half empty (the product-design review's PD-06).
  static sparse(app: ReaderApp, acts: Promoted[], g: Glance): boolean {
    return !GlanceStage.people(app).length && acts.length + g.ways.length <= 3;
  }
  // What the glance ranks first, as the page draws it; and where it is among the page's choices (-1, none).
  static first(app: ReaderApp): string | undefined {
    const first = app.state.frame?.leaf.glance?.acts[0];
    return first && GlanceStage.choice(app, first.choice)?.id;
  }
  static top(app: ReaderApp): number {
    const id = GlanceStage.first(app);
    return id ? app.menu.choices.findIndex(c => c.id === id) : -1;
  }
  // A way out into the country, in a town or a site, is drawn as going out to it (see MenuModel.place).
  static choice(app: ReaderApp, id: string): Choice | undefined {
    return MenuModel.lead(app.menu, id);
  }
}
