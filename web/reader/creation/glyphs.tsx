import { Emblems } from '../../../src/presentation/emblems';

// An emblem drawn in light (see Emblems): a line glyph whose lines keep one weight at any size. It decorates and
// names; nothing is decided by it. A thing with no emblem draws nothing, its name standing alone.
export class Glyphs {
  static has(id: string): boolean { return Emblems.has(id); }
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
