import { describe, expect, it } from 'bun:test';
import { ResourceGate, type GateCommand } from '../src/experiments/resource-gate';
import { ModuleWriter } from '../src/lang/module-writer';

const bridgeHelp: Record<number, GateCommand> = {
  1: { kind: 'transfer', actor: 'party', good: 'gold', amount: 2 },
};
const pumpFilters: Record<number, GateCommand> = {
  1: { kind: 'transfer', actor: 'party', good: 'filter', amount: 1 },
};
const pumpHelp: Record<number, GateCommand> = {
  ...pumpFilters, 2: { kind: 'transfer', actor: 'party', good: 'coal', amount: 1 },
};

describe('resource-gated capability experiment (not NPC agency)', () => {
  it.each([
    ['bridge', 6, bridgeHelp, { delivered: 3, deficit: 0 }],
    ['bridge', 6, {}, { delivered: 0, deficit: 3 }],
    ['pump', 5, pumpHelp, { delivered: 3, deficit: 0 }],
    ['pump', 5, pumpFilters, { delivered: 2, deficit: 1 }],
  ] as const)('executes %s through the same schemas with deadline %i', (profile, deadline, tape, expected) => {
    const { delivered, deficit } = expected;
    const generated = ResourceGate.generate({ profile, deadline }, 'resource-gate');
    expect(generated).toEqual(ResourceGate.generate({ profile, deadline }, 'resource-gate'));
    const first = new ResourceGate(generated);
    const result = first.run(tape);
    expect(first.world.number(ModuleWriter.call('delivered', 'need'))).toBe(delivered);
    expect(first.world.number(ModuleWriter.call('deficit', 'need'))).toBe(deficit);
    expect(result).toEqual(new ResourceGate(generated).run(tape));
    const withoutObservers = new ResourceGate(generated, false).run(tape);
    expect(withoutObservers.world).toEqual(result.world);
    expect(withoutObservers.history).toEqual(result.history);
    expect(withoutObservers.commands).toEqual(result.commands);
    expect(withoutObservers.developments).toEqual([]);
    expect(result.developments.some(d => d.kind === 'shortfall')).toBe(deficit > 0);
  });
  it('composes an independent operating constraint without changing the situation profile', () => {
    for (const profile of ['pump', 'bridge'] as const) {
      const context = { profile, deadline: profile === 'pump' ? 5 : 6 };
      const normal = ResourceGate.generate(context, 'composition');
      const late = ResourceGate.generate({ ...context, constraint: 'late_shift' }, 'composition');
      expect(late).toEqual({ ...normal, constraint: 'late_shift', operation: { ...normal.operation, notBefore: 4 } });
      const tape = profile === 'pump' ? pumpHelp : bridgeHelp;
      const first = new ResourceGate(normal), second = new ResourceGate(late);
      const result = first.run(tape), altered = second.run(tape);
      expect(first.world.number(ModuleWriter.call('deficit', 'need'))).toBe(0);
      expect(second.world.number(ModuleWriter.call('deficit', 'need'))).toBe(profile === 'pump' ? 1 : 0);
      expect(result.commands.find(c => c.command.kind === 'perform')!.watch).toBe(profile === 'pump' ? 3 : 2);
      expect(altered.commands.find(c => c.command.kind === 'perform')!.watch).toBe(4);
      if (profile === 'pump') {
        expect(second.world.number(ModuleWriter.call('quantity', 'provider', 'coal'))).toBe(1);
      }
    }
  });
  it('conserves bridge payments and consumes only the registered recipe inputs', () => {
    const bridge = new ResourceGate(ResourceGate.generate({ profile: 'bridge', deadline: 6 }));
    bridge.run(bridgeHelp);
    expect(bridge.world.number(ModuleWriter.call('quantity', 'provider', 'gold'))).toBe(4);
    expect(bridge.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(0);
    expect(bridge.world.number(ModuleWriter.call('quantity', 'beneficiary', 'gold'))).toBe(0);
    expect(bridge.world.number(ModuleWriter.call('quantity', 'source', 'grain'))).toBe(0);
    expect(bridge.world.number(ModuleWriter.call('quantity', 'beneficiary', 'grain'))).toBe(3);
    const pump = new ResourceGate(ResourceGate.generate({ profile: 'pump', deadline: 5 }));
    pump.run(pumpHelp);
    expect(pump.world.test(ModuleWriter.call('installed', 'capability'))).toBe(true);
    for (const owner of ['party', 'beneficiary', 'provider']) {
      expect(pump.world.number(ModuleWriter.call('quantity', owner, 'filter'))).toBe(0);
    }
    expect(pump.world.number(ModuleWriter.call('quantity', 'provider', 'coal'))).toBe(0);
    expect(pump.world.number(ModuleWriter.call('quantity', 'source', 'raw_water'))).toBe(0);
    expect(pump.world.number(ModuleWriter.call('quantity', 'beneficiary', 'water'))).toBe(3);
  });
  it('rejects ineligible commands atomically and does not count unrelated goods as satisfying a term', () => {
    const fixture = new ResourceGate(ResourceGate.generate({ profile: 'pump', deadline: 5 }));
    const before = fixture.world.snapshot;
    for (const command of [
      { kind: 'transfer', actor: 'party', good: 'filter', amount: 2 },
      { kind: 'transfer', actor: 'party', good: 'filter', amount: -1 },
      { kind: 'activate', actor: 'beneficiary' },
      { kind: 'perform', actor: 'provider' },
    ] as const) {
      expect(() => fixture.execute(command)).toThrow();
      expect(fixture.world.snapshot).toEqual(before);
    }
    fixture.execute({ kind: 'transfer', actor: 'party', good: 'coal', amount: 1 });
    expect(fixture.world.number(ModuleWriter.call('received', 'term'))).toBe(0);
    expect(fixture.legal({ kind: 'activate', actor: 'provider' })).toBe(false);
    expect(() => fixture.execute({ kind: 'transfer', actor: 'source' as never, good: 'raw_water', amount: 1 })).toThrow();
    expect(() => fixture.execute({ kind: 'teleport' as never, actor: 'provider' })).toThrow('Unknown');
    const wealthy = ResourceGate.generate({ profile: 'bridge', deadline: 6 });
    wealthy.initial.provider.gold = 4;
    const unrelatedWealth = new ResourceGate(wealthy);
    unrelatedWealth.run();
    expect(unrelatedWealth.world.test(ModuleWriter.call('enabled', 'capability'))).toBe(false);
  });
  it('keeps recorded shortfall after late supply enables the final batch', () => {
    const fixture = new ResourceGate(ResourceGate.generate({ profile: 'pump', deadline: 5 }));
    fixture.run(pumpFilters);
    fixture.run({ 6: { kind: 'transfer', actor: 'party', good: 'coal', amount: 1 } }, 6);
    expect(fixture.world.number(ModuleWriter.call('delivered', 'need'))).toBe(3);
    expect(fixture.world.number(ModuleWriter.call('deficit', 'need'))).toBe(1);
  });
  it('validates generated links and stocks before constructing a world', () => {
    const valid = ResourceGate.generate({ profile: 'bridge', deadline: 6 });
    const invalid = structuredClone(valid);
    invalid.term.creditor = 'someone_else';
    expect(() => new ResourceGate(invalid)).toThrow();
    invalid.term.creditor = valid.term.creditor;
    invalid.initial.party.gold = -1;
    expect(() => new ResourceGate(invalid)).toThrow();
    expect(() => ResourceGate.generate({ profile: 'pump', deadline: 0 })).toThrow();
    const unsafe = ResourceGate.generate({ profile: 'pump', deadline: 5 });
    unsafe.mode = 'receipt'; unsafe.term.mode = 'receipt';
    expect(() => new ResourceGate(unsafe)).toThrow();
  });
});
