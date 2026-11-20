import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { ScreenModel } from '../src/ui/screen-model';
import { Runner } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';

// A place's description names only what the place holds (CO-17, the owner on Wrenbridge's market: "is there even a
// fishmonger there?"), over a drawn country: every place of its first town, arrived at as the terminal says it, names
// no tradesman, stall or keeper that is not there among its people, things or ways. Its first find: the drill-yard sold
// "the yard's smith's best work", and no smith was ever placed (data/generation/town/teachers.kyrt).
const named: Record<string, RegExp> = {
  fishmonger: /\bfish-?(stall|monger|wife)\b/i, baker: /\bbaker\b/i, brewer: /\bbrewer\b/i,
  smith: /\bsmith\b|\bsmithy\b/i, tinker: /\btinker\b/i, carter: /\bcarter\b/i,
  priest: /\bpriest\b|\bacolyte\b/i, cooper: /\bcooper\b/i,
  miller: /\bmiller\b/i, butcher: /\bbutcher\b/i, chandler: /\bchandler\b/i, potter: /\bpotter\b/i,
  weaver: /\bweaver\b/i, tanner: /\btanner\b/i, cheesemonger: /\bcheese-?(seller|wife|monger)\b|\bcuts cheese\b/i,
  pedlar: /\bpedlar\b/i, ferryman: /\bferry-?man\b/i, herbwife: /\bherb-?(wife|woman|seller)\b/i,
};
// Every place whose id says it is of the towns, arrived at in turn: what its prose names and its rows do not hold.
async function strays(argv: string[], places: RegExp) {
  const { journey } = await PlayTool.start(PlayTool.parse(argv));
  const c = journey.session.campaign, found: string[] = [];
  let said = 0;
  for (const place of c.module.entities.filter(e => e.type === 'place' && places.test(e.id)).map(e => e.id)) {
    const was = c.world.one('at', 'party')!;
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', was) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
    const screen = ScreenModel.build(c), prose = new Runner(journey.session).said('arrive').scene.prose.join(' ');
    if (prose.length > 40) { said++; }
    const held = [...screen.people.map(p => p.name), ...screen.things.map(t => t.name),
      ...screen.exits.map(e => e.destination.name)].join(' | ');
    for (const [who, re] of Object.entries(named)) {
      if (re.test(prose) && !re.test(held)) { found.push(`${place}: ${who}`); }
    }
  }
  return { said, found };
}
describe('a drawn town\'s descriptions', () => {
  it('name no one who is not there', async () => {
    const { said, found } = await strays(['--world', 'a1', '--origin', 'order', '--as', 'human/ranger/Aud'],
      /^region__s1_/);
    expect(said).toBeGreaterThan(50);
    expect(found).toEqual([]);
  }, 120000);
  // The golden route's two towns (S3-4): Porthalen and Gatesend, with the drove's and the sea-gate's places in them.
  it('name no one who is not there in Porthalen or Gatesend', async () => {
    const { said, found } = await strays(['--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar'],
      /^(region__s1_|region__s4_|drove__|gate__)/);
    expect(said).toBeGreaterThan(80);
    expect(found).toEqual([]);
  }, 120000);
});
