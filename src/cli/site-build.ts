import { AssetCatalog } from './asset-catalog';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { PluginBuilder } from 'bun';
import { Handbooks } from '../handbook/handbooks';
import { HandbookPublisher } from '../handbook/publish';
import { BuildStamp } from '../session/build-stamp';

// Static browser build: classic IIFE scripts plus HTML/CSS with relative URLs, so the site works from file://,
// a domain root, or a GitHub Pages repository subpath. Tests reuse bundle() to execute the browser artifact.
export class SiteBuild {
  static readonly root = resolve(import.meta.dir, '../..');
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
  // The engine runs in a worker. It is built first and handed to the page's script as text, so the page can start
  // it from a blob, which works from file:// as well as from a server.
  // A build for browser tests also carries the test fixtures, so a test can play one, and an author's preview carries
  // the campaign's own directory; the bundle on disk carries data/ alone.
  static async engine(minify: boolean, dirs: string[] = []): Promise<string> {
    await AssetCatalog.write(this.root);
    const files = dirs.length ? await AssetCatalog.files(this.root, ['data', ...dirs]) : undefined;
    const result = await Bun.build({ entrypoints: [join(this.root, 'web/engine/engine-worker.ts')], target: 'browser',
      format: 'iife', minify, plugins: [{ name: 'single-ohm', setup: SiteBuild.singleOhm },
        ...files ? [{ name: 'fixtures', setup: SiteBuild.fixtures.bind(SiteBuild, files) }] : []],
      define: { 'process.env.NODE_ENV': '"production"', KYRIE_BUILD: JSON.stringify(BuildStamp.placeholder) } });
    if (!result.success) { throw new AggregateError(result.logs, 'Engine build failed'); }
    // The build is known by the engine it built: code and data hashed together, and written in where it is asked.
    const text = await result.outputs[0]!.text();
    const stamp = new Bun.CryptoHasher('sha256').update(text).digest('hex').slice(0, 16);
    return text.replaceAll(BuildStamp.placeholder, stamp);
  }
  static fixtures(files: Record<string, string>, build: PluginBuilder) {
    build.onLoad({ filter: /bundles\.generated\.json$/ }, () => ({ contents: JSON.stringify(files), loader: 'json' }));
  }
  static async reader(out: string, minify = true, dirs: string[] = []) {
    const engine = await this.engine(minify, dirs);
    const result = await Bun.build({ entrypoints: [join(this.root, 'web/reader/reader-main.tsx')], target: 'browser',
      format: 'iife', outdir: out, naming: 'mono.js', minify, sourcemap: minify ? 'linked' : 'none',
      define: { 'process.env.NODE_ENV': '"production"' },
      plugins: [{ name: 'engine-source', setup: SiteBuild.embed.bind(SiteBuild, engine) }] });
    if (!result.success) { throw new AggregateError(result.logs, 'Reader build failed'); }
    return result.outputs.reduce((sum, o) => sum + o.size, 0);
  }
  static embed(engine: string, build: PluginBuilder) {
    build.onResolve({ filter: /^kyrie:engine$/ }, () => ({ path: 'kyrie:engine', namespace: 'kyrie' }));
    build.onLoad({ filter: /.*/, namespace: 'kyrie' },
      () => ({ contents: `export default ${JSON.stringify(engine)};`, loader: 'js' }));
  }
  static async site(out: string, options: { fixtures?: boolean } = {}) {
    await rm(out, { recursive: true, force: true });
    await mkdir(out, { recursive: true });
    const size = await this.reader(out, true, options.fixtures ? ['test/fixtures'] : []);
    await this.page(out, '');
    await writeFile(join(out, '.nojekyll'), '');
    await HandbookPublisher.html(new Handbooks(this.root), join(out, 'handbook'));
    return size;
  }
  // An author's preview: the reader unminified, with the campaign's directories, and a page that reloads itself when
  // the preview server says it has built again.
  static async preview(out: string, dirs: string[]) {
    await mkdir(out, { recursive: true });
    await this.reader(out, false, dirs);
    await this.page(out, '<script>(function(){var seen;setInterval(function(){fetch("__stamp").then(function(r){'
      + 'return r.text();}).then(function(t){if(seen&&t&&t!==seen){location.reload();}seen=t||seen;})'
      + '.catch(function(){});},1000);})();</script>');
  }
  // The page's stylesheets, in the order index.html links them: the lantern's ground, controls and books; the shell,
  // title and creation; then each composition of play.
  static readonly sheets = ['reader.css', 'frame.css', 'stage.css', 'talk.css', 'fight.css', 'book.css'];
  private static async page(out: string, script: string) {
    const html = (await readFile(join(this.root, 'web/reader/index.html'), 'utf8')).replace('</body>', `${script}</body>`);
    for (const name of ['index.html', 'mono.html']) { await writeFile(join(out, name), html); }
    for (const sheet of SiteBuild.sheets) { await cp(join(this.root, 'web/reader', sheet), join(out, sheet)); }
    await cp(join(this.root, 'web/reader/fonts'), join(out, 'fonts'), { recursive: true });
    await cp(join(this.root, 'web/reader/paintings'), join(out, 'paintings'), { recursive: true });
  }
  static async serve(out: string, request: Request): Promise<Response> {
    const path = resolve(out, new URL(request.url).pathname.replace(/^\/+/, '') || 'index.html');
    const file = Bun.file(path);
    return path.startsWith(out) && await file.exists() ? new Response(file) : new Response('Not found', { status: 404 });
  }
}
