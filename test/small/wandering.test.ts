import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ScreenModel } from '../../src/ui/screen-model';
import { Marks } from '../../src/ui/marks';
import { ChoiceList, type Choice } from '../../src/ui/choice-list';

// What may find the company while an act takes its time, said on its row (OR-1857; cold round D4: "Lever the small
// stones out of the wall, one by one" took the best part of an hour in the hall of the bones, and the banshees of the
// long gallery came on the company at its end, the row having said nothing). Read from the module's own rules: each
// that brings a band to wherever the company is on a die of its own each watch (as DeepSites writes the savage and the
// territorial of a level going about it), never from a flag on the act. The hour is said; a moment's look is not; and
// once those who go about are dead, nothing is.
const goes = (band: string, room: string) => `
  Rule ${band}_wanders when able(${band}) and at(${band}, ?o) and at(party, ?p) and deepLevelOf(?p, halls)`
  + ` and deepLevelOf(?o, halls) and distinct(?o, ?p) and dice(${band}) <= 5`
  + ` says "Something is coming along the passage toward you: ${band}." {
    Retract at(${band}, ?o). Assert at(${band}, ?p). }
  Initially Assert deepLevelOf(${room}, halls).`;
const world = (bands: string) => `
  Place mound "the mound" is site at 0, 0.
  Place halls "the long halls" is level within mound.
  Place bones "the hall of the bones" is room within halls at 0, 0 underground.
  Place gallery "the long gallery" is room within halls at 1, 0 underground.
  Place well "the well" is room within halls at 2, 0 underground.
  Passage arch "the arch" is passage between bones and gallery.
  Passage steps "the steps" is passage between gallery and well.
  Relation deepLevelOf(place, place).
  Initially Assert deepLevelOf(bones, halls).
  Person banshees "the banshees" at gallery { Role "the restless dead". Species zombie. Numbers 3. Level 1. Temperament savage. Lair gallery. }
  Person hounds "the bone hounds" at well { Role "the hounds". Species zombie. Numbers 2. Level 1. Temperament savage. Lair well. }
  ${bands}
  Action lever(actor: group, site: place) "Lever the small stones out of the wall, one by one" {
    Requires able(actor) and at(actor, site) and at(actor, bones).
    Time 6.
    Result "Every stone that comes out rings on the floor.".
  }
  Action peer(actor: group, site: place) "Peer at the small stones" {
    Requires able(actor) and at(actor, site) and at(actor, bones).
    Time 1.
    Result "They are laid dry.".
  }
  Company party "You" of 1 at bones.
  Goal false.`;
const party = [{ name: 'Odile', raceId: 'human', classId: 'warrior' }];
const start = (kyr: string) => Tiny.start(kyr, { horizon: ['inhabitants', 'canon'], party });
const act = (t: Tiny, label: RegExp) => ScreenModel.build(t.campaign).camp.find(a => label.test(a.label));
const lever = /^Lever the small stones/, peer = /^Peer at/;

describe('what may find the company while it works', () => {
  it('says those who go about the level may find it in the hour an act takes, and is not barred', async () => {
    const t = await start(world(goes('banshees', 'gallery') + goes('hounds', 'well')));
    const row = act(t, lever)!;
    expect(row.roused).toBe('Those who go about the long halls may find you here in an hour.');
    expect(row.about).toContain(row.roused);
    expect(row.disabled).toBeUndefined();
    expect(act(t, peer)?.roused).toBeUndefined();
    const screen = ScreenModel.build(t.campaign);
    const flat = (cs: Choice[]): Choice[] => cs.flatMap(c => [c, ...flat(c.children ?? [])]);
    const marks = Marks.on(screen, ChoiceList.explore(screen)).flatMap(s => flat(s.choices))
      .filter(c => lever.test(c.label)).flatMap(c => c.marks ?? []);
    expect(marks).toContainEqual({ kind: 'roused', said: row.roused! });
  });
  it('says nothing where no rule brings anyone, nor off the level those who go about keep to', async () => {
    expect(act(await start(world('')), lever)?.roused).toBeUndefined();
    const off = world(goes('banshees', 'gallery') + goes('hounds', 'well'))
      .replace('Initially Assert deepLevelOf(bones, halls).', 'Initially Assert deepLevelOf(bones, mound).');
    expect(act(await start(off), lever)?.roused).toBeUndefined();
  });
});
