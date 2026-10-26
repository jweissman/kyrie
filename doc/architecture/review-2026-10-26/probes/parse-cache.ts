// Probe: ModuleParser memoises by text, but its output reads the process-global item catalog.
import { ModuleParser } from '../../../../src/lang/module-parser';
import { LocalKinds } from '../../../../src/canon/local-catalog';
const kinds = (name: string) => `Module a "A" {\n  Kind gem "${name}" is treasure worth 5 weighing 1.\n}\n`;
const b = `Module b "B" {\n  Place hall "a hall" is room.\n  Item g is gem at hall.\n}\n`;
const nameIn = (text: string) => ModuleParser.parse(text).entities.find(e => e.id === 'g')?.name;
ModuleParser.parse(kinds('red gem'));            // scenario 1 declares gem
console.log('scenario 1, B:            ', nameIn(b));
LocalKinds.reset();                              // a new campaign begins with the catalogs as they are
ModuleParser.parse(kinds('blue gem'));           // scenario 2 declares its own gem
console.log('scenario 2, B (cached):   ', nameIn(b));
console.log('scenario 2, B (fresh text):', nameIn(b + ' '));
