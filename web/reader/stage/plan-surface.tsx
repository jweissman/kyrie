import { useEffect, useRef, type KeyboardEvent } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { Plan, Screen } from '../../../src/ui/screen-types';
import { Typography } from '../../../src/presentation/typography';
import type { ReaderApp } from '../reader-app';
import { TownPlanView } from '../town-plan-view';

type Cell = Plan['cells'][number];

// The plan of where the company is, as the play's surface (spatial-play.md): a town's streets and buildings, a
// building's rooms, the rooms known under the ground, each a place on the plan's grid (see TownPlan), the ways between
// them, the way out, and the company ringed. A place is chosen, and shown in the focus beside it; chosen again, gone
// to, as on the hex board. Drawn from the plan alone: what the company knows of where it is, never more.
export class PlanSurface {
  static readonly w = 150;
  static readonly h = 84;
  static readonly gap = 30;
  static View({ app, screen, choices, chosen, choose }: { app: ReaderApp; screen: Screen; choices: Choice[];
    chosen?: string; choose: (id?: string) => void }) {
    const plan = screen.plan!, { w, h, gap } = PlanSurface;
    const xs = plan.cells.map(c => c.x), ys = plan.cells.map(c => c.y), [x0, y0] = [Math.min(...xs), Math.min(...ys)];
    const at = (c: Cell) => ({ x: (c.x - x0) * (w + gap), y: (c.y - y0) * (h + gap) });
    const width = (Math.max(...xs) - x0 + 1) * (w + gap) - gap, height = (Math.max(...ys) - y0 + 1) * (h + gap) - gap;
    const pick = (c: Cell) => {
      const go = TownPlanView.way(screen, choices, c);
      if (c.here) { choose(undefined); return; }
      if (chosen === c.id && go && !go.disabled) { app.choose(go); return; }
      choose(c.id);
    };
    // Drawn at a scale its names can be read at, and moved over like a map, where the company stands in the middle
    // (a town of twenty places had been shrunk to fit, its names too small to read).
    const host = useRef<HTMLDivElement>(null), here = plan.cells.find(c => c.here)?.id;
    useEffect(() => {
      host.current?.querySelector('[aria-current="location"]')?.scrollIntoView({ block: 'center', inline: 'center' });
    }, [here]);
    return (
      <div className={`plan-surface kind-${plan.kind}`} data-region="plan" ref={host}>
        <svg viewBox={`-24 -24 ${width + 48} ${height + 48}`} preserveAspectRatio="xMidYMid meet" role="group"
          aria-label={`The plan of ${plan.name}`} style={{ minWidth: `${Math.round((width + 48) * 0.82)}px`,
            minHeight: `${Math.round((height + 48) * 0.82)}px` }}>
          <defs>
            <pattern id="surface-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" className="hatch" /></pattern>
          </defs>
          {plan.lanes.map(l => PlanSurface.lane(plan, l, at))}
          {plan.cells.map(c => PlanSurface.cell(c, at(c), { chosen: chosen === c.id,
            go: TownPlanView.way(screen, choices, c), pick }))}
        </svg>
      </div>
    );
  }
  private static lane(plan: Plan, l: Plan['lanes'][number], at: (c: Cell) => { x: number; y: number }) {
    const a = plan.cells.find(c => c.id === l.from), b = plan.cells.find(c => c.id === l.to);
    if (!a || !b) { return null; }
    const { w, h } = PlanSurface, p = at(a), q = at(b);
    return <path key={`${l.from}|${l.to}`} className={`lane${a.been && b.been ? ' walked' : ''}`}
      d={`M${p.x + w / 2},${p.y + h / 2} H${q.x + w / 2} V${q.y + h / 2}`} />;
  }
  private static cell(c: Cell, p: { x: number; y: number }, at: { chosen: boolean; go?: Choice;
    pick: (c: Cell) => void }) {
    const { w, h } = PlanSurface, reach = c.here || (!!at.go && !at.go.disabled);
    const kind = ['place', c.indoors || c.building ? 'in' : 'open', c.door ? 'door' : '', c.here ? 'here' : '',
      c.been || c.here ? 'been' : 'unvisited', at.chosen ? 'chosen' : '', reach ? 'reach' : ''].filter(Boolean).join(' ');
    const said = c.door ? `Out to ${c.name}` : c.name;
    const key = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); at.pick(c); } };
    return (
      <g key={c.id} className={kind} transform={`translate(${p.x},${p.y})`} data-place={c.id}
        {...c.here ? { 'aria-current': 'location' as const } : {}}
        {...reach ? { role: 'button', tabIndex: 0, onClick: () => at.pick(c), onKeyDown: key,
          'aria-label': Typography.curl(c.here ? `${said}: you are here` : said), 'aria-pressed': at.chosen } : {}}>
        <title>{Typography.curl(said)}</title>
        <rect className="body" width={w} height={h} rx={c.indoors || c.building ? 2 : 10} />
        {(c.indoors || c.building) && <rect className="floor" x={6} y={6} width={w - 12} height={h - 12} />}
        {c.here && <rect className="ring" x={-6} y={-6} width={w + 12} height={h + 12} rx={6} />}
        <text x={w / 2} y={h / 2} textAnchor="middle">
          {TownPlanView.lines(said, 16).map((l, i, all) => <tspan key={i} x={w / 2}
            dy={i === 0 ? `${0.35 - (all.length - 1) * 0.6}em` : '1.2em'}>{Typography.curl(l)}</tspan>)}
        </text>
      </g>
    );
  }
}
