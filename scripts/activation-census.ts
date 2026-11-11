#!/usr/bin/env bun
// The content-activation census: for each kind of authored content, how far it gets from the repository into a played
// world, so that stranded content is told apart from content that is merely rare, and intentional dormancy from
// accidental omission (the editorial commission, 10 November 2026). Read-only. Stages:
//   authored       a record or file exists
//   loadable       a loader or registry names it
//   eligible       some generation path can choose it
//   instantiated   a representative generated world actually holds it
// Paintings, creatures, works, items, scenarios and adventures differ at the last stages, so each section says which
// it measures.
//   bun scripts/activation-census.ts [--seeds a,b,c] [--dormant doc/architecture/activation/dormant.json] > census.md
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Canon } from '../src/canon/canon';
import { BestiaryReport } from '../src/cli/bestiary-report';
import { CountriesTool } from '../src/cli/countries-tool';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { SceneKinds } from '../src/ui/scene-kinds';
import { WorldAssembler } from '../src/world/world-assembler';
import type { PlaceRef } from '../src/ui/screen-types';
import countries from '../data/adventures/countries.json';
import scenery from '../data/paintings/scenery.json';
import registry from '../data/paintings/registry.json';
import library from '../data/scenarios/library.json';
import standing from '../data/scenarios/standing.json';
import arts from '../data/generation/history/arts.json';

type Ledger = Record<string, Record<string, string>>;
interface World {
  seed: string; places: { id: string; name: string }[]; plans: Record<string, number>; placed: string[];
  fits: string[]; kinds: Set<string>;
}
interface Country { id: string; bundle?: string; province?: boolean; name: string; herald?: { scenario: string } }
interface Row { k: string; reach: string[]; met: boolean }

