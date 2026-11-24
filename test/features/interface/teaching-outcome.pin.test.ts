import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { Outcome } from '../../../src/ui/outcome';
import { SceneModel } from '../../../src/ui/scene';
import { Attending } from '../../../src/ui/attention';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Interface › What an act would teach (OR-206, BRIEF
// §5A: one Outcome per drawn row, its first slice): an act is blue for knowledge exactly when the company would know
// something after it that it does not now, read once from the act (its effects applied, the world's teaching read
// over them: Outcome), and what it said would be known is what is known once the act is taken. A tinker whose lantern
// wants a collar: mending it wakes her rule, which says where her trade is to be learned (Eluned Cadwgan's, the mage's
// walk: taught, and never blue); asking her about the weather teaches nothing; asking her name tells a fact outright.
const stall = `
  Place square "the square" is room at 0, 0 outdoors.
  Company party "You" of 1 at square.
  Relation shown(group).
  Entity trade_open: fact "The tinker says anyone who can mend a lamp can learn the rest at her bench.".
  Entity tinker_name: fact "The tinker is called Eluned.".
  Person eluned "the tinker" at square { Role "a tinker". Ancestry human. Peaceable. Pronouns she. }
  Thing lantern "the lantern" at square {
    State apart "The lantern stands in pieces.".
    State whole "The lantern stands whole.".
  }
  Initially Assert state(lantern, apart).
  Action mend(actor: group, site: place) "Mend the lantern" {
    Requires able(actor) and at(actor, site) and at(actor, square) and state(lantern, apart).
    On success { Retract state(lantern, apart). Assert state(lantern, whole). }
  }
  Rule shown_true when state(lantern, whole) and at(party, square) and not shown(party) says "'You've hands,' says the tinker. 'There's a bench for you.'" teaches trade_open { Assert shown(party). }
  Topic weather with eluned "Ask the tinker about the weather" when true once { Says "'Wet,' she says.". }
  Topic name with eluned "Ask the tinker her name" when true once {
    Says "'Eluned,' she says.".
    On discuss { Assert knows(actor, tinker_name). }
  }
  Goal false.`;
describe('Interface › What an act would teach', () => {
  it('is blue where the company would know something after it, and what it said is what is learned', async () => {
    const t = await Tiny.start(stall), c = t.campaign;
    const op = (re: RegExp) => c.offered().find(o => re.test(o.id))!;
    const predicted = Object.fromEntries(['mend', 'weather', 'name'].map(k => [k,
      Outcome.taught(c.module, c.world, op(new RegExp(`^t__${k}`)), 'party')]));
    expect(predicted).toEqual({ mend: ['t__trade_open'], weather: [], name: ['t__tinker_name'] });
    // Drawn so: the rows that would teach are knowledge's, the one that would not is plain.
    const rows = SceneModel.build(t.screen).subjects.flatMap(x => Attending.all(x.choices ?? []));
    const teaches = (re: RegExp) => rows.find(r => re.test(r.command ?? ''))?.teaches ?? false;
    expect([teaches(/^t__mend/), teaches(/^t__weather/), teaches(/^t__name/)]).toEqual([true, false, true]);
    // Taken, the lantern mended: what was said would be known is known.
    await t.perform(op(/^t__mend/).id);
    expect(c.world.related('knows', 'party').map(r => r.args[1])).toContain('t__trade_open');
  });
});
