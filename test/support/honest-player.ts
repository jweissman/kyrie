import type { PlaySession } from '../../src/session/play-session';
import { Travel } from '../../src/session/travel';
import { SceneModel } from '../../src/ui/scene';
import { Attending } from '../../src/ui/attention';
import { TalkFocus } from '../../web/reader/talk-focus';
import { Glanced } from './glanced';
import { MenuModel } from '../../web/reader/menu-model';

// A player who knows nothing but what the page shows (the reviews of 9 November: no teleport, no private ids, no
// knowledge given): each step is what the page leads with; at someone, the reply it draws in the aim's gold, or else
// the first it shows; a journey as the map sets out on it; a fight as the page's "let them fight" fights it. Each
// step is logged, so that a failure says where the page stopped leading.
export class HonestPlayer {
  readonly log: string[] = [];
  private readonly g: Glanced;
  private readonly seen = new Map<string, number>();
  // What has been tried at a look the page opened (a riddle's rows), so that the next try is the next row.
  private readonly tried = new Set<string>();
  constructor(readonly s: PlaySession) { this.g = Glanced.of(s); }
  get glanced(): Glanced { return this.g; }
  // Takes the page's lead, once; false when the page leads with nothing new.
  async step(): Promise<boolean> {
    const g = this.g, lead = g.glance.acts[0], here = this.s.campaign.world.one('at', 'party') ?? '';
    const opened = lead && !lead.command ? this.opened(lead.choice) : undefined;
    const key = `${here}|${lead?.command}|${lead?.for}|${opened ?? ''}`;
    this.log.push(`@${here} [${lead?.why}] ${lead?.label ?? '(nothing led)'}`);
    if (!lead || (this.seen.get(key) ?? 0) > 1) { return false; }
    this.seen.set(key, (this.seen.get(key) ?? 0) + 1);
    const person = lead.subject && g.screen.people.find(p => p.id === lead.subject);
    if (person && !lead.command?.startsWith('travel:')) {
      const sub = Attending.place(SceneModel.build(g.screen)).subjects.find(x => x.id === person.id);
      const replies = Attending.all(sub?.choices ?? []).filter(c => c.command && !/^(buy|sell)_/.test(c.command));
      // A sale led for the aim is in Trade, drawn in the aim's gold: opened, and the sale made (see TalkStage.ToTrade).
      if (lead.for && /^sell_/.test(lead.for)) { this.log.push(`  trades: ${lead.for}`); await g.perform(lead.for); return true; }
      const gold = replies.filter(c => c.command === lead.for);
      const shown = TalkFocus.of(replies, { ...lead.for ? { led: lead.for } : {}, asked: [],
        weighty: g.screen.weighty ?? [] }).salient;
      const pick = gold[0] ?? shown[0];
      if (!pick?.command) { this.log.push('  nothing to say'); return false; }
      this.log.push(`  says: ${pick.label}`);
      await g.perform(pick.command);
    } else if (lead.command?.startsWith('travel:')) {
      const done = await Travel.go({ campaign: this.s.campaign, perform: (c: string) => this.s.leg(c) },
        lead.command.slice('travel:'.length));
      this.log.push(`  journey: ${done.arrived ? 'arrived' : done.stopped}`);
      await g.perform('wait');
    } else if (opened) {
      // A look the page opens, led with (a riddle read, CL-34): the act within it in the aim's gold, else its rows as
      // the page shows them, the next not yet tried: a player who knows nothing guesses, in order.
      this.tried.add(opened);
      this.log.push(`  tries: ${opened}`);
      await g.perform(opened);
    } else if (!lead.command) {
      // A thing led with (a find, a chest): its first act, as its pane offers it (the reference tour's rule).
      const thing = Attending.place(SceneModel.build(g.screen)).subjects.find(x => x.id === lead.subject);
      const act = Attending.all(thing?.choices ?? []).find(c => c.command && !/#look$/.test(c.id));
      if (!act?.command) { this.log.push('  nothing to do with it'); return false; }
      this.log.push(`  does: ${act.label}`);
      await g.perform(act.command);
    } else {
      await g.perform(lead.command);
    }
    return true;
  }
  // What a lead with no command of its own opens and is done by: the act within it in the aim's gold, or the first of
  // its rows not yet tried (a focus's, what bars a way said whole: Choice.focus; a risk's, taken as the page leads it).
  private opened(choice: string): string | undefined {
    const lead = this.g.glance.acts[0], within = lead?.inside?.find(x => !x.borne)?.command;
    if (within) { return within; }
    const c = MenuModel.build(this.g.frame(), 'here', []).choices.find(x => x.id === choice);
    return Attending.all(c?.children ?? []).find(k => k.command && !k.disabled && !this.tried.has(k.command))?.command;
  }
  // Follows the page until the condition holds, or it leads nowhere new, or the company falls.
  async until(done: () => boolean, most = 60): Promise<boolean> {
    for (let i = 0; i < most && !done(); i++) {
      if (this.s.campaign.history.length && this.g.screen.party.every(m => m.hp <= 0)) { return false; }
      if (!await this.step()) { return done(); }
    }
    return done();
  }
  aim(): string | undefined { return this.g.screen.aims?.find(a => a.followed)?.text; }
}
