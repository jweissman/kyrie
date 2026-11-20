import { useEffect, useRef } from 'react';
import { Glyphs } from '../creation/glyphs';
import type { Choice } from '../../../src/ui/choice-list';
import { SceneModel, type SceneSubject } from '../../../src/ui/scene';
import type { ExitRow, Screen } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Scenery } from '../../../src/ui/scenery';
import { Likeness } from '../../../src/paintings/likeness';
import { Words } from '../../../src/presentation/words';
import { Act, type Draw } from './act';
import { Stage } from './stage';
import { Told } from './told';
import { GlanceStage } from './glance';
import { Raised } from './raised';
import { ThingStage } from './thing-stage';
import { ChoiceRow } from './choice-row';
import { Attest } from '../../../src/presentation/attest';
import { Fold } from '../../../src/presentation/fold';
import { Guidance } from '../guidance';

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
          <div className="title-block"><Told.Heading frame={frame} app={app} /></div>
        </header>
        <section className="scene" aria-label="The place">
          <div className="measure">{frame.leaf.glance ? <GlanceStage.View app={app} draw={draw} />
            : <div className="telling"><Told.Place app={app} headed={false} here={<PlaceStage.Here app={app} draw={draw} />} /></div>}
          </div>
        </section>
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
  static Plate({ subject: s, draw, brief, marked, led, first }: { subject: SceneSubject; draw: Draw; brief?: boolean;
    marked?: boolean; led?: boolean; first?: string }) {
    const into = PlaceStage.into(s), rest = s.choices.filter(c => c !== into);
    // One with no likeness has their people's emblem where it would be, so that every plate reads alike (Perrin, among
    // faces, had a choice's diamond: the owner, 4 November; never a letter in a ring: 5 November).
    const face = s.portrait ? <span className="face" aria-hidden="true"><img src={s.portrait.src} alt="" decoding="async"
      loading="lazy" style={{ objectPosition: `50% ${s.portrait.focus}%` }}
      onError={e => { e.currentTarget.parentElement?.classList.add('gone'); }} /></span>
      : s.kind === 'person' ? <span className="face blank" aria-hidden="true">
        <Glyphs.View id={s.emblem ?? 'someone'} className="emblem" /></span> : undefined;
    const body = <>
      {face}
      <span className="who"><span className="n">{Typography.curl(Words.upper(s.name))}</span>
        {s.note && <span className="r">{Typography.curl(s.note)}</span>}
        {first && !s.note?.startsWith(first) && <span className="why-said">{Typography.curl(first)}</span>}
        {s.state && <span className="r hurt">{s.state === 'dead' ? 'dead' : 'down'}</span>}
        {s.says?.[0] && !brief && <span className="doing">{Typography.curl(s.says.join(' '))}</span>}</span>
      {/* What touching the plate does, as a chip says it: every plate the same (the owner, 4 November). */}
      {into && /#(talk|look)$/.test(into.id) && <span className="verb">{/#talk$/.test(into.id) ? 'talk' : 'look'}</span>}
    </>;
    return <>
      {into ? <Act.View choice={into} draw={draw} className={`plate${face ? ' faced' : ''}${led ? ' leading' : ''}${first !== undefined ? ' first' : ''}`}>{body}</Act.View>
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
  static into(s: SceneSubject): Choice | undefined {
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
        {c.danger && <p className="reckoning">{Typography.curl(GlanceStage.fight(c.danger))}</p>}
        <Act.List choices={c.choices} draw={draw} marked={marked} />
      </section>
    );
  }
  // Each way's choices, in the order the place lists its ways: the way itself, then whatever can be done at it.
  static ways(screen: Screen, choices: Choice[]): Way[] {
    return screen.exits.map(exit => ({ exit, choices: choices.filter(c => c.id === exit.id || c.id.startsWith(`${exit.id}/`)) }))
      .filter(w => w.choices.length);
  }
  // Every way the company's aims name (where a way goes, a walk about the town, a place to set out for), as the engine
  // decides it (see Glance.aimed): the page had matched an aim's words against places' names.
  // The ways of the aim followed: only those are gilded (other aims' ways are not, nor all of them when it has none).
  static aimed(app: ReaderApp): string[] { return app.state.frame?.leaf.glance?.following ?? []; }
  static also(label: string): string { return / — (.+)$/.exec(label)?.[1] ?? label; }
  // What is at a way, by its own name: the corn-store padlock, not "To the old corn-store — look at the corn-store
  // padlock".
  static thing(label: string): string { return Words.upper(PlaceStage.also(label).replace(/^(Look at|Examine) /i, '')); }
  static route(way: string, to: string): string {
    const m = /^(.+?)\s+(?:out into|out onto|up onto|into|onto|to|across|over|through)\s+(.+)$/.exec(way);
    const place = m?.[2]!.replace(/^(the|a|an) /i, '');
    return m && place && (to.includes(place) || place.split(' ').some(w => /^\p{Lu}/u.test(w) && to.includes(w)))
      ? m[1]! : way;
  }
  // What a way or a thing opens, once opened, under it.
  // What is opened under a choice: its own acts in a column, and a run of them alike but for one word (the words of a
  // speaking door) said once, each word apart; brought into view as it opens, so that nothing of it lies hidden under
  // the foot of the page (the owner's play, 31 October: a door's words had run under it, and one was taken for another).
  static Opened({ choice: c, draw }: { choice: Choice; draw: Draw }) {
    const shown = !!c.children && draw.open.has(c.id), at = useRef<HTMLDivElement>(null);
    useEffect(() => { if (shown) { at.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } }, [shown]);
    if (!shown) { return null; }
    const alike = PlaceStage.alike(c.children!), rest = c.children!.filter(k => !alike.includes(k));
    // What it reads out whole, before its rows, where it has a focus: the riddle over its answers (CL-34).
    return <div ref={at} className="unfolded-group">
      {c.focus && <p className="focus-said"><Told.Said text={c.focus} /></p>}
      {rest.length > 0 && <ul className="acts column unfolded">{rest.map(k => <li key={k.id}>
        <PlaceStage.Within choice={k} draw={draw} /></li>)}</ul>}
      {alike.length > 0 && <ThingStage.Choices choices={alike} draw={draw} />}
    </div>;
  }
  // A row inside an opener, marked by its own witnesses (Attest.within: what the opener is led for, found again on the
  // act that bears it), never the opener's (AT-07 §5 step 3: Act.List had drawn them with no indicator at all, so an
  // opener lit worth a look or blue opened onto plain rows). What it opens in turn, beneath it.
  static Within({ choice: k, draw }: { choice: Choice; draw: Draw }) {
    const g = draw.app.state.frame?.leaf.glance;
    const indicator = Fold.mark(k.children?.length && !k.command ? Fold.of(g, k, k.id, true)
      : [Fold.leaf(k, Attest.within(g, k))], Guidance.shown(draw.app));
    return <><ChoiceRow.Act choice={k} draw={draw} {...ChoiceRow.mark(indicator)}
      label={Typography.curl(k.alone ?? Words.shown(k.label))} {...k.note ? { aside: Typography.curl(k.note) } : {}} />
      {k.children && draw.open.has(k.id) && <Act.List choices={k.children} draw={draw} className="column" />}</>;
  }
  // The largest run of choices worded alike but for one part ("Press the word …"): three at least, or none.
  private static alike(choices: Choice[]): Choice[] {
    const by = new Map<string, Choice[]>();
    for (const k of choices.filter(x => !x.children)) {
      const head = k.label.split(' ').slice(0, 2).join(' ');
      by.set(head, [...by.get(head) ?? [], k]);
    }
    const run = [...by.values()].sort((a, b) => b.length - a.length)[0] ?? [];
    return run.length >= 3 && Words.shared(run.map(k => k.label)) ? run : [];
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
