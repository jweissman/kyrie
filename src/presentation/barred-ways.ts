import type { Screen } from '../ui/screen-types';

// A way on not yet taken, in a site or a place the aim names, that nothing open crosses and something barred would:
// what that would take, said with what the company needs. A ranger alone at Ironkeep's portcullis had found push,
// pull, listen and search all empty, and only the way out, while heaving it up needed brawn and the breach in the
// curtain wall climbing or rope, said nowhere (the terminal's human session, 15 November).
export class BarredWays {
  static said(screen: Screen, named: Set<string>): string[] {
    if (!named.has(screen.place.id) && !screen.path.some(p => p.kind === 'site')) { return []; }
    return screen.exits.filter(e => !e.visited && !e.crosses && !e.acts.some(a => a.moves && !a.disabled))
      .flatMap(e => {
        const barred = e.acts.find(a => a.disabled), way = BarredWays.upper(e.way ?? e.name);
        if (barred) { return [`${barred.label === 'Go' ? way : barred.label}: ${BarredWays.clause(barred.disabled!)}`]; }
        return !e.acts.length && e.blocked ? [`${way}: ${BarredWays.clause(e.blocked)}`] : [];
      });
  }
  // "Needs brawn: no one in the company can use it now." and "You would need climbing or a coil of rope." alike.
  private static clause(reason: string): string {
    return (reason.split(':')[0] ?? reason).replace(/\.$/, '').replace(/^(Needs|You would need)\b/, 'needs');
  }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
}
