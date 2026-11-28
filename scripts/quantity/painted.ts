import { PlayTool } from '../../src/cli/play-tool';
import { StockOpenings } from '../../src/world/stock-openings';
import { PaintedSky } from '../../src/ui/painted-sky';
import { SceneModel } from '../../src/ui/scene';
import { SceneKinds } from '../../src/ui/scene-kinds';
import { Scenery } from '../../src/ui/scenery';
import { ScreenModel } from '../../src/ui/screen-model';
import type { Screen } from '../../src/ui/screen-types';
import type { PlaySession } from '../../src/session/play-session';
import { HonestPlayer } from '../../test/support/honest-player';
import type { Reading } from './measures';

// Painting misses in a new life's first steps (the owner, 27 November: "no more than 2% paintings unresolved in the
// first 5 steps of 100 random worlds"). A new life begun on each of a fixed, named list of worlds, a calling in turn,
// as a player begins it (the country's own opening, where it has one), and played for its first five steps by the
// page's leads (HonestPlayer, the gold-follower). What the page paints is read at the way in, the first scene and
// after each step, as the page asks for it (Shell.plate: Scenery.approach for the way in, Scenery.seen for the scene;
// nothing in the dark, which is the dark, not a miss), and a frame is unresolved where
// - the scene has no painting (blank),
// - its painting is against the sky or the hour (PaintedSky: weather, hour, untold), or
// - the page is a conversation with someone who has no portrait (unportrayed).
// Each miss is said by its cause: the kind of place (SceneKinds) or the kind of person (what they are called).
export type Cause = 'blank' | 'untold' | 'weather' | 'hour' | 'unportrayed';
// land: the country's terrain, the season and what the place lies in (a settlement, a site, the wild), for a miss.
export interface Frame { life: string; step: number; place: string; kind: string; sky: string; painting?: string;
  dark?: boolean; talk?: string; miss?: Cause; why?: string; land?: string }
