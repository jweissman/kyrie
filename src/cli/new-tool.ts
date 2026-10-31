// `kyrie new`: an adventure begun, with everything it needs to be played, linted, tested and placed in a generated
// world: its module (a region, a town, a room and the company in a file of its own), its campaign, a placed bundle,
// the steps of a first journey, and a journey test that plays them. Or a part of an adventure that is there (a scene,
// an item, a chapter, a character: see new-parts, new-character), or a site of the generator's library (new-site).
// Each is a working example: it lints clean and its test passes as written. Nothing it writes is overwritten.
//   bin/kyrie new <id> ["Title"] | new scene|item|chapter|character <id> --in <adventure> | new site <id>
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Parts } from './new-parts';
import { Adventures, type Home } from './new-home';
import { Characters } from './new-character';
import { Sites } from './new-site';

export class NewTool {
  private static json(v: unknown): string { return `${JSON.stringify(v, null, 2)}\n`; }
  static files(id: string, title: string): Record<string, string> {
    const q = JSON.stringify.bind(JSON), json = NewTool.json.bind(NewTool);
    // Its country is a country of Imbar, the world's own (data/imbar), as every country is.
    const module = { version: 1, source: ['site.kyr', 'company.kyr'], rules: ['world'], globals: ['party'],
      canon: ['imbar'], exports: { party: 'party', region: 'country', road: 'road' } };
    return {
      [`data/adventures/${id}/site.kyr`]: [`Module ${id} ${q(title)} {`,
        `  Description ${q(`${title}: what it is, in a sentence.`)}.`,
        '  Place country "the country" is region within imbar.',
        '  Place town "the town" is settlement within country at 0, 0.',
        '  Place road "the road into town" is room within town at 0, 0 outdoors.',
        '  Place square "the square" is room within town at 1, 0 outdoors.',
        '  Passage gate "the town gate" is road between road and square taking 10 minutes.',
        '  Observe road_scene at road when true "The road comes up to a gate in a low wall.".',
        '  Observe square_scene at square when true "A square of trodden earth, and a well.".',
        '  // How it ends: Ending done "The End" when … "Here the story ends.".',
        '}', ''].join('\n'),
      [`data/adventures/${id}/company.kyr`]: [`Module ${id} ${q(title)} {`,
        '  Company party "Your company" of 3 at road.',
        '  Initially Set quantity(party, gold) to 10. Initially Set quantity(party, rations) to 2.', '}', ''].join('\n'),
      [`data/adventures/${id}/placed.kyr`]: [`Module ${id} ${q(title)} {`,
        '  // The country beyond a march of a generated world: the company that comes in by the road is the world\'s own.',
        '  Entity party: group "Your company".', '}', ''].join('\n'),
      [`data/adventures/${id}/module.json`]: json(module),
      [`data/adventures/${id}/placed.json`]: json({ ...module, source: ['site.kyr', 'placed.kyr'], imports: ['party'],
        roles: { party: { type: 'group' } } }),
      [`data/campaigns/${id}.campaign.json`]: json({ version: 1, name: title,
        pitch: { heading: title, text: 'What the company is asked to do, and why it matters. Choose three companions.' },
        modules: [{ id, bundle: `../adventures/${id}/module.json` }],
        party: [{ name: 'Elen', raceId: 'elf', classId: 'ranger', backgroundId: 'hunter' },
          { name: 'Bran', raceId: 'human', classId: 'warrior', backgroundId: 'locksmith' },
          { name: 'Dori', raceId: 'dwarf', classId: 'cleric', backgroundId: 'medic' }] }),
      [`test/fixtures/${id}/journey.json`]: json({ arrive: ['^To the square'] }),
      [`test/${id}.test.ts`]: [`import { describe, expect, it } from 'bun:test';`,
        `import { Journey } from '../src/session/journey';`,
        `import { KyrLint } from '../src/cli/kyr-lint';`,
        `import steps from './fixtures/${id}/journey.json';`, '',
        `// ${title}, played by the labels a player sees (see Journey for the steps it takes).`,
        `describe(${q(title)}, () => {`,
        `  const campaign = 'data/campaigns/${id}.campaign.json';`,
        '  it(\'lints clean\', async () => {',
        '    expect((await KyrLint.campaign(campaign)).filter(f => f.level === \'error\')).toEqual([]);',
        '  }, 60000);',
        '  it(\'is played from the road into the square\', async () => {',
        `    const j = await Journey.start(campaign, ${q(id)});`,
        '    await j.play(...steps.arrive);',
        `    expect(j.at('party')).toBe(${q(`${id}__square`)});`,
        '  }, 60000);', '});', ''].join('\n'),
    };
  }
  static readonly usage = ['usage: kyrie new <id> ["Title"]   an adventure (an id of lower-case letters and digits)',
    '       kyrie new scene|item|chapter <id> --in <adventure> [--from <place>]',
    `       kyrie new character <id> --in <adventure> [${Characters.tiers.map(t => `--${t}`).join('|')}] [--from <place>]`,
    '       kyrie new site <id> ["Name"]'].join('\n');
  static async main(args: string[], root = process.cwd(), print: (line: string) => void = console.log):
    Promise<number> {
    const [kind = '', ...rest] = args;
    if (['scene', 'item', 'chapter', 'character'].includes(kind)) { return this.part(kind, rest, root, print); }
    if (kind === 'site') { return this.site(rest, root, print); }
    const [id, title] = kind === 'adventure' ? rest : args;
    if (!id || !/^[a-z][a-z0-9]*$/.test(id)) { print(this.usage); return 1; }
    const wrote = await this.write(this.files(id, title ?? id.charAt(0).toUpperCase() + id.slice(1)), root, print);
    if (wrote) {
      print(`Next: bin/kyrie lint data/campaigns/${id}.campaign.json; bin/kyrie play data/campaigns/${id}.campaign.json --choices;`
        + ` bun test test/${id}.test.ts; bin/kyrie preview data/campaigns/${id}.campaign.json`);
    }
    return wrote ? 0 : 1;
  }
  // A part of an adventure that is there: its own file of the adventure's module, which the module (and the bundle
  // that places it in a generated world) now names among its sources, and a test of it.
  private static async part(kind: string, args: string[], root: string, print: (line: string) => void):
    Promise<number> {
    const id = args[0], adventure = this.flag(args, 'in'), from = this.flag(args, 'from');
    const tier = Characters.tiers.find(t => args.includes(`--${t}`)) ?? 'recurring';
    if (!id || !/^[a-z][a-z0-9_]*$/.test(id) || !adventure) { print(this.usage); return 1; }
    let home: Home;
    try { home = Adventures.read(root, adventure, from); } catch (e) { print((e as Error).message); return 1; }
    const part = kind === 'character' ? Characters.make(home, id, tier)
      : kind === 'scene' ? Parts.scene(home, id) : kind === 'item' ? Parts.item(home, id) : Parts.chapter(home, id);
    if (!await this.write(part.files, root, print)) { return 1; }
    for (const manifest of ['module.json', 'placed.json'].filter(m => existsSync(join(root, home.dir, m)))) {
      const path = join(root, home.dir, manifest), m = JSON.parse(await readFile(path, 'utf8')) as { source: string | string[] };
      m.source = [...[m.source].flat(), part.source];
      await writeFile(path, this.json(m));
      print(`  named ${part.source} in ${home.dir}/${manifest}`);
    }
    print(`Next: ${part.next}; bun test test/${adventure}-${id}.test.ts`);
    return 0;
  }
  private static async site(args: string[], root: string, print: (line: string) => void): Promise<number> {
    const [id, name] = args;
    if (!id || !/^[a-z][a-z0-9_]*$/.test(id)) { print(this.usage); return 1; }
    if (!await this.write(Sites.files(id, name ?? id.charAt(0).toUpperCase() + id.slice(1)), root, print)) { return 1; }
    print(`Next: bun test test/${id}.test.ts; bin/kyrie play test/fixtures/${id}/probe.campaign.json --choices;`
      + ' to place it in generated worlds, a scenario binds its imports (data/scenarios/brood-hollow.scenario.json)');
    return 0;
  }
  private static flag(args: string[], name: string): string | undefined {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
  }
  // Writes files, none over one that is there.
  private static async write(files: Record<string, string>, root: string, print: (line: string) => void):
    Promise<boolean> {
    const there = Object.keys(files).filter(f => existsSync(join(root, f)));
    if (there.length) { print(`Already there, so nothing is written: ${there.join(', ')}`); return false; }
    for (const [path, text] of Object.entries(files)) {
      await mkdir(join(root, path, '..'), { recursive: true });
      await writeFile(join(root, path), text);
      print(`  wrote ${path}`);
    }
    return true;
  }
}
