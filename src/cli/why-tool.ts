// `kyrie inspect --why`: why a fact holds, or why a placement won, where a game stands (the platform maturity study's
// §7.1; the maturity track's step 4). The campaign is played there as `kyrie inspect` plays it; then the fact (a
// relation and its arguments, ? for any) is told by WhyFact, or the placement (a kit's installation id, a scenario's
// instance, or a place something was placed at) by WhyPlacement.
//   bin/kyrie inspect --why fact <campaign.json> | --world <seed> "at(region__s1_merchant, ?)" [step ...]
//   bin/kyrie inspect --why placement <campaign.json> | --world <seed> <id> [step ...]
//   bin/kyrie inspect --dependents <campaign.json> | --world <seed> <symbol>   (see WhyDependents: nothing is played)
//   bin/kyrie inspect --why people <campaign.json> | --world <seed>   (the ledger's people: see WhyPlacement.people)
import { PlayTool } from './play-tool';
import { WhyFact } from './why-fact';
import { WhyPlacement } from './why-placement';
import { WhySources } from './why-sources';
import { WhyDependents } from './why-dependents';

export class WhyTool {
  static readonly usage = 'usage: kyrie inspect --why fact|placement|people <campaign.json> | --world <seed> "<fact>" | <id>'
    + ' [--seed s] [--steps steps.json] [step ...]; kyrie inspect --dependents <campaign.json> | --world <seed> <symbol>';
  static async main(args: string[], print: (line: string) => void = console.log): Promise<number> {
    const [kind, ...rest] = args, o = PlayTool.parse(rest), [what, ...steps] = o.steps;
    const asked = kind === 'fact' && what ? WhyFact.parse(what) : undefined;
    const placed = kind === 'placement' || kind === 'dependents';
    const people = kind === 'people', world = o.campaign || o.world || o.part;
    if (people && world) { return this.people(o, print); }
    if (!world || !what || (!placed && !asked)) { print(this.usage); return 1; }
    const started = await PlayTool.start(o), j = started.journey;
    const sources = started.source ? new WhySources(j.session.scenario, started.source, j.session.seed) : undefined;
    if (kind === 'dependents') {
      for (const line of await WhyDependents.report(j.campaign.module, sources, what)) { print(line); }
      return 0;
    }
    const all = [...started.lead, ...await PlayTool.steps(o.file), ...steps];
    try {
      const fact = asked && WhyFact.resolved(j.campaign.world, asked);
      const played = fact ? await WhyFact.play(j, all, fact) : undefined;
      if (!asked) { for (const step of all) { await j.step(step); } }
      print(`-- watch ${j.watch()}, at ${j.at(j.campaign.playerActor ?? 'party') ?? 'nowhere'}`);
      const lines = fact ? await WhyFact.report(j, sources, fact, played!)
        : sources ? await WhyPlacement.report(sources, started.report, what) : ['Nothing is known of how it was placed.'];
      for (const line of lines) { print(line); }
    } catch (e) { print(`! ${(e as Error).message}`); return 1; }
    return 0;
  }
  // The ledger's people, by what they practise and where they live (see WhyPlacement.people); nothing is played.
  private static async people(o: ReturnType<typeof PlayTool.parse>, print: (line: string) => void): Promise<number> {
    const started = await PlayTool.start(o), j = started.journey, source = started.source;
    const lines = source ? await WhyPlacement.people(new WhySources(j.session.scenario, source, j.session.seed))
      : ['Nothing is known of how it was assembled.'];
    for (const line of lines) { print(line); }
    return 0;
  }
}
