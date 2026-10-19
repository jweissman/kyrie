import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import type { CreatureGenerationContext } from '../src/content';
import { OrraHistories } from './orra-histories';

export class FrontierHistories {
  static readonly fellowship: CreatureGenerationContext[] = [
    { name: 'Elen', raceId: 'elf', classId: 'ranger' }, { name: 'Bran', raceId: 'human', classId: 'fighter' },
    { name: 'Dori', raceId: 'dwarf', classId: 'cleric' },
  ];
  static readonly company: CreatureGenerationContext[] = [
    { name: 'Nell', raceId: 'human', classId: 'thief' }, { name: 'Bran', raceId: 'human', classId: 'fighter' },
    { name: 'Mira', raceId: 'human', classId: 'magic_user' },
  ];
  static readonly first = [...OrraHistories.investigator,
    'learn_reward(tower__cinder_gift,refuge__member_shield)', 'travel(refuge__porch)', 'rest(refuge__porch)'];
  static readonly second = ['travel(refuge__green)', 'travel(margin__track)', 'travel(margin__camp)',
    'margin__tala_welcome', 'buy(rations,margin__tala)', 'margin__tala_route', 'travel(margin__ford)',
    'attack(margin__frostback)', 'cross(margin__frostback,margin__shrine)', 'examine(margin__tide_marks)',
    'disable(margin__font)', 'salvage_coin(margin__purse)', 'travel(margin__track)', 'travel(refuge__green)',
    'travel(refuge__porch)', 'rest(refuge__porch)'];
  static async start(party = this.fellowship, scenario = 'data/orra/play.campaign.json') {
    return PlaySession.start(scenario, 'orra', NodeBundleSource.shared, party);
  }
  static async commands(s: PlaySession, commands: string[]) {
    for (const c of commands) { await s.perform(c); }
    return s;
  }
}

