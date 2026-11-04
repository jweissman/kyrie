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
import { Act, type Draw } from './act';
import { Journey } from './journey';
import { LookAbout } from './look-about';
import { Moments } from './moments';
import { PlaceStage } from './place-stage';
import { Raised } from './raised';
import { Told } from './told';
import { WaysPane } from './ways-pane';

// A place at a glance (OWN-18, OWN-19), as the engine decides it (see Glance): one column under the place's head. What
// was just done, when it was done here; how the company came, in a line; the place's own line; a sign of life now (a
// danger, as what it is and how a fight would go); on a return, what has changed; the aim, when it wants saying; the
// few things worth doing now, each with why and what it risks, the first edged in gold (the keys' 1, 2 and 3); a quiet
// row of the nearest ways; how the company is, only when something is wrong; and Every way, Look about and More, each
// a sheet over the page. Everything else is one deliberate touch away, and nothing is guessed here.
export class GlanceStage {
  static View({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const s = app.state, frame = s.frame!, leaf = frame.leaf, g = leaf.glance!, screen = frame.screen;
    const exchange = leaf.exchange, told = exchange && (exchange.lines.length || exchange.notes.length) ? exchange : undefined;
    // Hurt on the way in (a trap's blade), what happened comes before the place (see Told.Place).
    const stayed = !leaf.moved && !!told, struck = !stayed && !!told && told.lines.some(l => Told.harm.test(l.text));
    const ready = Moments.ready(screen);
    // Someone here is talked to by their own plate, not by a lead above it as well (the owner, 4 November: "Talk to
    // Lambert" over a plate of Lambert that did nothing): the menu leaves the lead out and the plate is edged.
    const acts = app.menu.leads ?? g.acts, leading = new Set<string | undefined>(app.menu.leading ?? []);
    // What the glance ranks first is marked first, a lead or someone's plate (the owner, 4 November: lead 1 had been
    // marked though talking to Theren, on her plate, was what the aim followed asked).
    const top = g.acts[0] && GlanceStage.choice(app, g.acts[0].choice)?.id;
    return (
      <div className={`glance arrival-${g.arrival}`} data-region="glance" data-arrival={g.arrival}>
        {leaf.recap && (leaf.recap.aim || leaf.recap.last) && <Told.Recap recap={leaf.recap} />}
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
        {!s.pending && told && g.after?.next && !g.after.next.choice && <p className="opened-now" data-id="next">
          <span className="label">Now open</span>{` ${Typography.curl(g.after.next.label)}`}</p>}
        <GlanceStage.Aim app={app} said={g.aim} />
        <GlanceStage.Acts app={app} draw={draw} acts={acts} top={top} />
        <GlanceStage.People app={app} draw={draw} led={new Set(acts.map(a => GlanceStage.choice(app, a.choice)?.id))}
          leading={leading} top={top} why={g.acts[0]?.note} />
        <GlanceStage.Row app={app} draw={draw} glance={g} />
        {g.need && <p className="need" data-id="need">{g.need.map(n => <span key={n}>{Typography.curl(n)}</span>)}</p>}
        <GlanceStage.Keys app={app} />
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
        <ul className="plates">{shown.map(x => <li key={x.id} data-subject={x.id} className="brief">
          <PlaceStage.Plate subject={x} draw={draw} brief led={x.choices.some(c => leading.has(c.id))}
            first={x.choices.some(c => c.id === top) ? why ?? '' : undefined} /></li>)}</ul>
        {more > 0 && <p className="more-here">{`And ${more} more, under Look about.`}</p>}
      </div>
    );
  }
  static readonly most = 6;
  private static people(app: ReaderApp): SceneSubject[] {
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
        {followed ? 'Following' : 'Your aim'}</span>{Typography.curl(Words.upper(aim))}
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
  // is what the glance leads with, and every way of meeting it is under Look about); or someone's words or doings, with
  // their likeness when one fits; or the place's passing life.
  static Life({ app, glance: g }: { app: ReaderApp; glance: Glance }) {
    const life = g.life, subject = life?.subject ? app.menu.scene?.subjects.find(x => x.id === life.subject) : undefined;
    if (!life) { return null; }
    // How a fight would go is said once, on the attack led with when it is (see Marks), and here when it is not.
    const reckoned = g.acts.some(a => a.marks.some(m => m.kind === 'fight'));
    if (life.danger && subject) { return <GlanceStage.Danger subject={subject} text={life.text} reckoned={reckoned} />; }
    const face = subject?.portrait;
    return (
      <p className={`life${face ? ' faced' : ''}`} data-subject={life.subject} data-id={life.id}>
        {face && <span className="face" aria-hidden="true"><img src={face.src} alt="" decoding="async"
          style={{ objectPosition: `50% ${face.focus}%` }}
          onError={e => { e.currentTarget.parentElement?.classList.add('gone'); }} /></span>}
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
        const label = GlanceStage.label(app, a, c), note = GlanceStage.note(a, c, label);
        return <li key={a.choice} data-promoted={i + 1} data-why={a.why}
          data-next={app.state.frame?.leaf.glance?.after?.next?.choice === a.choice || undefined}>
          <Act.View choice={c} draw={draw} className={`led-act${c.id === top ? ' first' : ''}`}>
            <span className="n">{Typography.curl(label)}</span>
            {note && <span className="why-said">{Typography.curl(note)}</span>}
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
    // In a town or a site, going out to the country is always among the nearest ways (see MenuModel.place).
    // Not a way the glance leads with already, above (the world map had been drawn twice at Millholm's camp).
    const out = app.menu.overland ? app.menu.choices.find(c => c.id === MenuModel.country.id) : undefined;
    const led = new Set((app.menu.leads ?? g.acts).map(a => GlanceStage.choice(app, a.choice)));
    const ways = [...g.ways.flatMap(id => GlanceStage.choice(app, id) ?? []), ...out ? [out] : []]
      .filter((c, i, all) => all.indexOf(c) === i && !led.has(c)), aimed = PlaceStage.aimed(app);
    const screen = app.state.frame!.screen;
    if (!ways.length) { return null; }
    return (
      <nav className="glance-row" aria-label="The nearest ways">
        <ul className="tiles">{ways.map(c => {
          const exit = screen.exits.find(e => e.id === c.id), step = exit?.bearing, tile = WaysPane.tile(c.label);
          return <li key={c.id} className={step ? 'step' : undefined}>
            <Act.View choice={c} draw={draw} marked className={`tile${aimed.includes(c.id) ? ' aimed' : ''}`}>
              <span className="n">{step ? Words.upper(step) : Typography.curl(tile.n)}</span>
              {(step || tile.r) && <span className="r">{Typography.curl(step ? exit!.destination.name : tile.r!)}</span>}
              {(c.minutes ?? 0) > 10 && <span className="t">{Words.span(c.minutes!)}</span>}
            </Act.View></li>;
        })}</ul>
      </nav>
    );
  }
  // The keys to what is a deliberate touch away: every way, everyone and everything here, and yourself. Held at the
  // foot of the column while what is above them is longer than the screen (an arrival that something broke in on), so
  // that they are never a scroll away.
  static Keys({ app }: { app: ReaderApp }) {
    const going = WaysPane.going(app).length, here = LookAbout.count(app), up = Raised.up(app);
    return (
      <nav className="glance-keys" aria-label="What is a touch away">
        {going > 0 && <button type="button" className="all-ways" data-action="ways" aria-expanded={up === 'ways'}
          onClick={() => Raised.toggle(app, 'ways')}><span>Every way</span><span className="count">{going}</span>
          <kbd aria-hidden="true">W</kbd></button>}
        <button type="button" className="glance-key" data-action="look-about" aria-expanded={up === 'look'}
          onClick={() => Raised.toggle(app, 'look')}><span>Look about</span>
          {here > 0 && <span className="count">{here}</span>}<kbd aria-hidden="true">L</kbd></button>
        <button type="button" className="glance-key" data-action="more" aria-expanded={up === 'more'}
          onClick={() => Raised.toggle(app, 'more')}><span>More</span></button>
      </nav>
    );
  }
  // A way out into the country, in a town or a site, is drawn as going out to it (see MenuModel.place).
  static choice(app: ReaderApp, id: string): Choice | undefined {
    return MenuModel.lead(app.menu, id);
  }
}
