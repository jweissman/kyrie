import { Html } from './html';
import type { Chart, RegionChart } from '../src/ui/screen-types';

// The known map as SVG: authored grid positions, places the company has stood in, the far ends of ways it has seen,
// and those ways coloured by what stands in them. Nothing here is inferred beyond the screen model's chart.
export class MonoMap {
  static readonly cell = { w: 136, h: 88, node: { w: 108, h: 44 } };
  static short(name: string, max = 14): string {
    const plain = name.replace(/^(the|a|an) /i, '');
    return plain.length > max ? `${plain.slice(0, max - 1)}…` : plain;
  }
  // Word-wrap a place name onto at most two short lines.
  static wrap(name: string, width = 12): string[] {
    const words = name.replace(/^(the|a|an) /i, '').split(/\s+/), lines: string[] = [''];
    for (const word of words) {
      const line = lines.at(-1)!;
      if (!line || (line + ' ' + word).length <= width) { lines[lines.length - 1] = line ? `${line} ${word}` : word; }
      else if (lines.length < 2) { lines.push(word); }
      else { lines[1] = this.short(`${lines[1]} ${word}`, width); break; }
    }
    return lines.map(l => this.short(l, width));
  }
  static svg(chart: Chart, near = false): string {
    const { w, h, node } = this.cell;
    const xs = chart.places.map(p => p.x), ys = chart.places.map(p => p.y);
    const [minX, minY] = [Math.min(...xs), Math.min(...ys)];
    const width = (Math.max(...xs) - minX + 1) * w, height = (Math.max(...ys) - minY + 1) * h;
    const at = new Map(chart.places.map(p => [p.id, { cx: (p.x - minX) * w + w / 2, cy: (p.y - minY) * h + h / 2 }]));
    const areas = [...new Set(chart.places.map(p => p.area))].filter(Boolean).map(area => {
      const members = chart.places.filter(p => p.area === area).map(p => at.get(p.id)!);
      const xs = members.map(m => m.cx), ys = members.map(m => m.cy);
      const x0 = Math.min(...xs) - node.w / 2 - 6, x1 = Math.max(...xs) + node.w / 2 + 6;
      const y0 = Math.min(...ys) - node.h / 2 - 14, y1 = Math.max(...ys) + node.h / 2 + 5;
      return `<g class="area"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="4"/><text x="${x0 + 5}" y="${y0 + 11}">${Html.escape(this.short(area, 22))}</text></g>`;
    }).join('');
    const edges = chart.edges.map(e => {
      const a = at.get(e.from)!, b = at.get(e.to)!;
      return `<line class="way ${e.status}${e.explored ? '' : ' unexplored'}" data-edge="${Html.escape(e.id)}" data-status="${e.status}" x1="${a.cx}" y1="${a.cy}" x2="${b.cx}" y2="${b.cy}"${e.oneWay ? ' marker-end="url(#arrow)"' : ''}><title>${Html.escape(e.name)} — ${e.status}</title></line>`;
    }).join('');
    const nodes = chart.places.map(p => {
      const c = at.get(p.id)!;
      return `<g class="place${p.here ? ' here' : ''}${p.visited ? '' : ' unknown'}${p.external ? ' beyond' : ''}" data-place="${Html.escape(p.id)}"${p.here ? ' aria-current="location"' : ''}>`
        + `<rect x="${c.cx - node.w / 2}" y="${c.cy - node.h / 2}" width="${node.w}" height="${node.h}" rx="3"/>`
        + `<text x="${c.cx}" y="${c.cy}" text-anchor="middle">${this.wrap(p.external ? `→ ${p.name.replace(/^(the|a|an) /i, '')}` : p.name)
          .map((l, i, all) => `<tspan x="${c.cx}" dy="${i === 0 ? (all.length === 1 ? 5 : -3) : 16}">${Html.escape(l)}</tspan>`).join('')}</text>`
        + `${p.here ? `<circle cx="${c.cx - node.w / 2 + 2}" cy="${c.cy - node.h / 2 + 2}" r="5"/>` : ''}<title>${Html.escape(p.name)}</title></g>`;
    }).join('');
    const box = near ? this.near(chart, at) : `-4 -4 ${width + 8} ${height + 8}`;
    return `<svg class="chart" role="img" aria-label="Map of the places you know" viewBox="${box}" preserveAspectRatio="xMidYMid meet">`
      + `<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>`
      + `${areas}${edges}${nodes}</svg>`;
  }
  // A small screen shows the cells around the company at a readable size rather than the whole site shrunk.
  static near(chart: Chart, at: Map<string, { cx: number; cy: number }>): string {
    const here = chart.places.find(p => p.here), c = here ? at.get(here.id)! : at.values().next().value!;
    const { w, h } = this.cell, span = { x: w * 2.4, y: h * 1.6 };
    return `${c.cx - span.x / 2} ${c.cy - span.y / 2} ${span.x} ${span.y}`;
  }
  // The region as areas and the routes between them; a separate, smaller drawing so scale is never mixed.
  static region(region: RegionChart): string {
    const w = 150, h = 64, xs = region.areas.map(a => a.x), ys = region.areas.map(a => a.y);
    const [minX, minY] = [Math.min(...xs), Math.min(...ys)];
    const at = new Map(region.areas.map(a => [a.id, { cx: (a.x - minX) * w + w / 2, cy: (a.y - minY) * h + h / 2 }]));
    const width = (Math.max(...xs) - minX + 1) * w, height = (Math.max(...ys) - minY + 1) * h;
    const edges = region.edges.map(e => {
      const a = at.get(e.from)!, b = at.get(e.to)!;
      return `<line class="way ${e.status}" x1="${a.cx}" y1="${a.cy}" x2="${b.cx}" y2="${b.cy}"><title>${Html.escape(e.label)}</title></line>`
        + `<text class="route" x="${(a.cx + b.cx) / 2}" y="${(a.cy + b.cy) / 2 - 6}" text-anchor="middle">${Html.escape(e.label.split(' · ').at(-1)!)}</text>`;
    }).join('');
    const nodes = region.areas.map(a => {
      const c = at.get(a.id)!;
      return `<g class="area-node${a.here ? ' here' : ''}${a.visited ? '' : ' unknown'}" data-area="${Html.escape(a.id)}"><circle cx="${c.cx}" cy="${c.cy}" r="7"/>`
        + `<text x="${c.cx}" y="${c.cy + 22}" text-anchor="middle">${Html.escape(this.short(a.name, 18))}</text></g>`;
    }).join('');
    return `<svg class="chart regional" role="img" aria-label="Region" viewBox="-4 -10 ${width + 8} ${height + 20}">${edges}${nodes}</svg>`;
  }
  static pane(chart: Chart | undefined, fallback: { name: string; here: boolean; visited: boolean }[],
    region?: RegionChart, size: 'small' | 'large' = 'small'): string {
    const legend = '<p class="legend"><span class="k open">—</span>open <span class="k blocked">—</span>shut <span class="k guarded">—</span>guarded <span class="k hazard">—</span>danger <span class="k unexplored">- -</span>not yet walked</p>';
    const regional = region ? `<h3 class="map-scale">Region</h3>${this.region(region)}` : '';
    const narrow = typeof matchMedia === 'function' && matchMedia('(max-width: 719px)').matches;
    const body = chart ? `${this.svg(chart, narrow)}${regional}${legend}`
      : `<ul class="placelist">${fallback.filter(p => p.visited || p.here)
        .map(p => `<li${p.here ? ' class="here"' : ''}>${p.here ? '◎' : '·'} ${Html.escape(p.name)}</li>`).join('')}</ul>`;
    return `<section class="pane map ${size}" data-region="map" aria-label="Map"><h2>Map</h2>${body}</section>`;
  }
}
