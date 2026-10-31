// `kyrie new site <id> ["Name"]`: a site of the generator's library (data/sites), written as a working example: a place
// in a country with a way to it from where its track starts, a mouth, a level below by a stair, and a thing there to
// look at closely; its module imports the country and the approach, as a scenario binds them in a generated world
// (data/scenarios, brood-hollow's for one); and a probe campaign that installs it in a country of its own, with the
// test that walks it.
export class Sites {
  private static json(v: unknown): string { return `${JSON.stringify(v, null, 2)}\n`; }
  static files(id: string, name: string): Record<string, string> {
    const q = JSON.stringify, json = Sites.json.bind(Sites);
    const site = [`Module ${id} ${q(name)} {`,
      `  Description ${q(`${name}: what it is, in a sentence.`)}.`,
      '  Entity party: group "Your company".',
      '  Place march "the country it is in" is region.',
      '  Place approach "where the way to it starts" is room.',
      `  Place ${id} ${q(name)} is site within march at 0, 0.`,
      `  Place mouth ${q(`the mouth of ${name}`)} is room within ${id} at 0, 0.`,
      `  Place below ${q(`${name} below`)} is level within ${id}.`,
      '  Place hall "the hall below" is room within below at 0, 1.',
      '  // Initially Assert unlit(hall). makes it dark: the company needs a light to see, or to go on.',
      `  Passage track ${q(`the track to ${name}`)} is path between approach and mouth taking 30 minutes.`,
      '  Passage steps "the steps down" is stair between mouth and hall.',
      '  Observe mouth_scene at mouth when true "What the company sees as it comes up to it, in a sentence or two.".',
      '  Observe hall_scene at hall when true "What is below, in a sentence or two.".',
      '  Thing table "the stone table" at hall {', '    Tries looking.',
      '    State still "A stone table stands in the middle of the hall.".', '  }',
      '  Observe table_closer near table when tried(table, looking) "Someone has scratched a line of marks along its edge, and the last of them is fresh.".',
      '  Goal false.', '}', ''].join('\n');
    const region = ['Module country "A country to put it in" {', '  Description "A probe country for the site.".',
      '  Place land "the country" is region within imbar.',
      '  Place town "the town" is settlement within land at 0, 0.',
      '  Place road "the road out of town" is room within town at 0, 0 outdoors.',
      '  Company party "Your company" of 1 at road.', '  Goal false.', '}', ''].join('\n');
    return {
      [`data/sites/${id}/site.kyr`]: site,
      [`data/sites/${id}/module.json`]: json({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        imports: ['party', 'march', 'approach'],
        roles: { party: { type: 'group' }, march: { type: 'place' }, approach: { type: 'place' } },
        exports: { site: id, mouth: 'mouth', below: 'hall' } }),
      [`test/fixtures/${id}/country/country.kyr`]: region,
      [`test/fixtures/${id}/country/module.json`]: json({ version: 1, source: 'country.kyr', rules: ['world'],
        globals: ['party'], canon: ['imbar'], exports: { party: 'party', region: 'land', road: 'road' } }),
      [`test/fixtures/${id}/probe.campaign.json`]: json({ version: 1, name: name,
        pitch: { heading: name, text: `A probe of ${name}, in a country of its own.` },
        modules: [{ id: 'country', bundle: 'country/module.json' },
          { id, bundle: `../../../data/sites/${id}/module.json`,
            imports: { party: 'country.party', march: 'country.region', approach: 'country.road' } }],
        party: [{ name: 'Elen', raceId: 'elf', classId: 'ranger', backgroundId: 'hunter' }] }),
      [`test/${id}.test.ts`]: [`import { describe, expect, it } from 'bun:test';`,
        `import { Journey } from '../src/session/journey';`, '',
        `// ${name}, a site of the generator's library, walked in a probe country of its own (bin/kyrie new wrote it).`,
        `describe(${q(name)}, () => {`, '  it(\'is walked to the stone table below\', async () => {',
        `    const j = await Journey.start('test/fixtures/${id}/probe.campaign.json', ${q(id)});`,
        `    await j.play('>${id}__hall', 'the stone table: Examine');`,
        '    expect(j.page).toContain(\'and the last of them is fresh\');', '  }, 60000);', '});', ''].join('\n'),
    };
  }
}
