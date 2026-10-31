import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleParser } from '../src/lang/module-parser';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// What a topic or an action gives the company is put in its hands, and what it spends of a kind is given up by
// whoever of it carries one. What Tessary Owes' Nan had to set Davy's coat on the floor to be taken (its friction W3);
// the Banns at Hessel's note, poem and compass were put in the room, and the Take that followed told nothing (its
// friction 14); the Liberty of the Ice's gifts were dropped and taken (ICE-08); and Low Water's pan took "a
// weight-stone, whichever one the company has" only by a container and a rule on what was put in it (its friction 6).
describe('giving and spending', () => {
  it('reads Give and Spend as what the engine is asked to do', () => {
    const m = ModuleParser.parse(`Module t "T" { Kind group. Kind item. Kind itemkind. Relation handed(item, group).
      Relation usesUp(group, itemkind). Entity party: group "You". Entity coat: item "a coat".
      Entity stone: itemkind "a stone".
      Initially Assert handed(coat, party). Goal false.
      Rule r when true { Give coat to party. Spend stone from party. } }`);
    expect(m.rules?.[0]?.effects).toEqual([
      { kind: 'assert', call: { kind: 'call', name: 'handed', args: ['coat', 'party'] } },
      { kind: 'assert', call: { kind: 'call', name: 'usesUp', args: ['party', 'stone'] } }]);
  });
  it('puts what is given in the company\'s hands, where it lay no longer', async () => {
    const j = await Journey.start('test/fixtures/probes/give/probe.campaign.json', 'k');
    await j.play('Ask Nan about Davy\'s coat');
    expect(j.taken.at(-1)!.page).toContain('You take Davy’s red coat.');
    expect(j.screen().items.map(i => i.name)).toContain('Davy\'s red coat');
    expect(j.at('p__coat')).toBeUndefined();
    expect(j.holds('handed', 'p__coat', 'p__party')).toBe(false);
    expect(j.offers('Davy\'s red coat: Take')).toBe(false);
  }, 60000);
  it('spends one of a kind, whichever of them the company carries, and then the other', async () => {
    const j = await Journey.start('test/fixtures/probes/give/probe.campaign.json', 'k');
    await j.play('a weight-stone: Take', 'a pair of bronze hands: Take');
    const stones = () => j.screen().items.filter(i => /weight-stone|bronze hands/.test(i.name)).length;
    expect(stones()).toBe(2);
    await j.play('Set a weight-stone in Nan\'s scales');
    expect(stones()).toBe(1);
    expect(j.measure('p__own_weighed', 'p__kitchen')).toBe(1);
    await j.play('Set a weight-stone in Nan\'s scales');
    expect(stones()).toBe(0);
    expect(j.offers('Set a weight-stone')).toBe(false);
  }, 60000);
  // Two of one kind, and the particular one spent by name, not whichever comes first (the Lull's friction F5).
  it('spends a particular thing by its own name, not another of its kind', async () => {
    const j = await Journey.start('test/fixtures/probes/give/probe.campaign.json', 'k');
    await j.play('a weight-stone: Take', 'a pair of bronze hands: Take', 'Pawn the bronze hands with Nan');
    expect(j.screen().items.map(i => i.name).filter(n => /weight-stone|bronze hands/.test(n))).toEqual(['a weight-stone']);
  }, 60000);
  // "Anywhere in Mrs Cherrett's lodgings" was written room by room (the Banns at Hessel's friction 13).
  it('asks whether the company is anywhere within an area, however deep', async () => {
    const j = await Journey.start('test/fixtures/probes/give/probe.campaign.json', 'k');
    expect(j.holds('within', 'party', 'p__house')).toBe(true);
    expect(j.holds('within', 'party', 'p__town')).toBe(true);
    expect(j.offers('Sit by Nan\'s fire')).toBe(true);
    await j.play('Out to the lane');
    expect(j.holds('within', 'party', 'p__house')).toBe(false);
    expect(j.holds('within', 'party', 'p__town')).toBe(true);
    expect(j.offers('Sit by Nan\'s fire')).toBe(false);
  }, 60000);
  // Low Water's heart, filed with the company by `Assert keeps(actor, ninth_heart)`, was carried by no one (its
  // friction 3); one an NPC pockets is theirs.
  it('is what the lint tells an author who files a thing with the company', async () => {
    const found = await KyrLint.campaign('test/fixtures/probes/kept/probe.campaign.json', new NodeBundleSource());
    expect(found.filter(f => f.check === 'keeps').map(f => f.message)).toEqual([
      'p__lift files p__heart with actor, where no one carries it: Give p__heart to actor']);
  }, 60000);
});
