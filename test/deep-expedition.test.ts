import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Region } from '../src/world/region-writer';

// The deep site a Delver country has, played as a player plays it, by the words on the page: heard of at the home
// inn, walked to by the way that was told, gone into by torchlight; the clock kept to the minute; its dwellers met
// with words as well as blows, at odds the page tells beforehand; and only the tries that suit a thing offered on it.
class Delve {
  static async start(cls: string) {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: cls }] });
    return { s: await PlaySession.start(w.path, 'wren', w.source), region: w.report.region as Region };
  }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  // Takes the first choice whose words match, and says what the player would read after it.
  static async take(s: PlaySession, pattern: RegExp) {
    const choice = PlayerView.choices(s.campaign).find(c => pattern.test(c.choice.name));
    if (!choice) { throw new Error(`No choice ${pattern}: ${this.names(s).join(' | ')}`); }
    const before = PlayerView.observe(s.campaign), event = await s.perform(choice.choice.id);
    const feedback = ActionFeedbackView.read(s.campaign, event, before), f = feedback;
    const leaf = Narrator.leaf(s.campaign, ScreenModel.build(s.campaign), { event, feedback, said: choice.choice.name,
      moved: before.location?.id !== s.campaign.world.one('at', 'party') });
    return [...(leaf.exchange?.lines ?? []).map(l => l.text), f.result, ...f.observations, ...f.events, ...f.immediate,
      ...f.discoveries].join(' ');
  }
  static async walk(s: PlaySession, patterns: RegExp[]) { for (const p of patterns) { await this.take(s, p); } }
  // The page as it reads now: what was just said, the place, who is there.
  static page(s: PlaySession) {
    const leaf = Narrator.leaf(s.campaign, ScreenModel.build(s.campaign));
    return [...(leaf.exchange?.lines ?? []).map(l => l.text), ...leaf.situation, ...leaf.presence].join(' ');
  }
  static readonly inn = [/^Take the road to the bailey/, /^Take the door of the Wooden Wolf/];
  static readonly road = [/^Take the door of the Wooden Wolf/, /^Take the path up onto Barzelrehes to the foot/,
    /^Take a scree path to the foot of Barzelrehes by Muzgkom/, /^Take the track to Obscurusport$/,
    /^Take the way in to the adit mouth/, /^Take the passage to the adit$/];
}

describe('a deep site, from the inn', () => {
  it('stands out from the home town, and is told of at its inn, with the way to it', async () => {
    const { s, region } = await Delve.start('warrior');
    const deep = region.sites.find(x => x.work?.deep)!;
    const rooms = s.campaign.module.entities.filter(e => e.id.startsWith(`region__${deep.id}_`) && e.space?.kind === 'room');
    expect(rooms.length).toBeGreaterThanOrEqual(25);
    await Delve.walk(s, Delve.inn);
    const told = await Delve.take(s, /^Ask Fargrim about the old workings$/);
    expect(told).toContain('Obscurusport');
    expect(told).toMatch(/The way to .+: to the foot of Barzelrehes by Muzgkom, where the track to it starts/);
  }, 90000);
  it('is walked to by the way told, gone into by torchlight, a few minutes at a time', async () => {
    const { s } = await Delve.start('warrior');
    await Delve.walk(s, [...Delve.inn, /^Ask Fargrim about the old workings$/, ...Delve.road]);
    expect(Delve.page(s)).toContain('pitch dark');
    const lit = ScreenModel.build(s.campaign).clock;
    await Delve.walk(s, [/^Light a torch$/, /^Take the gallery to the crossing$/]);
    // A torch lit and a short gallery walked is minutes, not watches.
    const [h0, m0] = /(\d+):(\d+)/.exec(lit)!.slice(1).map(Number), [h1, m1] = /(\d+):(\d+)/.exec(
      ScreenModel.build(s.campaign).clock)!.slice(1).map(Number);
    expect((h1! * 60 + m1!) - (h0! * 60 + m0!)).toBeGreaterThan(0);
    expect((h1! * 60 + m1!) - (h0! * 60 + m0!)).toBeLessThan(10);
    // The scattered coin is only looked at; the glyph across a way is looked at, or prodded from a pace off.
    const names = Delve.names(s);
    expect(names).toContain('Look closely at scattered coins');
    const tried = /^(Prod|Pry at|Hold a flame to|Push and pull at|Listen at) scattered coins/;
    expect(names.filter(n => tried.test(n))).toEqual([]);
    expect(names).toContain('Prod the arcane glyph with the pole');
    expect(names.filter(n => /^(Listen at|Hold a flame to) the arcane glyph/.test(n))).toEqual([]);
  }, 90000);
  it('meets its goblins with words, at the odds the page tells, and a word that goes badly is answered', async () => {
    const { s } = await Delve.start('warrior');
    await Delve.walk(s, [...Delve.inn, /^Ask Fargrim about the old workings$/, ...Delve.road, /^Light a torch$/,
      /^Take the gallery to the crossing$/]);
    const met = /draw back to the edge of your light|go still when your light/;
    expect(await Delve.take(s, /^Talk to the goblins$/)).toMatch(met);
    expect(Delve.names(s)).toEqual(expect.arrayContaining(['Talk the goblins into letting you be · an even chance',
      'Face the goblins down · unlikely']));
    const said = await Delve.take(s, /^Talk the goblins into letting you be/);
    expect(said).toMatch(/persuasion check \(d20 \d+ \+ charisma -?\d+ = \d+ against 13\)/);
    const goblins = s.campaign.module.entities.find(e => e.name === 'the goblins')!.id;
    const test = (name: string, ...args: string[]) => s.campaign.world.test(ModuleWriter.call(name, ...args));
    // Tried once, whatever came of it; failing, they have no patience left and will come at a company that stays.
    expect(Delve.names(s).some(n => /^(Talk the goblins|Face the goblins)/.test(n))).toBe(false);
    expect(test('tolerates', goblins, 'party') || test('warned', goblins, 'party')).toBe(true);
  }, 90000);
});
