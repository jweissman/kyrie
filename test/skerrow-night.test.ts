import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Skerrow's second night (the Imbar commission, doc/imbar): the men who come for the bronze, the paper nobody has
// read, the
// lens, and the boy who is out when the lamp is dark. Every way through is a way a company may take; none is required.
const campaign = 'data/campaigns/the-dorothea.campaign.json';
const k = (id: string) => `dorothea__${id}`;
const isle = async (seed = 's1', gold = 0) => {
  const j = await Journey.start(campaign, seed);
  j.assert(k('seaQuiet'), k('hull'));
  await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Pay Captain Bascom six', "^To the Dorothea's waist");
  await j.play('Ask her to come with you', '=180', '^To the quarterdeck', 'lie off', '=215', "^To the Dorothea's waist",
    '^To Skerrow jetty', '^To Skerrow green');
  if (gold) { j.coin(gold); }
  return j;
};
// Quillon's offer heard, Jory not swayed: the paper is signed in the evening, the men come at dusk.
const toDusk = async (j: Journey) => {
  await j.play('^Into the Gull', 'Ask Silas Quillon what he wants', '^Out to');
  await j.play('=356');
  expect(j.holds(k('marlSold'), 'party')).toBe(true);
  expect(j.holds(k('menCame'), 'party')).toBe(true);
};

describe('Skerrow, the second night', () => {
  it('lets a company read the paper on the Gull\'s wall, with the surveyor who can, and find the same device on the tower', async () => {
    const j = await isle();
    await j.play('^Into the Gull', 'Ask Hester Gull about the framed paper', 'Ask Odile Quint to read the paper');
    expect(j.holds('knows', 'party', k('receipt_read'))).toBe(true);
    await j.play('^Out to', '^To the path up Pharos Hill', '^To the foot of the Pharos');
    expect(j.holds('knows', 'party', k('device_known'))).toBe(true);
  }, 400000);

  it('lets a bluff turn Quillon\'s men from the plate, and the sale is voided', async () => {
    const j = await isle();
    await toDusk(j);
    await j.play('^To the path up Pharos Hill', '^To the foot of the Pharos');
    j.roll('pass');
    await j.play('Tell Quillon.s men the plate is an Aenean antiquity');
    j.roll();
    expect(j.holds(k('voided'), 'party')).toBe(true);
    await j.play('=420');
    expect(j.holds(k('tableSold'), 'party')).toBe(false);
    expect(j.holds(k('keptLamp'), 'party')).toBe(true);
  }, 600000);

  it('has the lamp bring the boy home by itself if it is lit, and says what it is for', async () => {
    const j = await isle();
    await j.play('^Into the Gull', 'Ask Silas Quillon what he wants', '^Out to');
    j.coin(30);
    await j.play('Offer to stand Jory Kestle');
    await j.play('=440');
    expect(j.holds(k('wenSafe'), 'party')).toBe(true);
    expect(j.page).toContain('That is what it is for');
  }, 600000);

  it('loses the boy if the lamp is dark and nobody acts', async () => {
    const j = await isle();
    await toDusk(j);
    await j.play('=470');
    expect(j.holds(k('lampOut'), 'party')).toBe(true);
    expect(j.holds(k('wenLost'), 'party')).toBe(true);
  }, 600000);

  it('lets a dark lamp be answered by a beacon, or by the ship lit like a church, or by a boat in the weather', async () => {
    for (const way of ['beacon', 'ship', 'boat'] as const) {
      const j = await isle();
      await toDusk(j);
      await j.play('=372');
      expect(j.holds(k('wenOut'), 'party')).toBe(true);
      j.roll('pass');
      if (way === 'beacon') { await j.play('^To the path up Pharos Hill', 'Build a beacon'); }
      if (way === 'ship') { await j.play('To Skerrow jetty', 'To the Dorothea', '^To the quarterdeck', 'Ask Captain Bascom to hang every lantern'); }
      if (way === 'boat') { await j.play('To Skerrow jetty', 'Take the island.s boat out'); }
      j.roll();
      expect(j.holds(k('wenSafe'), 'party')).toBe(true);
      expect(j.holds(k('wenLost'), 'party')).toBe(false);
    }
  }, 900000);
});
