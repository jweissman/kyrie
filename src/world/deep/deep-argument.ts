import type { DeepLayout } from './deep-layout';
import type { DeepPurpose } from './deep-purposes';
import { DeepRooms } from './deep-rooms';

// What the town's shrine holds about the deep site: that its makers' wall must stay shut. Its priest says so, and
// says they will not pray for whoever opens it; the company can argue it out. What the makers cut in the wall, if
// read, is evidence that carries the argument easily; without it the argument is hard; insight into the priest
// shows a grief that can be spoken to; a lie (that the keepers sent you) or a threat may move them, at a price.
// Won over, the priest tells what the shrine has always known of what is below, and what it cannot bear; a promise
// to wall the stair up again is a commitment, kept or broken. Defied, the shrine is shut to the company: no healing,
// no raising of the dead, for as long as the world lasts. Each way of arguing is tried once; rolls only where it
// could go either way.
// How the purpose names its seal: what it is asked about (the walled stair), what is opened (the stair), and the
// words cut in it.
// What the seal is called, what it opens, what is cut round it, what the shrine keeps of the bane and what the bane is
// (a jar of noonlight, the Wardens' oath-tablet, a dirge bell): each purpose's own, not the mine's for every one.
interface Said { noun: string; opened: string; cut: string; bane: string; carry: string }
export class DeepArgument {
  static readonly q = JSON.stringify;
  static lines(layout: DeepLayout, values: Record<string, string>, purpose: DeepPurpose): string[] {
    const seal = layout.links.find(l => l.mechanism === 'seal'), words = purpose.mechanisms.seal;
    if (!seal || !words || !values.priest || !values.town) { return []; }
    const w = values.w!, p = values.priest, wall = `${seal.id}_wall`, q = this.q, name = values.name!;
    const b = purpose.bane, carry = b ? b.like?.name ?? DeepRooms.called(b.item, purpose) : '';
    const said = { noun: words.noun, opened: words.opened, cut: words.words, bane: b?.fact ?? '', carry };
    return [`  Relation ${w}_heard(group). Relation ${w}_won(group). Relation ${w}_promised(group).`,
      `  Relation ${w}_argued(group, entity).`,
      `  Entity ${w}_grief: fact ${q(`{${p}}'s brother went down into ${name} and did not come back up. What {${p}} says of ${said.opened} is grief as much as doctrine.`)}.`,
      ...this.stand({ w, p, name, said }), ...this.moves({ w, p, site: layout.site, name, said }),
      ...this.after({ w, p, wall, holy: values.holy ?? `${values.town}_shrine`, said })];
  }
  // What the priest holds, and says once asked; and what they say once won over.
  private static stand(at: { w: string; p: string; name: string; said: Said }): string[] {
    const { w, p, name, said } = at, q = this.q;
    return [`  Topic ${w}_wall with ${p} ${q(`Ask {${p}} about ${said.noun} in ${name}`)} when knows(actor, ${w}_named) and not ${w}_heard(${p}) {`,
      `    Says ${q(`'The makers shut ${said.opened} themselves,' says {${p}}, 'and they knew what they were doing. What they shut in, they shut in for all of us. Open it, and I will not pray for you, nor heal you, nor sit up with your dead.'`)}.`,
      `    On discuss { Assert ${w}_heard(${p}). }`, '  }',
      `  Topic ${w}_since with ${p} ${q(`Ask {${p}} again about ${said.noun}`)} when ${w}_won(${p}) once {`,
      `    Says ${q(`'Go carefully,' says {${p}}.${said.carry ? ` 'And take ${said.carry} with you, if you find it.'` : ''}`)}.`,
      '  }'];
  }
  // The ways of arguing it, each once: what each needs to be tried, how hard it is, what comes of it.
  private static moves(at: { w: string; p: string; site: string; name: string; said: Said }): string[] {
    const { w, p, site, name, said } = at, bane = `${site}_bane`, base = { w, p, bane: said.bane };
    return [
      this.move({ ...base, id: 'evidence', label: `Tell {${p}} what ${said.cut} say`, needs: ` and knows(actor, ${bane})`,
        check: 'persuasion, dc_easy', won: true,
        yes: `{${p}} hears the words out, and is quiet for a while. 'If the makers wrote that, they meant it to be read,' {${p}} says at last. 'And meant someone to go down with the light.'`,
        no: `{${p}} hears the words out, and is not moved. 'Words cut in stone,' says {${p}}. 'Anyone can cut words.'` }),
      this.move({ ...base, id: 'argue', label: `Argue with {${p}} that what is below should be met, not walled in`, needs: '',
        check: 'persuasion, dc_hard', won: true,
        yes: `{${p}} argues it with you point by point, and gives way on the last one. 'Then go,' says {${p}}, 'but go as if it mattered.'`,
        no: `{${p}} argues it with you point by point, and gives way on none of them.` }),
      this.move({ ...base, id: 'read', label: `Watch {${p}} for what goes unsaid`, needs: '',
        check: 'insight, dc_fair', learn: `${w}_grief`,
        yes: `It is in how {${p}} says 'down there': not as doctrine, but as a place someone went.`,
        no: `Whatever goes unsaid, you do not see it.` }),
      this.move({ ...base, id: 'grief', label: `Speak to {${p}} of the brother who went down`, needs: ` and knows(actor, ${w}_grief)`,
        check: 'persuasion, dc_easy', won: true,
        yes: `{${p}} looks at you a long time. 'He went down into ${name} and no one went after him,' says {${p}}. 'If you are going, go after him too.'`,
        no: `{${p}} turns away. 'You know nothing about it,' says {${p}}, and that is the end of it.` }),
      this.move({ ...base, id: 'lie', label: `Tell {${p}} the keepers of names sent you to see to ${said.opened}`, needs: '',
        check: 'deception, dc_hard', won: true, caught: true,
        yes: `{${p}} looks at you for a long moment, and nods. 'Then see to it,' says {${p}}.`,
        no: `{${p}} looks at you for a long moment. 'The keepers send their own,' says {${p}}. 'Get out of my shrine.'` }),
      this.move({ ...base, id: 'threat', label: `Tell {${p}} ${said.opened} will be opened whatever is said`, needs: '',
        check: 'intimidation, dc_fair', won: true, caught: true, always: true,
        yes: `{${p}} goes white, and tells you what you came to hear, to be rid of you. There will be nothing more for you from this shrine.`,
        no: `{${p}} is not afraid of you. 'Then open it without me,' says {${p}}, 'and bury your own dead.'` }),
      ...this.promise({ w, p, said })];
  }
  private static move(m: { w: string; p: string; bane: string; id: string; label: string; needs: string; check: string;
    won?: boolean; learn?: string; caught?: boolean; always?: boolean; yes: string; no: string }): string {
    const q = this.q, { w, p, id } = m, latch = `${w}_argued(${p}, ${w}_move_${id})`, shut = `Assert refusesService(${p}, actor).`;
    const gain = [m.won ? `Assert ${w}_won(${p}). Assert knows(actor, ${w}_bane).` : '',
      m.learn ? `Assert knows(actor, ${m.learn}).` : '', m.always ? shut : ''].filter(Boolean).join(' ');
    // Won over, the priest says what the shrine has always known of what is below.
    const yes = m.won && !m.always ? `${m.yes} ${this.told(p, m.bane)}` : m.yes;
    return [`  Entity ${w}_move_${id}: fact ${q(m.label)}.`,
      `  Action ${w}_${id}(actor: group, site: place) ${q(m.label)} {`, `    Speaker ${p}.`, '    Time 5 minutes.',
      `    Requires able(actor) and at(actor, site) and at(${p}, site) and ${w}_heard(${p}) and not ${w}_won(${p})`
        + ` and not refusesService(${p}, actor) and not ${latch}${m.needs}.`,
      `    Resolve check(actor, ${m.check}).`, `    On success { Assert ${latch}. ${gain} }`,
      `    On failure { Assert ${latch}.${m.caught ? ` ${shut}` : ''} }`,
      `    Result ${q(yes)}.`, `    Otherwise ${q(m.no)}.`, '  }'].join('\n');
  }
  // What the shrine has always kept of what is below: the purpose's own fact of the keeper's bane.
  static told(p: string, bane: string): string {
    return `Then {${p}} tells you what the shrine has always kept of it: ${bane.charAt(0).toLowerCase()}${bane.slice(1)}`;
  }
  // A commitment: to wall the stair up again on the way back. It is taken at the priest's word, no roll.
  private static promise(at: { w: string; p: string; said: Said }): string[] {
    const { w, p, said } = at, q = this.q;
    return [`  Action ${w}_promise(actor: group, site: place) ${q(`Promise {${p}} to shut ${said.opened} again when you come back up`)} {`,
      `    Speaker ${p}.`, '    Time 2 minutes.',
      `    Requires able(actor) and at(actor, site) and at(${p}, site) and ${w}_heard(${p}) and not ${w}_won(${p})`
        + ` and not refusesService(${p}, actor).`,
      `    On success { Assert ${w}_won(${p}). Assert ${w}_promised(${p}). Assert knows(actor, ${w}_bane). }`,
      `    Result ${q(`{${p}} takes your hand in both hands. 'Then I will hold you to it,' says {${p}}. ${this.told(p, said.bane)}`)}.`, '  }'];
  }
  // What follows: the stair opened against the priest's word, or a promise broken once the heart is brought up,
  // shuts the shrine to the company; it is seen there, and said.
  private static after(at: { w: string; p: string; wall: string; holy: string; said: Said }): string[] {
    const { w, p, wall, holy, said } = at, q = this.q;
    return [`  Rule ${w}_defied when ${w}_heard(${p}) and not ${w}_won(${p}) and state(${wall}, broken)`
      + ` and not refusesService(${p}, party) { Assert refusesService(${p}, party). }`,
      `  Rule ${w}_word_broken when ${w}_promised(${p}) and ${w}_raised() and state(${wall}, broken)`
        + ` and at(party, ${holy}) and not refusesService(${p}, party)`
        + ` says ${q(`{${p}} looks past you at the door. 'You promised to shut it again,' says {${p}}, and nothing more to you, then or after.`)}`
        + ` { Assert refusesService(${p}, party). }`,
      `  Observe ${w}_shut at ${holy} when refusesService(${p}, party) ${q(`{${p}} will not look at you. The shrine is shut to whoever opened ${said.opened} against its word.`)}.`];
  }
}
