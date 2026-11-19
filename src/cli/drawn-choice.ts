import type { Call, Module, Predicate } from '../lang/module';
import type { World } from '../lang/world';
import { EngineOwned } from '../lang/engine-owned';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// An act, as far as its condition and its own parameters.
export interface DrawnAct { requires: Predicate; parameters?: { name: string }[] }

// What a world's draw chose against an act: a standing scenario written for each of its stagings (the Walk's four
// greens, a den's three marvels) holds every staging's acts, and the ones of a staging not drawn wait on a fact the
// draw left false and nothing in play makes true (flashpoint(f_b), marvelled(beasts, m_spring)). Such an act is never
// offered in this world, as meant; `kyrie lint` says so as advice, not as an act with no possible target (MT-02: 127
// of the 221 warnings of a1, iscoed and kite were these).
export class DrawnChoice {
  // What play changes by other effects than an assertion (Give, Take, Spend, a move) or the engine keeps.
  static readonly moved: ReadonlySet<string> = new Set(['at', 'on', 'carries', 'holding', 'keeps', 'quantity',
    ...EngineOwned.rules]);
  private readonly changed: Set<string>;
  constructor(private readonly module: Module, private readonly world: World, private readonly company?: string) {
    this.changed = DrawnChoice.changed(module);
  }
  // The first fact of the act's condition, named of no parameter of its own, that is false, held of something else
  // (another staging's: flashpoint(f_a)) and that no act or rule of the world asserts, or denied (not
  // vault_built(office_made): the Silent Lord's Office built in this world) where it holds and nothing retracts it;
  // undefined if there is none. The one who acts is the company (a drover's son's topics, kin(actor, son), for a
  // company he is not of).
  of(act: DrawnAct): string | undefined {
    const own = new Set((act.parameters ?? []).map(p => p.name).filter(n => !(this.company && n === 'actor')));
    const found = DrawnChoice.held(act.requires).map(([c, not]) => [this.named(c), not] as const)
      .find(([c, not]) => this.chosen(c, not, own));
    return found && `${found[1] ? 'not ' : ''}${found[0].name}`;
  }
  private named(c: Call): Call {
    return { ...c, args: c.args.map(a => a === 'actor' && this.company ? this.company : a) };
  }
  private chosen(c: Call, not: boolean, own: Set<string>): boolean {
    if (DrawnChoice.moved.has(c.name) || c.args.some(a => own.has(a) || a.startsWith('?'))) { return false; }
    if (this.changed.has(`${not ? 'retract' : 'assert'} ${c.name}`) || this.world.test(c) !== not) { return false; }
    return not || this.world.related(c.name).length > 0 || this.alternative(c) || DrawnChoice.begun().has(c.name);
  }
  // Another of the module's own unary or n-ary facts of the same kinds, held of the same things, that nothing in play
  // changes either: the draw chose among them (a den's beasts wild, unquiet or stubborn: smoke_out waits on wild where
  // the den drew outlaws, lay_to_rest on unquiet where it drew a pack).
  private alternative(c: Call): boolean {
    const own = c.name.includes('__') ? c.name.slice(0, c.name.indexOf('__') + 2) : undefined;
    const types = this.module.relations.find(r => r.name === c.name)?.types;
    return !!own && !!types && this.module.relations.some(r => r.name !== c.name && r.name.startsWith(own)
      && r.types.join() === types.join() && !this.changed.has(`assert ${r.name}`) && !this.changed.has(`retract ${r.name}`)
      && this.world.test({ ...c, name: r.name }));
  }
  // The facts a life begins with (data/origins/<id>/origin.kyr's `Initially Assert`): a drawn world holds the origin
  // its company chose, so an act that waits on another's (the fever's mother_sent, on expects(mother, party), the
  // herb-wife's errand) is a choice made at creation, not one nothing makes.
  private static origins?: Set<string>;
  static begun(dir = join(import.meta.dir, '../../data/origins')): ReadonlySet<string> {
    if (this.origins) { return this.origins; }
    const files = existsSync(dir) ? readdirSync(dir).map(d => join(dir, d, 'origin.kyr')).filter(f => existsSync(f)) : [];
    const text = files.map(f => readFileSync(f, 'utf8')).join('\n');
    this.origins = new Set([...text.matchAll(/Initially Assert (\w+)\(/g)].map(m => m[1]!));
    return this.origins;
  }
  // Every relation an act or a rule of the module asserts or retracts somewhere, as "assert name", "retract name".
  static changed(module: Module): Set<string> {
    const text = JSON.stringify([module.actions, module.rules ?? []]);
    return new Set([...text.matchAll(/"kind":"(assert|retract)","call":\{"kind":"call","name":"([^"]+)"/g)]
      .map(m => `${m[1]} ${m[2]}`));
  }
  private static held(p: Predicate): (readonly [Call, boolean])[] {
    if (p.kind === 'call') { return [[p, false]]; }
    if (p.kind === 'not') { return p.value.kind === 'call' ? [[p.value, true]] : []; }
    return p.kind === 'and' ? [...this.held(p.left), ...this.held(p.right)] : [];
  }
}
