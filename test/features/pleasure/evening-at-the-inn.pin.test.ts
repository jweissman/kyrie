import { beforeAll, describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { GeneratedWorld } from '../../support/generated';

// Fun Fridays (doc/design/fun-fridays.md): an evening at the Stone Horn's taproom in Porthalen, played through the
// runner as the ordinary rows offer it (data/goings-on/iscoed-evening). Hywel Delyn plays the crwth of an evening;
// Gwenllian Pryce makes room on her bench before the company asks anything; the company sits and listens (half an hour
// passed, the Salt Road sung in the prose), joins the chorus, stands a round; Hywel thanks the one who sang, the room
// is warm, and Gwenllian knows them the next evening. Nothing pays: no experience, no aim.
class Evening {
  static text(s: Said): string { return s.scene.lines.join(' '); }
  static row(s: Said, label: RegExp): string | undefined {
    return [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]).find(o => label.test(o.label))?.id;
  }
  static async ask(r: Runner, act: string): Promise<Said> {
    const s = await r.ask(JSON.stringify({ act }));
    if ('error' in s) { throw new Error(s.error); }
    return s;
  }
  // By its words, as a player picks it; turned to the one it is said to first where it is held in their talk.
  static async take(r: Runner, label: RegExp, who?: string): Promise<Said> {
    let s = r.said(), id = Evening.row(s, label);
    if (!id && who) { s = await Evening.ask(r, `talk:${who}`); id = Evening.row(s, label); }
    if (!id) { throw new Error(`no row like ${label}: ${[...s.offer.primary, ...s.offer.rest].map(o => o.label).join(' | ')}`); }
    return Evening.ask(r, id);
  }
}
describe('an evening at the Stone Horn', () => {
  let r: Runner, c: Runner['session']['campaign'];
  const said: Record<string, Said> = {};
  beforeAll(async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    r = new Runner(journey.session); c = journey.session.campaign;
    GeneratedWorld.put(journey.session, 's1_taproom');
    // Waited for the evening there, as a player waits.
    for (let n = 0; n < 8 && c.world.number({ kind: 'call', name: 'hour', args: ['clock'] }) < 18; n++) {
      said.waited = await Evening.take(r, c.world.number({ kind: 'call', name: 'hour', args: ['clock'] }) < 16
        ? /^Wait until dark/ : /^Wait an hour/);
    }
  }, 180000);
  it('has someone invite the company to sit before it asks anything', () => {
    expect(Evening.text(said.waited!)).toContain('He plays the Salt Road next');
  });
  it('passes half an hour pleasantly in listening, the song itself in the telling', async () => {
    said.listened = await Evening.take(r, /^Sit and listen to Hywel play/);
    expect(Evening.text(said.listened)).toContain('Salt for the Rì and salt for the drover');
    said.again = await Evening.take(r, /^Sit and listen to Hywel play/);
    expect(Evening.text(said.again)).toContain('Mari of the Weir');
  });
  it('lets the company join in, stand a round, and be thanked for it, and the room warms', async () => {
    const gold = c.world.number({ kind: 'call', name: 'quantity', args: ['party', 'gold'] });
    said.sang = await Evening.take(r, /^Join in the chorus/);
    expect(Evening.text(said.sang)).toMatch(/That is how it is sung/);
    said.round = await Evening.take(r, /^Stand the room a round/);
    expect(Evening.text(said.round)).toContain('To the stranger');
    expect(c.world.number({ kind: 'call', name: 'quantity', args: ['party', 'gold'] })).toBe(gold - 3);
    expect(Evening.text(r.said('look'))).toContain('nobody is a stranger in it');
  });
  it('is remembered: Gwenllian knows the singer, and Hywel talks of his songs', async () => {
    expect(r.said('look').scene.lines.join(' ')).toMatch(/.The singer,. she says/);
    const talk = await Evening.take(r, /Ask Hywel where the songs come from/, 'evening__hywel');
    expect(Evening.text(talk)).toContain('outlast what they are about');
    // Nothing of it pays: no experience was gained by any of it.
    expect(Object.values(said).map(Evening.text).join(' ')).not.toMatch(/gain[s]? \d+ experience/);
  });
});
