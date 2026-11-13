import type { KeyboardEvent } from 'react';
import type { Choice } from '../../src/ui/choice-list';
import type { Plan, Screen } from '../../src/ui/screen-types';
import { Typography } from '../../src/presentation/typography';
import type { ReaderApp } from './reader-app';

type Cell = Plan['cells'][number];

// The plan of the town or the building you are in (see TownPlan), drawn as a surveyor would: each place a cell of
// the grid, a building's walls hatched and open ground stippled, the lanes between them the streets in the gaps, a
// place you have not been to faint, a way barred dashed, and you ringed in gold. A place with a way to it from here
// is chosen on the plan to go there (the owner, 3 November: where you are in a big place had been a recurring
// confusion, and a town read like a list; NVR-20, NVR-21, OWN-81).
export class TownPlanView {
  static readonly w = 112;
  static readonly h = 64;
  static readonly gap = 18;
  static View({ app, screen, choices }: { app: ReaderApp; screen: Screen; choices: Choice[] }) {
    const plan = screen.plan;
    if (!plan) { return null; }
    const { w, h, gap } = TownPlanView, xs = plan.cells.map(c => c.x), ys = plan.cells.map(c => c.y);
    const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
    const at = (c: Cell) => ({ x: (c.x - x0) * (w + gap), y: (c.y - y0) * (h + gap) });
    const width = (Math.max(...xs) - x0 + 1) * (w + gap) - gap, height = (Math.max(...ys) - y0 + 1) * (h + gap) - gap;
    const name = Typography.curl(plan.name.replace(/^the /, 'The '));
    return (
      <section className="town-plan" aria-label={`The plan of ${plan.name}`}>
        <p className="label">{plan.kind === 'building' ? `Inside ${name}` : plan.kind === 'under' ? `Below ${name}`
          : `The plan of ${name}`}</p>
        <svg className="town-drawn" viewBox={`-10 -10 ${width + 20} ${height + 20}`} role="group"
          style={{ maxWidth: `${width + 20}px` }}>
          <defs>
            <pattern id="plan-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" className="hatch" /></pattern>
            <pattern id="plan-ground" width="9" height="9" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r=".8" className="stipple" /><circle cx="6.5" cy="6.5" r=".8" className="stipple" /></pattern>
          </defs>
          {plan.lanes.map(l => TownPlanView.lane(plan, l, at))}
          {plan.cells.map(c => TownPlanView.cell(app, c, at(c), TownPlanView.way(screen, choices, c)))}
        </svg>
      </section>
    );
  }
  // The choice that takes the company to a cell: the way there from here, else the walk to it across the town.
  static way(screen: Screen, choices: Choice[], c: Cell): Choice | undefined {
    const exit = screen.exits.find(e => e.destination.id === c.id);
    return (exit && choices.find(ch => ch.id === exit.id || ch.id.startsWith(`${exit.id}/`)))
      ?? choices.find(ch => ch.id === `travel:${c.id}`);
  }
  private static lane(plan: Plan, l: Plan['lanes'][number], at: (c: Cell) => { x: number; y: number }) {
    const a = plan.cells.find(c => c.id === l.from), b = plan.cells.find(c => c.id === l.to);
    if (!a || !b) { return null; }
    const { w, h } = TownPlanView, p = at(a), q = at(b);
    return <path key={`${l.from}|${l.to}`} className="lane"
      d={`M${p.x + w / 2},${p.y + h / 2} H${q.x + w / 2} V${q.y + h / 2}`} />;
  }
  private static cell(app: ReaderApp, c: Cell, p: { x: number; y: number }, choice: Choice | undefined) {
    const { w, h } = TownPlanView, go = !!choice && !choice.disabled && !c.here;
    const kind = ['cell', c.indoors || c.building ? 'in' : 'open', c.door ? 'door' : '', c.here ? 'here' : '',
      c.been || c.here ? 'been' : '', choice?.disabled ? 'barred' : '', go ? 'go' : ''].filter(Boolean).join(' ');
    const take = () => { if (go) { app.choose(choice); } };
    const key = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); take(); } };
    const said = c.door ? `Out to ${c.name.replace(/^the /i, 'the ')}` : c.name;
    return (
      <g key={c.id} className={kind} transform={`translate(${p.x},${p.y})`} data-place={c.id}
        {...c.here ? { 'aria-current': 'location' as const } : {}}
        {...go ? { role: 'button', tabIndex: 0, onClick: take, onKeyDown: key, 'data-act': choice.id,
          'aria-label': Typography.curl(choice.label) } : {}}>
        <title>{Typography.curl(choice?.disabled ? `${said}: ${choice.disabled}` : said)}</title>
        {c.indoors || c.building
          ? <><rect className="wall" width={w} height={h} /><rect className="floor" x={5} y={5} width={w - 10} height={h - 10} /></>
          : <><rect className="base" width={w} height={h} /><rect className="ground" width={w} height={h} /></>}
        {c.here && <rect className="ring" x={-5} y={-5} width={w + 10} height={h + 10} rx={3} />}
        <text x={w / 2} y={h / 2} textAnchor="middle">
          {TownPlanView.lines(said).map((l, i, all) => <tspan key={i} x={w / 2}
            dy={i === 0 ? `${0.35 - (all.length - 1) * 0.6}em` : '1.2em'}>{Typography.curl(l)}</tspan>)}
        </text>
      </g>
    );
  }
  // A name set in up to three lines a cell wide, its article dropped.
  static lines(name: string, width = 14): string[] {
    const words = name.replace(/^(the|a|an) /i, '').split(' '), lines: string[] = [];
    for (const word of words) {
      const last = lines.at(-1);
      if (last !== undefined && `${last} ${word}`.length <= width) { lines[lines.length - 1] = `${last} ${word}`; }
      else { lines.push(word); }
    }
    return lines.length > 3 ? [...lines.slice(0, 2), `${lines[2]!}…`] : lines;
  }
}
