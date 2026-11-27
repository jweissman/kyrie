import { describe, expect, it } from 'bun:test';
import { ModuleWriter } from '../src/lang';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

const reflections = ['lc_rill_bread', 'lc_rill_trough', 'lc_rill_bank'];

const counting = async (seed: string, classId = 'warrior') => {
  const j = await Journey.start(campaign, seed, { party: [{ name: 'Wenna', raceId: 'human', classId },
    { name: 'Hamo', raceId: 'human', classId: 'cleric' }, { name: 'Ysolde', raceId: 'human', classId: 'monk' }] });
  Placed.at(j, 'tallow__lc_gnoll_shelter');
  await j.play('Ask Rill why she stays by the field', 'Share a ration with Rill',
    'Ask Rill at the shield shelter to join the company');
  j.assert('lcMirrorReleased', 'party');
  Placed.at(j, 'tallow__green');
  await j.play('Wait a while');
  return j;
};

const resumed = (j: Journey) => Journey.of(PlaySession.resume(
  JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));

describe('the count', () => {
  it('sends three reflected Rills into Swallet with rolled habits and rolled discs', async () => {
    const j = await counting('count-begins');
    expect(j.holds('lcCountBegun', 'party')).toBe(true);
    expect(j.holds('at', 'lc_rill_trough', 'green')).toBe(true);
    expect(j.holds('at', 'lc_rill_bread', 'taproom')).toBe(true);
    expect(j.holds('at', 'lc_rill_bank', 'bank')).toBe(true);
    const sum = reflections.reduce((n, r) => n + j.measure('lcDisc', r), 0);
    for (const r of reflections) { expect(j.measure('lcDisc', r)).toBeGreaterThanOrEqual(1); }
    expect(j.measure('lcPaneTarget', 'party')).toBe(sum);
    const quirks = j.campaign.world.related('tallow__lcQuirk');
    expect(new Set(quirks.map(q => q.args[0])).size).toBe(3);
    expect(j.offers('Ask Rill whether there are four of her')).toBe(true);
  }, 15000);

  it('lets a thief take each disc quietly, and the last one closes the count on Merren', async () => {
    const j = await counting('count-thief', 'thief');
    expect(j.offers('Put a spear in')).toBe(false);
    await j.play('Have Wenna lift what Rill by the trough carries in her coat');
    j.put('party', 'taproom');
    await j.play('Have Wenna lift what Rill at Lowen\'s table carries in her coat');
    expect(j.holds('lcCountClosed', 'party')).toBe(false);
    j.put('party', 'bank');
    await j.play('Have Wenna lift what Rill on the bank carries in her coat');
    expect(j.holds('lcCountClosed', 'party')).toBe(true);
    expect(j.holds('lcMerrenCounted', 'party')).toBe(true);
    expect(j.holds('at', 'lc_quartermaster', 'taproom')).toBe(false);
    expect(j.holds('at', 'lc_merren_reflected', 'taproom')).toBe(true);
    for (const r of reflections) { expect(j.holds('lcDiscHeld', r)).toBe(true); }
    expect(j.holds('lcWarBegun', 'party')).toBe(true);
    expect(j.measure('lcMarches', 'party')).toBe(5);
    expect(j.measure('lcAshScore', 'party')).toBe(2);
  }, 15000);

  it('makes a warrior learn the hands, or spar for an opening blow, and fight the copy', async () => {
    const j = await counting('count-warrior');
    expect(j.offers('Put a spear in')).toBe(false);
    await j.play('Watch how Rill by the trough holds her spear');
    expect(j.offers('Put a spear in Rill by the trough\'s right hand')).toBe(true);
    await j.fight('Have Wenna spar with Rill by the trough');
    const initiative = j.taken.at(-1)!.event.combat.find(e => e.type === 'initiative');
    expect(initiative).toBeDefined();
  }, 15000);

  it('lets a bard sing down a Rill who answered the question, and the Rill on the bank point at the prints', async () => {
    const j = await counting('count-bard', 'bard');
    expect(j.offers('Have Wenna sing Rill\'s mother\'s song to Rill by the trough')).toBe(false);
    await j.play('Ask Rill whether there are four of her');
    await j.play('Have Wenna sing Rill\'s mother\'s song to Rill by the trough');
    expect(j.holds('lcDiscHeld', 'lc_rill_trough')).toBe(true);
    j.put('party', 'bank');
    await j.play('Ask Rill whether there are four of her');
    expect(j.holds('knows', 'party', 'lc_count_water')).toBe(true);
    j.put('party', 'taproom');
    await j.play('Look at the floor of the Chandler\'s Arms');
    expect(j.holds('knows', 'party', 'lc_count_prints')).toBe(true);
  }, 15000);

  it('lets a ranger see the fourth prints, and Merren hands over her wheel before the count closes', async () => {
    const j = await counting('count-ranger', 'ranger');
    j.put('party', 'taproom');
    await j.play('Wait a while');
    expect(j.holds('knows', 'party', 'lc_count_prints')).toBe(true);
    await j.play('Show Merren the wet prints under her chair');
    expect(j.holds('lcWheelGiven', 'party')).toBe(true);
    expect(j.holds('knows', 'party', 'lc_true_count')).toBe(true);
    expect(j.campaign.world.related('ownedItem').some(r => r.args[0] === 'tallow__lc_merren_wheel')).toBe(true);
    await j.play(`==${j.measure('lcCountClose', 'party')}`);
    expect(j.holds('lcMerrenCounted', 'party')).toBe(true);
    for (const r of reflections) { expect(j.holds('lcSpent', r)).toBe(false); }
    expect(j.holds('at', 'lc_rill_trough', 'green')).toBe(false);
  }, 15000);
});

