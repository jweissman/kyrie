import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { VoiceContext } from '../../src/narrative/voice-context';

// Under the ground there is no hour to speak of: Tessary's clerks in a hall under the sea said "Mind how you go in the
// dark" (TS-W19, NAR-06). A green and an old working beside it, after dark; test/voice.test.ts keeps the same in
// wren's generated workings.
const green = `
  Place green "the green" is room at 0, 0 outdoors.
  Place adit "the old adit" is room at 1, 0 underground.
  Passage mouth "the adit mouth" is path between green and adit.
  Company party "You" of 1 at green.
  Goal false.`;
const hour = (t: Tiny) => {
  const v = VoiceContext.of(t.campaign, { kind: 'farewell' } as never, new Set());
  return [v.time, v.shelter];
};

describe('the hour, as the voice tables have it, on a green', () => {
  it('is night above ground at night, and no hour below it', async () => {
    const t = await Tiny.start(green);
    expect(hour(t)).toEqual(['day', 'outdoors']);
    await t.perform('wait_for_dark');
    expect(hour(t)).toEqual(['night', 'outdoors']);
    t.journey.put('party', 't__adit');
    expect(hour(t)).toEqual(['day', 'underground']);
  });
});
