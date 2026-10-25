import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { GeneratedWorld } from './support/generated';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { ModuleParser } from '../src/lang/module-parser';

// The narrator chooses what to tell. What someone says when asked is said in their words, where they say it; the sky
// is told when the company comes out under it, not at every step under the same sky, and never under a roof as if it
// were outside; and the passing life of a place is told the first time. a1: Murkstede, its inn, and Eikwudu.
class Telling {
  static async start() {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return PlaySession.start(w.path, 'a1', w.source);
  }
  // Does a choice, and tells it as the page would.
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name) || pattern.test(x.choice.id));
    if (!c) { throw new Error(`No choice like ${pattern}`); }
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const feedback = ActionFeedbackView.read(s.campaign, event, before);
    const moved = before.location?.id !== s.campaign.world.one('at', 'party');
    return Narrator.leaf(s.campaign, ScreenModel.build(s.campaign), { event, feedback, said: c.choice.name, moved });
  }
}

describe('the narrator', () => {
  it('names someone by a role that says who they are without an article: Gale, who speaks for Harrehes', async () => {
    const w = await WorldAssembler.assemble('b2', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'b2', w.source);
    GeneratedWorld.put(s, 's4_green');
    await s.perform('wait');
    const presence = Narrator.leaf(s.campaign, ScreenModel.build(s.campaign)).presence.join(' ');
    expect(presence).toContain('Gale, who speaks for Harrehes');
    expect(presence).not.toContain('a who');
  }, 60000);
  it('sets an answer as the words of whoever gave it', () => {
    expect(Narrator.speech('A drover went out three days ago and did not come home. His dog did.', 'Eamon'))
      .toBe('‘A drover went out three days ago and did not come home,’ says Eamon. ‘His dog did.’');
    expect(Narrator.speech('The barrow is open.', 'Cyril')).toBe('‘The barrow is open,’ says Cyril.');
  });
  it('tells what someone was asked in their words, on the page, not in the journal', async () => {
    const s = await Telling.start();
    // Whoever keeps the inn where the drover's story is set has heard of him.
    for (const n of [1, 2, 3, 4, 5]) {
      GeneratedWorld.put(s, s.campaign.world.one('at', `region__s${n}_innkeeper`)!.replace(/^region__/, ''));
      await s.perform('wait');
      if (PlayerView.choices(s.campaign).some(c => / about the drover/.test(c.choice.name))) { break; }
    }
    const asked = await Telling.take(s, /^Ask (\w+) about the drover/);
    const keeper = /^Ask (\w+) about the drover/.exec(asked.exchange!.said ?? '')?.[1] ?? '';
    const speech = asked.exchange!.lines.filter(l => l.kind === 'speech').map(l => l.text);
    expect(speech.join(' ')).toContain(`says ${keeper}`);
    expect(asked.exchange!.lines.some(l => /tells you what they have heard/.test(l.text))).toBe(false);
  }, 60000);
  it('tells the sky on coming out under it, not again on the next step, and not as if outside under a roof', async () => {
    const s = await Telling.start();
    const outside = (s.campaign.module.observations ?? []).filter(o => o.aspect === 'weather' && o.place === 'region__s1_green')
      .map(o => o.text);
    const told = (leaf: { situation: string[] }) => outside.filter(t => leaf.situation.join(' ').includes(t));
    // Walking in from the causeway, under the same sky: not told again.
    expect(told(await Telling.take(s, /s1_green\)$/))).toEqual([]);
    // Indoors, what is said of the green's sky is not said.
    expect(told(await Telling.take(s, /Lucky Phoenix$/))).toEqual([]);
    // Coming out under it, it is told; walking on under it, not again.
    expect(told(await Telling.take(s, /s1_green\)$/)).length).toBeGreaterThan(0);
    const wood = await Telling.take(s, /to the edge of Eikwudu/);
    const woodSky = (s.campaign.module.observations ?? []).filter(o => o.aspect === 'weather' && o.place === 'region__z3_edge')
      .map(o => o.text);
    expect(woodSky.filter(t => wood.situation.join(' ').includes(t))).toEqual([]);
  }, 60000);
  it('tells the passing life of a place the first time only', async () => {
    const s = await Telling.start();
    await Telling.take(s, /s1_green\)$/);
    const first = await Telling.take(s, /to the edge of Eikwudu/), clearing = await Telling.take(s, /charcoal-burners/);
    expect(clearing.situation.join(' ')).toContain('A woodpecker is at work');
    await Telling.take(s, /to the edge of Eikwudu/);
    const again = await Telling.take(s, /charcoal-burners/);
    expect(again.situation.join(' ')).not.toContain('A woodpecker is at work');
    expect(first.situation.length).toBeGreaterThan(0);
  }, 60000);
  it('reads a place\'s shelter and an observation\'s aspect and who notices it', () => {
    const m = ModuleParser.parse(`Module t "T" { Kind place. Kind capability. Entity lore: capability "Lore".
      Place hall "the hall" is room at 0, 0 indoors. Observe marks at hall as feature noticed by lore when true "Letters.".
      Goal false. }`);
    expect(m.entities.find(e => e.id === 'hall')?.space?.shelter).toBe('indoors');
    expect(m.observations?.[0]).toMatchObject({ aspect: 'feature', by: 'lore' });
  });
  // The follow-up review was told "Immeral sees it first" in a company with no Immeral: a traveller of the country is
  // a fellow before joining. In cov3 a lone ranger sees the sign at w8 for herself, with Hector still at home.
  it('credits what is noticed only to one of the company', async () => {
    const w = await WorldAssembler.assemble('cov3', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Mira', raceId: 'human', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'cov3', w.source);
    GeneratedWorld.put(s, 'w8');
    expect(JSON.stringify(Narrator.leaf(s.campaign, ScreenModel.build(s.campaign)))).not.toContain('sees it first');
  }, 60000);
  // The follow-up review read the same willows and meadowsweet again and again on its journeys.
  it('tells what grows along the way where it is first met, and leaves it to be gathered after', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'thorn', w.source), world = s.campaign.world;
    const willows = world.related('grows').map(r => r.args[0]!).filter(id => id.endsWith('_willow'));
    const told = async (stand: string) => {
      GeneratedWorld.put(s, world.one('at', stand)!.replace(/^region__/, ''));
      await s.perform('wait');
      const screen = ScreenModel.build(s.campaign);
      return { said: Narrator.leaf(s.campaign, screen).presence.some(p => p.startsWith('Willows lean out')),
        there: screen.things.some(t => t.id === stand) };
    };
    expect(await told(willows[0]!)).toEqual({ said: true, there: true });
    expect(await told(willows[1]!)).toEqual({ said: false, there: true });
  }, 60000);
});
