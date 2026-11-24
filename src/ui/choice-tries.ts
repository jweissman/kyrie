import type { Rule } from './choice-grouping';

// The tries anything might be given, each a row of its own under the thing, in whole words (PB-29: an "Examine" opener
// had held them as fragments). On a way they gather under a look at the thing (see ChoiceList.tries), where the
// speaking door's riddle is read out (CL-34), each laid out by its own name standing alone (Rule.alone) elsewhere.
export class ChoiceTries {
  static readonly rules: Record<string, Rule> = {
    look_closely: { slot: 'target', param: 'target', path: ['Look closely'], onWay: ['Look at {target}', 'Look closely'],
      alone: 'Look closely at {target}' },
    prod: { slot: 'target', param: 'target', path: ['Prod it with the pole'],
      onWay: ['Look at {target}', 'Prod it with the pole'], alone: 'Prod {target} with the pole' },
    pry: { slot: 'target', param: 'target', path: ['Pry at it with the bar'],
      onWay: ['Look at {target}', 'Pry at it with the bar'], alone: 'Pry at {target} with the bar' },
    burn: { slot: 'target', param: 'target', path: ['Hold a flame to it'],
      onWay: ['Look at {target}', 'Hold a flame to it'], alone: 'Hold a flame to {target}' },
    push: { slot: 'target', param: 'target', path: ['Push and pull at it'],
      onWay: ['Look at {target}', 'Push and pull at it'], alone: 'Push and pull at {target}' },
    listen: { slot: 'target', param: 'target', path: ['Listen at it'], onWay: ['Look at {target}', 'Listen at it'],
      alone: 'Put an ear to {target}', aloneOnWay: 'Listen at {passage}' },
  };
}
