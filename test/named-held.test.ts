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
describe('a drawn town\'s descriptions', () => {
  it('name no one who is not there', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'a1', '--origin', 'order', '--as',
      'human/ranger/Aud']));
    const c = journey.session.campaign, strays: string[] = [];
    let said = 0;
    for (const place of c.module.entities.filter(e => e.type === 'place' && /^region__s1_/.test(e.id)).map(e => e.id)) {
      c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
        { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
      const screen = ScreenModel.build(c), prose = new Runner(journey.session).said('arrive').scene.prose.join(' ');
      if (prose.length > 40) { said++; }
      const held = [...screen.people.map(p => p.name), ...screen.things.map(t => t.name),
        ...screen.exits.map(e => e.destination.name)].join(' | ');
      for (const [who, re] of Object.entries(named)) {
        if (re.test(prose) && !re.test(held)) { strays.push(`${place}: ${who}`); }
      }
    }
    expect(said).toBeGreaterThan(50);
    expect(strays).toEqual([]);
  }, 120000);
});
