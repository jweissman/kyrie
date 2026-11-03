import { describe, expect, it } from 'bun:test';
import { City, Q } from './support/quittance';

// The Annuitant (data/adventures/quittance/q_annuitant.kyr). Every approach is played here by the labels the page
// offers; the checks are rolled on a seed chosen for the outcome the test names, and the build that makes it.
const to = (place: string) => `>quittance__${place}`;
const row = [...City.honest, to('annuity_row')];
const licensed = [...City.slip, to('annuity_row')];
const status = (j: Awaited<ReturnType<typeof City.start>>) => j.measure(Q('an_status'), 'party');
const rich = { party: [{ name: 'Vane', raceId: 'human', classId: 'bard' }, { name: 'Ibb', raceId: 'human', classId: 'mage' },
  { name: 'Sorrel', raceId: 'human', classId: 'cleric' }] };
const thieves = { party: [{ name: 'Wick', raceId: 'human', classId: 'thief' }, { name: 'Tam', raceId: 'human', classId: 'warrior' },
  { name: 'Rook', raceId: 'human', classId: 'warrior' }] };
const plain = { party: [{ name: 'Orm', raceId: 'human', classId: 'warrior' }, { name: 'Pike', raceId: 'human', classId: 'warrior' },
  { name: 'Bas', raceId: 'human', classId: 'warrior' }] };

