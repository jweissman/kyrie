import { Fragment } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import { SceneModel, type SceneSubject } from '../../../src/ui/scene';
import type { ExitRow, Screen } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Scenery } from '../../../src/ui/scenery';
import { MenuModel } from '../menu-model';
import { Likeness } from '../../../src/paintings/likeness';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { Stage } from './stage';
import { Told } from './told';
import { WaysPane } from './ways-pane';
import { GlanceStage } from './glance';
import { LookAbout } from './look-about';
import { MorePane } from './more-pane';
import { Raised } from './raised';

// A way out of a place, with every choice that goes by it (go; open it first; look at what is on it).
export interface Way { exit: ExitRow; choices: Choice[] }

// Standing somewhere (OWN-18, OWN-19). Across the head of the stage, the place as it looks (its painting, where one
// fits, dimming into the stage) with its name, where and when set on it; under it, one column: the place at a glance
// (see GlanceStage), what the engine leads with where the company stands. The whole telling with everyone and
// everything here, every way, and yourself are each a sheet raised over it by one touch (Look about, Every way, More:
// see Raised), so that the page shows what is perceived now and what is worth doing now, and nothing written is lost.
// A town square, a road in the wild and a cellar in the dark share this one shape but are lit differently: a
// settlement's head is its lane or market, the wild's its land under the hour's sky, a site's the ruin, and the dark
// has no painting at all, only the little the company can see.
export class PlaceStage {
  static View({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, screen = frame.screen, draw = Act.draw(app);
    const view = screen.dark ? undefined : Scenery.of(screen), up = Raised.up(app);
    return (
      <article className={`scene-page glance-page kind-${PlaceStage.kind(screen)}${screen.dark ? ' dark' : ''}`
        + `${up ? ` raised-${up}` : ''}`} id="page">
        <header className={`place-head${view ? ' painted' : ''}`}>
          {view && <PlaceStage.Country view={view} />}
          <div className="title-block"><Told.Heading frame={frame} /></div>
        </header>
        <section className="scene" aria-label="The place">
          <div className="measure">{frame.leaf.glance ? <GlanceStage.View app={app} draw={draw} />
            : <div className="telling"><Told.Place app={app} headed={false} here={<PlaceStage.Here app={app} draw={draw} />} /></div>}
          </div>
        </section>
        {up === 'look' && <LookAbout.Sheet app={app} draw={draw} />}
        {up === 'ways' && <WaysPane.Sheet app={app} draw={draw} />}
        {up === 'more' && <MorePane.Sheet app={app} draw={draw} />}
      </article>
    );
  }
  // What kind of place this is, for its lighting: a settlement, a site, or the wild.
  static kind(screen: Screen): 'settlement' | 'site' | 'wild' {
    const kinds = screen.path.map(p => p.kind);
    return kinds.includes('site') ? 'site' : kinds.includes('settlement') ? 'settlement' : 'wild';
  }
  // Who and what is here: danger first, then whoever the company has a stake in, large; the rest of the people as
  // plates, or in a busy place each a line (what they are doing is told when they are turned to); the animals and
  // things; whoever is with you. Marked: what each choice risks said on it (Look about).
  static Here({ app, draw, marked }: { app: ReaderApp; draw: Draw; marked?: boolean }) {
    const scene = app.menu.scene!;
    const of = (kind: SceneSubject['kind']) => scene.subjects.filter(x => x.kind === kind && !PlaceStage.danger(x));
    const people = of('person'), small = [...of('animal'), ...of('thing')], along = of('companion');
    const busy = people.filter(s => !s.stake).length > 3, threats = scene.subjects.filter(PlaceStage.danger);
    return (
      <div className="here">
        {threats.map(c => <PlaceStage.Threat key={c.id} subject={c} draw={draw} marked={marked} />)}
        {people.length > 0 && <div className={`cast${busy ? ' busy' : ''}`} data-line="People here">
          <p className="label">{people.length === 1 ? 'Someone here' : 'People here'}</p>
          <ul className="plates">{people.map(s => <li key={s.id} data-subject={s.id}
            className={s.stake ? 'lead' : busy ? 'brief' : undefined}>
            <PlaceStage.Plate subject={s} draw={draw} brief={busy && !s.stake} marked={marked} /></li>)}</ul>
        </div>}
        {small.length > 0 && <div className="also-here" data-line="To look at">
          <p className="label">{of('thing').length ? of('animal').length ? 'Animals, and things to look at'
            : 'To look at' : 'Animals'}</p>
          <ul className="chips">{small.map(s => <li key={s.id} data-subject={s.id}>
            <PlaceStage.Chip subject={s} draw={draw} marked={marked} /></li>)}</ul>
        </div>}
        {along.length > 0 && <div className="along" data-line="With you">
          <p className="label">With you</p>
          <ul className="chips">{along.map(s => <li key={s.id} data-subject={s.id}>
            <PlaceStage.Chip subject={s} draw={draw} marked={marked} /></li>)}</ul>
        </div>}
      </div>
    );
  }
  // The country a chapter opens on: a painting of it, as a band across the head of the scene, credited where the
  // painting says who painted it.
  static Country({ view }: { view: string }) {
    const credit = Likeness.credits[view];
    return (
      <figure className="scenery" aria-hidden="true">
        <img src={`paintings/large/${view}.webp`} alt="" decoding="async"
          onError={e => { e.currentTarget.parentElement?.classList.add('gone'); }} />
        {credit && <figcaption>{credit}</figcaption>}
      </figure>
    );
  }
  // Someone here, as one choice: their likeness when one fits, their name and what they are, and what they are doing
  // as the company sees them (in brief, only their name and what they are). Choosing them turns to them; anything
  // else that can be done with them is beneath.
  static Plate({ subject: s, draw, brief, marked }: { subject: SceneSubject; draw: Draw; brief?: boolean;
    marked?: boolean }) {
    const into = PlaceStage.into(s), rest = s.choices.filter(c => c !== into);
    const face = s.portrait && <span className="face" aria-hidden="true"><img src={s.portrait.src} alt="" decoding="async"
      loading="lazy" style={{ objectPosition: `50% ${s.portrait.focus}%` }}
      onError={e => { e.currentTarget.parentElement?.classList.add('gone'); }} /></span>;
    const body = <>
      {face}
      <span className="who"><span className="n">{Typography.curl(Words.upper(s.name))}</span>
        {s.note && <span className="r">{Typography.curl(s.note)}</span>}
        {s.state && <span className="r hurt">{s.state === 'dead' ? 'dead' : 'down'}</span>}
        {s.says?.[0] && !brief && <span className="doing">{Typography.curl(s.says.join(' '))}</span>}</span>
    </>;
    return <>
      {into ? <Act.View choice={into} draw={draw} className={`plate${face ? ' faced' : ''}`}>{body}</Act.View>
        : <span className={`plate still${face ? ' faced' : ''}`}>{body}</span>}
      {rest.length > 0 && <Act.List choices={rest} draw={draw} className="small under" marked={marked} />}
    </>;
  }
  // An animal, a thing to look at or someone with the company: a name to turn to, with what it is.
  static Chip({ subject: s, draw, marked }: { subject: SceneSubject; draw: Draw; marked?: boolean }) {
    const into = PlaceStage.into(s), rest = s.choices.filter(c => c !== into);
    const name = <><span className="n">{Typography.curl(Words.upper(s.name))}</span>
      {s.note && <span className="r">{Typography.curl(s.note)}</span>}
      {s.state && <span className="r hurt">{s.state === 'dead' ? 'dead' : 'down'}</span>}</>;
    return <>
      {into ? <Act.View choice={into} draw={draw} className="chip">{name}{!into.id.includes('#')
        && <span className="verb">{Typography.curl(into.label.toLowerCase())}</span>}</Act.View>
        : <span className="chip still">{name}</span>}
      {rest.length > 0 && <Act.List choices={rest} draw={draw} className="small under" marked={marked} />}
    </>;
  }
  private static into(s: SceneSubject): Choice | undefined {
    return s.choices.find(c => /#(talk|look)$/.test(c.id)) ?? (s.choices.length === 1 ? s.choices[0] : undefined);
  }
  // What could be fought: a creature, or anyone the company reckons a fight with (a band of goblins who can also be
  // talked to), but never someone travelling with it, nor what lies dead (the spiders a fight had killed were still
  // under "Danger": play 9; the telling says they lie dead).
  static danger(this: void, s: SceneSubject): boolean {
    return s.kind !== 'companion' && s.state !== 'dead' && (s.kind === 'creature' || !!s.danger);
  }
  // Something that could be fought: what it is, how a fight would go as the company reckons it, and every way of
  // meeting it, at once and before anything is done.
  static Threat({ subject: c, draw, marked }: { subject: SceneSubject; draw: Draw; marked?: boolean }) {
    return (
      <section className="threat" data-subject={c.id} aria-label={`Danger: ${c.name}`}>
        <p className="label">Danger</p>
        <p className="n">{Typography.curl(Words.upper(c.name))}{c.note && <span className="r"> · {Typography.curl(c.note)}</span>}</p>
        {c.says?.[0] && <p className="d">{Typography.curl(c.says[0])}</p>}
        {c.danger && <p className="reckoning">{Typography.curl(c.danger)}</p>}
        <Act.List choices={c.choices} draw={draw} marked={marked} />
      </section>
    );
  }
  // Each way's choices, in the order the place lists its ways: the way itself, then whatever can be done at it.
  static ways(screen: Screen, choices: Choice[]): Way[] {
    return screen.exits.map(exit => ({ exit, choices: choices.filter(c => c.id === exit.id || c.id.startsWith(`${exit.id}/`)) }))
      .filter(w => w.choices.length);
  }
  // The ways on, each a choice that says where it goes: about the place first, then the roads out of it, each with
  // its way and how long, and whether the company has been there (only a road already travelled says so).
  // Whatever the company's aims name says so (the engine decides it: see Glance.aimed).
  static Ways({ screen, near, far, draw, around = [], aimed }: { screen: Screen; near: Choice[]; far: Choice[];
    draw: Draw; around?: Choice[]; aimed: string[] }) {
    const all = PlaceStage.ways(screen, near).concat(PlaceStage.ways(screen, far)), steps = all.filter(w => w.exit.bearing);
    const about = PlaceStage.ways(screen, near).filter(w => !w.exit.bearing), out = PlaceStage.ways(screen, far)
      .filter(w => !w.exit.bearing);
    const across = far.filter(c => !all.some(w => w.choices.includes(c)));
    const scope = screen.path.filter(p => p.kind === 'settlement' || p.kind === 'site').at(-1)?.name;
    // The town's other places all by the same way are said to go by it once, not seven times (play 9).
    const by = around.length > 1 && around.every(c => c.note && c.note === around[0]!.note) ? around[0]!.note : undefined;
    return <>
      <PlaceStage.Compass steps={steps} draw={draw} />
      {(about.length > 0 || around.length > 0) && <nav className="ways about" aria-label="Ways about the place">
        <p className="label">{scope ? `About ${Typography.curl(scope)}` : 'Ways on'}</p>
        <ul className="options">{about.map(w => <li key={w.exit.id} data-exit={w.exit.id}
          className={[PlaceStage.wide(w.exit.destination.name) ? 'wide' : '',
            w.choices[0]!.disabled || w.choices.length > 1 ? 'whole' : '',
            aimed.includes(w.choices[0]!.id) ? 'aimed' : ''].filter(Boolean).join(' ') || undefined}>
          <PlaceStage.Way way={w} draw={draw} twin={about.filter(o => o.exit.destination.name
            === w.exit.destination.name).length > 1} /></li>)}
        {by && <li className="way-by">{Typography.curl(Words.upper(by))}</li>}
        {around.map(c => <li key={c.id} className={[PlaceStage.wide(c.label) ? 'wide' : '',
          aimed.includes(c.id) ? 'aimed' : ''].filter(Boolean).join(' ') || undefined}>
          <Act.View choice={c} draw={draw} className="way by" marked>
          <span className="n">{Typography.curl(Words.upper(c.label))}</span>
          {c.note && !by && <span className="r">{Typography.curl(c.note)}</span>}</Act.View></li>)}</ul>
      </nav>}
      {(out.length > 0 || across.length > 0) && <nav className="ways out" aria-label="Roads out">
        <p className="label">{about.length ? 'Roads out' : 'Ways on'}</p>
        <ul className="options">{out.map(w => <li key={w.exit.id} data-exit={w.exit.id}
          className={aimed.includes(w.choices[0]!.id) ? 'aimed' : undefined}>
          <PlaceStage.Way way={w} draw={draw} road /></li>)}
        {across.map(c => <li key={c.id} className={aimed.includes(c.id) ? 'aimed' : undefined}>
          <Act.View choice={c} draw={draw} className="way" marked /></li>)}</ul>
      </nav>}
    </>;
  }
  // The six ways across the open country, as the hexes about lie: north-west and north-east, west and east, south-west
  // and south-east, each with its land and how long it takes (they had each been "among the trees of Pharaiyaar, by
  // the way across country" in a list of roads).
  static readonly compass = ['north-west', 'north-east', 'west', 'east', 'south-west', 'south-east'];
  static Compass({ steps, draw }: { steps: Way[]; draw: Draw }) {
    if (!steps.length) { return null; }
    const at = (w: Way) => PlaceStage.compass.indexOf(w.exit.bearing ?? '');
    return (
      <nav className="ways across-country" aria-label="Across country">
        <p className="label">Across country</p>
        <ul className="compass">{[...steps].sort((a, b) => at(a) - at(b)).map(w => <li key={w.exit.id} data-exit={w.exit.id}
          data-bearing={w.exit.bearing} style={{ gridColumn: at(w) % 2 + 1 }}>
          <Act.View choice={w.choices[0]!} draw={draw} className="way stride" marked>
            <span className="n">{Words.upper(w.exit.bearing!)}</span>
            <span className="r">{Typography.curl(w.exit.destination.name)}</span>
            {w.choices[0]!.note && <span className="t">{Typography.curl(w.choices[0]!.note)}</span>}</Act.View></li>)}</ul>
      </nav>
    );
  }
  // A way, as one choice: where it goes, and beside it by what way, how long and whether you have been; what else can
  // be done at it (open it first, look at what is on it) beneath.
  static Way({ way, draw, twin, road }: { way: Way; draw: Draw; twin?: boolean; road?: boolean }) {
    const [go, ...also] = way.choices, exit = way.exit;
    // By what way, unless the way is where it goes ("To the bridge over the Reodex, by the bridge over the Reodex"),
    // and without the place it reaches when that is named already ("by the path", not "by the path into Holenforwest").
    const to = PlaceStage.to(go!, exit), named = exit.way && to.toLowerCase().includes(exit.way.toLowerCase());
    const by = [(road || twin) && exit.way && !named ? `by ${PlaceStage.route(exit.way, to)}` : '',
      road && exit.visited ? 'been' : ''].filter(Boolean).join(' · ');
    return <>
      <Act.View choice={go!} draw={draw} className="way" marked>
        <span className="n">{Typography.curl(Words.upper(to))}</span>
        {go!.note && <><span className="lead" aria-hidden="true" /><span className="t">{Typography.curl(go!.note)}</span></>}
        {by && <span className="r">{Typography.curl(by)}</span>}
      </Act.View>
      <PlaceStage.Opened choice={go!} draw={draw} />
      {also.map(c => c.children?.length ? <PlaceStage.Hazard key={c.id} choice={c} draw={draw} />
        : <Act.View key={c.id} choice={c} draw={draw} className="way also" marked>
          {Typography.curl(Words.upper(PlaceStage.also(c.label)))}</Act.View>)}
    </>;
  }
  // Something in the way and what can be done about it, each its own row under the thing's name: it had opened as a
  // fold under the way, "…" and then underlined words (play 7, the enchanted object on the long stair).
  static Hazard({ choice: c, draw }: { choice: Choice; draw: Draw }) {
    return <>
      <p className="way-thing">{Typography.curl(Words.upper(PlaceStage.also(c.label).replace(/^(Look at|Examine) /i, '')))}</p>
      {c.children!.map(k => <Fragment key={k.id}><Act.View choice={k} draw={draw} className="way also" marked>
        {Typography.curl(Words.upper(k.label))}</Act.View><PlaceStage.Opened choice={k} draw={draw} /></Fragment>)}
    </>;
  }
  // Your aim, said quietly at the head of the ways on: the first the notes hold, your own errand before what the
  // country holds (the owner's interim report: little to say where anything worth doing was, without the notes). It
  // is said as written: "You mean to / the brothers want …" was no sentence (play 7). Not on the first place after a
  // new game's opening, which has just said it (opened): "Your father … did not come home" was read on the choice of
  // a life, in the opening and under the first place, three screens running (the opening's critique).
  static Aim({ screen, bound, opened }: { screen: Screen; bound: boolean; opened?: boolean }) {
    const aim = screen.objectives[0];
    if (!aim || bound || opened) { return null; }
    return <p className="aim" data-id="aim"><span className="label">Your aim</span>{Typography.curl(Words.upper(aim))}</p>;
  }
  // Where you are going, while you are: where to, the next way and how long it is, how long in all; going on (by the
  // way known from here, a way at a time, stopping only for what wants you) and giving it up. On every page you
  // explore from until you come there (the owner's interim report).
  // A name too long for half a phone's width takes the whole row there ("To the market-place of Karashilgab" had
  // wrapped over three lines beside another: play 11), and so does a way barred, with why, or with something on it
  // (a boar across the low path, a hidden switch and a pole to prod it with, had been told in a column a third of the
  // page wide).
  static wide(name: string): boolean { return name.length > 22; }
  static Bound({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const bound = app.state.frame!.bound, going = app.menu.destinations ?? [];
    const on = bound && going.find(c => c.id === `travel:${bound.id}`), off = going.find(c => c.id === MenuModel.unbind);
    if (!bound || !on) { return null; }
    const next = bound.legs[0];
    return (
      <section className="bound" aria-label={`Bound for ${bound.name}`} data-id="bound">
        <p className="label">Bound for</p>
        <p className="whither">{Typography.curl(Words.upper(bound.name))}</p>
        <p className="next">{Typography.curl([next ? `Next, ${Words.by(next.way, next.to)}: ${Words.span(next.minutes)}.` : '',
          bound.toward ? `As far as ${bound.toward} by the ways you know.` : '',
          bound.legs.length > 1 ? `${Words.upper(Words.span(bound.minutes))} in all.` : ''].filter(Boolean).join(' '))}</p>
        <p className="go"><Act.View choice={on} draw={draw} className="option go-on">{`Go on to ${bound.name}`}</Act.View>
          {off && <Act.View choice={off} draw={draw} className="option give-up">Give it up</Act.View>}</p>
      </section>
    );
  }
  // The nearest places you know the way to, further than a step, each a journey to set out on at once; the rest are
  // on the map. On the way, the journey stops for whatever wants a decision.
  static Further({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const bound = app.state.frame!.bound;
    const going = (app.menu.destinations ?? []).filter(c => c.id !== MenuModel.unbind && c.id !== `travel:${bound?.id}`);
    if (!going.length) { return null; }
    return (
      <nav className="ways further" aria-label="Set out for">
        <p className="label">Set out for</p>
        <ul className="options">{going.map(c => <li key={c.id} className={PlaceStage.aimed(app).includes(c.id) ? 'aimed' : undefined}>
          <Act.View choice={c} draw={draw} className="way journey" marked>
          <span className="n">{Typography.curl(c.label.replace(/^Set out (for|toward) /, ''))}</span>
          {c.note && <span className="r">{Typography.curl(c.note)}</span>}</Act.View></li>)}</ul>
      </nav>
    );
  }
  // Every way the company's aims name (where a way goes, a walk about the town, a place to set out for), as the engine
  // decides it (see Glance.aimed): the page had matched an aim's words against places' names.
  static aimed(app: ReaderApp): string[] { return app.state.frame?.leaf.glance?.aimed ?? []; }
  // Where a way goes, as the choice says it ("Into the Wooden Wolf"), or the place it leads to.
  private static to(c: Choice, exit: ExitRow): string {
    const said = c.label.replace(/ — .*$/, '');
    return /^(To|Into|Out|Up|Down|Back|Across|Over|Through|Along) /.test(said) ? said : exit.destination.name;
  }
  private static also(label: string): string { return / — (.+)$/.exec(label)?.[1] ?? label; }
  static route(way: string, to: string): string {
    const m = /^(.+?)\s+(?:out into|out onto|up onto|into|onto|to|across|over|through)\s+(.+)$/.exec(way);
    const place = m?.[2]!.replace(/^(the|a|an) /i, '');
    return m && place && (to.includes(place) || place.split(' ').some(w => /^\p{Lu}/u.test(w) && to.includes(w)))
      ? m[1]! : way;
  }
  // What a way or a thing opens, once opened, under it.
  static Opened({ choice: c, draw }: { choice: Choice; draw: Draw }) {
    return c.children && draw.open.has(c.id) ? <Act.List choices={c.children} draw={draw} className="column unfolded" />
      : null;
  }
  // How someone with the company is, if they are hurt; nothing if they are not.
  static hurt(screen: Screen, name: string): string | undefined {
    const m = screen.party.slice(1).find(p => p.name === Words.short(name));
    return m && m.hp < m.maxHp ? Words.hurt(m.hp, m.maxHp) : undefined;
  }
  // Yourself, at the end of what is here: how you are and what you have, and what you can do of yourself (wait,
  // search, rest). It had stood across the foot of the screen, under everything, with the ways (the owner's report).
  static You({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const scene = app.menu.scene!, screen = app.state.frame!.screen;
    return (
      <section className="you" data-region="party" aria-label="Yourself">
        <Stage.Me screen={screen} />
        <Act.List choices={scene.you.filter(c => !SceneModel.own(c))} draw={draw} className="small yours" />
      </section>
    );
  }
}
