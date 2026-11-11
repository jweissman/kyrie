import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Endings } from '../src/lang/endings';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/skerrow/journey.json';

// The Dorothea and the Light on Scarth Holm are one works from two ends (doc/architecture/activation/corpus/
// dorothea-skerrow.md). The Dorothea ends at Tolleth quay, by what the voyage left on Skerrow: played here by the
// labels a player sees, three ways. What became of the Pharos is told, once, as the ketch leaves the island, and the
// Scarth light reads it; the Scarth light's keeper is read on the island in turn.
//
// Not played from a start to an end in one world: the two campaigns are separate sessions, so the cross-reads set the
// world event they would hear (`j.assert('befell', …)`), as test/lore-links.test.ts does. The sea table is off in the
// Dorothea journeys (`seaQuiet`), as in the other Dorothea specs, and dice are fixed where a check stands in the way.
const dorothea = 'data/campaigns/the-dorothea.campaign.json';
const scarth = 'data/campaigns/skerrow.campaign.json';
const k = (id: string) => `dorothea__${id}`;
const title = (j: Journey) => Endings.reached(j.campaign.world)?.title;
const told = (j: Journey) => j.taken.map(x => `${x.page} ${x.told}`).join('\n');

const start = async () => {
  const j = await Journey.start(dorothea, 's1');
  j.assert(k('seaQuiet'), k('hull'));
  return j;
};
const isle = async (j: Journey) => {
  await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Pay Captain Bascom six', "^To the Dorothea's waist",
    '=180', '^To the quarterdeck', 'lie off', '=215', "^To the Dorothea's waist", '^To Skerrow jetty', '^To Skerrow green');
};
const landedAt = (j: Journey) => j.measure(k('reachedAt'), k('hull')) as number;
// Down to the jetty, aboard, and wait for the ebb and the passage home.
const sailHome = async (j: Journey) => {
  await j.play('^To the jetty road|^To Skerrow jetty', '^To the Dorothea', '=+400');
};

describe('The Dorothea, how it ends', () => {
  it('lints clean', async () => {
    expect((await KyrLint.campaign(dorothea)).filter(f => f.level === 'error')).toEqual([]);
  }, 120000);

  it('ends in What the Lamp Is For when the winter is stood and the lamp kept, and tells the Pharos lit', async () => {
    const j = await start();
    await isle(j);
    await j.play('^Into the Gull', 'Ask Silas Quillon what he wants', '^Out to');
    await j.play('Offer to stand Jory Kestle');
    expect(j.holds(k('keptLamp'), 'party')).toBe(true);
    expect(title(j)).toBeUndefined();
    await sailHome(j);
    expect(j.holds(k('safeHome'), k('hull'))).toBe(true);
    expect(title(j)).toBe('What the Lamp Is For');
    expect(j.holds('befell', 'pharos_lit')).toBe(true);
    expect(j.holds('befell', 'pharos_dark')).toBe(false);
  }, 500000);

  it('ends in The Net on the Table when the bronze is sold, the island is not called up, and the boy is not found', async () => {
    const j = await start();
    await isle(j);
    await j.play('^Into the Gull', 'Ask Silas Quillon what he wants', '^Out to');
    // The storm, the lamp out, nobody on the hill: the boy is lost at the turn of the night.
    await j.play(`=${landedAt(j) + 208}`);
    expect(j.holds(k('lampOut'), 'party')).toBe(true);
    expect(j.holds(k('wenLost'), 'party')).toBe(true);
    await sailHome(j);
    expect(title(j)).toBe('The Net on the Table');
    expect(j.holds('befell', 'pharos_dark')).toBe(true);
    expect(j.holds('befell', 'pharos_lit')).toBe(false);
  }, 500000);

  it('ends in Sixty Down when the bronze is sold but the company lights a beacon on the hill and brings the boy in', async () => {
    const j = await start();
    await isle(j);
    await j.play('^Into the Gull', 'Ask Silas Quillon what he wants', '^Out to');
    await j.play(`=${landedAt(j) + 156}`);
    expect(j.holds(k('stormOn'), 'party')).toBe(true);
    expect(j.holds(k('lampOut'), 'party')).toBe(true);
    j.roll('pass');
    await j.play('^To the path up Pharos Hill', 'Build a beacon', '^To Skerrow green');
    expect(j.holds(k('wenSafe'), 'party')).toBe(true);
    await sailHome(j);
    expect(j.holds(k('wenLost'), 'party')).toBe(false);
    expect(title(j)).toBe('Sixty Down');
    expect(j.holds('befell', 'pharos_dark')).toBe(true);
  }, 500000);

  it('ends nothing on the other calls: Port Ness and home is not an ending', async () => {
    const j = await start();
    await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Ask Captain Bascom where else',
      'Ask Captain Bascom to put in at Port Ness', 'Pay Captain Bascom four', "^To the Dorothea's waist", '=150',
      '^To Port Ness pier', "^To the Dorothea's waist", '=400');
    expect(j.holds(k('safeHome'), k('hull'))).toBe(true);
    expect(title(j)).toBeUndefined();
  }, 400000);
});

