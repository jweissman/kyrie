import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { TalkWay } from '../../support/talk-way';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › The herb-wife asks, and the shrine tests (the
// owner, 26 November: interlocutors that ask you things, pose puzzles, let you make use of skill checks, and ask for
// payment for their teaching; OR-850 to OR-852). In the reference game's town (s0's Oakhythe), the one who buys what
// the woods give asks what brings you up to the woods as soon as you speak, and what you answer is what you are told:
// come for what grows there, and you know where the woundwort is before you search for it. For five coin an hour's
// lesson teaches woodcraft, and the old ride's tracks show the boar's runs off it, a way nobody showed you. Come back
// with woundwort in your pack and you are asked whether you know what you carry: a woodcraft check, rolled in the talk,
// and named right it is worth a poultice. At the shrine, asked what is under the stones, the shrine-keeper wants to
// hear what is cut on them first; answered wrong, nothing is told, and the company is sent up to look; come back from
// the stones, it says what it saw there, and the way down between them is known without a search.
type Row = { id: string; label: string; opens?: Row[] };
const flat = (rs: Row[]): Row[] => rs.flatMap(r => [r, ...flat(r.opens ?? [])]);
const rows = (s: Said): Row[] => flat([...s.offer?.primary ?? [], ...s.offer?.rest ?? [],
  ...Object.values(s.offer?.lenses ?? {}).flat()] as Row[]);
describe('World › The herb-wife asks, and the shrine tests', () => {
  it('asks in turn, teaches for coin what then shows in the woods, and tests before telling', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 's0', '--as', 'human/warrior/Wenna',
      '--opening', 'none']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    let s = r.said('look');
    const P = (x: string) => `region__s1_${x}`, knows = (f: string) => c.world.test({ kind: 'call', name: 'knows',
      args: ['party', P(f)] });
    const said = () => s.scene.lines.join(' ');
    const say = async (id: string) => {
      const next = await r.ask(JSON.stringify({ act: id }));
      expect([id, 'error' in next ? next.error : '']).toEqual([id, '']);
      s = next as Said;
    };
    // Found as the page's player finds it, a talk open (TalkWay, OR-1451: on another page, under Trade, else put by).
    const act = async (words: string) => {
      const way = await TalkWay.find(r, s, x => new RegExp(words, 'i').test(x.label)), found = way.o;
      s = way.said;
      if (!found) { throw new Error(`${words}: ${rows(s).map(x => x.label).join(' | ')}`); }
      await say(found.id);
    };
    // Taking leave, where the talk still stands (an hour's lesson ends it).
    const maybe = async (words: string) => {
      const way = await TalkWay.find(r, s, x => new RegExp(words, 'i').test(x.label), { stay: true }), found = way.o;
      s = way.said;
      if (found) { await say(found.id); }
    };
    const to = async (place: string) => {
      // The ways are the place's: a talk still open is put by (focus:place, no time: OR-1451).
      if (TalkWay.talking(s)) { await say('focus:place'); }
      const way = rows(s).find(x => x.id === `exit:${P(place)}` || x.id.startsWith(`exit:${P(place)}/`))
        ?? rows(s).find(x => x.id.startsWith('travel:') && x.id.includes(P(place)));
      if (!way) { throw new Error(`no way to ${place}: ${rows(s).filter(x => /^(exit|travel)/.test(x.id)).map(x => x.id).join(' ')}`); }
      await say(way.id);
    };
    const name = (id: string) => c.module.entities.find(e => e.id === P(id))!.name.split(', ')[0]!;
    const dealer = name('innkeeper'), priest = name('priest');
    // A talk, plain or led with a question by its short title ("Finnan: what is out in the country round", OR-802).
    // Or led with the question a life's aim leads to (come over the hills, the work is asked after: OR-1075).
    const talk = (who: string) => `^(Talk to ${who}( —|$)|${who}: |Ask ${who} about the old woods$)`;
    await to('green'); await to('taproom');
    // Greeted, the herb-wife asks; nothing was pressed to be asked.
    expect(rows(s).some(x => /asks what brings you/.test(x.label))).toBe(false);
    await act(talk(dealer));
    expect(said()).toMatch(/What brings you up to the old woods\?/);
    // Asked from the place by her talk's row, then turned to (talk:, no time): her talk's question is offered.
    if (!TalkWay.talking(s)) { await say(`talk:${P('innkeeper')}`); }
    // Answered from the engine's rows: her answers, and the lie among them, rolled.
    expect(rows(s).map(x => x.label)).toEqual(expect.arrayContaining(['Say you have come for what grows there',
      'Say you are going up to the old stones']));
    expect(knows('wood_wort')).toBe(false);
    await act('^Say you have come for what grows there');
    expect(said()).toMatch(/in the gap where an oak came down/);
    expect(knows('wood_wort')).toBe(true);
    // Taught for coin: woodcraft, an hour's lesson.
    const purse = s.purse!.coin;
    await act(`^Pay ${dealer} 5 coin to teach Wenna to read the woods`);
    expect(s.purse!.coin).toBe(purse - 5);
    expect(rows(s).some(x => /^Pay .* to teach/.test(x.label))).toBe(false);
    // The ride shows the boar's runs to one who can read them, and the way along them is known.
    await maybe('^Take your leave'); await to('green'); await to('wood_edge'); await to('wood_ride');
    expect(knows('wood_tracks')).toBe(true);
    expect(rows(s).some(x => x.id === `exit:${P('wood_wallow')}`)).toBe(true);
    // The woundwort she told of is there to take, unsearched for; brought back, she asks what it is.
    await act('^Collect a stand of woundwort');
    await to('wood_edge'); await to('green'); await to('taproom');
    journey.session.campaign.forced = 'pass';
    await act(talk(dealer));
    expect(said()).toMatch(/Do you know what you've got there\?|Do you know what you’ve got there\?/);
    await act('^Name the plant');
    expect(said()).toMatch(/Yarrow, for the next one of you that bleeds/);
    journey.session.campaign.forced = undefined;
    // The shrine: what is under the stones is told only to one who can say what is cut on them.
    await maybe('^Ask .* about the old woods');
    await maybe('^Take your leave'); await to('green'); await to('shrine');
    // The talk led with the question asked of the stones, where an aim leads to her: asked as she is talked to.
    await act(talk(priest)); await maybe('what lies under the fallen stones');
    expect(said()).toMatch(/Tell me what the old ones cut on them/);
    await act('^Say a sun, rising');
    expect(said()).toMatch(/Go and look, and come back/);
    expect(knows('wood_door')).toBe(false);
    // Up to the stones, and back to say what is there.
    await maybe('^Take your leave'); await to('green'); await to('wood_edge'); await to('wood_ride');
    await to('wood_burners'); await to('wood_stones');
    expect(rows(s).some(x => x.id === `exit:${P('ud')}`)).toBe(false);
    await to('wood_burners'); await to('wood_ride'); await to('wood_edge'); await to('green'); await to('shrine');
    await act('a shut door is cut on the stones');
    expect(said()).toMatch(/a stair goes down/);
    expect(knows('wood_door')).toBe(true);
  }, 120000);
});
