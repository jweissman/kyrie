// Probe: build the engine worker as the site does (minified), with an external source map, and sum its sources by
// origin: where do the worker's bytes come from? Usage: bun engine-composition.ts <outdir>
import { SiteBuild } from '../../../../src/cli/site-build';
const out = process.argv[2] ?? 'engine-out';
const r = await Bun.build({ entrypoints: [new URL('../../../../web/engine/engine-worker.ts', import.meta.url).pathname],
  target: 'browser', format: 'iife', minify: true, sourcemap: 'external', outdir: out,
  plugins: [{ name: 'single-ohm', setup: SiteBuild.singleOhm }], define: { 'process.env.NODE_ENV': '"production"' } });
const js = r.outputs.find(o => o.path.endsWith('.js'))!, map = r.outputs.find(o => o.path.endsWith('.map'))!;
console.log(`worker: ${(js.size / 1024).toFixed(0)} KiB minified`);
const m = JSON.parse(await map.text()) as { sources: string[]; sourcesContent: string[] };
const by = new Map<string, number>();
for (const [i, s] of m.sources.entries()) {
  const p = s.replace(/^(\.\.\/)+/, '').split('/'), nm = p.indexOf('node_modules'), src = p.lastIndexOf('src');
  const key = s.startsWith('node:') ? s : nm >= 0 ? `node_modules/${p[nm + 1]}` : src >= 0 ? p.slice(src, src + 2).join('/') : p.slice(-3).join('/');
  by.set(key, (by.get(key) ?? 0) + (m.sourcesContent[i]?.length ?? 0));
}
for (const [k, v] of [...by].sort((a, b) => b[1] - a[1]).slice(0, 16)) { console.log(`${(v / 1024).toFixed(0).padStart(6)} KiB  ${k}`); }
