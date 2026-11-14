import { describe, expect, it } from 'bun:test';
import { Atlas, type Kind } from '../support/atlas';
import { RunnerFidelity } from '../../src/cli/runner-fidelity';

// Promise fidelity (the owner, 15 November: experiential pins by family). A facet the atlas draws on an act is a
// promise that doing it brings that kind of thing: to gain, something comes to the company; to learn, it knows
// something; a companion, someone is willing to come; a danger, something hostile is met; worth a look, somewhere not
// been. Asked of the act's own consequence (the event's changes), never of its words; an opener (a talk) by the act
// inside it that the facet is for. Each kind as the shared rules write it (Atlas), done in a fresh world.
describe('a facet drawn is a promise the act keeps', () => {
  for (const kind of ['companion', 'danger', 'payoff', 'knowledge'] as Kind[]) {
    it(`where ${kind} lies on the green`, async () => {
      const t = await Atlas.start(kind, 'green');
      const read = await RunnerFidelity.of(t.glance, async () => (await Atlas.start(kind, 'green')).session);
      expect(read.drawn).toContain(Atlas.facet[kind]);
      expect(read.broken).toEqual([]);
    });
  }
  it('is broken where an act is drawn for what it does not bring', async () => {
    const fork = async () => (await Atlas.start('payoff', 'green')).session;
    const read = await RunnerFidelity.of((await Atlas.start('payoff', 'green')).glance, fork,
      { payoff: ['go(t__g_l,t__lane)'] });
    expect(read.broken).toEqual(['To the lane: drawn payoff, brought none']);
  });
});
