import type { Glance, Promoted } from '../../../src/presentation/glance-types';
import type { Choice } from '../../../src/ui/choice-list';
import type { SceneSubject } from '../../../src/ui/scene';
import type { ReaderApp } from '../reader-app';
import { Attending } from '../../../src/ui/attention';
import { Typography } from '../../../src/presentation/typography';
import { MenuModel } from '../menu-model';
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
        {g.aim && <p className="aim" data-id="aim"><span className="label">Your aim</span>
          {Typography.curl(Words.upper(g.aim))}</p>}
        <GlanceStage.Acts app={app} draw={draw} acts={g.acts} />
        <GlanceStage.Row app={app} draw={draw} glance={g} />
        {g.need && <p className="need" data-id="need">{g.need.map(n => <span key={n}>{Typography.curl(n)}</span>)}</p>}
        <GlanceStage.Keys app={app} />
      </div>
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
  static Acts({ app, draw, acts }: { app: ReaderApp; draw: Draw; acts: Promoted[] }) {
    const shown = acts.flatMap(a => { const c = GlanceStage.choice(app, a.choice); return c ? [{ a, c }] : []; });
    if (!shown.length) { return null; }
    return (
      <ol className="led" aria-label="What you could do now">{shown.map(({ a, c }, i) => {
        const label = GlanceStage.label(app, a, c), note = GlanceStage.note(a, c, label);
        return <li key={a.choice} data-promoted={i + 1} data-why={a.why}>
          <Act.View choice={c} draw={draw} className={`led-act${i === 0 ? ' first' : ''}`}>
            <span className="n">{Typography.curl(label)}</span>
            {note && <span className="why-said">{Typography.curl(note)}</span>}
            <kbd className="key" aria-hidden="true">{i + 1}</kbd>
            {a.marks.map(m => <span key={m.kind} className={`led-mark mark-${m.kind}`}>{Typography.curl(Words.upper(m.said))}</span>)}
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
    return MenuModel.said(app.menu, c);
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
    const ways = g.ways.flatMap(id => GlanceStage.choice(app, id) ?? []), aimed = PlaceStage.aimed(app);
    const screen = app.state.frame!.screen;
    if (!ways.length) { return null; }
    return (
      <nav className="glance-row" aria-label="The nearest ways">
        <ul className="tiles">{ways.map(c => {
          const exit = screen.exits.find(e => e.id === c.id), step = exit?.bearing;
          return <li key={c.id} className={step ? 'step' : undefined}>
            <Act.View choice={c} draw={draw} marked className={`tile${aimed.includes(c.id) ? ' aimed' : ''}`}>
              <span className="n">{step ? Words.upper(step) : Typography.curl(WaysPane.short(c.label))}</span>
              {step && <span className="r">{Typography.curl(exit!.destination.name)}</span>}
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
  static choice(app: ReaderApp, id: string): Choice | undefined { return app.menu.choices.find(c => c.id === id); }
}
