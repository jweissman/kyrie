import type { BundleSource } from './bundle-source';
import { NodeBundleSource } from './node-bundle-source';
import { OverlayBundleSource } from './overlay-bundle-source';
import type { CreatureGenerationContext } from '../content';
import type { LandChart } from '../lang/module';
import type { CalendarStart } from './calendar';

// A campaign of one Kyr module and nothing else, on the shared rules (Mission 21, Phase 0: the smallest world that
// runs): its manifest and its campaign file made for it, laid over the source it reads the rules from. An author plays
// a bare .kyr with `bin/kyrie play site.kyr` (and inspects it), and a spec starts one from a string
// (test/support/tiny.ts). Its ids are the module's own under `<id>__` (the id it declares, else t); its company must
// be `party`. A hand-drawn chart is the land of its place `region`.
export class SingleModule {
  static source(text: string, options: { id?: string; party?: CreatureGenerationContext[]; rules?: string[];
    chart?: LandChart; base?: BundleSource; calendar?: CalendarStart } = {}):
    { source: BundleSource; campaign: string } {
    // Its id is the one it declares (Module yard "…" { … }), else t.
    const id = options.id ?? /^\s*(?:\/\/[^\n]*\n\s*)*Module\s+([a-z][a-z0-9_]*)/.exec(text)?.[1] ?? 't';
    const base = options.base ?? NodeBundleSource.shared;
    const kyr = /^\s*(\/\/[^\n]*\n\s*)*Module\s/.test(text) ? text : `Module ${id} "A world of one module" {\n${text}\n}`;
    // Each text under its own directory, so that two in one process are never one bundle.
    const dir = `single/${Bun.hash(kyr + JSON.stringify(options.chart ?? '')).toString(36)}`;
    const source = new OverlayBundleSource(base, {
      [`${dir}/site.kyr`]: kyr,
      [`${dir}/module.json`]: JSON.stringify({ version: 1, source: 'site.kyr', rules: options.rules ?? ['world'],
        globals: ['party'], exports: { party: 'party' }, ...options.chart ? { chart: options.chart } : {} }),
      [`${dir}/single.campaign.json`]: JSON.stringify({ version: 1, name: 'A world of one module',
        ...options.calendar ? { calendar: options.calendar } : {},
        modules: [{ id, bundle: 'module.json' }],
        party: options.party ?? [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    return { source, campaign: source.resolve(`${dir}/single.campaign.json`) };
  }
}
