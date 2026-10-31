import { Draw } from './land/draw';
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
  static readonly breath = 'Deal (1d6) cold damage to ally unless constitution save against (11).';
  static readonly answers = (world as unknown as { riddleAnswers: Record<string, string[]> }).riddleAnswers;
  static work(region: Region, site: Site, written: string[]): string[] {
    const way = `${site.id}_in`, line = written.find(l => l.includes(`Passage ${way} `));
    const draw = new Draw(`${region.name}:${site.id}:riddle`);
    if (!line || site.work?.great || !draw.chance(0.4)) { return []; }
    const room = /between (\w+) and \w+/.exec(line)![1]!;
    const pool = Object.values(this.riddles).flat().filter(r => this.answers[r.kind]?.length);
    const riddle = draw.pick(pool), wrong = draw.shuffle(this.answers[riddle.kind]!
      .filter(a => a.toLowerCase() !== riddle.answer.toLowerCase())).slice(0, 3);
    const offered = draw.shuffle([riddle.answer, ...wrong]);
    return this.door(site.id, { way, room, riddle, offered });
  }
  private static door(w: string, at: { way: string; room: string; riddle: Riddle; offered: string[] }): string[] {
    const q = JSON.stringify, id = `${w}_riddle`, { riddle } = at;
    return [`  Hazard ${id}_cold "the breath of the stone" means ${q(this.breath)}.`,
      `  Relation ${id}_door(thing).`, `  Initially Assert ${id}_door(${id}).`,
      `  Thing ${id} "the speaking door" on ${at.way} {`,
      `    State sealed blocking ${q(`A door of one grey stone fills the way in, without hinge or handle. Words are cut deep across it in the old script, and under them, in a later hand, scratched small, what they say: ‘${riddle.question}’ Below is a row of words with a hollow beside each, worn smooth by fingers.`)}.`,
      '    State open "The stone door stands turned on its pivot, and the way in is open.".', '  }',
      ...at.offered.flatMap((word, n) => this.answer({ id, w, room: at.room, word, n,
        right: word === riddle.answer }))];
  }
  private static answer(a: { id: string; w: string; room: string; word: string; n: number; right: boolean }): string[] {
    const q = JSON.stringify;
    return [`  Action ${a.id}_word${a.n}(actor: group, door: thing) ${q(`Press the word “${a.word}”`)} {`,
      `    Description "Put a finger in the hollow beside the word, and press.".`,
      // Asked first, every word alike (a mark on the wrong ones only would give the answer away): a word pressed is
      // the door's answer, and a wrong one is answered with cold (a player pressed one thinking it the way in, and the
      // cold killed the company: the owner's play, 31 October).
      `    Grave "Pressing a word answers the riddle; a wrong word, and the stone breathes out cold.".`,
      `    Requires able(actor) and at(actor, ${a.room}) and ${a.id}_door(door) and state(door, sealed).`, '    Time 1.',
      // Whoever presses the right word has opened it, as whoever works any change on a thing has changed it: those
      // who watch the way can tell who did it (Sir Hamo's men at Fyrsteport, PT-33).
      a.right ? `    On success { Retract state(door, sealed). Assert state(door, open). Assert changedBy(door, actor). }`
        : `    On success { Assert strikes(${a.id}_cold, actor). }`,
      `    Result ${q(a.right ? `The word sinks into the stone under your finger. Something deep in the door turns over, like a sleeper, and the whole slab swings on a pivot you could not see, and the way in is open.`
        : 'The word sinks under your finger and comes back up. The stone breathes out, once, a breath as cold as a well in winter, and the door stays as it was.')}.`,
      '  }'];
  }
}
