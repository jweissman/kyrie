import { AssetCatalog } from './asset-catalog';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { PluginBuilder } from 'bun';

// Static browser build: classic IIFE scripts plus HTML/CSS with relative URLs, so the site works from file://,
// a domain root, or a GitHub Pages repository subpath. Tests reuse bundle() to execute the browser artifact.
export class SiteBuild {
  static readonly root = resolve(import.meta.dir, '..');
  // DEEM resolves its own ohm-js copy (same version); share one instance instead of shipping two.
  static singleOhm(this: void, build: PluginBuilder) {
    const ohm = Bun.resolveSync('ohm-js', SiteBuild.root);
    build.onResolve({ filter: /^ohm-js$/ }, () => ({ path: ohm }));
  }
  static async bundle(entry: string, out: string, naming: string, minify = true) {
    await AssetCatalog.write(this.root);
    const result = await Bun.build({
      entrypoints: [join(this.root, entry)], target: 'browser', format: 'iife', outdir: out,
      naming, minify, sourcemap: minify ? 'linked' : 'none', plugins: [{ name: 'single-ohm', setup: SiteBuild.singleOhm }],
    });
    if (!result.success) { throw new AggregateError(result.logs, `Browser build failed for ${entry}`); }
    return result.outputs.reduce((sum, o) => sum + o.size, 0);
  }
  static async site(out: string) {
    await rm(out, { recursive: true, force: true });
    await mkdir(out, { recursive: true });
    const size = await this.bundle('web/mono-main.ts', out, 'mono.js');
    for (const file of ['mono.html', 'mono.css']) { await cp(join(this.root, 'web', file), join(out, file)); }
    await cp(join(this.root, 'web/mono.html'), join(out, 'index.html'));
    await writeFile(join(out, '.nojekyll'), '');
    return size;
  }
  static async serve(out: string, request: Request): Promise<Response> {
    const path = resolve(out, new URL(request.url).pathname.replace(/^\/+/, '') || 'index.html');
    const file = Bun.file(path);
    return path.startsWith(out) && await file.exists() ? new Response(file) : new Response('Not found', { status: 404 });
  }
}
