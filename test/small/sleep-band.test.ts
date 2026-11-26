import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';
import { ModuleWriter } from '../../src/lang/module-writer';
import { PlaySession } from '../../src/session/play-session';
import type { CreatureGenerationContext } from '../../src/content';
import { Laboratory } from '../../scripts/laboratory';

// A hostile spell cast at a band outside a fight (the casting-fiction invariant, CF-03; mission-22 brief Phase 4A:
// "Sleep and other hostile spells initiating or altering a confrontation"). `Resolve invoke(sleep, caster, band)` is
// the one route: a named caster who knows Sleep and can cast it now, the slot it costs in a fight, each of the band
// saving as in a fight, the sleepers asleep (not dead, not able) for as many watches as the spell lasts turns. Killing
// them is a separate act; what resists, or wakes, comes at the company (`assails`, the author's). The run's rats, as
// under the corn-store, and a barrow's dead, who do not sleep.
const run = (who: 'rats' | 'dead') => `
  Place warren "the run" is room at 0, 0.
  Person band "${who === 'rats' ? 'the rats' : 'the barrow dead'}" at warren {
    Role "what is in the run". Species ${who === 'rats' ? 'rat' : 'zombie'}. Numbers 3. }
  Company party "You" of 1 at warren.
  Action lull(actor: group, caster: member, site: place) "Have {caster} cast Sleep over {band}" {
    Requires able(actor) and at(actor, site) and at(band, site) and able(band) and memberOf(caster, actor)
      and awake(caster) and canCast(caster, sleep).
    Time 1 minutes.
    Resolve invoke(sleep, caster, band).
    On success { Assert assails(band, actor). }
    Result "{caster} speaks the words of Sleep over the run.".
  }
  Action do_for(actor: group, site: place) "Do for the sleepers where they lie" {
    Requires able(actor) and at(actor, site) and at(band, site) and not able(band) and not dead(band).
    Resolve combat(band).
    Result "It is quick, and not pleasant.".
  }`;
// An enchanter of the fifth level, who knows Sleep (a first-level spell since srd-proving-cases.md case 14), and an
// evoker of the same level, who does not.
const enchanter: CreatureGenerationContext = { name: 'Ysabel', raceId: 'human', classId: 'mage', level: 5,
  traits: ['enchanter'], spells: ['magic_missile', 'sleep', 'charm', 'psionic_blast', 'slow', 'fireball'] };