describe('the reflection in Merren\'s chair', () => {
  const closed = async (seed: string) => {
    const j = await counting(seed, 'thief');
    await j.play(`==${j.measure('lcCountClose', 'party')}`);
    j.put('party', 'taproom');
    await j.play('Ask Merren about the paper boats');
    return j;
  };

  it('can be turned with the paper boat, which stops the leak and tells where Merren is', async () => {
    const j = await closed('reflection-turned');
    expect(j.offers('Give her the paper boat from the sill')).toBe(false);
    j.assert('knows', 'party', 'lc_boats_memory');
    const ash = j.measure('lcAshScore', 'party');
    await j.play('Give her the paper boat from the sill');
    expect(j.holds('lcReflectionTurned', 'party')).toBe(true);
    expect(j.holds('knows', 'party', 'lc_counting_city')).toBe(true);
    expect(j.measure('lcAshScore', 'party')).toBe(ash - 1);
    expect(j.measure('lcWestScore', 'party')).toBe(1);
    expect(j.offers('Tell her she is not Merren')).toBe(false);
  }, 15000);

  it('can be unmade, which stops the leak and leaves the chair empty', async () => {
    const j = await closed('reflection-unmade');
    const ash = j.measure('lcAshScore', 'party');
    await j.play('Tell her she is not Merren');
    expect(j.holds('at', 'lc_merren_reflected', 'taproom')).toBe(false);
    expect(j.measure('lcAshScore', 'party')).toBe(ash - 1);
  }, 15000);
});

describe('the panes', () => {
  it('opens the counting city only at the pane the discs sum to, and the others bite', async () => {
    const j = await counting('panes', 'thief');
    await j.play('Have Wenna lift what Rill by the trough carries in her coat');
    await j.play(`==${j.measure('lcCountClose', 'party')}`);
    Placed.at(j, 'tallow__lc_mirror_array');
    expect(j.offers('Step along to the next pane')).toBe(false);
    await j.play('Turn over the brass disc from Rill by the trough');
    const target = j.measure('lcPaneTarget', 'party');
    const wrong = target === 9 ? 1 : target + 1;
    for (let i = 0; i < wrong; i++) { await j.play('Step along to the next pane'); }
    expect(j.measure('lcPaneAt', 'party')).toBe(wrong);
    await j.play('Press your palm to the pane');
    expect(j.holds('lcPaneOpened', 'party')).toBe(false);
    expect(j.measure('lcPaneAt', 'party')).toBe(0);
    for (let i = 0; i < target; i++) { await j.play('Step along to the next pane'); }
    await j.play('Press your palm to the pane');
    expect(j.holds('lcPaneOpened', 'party')).toBe(true);
    expect(j.holds('knows', 'party', 'lc_counting_city')).toBe(true);
    expect(j.holds('knows', 'party', 'lc_true_count')).toBe(true);
  }, 15000);
});

