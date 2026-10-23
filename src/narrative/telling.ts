import type { Campaign } from '../campaign/campaign';
import type { CampaignEvent } from '../campaign/campaign-types';
import { Happenings, type Happening } from './happening';
import { Voice, type VoiceLine } from './voice';
import { VoiceContext } from './voice-context';
import { Editor } from './editor';
import { Journeys } from './journeys';

export type Voiced = NonNullable<CampaignEvent['voiced']>[number];
// What the company is told of what a command made happen, in the voice tables' words: chosen for the moment, never
// the same line twice while there are others that fit, and never more than a few at once. A person's own words for
// the moment (Joins, Leaves, Greets, in Kyr) are said instead, the first time.
export class Telling {
  static readonly priority: Record<string, number> = { turn: 0, join: 1, part: 1, object: 2, pet: 2, greet: 3,
    thank: 4 };
  static readonly most = 3;
  static readonly authored: Record<string, string> = { join: 'joining', part: 'parting', greet: 'greeting' };
  static tell(campaign: Campaign, event: CampaignEvent): Voiced[] {
    const company = campaign.playerActor ?? 'party', past = campaign.history.filter(e => e !== event)
      .flatMap(e => e.voiced ?? []);
    const used = new Set(past.map(v => v.id)), pairs = new Set(past.map(v => `${v.kind}:${v.actor ?? ''}`));
    const petted = new Set(past.filter(v => v.kind === 'pet' || v.kind === 'greet').map(v => v.actor ?? ''));
    // What the world has already said in its own words (a rule's thanks, a creature's warning) is not said again; and
    // someone brought home is not told to have left.
    const said = (event.perceptions ?? []).filter(p => p.kind === 'event').map(p => p.text).join(' ');
    const home = new Set(event.changes.map(c => /^\+ cameHome\(([^)]*)\)$/.exec(c)?.[1]).filter(Boolean));
    const happenings = Happenings.read(event, company, petted).filter(h => this.priority[h.kind] !== undefined)
      .filter(h => !(h.kind === 'part' && home.has(h.actor)))
      .filter(h => !(['thank', 'turn', 'object'].includes(h.kind) && said.includes(this.called(campaign, h.actor ?? ''))))
      .filter(h => !(h.kind === 'thank' && VoiceContext.species(campaign, h.actor ?? '')))
      .sort((a, b) => this.priority[a.kind]! - this.priority[b.kind]!).slice(0, this.most);
    // A way across country is told as it goes, before anything that happened at its end.
    const told: Voiced[] = Journeys.tell(campaign, event, used);
    for (const h of happenings) {
      const said = this.say(campaign, h, { used, pairs,
        key: `${campaign.readout.seed}:${event.elapsed}:${h.kind}:${h.actor ?? ''}` });
      if (said) { told.push(said); used.add(said.id); }
    }
    return told;
  }
  private static say(campaign: Campaign, h: Happening,
    memory: { used: Set<string>; pairs: Set<string>; key: string }): Voiced | undefined {
    const actor = h.actor ?? '', context = VoiceContext.of(campaign, h, memory.pairs);
    const speaking = { actor: this.called(campaign, actor), pronoun: context.pronoun };
    const own = this.authored[h.kind] && campaign.world.module.relations.some(r => r.name === this.authored[h.kind])
      ? campaign.world.one(this.authored[h.kind]!, actor) : undefined;
    if (own && context.moment === 'first') {
      const words = campaign.module.entities.find(e => e.id === own)?.name ?? '';
      return { id: `own:${own}`, kind: h.kind, actor, text: Voice.render(words, speaking) };
    }
    const line = this.choose(Voice.fitting(h.kind, context), memory.key, memory.used);
    return line && { id: line.id, kind: h.kind, actor, text: Voice.render(line.text, speaking) };
  }
  static choose(lines: VoiceLine[], key: string, used: Set<string>): VoiceLine | undefined {
    return Editor.choose(lines, key, used);
  }
  static called(campaign: Campaign, id: string): string { return Editor.called(campaign, id); }

}
