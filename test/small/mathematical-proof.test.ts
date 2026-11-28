import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Checks } from '../../src/rules/checks';
import { CombatPresenter } from '../../src/ui/combat-presenter';
import { LineMoments } from '../../src/presentation/line-moments';
import { MathematicalTraces } from '../../src/world/mathematical-traces';

const fragment = `Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Entity hard_proof: difficulty "a difficult proof".
  Initially Set toBeat(hard_proof) to 40.
  Relation proved(group).
  Action infer(actor: group) "Resolve the encountered pattern" {
    Requires able(actor) and not proved(actor). Resolve check(actor, mathematics, hard_proof).
    On success { Assert proved(actor). }
    Result "The encountered pattern resolves. The room beyond it remains unknown.".
  }`;
const people = [{ name: 'Elen', raceId: 'human', classId: 'warrior', level: 3, perk: 'mathematician' }];

describe('mathematical proof', () => {
  it('uses a living mathematician even beside a stronger untrained reader, and tells proof honestly', async () => {
    const t = await Tiny.start(fragment.replace('of 1 at', 'of 2 at'), { horizon: ['fantasy', 'canon'], party: [...people,
      { name: 'Bran', raceId: 'human', classId: 'mage', level: 18 }] });
    const odds = Checks.odds(t.campaign.catalog, t.campaign.readout.creatures, 'mathematics', { difficulty: 40 });
    expect(odds).toBe('sure');
    await t.play('Resolve the encountered pattern');
    const check = t.campaign.events.at(-1)!.combat.find(e => e.type === 'check')!;
    expect(check).toMatchObject({ actor: 't__party_1', difficulty: 40, die: 20, success: true, proof: true });
    const line = CombatPresenter.format(check, { combatants: [], turn: 0, actor: '', outcome: null });
    expect(line).toContain('by proof against 40');
    expect(LineMoments.roll(line)).toMatchObject({ made: true, sure: true, need: 1 });
    const down = structuredClone(t.campaign.readout.creatures);
    down[0]!.state.hp = 0;
    expect(Checks.maker(t.campaign.catalog, down, 'mathematics')?.id).toBe('t__party_2');
    down[0]!.state.hp = 10;
    down[0]!.state.conditions = [{ id: 'stunned', remaining: 1, clock: 'until-removed' }];
    expect(Checks.maker(t.campaign.catalog, down, 'mathematics')?.id).toBe('t__party_2');
  });
  it('rolls untrained attempts at DC 35, with a natural-twenty breakthrough and no ordinary-skill override', async () => {
    const t = await Tiny.start(fragment, { horizon: ['fantasy', 'canon'],
      party: [{ name: 'Bran', raceId: 'human', classId: 'warrior', level: 1 }] });
    const creatures = t.campaign.readout.creatures, catalog = t.campaign.catalog;
    const draws = Array.from({ length: 80 }, (_, n) => Checks.make(catalog, creatures,
      { skill: 'mathematics', difficulty: 10, seed: `proof-${n}` })[0]!);
    expect(draws.every(e => e.type === 'check' && e.difficulty === 35 && e.die && !e.unrolled)).toBe(true);
    const twenty = draws.find(e => e.type === 'check' && e.die === 20)!;
    expect(twenty).toMatchObject({ success: true });
    expect(LineMoments.roll(CombatPresenter.format(twenty,
      { combatants: [], turn: 0, actor: '', outcome: null }))).toMatchObject({ made: true, need: 20 });
    expect(draws.some(e => e.type === 'check' && !e.success)).toBe(true);
    expect(Checks.make(catalog, creatures, { skill: 'lockwork', difficulty: 40, seed: 'ordinary' })[0])
      .toMatchObject({ success: false, unrolled: true });
    expect(Checks.make(catalog, [], { skill: 'mathematics', difficulty: 10, seed: 'none' })[0])
      .toMatchObject({ difficulty: 35, success: false });
  });
  it('selects the best effective mathematical check, accounting for training and higher authored difficulties', async () => {
    const t = await Tiny.start(fragment.replace('of 1 at', 'of 2 at'), { horizon: ['fantasy', 'canon'], party: [
      { name: 'Elen', raceId: 'human', classId: 'warrior', level: 1 },
      { name: 'Bran', raceId: 'human', classId: 'warrior', level: 1 }] });
    const creatures = structuredClone(t.campaign.readout.creatures), catalog = t.campaign.catalog;
    creatures[0]!.state.skills = ['mathematics'];
    creatures[0]!.base.intelligence = 20;
    creatures[1]!.base.intelligence = 28;
    expect(Checks.total(catalog, creatures[1]!, 'mathematics'))
      .toBeGreaterThan(Checks.total(catalog, creatures[0]!, 'mathematics'));
    expect(Checks.make(catalog, creatures, { skill: 'mathematics', difficulty: 10, seed: 'trained' })[0])
      .toMatchObject({ actor: creatures[0]!.id, difficulty: 30, trained: 2 });
    expect(Checks.odds(catalog, creatures, 'mathematics', { difficulty: 10 }))
      .toBe(Checks.odds(catalog, [creatures[0]!], 'mathematics', { difficulty: 10 }));
    expect(Checks.make(catalog, creatures, { skill: 'mathematics', difficulty: 40, seed: 'higher' })[0])
      .toMatchObject({ actor: creatures[1]!.id, difficulty: 40 });
  });
  it('replays ordinary traces and yields a real portable witness without claiming a wonder', async () => {
    const seeds = Array.from({ length: 160 }, (_, n) => `trace-${n}`);
    const seed = seeds.find(s => MathematicalTraces.lines(s, 'yard', 'trace').length)!;
    expect(seed).toBeDefined();
    expect(seeds.some(s => !MathematicalTraces.lines(s, 'yard', 'trace').length)).toBe(true);
    const lines = MathematicalTraces.lines(seed, 'yard', 'trace');
    expect(lines).toEqual(MathematicalTraces.lines(seed, 'yard', 'trace'));
    const t = await Tiny.start(`Place yard "the yard" is room at 0, 0 outdoors.
      Company party "You" of 1 at yard. ${lines.join('\n')}`,
    { horizon: ['fantasy', 'canon', 'probing'], party: people });
    expect(t.journey.holds('carries', 'party', 'trace_rubbing')).toBe(false);
    const act = t.glance.acts.find(a => a.subject === 't__trace');
    expect(act).toBeDefined();
    expect(act?.aspects).not.toContain('wonder');
    await t.play('^Resolve ', '^Take .*rubbing');
    expect(t.journey.holds('carries', 'party', 'trace_rubbing')).toBe(true);
    expect(t.journey.holds('itemKind', 'trace_rubbing', 'mathematical_rubbing')).toBe(true);
  });
  it('rejects a non-perk supplied through the chosen-perk field', async () => {
    await expect(Tiny.start(fragment, { horizon: ['fantasy', 'canon'],
      party: [{ ...people[0]!, perk: 'unknown_perk' }] }))
      .rejects.toThrow('no playable perk');
  });
});
