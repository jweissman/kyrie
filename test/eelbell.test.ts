import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/eelbell/journey.json';

// The Eel Bell, played by the labels a player sees. The company comes up the sea-bank road at the first light of the
// first day; the Silver Run's tide makes on the third night (62 hours on), and the grey hour comes at dawn after it.
describe("The Eel Bell", () => {
  const campaign = 'data/campaigns/eelbell.campaign.json';
  const start = async () => { const j = await Journey.start(campaign, "eelbell"); await j.play(...steps.arrive); return j; };
  const ended = (j: Journey) => j.campaign.world.related('reached').map(r => r.args[0]);
  const gathered = async () => { const j = await start(); await j.play(...steps.gather.slice(1)); return j; };

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 60000);

  it('is played from the road into the staithe', async () => {
    const j = await start();
    expect(j.at('party')).toBe("eelbell__staithe");
  }, 60000);

  it('the child hums the Grandam only for someone who has found her cat; the Warden gives its metal only after he has been heard', async () => {
    const j = await start();
    await j.play('To the foot of the sea-gate tower');
    expect(j.matches("Ask Dyce again|Ask Dyce for the Grandam's pieces").length).toBe(1);
    await j.play('Ask Dyce for the Grandam');
    expect(j.holds('dyceTold', 'party')).toBe(false);
    await j.play('Ask Dyce about the gate', 'Ask Dyce what happened');
    expect(j.holds('dyceTold', 'party')).toBe(true);
    await j.play("Ask Dyce for the Grandam's pieces");
    await j.play('To the staithe');
    expect(j.matches('Ask Posy to hum').length).toBe(0);
    await j.play('Ask Posy what she hums', 'To the foot of the sea-gate tower', 'To the bell loft', 'To the foot of the sea-gate tower', 'To the staithe', 'Tell Posy her cat', 'Ask Posy to hum');
    expect(j.holds('knows', 'party', 'hum_known')).toBe(true);
  }, 120000);

  it("Rushby's kettles come for a promise and a third for the Warden's night; the sledge comes with the promise", async () => {
    const j = await start();
    await j.play('To the foot of the sea-gate tower', 'Ask Dyce about the gate', 'Ask Dyce what happened', 'To the staithe', 'To the eel-weirs', 'Ask Rushby about the eels', 'Ask Rushby about the Grandam');
    expect(j.holds('sledgeLent', 'party')).toBe(false);
    await j.play('Promise Rushby');
    expect(j.holds('sledgeLent', 'party')).toBe(true);
    expect(j.matches('Tell Rushby what Dyce did').length).toBe(1);
    await j.play('Tell Rushby what Dyce did');
    expect(j.holds('rushbyKnows', 'party')).toBe(true);
    expect(j.measure('rope', 'bell')).toBe(2);
  }, 120000);

  it('Sount reads the charge by colour: unsorted pewter turns it white, and a kettle brings it back', async () => {
    const j = await gathered();
    await j.play('Ask Aggie') .catch(() => {});
    await j.play('To the staithe', 'Into the Two Weirs', 'Ask Aggie Pargill for her pewter').catch(() => {});
    await j.play('To the staithe', 'To the church green');
    await j.play('Tip the unsorted pewter');
    expect(j.measure('temper', 'furnace')).toBe(29);
    await j.play('Ask Sount how the charge looks');
    expect(j.latest).toMatch(/boiled egg/);
    await j.play('Cut up a copper kettle', 'Cut up a copper kettle', 'Cut up a copper kettle');
    expect(j.measure('temper', 'furnace')).toBe(20);
    await j.play('Ask Sount how the charge looks');
    expect(j.latest).toMatch(/straw/);
  }, 120000);

  it('casts, tunes and hangs a bell; the true bell rung through the tide brings the silver run', async () => {
    const j = await gathered();
    await j.play(...steps.ringers, ...steps.fire);
    expect(j.measure('strike', 'bell')).toBe(1);
    expect(j.measure('hum', 'bell')).toBe(1);
    await j.play(...steps.tune);
    expect(j.measure('strike', 'bell')).toBe(2);
    expect(j.measure('hum', 'bell')).toBe(2);
    await j.play(...steps.hang);
    expect(j.holds('state', 'bell', 'hung')).toBe(true);
    await j.play('Tell Sount what the bell sounds like');
    expect(j.holds('toldSount', 'party')).toBe(true);
    await j.play(...steps.night);
    expect(ended(j)).toEqual(['eelbell__silver']);
    expect(j.page).toMatch(/left ear against the stone/);
    expect(j.page).toMatch(/Maudlin Greave rings her turn/);
    expect(j.page).toMatch(/eleven words in two years/);
    expect(j.page).toMatch(/clamp has got its wind/);
  }, 240000);

  it('a bell rung by too few stops at three in the morning', async () => {
    const j = await gathered();
    await j.play(...steps.fire, ...steps.tune, ...steps.hang);
    await j.play('=until dawnOn()');
    expect(ended(j)).toEqual(['eelbell__rung_out']);
  }, 240000);

  it('a bell cast right and not tuned does not carry, however well it is rung', async () => {
    const j = await gathered();
    await j.play(...steps.ringers, ...steps.fire, ...steps.hang);
    await j.play('=until dawnOn()');
    expect(ended(j)).toEqual(['eelbell__thin_voice']);
  }, 240000);

  it('a bell with the right strike and the wrong hum brings the boats and not the eels', async () => {
    const j = await gathered();
    await j.play(...steps.ringers, ...steps.fire, 'Pare the sound-bow', ...steps.hang);
    await j.play('=until dawnOn()');
    expect(ended(j)).toEqual(['eelbell__home_poor']);
    expect(j.holds('rushbyBitter', 'party')).toBe(true);
  }, 240000);

  it("the gate's own iron cracks the bell at its first stroke; the Warden knows what to do with it", async () => {
    const j = await gathered();
    await j.play(...steps.ringers, ...steps.gather_chain, ...steps.fire_iron);
    expect(j.holds('cracked', 'bell')).toBe(true);
    await j.play('Tell Sount the bell has cracked', 'Drag the bell', 'Tell Dyce the new bell has cracked', 'Raise the bell');
    await j.play('=until dawnOn()');
    expect(ended(j)).toEqual(['eelbell__cracked_rung']);
    expect(j.page).toMatch(/I know this voice/);
  }, 240000);

  it("a promise of the names is kept by cutting them, and broken by cutting anything else", async () => {
    const j = await gathered();
    expect(j.holds('maudlinBetrayed', 'party')).toBe(false);
    await j.play('To the staithe', 'To the church green', 'Tell Sount to leave the shoulder plain');
    expect(j.holds('maudlinBetrayed', 'party')).toBe(true);
    const k = await gathered();
    await k.play('To the staithe', 'To the church green', 'Tell Sount to cut the seven names');
    expect(k.holds('promiseKept', 'names_promise')).toBe(true);
  }, 240000);

  it('no bell and a fire on the tower brings some of the boats in; no bell and no fire brings none', async () => {
    const j = await gathered();
    await j.play(...steps.cresset);
    expect(ended(j)).toEqual(['eelbell__cresset_night']);
    const k = await start();
    await k.play('=until dawnOn()');
    expect(ended(k)).toEqual(['eelbell__dark_washes']);
  }, 240000);
});
