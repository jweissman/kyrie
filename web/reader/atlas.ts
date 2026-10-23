import type { RegionChart } from '../../src/ui/screen-types';
import { Typography } from '../../src/presentation/typography';

interface Pt { x: number; y: number }
export interface Drawn {
  box: number[]; cells: { i: number; x: number; y: number; s: number; cover: string }[];
  // The land not yet known, as a faint grid of points: how far the country goes, and nothing of what is in it.
  unknown: Pt[];
  rivers: string[]; roads: { points: string; came: boolean }[];
  paths: { points: string; label: string; shut: boolean; came: boolean }[];
  places: (Pt & { id: string; kind: string; visited: boolean })[];
  zones: (Pt & { id: string; name: string })[];
  labels: (Pt & { id: string; text: string; kind: string; known: boolean; anchor: 'start' | 'end' | 'middle' })[];
  here?: Pt; glosses: [string, string][];
}

// The country drawn plainly, as a grid of the cells the company knows: each cell the flat tone of its land, water
// blue; rivers and roads through the cells' middles; paths straight from end to end; settlements as squares, other
// places as rings; names set where they do not cross another name or a mark.
export class Atlas {
  static readonly S = 22;
  static readonly covers: Record<string, string> = { '~': 'water', o: 'water', ',': 'fen', '.': 'known', w: 'wood',
    h: 'heath', f: 'fell', p: 'peak' };
  static draw(region: RegionChart, came?: string): Drawn {
    const land = region.land!, W = land.width, S = Atlas.S, known = new Set(land.known);
    const cells = land.known.map(i => ({ i, x: (i % W) * S + 0.75, y: Math.floor(i / W) * S + 0.75, s: S - 1.5,
      cover: this.covers[land.cover[i] ?? '.'] ?? 'known' }));
    const hereArea = region.areas.find(a => a.here)?.id, cameArea = came ? region.within[came] ?? came : undefined;
    const ends = [cameArea ?? '', hereArea ?? ''].sort().join('|');
    const roadsCame = region.edges.filter(e => e.road && this.ends(e) === ends).map(e => this.line(e.course ?? [], W));
    const roads = Object.values(land.roads).map(cs => this.line(cs.filter(c => known.has(c)), W))
      .map(points => ({ points, came: roadsCame.includes(points) }));
    const paths = region.edges.filter(e => e.course && !e.road && e.course.length > 1)
      .map(e => ({ points: this.line(e.course!, W), label: Typography.curl(e.label), shut: e.status !== 'open',
        came: this.ends(e) === ends }));
    const places = [...region.areas.filter(a => a.kind === 'settlement').map(a => ({ id: a.id, kind: 'settlement',
      visited: a.visited, ...this.centre(a.y * W + a.x, W), name: a.name })),
    ...land.marks.map(m => ({ id: m.id, kind: m.kind, visited: m.visited, ...this.centre(m.cell, W), name: m.name }))];
    const zones = land.zones.map(z => {
      const pts = z.cells.map(c => this.centre(c, W)), x = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const y = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      return { id: z.id, name: Typography.curl(z.name.replace(/^the /i, '')), x, y };
    });
    const here = land.here !== undefined ? this.centre(land.here, W) : places.find(p => p.id === hereArea);
    const labels = this.labels(places, here ? [here] : []);
    const unknown = [...land.cover].flatMap((_, i) => known.has(i) ? [] : [this.centre(i, W)]);
    const glosses = Object.entries(land.glosses).map(([id, gloss]) => [places.find(p => p.id === id)?.name
      ?? region.areas.find(a => a.id === id)?.name ?? '', gloss] as [string, string]).filter(([n]) => n);
    const rivers = land.rivers.map(r => this.line(r.filter(c => known.has(c)), W));
    return { box: [0, 0, W * S, land.height * S], cells, unknown, zones: this.zoned(zones, labels), rivers,
      roads, paths, places, labels, ...here ? { here } : {}, glosses };
  }
  // A country with no land drawn for it (an authored one): its places where its author set them, joined by the ways
  // the company knows, in the same plain marks.
  static schematic(region: RegionChart, came?: string): Drawn {
    const G = 96, xs = region.areas.map(a => a.x), ys = region.areas.map(a => a.y);
    const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
    const at = new Map(region.areas.map(a => [a.id, { x: (a.x - x0) * G + 60, y: (a.y - y0) * G + 50 }]));
    const hereArea = region.areas.find(a => a.here)?.id, cameArea = came ? region.within[came] ?? came : undefined;
    const ends = [cameArea ?? '', hereArea ?? ''].sort().join('|');
    const paths = region.edges.flatMap(e => {
      const a = at.get(e.from), b = at.get(e.to);
      return a && b ? [{ points: `${a.x},${a.y} ${b.x},${b.y}`, label: Typography.curl(e.label),
        shut: e.status !== 'open', came: this.ends(e) === ends }] : [];
    });
    const places = region.areas.map(a => ({ id: a.id, kind: a.kind === 'settlement' ? 'settlement' : 'site',
      visited: a.visited, name: a.name, ...at.get(a.id)! }));
    const here = hereArea ? at.get(hereArea) : undefined;
    return { box: [0, 0, (Math.max(...xs) - x0) * G + 280, (Math.max(...ys) - y0) * G + 110], cells: [], unknown: [],
      rivers: [], roads: [], paths, places, zones: [], labels: this.labels(places, here ? [here] : []),
      ...here ? { here } : {}, glosses: [] };
  }
  private static centre(i: number, W: number): Pt {
    return { x: (i % W) * this.S + this.S / 2, y: Math.floor(i / W) * this.S + this.S / 2 };
  }
  private static line(cells: number[], W: number): string {
    return cells.map(c => { const p = this.centre(c, W); return `${p.x},${p.y}`; }).join(' ');
  }
  private static ends(e: RegionChart['edges'][number]): string { return [e.from, e.to].sort().join('|'); }
  // A name beside each place: to the right if there is room, else left, above or below; a name that fits nowhere
  // is left off (the ways list says it).
  private static labels(places: (Pt & { id: string; kind: string; visited: boolean; name: string })[], taken: Pt[]):
    Drawn['labels'] {
    const boxes: number[][] = taken.map(p => [p.x - 13, p.y - 13, p.x + 13, p.y + 13]);
    places.forEach(p => boxes.push([p.x - 7, p.y - 7, p.x + 7, p.y + 7]));
    const out: Drawn['labels'] = [];
    for (const p of [...places].sort((a, b) => Number(b.kind === 'settlement') - Number(a.kind === 'settlement'))) {
      const town = p.kind === 'settlement', text = Typography.curl(town ? p.name : p.name.replace(/^the /, ''));
      const size = town ? 13 : 12, w = text.length * size * (town ? 0.72 : 0.55), h = size + 2;
      const tries: [number, number, 'start' | 'end' | 'middle'][] = [[16, 4, 'start'], [-16, 4, 'end'],
        [0, -16, 'middle'], [0, 28, 'middle']];
      for (const [dx, dy, anchor] of tries) {
        const x = p.x + dx, y = p.y + dy, left = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
        const box = [left, y - h + 3, left + w, y + 3];
        if (boxes.some(b => box[0]! < b[2]! && box[2]! > b[0]! && box[1]! < b[3]! && box[3]! > b[1]!)) { continue; }
        boxes.push(box);
        out.push({ id: p.id, text, kind: p.kind, known: p.visited || town, x, y, anchor });
        break;
      }
    }
    return out;
  }
  // The name of wild country, written across it where it does not cross a place's name: a little below its middle,
  // or above.
  private static zoned(zones: Drawn['zones'], labels: Drawn['labels']): Drawn['zones'] {
    return zones.flatMap(z => {
      const w = z.name.length * 13 * 0.9;
      for (const dy of [26, -22, 48, -44]) {
        const box = [z.x - w / 2, z.y + dy - 14, z.x + w / 2, z.y + dy + 2];
        const crossed = labels.some(l => {
          const lw = l.text.length * 9;
          const left = l.anchor === 'start' ? l.x : l.anchor === 'end' ? l.x - lw : l.x - lw / 2;
          return box[0]! < left + lw && box[2]! > left && box[1]! < l.y + 3 && box[3]! > l.y - 14;
        });
        if (!crossed) { return [{ ...z, y: z.y + dy }]; }
      }
      return [];
    });
  }
}
