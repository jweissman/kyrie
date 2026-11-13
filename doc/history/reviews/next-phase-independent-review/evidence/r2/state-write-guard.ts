// R2 probe: which engine-maintained facts can authored Kyr write? The guard is three hand lists that disagree:
// ModuleCompiler (Rules), ModuleAssembly.readOnly (Actions, incl. Topics), ModuleInstallations.admit (Initially).
// Each case is its own module; we report whether it loads, and what the world says afterwards vs the engine's own clock.
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../../src/campaign/overlay-bundle-source';
import { FictionalTime } from '../../../../../src/presentation/fictional-time';
import { ModuleWriter } from '../../../../../src/lang/module-writer';
import type { Campaign } from '../../../../../src/campaign/campaign';

const head = `Place field "Field" is wilderness. Place room "Room" is room within field at 0, 0. Company party "You" of 1 at room.
  Person ann "Ann" at room { Ancestry human. Calling warrior. Level 1. }`;
const act = (effects: string) => `Action forge(actor: group) "Forge" { Requires company(actor). Time 1. On success { ${effects} } Result "Done.". }`;
const cases: Record<string, string> = {
  'rule writes able (guarded)': `Rule r when at(party, room) { Assert dead(party). }`,
  'action writes watch (guarded)': act('Set watch(clock) to 99.'),
  'rule writes hour/day/season': `Rule r when at(party, room) { Set hour(clock) to 3. Set day(clock) to 40. Set season(clock) to 4. }`,
  'rule writes untilDark/untilTurn': `Rule r when at(party, room) { Set untilDark(clock) to 0. Set untilTurn(clock) to 0. }`,
  'action writes dark/dice': act('Assert dark(). Set dice(clock) to 1.'),
  'action writes untilDark': act('Set untilDark(clock) to 2000.'),
  'topic On discuss writes dark/dice/established': `Topic t with ann "Ask Ann" when true { Says "Hm.". On discuss { Assert dark(). Set dice(clock) to 1. } }`,
  'event then writes dice (rule)': `Event e at room when at(party, room) "Odd." then { Set dice(clock) to 1. }`,
  'initially dark/dice/untilLight/hour': `Initially Assert dark(). Initially Set dice(clock) to 1. Initially Set untilLight(clock) to 0. Initially Set hour(clock) to 3.`,
  'rule writes company/temperament/slain': `Rule r when at(party, room) { Assert company(ann). Assert slain(ann). }`,
  'rule writes quantity of a non-actor': `Rule r when at(party, room) { Set quantity(room, gold) to 50. }`,
};
const files: Record<string, string> = {};
Object.keys(cases).forEach((name, i) => {
  files[`wg${i}/site.kyr`] = `Module wg${i} "Write guard ${i}" { ${head}\n  ${cases[name]}\n  Goal false. }`;
  files[`wg${i}/module.json`] = JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'] });
  files[`wg${i}.campaign.json`] = JSON.stringify({ version: 1, name: `wg${i}`, modules: [{ id: 'p', bundle: `wg${i}/module.json` }],
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
});
const overlay = new OverlayBundleSource(NodeBundleSource.shared, files);
const clock = (c: Campaign) => {
  const w = c.world, n = (m: string) => w.module.measures.some(x => x.name === m) ? w.number(ModuleWriter.call(m, 'clock')) : null;
  const e = c.readout.elapsed;
  return { elapsed: e, dark: w.test(ModuleWriter.call('dark')), engineDark: FictionalTime.dark(e), hour: n('hour'), engineHour: FictionalTime.hour(e),
    day: n('day'), season: n('season'), dice: n('dice'), untilDark: n('untilDark'), engineUntilDark: FictionalTime.untilDark(e),
    untilLight: n('untilLight'), company: c.actors.filter(a => w.test(ModuleWriter.call('company', a.id))).map(a => a.id),
    slain: c.actors.filter(a => w.module.relations.some(r => r.name === 'slain') && w.test(ModuleWriter.call('slain', a.id))).map(a => a.id) };
};
for (const [i, name] of Object.keys(cases).entries()) {
  try {
    const s = await PlaySession.start(overlay.resolve(`wg${i}.campaign.json`), 'seed', overlay); const c = s.campaign;
    const before = clock(c);
    const forge = c.offered().find(o => /forge|__t\(/.test(o.id) || o.schema?.endsWith('__t'));
    const wait = c.offered().find(o => o.schema === 'wait')!;
    const ev = c.execute((forge ?? wait).id);
    const after = clock(c);
    let waited: unknown;
    if (name === 'action writes untilDark') {
      const w = c.offered().find(o => o.schema === 'wait_for_dark');
      if (w) { const e0 = c.readout.elapsed; c.execute(w.id); waited = { waitForDarkTook: c.readout.elapsed - e0, engineWouldTake: FictionalTime.untilDark(e0) }; }
    }
    console.log(`LOADED  ${name}\n  ran ${ev.action}\n  before ${JSON.stringify(before)}\n  after  ${JSON.stringify(after)}${waited ? `\n  ${JSON.stringify(waited)}` : ''}`);
  } catch (e) { console.log(`REFUSED ${name}: ${(e as Error).message.split('\n')[0]}`); }
}
