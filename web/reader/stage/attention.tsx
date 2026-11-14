import type { ReaderApp } from '../reader-app';
import type { Choice } from '../../../src/ui/choice-list';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { AtHand, type Held } from './at-hand';
import { GlanceStage } from './glance';
import { Wayfinder, type Way } from './wayfinder';
import { WorldStage } from './world-stage';
import { PlaceStage } from './place-stage';
import { Pip } from './pip';
import { ChoiceRow } from './choice-row';
import { Signs } from '../../../src/presentation/signs';

// Mission 21's attention composition (?look=attend; proposal.md, composition B). The owner, 12 November: "There
// shouldn't be separate explore/perceive page: they're just lenses, they should leave the scene intact but more highly
// favor actions of those kinds to be promoted to the top four actions." So the scene keeps its painting and its
// telling, and its one menu shows, by the lens turned on at the rail (its icons, never words: the owner, 13 November),
// the place's few acts (Here), whom to turn to (People), what to take in hand (Things) or where to go (Ways): never a
// page, never a second list beside the first. A thing
// chosen unfolds in place, its acts under its name; a way or a person touched is gone to or spoken to at once.
export type Lens = 'here' | 'people' | 'things' | 'ways';
interface Row { id: string; label: string; note?: string; tone?: string; faint?: boolean; glyph?: string;
  pick: () => void; chosen?: boolean; choice?: Choice }
