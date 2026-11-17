import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { PlaySession } from '../../../src/session/play-session';

// Feature pins: see test/features/choice/consequence.pin.test.ts.
describe('Interface › Save and load', () => {
  it('keeps where the company stands, the hour and what it has done, across a save', async () => {
    const t = await Tiny.start(`
      Place lane "the lane" is room at 0, 0 outdoors.
      Place hall "the hall" is room at 1, 0.
      Passage door "the door" is door between lane and hall taking 2 minutes.
      Company party "You" of 1 at lane.`);
    await t.play('To the hall');
    const kept = PlaySession.resume(JSON.parse(JSON.stringify(t.session.checkpoint())));
    expect(kept.campaign.world.one('at', 'party')).toBe('t__hall');
    expect(kept.campaign.events.length).toBe(t.campaign.events.length);
  });
});
describe('Interface › Journal and recap', () => {
  it.todo('unwritten: the notes hold the open threads and the decisions taken, and say what happened since a return');
});
describe('Interface › Choices with clear feedback', () => {
  it.todo('unwritten: every offered act says what it will do or risk before it is taken, in the voice');
});
describe('Interface › Accessibility and readability', () => {
  it.todo('unwritten: the text can be made larger and higher in contrast, and motion reduced, from the options');
});
