import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Finding } from './kyr-lint';

// The three places a kind of small site is said (the Kyr requests' R39: a new kind is three edits in three files, and
// one missing from any silently fails to place): which terrains draw it (tables/places.json's siteKind), what its
// names end in (siteNoun), and how it is seen and looks (scenes/sites.json's kinds). A kind in one and not another is
// an error of the repository, said with the file it is missing from.
export interface SiteKindSources { terrains: string[]; nouns: string[]; scenes: string[] }

export class SiteKindLint {
  static readonly files = { terrains: 'data/generation/tables/places.json (siteKind)',
    nouns: 'data/generation/tables/places.json (siteNoun)', scenes: 'data/generation/scenes/sites.json (kinds)' };
  static read(root: string): SiteKindSources {
    const tables = JSON.parse(readFileSync(join(root, 'data/generation/tables/places.json'), 'utf8')) as {
      siteKind: { groups: Record<string, { _key: string }[]> }; siteNoun: { groups: Record<string, string[]> } };
    const scenes = JSON.parse(readFileSync(join(root, 'data/generation/scenes/sites.json'), 'utf8')) as {
      kinds: Record<string, unknown> };
    return { terrains: [...new Set(Object.values(tables.siteKind.groups).flat().map(k => k._key))],
      nouns: Object.keys(tables.siteNoun.groups), scenes: Object.keys(scenes.kinds) };
  }
  static findings(sources: SiteKindSources): Finding[] {
    const all = [...new Set([...sources.terrains, ...sources.nouns, ...sources.scenes])].sort();
    return all.flatMap(kind => (Object.keys(this.files) as (keyof SiteKindSources)[])
      .filter(source => !sources[source].includes(kind))
      .map(source => ({ level: 'error' as const, check: 'site-kind', where: 'data/generation',
        message: `the site kind ${kind} is missing from ${this.files[source]}: a kind is said in all three, or it `
          + 'is not placed' })));
  }
}
