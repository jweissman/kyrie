import { LocalObservations } from '../campaign/local-observations';
import type { CampaignLint } from './campaign-lint';

// What an author would want to know of a campaign and is not told by its play (the Grand Tour's friction X06, X15 and
// X17): a tame one's own greeting said on arrival, a first place with nothing said of it, a module that gives the
// company nothing to grow by.
export class AuthorLint {
  // What a whole adventure, one with an ending, should have: a first place said, and something to grow by.
  static run(lint: CampaignLint) {
    this.greetings(lint); this.lowered(lint);
    if (lint.module.entities.some(e => e.type === 'ending')) { this.opening(lint); this.growth(lint); }
  }
  // An act that lowers a measure, not a price, with nothing that asks how much there is: below nothing, it is not
  // offered at all, and nobody says why (the Third Night's friction 1, Let One Remember's B2). A rule's count stops at
  // nothing; a price not met rightly keeps the act from being offered.
  static lowered(lint: CampaignLint) {
    for (const a of lint.module.actions.filter(x => x.id.includes('__'))) {
      const asked = JSON.stringify(a.requires);
      for (const c of a.success) {
        if (c.kind !== 'decrease' || c.toNothing || c.call.name === 'quantity') { continue; }
        if (asked.includes(`"name":"${c.call.name}"`) || JSON.stringify(c.value) === '{"kind":"number","value":0}') { continue; }
        lint.add('advice', 'lowered', `Action ${a.id} lowers ${c.call.name} without asking how much there is: below `
          + 'nothing it is not offered at all; write `Decrease … by … or to nothing`, or ask for enough in its condition');
      }
    }
  }
  // A tame creature greets whoever comes (temper_greets), so its Greets is said on arrival, not to the first Talk.
  static greetings(lint: CampaignLint) {
    const tame = new Set(lint.relations('temperament').filter(r => r.args[1] === 'temper_tame').map(r => r.args[0]!));
    for (const r of lint.relations('greeting').filter(g => tame.has(g.args[0]!))) {
      lint.add('advice', 'greeting', `${r.args[0]} is tame: its Greets is said as soon as the company comes to it, and `
        + 'the first Talk to it answers with its Greets again');
    }
  }
  // The place the company begins in, with nothing it can see said of it.
  static opening(lint: CampaignLint) {
    const player = lint.session.campaign.playerActor, at = player && lint.world.one('at', player);
    if (!player || !at) { return; }
    const own = LocalObservations.read(lint.world, player).filter(o => (lint.module.observations ?? [])
      .some(d => d.id === o.id.split('@')[0] && d.place === at));
    if (!own.length) { lint.add('warning', 'opening', `${at}, where the company begins, has nothing said of it that holds at the start`); }
  }
  // No milestone, so the company grows only by what it kills.
  static growth(lint: CampaignLint) {
    if (lint.module.entities.some(e => e.type === 'milestone')) { return; }
    const peaceable = new Set(lint.relations('peaceable').map(r => r.args[0]!));
    const foes = lint.module.entities.filter(e => e.type === 'group' && !peaceable.has(e.id)
      && e.id !== lint.session.campaign.playerActor).length;
    lint.add('advice', 'growth', `no Milestone: the company grows only by fighting (${foes} not peaceable); `
      + 'give what it resolves its worth (`Milestone id "title" worth N when …`)');
  }
}
