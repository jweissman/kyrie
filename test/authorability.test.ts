import { describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { Journey } from '../src/session/journey';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlaySession } from '../src/session/play-session';

// What an author can add by content alone, through the public architecture (the architecture review's P1): an
// independent adventure that declares a creature of its own (a kind like one of the canon's, with a variation) and a
// thing of its own (a kind like one of the catalog's, with its use), places them, is played — the thing taken, the
// creature met — and is kept across a save and its reading again, with no change to the engine.
const adventure = `Module bw "The Bog Wight" {
  Kind wight_salt "a jar of wight-salt" like herbs worth 3 described "Grey salt that smells of the fen. Rubbed into a wound, it stops it going bad.".
  Species bog_wight "a bog wight" like revenant temperament savage described "A drowned thing that walks up out of the fen with weed in its hair and water running out of its sleeves.".
  Place causeway "the causeway" is room. Company party "You" of 1 at causeway.
  Item salt1 "a jar of wight-salt" is wight_salt at causeway.
  Person wight "the bog wight" at causeway { Role "a drowned thing". Species bog_wight. Variant blighted. Level 2. }
}`;
const source = () => new OverlayBundleSource(NodeBundleSource.shared, {
  'bw/site.kyr': adventure,
  'bw/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
    exports: { party: 'party' } }),
  'bw.campaign.json': JSON.stringify({ version: 1, name: 'bw', modules: [{ id: 'p', bundle: 'bw/module.json' }],
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });

describe('an author\'s own creature and thing, by content alone', () => {
  it('are made by the one pipeline, played, and kept across a save and its reading again', async () => {
    const src = source(), s = await PlaySession.start(src.resolve('bw.campaign.json'), 'bw', src);
    const wight = () => s.campaign.readout.creatures.find(c => /bog_wight$/.test(c.raceId))!;
    // The wight is the revenant's body (its curse and its fear), with the blight laid on it, kept with it.
    const made = wight();
    expect(made.base.abilities).toEqual(expect.arrayContaining(Canon.creature('revenant').abilities!));
    expect([made.variations, made.traits]).toEqual([['blighted'], expect.arrayContaining(['poison_lineage'])]);
    // The salt is a thing of its own kind, taken as any thing is.
    await Journey.of(s).play('wight-salt.*Take|^Take');
    const carried = () => s.campaign.readout.creatures.flatMap(c => c.state.inventory ?? [])
      .filter(i => /wight_salt$/.test(i.definition));
    expect(carried()).toHaveLength(1);
    // Kept as they were: the creature as it was made, the thing where it was put.
    const shape = (c: ReturnType<typeof wight>) => ({ kind: c.raceId, hp: c.base.maxHp, variations: c.variations,
      abilities: c.base.abilities, traits: [...c.traits ?? []].sort() });
    const before = { wight: shape(wight()), salt: carried().map(i => i.definition) };
    const again = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())));
    const after = again.campaign.readout.creatures;
    expect({ wight: shape(after.find(c => /bog_wight$/.test(c.raceId))!),
      salt: after.flatMap(c => c.state.inventory ?? []).filter(i => /wight_salt$/.test(i.definition))
        .map(i => i.definition) })
      .toEqual(before);
  }, 120000);
});
