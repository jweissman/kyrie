// A development aid for playtesting the built browser client from scripts: it drives one real Chromium page and
// answers small HTTP requests (press keys, click, evaluate, capture). Nothing in the game depends on it.
//
//   LD_LIBRARY_PATH=… bun scripts/play-server.ts [--port 7359] [--out <capture dir>] [--size 1280x900]
//
//   /goto?q=<query>     open site/index.html<query> with fresh storage     /reload        reload, keeping storage
//   /key?k=a,Enter       press keys in order                               /text?t=Label  click the first matching text
//   /click?s=<selector>  click an element                                  /eval?js=…     evaluate (or POST the script)
//   /size?w=&h=          resize the viewport                                /x             the page's text
//   any request takes wait=<ms> (default 400) and shot=<name> to save <out>/<name>.png and <name>.txt
import { chromium, type Page } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

class PlayServer {
  static readonly args = process.argv.slice(2);
  static readonly site = resolve(import.meta.dir, '../site/index.html');
  static readonly errors: string[] = [];
  static page: Page;
  static out = '';
  static option(name: string, fallback: string): string {
    const i = this.args.indexOf(`--${name}`);
    return i >= 0 ? this.args[i + 1]! : fallback;
  }
  static async start() {
    const port = Number(this.option('port', '7359')), out = resolve(this.option('out', 'scratch/play'));
    const [width, height] = this.option('size', '1280x900').split('x').map(Number) as [number, number];
    mkdirSync(out, { recursive: true });
    const page = this.page = await (await chromium.launch()).newPage({ viewport: { width, height } });
    this.out = out;
    page.on('pageerror', e => this.errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') { this.errors.push(m.text()); } });
    Bun.serve({ port, hostname: '127.0.0.1', fetch: this.fetch.bind(this) });
    console.log(`ready on ${port}, captures in ${out}`);
  }
  static async fetch(req: Request): Promise<Response> {
    try { return await this.handle(req, this.page, this.out); } catch (e) { return new Response(`ERROR ${(e as Error).message}`); }
  }
  static async handle(req: Request, page: Page, out: string): Promise<Response> {
    const u = new URL(req.url), q = u.searchParams;
    switch (u.pathname) {
      case '/goto':
        await page.goto(`file://${this.site}${q.get('q') ?? ''}`);
        await page.evaluate(() => { try { localStorage.clear(); } catch { /* private mode */ } });
        await page.reload(); break;
      case '/reload': await page.reload(); break;
      case '/key':
        for (const k of (q.get('k') ?? '').split(',').filter(Boolean)) { await page.keyboard.press(k); await page.waitForTimeout(120); }
        break;
      case '/text': await page.getByText(q.get('t')!, { exact: q.has('exact') }).first().click(); break;
      case '/click': await page.click(q.get('s')!); break;
      case '/size': await page.setViewportSize({ width: Number(q.get('w')), height: Number(q.get('h')) }); break;
      case '/eval': {
        const script = req.method === 'POST' ? await req.text() : q.get('js')!;
        return new Response(JSON.stringify(await page.evaluate(script), null, 1));
      }
    }
    await page.waitForTimeout(Number(q.get('wait') ?? 400));
    const text = await page.evaluate(() => document.body.innerText);
    const name = q.get('shot');
    if (name) {
      await page.screenshot({ path: `${out}/${name}.png` });
      writeFileSync(`${out}/${name}.txt`, text);
    }
    const reported = this.errors.splice(0);
    return new Response(`${reported.length ? `errors=${JSON.stringify(reported)}\n` : ''}${text}`);
  }
}
await PlayServer.start();
