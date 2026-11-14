import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ClauseLoad } from '../../src/presentation/clause-load';
import { Sentences } from '../../src/presentation/sentences';

// Who is here, said plainly (DN-06, the owner on Lowmouth's green: "Here are Aldous Fenn, the reeve of the
// wood-wardens, who regulate who cuts what …; Hesper Lowe, …; and Jem Pudding, the players' clown" was one sentence
// of five semicolons). Three are said each in a sentence with what they are; the rest by name, in one more.
const green = (people: string[]) => `
  Place green "the green" is room at 0, 0 outdoors.
  Company party "You" of 1 at green.
  ${people.map((p, i) => `Person p${i} "${p.split(':')[0]}" at green { Role "${p.split(':')[1]}". Ancestry human. Peaceable. }`)
    .join('\n  ')}
  Goal false.`;
describe('the roll of who is here', () => {
  it('says each of a few in a sentence, and the rest by name', async () => {
    const t = await Tiny.start(green(['Aldous Fenn:reeve of the wood-wardens', 'Hesper Lowe:boat-wright\'s apprentice',
      'Absalom Gosse:actor-manager of the company', 'Hepzibah Dimmock:players\' prompter', 'Jem Pudding:players\' clown']));
    const roll = t.leaf.roll!;
    expect(roll).not.toContain(';');
    expect(roll).toContain('Aldous Fenn, the reeve of the wood-wardens, is here.');
    expect(roll).toContain('So are Hepzibah Dimmock and Jem Pudding.');
    expect(Sentences.split(roll).filter(s => ClauseLoad.heavy(s))).toEqual([]);
  });
  it('says one more alone, and one alone as before', async () => {
    const four = await Tiny.start(green(['Ann:miller', 'Bet:weaver', 'Cob:smith', 'Dan:carter']));
    expect(four.leaf.roll).toEndWith('So is Dan.');
    const one = await Tiny.start(green(['Ann:miller']));
    expect(one.leaf.roll).toBe('Ann, the miller, is here.');
  });
});
