import table from '../../data/paintings/scenery.json';
import type { PlaceRef, Screen } from './screen-types';

// What kind of place a scene is, for its painting: a taproom, a crypt, a market, a road (data/paintings/scenery.json,
// kinds). Every room under a roof had been one of four interiors and every site one of four paintings, whatever it
// was: a taproom and a spider nest shown as a vaulted cathedral library, a tower as a log cabin, the rat-runs as a
// tropical palm grotto, a necromancer's study as figures at a well, a market as woodland, a town gate as a mountain
// range, every room of a barrow alike, and one lane of sheep for the road, the bridge-foot and the forge (the owner and
// two fresh playtests, 7 November). A place is known by the words of its own name and its id (the generators write
// what a room is into both: region__s1_taproom, "the taproom of the Ancient Lantern"), the name before the id (a
// settlement's heart is its "green" by id whatever it is called: "the camp at Millholm"); failing those, by its level's
// or its site's ("the cross-chamber" of "the passage-grave" is a room of the dead, not any hall), and a room's own
// plain kind (a hall, a passage, a shop) gives way to its level's or site's where that has one.
// owner: a kind its words name by whose room it is ("the necromancer's study"), not lowered as a possessor.
export interface SceneKind {
  kind: string; words: string[]; ground?: string[]; room?: string[]; plain?: boolean; owner?: boolean;
}
// A kind, and the word of the place's own that named it (none where it is its level's or site's).
export interface Named { kind: SceneKind; word?: string }
export class SceneKinds {
  static readonly kinds: SceneKind[] = table.kinds;
  static readonly generic = new Set<string>(table.generic);
  // The kind a place is, by its own words (and which word said it), or by those of what it lies within, the nearest
  // first; its own where that is shown there at all (fits: "the crossing" deep in a mine is no ford, but the mine's).
  static of(screen: Screen, fits?: (kind: SceneKind) => boolean): Named | undefined {
    const parent = screen.path.filter(p => p.id !== screen.place.id).at(-1);
    const own = this.named(screen.place, parent?.id);
    if (own && !this.generic.has(own.kind.kind) && (!fits || fits(own.kind))) { return own; }
    const inner = [...screen.path].reverse()
      .filter(p => p.id !== screen.place.id && ['level', 'site'].includes(p.kind));
    const kin = inner.map(p => this.named(p)?.kind)
      .find(k => k && !this.generic.has(k.kind) && (k.room || k.plain));
    return kin ? { kind: kin } : own;
  }
  // The kind the place's name says, else its id. Its head is the last word naming a kind before the name's first
  // preposition ("Green Cave" is a cave, "the tower roof" a roof), else the first after it ("the shrine of Lugh",
  // "the hall of the bones" a room of the dead); a possessor only where nothing else names one ("the Exchange's
  // cellar" is a cellar), but an owner kind before any other (whose it is is what it is: "the necromancer's study");
  // and a plain kind (a hall, a passage) only before the preposition, and only where nothing else is said ("the way
  // into Tolleth and the Skerrow passage" is no passage).
  static named(place: PlaceRef, parent?: string): Named | undefined {
    for (const words of [this.words(place.name), this.ownId(place.id, parent)]) {
      const cut = words.findIndex(w => this.prepositions.has(w)), at = cut < 0 ? words.length : cut;
      const said = words.flatMap((w, i) => {
        const kind = this.kinds.find(k => k.words.includes(w)), plain = !!kind && this.generic.has(kind.kind);
        if (!kind || (plain && i > at)) { return []; }
        // Before the preposition the later word ranks first; after it, the earlier.
        const order = i < at ? at - i : i;
        const possessor = words[i + 1] === 's' && !kind.owner, first = kind.owner ? -500 : 0;
        const rank = first + (plain ? 4000 : 0) + (possessor ? 2000 : 0) + (i > at ? 1000 : 0) + order;
        return [{ kind, word: w, rank }];
      });
      const best = said.reduce<typeof said[number] | undefined>((a, b) => !a || b.rank < a.rank ? b : a, undefined);
      if (best) { return { kind: best.kind, word: best.word }; }
    }
    return undefined;
  }
  static readonly prepositions = new Set(['of', 'at', 'by', 'behind', 'below', 'under', 'over', 'above', 'into', 'in',
    'on', 'past', 'between', 'through', 'beyond', 'to', 'from', 'with', 'near', 'across', 'along']);
  // The words of a place's id that are its own, not those of what it lies within (region__s1_ud_barrow_recess, in
  // region__s1_ud_barrow, is a recess, not a barrow).
  static ownId(id: string, parent?: string): string[] {
    const own = parent && id.startsWith(`${parent}_`) ? id.slice(parent.length + 1) : id.split('__').pop()!;
    return own.split('_');
  }
  // A name's words, and its hyphened ones whole besides ("the corn-store cellar": corn-store, corn, store, cellar).
  static words(text: string): string[] {
    return text.toLowerCase().split(/[^a-z-]+/).filter(Boolean)
      .flatMap(w => w.includes('-') ? [w, ...w.split('-').filter(Boolean)] : [w]);
  }
  // How a kind is painted where the place is: under the ground, only from within (never a country underground: "the
  // landing" of a cistern is not a quay); under a roof, from within, or a kind seen only from the open where it is high
  // in a building (a tower's roof); in the open, from the open, or a kind seen only from within where no roof is
  // written round it (a shop off a market-place, an authored cellar). An empty list is a plain dim ground (plain); none
  // at all is no kind for the place.
  static painted(kind: SceneKind, at: { roofed: boolean; underground: boolean }): string[] | undefined {
    const within = kind.room ?? (kind.plain ? [] : undefined);
    if (at.underground) { return within; }
    return at.roofed ? within ?? kind.ground : kind.ground ?? within;
  }
}
