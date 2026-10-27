import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { CombatProjection } from '../src/combat-projection';

// The protagonist's likeness is the player's to choose at creation, from the collection (Mission 17: the creation
// page shows six to choose among, or none, and assumes nothing from a name). Chosen, it is theirs on their sheet,
// through a fight and a save; a painting the collection does not hold is refused.
class Chosen {
  static async start(likeness: string) {
    const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior', likeness }];
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'wanderer', party });
    return PlaySession.start(w.path, 'kite', w.source);
  }
}

describe('a likeness chosen at creation', () => {
  it('is the protagonist\'s on their sheet, through a fight and a save', async () => {
    const s = await Chosen.start('victrix'), me = ScreenModel.build(s.campaign).party[0]!;
    expect([me.portrait?.src, me.portrait?.large]).toEqual(['paintings/victrix.webp', 'paintings/large/victrix.webp']);
    const creature = s.campaign.readout.creatures.find(c => c.id === me.id)!;
    expect(CombatProjection.creature(CombatProjection.fighter(creature, 'fighters'), creature).likeness).toBe('victrix');
    const back = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())) as ReturnType<typeof s.checkpoint>);
    expect(ScreenModel.build(back.campaign).party[0]!.portrait?.src).toBe('paintings/victrix.webp');
  }, 60000);
  it('is refused when the collection holds no such painting', async () => {
    let error = '';
    await Chosen.start('nobody-at-all').catch((e: Error) => { error = e.message; });
    expect(error).toContain('Unknown likeness');
  }, 60000);
});
