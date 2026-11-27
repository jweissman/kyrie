import { Likeness } from '../paintings/likeness';
import { Sittings } from '../paintings/sittings';
import type { Campaign } from '../campaign/campaign';
import type { TargetRow } from './screen-types';
import type { Face } from '../ports/presentation';
import type { MemberRow } from './screen-types';

// The painting each person is met in, the same wherever they are met, and no one else of their country's (see
// Sittings): small and large, where the face sits, and its credit.
export class Portraits {
  // In a fight, each foe who is someone (a person of the world, painted where they are met) by their own likeness, as
  // the company is by theirs (M19-78: a person fought had been a creature's painting, or none). Keyed by member.
  static foes(campaign: Campaign): Map<string, Face> {
    const out = new Map<string, Face>();
    for (const actor of campaign.actors.filter(a => !a.player)) {
      const painting = Sittings.painted(campaign, actor.id) ? Sittings.of(campaign, actor.id) : undefined;
      if (!painting) { continue; }
      const face = { id: painting, src: Likeness.src(painting), medium: Likeness.src(painting) };
      for (const member of actor.members) { out.set(member, face); }
    }
    return out;
  }
  // The painting one who joined the company was met in (by the group they joined as, as the place they were met in
  // shows them), for their page and for how their portrait presents: Leif, met as a man with a lute in the taproom, had
  // been a woman bard on his own page, his name saying nothing of him (the owner's fresh session, 7 November).
  static met(campaign: Campaign, ref: string | undefined): string | undefined {
    const world = campaign.world, joined = ref && world.relates('joinedAs') ? world.one('joinedAs', ref) : undefined;
    return joined && Sittings.painted(campaign, joined) ? Sittings.of(campaign, joined) : undefined;
  }
  static of(campaign: Campaign, id: string): TargetRow['portrait'] {
    const painting = Sittings.painted(campaign, id) ? Sittings.of(campaign, id) : undefined;
    return painting ? Likeness.portrait(painting) : undefined;
  }
  // A member of the company's one face, wherever they are drawn (their page, the roster, a fight, the scene they are
  // in): the likeness they were met in or chosen at creation, else the portrait of their calling (see MemberRow).
  static member(m: Pick<MemberRow, 'portrait' | 'face'>): Face | undefined {
    const p = m.portrait;
    return p ? { id: p.src, src: p.src, medium: p.src } : m.face;
  }
  // Each member's one face, by their id, for a fight's panels.
  static company(party: readonly MemberRow[]): [string, Face][] {
    return party.flatMap(m => { const face = this.member(m); return face ? [[m.id, face] as [string, Face]] : []; });
  }
  // Whoever has joined, drawn on the scene by the face their member row has, the one their page, the roster and every
  // fight draw them by (member), else their people's emblem as they were met; and which member they are, so that
  // every client finds the one row (OR-1070: Gesk, a lizardfolk who joined at Gatesend, had been a bare glyph on the
  // scene, his people's emblem in the taproom, and the ascetic's painting on his page and in a fight). One who follows
  // and has not joined (one in custody, a child brought home) keeps the face they are met in.
  // emblemed: whether a people has an emblem of its own (Emblems.has).
  static joined(rows: TargetRow[], campaign: Campaign, party: readonly MemberRow[],
    emblemed: (raceId: string) => boolean): TargetRow[] {
    const read = campaign.readout;
    return rows.map(row => {
      const creature = read.inhabitants[row.id]?.[0] ?? `${row.id}_person`, m = row.companion
        ? party.find(x => x.id === creature) : undefined;
      if (!m) { return row; }
      const raceId = read.creatures.find(c => c.id === creature)?.raceId;
      const face = this.member(m), at = face?.at?.[1] ?? 0.3;
      const portrait = m.portrait ?? (face && { src: face.medium, large: face.src, focus: Math.round(at * 100) });
      const rest = { ...row }; delete rest.portrait; delete rest.emblem;
      const emblem = raceId && emblemed(raceId) ? raceId : undefined;
      return { ...rest, member: m.id, ...portrait ? { portrait } : emblem ? { emblem } : {} };
    });
  }
}
