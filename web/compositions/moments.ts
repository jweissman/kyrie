// The fixed journey of the composition prototypes (AESTHETICS §7): six moments of the wren record, each a few beats,
// every beat one frame the page's own engine drew at that step of the record. A beat may name whom or what the
// player is attending to when it opens, which fight frame of its step it shows, and what the record did between it
// and the next beat when that is skipped.
export interface Beat { step: number; attend?: string; fight?: number; aside?: string }
export interface Moment { title: string; test: string; beats: Beat[] }

export class Moments {
  static readonly seed = 'wren';
  static readonly all: Moment[] = [
    { title: 'Arrival', test: 'A situated person with a small immediate concern, one recognizable relationship, and a '
      + 'route lead.', beats: [{ step: 0 }, { step: 1 }] },
    { title: 'Conversation', test: 'Hear a precise warning and ask a consequential follow-up.',
      beats: [{ step: 2, attend: 'Fargrim' }, { step: 3, attend: 'Fargrim' }, { step: 4, attend: 'Fargrim' },
        { step: 5, attend: 'Thoradin' }, { step: 6, attend: 'Thoradin', aside: 'The record then buys a ration, and a '
          + 'torch and a crowbar at Ulfgar’s forge, where Ulfgar tells what the matter is and of the walled stair '
          + '(steps 7–13).' }] },
    { title: 'Travel', test: 'Follow directions to a known landmark; see what is not yet known; encounter a meaningful '
      + 'interruption.', beats: [{ step: 14 }, { step: 15 }, { step: 16 }, { step: 17 }, { step: 18 }, { step: 19 }] },
    { title: 'Investigation', test: 'Examine, read, and manipulate one object without losing the enclosing scene.',
      beats: [{ step: 20, attend: 'casket' }, { step: 21, attend: 'casket' },
        { step: 22, attend: 'casket', aside: 'The record then gathers the smithy’s coins (steps 23–25).' }] },
    { title: 'Danger', test: 'Understand a threatened character and either act tactically, avoid, or withdraw.',
      beats: [{ step: 26 }, { step: 27, fight: 0 }, { step: 27, fight: 2 }, { step: 27, fight: 4 },
        { step: 27, aside: 'The record goes on through the mine, reads the notebook by the air shaft, and climbs out '
          + 'with the star-iron by the rungs (steps 28–60).' }] },
    { title: 'Return', test: 'Hear what changed, preserve a result in memory, and choose a next intention.',
      beats: [{ step: 61 }, { step: 62, aside: 'The record goes to Ulfgar’s forge and sells the star-iron, the '
        + 'beads and the stone (steps 63–73).' }, { step: 74, attend: 'Baern' }, { step: 75, attend: 'Baern', aside: 'The record '
        + 'goes out to the bailey (step 76): the glossary of the old script waits for a fuller purse.' }, { step: 77 }] },
  ];
  // Every beat in order, with its moment's index.
  static beats(): { moment: number; beat: Beat }[] {
    return this.all.flatMap((m, moment) => m.beats.map(beat => ({ moment, beat })));
  }
  static steps(): number[] {
    return [...new Set(this.beats().map(b => b.beat.step))];
  }
}