const evoker: CreatureGenerationContext = { name: 'Aud', raceId: 'human', classId: 'mage', level: 5 };
// The SRD's Sleep (case 14) is saved against at 11 + the casting score's modifier + half the casting level: on the
// seed 'lull' all three rats fail it (test/sleep holds a save that succeeds, and the four Hit Dice).
const names = (t: Tiny) => PlayerView.choices(t.campaign).map(r => r.choice.name);
const band = (t: Tiny) => t.campaign.readout.creatures.filter(c => /^t__band_person/.test(c.id));
// The fight that falls on the company (Engagement.assault): theirs, not one the company chose.
const fell = (t: Tiny) => t.campaign.events.some(e => /^attack\(party,t__band,/.test(e.action));
const able = (t: Tiny) => t.world.test(ModuleWriter.call('able', 't__band'));
const slots = (t: Tiny) => JSON.stringify(t.campaign.readout.creatures.find(c => c.id === 't__party_1')!.state.ready);

describe('Sleep cast over a band outside a fight', () => {
  it('is offered by name to a caster who knows it, and to no one who does not', async () => {
    expect(names(await Tiny.start(run('rats'), { party: [enchanter] }))).toContain('Have Ysabel cast Sleep over the rats');
    expect(names(await Tiny.start(run('rats'), { party: [evoker] })).filter(n => /Sleep/.test(n))).toEqual([]);
  });

  describe('Sleep in the generated corn-store', () => {
    for (const [seed, saves, words] of [
      ['a', [true, false], 'Some rats still move.'],
      ['e', [true, true], 'Some rats still move.'],
      ['f', [false, false], 'The remaining rats lie still.']
    ] as const) {
      it(`tells the outcome of the rats' saves (${seed})`, async () => {
        const t = await Tiny.start(Laboratory.text(), { party: [enchanter], seed });
        t.journey.put('party', 'lab__low_u_warren');
        const caster = () => t.campaign.readout.creatures.find(c => c.id === 'lab__party_1')!;
        const before = JSON.stringify(caster().state.ready);
        await t.play('Have Ysabel cast Sleep over the rats in the run');
        const event = t.campaign.events.find(e => e.action.includes('rats_slept'))!;
        expect(event.combat.filter(e => e.type === 'save').map(e => e.success)).toEqual([...saves]);
        expect(event.response).toContain(words);
        expect(JSON.stringify(caster().state.ready)).not.toBe(before);
        expect(event.response?.includes('come at you')).toBe(saves.some(Boolean));
      });
    }
  });
  it('spends the slot, rolls each save, and lays the band asleep, not dead, until a separate act does for them', async () => {
    const t = await Tiny.start(run('rats'), { party: [enchanter], seed: 'lull' }), before = slots(t);
    await t.play('Have Ysabel cast Sleep over the rats');
    const combat = t.campaign.events.at(-1)!.combat;
    expect(combat.find(e => e.type === 'action')).toMatchObject({ command: { actor: 't__party_1', ability: 'sleep' } });
    expect(combat.filter(e => e.type === 'save').length).toBe(3);
    expect(slots(t)).not.toBe(before);
    expect(band(t).every(c => c.state.hp > 0 && c.state.conditions.some(s => s.id === 'asleep' && s.clock === 'world-time')))
      .toBe(true);
    // Asleep: not able, so no fight is offered with them and none falls on the company; killing them is its own act.
    expect(able(t)).toBe(false);
    expect(names(t)).not.toContain('Attack the rats');
    expect(names(t)).not.toContain('Have Ysabel cast Sleep over the rats');
    // Kept as it is across a save and a reload.
    const kept = PlaySession.resume(JSON.parse(JSON.stringify(t.session.checkpoint())));
    expect(kept.campaign.readout.creatures.filter(c => /^t__band_person/.test(c.id))
      .every(c => c.state.conditions.some(s => s.id === 'asleep'))).toBe(true);
    await t.play('Do for the sleepers where they lie');
    expect(band(t).every(c => c.state.hp === 0)).toBe(true);
  });
  it('counts a fixed body by its Hit Dice when the band is met at a higher level', async () => {
    const text = run('rats').replace('Species rat. Numbers 3.', 'Species dog. Variant drove. Numbers 3. Level 7.');
    const t = await Tiny.start(text, { party: [enchanter], seed: 'lull' });
    expect(band(t).every(c => c.raceId === 'dog/drove' && c.base.level === 7)).toBe(true);
    await t.play('Have Ysabel cast Sleep over the rats');
    expect(t.campaign.events.at(-1)!.combat.filter(e => e.type === 'save').length).toBe(3);
  });
  it('wears off as the world\'s clock runs, and those who wake come at the company', async () => {
    const t = await Tiny.start(run('rats'), { party: [enchanter], seed: 'lull' });
    await t.play('Have Ysabel cast Sleep over the rats');
    expect(fell(t)).toBe(false);
    // Ten rounds, ten watches outside a fight (FieldUse: as many watches as turns).
    await t.play('Wait an hour');
    expect(band(t).every(c => c.state.conditions.some(s => s.id === 'asleep'))).toBe(true);
    await t.play('Wait an hour');
    expect(band(t).some(c => c.state.conditions.some(s => s.id === 'asleep'))).toBe(false);
    expect(fell(t)).toBe(true);
  });
  it('lays none of the dead asleep, and they come at the company at once', async () => {
    const t = await Tiny.start(run('dead'), { party: [enchanter] });
    await t.play('Have Ysabel cast Sleep over the barrow dead');
    const told = t.campaign.events.flatMap(e => e.combat), cast = told.findIndex(e => e.type === 'action');
    expect(told.slice(cast, cast + 4).filter(e => e.type === 'save' && e.immune).length).toBe(3);
    expect(band(t).some(c => c.state.conditions.some(s => s.id === 'asleep'))).toBe(false);
    // The fight they began, there and then, after the casting is said (CL-10: it had been put over by the onset).
    expect(t.campaign.events.find(e => /lull/.test(e.action))!.response)
      .toBe('Ysabel speaks the words of Sleep over the run. The barrow dead come at you!');
    expect(fell(t)).toBe(true);
  });
});
