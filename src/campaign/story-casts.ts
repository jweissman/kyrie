import type { DeemValue } from 'deem';
import type { BundleSource } from './bundle-source';
import { ModuleAssembly, type AdventureManifest } from './module-assembly';
import { ModuleBundle, type BundleManifest, type BundleRequest } from './module-bundle';

// The names a story's generated people are drawn apart from, and the names they are given, by its identity alone
// (OR-418): never by who is in the world already. A story is drawn apart from what the world gives it (its request's
// `taken`: the country's own folk, its stories' authored names, the protagonist's own) and from the people the stories
// drawn before it in its country cast (apart: in the order the world drew them, each cast by its generation alone,
// its Kyr unread). A module whose manifest asks to be drawn apart and is given nothing to be drawn apart from (a kit:
// the hobs' captive, named for the world, had been Odo where a man of the country is, OR-304) is drawn apart from the
// names the world holds (`names`: the campaign's, as its world was drawn). So a story installed late, or without the
// stories installed before it in another life, draws the names it would have drawn: the precondition for installing
// what lies away from the start only when it is first neared (lazy-provinces.md).
export class StoryCasts {
  // A story's generation context, as its installation draws it (ModuleBundle.loading) and as it is read ahead.
  static context(manifest: BundleManifest, request: BundleRequest, at: { names?: readonly string[]; now?: number }):
    Record<string, DeemValue> {
    const own = { ...manifest.generation?.context, ...request.context };
    const asked = Array.isArray(own.taken) && !Array.isArray(request.context?.taken) && at.names?.length;
    return { ...own, ...asked ? { taken: [...new Set([...own.taken as string[], ...at.names!])] } : {},
      now: at.now ?? 0 };
  }
  // The names a generation cast its people by, as the module's entities are named (two alike, the later the younger).
  static names(generated: AdventureManifest): string[] {
    const casting = generated.casting ? ModuleAssembly.named(generated.casting) : {};
    return Object.values(casting).flatMap(c => typeof c?.name === 'string' ? [c.name] : []);
  }
  // The people a request's generation casts, read ahead of installing it: its manifest, its files of tables and
  // templates, and the id its first file declares (its seed is drawn by it: ModuleBundle.loading); none, where it
  // generates nothing.
  static async cast(request: BundleRequest, at: { seed: string; source: BundleSource; now?: number }):
    Promise<string[]> {
    const path = at.source.resolve(request.bundle);
    const manifest = JSON.parse(await at.source.read(path)) as BundleManifest, g = manifest.generation;
    if (!g) { return []; }
    const first = typeof manifest.source === 'string' ? manifest.source : manifest.source[0]!;
    const [text, tables, templates] = await Promise.all([first, g.tables, g.templates].map(p =>
      p ? at.source.read(at.source.resolve(p, path)) : Promise.resolve('{}')));
    const id = /\bModule\s+([A-Za-z_][\w-]*)/.exec(text!)?.[1];
    if (!id) { return []; }
    return this.names(ModuleBundle.generated(manifest, [tables!, templates!], ModuleBundle.seeded(at.seed, id, request),
      this.context(manifest, request, { now: at.now })));
  }
  // The requests of one country, in the order the world drew them, each that is drawn apart (its `taken` given)
  // drawn apart too from the names `among` (the world's, where it holds some already) and from the people those before
  // it cast; changed in place. The names the world holds after them: those among, and those they cast.
  static async drawApart(requests: BundleRequest[], at: { seed: string; source: BundleSource; now?: number;
    among?: readonly string[] }): Promise<string[]> {
    const cast = [...at.among ?? []];
    for (const [i, request] of requests.entries()) {
      const taken = request.context?.taken;
      if (Array.isArray(taken) && cast.length) {
        requests[i] = { ...request, context: { ...request.context,
          taken: [...new Set([...taken as string[], ...cast])] } };
      }
      cast.push(...await this.cast(requests[i]!, at));
    }
    return [...new Set(cast)];
  }
}
