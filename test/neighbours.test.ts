import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const start = async (classId = 'warrior', seed = 'kahitude') => Journey.of(await DrawnWorld.start(seed, { origin: 'debt',
  party: [{ name: 'Ralf', raceId: 'human', classId }] }, NodeBundleSource.shared));
const r = (id: string) => `region__${id}`;

// The first town's own people (data/generation/town/neighbours.kyrt): a scholar, an acolyte and an apprentice, what the
// generated innkeeper, priest, merchant and traveller have been doing, the old steward's papers about the reeve's
// father, and a spoon. Companions use the engine's own willing / Joins / Remarks / Leaves.
describe('the first town’s neighbours', () => {
  it('speak of one another: the generated people have lives that touch the new ones', async () => {
    const j = await start();
    await j.play('>s1_taproom', 'about the scholar upstairs');
    expect(j.offers('Ask Isaure Venn what she is reading')).toBe(true);
    await j.play('>s1_shrine');
    expect(j.offers('about the acolyte')).toBe(true);
  }, 120000);

  it('has a scholar who is earned, joins, and is not left to the dark', async () => {
    const j = await start();
    await j.play('>s1_taproom', 'Ask Isaure Venn what she is reading', 'Ask Isaure Venn about the old stones on the hill',
      'Agree to take Isaure Venn up the hill');
    await j.play('Ask Isaure Venn to join the company');
    expect(j.campaign.world.related('travelsWith').some(x => x.args[0] === r('s1_iv'))).toBe(true);
  }, 120000);

  it('has an apprentice who is paid for a pattern taken from the dead’s own chime, and a bell the town can hear', async () => {
    const j = await start();
    await j.play('>s1_green', 'Ask Hesper Lowe about the drawing');
    Placed.at(j, r('s1_stones_under'));
    await j.play('Press a strip of soft wax');
    Placed.at(j, r('s1_green'));
    await j.play('Show Hesper Lowe the wax');
    expect(Placed.holds(j, 'region__s1_bell_cast', 'party')).toBe(true);
  }, 180000);

  it('has an acolyte whose friction is the cup, and whose consent is the Lady’s', async () => {
    const j = await start();
    await j.play('>s1_shrine', 'Ask Brother Anselm what he is counting');
    expect(Placed.holds(j, 'knows', 'party', r('s1_coin_habit'))).toBe(true);
  }, 120000);

  it('keeps the reeve’s father’s papers, and a spoon the steward is glad of', async () => {
    const j = await start();
    Placed.at(j, r('s1_manor_muniments'));
    await j.play('Read the page marked with a dead flower', 'Read the note pinned in the lid');
    expect(Placed.holds(j, 'knows', 'party', r('s1_fenn_dismissed'))).toBe(true);
    Placed.at(j, r('s1_green'));
    expect(j.offers('Tell Aldous Fenn what the papers say of his father')).toBe(true);
    await j.play('Tell Aldous Fenn what the papers say of his father');
    expect(Placed.holds(j, 'region__s1_fenn_truth', 'party')).toBe(true);
  }, 180000);

  it('lets the scholar choose to stay and copy a stage, and the town finds her letter', async () => {
    const j = await start();
    await j.play('>s1_taproom', 'Ask Isaure Venn what she is reading', 'Agree to take Isaure Venn up the hill', 'Ask Isaure Venn to join the company');
    Placed.at(j, 'region__e1_office');
    await j.play('Ask Isaure Venn if she would rather stay');
    expect(Placed.holds(j, 'region__s1_iv_stays', 'party')).toBe(true);
    expect(j.campaign.world.related('travelsWith').some(x => x.args[0] === r('s1_iv'))).toBe(false);
    Placed.at(j, r('s1_taproom'));
    expect(j.campaign.world.one('at', r('s1_iv'))).toBe('region__e1_office');
  }, 180000);

  it('has a death with three readings: the bruise, the tally-stick, and what is told to whom', async () => {
    const j = await start();
    Placed.at(j, r('s1_shrine'));
    await j.play('Look under the cloth');
    expect(Placed.holds(j, 'knows', 'party', r('s1_death_bruise'))).toBe(true);
    Placed.at(j, r('s1_taproom'));
    await j.play('Read the notches on the tally-stick');
    expect(Placed.holds(j, 'knows', 'party', r('s1_death_oak_fact'))).toBe(true);
    Placed.at(j, r('s1_green'));
    await j.play('Tell Aldous Fenn what the dead man');
    expect(Placed.holds(j, 'region__s1_death_oak', 'party')).toBe(true);
  }, 180000);

  it('answers a settled quarrel, some days on, from the family at court', async () => {
    const j = await start();
    Placed.at(j, r('s1_manor_front'));
    for (const f of ['s1_roadwood_open', 's1_roadwood_shared']) { Placed.assert(j, f, 'party'); }
    await j.play('==+60');
    expect(Placed.holds(j, 'region__s1_family_wrote', 'party')).toBe(true);
  }, 180000);

  it('has companions who ask questions of their own, remember the answers, and give a keepsake for being understood', async () => {
    const j = await start();
    await j.play('>s1_taproom', 'Ask Isaure Venn what she is reading', 'Agree to take Isaure Venn up the hill', 'Ask Isaure Venn to join the company');
    Placed.at(j, r('s1_stones_hall'));
    await j.play('==+1');
    expect(Placed.holds(j, 'region__s1_iv_q1_asked', 'party')).toBe(true);
    expect(j.offers('Yes. They have a right to know')).toBe(true);
    await j.play('Yes. They have a right to know');
    expect(Placed.holds(j, 'region__s1_iv_shown_candour', 'party')).toBe(true);
    for (const f of ['s1_roadwood_shared']) { Placed.assert(j, f, 'party'); }
    await j.play('==+1');
    await j.play('The paper does not know who is poor');
    Placed.knows(j, r('s1_boy_tune'));
    await j.play('==+1');
    await j.play('I would rather be unmade by the truth');
    await j.play('==+1');
    expect(Placed.holds(j, 'region__s1_iv_rank2', 'party')).toBe(true);
    expect(j.offers('Read the scored-out word on the dais')).toBe(true);
    await j.play('Read the scored-out word on the dais');
    expect(Placed.holds(j, 'knows', 'party', r('s1_rubbed_word'))).toBe(true);
    await j.play('primer: Take');
    expect(Placed.carried(j, r('s1_iv_gift'))).toBe(true);
    expect(Placed.holds(j, 'capable', 'party', 'lore')).toBe(true);
  }, 240000);
});
