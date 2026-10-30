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
  // quotes, a backslash), or, if nothing is left, the first of their people's names here for how they present (never
  // none at Set out).
  static named(member: Member, setting?: Setting): string {
    const written = (member.name ?? '').replace(/[{}"\\]/g, '').trim().slice(0, 40);
    return written || this.names(member, setting)[0] || 'Wenna';
  }
  // Their people's names here for how they present, in the order they are offered (see ProtagonistNames).
  static names(member: Member, setting?: Setting): string[] {
    return setting?.names?.[member.raceId ?? '']?.[member.pronouns ?? 'they'] ?? [];
  }
  // The names offered at once, as a table rolled on: the people's names cut into as few tables as hold no more than
  // six, as near one size as they go (ten are two of five, forty seven of six or five), so that each roll again offers
  // only names not offered at the last, and the tables come round again in turn (a window of six sliding round ten had
  // offered an elf the same names twice in two rolls); all of them, where there are no more than six.
  static readonly offered = 6;
  static table(member: Member, setting: Setting | undefined, roll: number): string[] {
    const names = this.names(member, setting), tables = Math.ceil(names.length / this.offered);
    if (tables <= 1) { return names; }
    const at = roll % tables, size = Math.floor(names.length / tables), over = names.length % tables;
    const start = at * size + Math.min(at, over);
    return names.slice(start, start + size + (at < over ? 1 : 0));
  }
}