class Census {
  static readonly root = join(import.meta.dir, '..');
  static list(dir: string): string[] { return readdirSync(join(this.root, dir)); }
  static read(file: string): string { return readFileSync(join(this.root, file), 'utf8'); }
  static async worlds(seeds: string[]): Promise<World[]> {
    const out: World[] = [];
    for (const seed of seeds) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, {});
      const s = await PlaySession.start(w.path, seed, w.source), plans: Record<string, number> = {};
      const region = w.report.region as unknown as { sites: { work?: { plan: string } }[] };
      for (const site of region.sites) { if (site.work) { plans[site.work.plan] = (plans[site.work.plan] ?? 0) + 1; } }
      const files = (w.source as unknown as { files: Map<string, string> }).files, kinds = new Set<string>();
      for (const text of files.values()) {
        for (const m of text.matchAll(/ is ([a-z][a-z0-9_]*)(?: in | at |\.| hidden)/g)) { kinds.add(m[1]!); }
      }
      out.push({ seed, plans, kinds, placed: w.report.placements.map(p => p.scenario),
        fits: w.report.eligibility.filter(e => e.fits).map(e => e.scenario),
        places: s.campaign.module.entities.filter(e => e.type === 'place').map(e => ({ id: e.id, name: e.name })) });
    }
    return out;
  }
  static bullets(title: string, items: string[], ledger: Record<string, string>): string {
    if (!items.length) { return ''; }
    const body = items.map(i => {
      const why = ledger[i] ?? ledger[i.replace(/^scene-/, '')];
      return why ? `${i} *(dormant: ${why})*` : i;
    }).join(', ');
    return `**${title}** (${items.length}): ${body}\n`;
  }
  // ---- paintings
  static paintings(worlds: World[], dormant: Ledger): string[] {
    const mapped = new Set<string>(), text = JSON.stringify({ ...scenery, about: '' });
    for (const m of text.matchAll(/"([a-z][a-z0-9-]*)"/g)) { mapped.add(m[1]!); }
    const bg = this.list('assets/bg').filter(f => f.endsWith('.png')).map(f => f.slice(0, -4));
    const registered = registry.paintings as { id: string; concept: { kind: string } }[];
    const ids = new Set(registered.map(p => p.id));
    // An owner's painting is imported as scene-<name> (a bare name may be an old master's of the same word).
    const notImported = bg.filter(n => !ids.has(`scene-${n}`));
    const idle = bg.filter(n => ids.has(`scene-${n}`) && !mapped.has(`scene-${n}`));
    const place = registered.filter(p => p.concept.kind === 'place' && !mapped.has(p.id)).map(p => p.id);
    const scenes = place.filter(id => id.startsWith('scene-')), masters = place.filter(id => !id.startsWith('scene-'));
    // What each painting could be shown for, in the sampled worlds: places whose words say a kind that lists it.
    const showers = new Set<string>();
    for (const w of worlds) {
      for (const p of w.places) {
        const kind = SceneKinds.named({ id: p.id, name: p.name } as PlaceRef)?.kind;
        for (const v of [...kind?.ground ?? [], ...kind?.room ?? [], ...Object.values(kind?.parts ?? {}).flat()]) {
          showers.add(v);
        }
      }
    }
    const authored = new Set(Object.values(scenery.places as Record<string, string>));
    const byLand = JSON.stringify({ v: scenery.views, a: scenery.approaches, w: scenery.within, n: scenery.winter });
    const kinds = JSON.stringify(scenery.kinds);
    const never = [...mapped].filter(m => ids.has(m) && !showers.has(m) && !authored.has(m) && !byLand.includes(`"${m}"`)
      && kinds.includes(`"${m}"`));
    const known = dormant.paintings ?? {}, places = worlds.reduce((n, w) => n + w.places.length, 0);
    return ['## Paintings', '',
      `Measured: authored (assets/bg PNGs: ${bg.length}) → imported to the registry (assets/portraits as scene-<name>) → `
      + `mapped (data/paintings/scenery.json) → shown for some place of a sampled world (a kind that lists it, by the `
      + `place's own words; the sample is ${worlds.length} worlds, ${places} places).`, '',
      '| Stage | Count |', '|---|---:|', `| assets/bg paintings | ${bg.length} |`,
      `| imported (in the registry) | ${bg.length - notImported.length} |`,
      `| imported but mapped to nothing | ${idle.length} |`, `| not yet imported | ${notImported.length} |`,
      `| registry scene paintings mapped to nothing | ${scenes.length} |`,
      `| old masters filed as places, mapped to nothing | ${masters.length} |`,
      `| mapped to a kind, but no place of the sample says that kind | ${never.length} |`, '',
      this.bullets('Not yet imported (owner’s paintings awaiting a batch)', notImported, known),
      this.bullets('Imported, mapped to nothing', idle, known),
      this.bullets('Registry scene paintings mapped to nothing', scenes, known),
      this.bullets('Old masters filed as places, mapped to nothing', masters, known),
      this.bullets('Mapped to a kind that no sampled place names', never, known)];
  }
  // ---- creatures
  static async creatures(seeds: string[], dormant: Ledger): Promise<string[]> {
    const met = await BestiaryReport.sample(seeds), kinds = Object.keys(Canon.species).sort();
    const rows: Row[] = kinds.map(k => ({ k, reach: BestiaryReport.reach(k), met: met.has(k) }));
    const generated = new Set(rows.filter(r => r.reach.some(x => ['den', 'open', 'deep'].includes(x))).map(r => r.k));
    const unmet = rows.filter(r => !r.met);
    const stranded = unmet.filter(r => !generated.has(r.k) && !r.reach.includes('authored')
      && !r.reach.includes('summoned')).map(r => r.k);
    const authoredOnly = unmet.filter(r => !generated.has(r.k) && r.reach.includes('authored')).map(r => r.k);
    const summoned = unmet.filter(r => !generated.has(r.k) && !r.reach.includes('authored')
      && r.reach.includes('summoned')).map(r => r.k);
    const eligible = unmet.filter(r => generated.has(r.k)).map(r => r.k);
    // A record that says itself that it lives only in the scene that made it is intentional dormancy by its author.
    const byRecord: Record<string, string> = {};
    for (const k of kinds) {
      const notes = (Canon.creature(k) as unknown as { source?: { notes?: string } }).source?.notes ?? '';
      if (/No habitats are written|no generated (country|den)/i.test(notes)) {
        byRecord[k] = 'its own record says it lives only in the scene that made it';
      }
    }
    const known = { ...byRecord, ...dormant.creatures ?? {} };
    return ['## Creatures', '',
      'Measured: authored (a species record) → eligible (a generation path can choose it: den, open country, deep site; '
      + `from the record's habitats and abundance, as \`bin/kyrie bestiary report\` decides) → instantiated (met in `
      + `${seeds.length} generated worlds). Summoned and authored-only kinds are placed by other means.`, '',
      '| Stage | Kinds |', '|---|---:|', `| species records | ${kinds.length} |`,
      `| met in the sample | ${rows.filter(r => r.met).length} |`,
      `| eligible, not met in the sample (rare or small sample) | ${eligible.length} |`,
      `| authored scenes only | ${authoredOnly.length} |`, `| summoned only | ${summoned.length} |`,
      `| **no path at all** | **${stranded.length}** |`, '',
      this.bullets('No path at all', stranded.map(k => `${k}: ${BestiaryReport.why(k)}`), {}),
      this.bullets('Authored in scenes only', authoredOnly, known), this.bullets('Summoned only', summoned, known),
      this.bullets('Eligible, not met in the sample', eligible, known)];
  }
  // ---- works, items, scenarios, goings-on and situations
  static works(worlds: World[]): string[] {
    const files = this.list('data/generation/works').filter(f => f.endsWith('.kyrt')).map(f => f.replace(/\.kyrt$/, ''));
    const imported = new Set([...this.read('src/world/region-works.ts').matchAll(/works\/([\w_-]+)\.kyrt/g)]
      .map(m => m[1]!));
    const plans = new Set(worlds.flatMap(w => Object.keys(w.plans)));
    const rows = files.map(f => {
      const held = worlds.filter(w => w.plans[f]).length;
      const state = imported.has(f) ? 'registered' : f === 'riddle-door' ? 'section library (RegionRiddles)'
        : '**not registered**';
      return `| ${f} | ${state} | ${held} of ${worlds.length} |`;
    });
    const named = [...Object.values(arts.arts).flatMap(a => a.plans), ...arts.successors.kinds.flatMap(k => k.plans),
      ...arts.imperial.plans];
    const unnamed = files.filter(f => !named.includes(f) && f !== 'riddle-door' && !f.startsWith('great_'));
    return ['## Works (makers’ and successors’ places, `data/generation/works`)', '',
      'Measured: file → registered in `region-works.ts` → named by an art, a successor kind or `imperial` in `arts.json` '
      + '→ present in sampled worlds (a work plan id seen on a site).', '',
      '| Plan file | Registered | Worlds holding one |', '|---|---|---:|', ...rows, '',
      unnamed.length ? `Registered but named by no art, successor kind or imperial list: ${unnamed.join(', ')}.` : '',
      `Plans present in the sample: ${[...plans].sort().join(', ')}.`, ''];
  }
  static items(worlds: World[]): string[] {
    const files = ['arms', 'armour', 'gear', 'consumables', 'wonders', 'valuables', 'gems'];
    const rows = files.map(f => {
      const items = (JSON.parse(this.read(`data/catalog/items/${f}.json`)) as
        { items?: Record<string, { drops?: boolean }> }).items ?? {};
      const ids = Object.keys(items), lootable = ids.filter(i => items[i]!.drops !== false && !i.startsWith('fine_'));
      const seen = lootable.filter(i => worlds.some(w => w.kinds.has(i)));
      return `| ${f} | ${ids.length} | ${lootable.length} | ${seen.length} |`;
    });
    return ['## Items (`data/catalog/items`)', '',
      'Measured: authored (a catalog record) → eligible (the catalog is the loot table: `LootTables` takes every kind '
      + 'with `drops` not false, by the tier its worth puts it in) → placed in the generated text of the sampled '
      + 'worlds (a kind named as an item’s kind). Loot is also drawn as rooms are entered, so this undercounts.', '',
      '| File | Records | Eligible to drop | Placed in the sample |', '|---|---:|---:|---:|', ...rows, ''];
  }
  static scenarios(worlds: World[]): string[] {
    const files = this.list('data/scenarios').filter(f => f.endsWith('.scenario.json'));
    const heralds = (countries.countries as Country[]).flatMap(c => c.herald ? [c.herald.scenario] : []);
    const cities = this.read('data/scenarios/cities.json');
    const listed = new Set([...library.scenarios, ...standing.scenarios]);
    const rows = files.map(f => {
      const id = f.replace(/\.scenario\.json$/, '');
      const how = listed.has(f) ? 'library/standing' : heralds.includes(f) ? 'herald of a country'
        : cities.includes(f) ? 'city-bound (cities.json)' : '**unlisted**';
      return `| ${id} | ${how} | ${worlds.filter(w => w.fits.includes(id)).length} | `
        + `${worlds.filter(w => w.placed.includes(id)).length} |`;
    });
    const goings = this.list('data/goings-on'), situations = this.list('data/situations');
    const texts = files.map(f => this.read(`data/scenarios/${f}`)).join('\n');
    return ['## Scenarios, goings-on and situations', '',
      'Measured: scenario manifest → listed in `library.json`, `standing.json`, a country’s herald or `cities.json` → '
      + 'fits the region context → placed in the sampled worlds.', '',
      `| Scenario | Listed | Worlds it fits | Worlds it is placed in (of ${worlds.length}) |`, '|---|---|---:|---:|', ...rows, '',
      `Goings-on directories not named by any scenario: ${this.unnamed(goings, texts)}. Situations not named by any `
      + `scenario: ${this.unnamed(situations, texts)} (a situation may be installed by another situation’s manifest).`, ''];
  }
  static adventures(seeds: string[]): string[] {
    const dirs = this.list('data/adventures').filter(d => !d.endsWith('.json'));
    const bundles = countries.countries as Country[], placed = new Map<string, number>();
    for (const seed of seeds) {
      for (const line of CountriesTool.seed(seed)) {
        for (const c of bundles) { if (line.includes(c.name)) { placed.set(c.id, (placed.get(c.id) ?? 0) + 1); } }
      }
    }
    const rows = dirs.map(d => {
      const own = bundles.filter(c => c.bundle?.startsWith(`${d}/`));
      const where = own.length ? own.map(c => `${c.id}${c.province ? ' (province)' : ''}`).join(', ') : '**no country**';
      return `| ${d} | ${where} | ${own.length ? `${Math.min(...own.map(c => placed.get(c.id) ?? 0))} of ${seeds.length}` : '—'} |`;
    });
    return ['## Authored adventures (`data/adventures`)', '',
      'Measured: directory → named as a country in `countries.json` → placed in the sampled worlds '
      + '(`bin/kyrie countries`, which a province always satisfies).', '',
      '| Adventure | Country | Placed in |', '|---|---|---:|', ...rows, ''];
  }
  static files(dir: string): string[] {
    return readdirSync(join(this.root, dir), { withFileTypes: true }).flatMap(e => e.isDirectory()
      ? this.files(join(dir, e.name)) : [join(dir, e.name)]);
  }
  // ---- abilities and spells
  static abilities(): string[] {
    const known = (JSON.parse(this.read('data/catalog/abilities.json')) as { abilities: Record<string, unknown> }).abilities;
    const skip = /catalog\/abilities\.json|sources\/orsino|catalog\/orsino/;
    const corpus = ['data/catalog', 'data/generation', 'data/adventures', 'data/goings-on', 'data/rules', 'src']
      .flatMap(d => this.files(d)).filter(f => !skip.test(f) && /\.(json|kyr|kyrt|ts)$/.test(f))
      .map(f => this.read(f)).join('\n');
    const named = Object.keys(known).filter(id => new RegExp(`["' ]${id}["' .,)]`).test(corpus));
    return ['## Abilities and spells (`data/catalog/abilities.json`)', '',
      'Measured: authored (a record) → named by a class, species, item, trait, adventure or rule anywhere outside the '
      + 'catalog file and the Orsino snapshot.', '',
      `${Object.keys(known).length} records; ${named.length} named elsewhere; `
      + `${Object.keys(known).length - named.length} named nowhere: ${Object.keys(known).filter(i => !named.includes(i)).join(', ') || 'none'}.`, ''];
  }
  static async main() {
    const args = process.argv.slice(2), seeds = (this.flag(args, '--seeds') ?? 'kahitude,a1,b2,thorn,c3,d4').split(',');
    const file = this.flag(args, '--dormant') ?? 'doc/architecture/activation/dormant.json';
    const dormant: Ledger = existsSync(join(this.root, file)) ? JSON.parse(this.read(file)) : {};
    const worlds = await this.worlds(seeds);
    const out = ['# Content-activation census', '',
      `Generated by \`bun scripts/activation-census.ts\` over the seeds ${seeds.join(', ')}; reproducible, read-only. `
      + `Dormancy marked *(dormant: …)* is intentional and recorded in \`${file}\` or in the record itself; anything `
      + 'else listed is unaccounted for.', '',
      ...this.paintings(worlds, dormant), '', ...await this.creatures(seeds, dormant), '', ...this.works(worlds),
      ...this.items(worlds), ...this.abilities(), ...this.scenarios(worlds), ...this.adventures(seeds)];
    console.log(out.join('\n'));
  }
  private static unnamed(dirs: string[], texts: string): string {
    return dirs.filter(g => !texts.includes(`/${g}/`)).join(', ') || 'none';
  }
  private static flag(args: string[], name: string): string | undefined {
    return args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
  }
}
await Census.main();
