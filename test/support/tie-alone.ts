import { KyrTemplates } from '../../src/world/kyr-template';
import { RegionTies } from '../../src/world/region-ties';
import { TownMatters } from '../../src/world/town-matters';
import type { Settlement } from '../../src/world/region-writer';
import type { CreatureGenerationContext } from '../../src/content';
import { Tiny } from './tiny';

// One settlement's tie (data/generation/town/ties.kyrt) alone: the template's base and the one shape asked for,
// filled for a town and its nearest site as RegionTies fills them, on a host of a few lines (the town's green, inn,
// shrine and its three, the site, and the question of what the matter is that TownMatters gives a generated town's
// three), where test/ties-forms had drawn six countries for it. What only a country proves (that each settlement draws
// a shape by its own key, and the site is its nearest) stays with the drawn world (test/ties).
export type TieForm = 'kin' | 'debt' | 'custom';
export class TieAlone {
  static readonly values = { t: 's1', town: 'Thornbury', site: 'w1', sitename: 'the howe on the hill',
    where: 'the downs north of Thornbury' };
  static kyr(form: TieForm): string {
    const v = this.values;
    const host = [
      'Place downs "the downs" is wilderness at 0, 0.',
      `Place s1 "${v.town}" is settlement.`,
      'Place s1_green "the green" is room within s1 at 0, 0 outdoors.',
      'Place s1_taproom "the taproom of the Bell" is room within s1 at 1, 0.',
      'Place s1_shrine "the shrine" is room within s1 at 0, 1.',
      `Place w1 "${v.sitename}" is room within downs at 3, 0 outdoors.`,
      // The way up to the site, for a company that walks it and reads what is there as it comes.
      'Passage s1_sheepwalk "the sheep-walk" is path between s1_green and w1 taking 30 minutes.',
      'Person s1_innkeeper "Mag Hollin" at s1_taproom { Role "who keeps the inn". Ancestry human. Peaceable. Pronouns she. }',
      'Person s1_priest "Father Ned" at s1_shrine { Role "the priest". Ancestry human. Peaceable. Pronouns he. }',
      'Person s1_merchant "Wat Cotter" at s1_green { Role "a merchant". Ancestry human. Peaceable. Pronouns he. }',
      `Discovery w1_named "${v.sitename}: a green mound in ${v.where}.".`,
      `Discovery w1_found "The way up to ${v.sitename} goes by the sheep-walk from the green.".`,
      'Company party "You" of 1 at s1_green.'];
    const tie = KyrTemplates.choose(RegionTies.template, 'alone', v, { shape: form })
      .flatMap(x => KyrTemplates.fill(x.lines, v));
    return [...host.map(l => `  ${l}`), ...TownMatters.lines({ id: 's1', name: v.town } as Settlement), ...tie].join('\n');
  }
  static start(form: TieForm, party?: CreatureGenerationContext[]): Promise<Tiny> {
    return Tiny.start(this.kyr(form), { party, seed: `tie-${form}` });
  }
}