export class Attention {
  // At most this many rows in a lens; the rest one quiet touch away ("All ways"), in the same menu.
  static readonly most = 5;
  static lens(app: ReaderApp): Lens {
    const s = app.state;
    return s.exploring === 'go' ? 'ways' : s.exploring === 'look' ? 'things' : s.talking ? 'people' : 'here';
  }
  // The menu a lens shows, in place of the four the place leads with.
  static Menu({ app, draw, all }: { app: ReaderApp; draw: Draw; all?: boolean }) {
    const lens = Attention.lens(app);
    if (lens === 'here') { return null; }
    const rows = lens === 'ways' ? Attention.wayRows(app) : lens === 'people' ? Attention.personRows(app)
      : Attention.thingRows(app);
    const shown = all || app.state.open.includes('attention:all') ? rows : rows.slice(0, Attention.most);
    const chosen = lens === 'things' ? AtHand.of(app).find(h => h.id === app.state.hovered) : undefined;
    return <ol className={`led attention-menu lens-${lens}`} aria-label={lens}>
      {shown.map(r => <li key={r.id}>
        <ChoiceRow.Button className={`led-act attention-row${r.chosen ? ' chosen' : ''}${r.faint ? ' afar' : ''}`}
          data={{ pick: r.id, choice: r.choice && draw.index.has(r.choice.id) ? r.choice.id : undefined }} onClick={r.pick}
          {...r.choice ? { act: r.choice.id } : {}}
          {...r.tone ? { mark: `var(--tone-${r.tone})` } : {}}
          label={<>{r.glyph && <span className="row-glyph" aria-hidden="true">{r.glyph}</span>}{Typography.curl(r.label)}</>}
          aside={r.note && Typography.curl(r.note)} />
        {r.chosen && chosen && <Attention.Unfolded draw={draw} held={chosen} />}
      </li>)}
      {rows.length > shown.length && <li><button type="button" className="quiet-word attention-all"
        data-action="attention-all" onClick={() => app.setState({ open: [...app.state.open, 'attention:all'] })}>
        {`All ${rows.length} ${lens}`}</button></li>}
    </ol>;
  }
  // A thing chosen, unfolded under its own row: what more there is to see of it, and what can be done with it.
  static Unfolded({ draw, held: h }: { draw: Draw; held: Held }) {
    const acts = h.choices.filter(c => draw.index.has(c.id));
    return <div className="unfolded" data-held={h.id}>
      {h.seen.slice(0, 2).map((p, i) => <p key={i} className="seen">{Typography.curl(p)}</p>)}
      {acts.length > 0 && <ul className="acts column">{acts.map(c => <li key={c.id}>
        <Act.View choice={c} draw={draw} marked className="unfolded-act">
          {Typography.curl(c.alone ?? Words.upper(PlaceStage.also(c.label)))}</Act.View></li>)}</ul>}
    </div>;
  }
  // Whom to turn to: those with something for the company first (a tone), then whoever will talk, then the rest.
  static people(app: ReaderApp) {
    return WorldStage.present(app).filter(x => x.kind !== 'companion' && !x.state);
  }
  private static personRows(app: ReaderApp): Row[] {
    const rank = (x: ReturnType<typeof Attention.people>[number]) => (WorldStage.seen(app, x).tone ? 0 : x.live ? 1 : 2);
    return [...Attention.people(app)].sort((a, b) => rank(a) - rank(b)).flatMap(x => {
      const into = WorldStage.into(x), seen = WorldStage.seen(app, x);
      if (!into) { return []; }
      const verb = x.kind === 'person' ? (x.live ? 'Talk to' : 'Look at') : 'Look at';
      return [{ id: x.id, label: `${verb} ${Words.short(x.name)}`, ...x.note ? { note: Words.described(x.note) } : {},
        ...seen.tone ? { tone: seen.tone } : {}, choice: into, pick: () => app.choose(into) }];
    });
  }
  static things(app: ReaderApp): Held[] { return AtHand.of(app).filter(h => h.id !== 'about'); }
  private static thingRows(app: ReaderApp): Row[] {
    return Attention.things(app).map(h => {
      const tone = AtHand.tone(app, h), only = h.choices.length === 1 && h.choices[0]!.command ? h.choices[0] : undefined;
      // A thing done at a way off this place is said as the act ("Drop the bar across the camp gate"), as the glance
      // says it (GlanceStage.label), not the way it is on.
      const said = only && (only.alone ?? Words.upper(/ — (.+)$/.exec(only.label)?.[1] ?? only.label));
      return { id: h.id, label: said ?? Words.upper(h.name),
        ...h.note ? { note: h.note } : {}, ...tone ? { tone } : {}, chosen: app.state.hovered === h.id,
        ...only ? { choice: only } : {},
        pick: () => only ? app.choose(only) : app.state.hovered === h.id ? app.setState({ hovered: undefined, open: [] })
          : AtHand.pick(app, h) };
    }).sort((a, b) => Number(!a.tone) - Number(!b.tone));
  }
  // Where to go: the aim's way first, then those lit by what the place leads with, then the rest; never the idle first.
  private static wayRows(app: ReaderApp): Row[] {
    const glance = app.state.frame?.leaf.glance, idle = new Set(glance?.idle ?? []);
    // What is perceived off along a way (someone who might join you, that way): its tone, faint (see Perception).
    const sensed = (w: Way) => glance?.sensed?.find(x => x.to === Wayfinder.to(w) || w.holds?.includes(x.to));
    const rank = (w: Way) => (w.aim === 'followed' ? 0 : Wayfinder.tone(app, w) ? 1 : sensed(w) ? 2 : idle.has(Wayfinder.to(w)) ? 4 : 3);
    return [...Wayfinder.ways(app)].sort((a, b) => rank(a) - rank(b)).map(w => {
      const lit = w.aim === 'followed' ? 'gold' : Wayfinder.tone(app, w), far = sensed(w), glyph = Signs.way(w.whither, !!w.c.disabled), time = (w.c.minutes ?? 0) > 5 ? Words.span(w.c.minutes!) : '';
      // A companion perceived that way is said whatever colour the way has of its own (it is an icon, never a tone);
      // anything else perceived is the faint tone of a way with none (the atlas-perception matrix, M21).
      const tone = lit ?? Pip.sensed(far?.aspect), kin = far?.aspect === 'companionship';
      return { id: w.c.id, label: GlanceStage.short(w.name), ...glyph !== '·' ? { glyph } : {},
        note: [w.c.disabled ? `shut: ${w.c.disabled}` : '', far && (kin || !lit) ? Signs.sensed(far.aspect, far.far) : '', time]
          .filter(Boolean).join(' · ') || undefined,
        ...tone ? { tone } : {}, ...far && !lit && !kin ? { faint: true } : {}, choice: w.c, pick: () => Wayfinder.go(app, w) } as Row;
    });
  }
}
