// A scene of a reviewed journey as the player was shown it (the adventure-structure brief §6.2): the runner's own turn
// (bin/kyrie run, the terminal's projection of the page's screen and glance) kept as small plain records, its lines in
// the order shown and each with where it was made (ReviewProvenance), the offer in the order offered, the aims, and the
// world in a word (its digest). Nothing is read of the world that the turn did not show, but the time, the place and
// the digest.
import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { Digest } from '../session/digest';
import type { ExchangeLine, Leaf } from '../presentation/narrator';
import type { Promoted } from '../presentation/glance-types';
import type { Screen } from '../ui/screen-types';
import type { Offered, Said } from './runner';
import { PlayerFrame } from '../presentation/player-frame';
import { ReviewProvenance, type Unit } from './review-provenance';
import type { Maker, ReviewChoice, ReviewFrame as Frame, SourceRef, ToldLine } from './review-types';

// What a frame is made from: the turn, the screen it was said of, the step's events, and the narrator's own kinds of
// what it told (for a blow or a roll); reference: what the scene said for reference, as the terminal kept it apart.
// before: the frame the step was sent from, the world's choices then (ReviewFrame.allowed), and the act it took.
export interface Turn { said: Said; screen: Screen; events: readonly CampaignEvent[]; kinds?: readonly ExchangeLine[];
  reference?: readonly string[]; opening?: boolean; leaf?: Leaf;
  before?: { frame: Frame; allowed: ReadonlySet<string>; taken?: string } }

export class ReviewFrame {
  // makers: each choice's, by its id, kept as they are met (see Maker).
  constructor(private readonly campaign: Campaign, private readonly makers: Record<string, Maker>,
    private readonly provenance = new ReviewProvenance(campaign)) {}
  of(n: number, t: Turn): Frame {
    const { said, screen } = t, units = this.units(t);
    const lines = this.lines(t, units);
    const offer = this.offer(said, t.leaf), withdrawn = this.withdrawn(t);
    return { n, turn: said.turn, moment: said.moment, elapsed: screen.elapsed, clock: screen.clock,
      place: { id: screen.place.id, name: screen.place.name }, lines, offer,
      ...said.aim ? { aim: said.aim } : {}, ...said.aims?.length ? { aims: said.aims.map(a => ({ id: a.id, text: a.text,
        ...a.followed ? { followed: true as const } : {} })) } : {}, ...said.need?.length ? { need: said.need } : {},
      ...said.purse ? { purse: said.purse } : {}, ...said.you ? { you: said.you } : {},
      ...said.company?.length ? { company: said.company } : {}, ...said.ending ? { ending: said.ending } : {},
      ...withdrawn.length ? { withdrawn } : {}, digest: Digest.of(this.campaign) };
  }
  // The step's producers, and on the opening the chapter it is told under (Prologue.title's).
  private units(t: Turn): Unit[] {
    const units = [...this.provenance.units(t.events, t.screen), ...this.provenance.leafUnits(t.leaf)];
    if (t.opening) {
      for (const e of this.campaign.module.entities.filter(x => /(^|__)chapter$/.test(x.type))) {
        units.push({ key: ReviewProvenance.key(e.name), source: this.provenance.kyr(e.id, 'chapter') });
      }
    }
    return units;
  }
  // Each line by its part in the turn: the narration (scene.prose, in order), what is said for reference after it, and
  // before it the heading, and on the opening the prologue above the heading.
  private lines(t: Turn, units: readonly Unit[]): ToldLine[] {
    const { said, screen } = t, prose = [...said.scene.prose], reference = new Set(t.reference ?? []);
    let headed = false;
    return said.scene.lines.map(text => {
      if (prose[0] === text) {
        prose.shift();
        return { text, role: 'prose' as const, ...this.provenance.line(text, units, t.kinds) };
      }
      if (reference.has(text) || headed && !prose.length) {
        return { text, role: 'reference' as const, exact: 'producer' as const, sources: [ReviewFrame.reference(text)] };
      }
      const titled = text === screen.place.name || text.startsWith(`${screen.place.name} · `);
      if (t.opening && !headed && !titled) {
        return { text, role: 'prologue' as const, ...this.provenance.line(text, units) };
      }
      headed = true;
      return { text, role: 'heading' as const, exact: 'producer' as const,
        sources: [{ kind: 'engine' as const, producer: 'scene:heading' }, ...titled ? [this.provenance.kyr(screen.place.id, 'place')] : []] };
    });
  }
  private static reference(text: string): SourceRef {
    const kind = /^(Following|An aim|Need):/.exec(text)?.[1]?.toLowerCase().replace(' ', '-') ?? 'reference';
    return { kind: 'engine', producer: `scene:${kind}` };
  }
  // Of the frame before's world choices, at the same place, those the world no longer allows and the step did not take.
  // A way, a talk's opener, a journey is not one of the world's choices, and is never said withdrawn: only drawn.
  private withdrawn(t: Turn): { id: string; label: string }[] {
    const b = t.before;
    if (!b || b.frame.place.id !== t.screen.place.id) { return []; }
    const now = ReviewFrame.allowed(this.campaign);
    return b.frame.offer.filter(o => b.allowed.has(o.id) && !now.has(o.id) && o.id !== b.taken)
      .map(o => ({ id: o.id, label: o.label }));
  }
  // The world's choices as they stand, by id (what the company could be offered anywhere it is drawn).
  static allowed(campaign: Campaign): Set<string> {
    return new Set(PlayerFrame.of(campaign).rows.map(r => r.choice.id));
  }
  // The offer in the order the turn gave it: what pulls next, the four (and which of them the aim leads by), the rest.
  private offer(said: Said, leaf?: Leaf): ReviewChoice[] {
    const led = new Set(said.led ?? []), fight = said.moment === 'fight';
    if (said.next?.act) { this.makers[said.next.act] ??= this.provenance.choice({ id: said.next.act } as Offered); }
    const next: ReviewChoice[] = said.next?.act ? [{ id: said.next.act, label: said.next.label ?? said.next.text,
      group: 'next' }] : [];
    const promoted = fight ? [] : leaf?.glance?.acts ?? [], row = this.row.bind(this, { led, fight, promoted });
    return [...next, ...said.offer.primary.map(o => row(o, 'primary')), ...said.offer.rest.map(o => row(o, 'rest'))];
  }
  // A row of the four the glance led with keeps its reason: led as what it is for, as its opener, or as its command.
  private row(c: { led: Set<string>; fight: boolean; promoted: readonly Promoted[] }, o: Offered,
    group: ReviewChoice['group']): ReviewChoice {
    const id = o.does ?? o.id;
    this.makers[id] ??= { type: o.type, ...this.provenance.choice({ ...o, id }) };
    const p = group === 'primary' ? c.promoted.find(x => [x.for, x.choice, x.command].includes(id)) : undefined;
    return { id, label: o.label, group: c.fight ? 'fight' : group, ...o.id !== id ? { row: o.id } : {},
      ...c.led.has(id) ? { led: true as const } : {},
      ...o.aspects?.length ? { aspects: o.aspects } : {}, ...o.aside ? { aside: o.aside } : {},
      ...p ? { why: p.why } : {}, ...p?.note ? { note: p.note } : {} };
  }
}
