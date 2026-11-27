import { AssetCatalog } from './asset-catalog';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { PluginBuilder } from 'bun';
import { Handbooks } from '../handbook/handbooks';
import { HandbookPublisher } from '../handbook/publish';
import { BuildStamp } from '../session/build-stamp';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Ident } from '../../web/reader/ident';
import { Identity } from '../presentation/identity';
import { BookPresentationForPlayer } from '../presentation/book-presentation';
import { CanonVocabulary } from '../canon/canon-vocabulary';
import { CatalogContext } from '../item-catalog';

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
  // The engine runs in a worker, from a script of its own beside the page's (see EngineClient and worker()).
  // A build for browser tests also carries the test fixtures, so a test can play one, and an author's preview carries
  // the campaign's own directory; the bundle on disk carries data/ alone.
  static async engine(minify: boolean, dirs: string[] = []): Promise<string> {
    await AssetCatalog.write(this.root);
    const files = dirs.length ? await AssetCatalog.files(this.root, ['data', ...dirs]) : undefined;
    const result = await Bun.build({ entrypoints: [join(this.root, 'web/engine/engine-worker.ts')], target: 'browser',
      format: 'iife', minify, plugins: [{ name: 'single-ohm', setup: SiteBuild.singleOhm },
        ...files ? [{ name: 'fixtures', setup: SiteBuild.fixtures.bind(SiteBuild, files) }] : []],
      define: { 'process.env.NODE_ENV': '"production"', KYRIE_BUILD: JSON.stringify(BuildStamp.placeholder),
        KYRIE_ENGINE_COMMIT: JSON.stringify(BuildStamp.committed) } });
    if (!result.success) { throw new AggregateError(result.logs, 'Engine build failed'); }
    // The build is known by the engine it built: code and data hashed together, and written in where it is asked.
    // The commit is written in after (BuildStamp.commit): the stamp is the engine's, not the commit's.
    const text = await result.outputs[0]!.text();
    const stamp = new Bun.CryptoHasher('sha256').update(text).digest('hex').slice(0, 16);
    return text.replaceAll(BuildStamp.placeholder, stamp).replaceAll(BuildStamp.committed, SiteBuild.commit());
  }
  static fixtures(files: Record<string, string>, build: PluginBuilder) {
    build.onLoad({ filter: /bundles\.generated\.json$/ }, () => ({ contents: JSON.stringify(files), loader: 'json' }));
  }
  static async reader(out: string, minify = true, dirs: string[] = []) {
    const engine = SiteBuild.worker(await this.engine(minify, dirs));
    await writeFile(join(out, 'engine.js'), engine);
    const result = await Bun.build({ entrypoints: [join(this.root, 'web/reader/reader-main.tsx')], target: 'browser',
      format: 'iife', outdir: out, naming: 'mono.js', minify, sourcemap: minify ? 'linked' : 'none',
      define: { 'process.env.NODE_ENV': '"production"', KYRIE_COMMIT: JSON.stringify(SiteBuild.commit()),
        KYRIE_DEV: JSON.stringify(!minify) } });
    if (!result.success) { throw new AggregateError(result.logs, 'Reader build failed'); }
    const board = await Bun.build({ entrypoints: [join(this.root, 'web/reader/board/board-main.ts')], target: 'browser',
      format: 'iife', outdir: out, naming: 'board.js', minify });
    if (!board.success) { throw new AggregateError(board.logs, 'Board build failed'); }
    return result.outputs.reduce((sum, o) => sum + o.size, engine.length);
  }
  // The engine's script: run where it is a worker's (served, the worker loads it by its address); read in as a script
  // by a page from file://, it only names its body, which the page starts a worker from (see EngineClient).
  static worker(engine: string): string {
    return `self.kyrieEngine=function(){${engine}\n};if(typeof importScripts==="function"){self.kyrieEngine();}\n`;
  }
  // The commit built (CI's, else the checkout's), shown on the title page and in version.json.
  static commit(): string {
    const sha = process.env.GITHUB_SHA ?? Bun.spawnSync(['git', 'rev-parse', 'HEAD'], { cwd: this.root }).stdout.toString();
    return sha.trim().slice(0, 8) || 'local';
  }
  static async site(out: string, options: { fixtures?: boolean } = {}) {
    await rm(out, { recursive: true, force: true });
    await mkdir(out, { recursive: true });
    const size = await this.reader(out, true, options.fixtures ? ['test/fixtures'] : []);
    await this.page(out, '');
    await writeFile(join(out, '.nojekyll'), '');
    await writeFile(join(out, 'version.json'), `${JSON.stringify({ commit: this.commit(), built: new Date().toISOString() })}\n`);
    const handbooks = new Handbooks(this.root, CanonVocabulary.context(), CatalogContext.canon);
    await HandbookPublisher.html(handbooks, join(out, 'handbook'), BookPresentationForPlayer.value);
    await HandbookPublisher.encyclopedia(handbooks, join(out, 'encyclopedia'), BookPresentationForPlayer.value);
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
  // The page's stylesheets, in the order index.html links them: the foundations every phase shares (faces, colours,
  // type, surfaces, the shared controls); the lantern's ground, choices and books; the shell, title and creation; then
  // each composition of play; then the light the company carries, over all of them.
  static readonly sheets = ['foundations.css', 'reader.css', 'frame.css', 'stage.css', 'glance.css', 'world.css',
    'rest.css', 'talk.css', 'fight.css', 'book.css', 'light.css', 'menu.css', 'look.css', 'row.css', 'creation.css',
    'folio.css', 'scale.css'];
  // The page, its title the game's name (src/presentation/identity.ts) and the given script before its end.
  private static async page(out: string, script: string) {
    const html = (await readFile(join(this.root, 'web/reader/index.html'), 'utf8'))
      .replace(/<title>[^<]*<\/title>/, `<title>${Identity.spoken()}</title>`).replace('</body>', `${script}</body>`)
      .replace('<body>', `<body>${SiteBuild.early}${SiteBuild.mark()}`);
    for (const name of ['index.html', 'mono.html']) { await writeFile(join(out, name), html); }
    for (const sheet of SiteBuild.sheets) { await cp(join(this.root, 'web/reader', sheet), join(out, sheet)); }
    await cp(join(this.root, 'web/reader/fonts'), join(out, 'fonts'), { recursive: true });
    await cp(join(this.root, 'web/reader/paintings'), join(out, 'paintings'), { recursive: true });
  }
  // The studio's mark in the page itself, drawn by its stylesheet from the first frame while the script is fetched and
  // read beneath it (the owner, 16 November: a blank screen, then a long wait, before the mark); the title takes it up
  // where it has got to (TitlePage.useBeat). Where it is not to be played, a few words of script put it away before
  // anything is painted: seen already this session, less motion asked for, automation, another studio asked for.
  static mark(): string {
    return renderToStaticMarkup(createElement(Ident.View, { studio: Identity.studio }))
      .replace('<div class="ident"', '<div class="ident" id="pre-ident"');
  }
  static readonly early = '<script>(function(){var q=location.search,a=/[?&]ident\\b/.test(q),seen=false;'
    + 'try{seen=sessionStorage.getItem("kyrie.ident")==="1";}catch(e){}'
    + 'if(matchMedia("(prefers-reduced-motion: reduce)").matches||/[?&]studio=/.test(q)||(navigator.webdriver&&!a)'
    + '||(seen&&!a)){document.documentElement.className+=" no-pre-ident";}})();</script>';
  static async serve(out: string, request: Request): Promise<Response> {
    const path = resolve(out, new URL(request.url).pathname.replace(/^\/+/, '') || 'index.html');
    const file = Bun.file(path);
    return path.startsWith(out) && await file.exists() ? new Response(file) : new Response('Not found', { status: 404 });
  }
}
