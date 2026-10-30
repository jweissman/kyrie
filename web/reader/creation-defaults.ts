import type { Catalog, Member, Setting } from '../engine/protocol';

// What a protagonist is until the player says otherwise, each taken in the open (OWN-14: creation asks only why, the
// people, the calling and its way, and the name): the first way of the calling the people may take, and for one that
// casts, the spells its card shows, given as chosen (an unchosen way had been drawn at Begin, and its spells with it,
// unseen); for one who comes with only their trade, the calling's own trade until another is chosen. The weapon is the
// one struck best with (see ReaderOpening.starting), the rolls placed where the calling wants them.
export class CreationDefaults {
  static settle(member: Member, catalog: Catalog, at: { trade: boolean; was?: string }) {
    const calling = catalog.callings.find(c => c.id === member.classId);
    if (!calling) { return; }
    const forbids = catalog.ancestries.find(a => a.id === member.raceId)?.forbids ?? [];
    const open = calling.specializations.filter(t => !forbids.includes(t.id));
    const way = open.find(t => t.id === member.traits?.[0]) ?? open[0];
    if (way) { member.traits = [way.id]; } else { delete member.traits; }
    // A protagonist begun above first level has learnt more since, as its own draw has it.
    if (way?.picks && (member.level ?? 1) === 1) { member.spells = [...way.picks]; } else { delete member.spells; }
    const before = catalog.callings.find(c => c.id === at.was)?.trade;
    if (at.trade && calling.trade && (!member.backgroundId || member.backgroundId === before)) {
      member.backgroundId = calling.trade;
    }
  }
  // The name a protagonist sets out with: as written, without what a name in the world's text cannot hold (braces,
  // quotes, a backslash), or, if nothing is left, the first of their people's names here (never none at Set out).
  static named(member: Member, setting?: Setting): string {
    const written = (member.name ?? '').replace(/[{}"\\]/g, '').trim().slice(0, 40);
    return written || setting?.names?.[member.raceId ?? '']?.[0] || 'Wenna';
  }
  // The next of the people's names after the one they have (the first, if theirs is none of them).
  static another(member: Member, setting?: Setting): string | undefined {
    const names = setting?.names?.[member.raceId ?? ''] ?? [];
    return names.length ? names[(names.indexOf(member.name ?? '') + 1) % names.length] : undefined;
  }
}
