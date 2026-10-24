import type { DeepLayout, DeepRoom } from './deep-layout';
import type { Valuable } from './deep-purposes';

// What came after the makers, left in the rooms they made (purpose.after, by the kind of kingdom that followed them,
// and purpose.fallen, by how that kingdom fell): a line added to how a room looks, a document in the kingdom's own
// letters that tells of it when read, a barrier they built across a way that can be pulled down, a thing of worth
// they left, or hid. The site is the makers' first and its successors' after: what each did to it is still there.
export interface Alteration {
  role: string; scene?: string;
  document?: { name: string; shut: string; label: string; text: string };
  barrier?: { to: string; name: string; text: string; down: string; label: string };
  valuable?: Valuable;
  hidden?: { found: string; valuable: Valuable };
}
export class DeepHistory {
  static readonly q = JSON.stringify;
  static lines(layout: DeepLayout, alterations: Alteration[], values: Record<string, string>): string[] {
    const rooms = layout.levels.flatMap(l => l.rooms);
    return alterations.flatMap((a, n) => {
      const room = rooms.find(r => r.role === a.role);
      if (!room) { return []; }
      const id = `${room.id}_after${n}`;
      return [...a.scene ? [`  Observe ${id} at ${room.id} when true ${this.q(this.fill(a.scene, values))}.`] : [],
        ...a.document ? this.document(`${id}_doc`, room, { ...a.document, text: this.fill(a.document.text, values) }) : [],
        ...a.barrier ? this.barrier(`${id}_bar`, layout, { room, ...a.barrier }) : [],
        ...a.valuable ? [`  Item ${id}_find ${this.q(a.valuable.name)} is ${a.valuable.id} at ${room.id}.`] : [],
        ...a.hidden ? this.hidden(`${id}_cache`, room, a.hidden) : []];
    });
  }
  // The kinds of worth they left, declared with the site's own.
  static kinds(alterations: Alteration[]): Valuable[] {
    return alterations.flatMap(a => [...a.valuable ? [a.valuable] : [], ...a.hidden ? [a.hidden.valuable] : []]);
  }
  static fill(text: string, values: Record<string, string>): string {
    return text.replace(/\{(\w+)\}/g, (all, key: string) => values[key] ?? all);
  }
  // Read, it says what they wrote, once, and the company knows of the kingdom that came after the makers.
  private static document(id: string, room: DeepRoom, d: NonNullable<Alteration['document']>): string[] {
    const q = this.q;
    return [`  Thing ${id} ${q(d.name)} at ${room.id} {`, `    State unread ${q(d.shut)}.`,
      `    State read ${q(`${d.name.charAt(0).toUpperCase()}${d.name.slice(1)}, read.`)}.`,
      `    Change read ${q(d.label)} from unread to read.`, '  }',
      `  Observe ${id}_says at ${room.id} of ${id} as reading when state(${id}, read) and not knows(party, history_successors)`
        + ` ${q(d.text)} teaches history_successors.`];
  }
  private static barrier(id: string, layout: DeepLayout, b: NonNullable<Alteration['barrier']> & { room: DeepRoom }):
    string[] {
    const rooms = layout.levels.flatMap(l => l.rooms), q = this.q;
    const way = layout.links.find(l => !l.mechanism && [l.a, l.b].includes(b.room.id)
      && rooms.some(r => r.role === b.to && [l.a, l.b].includes(r.id)));
    if (!way) { return []; }
    return [`  Thing ${id} ${q(b.name)} on ${way.id} {`, `    State standing blocking ${q(b.text)}.`, `    State down ${q(b.down)}.`,
      `    Change drag ${q(b.label)} from standing to down needing brawn or crowbar.`, '  }'];
  }
  // Something hidden, found by searching where it was hidden.
  private static hidden(id: string, room: DeepRoom, h: NonNullable<Alteration['hidden']>): string[] {
    const q = this.q;
    return [`  Discovery ${id} ${q(h.found)} { Found by searching ${room.id}. }`,
      `  Item ${id}_find ${q(h.valuable.name)} is ${h.valuable.id} at ${room.id} hidden until ${id}.`];
  }
}
