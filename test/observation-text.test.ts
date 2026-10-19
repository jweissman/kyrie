import { expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ModuleWriter } from '../src/lang/module-writer';
import { World } from '../src/lang/world';
import { ObservationText } from '../src/lang/observation-text';

it('type-checks, scopes and renders numeric observations from authoritative state', () => {
  const source = `Module clocks "Clocks" { Kind place. Kind clock. Measure watch(clock).
    Entity yard: place "Yard". Entity clock: clock "Clock".
    Observe time at yard when true "The dial reads {watch(clock)}.". Goal false. }`;
  const module = ModuleParser.parse(source), compiler = new ModuleCompiler();
  compiler.validate(module);
  const world = new World(module).apply([{ kind: 'set', call: ModuleWriter.call('watch', 'clock'),
    value: ModuleWriter.number(12) }]);
  expect(ObservationText.render(module.observations![0]!.text, world)).toBe('The dial reads 12.');
  expect(ObservationText.scope('At {watch(clock)}', call => ({ ...call, args: ['other_clock'] })))
    .toBe('At {watch(other_clock)}');
  expect(() => compiler.validate(ModuleParser.parse(source.replace('{watch(clock)}', '{watch(yard)}'))))
    .toThrow('Invalid argument');
  expect(() => compiler.validate(ModuleParser.parse(source.replace('{watch(clock)}', '{unknown(clock)}'))))
    .toThrow('Unknown function');
});
