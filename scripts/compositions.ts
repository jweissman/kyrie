#!/usr/bin/env bun
// Builds the composition prototypes of Priority III (AESTHETICS §7): plays the wren record through the page's own
// engine, as journey-profile does, keeps the frames of the six moments' beats, and bundles three ways of composing
// them beside those frames, as a static page that works from file://. `--serve` previews it.
//   bun scripts/compositions.ts [--serve]          (writes site/compositions, or $KYRIE_SITE_DIR)
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { EngineHost } from '../web/engine/engine-host';
import { Creation } from '../web/engine/creation';
import type { Frame, Message } from '../web/engine/protocol';
import type { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { SiteBuild } from '../src/cli/site-build';
import { Moments } from '../web/compositions/moments';

export interface Recorded { steps: Record<number, { said: string; id: string }>; frames: Record<number, Frame>;
  fights: Record<number, Frame[]> }

type Inner = { session: PlaySession; saving: () => void };

export class CompositionBuild {
  static readonly root = SiteBuild.root;
  static async record(): Promise<Recorded> {
    const keep = new Set(Moments.steps()), last = Math.max(...keep) + 1;
    const out: Recorded = { steps: {}, frames: {}, fights: {} };
    let fights: Frame[] = [];
    const host: EngineHost = new EngineHost(CompositionBuild.watch.bind(CompositionBuild, () => host,
      f => fights.push(f)));
    const inner = host as unknown as Inner;
    inner.saving = CompositionBuild.ignore;
    out.frames[0] = await host.handle({ kind: 'begin', campaign: Creation.generated, seed: Moments.seed,
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }], origin: 'wanderer' }) as Frame;
    const lines = (await readFile(join(this.root, 'test/fixtures/descent/wren.choices'), 'utf8')).split('\n')
      .filter(Boolean);
    for (let n = 1; n <= last; n++) {
      const re = new RegExp(lines[n - 1]!, 'i'), campaign = inner.session.campaign;
      const c = PlayerView.choices(campaign).find(x => re.test(x.choice.name));
      if (!c) { throw new Error(`The wren record has no choice for step ${n}: ${lines[n - 1]}`); }
      fights = [];
      const frame = await host.handle({ kind: 'perform', command: c.choice.id, said: c.choice.name, move: false });
      out.steps[n] = { said: c.choice.name, id: c.choice.id };
      if (keep.has(n)) { out.frames[n] = frame as Frame; if (fights.length) { out.fights[n] = fights; } }
    }
    return out;
  }
  // A fight in the record is fought as the page's T fights it: each of the company's turns left to them.
  static watch(host: () => EngineHost, fought: (f: Frame) => void, m: Message) {
    if (m.kind !== 'frame' || !m.frame.combat?.ours) { return; }
    fought(m.frame);
    setTimeout(() => void host().handle({ kind: 'fight' }), 0);
  }
  static ignore() { /* the prototypes keep no game */ }
  static async build(out: string) {
    await rm(out, { recursive: true, force: true });
    await mkdir(out, { recursive: true });
    const recorded = await this.record();
    await writeFile(join(out, 'frames.js'), `window.KYRIE_RECORD = ${JSON.stringify(recorded)};`);
    const result = await Bun.build({ entrypoints: [join(this.root, 'web/compositions/compositions-main.tsx')],
      target: 'browser', format: 'iife', outdir: out, naming: 'compositions.js', minify: false,
      define: { 'process.env.NODE_ENV': '"production"' } });
    if (!result.success) { throw new AggregateError(result.logs, 'Compositions build failed'); }
    for (const name of ['index.html', 'compositions.css']) {
      await cp(join(this.root, 'web/compositions', name), join(out, name));
    }
    await cp(join(this.root, 'web/reader/fonts'), join(out, 'fonts'), { recursive: true });
    await this.paintings(recorded, out);
    return out;
  }
  // Only the paintings the six moments show are copied: the portraits of whoever is there.
  static async paintings(recorded: Recorded, out: string) {
    const used = new Set(Object.values(recorded.frames).flatMap(f => f.screen.people.flatMap(p => p.portrait
      ? [p.portrait.src, p.portrait.large] : [])));
    await mkdir(join(out, 'paintings/large'), { recursive: true });
    for (const src of used) { await cp(join(this.root, 'web/reader', src), join(out, src)); }
  }
}

if (import.meta.main) {
  process.chdir(CompositionBuild.root);
  const out = await CompositionBuild.build(resolve(CompositionBuild.root, process.env.KYRIE_SITE_DIR ?? 'site',
    'compositions'));
  console.log(`Built ${out}`);
  if (process.argv.includes('--serve')) {
    const port = Number(process.env.PORT ?? 8081);
    Bun.serve({ port, fetch: SiteBuild.serve.bind(SiteBuild, out) });
    console.log(`Previewing http://localhost:${port}/`);
  }
}
