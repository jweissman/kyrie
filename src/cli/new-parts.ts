// What `kyrie new` writes into an adventure that is there already (bin/kyrie new scene|item|chapter|character <id>
// --in <adventure>): a file of the adventure's module, beside the place its company begins, with a test that plays to
// it and does what it is for. Each is a working example to write over: it lints clean and its test passes as written.
import { Adventures, type Home, type Part } from './new-home';

export class Parts {
  // A scene of its own beside where the company begins: what is seen coming in, a thing to look at closely and to
  // change, and something that happens, once, when it is changed.
  static scene(home: Home, id: string): Part {
    const q = JSON.stringify, [x, y] = home.spot, stone = `${id}_stone`, told = 'Somewhere behind you, a door bangs shut.';
    const kyr = Adventures.file(home, `The ${id}: a scene of its own beside ${home.from}. Play it: bin/kyrie play scene ${id}`
      + ` --in ${home.adventure}`, [
      `  Place ${id} ${q(`the ${id}`)} is room within ${home.parent} at ${x}, ${y} outdoors.`,
      `  Passage ${id}_way ${q(`the way to the ${id}`)} is path between ${home.from} and ${id} taking 5 minutes.`,
      `  Observe ${id}_scene at ${id} when true "What the company sees as it comes in, in a sentence or two.".`,
      `  Thing ${stone} "the holed stone" at ${id} {`, '    Tries looking.',
      '    State still "A stone stands here with a hole right through it.".',
      '    State turned_about "The holed stone has been turned, and its hole looks the other way.".',
      '    Change turn "Turn the holed stone" from still to turned_about.', '  }',
      `  Observe ${stone}_closer near ${stone} when tried(${stone}, looking) "Through the hole you can see the way you came, small and bright.".`,
      `  Rule ${id}_turned at ${id} when state(${stone}, turned_about) once says ${q(told)} { }`]);
    return Adventures.part(home, id, { kyr, what: `The ${id}, a scene of ${home.title}`, told,
      steps: [`>${home.adventure}__${id}`, 'the holed stone: Examine', 'Turn the holed stone'],
      next: `bin/kyrie play scene ${id} --in ${home.adventure}` });
  }
  // A kind of thing of the adventure's own, one of it lying where the company begins, and something it is needed for.
  static item(home: Home, id: string): Part {
    const name = id.replace(/_/g, ' '), box = `${id}_box`, told = 'The lid comes up with a crack of old wax.';
    const kyr = Adventures.file(home, `The ${name}: a kind of thing of this adventure's own, and what it is needed for.`, [
      `  Kind ${id} ${JSON.stringify(`a ${name}`)} is gear worth 2 weighing 1 described "What it is, in a sentence.".`,
      `  Item ${id}_one ${JSON.stringify(`a ${name}`)} is ${id} at ${home.from}.`,
      `  Thing ${box} "the sealed box" at ${home.from} {`, '    State sealed "A box stands here, its lid sealed with wax.".',
      `    State unsealed ${JSON.stringify(told)}.`,
      `    Change unseal ${JSON.stringify(`Prise the lid up with the ${name}`)} from sealed to unsealed needing ${id}.`, '  }']);
    return Adventures.part(home, id, { kyr, what: `The ${name}, a thing of ${home.title}`, told,
      steps: [`a ${name}: Take`, `Prise the lid up with the ${name}`],
      next: `bin/kyrie play data/campaigns/${home.adventure}.campaign.json --choices` });
  }
  // A chapter of the story: how it begins (said once, where it begins), what the company is to do in it (an objective
  // in the journal while it is open), and how it ends (a milestone the company is given experience for).
  static chapter(home: Home, id: string): Part {
    const q = JSON.stringify, bell = `${id}_bell`, begun = `${id}_begun`;
    const told = 'The note goes out over the roofs and does not come back.';
    const kyr = Adventures.file(home, `The chapter ${id}: how it begins, what the company is to do in it, and how it ends.`, [
      `  Entity ${begun}: fact "".`,
      `  Rule ${id}_begins at ${home.from} when at(party, ${home.from}) once says "A chapter begins: say how, in a line." teaches ${begun} { }`,
      `  Objective ${id}_aim when knows(party, ${begun}) and not state(${bell}, rung) "Ring the bell on the post.".`,
      `  Thing ${bell} "the bell on the post" at ${home.from} {`, '    State silent "A bell hangs from a post, still.".',
      `    State rung ${q(told)}.`, '    Change ring "Ring the bell on the post" from silent to rung.', '  }',
      `  Milestone ${id}_done ${q(`The ${id} ended`)} worth 100 when state(${bell}, rung).`]);
    return Adventures.part(home, id, { kyr, what: `The chapter ${id} of ${home.title}`, told,
      steps: ['Ring the bell on the post'],
      next: `bin/kyrie play data/campaigns/${home.adventure}.campaign.json "Ring the bell on the post"` });
  }
}
