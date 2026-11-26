import { ItemCatalog } from '../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { PlayTool } from '../src/cli/play-tool';
import { Creation } from '../web/engine/creation';
import { Fighting } from '../src/rules/fighting';
import { Effects } from '../src/effects';
import { CombatProjection } from '../src/combat-projection';

// One named by --as (people/calling/name) is made as creation makes them: the world's six rolls placed where the
// calling wants them (CL-08). Made of the rolls in the order drawn, the cold play's iscoed warrior had strength 10 and
// wisdom 15, and an even chance at a rat (cold play 2: about 12 of 16 swings missed).
describe('a protagonist named by --as', () => {
  it('places the rolls where the calling wants them', () => {
    const rolled = Creation.rolled('iscoed', 'warrior'), drawn = Object.values(Content.rolls('iscoed'));
    expect(rolled.strength).toBe(Math.max(...drawn));
    expect(Object.values(rolled).sort()).toEqual(drawn.sort());
    expect(Creation.rolled('iscoed', 'mage').intelligence).toBe(Math.max(...drawn));
  });
  it('gives the iscoed warrior the strength creation gives her, and better than even odds at a rat', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const all = j.campaign.readout.creatures, me = all.find(c => c.id === j.campaign.readout.partyIds[0])!;
    const ancestry = Canon.ancestries.human?.attributes?.strength ?? 0;
    expect(me.base.strength).toBe(Creation.rolled('iscoed', 'warrior').strength! + ancestry);
    const a = Effects.combatant(CombatProjection.fighter(ItemCatalog.canon, me, 'fighters'));
    const rats = all.filter(c => c.raceId === 'rat').map(c => Fighting.chance(a, Effects.combatant(CombatProjection.fighter(ItemCatalog.canon, c, 'goblins'))));
    expect(rats.length).toBeGreaterThan(0);
    expect(Math.min(...rats)).toBeGreaterThanOrEqual(0.6);
  }, 120000);
});