describe('The Light on Scarth Holm and the Pharos, each told in the other', () => {
  const crossed = async (events: string[]) => {
    const j = await Journey.start(scarth, 'skerrow');
    for (const e of events) { j.assert('befell', e); }
    await j.play(...steps.cross_in);
    return j;
  };
  it('has Seddon hear what became of the Pharos only when it befell, and say it in one word', async () => {
    const quiet = await crossed([]);
    expect(quiet.offers('Tell Seddon the lamp on Skerrow went dark')).toBe(false);
    expect(quiet.offers('Tell Seddon the lamp on Skerrow was left burning')).toBe(false);
    const dark = await crossed(['pharos_dark']);
    expect(dark.offers('Tell Seddon the lamp on Skerrow went dark')).toBe(true);
    expect(dark.offers('Tell Seddon the lamp on Skerrow was left burning')).toBe(false);
    await dark.play('Tell Seddon the lamp on Skerrow went dark');
    expect(told(dark)).toMatch(/'Dark,' he says, when it is cold/);
    const fed = await crossed(['pharos_fed']);
    await fed.play('Tell Seddon a green light shows on the Reach at night');
    expect(told(fed)).toMatch(/There is something under the hum/);
  }, 200000);

  it('tells the Tolleth oil and the Tolleth ketch to any company, with or without the news', async () => {
    const j = await crossed([]);
    await j.play('Ask Seddon where the oil in the store comes from');
    expect(told(j)).toMatch(/Kestrel\. Out of Tolleth/);
    await j.play('Ask Corrie Fenwether who else she sells line to');
    expect(told(j)).toMatch(/sails to a rock with a lamp on it/);
  }, 200000);

  it('has the Pharos hear of the Scarth light only from a company that crossed it, in three trades', async () => {
    const quiet = await start();
    await isle(quiet);
    await quiet.play('^Into the Gull');
    expect(quiet.offers('Ask Silas Quillon whether the light on the Scarth sands is in his ledger')).toBe(false);
    const j = await start();
    j.assert('befell', 'scarth_kept');
    await isle(j);
    await j.play('^Into the Gull');
    expect(j.offers('Ask Silas Quillon whether the light on the Scarth sands is in his ledger')).toBe(true);
    await j.play('Ask Silas Quillon whether the light on the Scarth sands is in his ledger');
    expect(told(j)).toMatch(/not buy lamps that someone is still sitting up with/);
    await j.play('^Out to', '^To the path up Pharos Hill', '^To the foot of the Pharos', '^To the lamp room');
    expect(j.offers('Tell Marren Kestle about the keeper on the Scarth rock')).toBe(true);
    expect(j.offers('Tell Marren Kestle about the Scarth rock, and who did not come off it')).toBe(false);
    await j.play('Tell Marren Kestle about the keeper on the Scarth rock');
    expect(told(j)).toMatch(/They send oil/);
  }, 300000);
});
