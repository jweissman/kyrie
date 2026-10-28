import type { Campaign } from '../campaign/campaign';
import type { CampaignEvent } from '../campaign/campaign-types';
import { Happenings, type Happening } from './happening';
import { Voice, type VoiceLine } from './voice';
import { VoiceContext } from './voice-context';
import { Editor } from './editor';
import { Journeys } from './journeys';
import { ModuleWriter } from '../lang/module-writer';

export type Voiced = NonNullable<CampaignEvent['voiced']>[number];
// What the company is told of what a command made happen, in the voice tables' words: chosen for the moment, never
// the same line twice while there are others that fit, and never more than a few at once. A person's own words for
// the moment (Joins, Leaves, Greets, in Kyr) are said instead, the first time.
export class Telling {
  static readonly priority: Record<string, number> = { turn: 0, join: 1, part: 1, object: 2, pet: 2, greet: 3,
    address: 3, thank: 4, farewell: 4 };
  static readonly most = 3;
  static readonly authored: Record<string, string> = { join: 'joining', part: 'parting', greet: 'greeting',
    address: 'greeting' };
  static tell(campaign: Campaign, event: CampaignEvent): Voiced[] {
    const company = campaign.playerActor ?? 'party', past = campaign.history.filter(e => e !== event)
      .flatMap(e => e.voiced ?? []);
    const used = Editor.recency(past.map(v => v.id)), pairs = new Set(past.map(v => `${v.kind}:${v.actor ?? ''}`));
    const petted = new Set(past.filter(v => v.kind === 'pet' || v.kind === 'greet').map(v => v.actor ?? ''));
    // What the world has already said in its own words (a rule's thanks, a creature's warning) is not said again; and
    // someone brought home is not told to have left.
    const said = (event.perceptions ?? []).filter(p => p.kind === 'event').map(p => p.text).join(' ');
    const home = new Set(event.changes.map(c => /^\+ cameHome\(([^)]*)\)$/.exec(c)?.[1]).filter(Boolean));
    const happenings = Happenings.read(event, company, petted).filter(h => this.priority[h.kind] !== undefined)
      .filter(h => !(h.kind === 'part' && home.has(h.actor)))
      // Taking leave is a farewell; walking off from someone mid-word is not.
      .filter(h => h.kind !== 'farewell' || event.action.startsWith('take_leave('))
      // The dead and the senseless say nothing at all.
      .filter(h => !h.actor || !this.silent(campaign, h.actor))
      .filter(h => !(['thank', 'turn', 'object'].includes(h.kind) && said.includes(this.called(campaign, h.actor ?? ''))))
      .filter(h => !(h.kind === 'thank' && VoiceContext.species(campaign, h.actor ?? '')))
      .sort((a, b) => this.priority[a.kind]! - this.priority[b.kind]!)
      // Three dogs and a cat coming to see who you are is one of them doing it: the rest have greeted too, unsaid.
      .filter((h, i, all) => h.kind !== 'greet' || all.findIndex(x => x.kind === 'greet') === i).slice(0, this.most);
    const greeting = happenings.filter(h => h.kind === 'greet' || h.kind === 'address').map(h => h.actor ?? '');
    for (const actor of greeting.length ? this.met(campaign, event, company, greeting) : []) { pairs.add(`met:${actor}`); }
    // A way across country is told as it goes, before anything that happened at its end.
    const told: Voiced[] = Journeys.tell(campaign, event, used);
    for (const h of happenings) {
      const said = this.say(campaign, h, { used, pairs,
        key: `${campaign.readout.seed}:${event.elapsed}:${h.kind}:${h.actor ?? ''}` });
      if (said) { told.push(said); Editor.said(used, said.id); }
    }
    return told;
  }
  // Whoever the company has had to do with before: followed by, travelled with, spoken to or greeted. Someone met
  // again is greeted as one met again (Hern, who had walked a day with the company, greeted it as a stranger: A Winter
  // in Carth's friction 7).
  private static met(campaign: Campaign, event: CampaignEvent, company: string, actors: string[]): string[] {
    const ties = new Set(actors.flatMap(a => ['following', 'travelsWith', 'addressed', 'greeted']
      .map(r => `+ ${r}(${a}, ${company})`)));
    // The command being told is the last in the history (a copy of it, not the event itself).
    const before = campaign.history.at(-1)?.action === event.action ? campaign.history.slice(0, -1) : campaign.history;
    const met = new Set(before.flatMap(e => e.changes.filter(c => ties.has(c))));
    return actors.filter(a => [...met].some(c => c.includes(`(${a}, `)));
  }
  // Whoever has nobody in them still standing (a sergeant cut down, a band all fallen). Not a group gone into the
  // company: a recruit's own band is done with when they join, and they say so.
  private static silent(campaign: Campaign, actor: string): boolean {
    const ids = campaign.readout.inhabitants?.[actor] ?? [];
    return ids.length > 0 && ids.every(id => (campaign.readout.creatures.find(c => c.id === id)?.state.hp ?? 1) <= 0);
  }
  private static say(campaign: Campaign, h: Happening,
    memory: { used: Set<string>; pairs: Set<string>; key: string }): Voiced | undefined {
    const actor = h.actor ?? '', context = VoiceContext.of(campaign, h, memory.pairs);
    const speaking = { actor: this.called(campaign, actor), pronoun: context.pronoun,
      many: (campaign.readout.inhabitants?.[actor]?.length ?? 1) > 1 };
    const own = this.authored[h.kind] && campaign.world.module.relations.some(r => r.name === this.authored[h.kind])
      ? campaign.world.one(this.authored[h.kind]!, actor) : undefined;
    // Words said only while something holds (Leaves "…" when …) are not said, nor any others, when it does not.
    if (own && campaign.world.module.queries.some(q => q.name === `${own}_when`)
      && !campaign.world.test(ModuleWriter.call(`${own}_when`))) { return undefined; }
    if (own && context.moment === 'first') {
      const words = campaign.module.entities.find(e => e.id === own)?.name ?? '';
      return { id: `own:${own}`, kind: h.kind, actor, text: Voice.render(words, speaking) };
    }
    // Someone with their own words of greeting is not given the tables' afterwards: Tessary's corporal and its Factor
    // both said "Back for more of my wisdom", seven manners shared by thirty people (W18). Their own for a return
    // (Greets again) are said instead, if they have them.
    if (h.kind === 'greet' || h.kind === 'address') {
      const again = campaign.world.module.relations.some(r => r.name === 'regreeting')
        ? campaign.world.one('regreeting', actor) : undefined;
      const words = again && campaign.module.entities.find(e => e.id === again)?.name;
      if (words && context.moment !== 'first') {
        return { id: `own:${again}`, kind: h.kind, actor, text: Voice.render(words, speaking) };
      }
      if (own) { return undefined; }
    }
    // Of many, only what can be said of many.
    const line = this.choose(Voice.fitting(h.kind, context).filter(l => !speaking.many || Voice.agrees(l)), memory.key,
      memory.used);
    return line && { id: line.id, kind: h.kind, actor, text: Voice.render(line.text, speaking) };
  }
  static choose(lines: VoiceLine[], key: string, used: Set<string>): VoiceLine | undefined {
    return Editor.choose(lines, key, used);
  }
  static called(campaign: Campaign, id: string): string { return Editor.called(campaign, id); }

}
