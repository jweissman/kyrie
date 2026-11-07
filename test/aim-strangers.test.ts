import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';
import { ObservationText } from '../src/lang/observation-text';
import type { Change } from '../src/lang/module';
import { AimWords } from '../src/presentation/aim-words';

// The fresh playtest of 7 November broke the bone lantern in the unquiet tower without ever coming to the shrine whose
// priest the tower's story binds, and was given "The dead in the tower are still. Kellen will want to know.", of a
// Kellen it had never met nor heard of; the map said "Not yet on your map: Kellen may know where" of Kellen himself.
// An aim names whom it leads to as who they are and where they are found, until the company has spoken with them, and
// the map finds where; one whose town it names is said by the room they keep in it (the owner's own session, 7
// November: "Ask Ulric about what has come up under the churchyard at Elmford" left the shrine to be guessed).
describe('an aim that leads to someone the company has never met', () => {
  it('says who they are and where, and the map finds them', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Sable', raceId: 'catfolk', classId: 'cleric' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source), c = s.campaign;
    const x = c as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    const report = c.module.objectives!.find(o => o.id === 'tower__report')!;
    const priest = /\{([^}]+)\} will want to know/.exec(report.text)![1]!, shrine = c.world.one('at', priest)!;
    const town = c.module.entities.find(e => e.id === shrine)!.space!.parent!;
    const [name, role] = c.module.entities.find(e => e.id === priest)!.name.split(', ');
    x.commit(x.world.apply([{ kind: 'assert', call: ModuleWriter.call('tower__ended', 'tower__necromancer') }]));
    let aim = ScreenModel.build(c).aims!.find(a => a.id === 'tower__report')!;
    expect(aim.text).toBe(`The dead in the tower are still. ${name}, ${role} at ${ObservationText.label(c.world, town)},`
      + ' will want to know.');
    expect(aim.places).toEqual([shrine, town]);
    expect(aim.who).toBeUndefined();
    // Spoken with, they are called by name, as anyone met is.
    x.commit(x.world.apply([{ kind: 'assert', call: ModuleWriter.call('acquainted', priest, 'party') }]));
    aim = ScreenModel.build(c).aims!.find(a => a.id === 'tower__report')!;
    expect(aim.text).toBe(`The dead in the tower are still. ${name} will want to know.`);
    // A job read on a notice names the town; whom to ask there is said by the room they keep.
    const jobs = c.module.objectives!.filter(o => o.id.endsWith('_job_sought'));
    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) { expect(AimWords.render(c.world, job)).toMatch(/^Ask [^,]+, [^,]+ at [^,]+, about /); }
  }, 120000);
});
