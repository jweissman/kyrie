// `kyrie preview <campaign.json>`: the author's loop. It lints the campaign, builds the reader with the campaign's
// files, serves it, and on every save under data/ or the campaign's own directory lints and builds again, and the
// open page reloads. A module that does not load is reported with its file and line, and the page keeps the last
// build that loaded.
import { watch } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { KyrLint, type Finding } from './kyr-lint';
import { SiteBuild } from './site-build';
import { NodeBundleSource } from '../campaign/node-bundle-source';

export class Preview {
  private stamp = '';
  private pending?: ReturnType<typeof setTimeout>;
  private building = false;
  constructor(private readonly campaign: string, private readonly out: string) {}
  static async main(args: string[]) {
    const path = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--port');
    if (!path) { console.log('kyrie preview <campaign.json> [--port 8080]'); return; }
    const port = Number(args[args.indexOf('--port') + 1] ?? 0) || 8080;
    const preview = new Preview(relative(SiteBuild.root, resolve(path)), join(tmpdir(), 'kyrie-preview'));
    preview.serve(port);
    await preview.build();
    preview.watch();
    console.log(`Previewing http://localhost:${port}/?campaign=${encodeURIComponent(preview.campaign)}`);
  }
  // The campaign's directory, when it is not already under data/, which every build carries.
  get dirs(): string[] {
    const dir = dirname(this.campaign);
    return dir === 'data' || dir.startsWith('data/') ? [] : [dir];
  }
  async build(): Promise<void> {
    if (this.building) { this.soon(); return; }
    this.building = true;
    const started = performance.now();
    try {
      const findings = await this.lint();
      for (const f of findings) { console.log(`  ${f.level} ${f.check}: ${f.message}`); }
      if (findings.some(f => f.level === 'error')) { console.log('Not rebuilt; the page keeps the last build.'); return; }
      await SiteBuild.preview(this.out, this.dirs);
      this.stamp = String(Date.now());
      console.log(`Linted and built in ${Math.round(performance.now() - started)} ms, ${findings.length} findings.`);
    } finally { this.building = false; }
  }
  private async lint(): Promise<Finding[]> {
    try { return await KyrLint.campaign(this.campaign, new NodeBundleSource()); } catch (error) {
      return [{ level: 'error', check: 'load', where: this.campaign, message: (error as Error).message }];
    }
  }
  serve(port: number) { Bun.serve({ port, fetch: this.respond.bind(this) }); }
  // The page asks for the stamp every second, and reloads when it changes.
  private respond(request: Request): Response | Promise<Response> {
    return new URL(request.url).pathname === '/__stamp' ? new Response(this.stamp) : SiteBuild.serve(this.out, request);
  }
  watch() {
    for (const dir of ['data', ...this.dirs]) {
      watch(join(SiteBuild.root, dir), { recursive: true }, (_event, file) => {
        if (file && /\.(kyr|json)$/.test(file)) { this.soon(); }
      });
    }
  }
  private soon() {
    clearTimeout(this.pending);
    this.pending = setTimeout(() => { void this.build(); }, 250);
  }
}

