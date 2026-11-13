// Probe (r2): SaveCodec.pack/unpack round trip with edge content, and what JSON.stringify of a save does to it.
import { SaveCodec } from '../../../../../web/engine/save-codec';
console.log('CompressionStream available:', typeof CompressionStream !== 'undefined');
const cases: [string, string][] = [
  ['empty', ''], ['ascii', 'hello'], ['quotes/backslash', `"\\'\`\n\r\t\u0000`], ['unicode', 'Ælfwynn Þórr 李白 🗡️ ́é ‮rtl'],
  ['astral names', '𝔚𝔢𝔫𝔫𝔞 '.repeat(1000)], ['raw lone surrogate', 'a\ud800b'],
  ['json-escaped lone surrogate', JSON.stringify({ name: 'a\ud800b' })],
  ['mark-prefixed plain text', 'gz1:not really packed'],
  ['40 MB log', JSON.stringify({ log: Array.from({ length: 200000 }, (_, i) => ({ id: i, title: `Entry ${i} — “quoted” ✓`, lines: ['x'.repeat(150)] })) })]];
for (const [name, text] of cases) {
  try {
    const t0 = performance.now(), packed = await SaveCodec.pack(text), back = await SaveCodec.unpack(packed);
    console.log(`${name}: ${text.length} chars -> ${packed.length} packed; lossless=${back === text} (${Math.round(performance.now() - t0)} ms)`);
  } catch (e) { console.log(`${name}: THREW ${(e as Error).message}`); }
}
