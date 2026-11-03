import { describe, expect, it } from 'bun:test';
import { Ombra, home } from './support/ombra';

// The Wet Post (data/adventures/book-of-faces/post.kyr), continued from ombra-post.test.ts: the Burning of the Nobodies
// by the dice, and with Mabel at the fire. OMBRA_CAMPAIGN names a campaign that carries the other authors' relations as
// stubs, with 'zz:' acts that grant them; the cases that need those are skipped without it. Each case names the seed
// that makes its dice go the way it proves.
const campaign = process.env.OMBRA_CAMPAIGN ?? home;
const stubbed = process.env.OMBRA_CAMPAIGN !== undefined;
const start = (seed = 'ombra') => Ombra.start(campaign, seed);
const withStubs = stubbed ? it : it.skip;
const T = 90_000;

const rent = (face: string) => ['>ombra__annex_counter', `?Rent the ${face}`, `?Put on the ${face}`];
const toCounter = ['>ombra__dlo_counter'];
const toHall = ['>ombra__dlo_sorting'];
const digWanting = "Go through the next sack of 'Wanting";
const parcelsWanting = "Open the parcels' sack of 'Wanting";
// The vigil: at two on the first night Pell walks to the Chapel; sitting down beside him gets the story, nothing asked.
const vigil = ['>ombra__chapel_steps', '=day 2 02:00', 'Sit down on the step beside him'];
// Eight in the evening of the second day: bare, at the counter lamp.
const toLamp = ['=day 2 20:00', '>ombra__dlo_counter', 'Talk to Tomas Pell'];

