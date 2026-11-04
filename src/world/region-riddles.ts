import text from '../../data/generation/works/riddle-door.kyrt' with { type: 'text' };
import { Draw } from './land/draw';
import { KyrTemplates } from './kyr-template';
import { WrittenKyr } from './written-kyr';
import world from '../../data/generation/scenes/orsino-world.json';
import type { Region, Site } from './region-writer';

interface Riddle { question: string; answer: string; kind: string; level: string; source: string }

// A sealed door in a makers' work that opens to the right answer (Orsino's riddles). The riddle is cut in the door in
// the old script, with what it says written under it in a later hand; beside it a row of words, each with a hollow
// for a finger: the right answer, and three wrong ones of the same kind (Orsino's riddle answers). The right word
// opens the door; a wrong one, and the stone breathes out cold, and the door stays shut. Some works have one, on
// their way in.
export class RegionRiddles {
  static readonly riddles = world.riddles as Record<string, Riddle[]>;
  static readonly answers = (world as unknown as { riddleAnswers: Record<string, string[]> }).riddleAnswers;
  static work(region: Region, site: Site, written: string[]): string[] {
    const way = `${site.id}_in`, ends = WrittenKyr.of(written).ends(way);
    const draw = new Draw(`${region.name}:${site.id}:riddle`);
    if (!ends || site.work?.great || !draw.chance(0.4)) { return []; }
    const room = ends[0];
    const pool = Object.values(this.riddles).flat().filter(r => this.answers[r.kind]?.length);
    const riddle = draw.pick(pool), wrong = draw.shuffle(this.answers[riddle.kind]!
      .filter(a => a.toLowerCase() !== riddle.answer.toLowerCase())).slice(0, 3);
    const offered = draw.shuffle([riddle.answer, ...wrong]);
    return this.door(site.id, { way, room, riddle, offered });
  }
  // The door and its words, as the author wrote them (data/generation/works/riddle-door.kyrt).
  static readonly template = KyrTemplates.parse(text);
  private static section(group: string, values: Record<string, string>): string[] {
    return KyrTemplates.fill(this.template.sections.filter(t => t.group === group).flatMap(t => t.lines), values);
  }
  private static door(w: string, at: { way: string; room: string; riddle: Riddle; offered: string[] }): string[] {
    const id = `${w}_riddle`;
    return [...this.section('door', { id, way: at.way, question: at.riddle.question }),
      ...at.offered.flatMap((word, n) => this.section(word === at.riddle.answer ? 'right' : 'wrong',
        { id, room: at.room, word, n: String(n) }))];
  }
}
