import type { World } from '../lang/world';

// What someone is called in a label beside them, by their pronouns (the Lull's 5: "Ask them to come with you", of a
// man whose pronouns are he). Without any, they are "them".
export class PronounWords {
  static readonly forms: Record<string, { them: string; their: string }> = {
    pron_he: { them: 'him', their: 'his' }, pron_she: { them: 'her', their: 'her' }, pron_it: { them: 'it', their: 'its' } };
  static of(world: World | undefined, who: string | undefined, form: 'them' | 'their'): string {
    const pronoun = world && who && world.relates('pronouns') ? world.one('pronouns', who) : undefined;
    return this.forms[pronoun ?? '']?.[form] ?? form;
  }
}
