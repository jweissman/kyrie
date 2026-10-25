// `kyrie new`: an adventure begun, with everything it needs to be played, linted, tested and placed in a generated
// world: its module (a region, a town, a room and the company in a file of its own), its campaign, a placed bundle,
// the steps of a first journey, and a journey test that plays them. Nothing it writes is overwritten.
//   bin/kyrie new <id> ["Title"]
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export class NewTool {
  private static json(v: unknown): string { return `${JSON.stringify(v, null, 2)}\n`; }
  static files(id: string, title: string): Record<string, string> {
    const q = JSON.stringify.bind(JSON), json = NewTool.json.bind(NewTool);
    const module = { version: 1, source: ['site.kyr', 'company.kyr'], rules: ['world'], globals: ['party'],
      exports: { party: 'party', region: 'country', road: 'road' } };
    return {
      [`data/adventures/${id}/site.kyr`]: [`Module ${id} ${q(title)} {`,
        `  Description ${q(`${title}: what it is, in a sentence.`)}.`,
        '  Place country "the country" is region.',
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
  static async main(args: string[], root = process.cwd(), print: (line: string) => void = console.log):
    Promise<number> {
    const [id, title] = args;
    if (!id || !/^[a-z][a-z0-9]*$/.test(id)) {
      print('usage: kyrie new <id> ["Title"] (an id of lower-case letters and digits)'); return 1;
    }
    const files = this.files(id, title ?? id.charAt(0).toUpperCase() + id.slice(1));
    const there = Object.keys(files).filter(f => existsSync(join(root, f)));
    if (there.length) { print(`Already there, so nothing is written: ${there.join(', ')}`); return 1; }
    for (const [path, text] of Object.entries(files)) {
      await mkdir(join(root, path, '..'), { recursive: true });
      await writeFile(join(root, path), text);
      print(`  wrote ${path}`);
    }
    print(`Next: bin/kyrie lint data/campaigns/${id}.campaign.json; bin/kyrie play data/campaigns/${id}.campaign.json --choices;`
      + ` bun test test/${id}.test.ts; bin/kyrie preview data/campaigns/${id}.campaign.json`);
    return 0;
  }
}
