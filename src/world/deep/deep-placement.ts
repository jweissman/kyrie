import type { DeepContent, DeepDwellers } from './deep-pacing';
import type { DeepLayout, DeepLevel, DeepRoom } from './deep-layout';

// Where a site's first level puts who lives in it, once the pacing has drawn them (the sites commission, item 4;
// register SI-01): on the way a company first comes in by, the spine, nothing that lies in wait; and the level's
// worst, an elite, only at the end of a branch, where going to it is a choice. Nothing is weakened or taken away:
// what was drawn changes rooms with what a branch room held (the owner's ruling 6). Deeper levels are as drawn.
export class DeepPlacement {
  static settled(contents: DeepContent[], layout: DeepLayout, level: DeepLevel): DeepContent[] {
    if (level.index !== 0) { return contents; }
    for (const c of contents.filter(x => this.misplaced(layout, x.dwellers, x.room))) {
      // Near where the level is entered, a band the company can meet takes its place, so that the way in still meets
      // one (the owner: one fight an ordinary expedition reliably meets); further on, an empty room.
      const early = contents.indexOf(c) <= 2, fitting = contents.filter(t => this.fits(layout, c, t));
      const target = fitting.find(t => !!t.dwellers === early) ?? fitting[0];
      if (target) { this.swap(c, target); }
    }
    return contents;
  }
  // A room at the end of a branch: off the spine, one way in.
  private static end(layout: DeepLayout, r: DeepRoom): boolean {
    return r.y !== 1 && layout.links.filter(l => !l.between && (l.a === r.id || l.b === r.id)).length === 1;
  }
  private static misplaced(layout: DeepLayout, d: DeepDwellers | undefined, r: DeepRoom): boolean {
    return !!d && (d.elite ? !this.end(layout, r) : d.group.temperament === 'ambush' && r.y === 1);
  }
  // Where a misplaced band may go: a branch end for an elite, any branch room for what lies in wait; and whatever
  // stands there now must be at home where the band was.
  private static fits(layout: DeepLayout, c: DeepContent, t: DeepContent): boolean {
    const room = c.dwellers!.elite ? this.end(layout, t.room) : t.room.y !== 1;
    return t !== c && room && !this.misplaced(layout, t.dwellers, c.room) && !t.dwellers?.elite;
  }
  // Two rooms change who lives in them; each band is named for the room it is now in.
  private static swap(a: DeepContent, b: DeepContent) {
    const [da, db] = [a.dwellers, b.dwellers];
    this.put(a, db);
    this.put(b, da);
  }
  private static put(c: DeepContent, d: DeepDwellers | undefined) {
    if (!d) { delete c.dwellers; return; }
    const id = `${c.room.id}_dwellers`;
    c.dwellers = { ...d, id, ...d.beside ? { beside: { ...d.beside, id: `${id}_beside` } } : {} };
  }
}
