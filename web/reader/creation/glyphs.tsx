import { Emblems } from '../../../src/presentation/emblems';

// An emblem drawn in light (see Emblems): a line glyph whose lines keep one weight at any size. It decorates and
// names; nothing is decided by it. A thing with no emblem draws nothing, its name standing alone.
export class Glyphs {
  static has(id: string): boolean { return Emblems.has(id); }
  // The emblem of one met without a likeness: their own where one is drawn, else an animal's paw or anyone's hooded
  // head, never a name alone in an empty ring (the owner's own play, 7 November: everyone met has some portrait).
  static met(x: { emblem?: string; kind: string }): string {
    return x.emblem && Emblems.has(x.emblem) ? x.emblem : x.kind === 'animal' ? 'animal' : 'someone';
  }
  static View({ id, className = 'glyph', label }: { id: string; name?: string; className?: string; label?: string }) {
    const path = Emblems.path(id);
    if (!path) { return null; }
    return (
      <svg className={className} viewBox="0 0 48 48" focusable="false" {...label ? { role: 'img', 'aria-label': label }
        : { 'aria-hidden': true }}>
        <path d={path} vectorEffect="non-scaling-stroke" />
      </svg>
    );
  }
}
