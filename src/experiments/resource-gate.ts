import { buildSetting, Generator, Template } from 'deem';
import tables from '../../data/experiments/gate.tables.json';
import templates from '../../data/experiments/gate.templates.json';
import source from '../../data/experiments/resource-gate.kyr' with { type: 'text' };
import { ModuleParser } from '../lang/module-parser';
import { ModuleCompiler } from '../lang/module-compiler';
import { ModuleWriter } from '../lang/module-writer';
import { World } from '../lang/world';
import type { Change, Module, Operator, Predicate, WorldState } from '../lang/module';

export type Actor = 'provider' | 'beneficiary' | 'party';
export type Good = 'gold' | 'filter' | 'coal' | 'grain' | 'water' | 'raw_water';
export type GateCommand =
  | { kind: 'transfer'; actor: 'party' | 'beneficiary'; good: Good; amount: number }
  | { kind: 'activate' | 'perform'; actor: Actor };
export interface GateSituation {
  provider: string; beneficiary: string; asset: string;
  requiredGood: Good; requiredAmount: number; mode: 'receipt' | 'install';
  output: Good; recipe: 'carry_grain' | 'purify_water'; operator: 'provider' | 'beneficiary';
  initial: Record<Actor | 'source', Partial<Record<Good, number>>>;
  deadline: number; constraint: 'anytime' | 'late_shift';
  control: { holder: string; asset: string };
  term: { creditor: string; debtor: string; asset: string; resource: Good; amount: number; mode: string };
  need: { party: string; resource: Good; amount: number; deadline: number; onMiss: string };
  operation: { notBefore: number; recipe: string; operator: string };
}
export interface Development { kind: 'enabled' | 'provisioned' | 'shortfall'; watch: number }

