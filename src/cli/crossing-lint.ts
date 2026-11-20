import type { Operator, Predicate } from '../lang/module';
import { HexBoundary } from '../hex-boundary';
import type { CampaignLint } from './campaign-lint';

// An authored act that is no way gone by and puts the company in another hex of the country than the one it is done
// in: an error (TR-20; the owner, 19 November: "I got from my quest destination back to town without the map"). The
// engine never offers such an act and refuses it if asked (see Crossing.carried), so as written it is dead: another
// hex is gone into only by a journey, walked on the map. Read from what the act says: where it asks the company to
// be (at(actor, …) in its condition, or where the one it is put to stands), and where its changes put it. A way gone
// by (an exit, a go) is the travel's own, and a rule is the world's (a captor, a wagon ridden on: see Crossing).
export class CrossingLint {
  static run(lint: CampaignLint) {
    const company = lint.session.campaign.playerActor ?? 'party';
    for (const a of lint.module.actions) {
      const found = this.crossing(lint, a, company);
      if (!found) { continue; }
      const [from, to] = found;
      lint.add('error', 'crossing', `${a.id} "${a.name}" puts the company at ${to} (${HexBoundary.hex(lint.module, to)})`
        + ` from ${from} (${HexBoundary.hex(lint.module, from)}): another hex is gone into only by a journey, walked on`
        + ' the map; leave the company where the act is done, and let a rule on its arrival do what the act would');
    }
  }
  // The first place the act asks the company to be and a place its changes put it, in two hexes.
  private static crossing(lint: CampaignLint, a: Operator, company: string): [string, string] | undefined {
    if (a.movement) { return undefined; }
    const who = new Set([company, 'actor']);
    const to = [...a.success, ...a.failure].flatMap(c => c.kind === 'assert' && c.call.name === 'at'
      && who.has(c.call.args[0]!) && this.place(lint, c.call.args[1]) ? [c.call.args[1]!] : []);
    if (!to.length) { return undefined; }
    const asked = this.ats(a.requires).filter(([w, p]) => who.has(w) && this.place(lint, p)).map(([, p]) => p);
    const speaker = a.speaker ? lint.world.one('at', a.speaker) : undefined;
    const from = asked.length ? asked : speaker ? [speaker] : [];
    for (const f of from) {
      const t = to.find(x => HexBoundary.crosses(lint.module, f, x));
      if (t) { return [f, t]; }
    }
    return undefined;
  }
  private static place(lint: CampaignLint, id: string | undefined): boolean {
    return !!id && lint.entities.get(id)?.type === 'place';
  }
  // The at(…) the condition asks to hold, not under a not.
  private static ats(p: Predicate): [string, string][] {
    if (p.kind === 'call') { return p.name === 'at' && p.args.length === 2 ? [[p.args[0]!, p.args[1]!]] : []; }
    if (p.kind === 'and' || p.kind === 'or') { return [...this.ats(p.left), ...this.ats(p.right)]; }
    return [];
  }
}