export interface Painted { life: string; frames: Frame[]; ms: number }
export class QuantityPainted {
  // Fixed and named, so that the reading is deterministic: pw01 to pw100.
  static seeds(n = 100): string[] { return Array.from({ length: n }, (_, i) => `pw${String(i + 1).padStart(2, '0')}`); }
  static readonly callings = ['warrior', 'mage', 'cleric', 'thief', 'ranger'];
  static readonly steps = 5;
  static readonly lives = 100;
  static async run(n = this.lives): Promise<Painted[]> {
    const out: Painted[] = [];
    for (const [i, seed] of this.seeds(n).entries()) {
      out.push(await this.life(seed, this.callings[i % this.callings.length]!));
      const l = out.at(-1)!;
      console.error(`painted ${l.life}: ${l.frames.filter(f => f.miss).length} of ${l.frames.length} unresolved, `
        + `${l.ms} ms, ${Math.round(process.memoryUsage().rss / 2 ** 20)} MB`);
    }
    return out;
  }
  static async life(seed: string, calling: string): Promise<Painted> {
    const t = performance.now(), life = `${seed} ${calling}`, frames: Frame[] = [];
    const opening = StockOpenings.chosen(seed);
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', seed, '--as', `human/${calling}/Wenna`,
      ...opening ? ['--opening', opening] : []]));
    const s = journey.session, first = ScreenModel.build(s.campaign);
    if (!first.dark) { frames.push(this.judged({ life, step: 0 }, first, Scenery.approach(first), 'the way in')); }
    frames.push(this.frame(life, 0, s));
    const h = new HonestPlayer(s);
    for (let i = 1; i <= this.steps && s.campaign.running; i++) {
      // Someone the page leads to is spoken with on their own page (the conversation, their portrait large), whose
      // reply the gold-follower then chooses: that page judged as it stands before the reply.
      const lead = h.glanced.glance.acts[0], before = h.glanced.screen;
      const person = lead?.subject && !lead.command?.startsWith('travel:')
        && before.people.find(p => p.id === lead.subject && p.kind === 'person');
      if (person) { frames.push(this.talked(this.frame(life, i, s, before), before, person.id)); }
      const ok = await h.step().catch(() => false);
      frames.push(this.frame(life, i, s));
      if (!ok) { break; }
    }
    return { life, frames, ms: Math.round(performance.now() - t) };
  }
  // The page as it is drawn now: the scene's painting, and in a talk the one talked with's portrait.
  static frame(life: string, step: number, s: PlaySession, at = ScreenModel.build(s.campaign)): Frame {
    const scene = this.judged({ life, step }, at, at.dark ? undefined : Scenery.seen(at)), focus = s.focus;
    return focus.kind === 'talk' ? this.talked(scene, at, focus.with) : scene;
  }
  // A conversation's page: unresolved where the one talked with has no portrait (the page in type).
  static talked(scene: Frame, screen: Screen, who: string): Frame {
    const sub = SceneModel.build(screen).subjects.find(x => x.id === who);
    const talk = sub ? `${sub.name}${sub.note ? `, ${sub.note}` : ''}` : who;
    if (scene.miss || sub?.portrait) { return { ...scene, talk }; }
    return { ...scene, talk, miss: 'unportrayed', why: `no portrait for ${talk}` };
  }
  // The share of frames unresolved, and the misses by cause, the commonest first.
  static reckon(lives: Painted[] | undefined): Reading {
    if (!lives) { return { value: null, note: 'not read' }; }
    const frames = lives.flatMap(l => l.frames), missed = frames.filter(f => f.miss), by = new Map<string, number>();
    for (const f of missed) { by.set(this.cause(f), (by.get(this.cause(f)) ?? 0) + 1); }
    const value = frames.length ? Math.round((1000 * missed.length) / frames.length) / 10 : 0;
    return { value, note: `${missed.length} of ${frames.length} frames over ${lives.length} lives`
      + (by.size ? `: ${[...by].sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c} ${n}`).join(', ')}` : '') };
  }
  // What lacked a painting: the kind of place under its sky, or the kind of person talked with.
  static cause(f: Frame): string {
    // A person by what they are, as far as their role's first words say it (a woodwright, an innkeeper).
    const role = f.talk?.split(', ').slice(1).join(', ').split(/,| who | at | of | into /)[0];
    if (f.miss === 'unportrayed') { return `no portrait for ${role || f.talk}`; }
    return `${f.miss} ${f.kind} (${f.sky})`;
  }
  // The scene's painting judged against the sky it is seen under; place: what the frame is, where not the place's
  // kind (the way in).
  static judged({ life, step }: Pick<Frame, 'life' | 'step'>, screen: Screen, painting: string | undefined,
    place?: string): Frame {
    const kind = place ?? SceneKinds.of(screen)?.kind.kind ?? (Scenery.roofed(screen) ? '(a room of no kind)'
      : '(country of no kind)');
    const sky = `${screen.weather ?? 'no sky'} by ${screen.expedition.daylight}`;
    const base = { life, step, place: `${screen.place.name} (${screen.place.id})`, kind, sky,
      ...painting ? { painting } : {} };
    if (screen.dark && !place) { return { ...base, dark: true }; }
    const j = PaintedSky.of(screen, painting);
    if (!j.fault) { return base; }
    const within = [...screen.path].reverse().find(p => ['site', 'settlement'].includes(p.kind))?.kind ?? 'wild';
    const land = [screen.region?.terrain?.replace(/^.*__/, ''), /; (\w+)$/.exec(screen.date?.long ?? '')?.[1], within]
      .filter(Boolean).join(', ');
    return { ...base, miss: j.fault, why: j.why ?? '', land };
  }
}

if (import.meta.main) {
  // bun scripts/quantity/painted.ts [lives] [out.json]: each miss said, then the share; the lives kept where asked.
  const lives = await QuantityPainted.run(Number(process.argv[2] ?? QuantityPainted.lives)), out = process.argv[3];
  if (out) { await Bun.write(out, JSON.stringify(lives, null, 1)); }
  for (const f of lives.flatMap(l => l.frames).filter(x => x.miss)) {
    console.log(`${f.life} ${f.step} ${f.place} [${f.kind}] ${f.sky}${f.land ? `, ${f.land}` : ''}: `
      + `${f.painting ?? '-'}${f.talk ? ` talk ${f.talk}` : ''} [${f.miss}] ${f.why}`);
  }
  const read = QuantityPainted.reckon(lives);
  console.log(`${read.value}% unresolved: ${read.note}`);
}
