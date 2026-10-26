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
      beats: [{ step: 2, attend: 'Fargrim' }, { step: 3, attend: 'Fargrim' }, { step: 4, attend: 'Thoradin' },
        { step: 5, attend: 'Thoradin', aside: 'The record then buys a ration, and a torch and a crowbar at Ulfgar’s '
          + 'forge, where Ulfgar tells of the walled stair (steps 6–11).' }] },
    { title: 'Travel', test: 'Follow directions to a known landmark; see what is not yet known; encounter a meaningful '
      + 'interruption.', beats: [{ step: 12 }, { step: 13 }, { step: 14 }, { step: 15 }, { step: 16 }, { step: 17 }] },
    { title: 'Investigation', test: 'Examine, read, and manipulate one object without losing the enclosing scene.',
      beats: [{ step: 18, attend: 'casket' }, { step: 19, attend: 'casket' },
        { step: 20, attend: 'casket', aside: 'The record then takes a pay-token from the smithy (steps 21–23).' }] },
    { title: 'Danger', test: 'Understand a threatened character and either act tactically, avoid, or withdraw.',
      beats: [{ step: 24 }, { step: 25, fight: 0 }, { step: 25, fight: 2 }, { step: 25, fight: 4 },
        { step: 25, aside: 'The record goes on through the mine, reads the notebook by the air shaft, and climbs out '
          + 'with the star-iron by the rungs (steps 26–58).' }] },
    { title: 'Return', test: 'Hear what changed, preserve a result in memory, and choose a next intention.',
      beats: [{ step: 59 }, { step: 60, aside: 'The record goes to Ulfgar’s forge and sells the star-iron and the '
        + 'tokens (steps 61–71).' }, { step: 72, attend: 'Baern' }, { step: 73, attend: 'Baern', aside: 'The record '
        + 'buys a glossary of the old script from Baern (steps 74–75).' }, { step: 76 }] },
  ];
  // Every beat in order, with its moment's index.
  static beats(): { moment: number; beat: Beat }[] {
    return this.all.flatMap((m, moment) => m.beats.map(beat => ({ moment, beat })));
  }
  static steps(): number[] {
    return [...new Set(this.beats().map(b => b.beat.step))];
  }
}