// Isolated mechanics experiment: these threshold controllers are not symbolic NPC planners.
export class ResourceGate {
  private static readonly setting = buildSetting(tables, templates);
  private static readonly goods: Good[] = ['gold', 'filter', 'coal', 'grain', 'water', 'raw_water'];
  private static readonly recipes = {
    carry_grain: { inputs: [['source', 'grain']], output: 'grain' },
    purify_water: { inputs: [['source', 'raw_water'], ['provider', 'coal']], output: 'water' },
  } as const;
  readonly module: Module;
  private current: World;
  private commands: { watch: number; command: GateCommand }[] = [];
  private history: WorldState[] = [];
  private developments: Development[] = [];
  private seen = new Set<string>();
  readonly situation: GateSituation;
  constructor(situation: GateSituation, private observers = true) {
    ResourceGate.validate(situation);
    this.situation = structuredClone(situation);
    const module = ModuleParser.parse(source);
    for (const [id, name] of [['provider', situation.control.holder], ['beneficiary', situation.need.party],
      ['capability', situation.control.asset]]) { module.entities.find(e => e.id === id)!.name = name!; }
    for (const [owner, stock] of Object.entries(situation.initial)) {
      for (const [good, amount] of Object.entries(stock)) {
        module.initial.push(ResourceGate.change('set', 'quantity', [owner, good], amount!));
      }
    }
    module.initial.push({ kind: 'assert', call: ModuleWriter.call('permitted', situation.operator, 'capability') });
    module.goal = ResourceGate.compare('delivered', ['need'], '>=', situation.need.amount);
    module.budget = ModuleWriter.number(situation.deadline);
    const instance = new ModuleCompiler().instantiate(module, 'gate-lowering');
    this.module = instance.module;
    this.current = new World(this.module, instance.world);
  }
  static generate(context: { profile: 'bridge' | 'pump'; deadline?: number;
    constraint?: 'anytime' | 'late_shift' }, seed = 'gate'): GateSituation {
    const runtime = Template.bootstrapDeem({ seed }, ResourceGate.setting);
    const generated = Generator.gen('resource_gate', {
      ...context, __setting: ResourceGate.setting, __deemRuntime: runtime,
    }) as unknown as GateSituation;
    ResourceGate.validate(generated);
    return generated;
  }
  static validate(s: GateSituation) {
    const recipe = ResourceGate.recipes[s.recipe];
    if (!recipe || recipe.output !== s.output || !['receipt', 'install'].includes(s.mode)
      || !['provider', 'beneficiary'].includes(s.operator)
      || !Object.hasOwn(tables.operatingConstraint.groups, s.constraint)
      || !ResourceGate.goods.includes(s.requiredGood)
      || ![s.requiredAmount, s.need.amount, s.deadline].every(n => Number.isSafeInteger(n) && n > 0)
      || !Number.isSafeInteger(s.operation.notBefore) || s.operation.notBefore < 0
      || ![s.provider, s.beneficiary, s.asset].every(id => typeof id === 'string' && id.length)
      || new Set([s.provider, s.beneficiary, s.asset]).size !== 3
      || s.control.holder !== s.provider || s.control.asset !== s.asset
      || s.term.creditor !== s.provider || s.term.debtor !== s.beneficiary || s.term.asset !== s.asset
      || s.term.resource !== s.requiredGood || s.term.amount !== s.requiredAmount || s.term.mode !== s.mode
      || s.need.party !== s.beneficiary || s.need.resource !== s.output || s.need.deadline !== s.deadline
      || s.need.onMiss !== 'record_deficit' || s.operation.recipe !== s.recipe
      || s.operation.operator !== s.operator
      || (s.recipe === 'purify_water' && (s.mode !== 'install' || s.requiredGood !== 'filter'
        || s.requiredAmount < 2))) { throw new Error('Invalid resource-gate situation'); }
    const owners = ['provider', 'beneficiary', 'party', 'source'];
    if (Object.keys(s.initial).length !== owners.length || owners.some(owner => !Object.hasOwn(s.initial, owner))) {
      throw new Error('Invalid stock owners');
    }
    for (const stock of Object.values(s.initial)) {
      for (const [good, amount] of Object.entries(stock)) {
        if (!ResourceGate.goods.includes(good as Good) || !Number.isSafeInteger(amount) || amount! < 0) {
          throw new Error('Invalid stock');
        }
      }
    }
  }
  get world(): World { return new World(this.module, this.current.snapshot); }
  private static compare(name: string, args: string[], operator: '>=' | '<', value: number): Predicate {
    return { kind: 'compare', operator, left: ModuleWriter.call(name, ...args), right: ModuleWriter.number(value) };
  }
  private static change(kind: 'set' | 'increase' | 'decrease', name: string, args: string[], amount: number): Change {
    return { kind, call: ModuleWriter.call(name, ...args), value: ModuleWriter.number(amount) };
  }
  private quantity(owner: string, good: Good) { return this.current.number(ModuleWriter.call('quantity', owner, good)); }
  private value(name: string, ...args: string[]) { return this.current.number(ModuleWriter.call(name, ...args)); }
  private bind(command: GateCommand): Operator {
    if (!['transfer', 'activate', 'perform'].includes(command.kind)
      || !['party', 'provider', 'beneficiary'].includes(command.actor)) { throw new Error('Unknown command'); }
    const s = this.situation;
    const requires: Predicate[] = [ModuleWriter.call('at', command.actor, 'site')];
    const changes: Change[] = [];
    if (command.kind === 'transfer') {
      if (!['party', 'beneficiary'].includes(command.actor) || !Number.isSafeInteger(command.amount)
        || command.amount < 1) { throw new Error('Invalid transfer'); }
      requires.push(ModuleWriter.call('at', 'provider', 'site'),
        ResourceGate.compare('quantity', [command.actor, command.good], '>=', command.amount));
      changes.push(ResourceGate.change('decrease', 'quantity', [command.actor, command.good], command.amount),
        ResourceGate.change('increase', 'quantity', ['provider', command.good], command.amount));
      if (command.good === s.term.resource) {
        changes.push(ResourceGate.change('increase', 'received', ['term'], command.amount));
      }
    } else if (command.kind === 'activate') {
      requires.push(ModuleWriter.call('controls', command.actor, 'capability'),
        { kind: 'not', value: ModuleWriter.call('enabled', 'capability') },
        ResourceGate.compare('received', ['term'], '>=', s.term.amount));
      if (s.term.mode === 'install') {
        requires.push(ResourceGate.compare('quantity', ['provider', s.term.resource], '>=', s.term.amount));
        changes.push(ResourceGate.change('decrease', 'quantity', ['provider', s.term.resource], s.term.amount),
          { kind: 'assert', call: ModuleWriter.call('installed', 'capability') });
      }
      changes.push({ kind: 'assert', call: ModuleWriter.call('enabled', 'capability') });
    } else {
      requires.push(ModuleWriter.call('permitted', command.actor, 'capability'),
        ModuleWriter.call('enabled', 'capability'),
        ResourceGate.compare('watch', ['clock'], '>=', s.operation.notBefore),
        ResourceGate.compare('delivered', ['need'], '<', s.need.amount));
      if (s.recipe === 'purify_water') { requires.push(ModuleWriter.call('installed', 'capability')); }
      for (const [owner, good] of ResourceGate.recipes[s.recipe].inputs) {
        requires.push(ResourceGate.compare('quantity', [owner, good], '>=', 1));
        changes.push(ResourceGate.change('decrease', 'quantity', [owner, good], 1));
      }
      changes.push(ResourceGate.change('increase', 'quantity', ['beneficiary', s.output], 1),
        ResourceGate.change('increase', 'delivered', ['need'], 1));
    }
    const action: Operator = { id: command.kind, name: command.kind, description: 'Grounded shared schema',
      requires: requires.reduce((left, right) => ({ kind: 'and', left, right })),
      success: changes, failure: [], cost: 1, time: 1 };
    new ModuleCompiler().validate({ ...this.module, actions: [action] });
    return action;
  }
  legal(command: GateCommand): boolean {
    const action = this.bind(command);
    return this.current.test(action.requires);
  }
  execute(command: GateCommand) {
    const action = this.bind(command);
    if (!this.current.test(action.requires)) { throw new Error(`Ineligible ${command.kind}`); }
    const next = this.current.apply(action.success);
    this.current = next;
    this.commands.push({ watch: this.value('watch', 'clock'), command: structuredClone(command) });
    this.record();
  }
  private record() {
    this.history.push(this.current.snapshot);
    if (!this.observers) { return; }
    const flags = [
      ['enabled', this.current.test(ModuleWriter.call('enabled', 'capability'))],
      ['provisioned', this.value('delivered', 'need') >= this.situation.need.amount],
      ['shortfall', this.value('deficit', 'need') > 0],
    ] as const;
    for (const [kind, active] of flags) {
      if (active && !this.seen.has(kind)) {
        this.seen.add(kind); this.developments.push({ kind, watch: this.value('watch', 'clock') });
      }
    }
  }
  private providerTurn() {
    for (const kind of ['activate', 'perform'] as const) {
      const command = { kind, actor: 'provider' as const };
      if (this.legal(command)) { this.execute(command); return; }
    }
  }
  private beneficiaryTurn() {
    const s = this.situation;
    if (this.value('delivered', 'need') >= s.need.amount) { return; }
    const missing = Math.max(0, s.term.amount - this.value('received', 'term'));
    const amount = Math.min(missing, this.quantity('beneficiary', s.term.resource));
    const command: GateCommand = amount ?
      { kind: 'transfer', actor: 'beneficiary', good: s.term.resource, amount } :
      { kind: 'perform', actor: 'beneficiary' };
    if (this.legal(command)) { this.execute(command); }
  }
  run(tape: Record<number, GateCommand> = {}, through = this.situation.deadline) {
    if (!Number.isSafeInteger(through) || through < this.value('watch', 'clock')) { throw new Error('Invalid horizon'); }
    for (let watch = this.value('watch', 'clock') + 1; watch <= through; watch++) {
      this.current = this.current.apply([ResourceGate.change('set', 'watch', ['clock'], watch)]);
      this.record();
      if (tape[watch]) { this.execute(tape[watch]!); }
      this.providerTurn(); this.beneficiaryTurn();
      if (watch >= this.situation.deadline && !this.current.test(ModuleWriter.call('deadlineRecorded', 'need'))) {
        this.current = this.current.apply([
          ResourceGate.change('set', 'deficit', ['need'], Math.max(0, this.situation.need.amount
            - this.value('delivered', 'need'))),
          { kind: 'assert', call: ModuleWriter.call('deadlineRecorded', 'need') },
        ]);
        this.record();
      }
    }
    return { world: this.current.snapshot, commands: structuredClone(this.commands),
      history: structuredClone(this.history), developments: structuredClone(this.developments) };
  }
}
