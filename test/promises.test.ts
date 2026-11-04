import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';

// Quittance's pm 13 (QTC-A27): "bring her to see it" has a place that is right and places that are wrong. Its kept
// condition asks the right place, and its broken one the wrong, named by a relation of the module's own.
class ShowPip {
  static source = new OverlayBundleSource(NodeBundleSource.shared, {
    'sp/site.kyr': `Module sp "Pip" { Place town "the town" is settlement.
      Place lane "the lane" is room within town at 0, 0. Place gap "the Gap" is room within town at 1, 0.
      Place pit "the pit" is room within town at 0, 1.
      Passage a "the way" between lane and gap. Passage b "the steps" between lane and pit.
      Company party "You" of 1 at lane. Relation wrong(place). Initially Assert wrong(pit).
      Person pip "Pip" at lane { Peaceable. Uses go. }
      Topic ask_pip with pip "Promise Pip you will show her the Gap" when not promiseMade(show_pip) once {
        Says "'Promise?' says Pip.". On discuss { Assert promiseMade(show_pip). Assert following(pip, party). } }
      Promise show_pip "to show Pip the Gap" to pip
        kept when at(party, gap) and at(pip, gap) "Pip looks out at the Gap a long while." { }
        broken when at(pip, ?p) and wrong(?p) "Pip says this is not the Gap." { }. }`,
    'sp/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
      exports: { party: 'party' } }),
    'sp.campaign.json': JSON.stringify({ version: 1, name: 'sp', modules: [{ id: 'p', bundle: 'sp/module.json' }],
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
  static start(): Promise<Journey> {
    return Journey.start(this.source.resolve('sp.campaign.json'), 'sp', { source: this.source });
  }
}

// What Tessary Owes' 5 (AUT-24): every promise was written by hand, a relation, a deadline rule, a kept rule, a broken
// rule and a forsworn consequence. A Promise is one thing: made by a word, an aim while it stands, kept when its
// condition first holds, with what keeping it brings (Quittance's friction 14), broken when its other does first, with
// what breaking it brings.
describe('a promise', () => {
  const probe = 'test/fixtures/probes/promise/probe.campaign.json';
  const aims = (j: Journey) => ScreenModel.build(j.campaign).objectives;
  it('is an aim while it stands, and kept when its condition holds', async () => {
    const j = await Journey.start(probe);
    await j.play('Promise the Comptroller');
    expect(aims(j)).toContain("Keep your promise to Comptroller Vane: to bring him the Factor's letter by nightfall.");
    await j.play("Factor's letter: Take", 'Give the Factor');
    expect(j.holds('promiseKept', 'p__letter_promise')).toBe(true);
    expect(j.holds('trusted', 'party')).toBe(true);
    expect(aims(j).some(a => /Keep your promise/.test(a))).toBe(false);
  }, 30000);
  it('is broken when its other condition holds first, and brings what breaking it brings', async () => {
    const j = await Journey.start(probe);
    await j.play('Promise the Comptroller', '=18:10');
    expect(j.holds('promiseBroken', 'p__letter_promise')).toBe(true);
    expect(j.holds('p__forsworn', 'party')).toBe(true);
    expect(j.holds('trusted', 'party')).toBe(false);
    expect(j.taken.map(t => t.told).join(' ')).toContain('a line is drawn through a promise you made');
  }, 30000);
  it('is kept at the one place it names and broken at the others', async () => {
    const kept = await ShowPip.start(), broken = await ShowPip.start();
    await kept.play('Promise Pip', '^To the Gap');
    await broken.play('Promise Pip', '^To the pit');
    expect([kept.holds('promiseKept', 'p__show_pip'), broken.holds('promiseBroken', 'p__show_pip')]).toEqual([true, true]);
    expect(broken.taken.map(t => t.told).join(' ')).toContain('Pip says this is not the Gap.');
  }, 30000);
});