describe('The Annuitant', () => {
  it('lets a witnessed kindness, a girl who trusts, and a cup of tea make Cray an ally', async () => {
    const j = await City.start('annuity-tea', plain);
    await j.play(...row, '=296', '^Into the Mortmain almshouse');
    expect(j.holds('at', Q('cray'), Q('alms_room'))).toBe(true);
    await j.play('Share your rations');
    expect(City.arc(j, 'cray')).toBe(1);
    expect(City.pages(j)).toContain('My mother cut it like that');
    await j.play('=+1');
    expect(status(j)).toBe(1);
    // Mother Mawdsley tells those who have been fair; the girl tells those who know.
    await j.play('who looks after Mrs Oakes');
    expect(City.knows(j, 'an_truth')).toBe(true);
    await j.play('^Out to Annuitants', '^Into the Oakes cottage', 'Tell her you know');
    expect(City.has(j, 'an_trust', 'party')).toBe(true);
    await j.play('^Out to Annuitants', '^Into the Mortmain almshouse', 'take tea with Mrs Oakes');
    expect(j.holds('at', Q('cray'), Q('oakes_room'))).toBe(true);
    await j.play('^Out to Annuitants', '^Into the Oakes cottage', 'put the ear-trumpet down');
    expect(City.arc(j, 'cray')).toBe(2);
    expect(City.has(j, 'witness', 'cray')).toBe(true);
    expect(status(j)).toBe(2);
    expect(City.regard(j, 'sovereign')).toBe(2);
    // The books, and a hearth for the Night.
    await j.play('=313', '^Out to Annuitants', "^Into the Sovereign Mutual's life-office");
    expect(j.holds('at', Q('cray'), Q('sov_floor'))).toBe(true);
    expect(j.holds('at', Q('cray'), Q('oakes_room'))).toBe(false);
    await j.play('what the Life Office');
    expect(City.knows(j, 'an_quill_annuity')).toBe(true);
    await j.play('^Out to Annuitants', '^Into the Mortmain almshouse', 'keep a hearth lit');
    expect(City.has(j, 'keeper', 'mort')).toBe(true);
    // Noon passes, and the stop does not fall.
    await j.play('=330');
    expect(status(j)).toBe(2);
  }, 120000);

  it('lets Cray be asked where his mother lies, and sits on the stop until Friday', async () => {
    const j = await City.start('mother-a4', rich);
    await j.play(...row, '^Into the Mortmain almshouse', 'about the neat man in black');
    expect(City.knows(j, 'an_cray_mother')).toBe(true);
    await j.play('^Out to Annuitants', "^Into the Sovereign Mutual's life-office", 'where his mother is buried');
    expect(City.arc(j, 'cray')).toBe(1);
    await j.play('=+1');
    expect(status(j)).toBe(1);
    await j.play('=330');
    expect(status(j)).toBe(1);
    // He cannot sit on it for ever: with nothing laid before him, the stop falls on the fifth day.
    await j.play('=745');
    expect(status(j)).toBe(4);
    expect(City.arc(j, 'cray')).toBe(1);
  }, 120000);

  it('closes the door on a mother asked about badly, and does not let the die be tried again', async () => {
    const j = await City.start('mother-a1', rich);
    await j.play(...row, '^Into the Mortmain almshouse', 'about the neat man in black');
    await j.play('^Out to Annuitants', "^Into the Sovereign Mutual's life-office", 'where his mother is buried');
    expect(City.arc(j, 'cray')).toBe(0);
    expect(City.has(j, 'an_asked_badly', 'party')).toBe(true);
    expect(j.choices().some(c => /where his mother is buried/.test(c.label))).toBe(false);
  }, 120000);

  it('wins with the wording: the policy found with a licence, read with lore, laid before him', async () => {
    const j = await City.start('read-a2', rich);
    await j.play(...licensed, "^Into the Sovereign Mutual's life-office", 'Look for the Oakes policy');
    await j.play('^Out to Annuitants', 'Read the Oakes policy through');
    expect(City.knows(j, 'an_wording')).toBe(true);
    expect(City.knows(j, 'd_wording_style')).toBe(true);
    await j.play("^Into the Sovereign Mutual's life-office", 'Lay the Oakes policy before Cray');
    await j.play('=+1');
    expect(status(j)).toBe(2);
    expect(City.arc(j, 'cray')).toBe(0);
    expect(City.regard(j, 'sovereign')).toBe(1);
    await j.play('=330');
    expect(status(j)).toBe(2);
    // The almshouse's friends are the sexton's: the stair is let to them without a promise.
    await j.play('^Out to Annuitants', '^To the head of the catacomb stair', 'Remind Wragg what you did');
    expect(City.has(j, 'sextonLeave', 'party')).toBe(true);
  }, 120000);

  it('sends a reader who cannot make the clause out to Mr Tarbuck, who can', async () => {
    const j = await City.start('read-a1', plain);
    await j.play(...licensed, "^Into the Sovereign Mutual's life-office", 'Look for the Oakes policy');
    await j.play('^Out to Annuitants', 'Read the Oakes policy through');
    expect(City.knows(j, 'an_wording')).toBe(false);
    expect(City.has(j, 'an_read_failed', 'party')).toBe(true);
    await j.play('^Into the Mortmain almshouse', 'Hand Mr Tarbuck the policy');
    expect(City.knows(j, 'an_wording')).toBe(true);
    expect(City.knows(j, 'd_wording_style')).toBe(true);
  }, 120000);

  it('puts a forged certificate on the file, and pays for it on the sixth day', async () => {
    const j = await City.start('forge-a1', rich);
    await j.play(...row, "^Into the Sovereign Mutual's life-office", 'Fill in a spoiled certificate');
    expect(status(j)).toBe(3);
    expect(City.has(j, 'an_forged', 'party')).toBe(true);
    await j.play('=330');
    expect(status(j)).toBe(3);
    await j.play('=865');
    expect(status(j)).toBe(4);
    expect(City.has(j, 'an_slighted_sovereign', 'party')).toBe(true);
  }, 120000);

  it('has a forgery that Cray sees through bring Monday forward', async () => {
    const j = await City.start('forge-a2', plain);
    await j.play(...row, "^Into the Sovereign Mutual's life-office", 'Fill in a spoiled certificate');
    expect(status(j)).toBe(4);
    expect(City.has(j, 'an_slighted_cray', 'party')).toBe(true);
  }, 120000);

  it('buys a quarter with a bonus larger than the denial, and gets a Cray who cannot be asked to tea', async () => {
    const j = await City.start('an-bonus', plain);
    await j.play(...row);
    const gold = City.gold(j);
    await j.play("^Into the Sovereign Mutual's life-office", 'Offer Cray ten coin');
    expect(City.gold(j)).toBe(gold - 10);
    expect(status(j)).toBe(3);
    expect(City.arc(j, 'cray')).toBe(1);
    expect(City.has(j, 'an_bought', 'party')).toBe(true);
    expect(City.has(j, 'an_slighted_sovereign', 'party')).toBe(true);
    expect(j.choices().some(c => /take tea with Mrs Oakes/.test(c.label))).toBe(false);
    await j.play('=865');
    expect(status(j)).toBe(4);
  }, 120000);

  it('shames Cray in the day-room, and has an enemy for it', async () => {
    const j = await City.start('shame-a6', rich);
    await j.play(...row, '=296', '^Into the Mortmain almshouse', 'read the stop aloud');
    expect(City.has(j, 'an_shamed', 'party')).toBe(true);
    expect(status(j)).toBe(3);
    expect(City.has(j, 'an_slighted_cray', 'party')).toBe(true);
    await j.play('=313', '^Out to Annuitants', "^Into the Sovereign Mutual's life-office");
    expect(City.pages(j)).toContain('tearing a form into very small pieces');
    expect(j.choices().some(c => /Offer Cray ten coin/.test(c.label))).toBe(false);
  }, 120000);

  it('has a shaming that fails leave the seven looking at you, and the stop to fall', async () => {
    const j = await City.start('shame-a1', plain);
    await j.play(...row, '=296', '^Into the Mortmain almshouse', 'read the stop aloud');
    expect(City.has(j, 'an_shame_failed', 'party')).toBe(true);
    expect(status(j)).toBe(0);
    await j.play('=313');
    expect(status(j)).toBe(4);
  }, 120000);

  it('gives Cray the proof he has been waiting for, and the seven lose their stove', async () => {
    const j = await City.start('an-expose', plain);
    await j.play(...row, '^Into the Mortmain almshouse', 'Share your rations', 'who looks after Mrs Oakes');
    await j.play('^Out to Annuitants', "^Into the Sovereign Mutual's life-office", 'Give Cray the proof');
    expect(status(j)).toBe(6);
    expect(City.regard(j, 'sovereign')).toBe(1);
    await j.play('^Out to Annuitants', '^Into the Mortmain almshouse', 'keep a hearth lit');
    expect(City.has(j, 'keeper', 'mort')).toBe(false);
    expect(City.pages(j)).toContain('no hearth in this house');
    // The sexton will not have the company on his stair on a promise, nor for a favour.
    expect(City.has(j, 'an_wragg_cross', 'party')).toBe(true);
    await j.play('^Out to Annuitants', '^To the head of the catacomb stair');
    expect(j.choices().some(c => /Promise Wragg|Remind Wragg/.test(c.label))).toBe(false);
  }, 120000);

  it('lets Monday fall on a company that is elsewhere, and takes the stop off when it comes back with the wording', async () => {
    const j = await City.start('read-a2', rich);
    await j.play(...licensed, '=313');
    expect(status(j)).toBe(4);
    await j.play("^Into the Sovereign Mutual's life-office", 'Look for the Oakes policy');
    await j.play('^Out to Annuitants', 'Read the Oakes policy through');
    expect(City.pages(j)).toContain('ANNUITY CEASED');
    await j.play("^Into the Sovereign Mutual's life-office", 'Lay the Oakes policy before Cray');
    await j.play('=+1');
    expect(status(j)).toBe(5);
    await j.play('^Out to Annuitants', '^Into the Mortmain almshouse', 'keep a hearth lit');
    expect(City.has(j, 'keeper', 'mort')).toBe(true);
  }, 120000);

  describe('the grate on the catacomb stair', () => {
    const head = [...row, '^To the head of the catacomb stair'];
    it('stays shut to a rite that does not take', async () => {
      const j = await City.start('rite-a2', rich);
      await j.play(...head, 'Say the burial office');
      expect(City.state(j, 'an_grate', 'locked')).toBe(true);
      expect(j.choices().some(c => /^To the foot of the catacomb stair$/.test(c.label))).toBe(false);
    }, 120000);
    it('opens to the burial office said over the worn sun, and nobody sees you go', async () => {
      const j = await City.start('rite-a1', rich);
      await j.play(...head, 'Say the burial office');
      expect(City.state(j, 'an_grate', 'open')).toBe(true);
      await j.play(to('catacomb_foot'));
      expect(j.at('party')).toBe(Q('catacomb_foot'));
      expect(City.has(j, 'an_slighted_sovereign', 'party')).toBe(false);
    }, 120000);
    it('opens on the sexton\'s leave, for a promise to carry his register to the clerk below', async () => {
      const j = await City.start('an-sexton', plain);
      await j.play(...head, 'Ask the sexton about the stair', 'Promise Wragg you will carry');
      expect(j.holds('promiseMade', Q('an_wragg_promise'))).toBe(true);
      expect(City.has(j, 'sextonLeave', 'party')).toBe(true);
      await j.play('Ask Wragg to unlock the grating');
      expect(City.state(j, 'an_grate', 'open')).toBe(true);
      await j.play(to('catacomb_foot'));
      expect(City.has(j, 'an_slighted_sovereign', 'party')).toBe(false);
    }, 120000);
    it('opens to the Oakes key, for a company the Oakes women trust', async () => {
      const j = await City.start('an-key', plain);
      await j.play(...row, '^Into the Mortmain almshouse', 'Share your rations', 'who looks after Mrs Oakes');
      await j.play('^Out to Annuitants', '^Into the Oakes cottage', 'Tell her you know', 'Ask whether the Oakes vault');
      await j.play('^Out to Annuitants', '^To the head of the catacomb stair', 'Say the sixth Mrs Oakes');
      expect(City.state(j, 'an_grate', 'open')).toBe(true);
      expect(City.has(j, 'an_lawful', 'party')).toBe(true);
    }, 120000);
    it('can be wrenched off its staples, and the sexton and the Sovereign mind', async () => {
      const j = await City.start('an-force', plain);
      await j.play(...head, 'Wrench the grating');
      expect(City.state(j, 'an_grate', 'open')).toBe(true);
      await j.play('=+1');
      expect(City.has(j, 'an_grate_forced', 'party')).toBe(true);
      expect(City.has(j, 'an_slighted_sovereign', 'party')).toBe(true);
      expect(City.has(j, 'sextonLeave', 'party')).toBe(false);
      expect(City.has(j, 'an_wragg_cross', 'party')).toBe(true);
    }, 120000);
    it('can be picked by a company with a thin wire, at the same cost', async () => {
      const j = await City.start('an-pick', thieves);
      await j.play(...head, 'Pick the padlock');
      expect(City.state(j, 'an_grate', 'open')).toBe(true);
      await j.play('=+1');
      expect(City.has(j, 'an_slighted_sovereign', 'party')).toBe(true);
    }, 120000);
  });
});
