import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';

// Two things A Parliament of Books needed the engine to say (doc/adventures/parliament-of-books/friction.md): a book
// that raises a quality outside a level's development (Resolve endow, with levelOf for what it asks of its reader), and
// a rule that speaks once for each binding it fires for (a roll called, each member answering), not once in all.
const start = (campaign: string) => PlaySession.start(campaign, 'p', NodeBundleSource.shared);
const act = async (s: PlaySession, re: RegExp) => {
  const c = PlayerView.choices(s.campaign).find(x => re.test(x.choice.name));
  if (!c) { throw new Error(`No ${re} among ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); }
  return s.perform(c.choice.id);
};

describe('a Manual and a roll call', () => {
  it('raises a quality by two through a book that asks the third level of its reader, once', async () => {
    const s = await start('test/fixtures/probes/manual/probe.campaign.json');
    const ama = () => s.campaign.readout.creatures.find(c => c.name === 'Ama')!;
    expect(s.campaign.world.number(ModuleWriter.call('levelOf', 'p__member_party_1'))).toBe(3);
    const before = ama().base.intelligence;
    await act(s, /Collect the grey manual/);
    const e = await act(s, /read the grey manual/);
    expect(ama().base.intelligence).toBe(Math.min(25, before + 2));
    expect(JSON.stringify(e.combat)).toContain('Intelligence is now');
    expect(PlayerView.choices(s.campaign).some(x => /read the grey manual/.test(x.choice.name))).toBe(false);
  });
  it('is not offered to a reader who has not come far enough', async () => {
    const s = await start('test/fixtures/probes/manual/novice.campaign.json');
    await act(s, /Collect the grey manual/);
    expect(PlayerView.choices(s.campaign).some(x => /read the grey manual/.test(x.choice.name))).toBe(false);
  });
  it('tells a rule\'s words once for each member it finds, and what it teaches is learned', async () => {
    const s = await start('test/fixtures/probes/roll-call/probe.campaign.json');
    const e = await act(s, /Call the roll/);
    const told = (e.perceptions ?? []).map(p => p.text);
    for (const who of ['Ann: here.', 'Bo: here.', 'Cy: here.']) { expect(told).toContain(who); }
    expect(told.filter(t => t === 'Everyone is here.').length).toBe(1);
    expect(s.campaign.world.test(ModuleWriter.call('knows', 'party', 'p__roll_known'))).toBe(true);
  });
});
