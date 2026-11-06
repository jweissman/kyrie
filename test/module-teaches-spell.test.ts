import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';

// A module can teach a catalog spell (the Book of Faces' BOF-04: Resolve reward wanted a reward ability, learn spent
// a level's choice, and no mage's researched spell or bard's song could be taught): Resolve teach takes it into what
// a caster knows at no cost, and it can be prepared from then on; one who casts no spells is taught none.
class Taught {
  static async start(classId: string, spell = 'drench') {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'tc/site.kyr': `Module tc "Taught" { Place field "Field" is wilderness.
        Place study "the study" is room within field at 0, 0. Company party "You" of 1 at study.
        Action read_book(actor: group, reader: member, site: place) "Have {reader} read the drowned book" {
          Requires at(actor, site) and memberOf(reader, actor). Resolve teach(reader, ${spell}).
          Result "{reader} reads the drowned book through.". } }`,
      'tc/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'tc.campaign.json': JSON.stringify({ version: 1, name: 'tc', modules: [{ id: 'p', bundle: 'tc/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId }] }) });
    return PlaySession.start(source.resolve('tc.campaign.json'), 'tc', source);
  }
  static knows(s: PlaySession): boolean {
    const c = s.campaign.readout.creatures[0]!;
    return [...c.base.abilities, ...c.state.learnedAbilities].includes('drench');
  }
  static async read(s: PlaySession) {
    return s.perform(PlayerView.choices(s.campaign).find(c => /drowned book/.test(c.choice.name))!.choice.id);
  }
}

describe('a module teaching a spell', () => {
  it('gives a caster the spell to know and to prepare, at no cost', async () => {
    const s = await Taught.start('mage');
    const advances = s.campaign.readout.creatures[0]!.state.advances?.spells ?? 0;
    expect(Taught.knows(s)).toBe(false);
    await Taught.read(s);
    expect(Taught.knows(s)).toBe(true);
    expect(s.campaign.readout.creatures[0]!.state.advances?.spells ?? 0).toBe(advances);
    expect(PlayerView.choices(s.campaign).some(c => /^Have Ama prepare Drench/i.test(c.choice.name))).toBe(true);
  }, 60000);
  it('teaches one who casts no spells nothing', async () => {
    const s = await Taught.start('warrior');
    await Taught.read(s);
    expect(Taught.knows(s)).toBe(false);
  }, 60000);
  // One of Orsino's spells that Kyr cannot run is refused with why (BOF-05: it had been an invalid argument, no more).
  it('refuses a spell Kyr cannot run, and says why', async () => {
    await expect(Taught.start('mage', 'dispel_magic')).rejects.toThrow(/Dispel Magic is Orsino's, and Kyr cannot run it/);
  }, 60000);
});

