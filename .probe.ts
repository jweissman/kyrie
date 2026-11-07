import { WorldAssembler } from './src/world/world-assembler';
import { NodeBundleSource } from './src/campaign/node-bundle-source';
const [seed, xs, ys] = process.argv.slice(2);
const first = WorldAssembler.region(seed!, [0, 0]).terrain;
const b = await WorldAssembler.beyond(seed!, NodeBundleSource.shared, { x: Number(xs), y: Number(ys), exclude: [], first });
const files = [...(b.source as unknown as { files: Map<string, string> }).files.entries()];
const text = files.map(([, v]) => v).join('\n');
console.log(seed, xs, ys, b.region.name, 'fever:', b.requests.some(r => /fever/.test(r.bundle)),
  'own-watch:', (text.match(/watch\(clock\) - \d+/g) ?? []).length, 'pumps:', /pumps/.test(text));
