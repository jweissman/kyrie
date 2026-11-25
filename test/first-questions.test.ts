import { describe, expect, it } from 'bun:test';
import { FirstQuestions } from './support/first-questions';
import { GeneratedWorld } from './support/generated';
import { SceneModel } from '../src/ui/scene';
import { ScreenModel } from '../src/ui/screen-model';
import { Attending } from '../src/ui/attention';

// The player knows too much (OR-423, the owner's playtest of 25 November): the first innkeeper a new life met offered
// some seventeen questions about things it had never heard of. A census, by seed, of what the first people met offer
// before anything is learnt (see FirstQuestions): at most four questions each (two or three broad ones, the opening's
// own, besides taking leave), and the whole held to a ratchet that may only fall. Specific questions open on what the
// company has heard: asked what the matter is, the innkeeper's own open (the old quarry, the drain, the scholar
// upstairs), in the engine, for every client (toldMatter, the discovery rules').
// The world canary's (test/canary.json): a world is drawn for each seed, and a generator, kit or goings-on that moves
// every world can move this.
const ratchet: Record<string, number> = { iscoed: 64, a1: 57, bavokelu: 68 };
const most = 4;
// Each seed's world drawn once (a census puts the company here and there in it, and asks nothing).
const lives = new Map<string, ReturnType<typeof FirstQuestions.life>>();
const life = (seed: string) => lives.get(seed) ?? lives.set(seed, FirstQuestions.life(seed)).get(seed)!;

describe('the questions a new life is offered by the first people it meets', () => {
  for (const seed of Object.keys(ratchet)) {
    it(`are few and broad on ${seed}, before anything is learnt`, async () => {
      const asked = FirstQuestions.census(await life(seed));
      const over = asked.filter(a => a.questions.length > most).map(a => `${a.name}: ${a.questions.join(' | ')}`);
      expect(over).toEqual([]);
      expect(asked.reduce((n, a) => n + a.questions.length, 0)).toBeLessThanOrEqual(ratchet[seed]!);
    }, 120000);
  }
  it('open on what the company is told: the innkeeper\'s own, once asked what the matter is', async () => {
    const s = await life('iscoed'), c = s.campaign;
    GeneratedWorld.put(s, 's1_taproom');
    const said = () => (Attending.talk(SceneModel.build(ScreenModel.build(c)), 'region__s1_innkeeper')?.replies ?? [])
      .flatMap(r => [r, ...r.children ?? []]).map(r => r.label);
    expect(said().join(' | ')).not.toMatch(/old quarry|old drain|scholar upstairs|dead man/);
    await s.leg('region__s1_innkeeper_matter');
    expect(said().join(' | ')).toMatch(/old drain/);
    expect(said().join(' | ')).toMatch(/scholar upstairs/);
  }, 120000);
});
