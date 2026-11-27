import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { reflectedLanding } from './support/long-road';

const notes = (j: Journey): string[] => {
  const found = /The raven sings (high|low), (high|low), (high|low)/.exec(j.seen());
  if (!found) { throw new Error('The raven did not sing a three-note phrase'); }
  return found.slice(1);
};

describe('the raven sings', () => {
  it('lets the company try again, remember a phrase and take a real coil of line', async () => {
    const j = await reflectedLanding('raven-song');
    await j.play('Lift the hook out of the standing water', 'To the room of panes',
      'Ask the raven about her song', 'Listen to the raven\'s three notes');
    const first = notes(j)[0]!;
    await j.play(first === 'high' ? 'Sing a low note' : 'Sing a high note');
    expect(j.holds('lcSongMissed', 'party')).toBe(true);
    expect(j.holds('knows', 'party', 'lc_raven_line_known')).toBe(false);
    expect(j.offers('Listen to the raven\'s three notes')).toBe(false);
    await j.play('==+6', 'Listen to the raven\'s three notes');
    const phrase = notes(j);
    await j.play(`Sing a ${phrase[0]} note`);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play(`Sing a ${phrase[1]} note`, `Sing a ${phrase[2]} note`, 'Finish the song with the raven');
    expect(resumed.holds('lcSongWon', 'party')).toBe(true);
    expect(resumed.holds('knows', 'party', 'lc_raven_line_known')).toBe(true);
    await resumed.play('Take');
    expect(resumed.holds('carries', 'party', 'lc_raven_line')).toBe(true);
    expect(resumed.offers('Listen to the raven\'s three notes')).toBe(false);
  }, 10000);

  it('ends an unfinished song when the raven leaves to carry a message', async () => {
    const j = await reflectedLanding('raven-song-departure');
    j.assert('lcStarted', 'party');
    await j.play('Lift the hook out of the standing water', 'To the room of panes',
      'Ask the raven about the road', 'Ask the raven about her song', 'Listen to the raven\'s three notes');
    expect(j.holds('lcSongPlaying', 'party')).toBe(true);
    await j.play('Give the raven a ration to carry news to Merren');
    expect(j.holds('lcSongPlaying', 'party')).toBe(false);
    expect(j.holds('lcSongWon', 'party')).toBe(false);
    expect(j.offers('Sing a high note')).toBe(false);
  }, 10000);

  it('lets each of the three heard phrases be answered', async () => {
    const heard = new Set<string>();
    for (const seed of [0, 2, 9]) {
      const j = await reflectedLanding(`song-draw-${seed}`);
      await j.play('Lift the hook out of the standing water', 'To the room of panes',
        'Ask the raven about her song', 'Listen to the raven\'s three notes');
      const phrase = notes(j);
      heard.add(phrase.join(','));
      await j.play(...phrase.map(note => `Sing a ${note} note`), 'Finish the song with the raven');
      expect(j.holds('knows', 'party', 'lc_raven_line_known')).toBe(true);
    }
    expect(heard).toEqual(new Set(['high,high,low', 'high,low,high', 'low,high,high']));
  }, 10000);
});
