import type { Runner, Said } from '../../src/cli/runner';
import { RunnerFight } from '../../src/cli/runner-fight';

// A kept play's line asked as it was meant, by what it does and to whom, not by where its row stood (MT-15: the
// owner, 19 November). A line is its act's id, as the play sent it; where the world has more in it than when it was
// played, the same act can stand one step further off:
// - a question to someone (a Topic) no longer led on its own row is asked by turning to them first ("Ask the agent
//   about the king-barrow", once the hand on the green was led before it);
// - a way taken that something dangerous now lies on (the culvert's foul air, the cutting's cracked roof) is taken
//   at its risk, the one who sent the play going first, as the play took that way.
// - a fight the play's own blows ended that its lines no longer end (the corn-store's buck, the SRD's dire rat since
//   srd-proving-cases.md case 64, still up after the elf mage's two blows) is fought on to its end by the game's
//   tactics ("Press on to the end"), as a player who pressed on would, before the line after it.
// Nothing else is changed: a line refused for any other reason is refused, as the play's own log kept it.
export class AsMeant {
  static async ask(r: Runner, line: string): Promise<Said | { error: string }> {
    let said = await r.ask(line);
    // OR-1396: lower HP can hand a pressed fight back more than once; the kept command still means its end.
    if (!('error' in said) && said.moment === 'fight'
      && (JSON.parse(line) as { act?: unknown }).act === RunnerFight.through) {
      for (let i = 0; i < 40 && !('error' in said) && said.moment === 'fight'; i++) { said = await r.ask(line); }
      if (!('error' in said) && said.moment === 'fight') { throw new Error('Pressed fight did not end in 40 continuations'); }
    }
    if (!('error' in said) || !said.error.startsWith('not offered')) { return said; }
    const act = (JSON.parse(line) as { act?: unknown }).act;
    if (typeof act === 'string' && !act.startsWith('fight:') && said.error.startsWith('not offered in the fight')) {
      for (let i = 0; i < 40 && 'error' in (await r.ask(JSON.stringify({ act: RunnerFight.through }))) === false; i++) {
        const again = await r.ask(line);
        if (!('error' in again) || !again.error.startsWith('not offered in the fight')) { return again; }
      }
    }
    if (typeof act !== 'string') { return said; }
    for (const way of AsMeant.ways(r, act)) {
      const step = way.length > 1 ? await r.ask(JSON.stringify({ act: way[0] })) : undefined;
      if (step && 'error' in step) { continue; }
      const done = await r.ask(JSON.stringify({ act: way.at(-1) }));
      if (!('error' in done)) { return done; }
    }
    return said;
  }
  // Every line, as meant.
  static async play(r: Runner, lines: readonly string[]): Promise<(Said | { error: string })[]> {
    const out: (Said | { error: string })[] = [];
    for (const line of lines) { out.push(await AsMeant.ask(r, line)); }
    return out;
  }
  // The ways to the same act, each the acts it takes.
  private static ways(r: Runner, act: string): string[][] {
    const c = r.session.campaign, topic = c.module.actions.find(a => a.id === act && a.topic);
    if (topic?.speaker) { return [[`talk:${topic.speaker}`, act], [`talk_to(${topic.speaker})`, act]]; }
    const way = /^go\(([^,]+),([^)]+)\)$/.exec(act)?.[1];
    if (!way) { return []; }
    const traps = c.world.relatedTo('on', way).map(x => x.args[0]!);
    const members = c.world.relatedTo('memberOf', 'party').map(x => x.args[0]!);
    return traps.flatMap(t => members.map(m => [`risk(${t},${m})`]));
  }
}
