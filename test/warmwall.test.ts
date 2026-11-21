import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/warmwall/journey.json';

// The Warm Wall, played by the labels a player sees: the two keepers, the failing spring, and the man at the gate on
// the second evening. Each test is one way the three days can go.
describe("The Warm Wall", () => {
  const campaign = 'data/campaigns/warmwall.campaign.json';
  const start = async () => Journey.start(campaign, "warmwall");
  const reached = (j: Journey, ending: string) => j.holds('reached', 'warmwall__' + ending);

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('is played from the road into the yard, where a boy asks which door', async () => {
    const j = await start();
    await j.play(...steps.arrive);
    expect(j.at('party')).toBe("warmwall__yard");
    expect(j.page).toContain('Pen');
  }, 60000);

  it('learns from the Throat that the spring is overdrawn, and tells each keeper', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.research);
    expect(j.holds('knows', 'party', 'warmwall__overdraw_known')).toBe(true);
    expect(j.holds('evidenced', 'warmwall__maud')).toBe(true);
    expect(j.holds('evidenced', 'warmwall__nesta')).toBe(true);
    // Told why, neither will move: each wants to be assured of the other first.
    expect(j.holds('willingToEase', 'warmwall__maud')).toBe(false);
    expect(j.offers('Turn the Hot Side\'s wheel')).toBe(false);
  }, 120000);

  it('lets a man die on the step if nobody brings him in', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 2 18:00');
    expect(j.holds('at', 'warmwall__osric', 'warmwall__yard')).toBe(true);
    await j.play('=day 3 06:00');
    expect(reached(j, 'step_again')).toBe(true);
    expect(j.page).toContain('frost in his eyebrows');
  }, 120000);

  it('brings him through the hatch in four buckets, and the two keepers speak for the first time', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.research, ...steps.evening, ...steps.hatch);
    expect(j.measure('bucketsPassed')).toBe(4);
    expect(j.holds('warmed', 'warmwall__osric')).toBe(true);
    expect(j.holds('hatchMade', 'party')).toBe(true);
    expect(j.latest).toContain('I know what hot water is, Veale');
    expect(j.latest).toContain('Has he been coming?');
    expect(j.holds('willingToEase', 'warmwall__maud')).toBe(true);
    expect(j.holds('willingToEase', 'warmwall__nesta')).toBe(true);
  }, 180000);

  it('goes by the honest road: the stone, the bed, the maul, the word, and a door in the wall', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.stone, ...steps.research, ...steps.evening, ...steps.hatch, ...steps.learn);
    expect(j.holds('knows', 'party', 'warmwall__maud_secret')).toBe(true);
    await j.play(...steps.carry);
    expect(j.holds('softened', 'warmwall__maud')).toBe(true);
    expect(j.holds('softened', 'warmwall__nesta')).toBe(true);
    expect(j.page).toContain('You take Nesta’s mason’s maul');
    await j.play(...steps.word);
    expect(j.holds('wordGiven', 'party')).toBe(true);
    expect(j.holds('bothEased')).toBe(true);
    await j.play(...steps.breach);
    expect(j.holds('state', 'warmwall__wall', 'warmwall__breached')).toBe(true);
    await j.play('=+3');
    expect(reached(j, 'door_in_the_wall')).toBe(true);
    expect(j.page).toContain('Mind the pipe behind the third course');
    expect(j.page).toContain('nobody will');
  }, 240000);

  it('takes him round to the stoke door at Maud\'s word, and nobody is told', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.research, ...steps.evening, '^Into the Hot Side', ...steps.stoke);
    expect(j.holds('warmed', 'warmwall__osric')).toBe(true);
    expect(j.holds('routeStoke', 'party')).toBe(true);
    expect(j.at('warmwall__osric')).toBe('warmwall__hot_wheel');
    expect(j.latest).toContain('It is not a trouble');
    expect(j.holds('droveGone', 'party')).toBe(false);
  }, 180000);

  it('costs the Hot Side its drove if he is brought in at the front, unprepared', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.evening, ...steps.hall, '^Into the Hot Side');
    await j.play('=+2');
    expect(j.holds('droveGone', 'party')).toBe(true);
    expect(j.page).toContain('boots in its hands');
    expect(j.at('warmwall__gethin')).toBeUndefined();
  }, 180000);

  it('lets the drove hear him in the dark, before dawn, and nobody sees whose voice it is', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.research, ...steps.drove, ...steps.evening, ...steps.hatch);
    await j.play('^Into the Cold Side by the hatch', "^To the Cold Side's hall", 'Talk to Osric', 'Ask Osric about Madoc');
    expect(j.holds('knows', 'party', 'warmwall__madoc_message')).toBe(true);
    await j.play('=day 3 05:10');
    expect(j.at('warmwall__gethin')).toBe('warmwall__steam');
    await j.play('Take Osric into the steam room before the drove');
    expect(j.holds('gethinHeard', 'party')).toBe(true);
    expect(j.latest).toContain('the pike was his own idea');
    expect(j.latest).toContain('nobody sees whose they are');
  }, 240000);

  it('can be eased by a lie told to each, and holds for a winter', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.research);
    j.roll('pass');
    await j.play('^Into the Cold Side', 'Talk to Nesta', 'Tell Nesta that Maud has already eased', '^To the cold wheelhouse', "Turn the Cold Side's wheel",
      "^To the Cold Side's hall", '^Out to the bath-yard', '^Into the Hot Side', 'Talk to Maud', 'Tell Maud that Nesta has already eased',
      '^To the hot wheelhouse', "Turn the Hot Side's wheel");
    expect(j.holds('lied', 'party')).toBe(true);
    expect(j.holds('bothEased')).toBe(true);
    j.roll();
    await j.play(...steps.evening, '^To the Hot Side\'s hall', ...steps.stoke);
    await j.play('=day 3 21:30');
    expect(j.measure('heat')).toBeGreaterThanOrEqual(3);
    expect(reached(j, 'even_heat')).toBe(true);
    expect(j.page).toContain('Pen, who knows, has told nobody');
  }, 240000);

  it('is only a failed lie when the die falls the other way, and the keeper will not be told twice', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.research);
    j.roll('fail');
    await j.play('^Into the Cold Side', 'Talk to Nesta', 'Tell Nesta that Maud has already eased');
    expect(j.holds('lied', 'party')).toBe(false);
    expect(j.holds('lieTriedNesta', 'party')).toBe(true);
    expect(j.offers('Tell Nesta that Maud has already eased')).toBe(false);
  }, 180000);

  it('sings the old duet through the wall, and a bard supplies the third part', async () => {
    const j = await start();
    await j.play(...steps.arrive, "^Into the Hot Side", "^To the hot pool", "^To the steam room", 'Talk to Ottoline', 'Ask Ottoline why she comes', 'Ask Ottoline to sing the old duet');
    expect(j.holds('songDone', 'party')).toBe(true);
    expect(j.holds('reassured', 'warmwall__maud')).toBe(true);
    expect(j.holds('reassured', 'warmwall__nesta')).toBe(true);
  }, 120000);

  it('lets the wall stand when the two are brought by the song to give the word together', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.research, '^Into the Hot Side', '^To the hot pool', '^To the steam room', 'Talk to Ottoline', 'Ask Ottoline why she comes', 'Ask Ottoline to sing the old duet',
      '^To the hot pool', "^To the Hot Side's hall", ...steps.evening, ...steps.stoke);
    await j.play('^Into the Hot Side', 'Talk to Maud', 'Ask Maud to stand at her wheel', '^To the hot wheelhouse');
    await j.play('Give the word through the hatch');
    expect(j.holds('wordGiven', 'party')).toBe(true);
    expect(j.latest).toContain('Two,’ says Nesta, who has never in her life waited for three');
    await j.play('=day 3 21:30');
    expect(reached(j, 'warm_wall')).toBe(true);
    expect(j.page).toContain('either of them will tell you the other began'.replace('either of them', 'both women'));
  }, 240000);

  it('lets a bard in the company supply the third part', async () => {
    const j = await Journey.start(campaign, 'warmwall', { party: [{ name: 'Wenna', raceId: 'human', classId: 'bard' }] });
    await j.play(...steps.arrive, '^Into the Hot Side', '^To the hot pool', '^To the steam room', 'Talk to Ottoline', 'Ask Ottoline why she comes', 'Ask Ottoline to sing the old duet');
    expect(j.holds('thirdPart', 'party')).toBe(true);
    expect(j.latest).toContain('exactly where it went');
  }, 120000);

  it('can be brought to say the words over the stone, by a brother who has found a loophole in his oath', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.stone, ...steps.research, ...steps.evening, ...steps.hatch, ...steps.learn);
    await j.play('^Out to the bath-yard', '^Into the Cold Side', '^To the plunge', 'Talk to Brother Cuthwin', 'Ask Brother Cuthwin why he will not go in',
      'Point out that the plunge is cold', 'Ask Brother Cuthwin to try the plunge', 'Ask Brother Cuthwin to say the words over the stone');
    expect(j.holds('cuthwinPlunged', 'party')).toBe(true);
    await j.play("^To the Cold Side's hall", '^Out to the bath-yard', '^To the drying green', 'Have Brother Cuthwin say the words over the stone');
    expect(j.holds('stoneHallowed', 'party')).toBe(true);
    expect(j.latest).toContain('Ammet Sallis');
  }, 240000);

  it('is cold water if the man is saved and nothing else is done by the last night', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.research, ...steps.evening, '^Into the Hot Side', ...steps.stoke);
    await j.play('=day 3 21:30');
    expect(j.measure('heat')).toBe(1);
    expect(reached(j, 'cold_water')).toBe(true);
    expect(j.page).toContain('sell the roof to a brewer');
  }, 240000);
});
