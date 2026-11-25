#!/usr/bin/env bun
// The owner's scene paintings (assets/bg) brought into the corpus, wherever in assets/bg they are kept (the owner, 24
// November: "I've carved out folders for each of the terrain ... make sure things still work with this arrangement,
// ideally even get helpful tags, terrain: cave based on being placed in terrain/cave"). Each painting has one id for
// good, its game copy assets/portraits/<id>.jpeg: data/paintings/sources.json keeps each id's file and digest, so a
// painting moved or renamed is followed by its bytes and keeps its id (scene-ruins-keep-dawn stays itself as
// keep-dawn.png), and one painted over in place keeps its id and is copied again. A new painting's id is scene- and
// its folder and name (terrain/desert/sphinx.png is scene-desert-sphinx; a name that begins with its terrain is not
// said twice). Under terrain/<t>/ a painting's terrain is <t>. assets/bg/old is the owner's set aside (ignored).
//   bun scripts/bg-import.ts [--check]   writes sources.json and the new copies; --check writes nothing, and fails
//                                          where a painting is not yet brought in
// Then `bun scripts/paintings.ts assets/portraits` makes the registry and the page's copies, and each new painting
// wants looking at for data/paintings/seen.json (what it shows, its light and weather).
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

export interface Source { path: string; sha1: string; terrain?: string }
export class BgImport {
  static readonly root = resolve(import.meta.dir, '..');
  static readonly bg = join(this.root, 'assets/bg');
  static readonly file = join(this.root, 'data/paintings/sources.json');
  static readonly set = new Set(['old']);
  static read(): Record<string, Source> {
    return existsSync(this.file) ? (JSON.parse(readFileSync(this.file, 'utf8')) as { sources: Record<string, Source> })
      .sources : {};
  }
  static pngs(dir = this.bg): string[] {
    return readdirSync(dir).sort().flatMap(name => {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) { return dir === this.bg && this.set.has(name) ? [] : this.pngs(full); }
      return name.endsWith('.png') ? [relative(this.root, full)] : [];
    });
  }
  // A painting's terrain, by the folder it is kept in.
  static terrain(path: string): string | undefined { return /^assets\/bg\/terrain\/([^/]+)\//.exec(path)?.[1]; }
  // A new painting's id: scene-, its folder under assets/bg and its name, its terrain not said twice.
  static id(path: string): string {
    const parts = path.replace(/^assets\/bg\//, '').replace(/\.png$/, '').split('/').filter(p => p !== 'terrain');
    const name = parts.pop()!, folder = parts.at(-1);
    return `scene-${folder && !name.startsWith(`${folder}-`) ? `${folder}-` : ''}${name}`;
  }
  static sha1(path: string): string { return createHash('sha1').update(readFileSync(join(this.root, path))).digest('hex'); }
  // Every painting in assets/bg matched to its id: by its digest, else by its path (painted over), else a new id.
  static match(known: Record<string, Source>): { sources: Record<string, Source>; fresh: string[]; gone: string[] } {
    // One digest may be two paintings' (the same image kept under two names): the one whose name it keeps, if any.
    const byDigest = new Map<string, string[]>();
    for (const [id, s] of Object.entries(known)) { byDigest.set(s.sha1, [...byDigest.get(s.sha1) ?? [], id]); }
    const byPath = new Map(Object.entries(known).map(([id, s]) => [s.path, id]));
    const sources: Record<string, Source> = {}, fresh: string[] = [];
    for (const path of this.pngs()) {
      const sha1 = this.sha1(path), terrain = this.terrain(path);
      let id = this.named(byDigest.get(sha1)?.filter(i => !sources[i]) ?? [], known, path) ?? byPath.get(path);
      if (!id || sources[id]) { id = this.free(this.id(path), sources, known); }
      if (!known[id] || known[id]!.sha1 !== sha1) { fresh.push(id); }
      sources[id] = { path, sha1, ...terrain ? { terrain } : {} };
    }
    return { sources, fresh, gone: Object.keys(known).filter(id => !sources[id]) };
  }
  // The id, or the first of it numbered that no other painting has; a copy no source yet claims is this painting's (the
  // corpus as it was before sources.json, every copy named scene-<name>).
  // Of the ids a digest is, the one whose old file's name ends as this one's does, else the first.
  private static named(ids: string[], known: Record<string, Source>, path: string): string | undefined {
    const name = path.split('/').pop()!;
    return ids.find(i => known[i]!.path.split('/').pop()!.endsWith(name)) ?? ids[0];
  }
  private static free(id: string, taken: Record<string, Source>, known: Record<string, Source>): string {
    let n = 2, out = id;
    while (taken[out] || known[out]) { out = `${id}-${n++}`; }
    return out;
  }
  static copy(id: string): string { return join(this.root, 'assets/portraits', `${id}.jpeg`); }
  // The game's copy: 1448 wide at most, as the corpus's scene copies are.
  static async write(id: string, path: string): Promise<void> {
    const bytes = readFileSync(join(this.root, path));
    const image = new Bun.Image(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    const { width } = await image.metadata();
    writeFileSync(this.copy(id), await (width > 1448 ? image.resize(1448) : image).jpeg({ quality: 88 }).bytes());
  }
  static async main(args: string[]): Promise<number> {
    if (!existsSync(this.bg)) { console.error(`assets/bg is not checked out here (a builder's worktree has no assets/): make a full one, FULL=1 /var/tmp/kyrie/tools/worktree.sh`); return 1; }
    const { sources, fresh, gone } = this.match(this.read());
    const copyless = Object.keys(sources).filter(id => !existsSync(this.copy(id)));
    // A painting new to sources.json with its copy already made is adopted as it is; one painted over is copied again.
    const known = this.read(), toWrite = [...new Set([...fresh.filter(id => known[id]), ...copyless])];
    console.log(`${Object.keys(sources).length} paintings in assets/bg; ${toWrite.length} to copy`
      + `${gone.length ? `; ${gone.length} no longer there (their copies kept): ${gone.join(', ')}` : ''}`);
    for (const id of toWrite) { console.log(`  ${id}  ${sources[id]!.path}`); }
    if (args.includes('--check')) { return toWrite.length ? 1 : 0; }
    for (const id of toWrite) { await this.write(id, sources[id]!.path); }
    const kept = { about: 'Each owner scene painting\'s id, its file in assets/bg and digest, and its terrain where its '
      + 'folder says one (scripts/bg-import.ts: a painting moved or renamed keeps its id by its bytes).', sources };
    writeFileSync(this.file, `${JSON.stringify(kept, null, 1)}\n`);
    return 0;
  }
}

if (import.meta.main) { process.exit(await BgImport.main(process.argv.slice(2))); }
