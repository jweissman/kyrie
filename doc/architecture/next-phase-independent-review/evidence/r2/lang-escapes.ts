// Kyr string escapes: the grammar accepts a backslash before any character, the parser hands the text to JSON.parse.
// Usage: bun lang-escapes.ts
import { ModuleParser } from '../../../../../src/lang/module-parser';
for (const s of [String.raw`"plain \"quoted\" text"`, String.raw`"it\'s late"`, String.raw`"a sign: \{closed\}"`, String.raw`"tab\x41"`]) {
  try { const m = ModuleParser.parse(`Module e "E" {\n  Description ${s}.\n}`); console.log(`${s.padEnd(28)} -> ${JSON.stringify(m.description)}`); }
  catch (e) { console.log(`${s.padEnd(28)} -> ${(e as Error).constructor.name}: ${(e as Error).message.split('\n')[0]}`); }
}
