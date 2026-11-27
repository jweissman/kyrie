import { DeepParley } from '../../../src/world/deep/deep-parley';
import type { DeepLayout } from '../../../src/world/deep/deep-layout';
import type { DeepContent } from '../../../src/world/deep/deep-pacing';

// A robbers' den off a hall, and an ossuary whose tunnel the robbers dug, written as a deep site writes its band's
// parley (DeepParley), on the shared rules alone.
export class ParleyFixture {
  static readonly parley = {
    ask: 'Ask {band} what is worth having down here', tells: "'There is a tunnel out of the bones,' says {band}.",
    way: ['halls', 'ossuary'] as [string, string], found: 'A tunnel goes down behind the bones.',
    slips: 'Taken for one of the gang, you hear of a tunnel out of the bones.', quit: 'The den is empty.',
    known: 'The captain is waiting, and knows you now.', sign: 'No smoke comes from the den now.' };
  static kyr(): string {
    const room = (id: string, role: string) => ({ id, level: 0, role, x: 0, y: 0, name: id, scene: '', lit: true });
    const layout: DeepLayout = { site: 'pit', levels: [{ id: 'pit_halls', index: 0, name: 'the halls', flooded: false,
      rooms: [room('bones', 'ossuary')] }], links: [{ id: 'tun', a: 'bones', b: 'vault', kind: 'crawl',
      name: "the robbers' tunnel", minutes: 8, between: true }] };
    const content = [{ room: room('den', 'recess'), guide: 'elite', dwellers: { id: 'cap', level: 2, elite: true,
      group: { ancestry: 'human', calling: 'warrior', count: 1, label: 'the captain', role: 'a robber',
        temperament: 'territorial', parley: this.parley } } }] as DeepContent[];
    return [`  Place den "the den" is room at 0, 0.`, `  Place hall "the hall" is room at 1, 0.`,
      `  Place bones "the ossuary" is room at 2, 0.`, `  Place vault "the treasury" is room at 2, 1.`,
      `  Passage den_hall "the arch" is doorway between den and hall taking 1 minute.`,
      `  Passage hall_bones "the steps" is doorway between hall and bones taking 1 minute.`,
      `  Company party "You" of 1 at den.`,
      `  Person cap "the captain" at den { Role "a robber". Ancestry human. Calling warrior. Level 2. Numbers 1.`
        + ` Temperament territorial. }`, ...DeepParley.lines(layout, content)].join('\n');
  }
}