describe('the war of the eight marches', () => {
  it('lets neglect give Swallet to the Ash, which then tithes the company', async () => {
    const j = await counting('war-lost', 'thief');
    await j.play(`==${j.measure('lcCountClose', 'party')}`);
    expect(j.measure('lcAshScore', 'party')).toBeGreaterThan(j.measure('lcWestScore', 'party'));
    const saved = resumed(j);
    await saved.play(`==${saved.measure('lcWarDue', 'party') + 288 * 4}`);
    expect(saved.holds('lcAshTriumph', 'party')).toBe(true);
    expect(saved.holds('at', 'lc_garrison', 'green')).toBe(true);
    saved.put('party', 'green');
    saved.campaign.commitWorld(saved.campaign.world.apply([{ kind: 'set',
      call: ModuleWriter.call('quantity', 'party', 'rations'), value: ModuleWriter.number(12) }]));
    const taken = saved.measure('quantity', 'lc_garrison', 'rations');
    await saved.play(`==${saved.measure('lcTitheDue', 'party')}`);
    expect(saved.measure('quantity', 'lc_garrison', 'rations')).toBe(taken + 1);
    expect(saved.measure('lcTitheDue', 'party')).toBeGreaterThan(saved.watch());
    expect(saved.offers('Raise Merren\'s wheel')).toBe(false);
  }, 20000);

  it('lets the Rì rally on Merren\'s wheel and count, and break the Ash\'s line', async () => {
    const j = await counting('war-won', 'ranger');
    j.put('party', 'taproom');
    await j.play('Wait a while', 'Show Merren the wet prints under her chair');
    await j.play(`==${j.measure('lcCountClose', 'party')}`);
    j.assert('lcFactorRefused', 'party');
    j.assert('lcCellDefied', 'party');
    j.assert('lcCrewArrived', 'party');
    Placed.at(j, 'tallow__gate_house');
    expect(j.offers('Raise Merren\'s wheel at the Calx Gate')).toBe(false);
    j.put('party', 'taproom');
    await j.play('Ask Merren about the paper boats', 'Tell her she is not Merren');
    Placed.at(j, 'tallow__gate_house');
    expect(j.measure('lcWestScore', 'party')).toBe(3);
    expect(j.offers('Raise Merren\'s wheel at the Calx Gate')).toBe(false);
    await j.play('Read the last page of Merren\'s ledger');
    await j.play('Raise Merren\'s wheel at the Calx Gate and send the count west');
    await j.play(`==${j.measure('lcHostDue', 'party')}`);
    expect(j.holds('at', 'lc_free_host', 'green')).toBe(true);
    await j.play(`==${j.measure('lcWarDue', 'party') + 288 * 2}`);
    expect(j.holds('lcAshBroken', 'party')).toBe(true);
    expect(j.holds('lcAshTriumph', 'party')).toBe(false);
  }, 20000);

  it('counts the Ash scout\'s report against the West, and brings the host a day sooner through a freed gate', async () => {
    const j = await counting('war-gate', 'ranger');
    j.put('party', 'taproom');
    await j.play('Wait a while', 'Show Merren the wet prints under her chair');
    await j.play(`==${j.measure('lcCountClose', 'party')}`);
    const ash = j.measure('lcAshScore', 'party');
    j.assert('lcReconReported', 'party');
    await j.play('Wait a while');
    expect(j.measure('lcAshScore', 'party')).toBe(ash + 1);
    for (const f of ['lcFactorRefused', 'lcCellDefied', 'lcCrewArrived']) { j.assert(f, 'party'); }
    j.put('party', 'taproom');
    await j.play('Ask Merren about the paper boats', 'Tell her she is not Merren', 'Read the last page of Merren\'s ledger');
    j.assert('state', 'calx_gate', 'freed');
    Placed.at(j, 'tallow__gate_house');
    const before = j.watch();
    await j.play('Raise Merren\'s wheel at the Calx Gate and send the count west');
    expect(j.measure('lcHostDue', 'party') - before).toBeLessThan(72);
  }, 20000);
});
