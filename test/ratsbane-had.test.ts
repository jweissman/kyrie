import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';
import { AsMeant } from './support/as-meant';
import { BeforeRooms } from './support/before-rooms';
import { GeneratedWorld } from './support/generated';
import { RunnerFind } from './support/runner-find';

// Cold play 5's 12 (CL-32; doc/design/hall-response-audit.md): Gek promised "lay ratsbane… It wants a night", and no
// ratsbane was to be had. Now the merchant says where it is had (her own shelf, the chandler's, or says nothing of
// it), and the way is played on the weir's mage's own lines: the job asked, a creel of eels sold to Nest for the
// coin, ratsbane bought of Gek, laid in the cellar, and the rats dead by morning with no fight.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-5-lines.txt', 'utf8').split('\n').filter(Boolean);
const text = (s: Said) => s.scene.lines.join(' ').replace(/[‘’]/g, "'");
describe('the corn-store\'s rats, by ratsbane', () => {
  it('is said where it is had, bought, laid, and the rats dead by morning without a fight', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const r = new Runner(BeforeRooms.set(journey.session)), c = journey.session.campaign;
    const told = await AsMeant.play(r, lines.slice(0, 27));
    expect(text(told.at(-1) as Said)).toContain("'I've ratsbane on the shelf, if you'd sooner not be bitten.");
    // The coin for it as the weir's heir has it: the morning's eels, sold to Nest.
    await GeneratedWorld.travel(journey.session, 'origin__weir');
    await RunnerFind.act(r, r.said(), /^Lift the weir's trap/);
    await RunnerFind.act(r, r.said(), /^Collect a creel of eels/);
    await GeneratedWorld.travel(journey.session, 's4_green');
    await RunnerFind.act(r, r.said(), /^Talk to Nest$/);
    await RunnerFind.act(r, r.said(), /^Sell Nest the creel of eels/);
    await RunnerFind.act(r, r.said(), /^Buy a twist of ratsbane/);
    await GeneratedWorld.travel(journey.session, 's4_u_cellar');
    expect(text(await RunnerFind.act(r, r.said(), /^Lay ratsbane where the rats come up/))).toContain('By morning');
    await GeneratedWorld.travel(journey.session, 's4_green');
    await journey.play('==+48');
    expect(c.world.test(ModuleWriter.call('dead', 'region__s4_u_rats'))).toBe(true);
    expect(c.world.test(ModuleWriter.call('region__s4_u_done', 'region__s4_u_rats_job'))).toBe(true);
  }, 300000);
});
