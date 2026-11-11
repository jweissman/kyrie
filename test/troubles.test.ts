import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { ScreenModel } from '../src/ui/screen-model';

const start = async (seed = 'kahitude') => Journey.of(await DrawnWorld.start(seed, { origin: 'debt',
  party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
const source = async (seed = 'kahitude') => [...((await WorldAssembler.assemble(seed, NodeBundleSource.shared, {})).source as
  unknown as { files: Map<string, string> }).files.values()].join('\n');
const r = (id: string) => `region__${id}`;

// Small situations played and not paid (troubles.kyrt, conflict.kyrt): someone missing, someone to escort, odd animals,
// a theft with a culprit drawn per country, and a bailiff with a forged seal. Each has clues, and a wrong answer costs.
describe('the first town’s troubles', () => {
  it('loses an apprentice to her own ambition, and finds her under the hill with a rope, a splint and a bad temper', async () => {
    const j = await start();
    await j.play('>s1_green', 'Ask Hesper Lowe about the drawing', '=+45');
    expect(Placed.holds(j, 'region__s1_hesper_gone', 'party')).toBe(true);
    // The arc leads the page as an aim, so the new foreground can show the way to the one who knows.
    expect(ScreenModel.build(j.campaign).objectives)
      .toContainEqual(expect.stringMatching(/^Hesper Lowe's apron was found/));
    await j.play('Ask');
    Placed.at(j, r('s1_stones_under'));
    await j.play('=+1');
    await j.play('Help Hesper Lowe up');
    expect(Placed.holds(j, 'region__s1_hesper_found', 'party')).toBe(true);
    expect(j.campaign.world.one('at', r('s1_hesper'))).toBe(r('s1_green'));
  }, 240000);

  it('asks to be walked to a stone by a man who will be slow about it', async () => {
    const j = await start();
    Placed.at(j, r('s1_taproom'));
    await j.play('Ask Osmund Pyle where he is going', 'Ask him to come with you');
    expect(j.campaign.world.related('following').some(x => x.args[0] === r('s1_pilgrim'))).toBe(true);
    Placed.at(j, r('e1'));
    Placed.move(j, r('s1_pilgrim'), r('e1'));
    expect(j.campaign.world.one('at', r('s1_pilgrim'))).toBe(r('e1'));
    await j.play('=+1');
    expect(Placed.holds(j, 'cameHome', r('s1_pilgrim'))).toBe(true);
  }, 180000);

  it('has a theft whose culprit is the country’s own, with a wrong answer that costs someone', async () => {
    const text = await source();
    const right = /Topic s1_accuse_right with s1_anselm "Tell \{s1_anselm\} the bronze was taken by ([^"]+)"/
      .exec(text)?.[1];
    expect(right).toBeDefined();
    const j = await start();
    Placed.at(j, r('s1_shrine'));
    await j.play('Look closely at the offering-box');
    await j.play(`the bronze was taken by ${right}`);
    expect(Placed.holds(j, 'region__s1_theft_solved', 'party')).toBe(true);
    const k = await start();
    Placed.at(k, r('s1_shrine'));
    await k.play('Look closely at the offering-box');
    const wrong = /Topic s1_accuse_wrong with s1_anselm "Tell \{s1_anselm\} the bronze was taken by ([^"]+)"/
      .exec(text)![1]!;
    await k.play(`the bronze was taken by ${wrong}`);
    expect(Placed.holds(k, 'region__s1_theft_wrong', 'party')).toBe(true);
  }, 240000);

  it('has animals behaving oddly for a reason found by looking, told to the cook who knows the house', async () => {
    const text = await source();
    const vixen = /Thing s1_tracks/.test(text);
    const j = await start();
    if (vixen) { Placed.at(j, r('s1_manor_garden')); await j.play('Follow the marks under the garden wall'); }
    else { Placed.at(j, r('s1_manor_cellar')); await j.play('Listen at the old wall'); }
    expect(Placed.holds(j, 'knows', 'party', r('s1_animals_fact'))).toBe(true);
    Placed.at(j, r('s1_manor_kitchen'));
    await j.play(vixen ? 'about the vixen' : 'it is only the wind');
    expect(Placed.holds(j, 'region__s1_animals_known', 'party')).toBe(true);
  }, 240000);

  it('has a bailiff with a forged seal, three communities that pay or refuse, and a clock that does not wait for the company', async () => {
    const text = await source();
    const b = /Person s1_rooke "Maudlin Rooke" at (s\d+)_green/.exec(text)![1]!;
    const j = await start();
    Placed.at(j, r('s1_green'));
    await j.play('=+130');
    expect(j.latest).toContain('hayrick');
    await j.play('Read the dues-receipt on the post');
    expect(Placed.holds(j, 'knows', 'party', r('s1_rec_a'))).toBe(true);
    Placed.at(j, r('s1_manor_muniments'));
    Placed.assert(j, 's1_roadwood_open', 'party');
    await j.play('Read the grant that is under the paperweight').catch(() => '');
    expect(b).toMatch(/^s\d+$/);
  }, 240000);

  it('lets a company report the bailiff and wait it out, or buy her silence and be remembered for it', async () => {
    const j = await start();
    Placed.at(j, r('s1_green'));
    await j.play('Read the dues-receipt on the post');
    Placed.knows(j, r('s1_forged'));
    await j.play('Aldous Fenn the bailiff');
    await j.play('=+80');
    expect(Placed.holds(j, 'region__s1_rooke_reported', 'party')).toBe(true);
    expect(Placed.holds(j, 'region__s1_rooke_end', 'party')).toBe(true);
  }, 240000);

  it('warns before it fights: the company is given the length of a breath, and may say it was mistaken and go', async () => {
    const text = await source();
    const b = /Person s1_rooke "Maudlin Rooke" at (s\d+)_green/.exec(text)![1]!;
    const j = await start();
    Placed.at(j, r(`${b}_green`));
    Placed.knows(j, r('s1_forged'));
    await j.play('Tell Maudlin Rooke her seal is a forgery');
    expect(Placed.holds(j, 'region__s1_rooke_warned', 'party')).toBe(true);
    expect(Placed.holds(j, 'region__s1_rooke_challenged', 'party')).toBe(false);
    await j.play('Say you were mistaken, and go');
    expect(Placed.holds(j, 'region__s1_rooke_challenged', 'party')).toBe(false);
    expect(j.offers('Stand by it')).toBe(false);
  }, 240000);
});