describe('The Burning of the Nobodies: the dice', () => {
  const asPell = [...rent('Crow'), ...toCounter, 'Talk to Tomas Pell', 'Watch the clerk'];

  it('frightens Pell out of the Office: he says where it is and is never seen on the Wet Post again', async () => {
    const o = await start('s1');
    await o.play(...asPell, 'Tell him you will say his name');
    expect(o.holds('ps_pell_admits', 'party')).toBe(true);
    expect(o.holds('ps_rack_known', 'party')).toBe(true);
    await o.play('=+3');
    expect(o.at('pell')).toBe('ombra__offstage');
    await o.play('=day 2 09:00', ...toCounter);
    expect(o.page).toContain('GONE OUT');
    await o.until(1243);
    expect(o.page).toContain('Of Tomas Pell: he walked out of the Dead Letter Office on the day he was frightened');
  }, T);

  it('fails to frighten him, and he moves the Book among the drowned: the third sack of the seventh line is a lie', async () => {
    const o = await start('s0');
    await o.play(...asPell, 'Tell him you will say his name');
    expect(o.holds('ps_pell_moved_it', 'party')).toBe(true);
    expect(o.holds('ps_pell_admits', 'party')).toBe(false);
    await o.play(...toHall, digWanting, digWanting, digWanting);
    expect(o.holds('ps_book_found', 'party')).toBe(false);
    expect(o.page).toContain('has been opened and retied since the first night');
    await o.play("Go through the next sack of 'Gone to the water", "Go through the next sack of 'Gone to the water", "Go through the next sack of 'Gone to the water");
    expect(o.holds('ps_book_found', 'party')).toBe(true);
  }, T);

  it('can be lied to: the Chaplain sent you for the Book, and he chooses to believe it; a worse lie is seen through', async () => {
    const won = await start('s14');
    await won.play(...asPell, 'Tell him the Chaplain');
    expect(won.holds('ps_pell_admits', 'party')).toBe(true);
    expect(won.holds('ps_pell_lied_to', 'party')).toBe(true);
    expect(won.knows('ps_rack_told')).toBe(true);
    await won.until(1243);
    expect(won.page).toContain('Of Tomas Pell, and the Chaplain');
    const lost = await start('s8');
    await lost.play(...asPell, 'Tell him the Chaplain');
    expect(lost.holds('ps_pell_admits', 'party')).toBe(false);
    expect(lost.page).toContain('does not send people to a counter');
    // Not again today.
    expect(lost.j.offers('Tell him the Chaplain')).toBe(false);
  }, T);

  it('is lifted from the sack by stealth with the clerks about, or the door and a Watch domino', async () => {
    const won = await start('s2');
    await won.play(...rent('Crow'), ...toCounter, 'Give Dickon five coin', ...toHall, parcelsWanting, 'Lift the Book out of its sack under');
    expect(won.carries('book_of_faces')).toBe(true);
    expect(won.holds('ps_pell_robbed', 'party')).toBe(true);
    const lost = await start('s0');
    await lost.play(...rent('Crow'), ...toCounter, 'Give Dickon five coin', ...toHall, parcelsWanting, 'Lift the Book out of its sack under');
    expect(lost.carries('book_of_faces')).toBe(false);
    expect(lost.at('party')).toBe('ombra__dlo_counter');
    expect(lost.measure('heat', 'party')).toBe(1);
  }, T);

  it('reads the rhyme by lore, or gives it up for the day', async () => {
    const won = await start('s2');
    await won.play(...rent('Crow'), ...toHall, 'Work out what the clerks');
    expect(won.knows('ps_filing')).toBe(true);
    const lost = await start('s0');
    await lost.play(...rent('Crow'), ...toHall, 'Work out what the clerks');
    expect(lost.knows('ps_filing')).toBe(false);
    expect(lost.page).toContain('means nothing but its own tune');
  }, T);

  it('can be put off a day by the Postmaster, once in a long while, and the fire is not lit in the book', async () => {
    const o = await start('s4');
    await o.play(...rent('Crow'), '>ombra__dlo_office', 'Talk to Mistress Dunnage', 'Ask the Postmaster to put the Burning off');
    expect(o.holds('ps_held', 'party')).toBe(true);
    await o.play('=day 9 12:30');
    expect(o.holds('ps_burning_begun', 'post_office')).toBe(false);
    expect(o.holds('ps_book_burned', 'party')).toBe(false);
    await o.until(1243);
    expect(o.page).toContain('the Burning has been put off to the tenth');
  }, T);

  it('is refused, with enormous gentleness, because the Rule does not mention the Drawing', async () => {
    const o = await start('s0');
    await o.play(...rent('Crow'), '>ombra__dlo_office', 'Talk to Mistress Dunnage', 'Ask the Postmaster to put the Burning off');
    expect(o.holds('ps_held', 'party')).toBe(false);
    expect(o.page).toContain('does not mention the Drawing');
  }, T);

  it('is argued out of the Postmaster by the Rule\'s own clause: a clerk may redeem a letter for a penny', async () => {
    const o = await start('s0');
    await o.play('=day 1 22:30', '>ombra__ps_stair', '=day 2 08:30', ...rent('Crow'), '>ombra__dlo_office', 'Talk to Mistress Dunnage', 'Ask the Postmaster what the Office does', 'Ask the Postmaster to read you the Rule', 'Show the Postmaster that the Rule');
    expect(o.holds('ps_mabel_kept', 'party')).toBe(true);
    expect(o.holds('ps_mabel_redeems', 'party')).toBe(true);
    expect(o.measure('goodwill', 'face_crow')).toBe(1);
    await o.play('=day 7 12:30');
    expect(o.holds('ps_mabel_dismissed', 'strake')).toBe(false);
    await o.until(1243);
    expect(o.page).toContain('the Redemptions has a new column');
  }, T);

  it('puts a wet furnace off to six in the evening: the Rule says dry, and the Postmaster does not hurry', async () => {
    const o = await start('s1');
    await o.play('=day 9 08:30', '>ombra__dlo_roof', 'Turn the cowl');
    expect(o.holds('ps_flue_wet', 'party')).toBe(true);
    await o.play(...rent('Crow'), '>ombra__dlo_furnace', '=day 9 12:30');
    expect(o.holds('ps_burning_begun', 'post_office')).toBe(false);
    expect(o.page).toContain('The Rule says dry. We wait');
    await o.play('=day 9 17:30');
    expect(o.holds('ps_flue_wet', 'party')).toBe(false);
    expect(o.holds('ps_burning_begun', 'post_office')).toBe(true);
    await o.until(1243);
    expect(o.holds('ps_burnt', 'post_office')).toBe(true);
    expect(o.page).toContain('it drew at last, at six in the evening');
  }, T);

  it('chokes it for the book, and the boy who had the roof is turned off unless somebody owns up', async () => {
    const o = await start('s3');
    await o.play('=day 9 08:30', '>ombra__dlo_roof', 'Ram the sweeps');
    expect(o.holds('ps_flue_choked', 'party')).toBe(true);
    expect(o.holds('ps_held', 'party')).toBe(true);
    await o.play('=day 9 13:00');
    expect(o.holds('ps_burning_begun', 'post_office')).toBe(false);
    expect(o.holds('ps_boy_dismissed', 'ps_corbin')).toBe(true);
    await o.until(1243);
    expect(o.page).toContain('Of Dickon, the Office');
    expect(o.page).toContain('with a hundredweight of wet sacking in the flue');
  }, T);

  it('wrests the sack out of the line at the fire, or loses the Book with it', async () => {
    const steps = [...rent('Crow'), ...toCounter, 'Give Dickon five coin', '=day 9 12:10', ...rent('Crow'), '>ombra__dlo_furnace', 'Wrest the third sack'];
    const won = await start('s1');
    await won.play(...steps);
    expect(won.carries('book_of_faces')).toBe(true);
    expect(won.holds('ps_snatched', 'party')).toBe(true);
    expect(won.measure('heat', 'party')).toBe(2);
    const lost = await start('s0');
    await lost.play(...steps);
    expect(lost.holds('ps_book_burned', 'party')).toBe(true);
    expect(lost.carries('book_of_faces')).toBe(false);
  }, T);

  withStubs('burns it on purpose, in the furnace, with the Postmaster watching: and the news knows it was a choice', async () => {
    const o = await start();
    await o.play(...vigil, ...toLamp, 'zz: ledger', 'Show him the last page', '=day 9 10:30', 'zz: gold', ...rent('Crow'), '>ombra__dlo_furnace', 'Put the Book into the furnace yourself');
    expect(o.carries('book_of_faces')).toBe(false);
    expect(o.holds('ps_book_burned', 'party')).toBe(true);
    expect(o.holds('ps_burned_by_choice', 'party')).toBe(true);
    await o.until(1243);
    expect(o.page).toContain('Of Tomas Pell: he was told that the Book had gone into the fire after all');
  }, T);

  it('stops Mabel for her own sake (she keeps her place and the Bare carries), or is told no', async () => {
    const won = await start('s8');
    await won.play('=day 1 22:30', '>ombra__ps_stair', 'Talk to Mabel', 'Ask her what she does with the letters', 'Ask her to stop');
    expect(won.holds('ps_mabel_stopped', 'party')).toBe(true);
    expect(won.carries('ps_letter_brandt')).toBe(true);
    await won.play('=day 7 12:30');
    expect(won.holds('ps_mabel_dismissed', 'strake')).toBe(false);
    const lost = await start('s9');
    await lost.play('=day 1 22:30', '>ombra__ps_stair', 'Talk to Mabel', 'Ask her what she does with the letters', 'Ask her to stop');
    expect(lost.holds('ps_mabel_stopped', 'party')).toBe(false);
    expect(lost.page).toContain('If I stopped, who would');
  }, T);

  it('is argued for as one Crow of another, plainly, or with the thanks that came back through the slot', async () => {
    const plain = await start('s10');
    await plain.play('=day 1 22:30', '>ombra__ps_stair', '=day 2 08:30', ...rent('Crow'), '>ombra__dlo_office', 'Talk to Mistress Dunnage', 'Ask the Postmaster, as one of the Office');
    expect(plain.holds('ps_mabel_kept', 'party')).toBe(true);
    const proof = await start('s12');
    await proof.play('=day 1 22:30', '>ombra__ps_stair', 'Talk to Mabel', 'Ask her what she does with the letters', 'Ask to see what is in the satchel', 'Offer to carry them', 'Take the letter to the third door',
      '=day 2 08:30', ...rent('Crow'), '>ombra__dlo_office', 'Talk to Mistress Dunnage', 'Tell the Postmaster that people have been thanked');
    expect(proof.holds('ps_mabel_kept', 'party')).toBe(true);
    expect(proof.measure('goodwill', 'face_crow')).toBe(1);
    expect(proof.page).toContain('Vickery will stay');
  }, T);
});

describe('The Burning of the Nobodies: with Mabel at the fire', () => {
  const asMabelsFriend = [...rent('Crow'), ...toCounter, 'Give Dickon five coin', 'zz: warrant', '=day 1 22:30', '>ombra__ps_stair', 'Talk to Mabel',
    'Ask her what she does with the letters', 'Ask to see what is in the satchel', 'Offer to carry them', '=day 2 08:30', ...rent('Crow'), '>ombra__dlo_office',
    'Talk to Mistress Dunnage', 'Tell the Postmaster the Stranger', '=day 9 12:10', ...rent('Crow'), '>ombra__dlo_furnace', 'Slip the third sack'];

  withStubs('slips the sack out of the line while Mabel spills a table of letters, or is seen', async () => {
    const won = await start('s3');
    await won.play(...asMabelsFriend);
    expect(won.carries('book_of_faces')).toBe(true);
    expect(won.holds('ps_snatched', 'party')).toBe(true);
    expect(won.page).toContain('Mabel has not looked at you once');
    const lost = await start('s0');
    await lost.play(...asMabelsFriend);
    expect(lost.holds('ps_book_burned', 'party')).toBe(true);
  }, 120_000);
});
