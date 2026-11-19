import type * as ohm from 'ohm-js';
import type { Module, Predicate, Pursuit } from './module';

type Node = ohm.Node;
interface LegSpec { id: string; label?: string; place: string; from: number }
export interface RouteSpec { id: string; actor: string; priority: number; when?: Predicate; legs: LegSpec[] }

// Someone who keeps to a round on the clock: at one place from one watch, at the next from the next, while a
// condition holds (the maturity track's step 5; the requests' R41, R89). Written as a pursuit for each leg by hand
// in Sallowfield's clock (the riders, four) and Quittance's wake (Fettiplace, two), each repeating the clock's window
// and the condition; a Route is lowered into exactly those pursuits, so the runtime has no scheduler of its own: each
// leg is a Pursuit `{route}_{leg}`, sought from its watch until the next leg's, the last for good.
//   Route riders for riders priority 5 when not riders_gone(party) {
//     scar "riding the Scar road" at lookout from watch 12.
//     ford "riding down to the ford" at ford_stones from watch 80. }
// is `Pursuit riders_scar for riders "riding the Scar road" priority 5 when watch(clock) >= 12 and watch(clock) < 80
// and not riders_gone(party) seeks at(riders, lookout).`, and so on. A leg's watches must rise.
export class Routes {
  static readonly actions = { Route: Routes.parse, RouteLegs: Routes.legs, RouteHead: Routes.head,
    RoutePriority: Routes.priority, RouteWhen: Routes.second, RouteLeg: Routes.leg, RoutePlace: Routes.place,
    RouteFrom: Routes.from, PursuitAim_company: Routes.company_aim };
  // Route = "Route" RouteHead "{" RouteLegs; RouteLegs = RouteLeg+ "}"
  static parse(_route: Node, head: Node, _open: Node, legs: Node) {
    return { field: 'route', value: { ...Routes.ast(head) as object, legs: Routes.ast(legs) as LegSpec[] } };
  }
  static legs(legs: Node, _close: Node) { return legs.children.map(l => Routes.ast(l) as LegSpec); }
  // RouteHead = ident "for" ident RoutePriority
  static head(id: Node, _for: Node, actor: Node, priority: Node) {
    return { id: id.sourceString, actor: actor.sourceString, ...Routes.ast(priority) as object };
  }
  // RoutePriority = "priority" integer RouteWhen?; RouteWhen = "when" Predicate
  static priority(_priority: Node, n: Node, when: Node) {
    const condition = when.children.map(w => Routes.ast(w) as Predicate)[0];
    return { priority: Number(n.sourceString), ...condition ? { when: condition } : {} };
  }
  static second(_word: Node, value: Node) { return Routes.ast(value); }
  // RouteLeg = ident string? RoutePlace "."
  static leg(id: Node, label: Node, place: Node, _dot: Node): LegSpec {
    const text = label.children.map(l => Routes.ast(l) as string)[0];
    return { id: id.sourceString, ...text === undefined ? {} : { label: text },
      ...Routes.ast(place) as { place: string; from: number } };
  }
  // RoutePlace = "at" ident RouteFrom; RouteFrom = "from" "watch" integer
  static place(_at: Node, place: Node, from: Node) {
    return { place: place.sourceString, from: Routes.ast(from) as number };
  }
  static from(_from: Node, _watch: Node, n: Node) { return Number(n.sourceString); }
  private static ast(node: Node): unknown { return (node as unknown as { ast(): unknown }).ast(); }
  static lower(module: Module, r: RouteSpec) {
    r.legs.forEach((leg, i) => {
      if (i && leg.from <= r.legs[i - 1]!.from) {
        throw new Error(`Route ${r.id}'s leg ${leg.id} begins at watch ${leg.from}, not after the leg before it`);
      }
    });
    (module.pursuits ??= []).push(...r.legs.map((leg, i) => Routes.pursuit(r, leg, r.legs[i + 1])));
  }
  // A leg as the pursuit an author had written for it: its window on the clock first, then the route's condition,
  // joined as the parser joins "a and b and c" (to the right), so that the two are one and the same.
  private static pursuit(r: RouteSpec, leg: LegSpec, next: LegSpec | undefined): Pursuit {
    const window = [Routes.watch('>=', leg.from), ...next ? [Routes.watch('<', next.from)] : []];
    const parts = [...window, ...r.when ? [r.when] : []];
    const when = parts.reduceRight((right, left) => ({ kind: 'and', left, right }));
    return { id: `${r.id}_${leg.id}`, actor: r.actor, ...leg.label === undefined ? {} : { label: leg.label },
      priority: r.priority, when, target: Routes.at(r.actor, leg.place) };
  }
  // PursuitAim = "the" "company" -- company: what a pursuit of the company seeks until its module is whole, anyone
  // anywhere (so a module read on its own, never joined, has it seek what already holds).
  static readonly anywhere = ['?who', '?company'];
  static company_aim(_the: Node, _company: Node): Predicate {
    return { kind: 'call', name: 'at', args: [...Routes.anywhere] };
  }
  private static seeksCompany(p: Pursuit): boolean {
    return p.target.kind === 'call' && p.target.name === 'at' && p.target.args.join() === Routes.anywhere.join();
  }
  // A pursuit of the company, once the module is whole: one for each of its rooms, in the order they are declared,
  // taken up while its condition holds and the company is there, seeking to be there too (R54: the Wrong Boat's hunt
  // had been sixty, Bess's thirty and the lads', and a room added was not hunted in until a line was written for it).
  // The company is in one room at a time, so one of them is taken up at a time.
  static company(module: Module) {
    if (!module.pursuits?.some(p => Routes.seeksCompany(p))) { return; }
    const rooms = module.entities.filter(e => e.type === 'place' && e.space?.kind === 'room').map(e => e.id);
    module.pursuits = module.pursuits.flatMap(p => !Routes.seeksCompany(p) ? [p] : rooms.map(room => ({ ...p,
      id: `${p.id}_${room}`, when: Routes.joined(p.when, Routes.at('party', room)), target: Routes.at(p.actor, room) })));
  }
  // "a and b" and then c, as the parser reads "a and b and c": c at the end of the rightmost and.
  private static joined(p: Predicate, c: Predicate): Predicate {
    return p.kind === 'and' ? { kind: 'and', left: p.left, right: Routes.joined(p.right, c) } : { kind: 'and', left: p, right: c };
  }
  private static at(who: string, place: string): Predicate { return { kind: 'call', name: 'at', args: [who, place] }; }
  private static watch(operator: '>=' | '<', n: number): Predicate {
    return { kind: 'compare', left: { kind: 'call', name: 'watch', args: ['clock'] },
      right: { kind: 'number', value: n }, operator };
  }
}
