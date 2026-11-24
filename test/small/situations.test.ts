import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Situations } from '../../src/lang/situations';
import { WhyProcess } from '../../src/cli/why-process';

// A Situation of Incidents (BRIEF §6; AU-55, OR-196): what a bounded scene is, said over the facts its declarations
// keep, lowered to a record and no rule, so that play is as it was; its phase is the first that holds (done, turned,
// each incident open, the core first, before); and the lint holds it to a turn, a core, and incidents the play can
// resolve. A yard with a gate to be opened (the core), a dog to be quietened, and done in the lane.
const yard = `Place yard "the yard" is room at 0, 0 outdoors. Place lane "the lane" is room at 1, 0 outdoors.
  Company party "You" of 1 at yard.
  Relation quiet(entity). Relation open(entity). Entity dog: entity "the dog". Entity gate: entity "the gate".
  Action hush(actor: group) "Hush the dog" { Requires at(actor, yard) and not quiet(dog). On success { Assert quiet(dog). } }
  Action unlatch(actor: group) "Lift the latch" { Requires at(actor, yard) and not open(gate). On success { Assert open(gate). } }
  Passage out "the gate" is passage between yard and lane opening when open(gate) "The gate is shut.".
  Situation leaving "Leaving the yard" at yard {
    Incident dog "the dog that barks at everyone" of dog resolved when quiet(dog).
    Core gate "the gate onto the lane" of gate resolved when open(gate).
    Turn "the latch lifts" when open(gate).
    Done when at(party, lane).
  }`;
const phase = (t: Tiny) => WhyProcess.phase(t.journey, (t.campaign.module.semantic ?? [])
  .find(r => r.kind === 'situation')!)?.id;
describe('a Situation of Incidents', () => {
  it('is a record of its incidents, its turn and its end, and no rule the runtime runs', async () => {
    const t = await Tiny.start(yard);
    const r = t.campaign.module.semantic!.find(x => x.kind === 'situation')!;
    expect([r.name, r.words, r.phases.map(p => p.id)]).toEqual(['leaving', 'Leaving the yard',
      ['done', 'turned', 'gate', 'dog', 'before']]);
    expect(r.lowered.rules).toEqual([]);
    expect(r.participants.map(p => p.role)).toEqual(['at', 'in dog', 'in gate']);
    expect(Situations.lint(t.campaign.module)).toEqual([]);
  });
  it('is in the phase its facts say: the core open, then turned, then done', async () => {
    const t = await Tiny.start(yard);
    expect(phase(t)).toBe('gate');
    await t.play('Hush the dog');
    expect(phase(t)).toBe('gate');
    await t.play('Lift the latch');
    expect(phase(t)).toBe('turned');
    await t.play('To the lane');
    expect(phase(t)).toBe('done');
  });
  it('is held by the lint to a turn, a core, and incidents that something can resolve', async () => {
    const bare = yard.replace('    Turn "the latch lifts" when open(gate).\n', '').replace('Core gate', 'Incident gate')
      .replace('resolved when quiet(dog)', 'resolved when asleep(dog)').replace('Relation quiet(entity).',
        'Relation quiet(entity). Relation asleep(entity).');
    const t = await Tiny.start(bare);
    expect(Situations.lint(t.campaign.module)).toEqual(['Situation leaving has no Turn: say where something significant'
      + ' changes.', 'Situation leaving has no Core: say what must be resolved before it is done.',
    'Situation leaving\'s incident leaving_dog can never be resolved: nothing makes asleep hold.']);
  });
});
