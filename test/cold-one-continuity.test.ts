import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { CampaignLint } from '../src/cli/campaign-lint';
import { PlayerView } from '../src/presentation/player-view';

// The first blind cold play's continuity (OR-249 to OR-254, careful reader, iscoed, 24 November), each by its cause:
// a line said while its fact no longer held (Dai's beast, the empty socket); the weather told where the sky was not
// read; a person's line ignoring where they are (Ifan at his door, poling a boat); two pronoun sources for one person
// (Gek "her", then "They"); and talk heard near someone filed as told by them, in words that were not theirs (Dreg).
// The weir life in Iscoed, its facts made so where the long way round is not what is under proof.
const life = async (opening?: string) => Journey.of(await DrawnWorld.start('iscoed', { origin: 'weir',
  ...opening ? { opening } : {}, party: [{ name: 'Wren', raceId: 'human', classId: 'bard' }] }, NodeBundleSource.shared));
const labels = (j: Journey, of: RegExp) => j.choices().map(c => c.full).filter(l => of.test(l));
describe('the first cold play\'s continuity', () => {
  it('has Dai afraid of the badger only while it stands its ground (OR-249)', async () => {
    const j = await life('adit');
    await j.play('a candle: Light');
    j.put('party', 'region__s4_adit_gallery');
    expect(j.seen()).toMatch(/It went for me when I tried to get by/);
    j.assert('routed', 'adit__badger');
    expect(j.seen()).toMatch(/Is it gone\?/);
    expect(j.seen()).not.toMatch(/It went for me when I tried to get by/);
  }, 120000);
  it('tells the weather only from the sky (OR-250)', async () => {
    for (const seed of ['iscoed', 'kahitude']) {
      const s = await DrawnWorld.start(seed, { origin: 'weir', party: [{ name: 'Wren', raceId: 'human', classId: 'bard' }] },
        NodeBundleSource.shared);
      const lint = new CampaignLint(seed, s);
      lint.weathers();
      expect([seed, lint.findings.map(f => f.message)]).toEqual([seed, []]);
    }
  }, 120000);
  it('has Ifan Rhys at the pole of his boat under the gatehouse, not at his door (OR-251)', async () => {
    const j = await life();
    expect(labels(j, /Talk to Ifan Rhys/)[0]).toMatch(/mending a trap at his door/);
    // As the gate's story has it: the gate shut, the pin known sawn, his boat under the floor.
    j.assert('gate__mended', 'party');
    j.assert('knows', 'party', 'gate__cut');
    j.put('gate__ifan', 'gate__gatehouse');
    j.put('party', 'gate__gatehouse');
    expect(labels(j, /Ifan Rhys/).join(' ')).not.toMatch(/mending a trap/);
    expect(labels(j, /Talk to Ifan Rhys/)[0]).toMatch(/at the pole of a flat-bottomed boat/);
    await j.play('Ask Ifan who wanted the gate open');
    expect(j.latest).toMatch(/leans on the pole/);
    expect(j.latest).not.toMatch(/puts the trap down/);
  }, 120000);
  it('says the pawl\'s socket as it is to a company holding the pawl, and having tried it (OR-252)', async () => {
    const j = await life();
    j.put('party', 'gate__gatehouse');
    expect(j.seen()).toMatch(/an empty socket, cut for something the shape of a tooth/);
    j.give('gate__pawl');
    expect(j.seen()).toMatch(/the socket the pawl you carry was cut for/);
    j.assert('gate__gateTried', 'party');
    expect(j.seen()).toMatch(/still empty, its rim scraped bright/);
  }, 120000);
  it('has Gek one pronoun, her own, in the row and the answer (OR-253)', async () => {
    const j = await life();
    expect(labels(j, /coin on the cord/)[0]).toMatch(/round her neck/);
    await j.play('Ask Gek about the coin on the cord');
    expect(j.latest).toMatch(/The coin turns in the light between her fingers/);
    expect(j.latest).not.toMatch(/\bThey\b|\btheir\b/);
  }, 120000);
  it('notes Dreg as telling of Black Howe only in his own words (OR-254)', async () => {
    const j = await life();
    j.assert('knows', 'party', 'howe__ridge_told');
    await j.play('>region__s4_taproom');
    // The mound is told apart by its side of the country and its land, not by a town (OR-812).
    expect(j.latest).toMatch(/Dreg has a name for the (?:[a-z-]+ern )?grassed mound\b[^.:]* you heard of: Black Howe/);
    const howe = PlayerView.observe(j.campaign).knowledge.find(k => k.id === 'region__w13_named');
    expect([howe?.source, howe?.from?.split(',')[0]]).toEqual(['heard', 'Dreg']);
  }, 120000);
});
